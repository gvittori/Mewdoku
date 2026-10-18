import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { Level, CellState } from '../types';
import { REGION_COLORS, CAT_BREEDS } from '../utils/levels';

interface PixiBoardProps {
  level: Level;
  boardState: CellState[][];
  onCellClick: (r: number, c: number, type: 'single' | 'double') => void;
  equippedBreed: string;
  conflicts: { rows: Set<number>; cols: Set<number>; regions: Set<number>; adjacencies: Set<string> };
  hintCell?: { r: number; c: number; timestamp: number } | null;
  wrongCatCell?: { r: number; c: number; timestamp: number } | null;
}

export const PixiBoard: React.FC<PixiBoardProps> = ({
  level,
  boardState,
  onCellClick,
  equippedBreed,
  conflicts,
  hintCell,
  wrongCatCell,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const pendingTapRef = useRef<{ r: number; c: number; time: number; timer: any } | null>(null);

  // Animation metadata per cell
  const animMapRef = useRef<Map<string, { startTime: number; type: CellState }>>(new Map());
  const wiggleMapRef = useRef<Map<string, { nextWiggle: number; wiggleDuration: number }>>(new Map());

  const boardDataRef = useRef({
    boardState,
    conflicts,
    equippedBreed,
    level,
    onCellClick,
    hintCell,
    wrongCatCell,
  });

  useEffect(() => {
    boardDataRef.current = {
      boardState,
      conflicts,
      equippedBreed,
      level,
      onCellClick,
      hintCell,
      wrongCatCell,
    };
  }, [boardState, conflicts, equippedBreed, level, onCellClick, hintCell, wrongCatCell]);

  useEffect(() => {
    const now = performance.now();
    boardState.forEach((row, r) => {
      row.forEach((cell, c) => {
        const key = `${r},${c}`;
        const prev = animMapRef.current.get(key);
        if (!prev || prev.type !== cell) {
          if (cell !== 'empty') {
            animMapRef.current.set(key, { startTime: now, type: cell });
          } else {
            animMapRef.current.delete(key);
          }
        }
        if (cell === 'cat' && !wiggleMapRef.current.has(key)) {
          wiggleMapRef.current.set(key, {
            nextWiggle: now + 3000 + Math.random() * 2000,
            wiggleDuration: 0,
          });
        } else if (cell !== 'cat') {
          wiggleMapRef.current.delete(key);
        }
      });
    });

    boardDataRef.current = {
      boardState,
      conflicts,
      equippedBreed,
      level,
      onCellClick,
      hintCell,
      wrongCatCell,
    };
  }, [boardState, conflicts, equippedBreed, level, onCellClick, hintCell, wrongCatCell]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let app: PIXI.Application | null = null;
    let isMounted = true;

    async function initPixi() {
      app = new PIXI.Application();
      const containerWidth = container ? container.clientWidth || 360 : 360;
      const boardSize = Math.max(280, Math.min(containerWidth - 8, 380));

      await app.init({
        width: boardSize,
        height: boardSize,
        backgroundColor: 0xffffff,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (!isMounted || !container) {
        app.destroy(true);
        return;
      }

      container.innerHTML = '';
      container.appendChild(app.canvas as HTMLCanvasElement);
      appRef.current = app;

      const n = level.size;
      const cellSize = boardSize / n;

      const boardContainer = new PIXI.Container();
      app.stage.addChild(boardContainer);

      app.ticker.add((ticker) => {
        if (!isMounted) return;
        const currentData = boardDataRef.current;
        const { boardState: state, conflicts: conf, equippedBreed: breedId, hintCell: activeHint } = currentData;
        const breed = CAT_BREEDS.find((b) => b.id === breedId) || CAT_BREEDS[0];
        const now = performance.now();

        boardContainer.removeChildren();

        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            const x = c * cellSize;
            const y = r * cellSize;
            const regionId = level.regions[r][c];
            const cellState = state[r][c];
            const key = `${r},${c}`;

            const cellGraphics = new PIXI.Graphics();
            const baseColor = parseInt(REGION_COLORS[regionId % REGION_COLORS.length].replace('#', ''), 16);

            const hasConflict =
              (cellState === 'cat' &&
                (conf.rows.has(r) || conf.cols.has(c) || conf.regions.has(regionId) || conf.adjacencies.has(`${r},${c}`)));

            const fillColor = hasConflict ? 0xfecaca : baseColor;
            const alpha = hasConflict ? 0.9 : 0.75;

            // Rounded squares with clean border and no dark lines separating colored blocks
            cellGraphics.roundRect(x + 1.5, y + 1.5, cellSize - 3, cellSize - 3, 7);
            cellGraphics.fill({ color: fillColor, alpha });
            cellGraphics.stroke({ width: 1.5, color: 0xffffff, alpha: 0.95 });

            boardContainer.addChild(cellGraphics);

            // Check if this cell has an active hint with fading animation (without marking it directly)
            if (activeHint && activeHint.r === r && activeHint.c === c) {
              const hintElapsed = now - activeHint.timestamp;
              if (hintElapsed < 2600) {
                const hintProgress = hintElapsed / 2600;
                const alphaWave = (1 - hintProgress) * (0.7 + 0.3 * Math.sin(hintElapsed * 0.01));

                const hintGlow = new PIXI.Graphics();
                hintGlow.roundRect(x + 1.5, y + 1.5, cellSize - 3, cellSize - 3, 7);
                hintGlow.fill({ color: 0xfef08a, alpha: alphaWave * 0.5 });
                hintGlow.stroke({ width: 3, color: 0xf59e0b, alpha: alphaWave * 0.95 });
                boardContainer.addChild(hintGlow);

                if (cellState === 'empty') {
                  const sparkle = new PIXI.Text({
                    text: '✨',
                    style: {
                      fontSize: cellSize * 0.45,
                      align: 'center',
                    },
                  });
                  sparkle.anchor.set(0.5);
                  sparkle.x = x + cellSize / 2;
                  sparkle.y = y + cellSize / 2;
                  sparkle.alpha = alphaWave;
                  boardContainer.addChild(sparkle);
                }
              }
            }

            // Check if this cell has an active fading red X animation
            const wrong = currentData.wrongCatCell;
            if (wrong && wrong.r === r && wrong.c === c) {
              const wrongElapsed = now - wrong.timestamp;
              if (wrongElapsed < 1600) {
                const progress = wrongElapsed / 1600;
                const alpha = Math.max(0, 1 - progress);
                const popScale = Math.min(1.25, 0.7 + 0.55 * Math.sin(Math.min(1, progress * 3) * Math.PI / 2));

                const wrongGlow = new PIXI.Graphics();
                wrongGlow.roundRect(x + 1.5, y + 1.5, cellSize - 3, cellSize - 3, 7);
                wrongGlow.fill({ color: 0xfee2e2, alpha: alpha * 0.75 });
                wrongGlow.stroke({ width: 3, color: 0xef4444, alpha });
                boardContainer.addChild(wrongGlow);

                const redXContainer = new PIXI.Container();
                redXContainer.x = x + cellSize / 2;
                redXContainer.y = y + cellSize / 2;
                redXContainer.scale.set(popScale);

                const redXGfx = new PIXI.Graphics();
                const pad = cellSize * 0.22;
                redXGfx.moveTo(-cellSize / 2 + pad, -cellSize / 2 + pad);
                redXGfx.lineTo(cellSize / 2 - pad, cellSize / 2 - pad);
                redXGfx.moveTo(cellSize / 2 - pad, -cellSize / 2 + pad);
                redXGfx.lineTo(-cellSize / 2 + pad, cellSize / 2 - pad);
                redXGfx.stroke({ width: 5, color: 0xdc2626, alpha });

                redXContainer.addChild(redXGfx);
                boardContainer.addChild(redXContainer);
              }
            }

            const anim = animMapRef.current.get(key);
            let scaleMultiplier = 1;
            if (anim) {
              const elapsed = now - anim.startTime;
              const duration = 200;
              if (elapsed < duration) {
                const progress = elapsed / duration;
                scaleMultiplier = 0.4 + 0.6 * Math.sin(progress * Math.PI * 0.75) * 1.1;
                if (scaleMultiplier > 1.05) scaleMultiplier = 1.05;
              }
            }

            if (cellState === 'cat') {
              let wiggleAngle = 0;
              let wiggleScale = 1;
              const wiggleData = wiggleMapRef.current.get(key);
              if (wiggleData) {
                if (now >= wiggleData.nextWiggle) {
                  wiggleData.wiggleDuration = 500;
                  wiggleData.nextWiggle = now + 3000 + Math.random() * 2000;
                }
                if (wiggleData.wiggleDuration > 0) {
                  wiggleData.wiggleDuration -= ticker.deltaMS;
                  wiggleAngle = Math.sin(now * 0.03) * 0.15;
                  wiggleScale = 1 + Math.sin(now * 0.04) * 0.1;
                }
              }

              const catContainer = new PIXI.Container();
              catContainer.x = x + cellSize / 2;
              catContainer.y = y + cellSize / 2;
              catContainer.scale.set(scaleMultiplier * wiggleScale);
              catContainer.rotation = wiggleAngle;

              const catText = new PIXI.Text({
                text: breed.icon || '🐱',
                style: {
                  fontSize: cellSize * 0.55,
                  align: 'center',
                },
              });
              catText.anchor.set(0.5);
              catContainer.addChild(catText);

              if (breed.accessory) {
                const accText = new PIXI.Text({
                  text: breed.accessory,
                  style: {
                    fontSize: cellSize * 0.3,
                  },
                });
                accText.anchor.set(0.5);
                accText.x = -cellSize * 0.2;
                accText.y = -cellSize * 0.25;
                catContainer.addChild(accText);
              }

              boardContainer.addChild(catContainer);
            } else if (cellState === 'cross') {
              const crossContainer = new PIXI.Container();
              crossContainer.x = x + cellSize / 2;
              crossContainer.y = y + cellSize / 2;
              crossContainer.scale.set(scaleMultiplier);

              const crossGraphics = new PIXI.Graphics();
              const padding = cellSize * 0.28;
              crossGraphics.moveTo(-cellSize / 2 + padding, -cellSize / 2 + padding);
              crossGraphics.lineTo(cellSize / 2 - padding, cellSize / 2 - padding);
              crossGraphics.moveTo(cellSize / 2 - padding, -cellSize / 2 + padding);
              crossGraphics.lineTo(-cellSize / 2 + padding, cellSize / 2 - padding);
              crossGraphics.stroke({ width: 3, color: 0x94a3b8, alpha: 0.8 });
              crossContainer.addChild(crossGraphics);

              boardContainer.addChild(crossContainer);
            }

            // Hit area with responsive debounced tap / double-tap handling
            const hitArea = new PIXI.Graphics();
            hitArea.rect(x, y, cellSize, cellSize);
            hitArea.fill({ color: 0x000000, alpha: 0 });
            hitArea.eventMode = 'static';
            hitArea.cursor = 'pointer';

            hitArea.on('pointerdown', (e) => {
              e.stopPropagation();
              const nowTime = performance.now();
              const pending = pendingTapRef.current;

              if (pending && pending.r === r && pending.c === c && nowTime - pending.time < 320) {
                clearTimeout(pending.timer);
                pendingTapRef.current = null;
                currentData.onCellClick(r, c, 'double');
                return;
              }

              if (pending) {
                clearTimeout(pending.timer);
                currentData.onCellClick(pending.r, pending.c, 'single');
                pendingTapRef.current = null;
              }

              const timer = setTimeout(() => {
                currentData.onCellClick(r, c, 'single');
                pendingTapRef.current = null;
              }, 220);

              pendingTapRef.current = { r, c, time: nowTime, timer };
            });

            boardContainer.addChild(hitArea);
          }
        }
      });
    }

    initPixi();

    return () => {
      isMounted = false;
      if (pendingTapRef.current) {
        clearTimeout(pendingTapRef.current.timer);
        pendingTapRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [level]);

  return (
    <div className="flex justify-center items-center p-2 sm:p-2.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 shadow-xs w-full max-w-full overflow-hidden box-border">
      <div ref={containerRef} className="touch-none select-none flex justify-center items-center w-full" />
    </div>
  );
};
