import React, { useState, useEffect } from 'react';
import { GameScreen, Level, CellState, GameStatistics, CatBreed } from './types';
import { CURATED_LEVELS, CAT_BREEDS } from './utils/levels';
import { Header } from './components/Header';
import { HUD } from './components/HUD';
import { PixiBoard } from './components/PixiBoard';
import { LevelSelectModal } from './components/LevelSelectModal';
import { WardrobeModal } from './components/WardrobeModal';
import { StatsModal } from './components/StatsModal';
import { RulesModal } from './components/RulesModal';
import { WinModal } from './components/WinModal';
import { GameOverModal } from './components/GameOverModal';
import { soundManager } from './utils/audio';
import { Play, BookOpen } from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [currentLevel, setCurrentLevel] = useState<Level>(CURATED_LEVELS[0]);
  const [boardState, setBoardState] = useState<CellState[][]>([]);
  const [history, setHistory] = useState<CellState[][][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [hearts, setHearts] = useState<number>(3);
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [hintCell, setHintCell] = useState<{ r: number; c: number; timestamp: number } | null>(null);
  const [wrongCatCell, setWrongCatCell] = useState<{ r: number; c: number; timestamp: number } | null>(null);
  const [lastScoreEarned, setLastScoreEarned] = useState<number>(0);

  // Statistics & Progress with persistent score in localStorage
  const [stats, setStats] = useState<GameStatistics>(() => {
    try {
      const saved = localStorage.getItem('mewdoku_stats');
      const fallbackScore = localStorage.getItem('mewdoku_score');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          score: fallbackScore !== null ? Number(fallbackScore) : (parsed.score !== undefined ? Number(parsed.score) : 0),
          gamesPlayed: Number(parsed.gamesPlayed) || 0,
          gamesWon: Number(parsed.gamesWon) || 0,
          currentStreak: Number(parsed.currentStreak) || 0,
          bestStreak: Number(parsed.bestStreak) || 0,
          bestTimes: parsed.bestTimes || {},
          fishTreats: parsed.fishTreats !== undefined ? Number(parsed.fishTreats) : 100,
          unlockedBreeds: Array.isArray(parsed.unlockedBreeds) ? parsed.unlockedBreeds : ['calico'],
          equippedBreed: parsed.equippedBreed || 'calico',
        };
      } else if (fallbackScore !== null) {
        return {
          score: Number(fallbackScore) || 0,
          gamesPlayed: 0,
          gamesWon: 0,
          currentStreak: 0,
          bestStreak: 0,
          bestTimes: {},
          fishTreats: 100,
          unlockedBreeds: ['calico'],
          equippedBreed: 'calico',
        };
      }
    } catch (e) {
      console.error('Error loading saved stats from localStorage', e);
    }
    return {
      score: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      bestStreak: 0,
      bestTimes: {},
      fishTreats: 100,
      unlockedBreeds: ['calico'],
      equippedBreed: 'calico',
    };
  });

  // Keep score and stats synchronized in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mewdoku_stats', JSON.stringify(stats));
      localStorage.setItem('mewdoku_score', String(stats.score));
    } catch (e) {
      console.error('Error saving stats to localStorage', e);
    }
  }, [stats]);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !isWon) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isWon]);

  // Load level board
  const loadLevel = (lvl: Level) => {
    setCurrentLevel(lvl);
    const initial: CellState[][] = Array.from({ length: lvl.size }, () =>
      Array(lvl.size).fill('empty')
    );

    setBoardState(initial);
    setHistory([initial]);
    setHistoryIndex(0);
    setHearts(3);
    setTimer(0);
    setIsTimerRunning(true);
    setIsWon(false);
    setHintCell(null);
    setWrongCatCell(null);
    setScreen('game');
  };

  // Push board state to history
  const updateBoardState = (newState: CellState[][]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setBoardState(newState);

    checkWinCondition(newState);
  };

  // Placed cats count
  const placedCats = boardState.flat().filter((cell) => cell === 'cat').length;

  // Handle cell tap: Cycle empty -> cross -> empty. If tapped on cross or empty, single tap can also place cat or cycle.
  // Wait, user request: "remove the double tap. just taping a block marked with cross marks it with a cat now"
  // Let's implement cycle or direct tap logic:
  // Empty -> Cross -> Cat -> Empty (or tap cross -> cat).
  // Let's make:
  // Empty -> Cross -> Cat -> Empty (or clicking a cross turns it into a cat!).
  const handleCellClick = (r: number, c: number) => {
    if (isWon || hearts <= 0) return;

    const currentCell = boardState[r][c];
    if (currentCell === 'cat') {
      return; // cats cannot be unmarked once placed
    }

    let nextCell: CellState = currentCell;

    if (currentCell === 'empty') {
      nextCell = 'cross';
      soundManager.playCross();
    } else if (currentCell === 'cross') {
      // Tapping a block marked with cross marks it with a cat now!
      const isSolutionCat = currentLevel.solution.some((s) => s.r === r && s.c === c);

      if (!isSolutionCat) {
        soundManager.playError();
        setWrongCatCell({ r, c, timestamp: performance.now() });
        setHearts((h) => {
          const nextH = Math.max(0, h - 1);
          if (nextH === 0) {
            setIsTimerRunning(false);
          }
          return nextH;
        });
        nextCell = 'empty'; // incorrect cat placement clears the cell
      } else {
        nextCell = 'cat';
        soundManager.playMeow();
      }
    }

    if (nextCell === currentCell) return;

    const newState = boardState.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? nextCell : cell))
    );
    updateBoardState(newState);
  };

  // Compute all conflicts for visual highlighting
  const computeConflicts = (state: CellState[][] = boardState) => {
    const n = currentLevel.size;
    const conflictRows = new Set<number>();
    const conflictCols = new Set<number>();
    const conflictRegions = new Set<number>();
    const conflictAdjacencies = new Set<string>();

    const rowCats: Record<number, number[]> = {};
    const colCats: Record<number, number[]> = {};
    const regionCats: Record<number, number[]> = {};

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (state[r][c] === 'cat') {
          const reg = currentLevel.regions[r][c];

          rowCats[r] = rowCats[r] || [];
          rowCats[r].push(c);

          colCats[c] = colCats[c] || [];
          colCats[c].push(r);

          regionCats[reg] = regionCats[reg] || [];
          regionCats[reg].push(r * n + c);

          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < n && nc >= 0 && nc < n && state[nr][nc] === 'cat') {
                conflictAdjacencies.add(`${r},${c}`);
              }
            }
          }
        }
      }
    }

    Object.entries(rowCats).forEach(([r, cols]) => {
      if (cols.length > 1) conflictRows.add(Number(r));
    });
    Object.entries(colCats).forEach(([c, rows]) => {
      if (rows.length > 1) conflictCols.add(Number(c));
    });
    Object.entries(regionCats).forEach(([reg, cells]) => {
      if (cells.length > 1) conflictRegions.add(Number(reg));
    });

    return {
      rows: conflictRows,
      cols: conflictCols,
      regions: conflictRegions,
      adjacencies: conflictAdjacencies,
    };
  };

  // Check win condition
  const checkWinCondition = (state: CellState[][]) => {
    const n = currentLevel.size;
    let catCount = 0;

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (state[r][c] === 'cat') {
          catCount++;
        }
      }
    }

    if (catCount !== n) return;

    // Check if placed cats match solution
    const isExactMatch = currentLevel.solution.every((sol) => state[sol.r][sol.c] === 'cat');
    const conf = computeConflicts(state);
    const hasConflicts =
      conf.rows.size > 0 || conf.cols.size > 0 || conf.regions.size > 0 || conf.adjacencies.size > 0;

    if (isExactMatch || !hasConflicts) {
      setIsTimerRunning(false);
      setIsWon(true);
      soundManager.playWin();

      const fishReward =
        currentLevel.size === 5
          ? 20
          : currentLevel.size === 6
          ? 40
          : currentLevel.size === 7
          ? 70
          : 100;

      const basePoints =
        currentLevel.size === 5
          ? 100
          : currentLevel.size === 6
          ? 250
          : currentLevel.size === 7
          ? 500
          : 1000;

      const timeBonus = Math.max(0, 300 - timer) * 2;
      const heartsBonus = hearts * 50;
      const pointsWon = basePoints + timeBonus + heartsBonus;
      setLastScoreEarned(pointsWon);

      setStats((prev) => {
        const prevBest = prev.bestTimes[currentLevel.id];
        const newBest = prevBest === undefined ? timer : Math.min(prevBest, timer);
        const newScore = (prev.score ?? 0) + pointsWon;
        const newStats = {
          ...prev,
          score: newScore,
          gamesPlayed: prev.gamesPlayed + 1,
          gamesWon: prev.gamesWon + 1,
          currentStreak: prev.currentStreak + 1,
          bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
          fishTreats: prev.fishTreats + fishReward,
          bestTimes: {
            ...prev.bestTimes,
            [currentLevel.id]: newBest,
          },
        };
        try {
          localStorage.setItem('mewdoku_stats', JSON.stringify(newStats));
          localStorage.setItem('mewdoku_score', String(newScore));
        } catch (err) {
          console.error('Error saving score to localStorage', err);
        }
        return newStats;
      });
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      soundManager.playClick();
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setBoardState(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      soundManager.playClick();
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setBoardState(history[newIdx]);
    }
  };

  // Hint plays small fading animation on the block where a cat is, without marking it directly
  const handleHint = () => {
    soundManager.playClick();
    const correctCell = currentLevel.solution.find(
      (sol) => boardState[sol.r][sol.c] !== 'cat'
    );
    if (correctCell) {
      setHintCell({ r: correctCell.r, c: correctCell.c, timestamp: performance.now() });
    }
  };

  const handleReset = () => {
    soundManager.playClick();
    loadLevel(currentLevel);
  };

  const currentLevelIndex = CURATED_LEVELS.findIndex((l) => l.id === currentLevel.id);
  const levelDisplay = currentLevel.id.startsWith('daily')
    ? 'Daily Puzzle'
    : `Level ${currentLevelIndex >= 0 ? currentLevelIndex + 1 : 1}`;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-amber-100/40 text-amber-950 flex flex-col font-sans box-border">
      <Header
        currentScreen={screen}
        setScreen={setScreen}
        levelDisplay={levelDisplay}
        score={stats.score}
        muted={muted}
        setMuted={setMuted}
        onBack={screen !== 'title' ? () => setScreen('title') : undefined}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 box-border w-full max-w-full overflow-hidden">
        {screen === 'title' && (
          <div className="max-w-md mx-auto text-center flex flex-col items-center gap-6 py-8">
            <div className="w-32 h-32 bg-amber-100 border-4 border-amber-200 rounded-3xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <span className="text-6xl animate-bounce">🐱</span>
            </div>

            <div>
              <h1 className="text-4xl font-extrabold text-amber-900 tracking-tight">Mewdoku</h1>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={() => setScreen('level-select')}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 active:scale-98 transition-all shadow-md text-base cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Play Puzzles</span>
              </button>

              <button
                onClick={() => setScreen('rules')}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-amber-200 text-amber-900 font-bold rounded-2xl hover:bg-amber-50 active:scale-98 transition-all shadow-sm text-sm cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>How to Play</span>
              </button>
            </div>
          </div>
        )}

        {screen === 'level-select' && (
          <LevelSelectModal onSelectLevel={loadLevel} bestTimes={stats.bestTimes} />
        )}

        {screen === 'game' && (
          <div className="flex flex-col items-center gap-3 w-full max-w-[390px] mx-auto box-border">
            <HUD
              level={currentLevel}
              timer={timer}
              hearts={hearts}
              placedCats={placedCats}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onHint={handleHint}
              onReset={handleReset}
            />

            <PixiBoard
              level={currentLevel}
              boardState={boardState}
              onCellClick={handleCellClick}
              equippedBreed={stats.equippedBreed}
              conflicts={computeConflicts()}
              hintCell={hintCell}
              wrongCatCell={wrongCatCell}
            />
          </div>
        )}

        {screen === 'wardrobe' && (
          <WardrobeModal
            fishTreats={stats.fishTreats}
            unlockedBreeds={stats.unlockedBreeds}
            equippedBreed={stats.equippedBreed}
            onUnlockBreed={(breed: CatBreed) => {
              if (stats.fishTreats >= breed.cost) {
                soundManager.playWin();
                setStats((prev) => ({
                  ...prev,
                  fishTreats: prev.fishTreats - breed.cost,
                  unlockedBreeds: [...prev.unlockedBreeds, breed.id],
                  equippedBreed: breed.id,
                }));
              }
            }}
            onEquipBreed={(breedId: string) => {
              soundManager.playClick();
              setStats((prev) => ({ ...prev, equippedBreed: breedId }));
            }}
            onClose={() => setScreen('title')}
          />
        )}

        {screen === 'stats' && <StatsModal stats={stats} />}

        {screen === 'rules' && <RulesModal onClose={() => setScreen('level-select')} />}
      </main>

      {/* Out of Lives Modal */}
      {hearts === 0 && !isWon && (
        <GameOverModal
          level={currentLevel}
          onRetry={handleReset}
          onMainMenu={() => setScreen('level-select')}
        />
      )}

      {/* Victory Congratulations Modal */}
      {isWon && (
        <WinModal
          level={currentLevel}
          timer={timer}
          scoreEarned={lastScoreEarned}
          fishEarned={
            currentLevel.size === 5
              ? 20
              : currentLevel.size === 6
              ? 40
              : currentLevel.size === 7
              ? 70
              : 100
          }
          onNextLevel={() => {
            const currentIndex = CURATED_LEVELS.findIndex((l) => l.id === currentLevel.id);
            if (currentIndex !== -1 && currentIndex < CURATED_LEVELS.length - 1) {
              loadLevel(CURATED_LEVELS[currentIndex + 1]);
            } else {
              setScreen('level-select');
            }
          }}
          onRestart={handleReset}
        />
      )}
    </div>
  );
}
