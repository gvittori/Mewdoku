import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Play, RotateCcw } from 'lucide-react';
import { Level } from '../types';

interface WinModalProps {
  level: Level;
  timer: number;
  scoreEarned: number;
  fishEarned: number;
  onNextLevel: () => void;
  onRestart: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  level,
  timer,
  scoreEarned,
  fishEarned,
  onNextLevel,
  onRestart,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-amber-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in duration-200">
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-4xl shadow-inner">
          🏆
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-amber-900">Congratulations! 🎉</h2>
          <p className="text-amber-700 text-sm mt-1">All cats placed successfully on {level.name}!</p>
        </div>

        <div className="w-full bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex justify-around items-center">
          <div>
            <span className="text-xs text-amber-600 font-medium block">Time</span>
            <span className="text-sm font-bold text-amber-900 font-mono">{formatTime(timer)}</span>
          </div>
          <div className="w-px h-7 bg-amber-200" />
          <div>
            <span className="text-xs text-amber-600 font-medium block">Score</span>
            <span className="text-sm font-bold text-amber-900">+{scoreEarned} ⭐</span>
          </div>
          <div className="w-px h-7 bg-amber-200" />
          <div>
            <span className="text-xs text-amber-600 font-medium block">Treats</span>
            <span className="text-sm font-bold text-amber-900">+{fishEarned} 🐟</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onNextLevel}
            className="w-full py-3 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 text-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Next Level</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-amber-100 text-amber-900 font-bold rounded-2xl hover:bg-amber-200 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
