import React from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { Level } from '../types';

interface GameOverModalProps {
  level: Level;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  onRetry,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-amber-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in duration-200">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-4xl shadow-inner">
          😿
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-amber-900">Out of Hearts!</h2>
          <p className="text-amber-700 text-sm mt-1">
            You made 3 illegal placements on <span className="font-semibold">{level.name}</span>.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onRetry}
            className="w-full py-3 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Level</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-2.5 bg-amber-100 text-amber-900 font-bold rounded-2xl hover:bg-amber-200 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
