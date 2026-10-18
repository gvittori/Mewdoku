import React from 'react';
import { Level } from '../types';
import { Undo2, Redo2, Lightbulb, RotateCcw, Heart } from 'lucide-react';

interface HUDProps {
  level: Level;
  timer: number;
  hearts: number;
  placedCats: number;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onHint: () => void;
  onReset: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  timer,
  hearts,
  placedCats,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onHint,
  onReset,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full flex flex-col gap-2.5 box-border">
      {/* Top Status Bar: Level Name, Grid Size, Cats Placed, Hearts, Timer */}
      <div className="flex items-center justify-between bg-white/95 border border-amber-200/80 rounded-2xl px-3.5 py-2.5 shadow-xs w-full box-border">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h2 className="text-sm sm:text-base font-extrabold text-amber-900">{level.name}</h2>
          <span className="text-2xs font-extrabold text-amber-800 bg-amber-100 border border-amber-300/70 px-2 py-0.5 rounded-md">
            {level.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="flex items-center gap-1 text-amber-800 font-bold text-xs bg-amber-100/80 px-2 py-1 rounded-xl border border-amber-200">
            <span>🐱</span>
            <span>{placedCats}/{level.size}</span>
          </div>

          <div className="flex items-center gap-1 text-rose-500 font-bold text-xs bg-rose-50 px-2 py-1 rounded-xl border border-rose-100">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{hearts}/3</span>
          </div>

          <div className="text-xs font-mono font-bold text-amber-900 bg-amber-100/60 px-2 py-1 rounded-xl">
            ⏱ {formatTime(timer)}
          </div>
        </div>
      </div>

      {/* Action Toolbar: Full-width balanced 4-button grid, perfectly centered with no left gap */}
      <div className="grid grid-cols-4 gap-2 bg-white/95 border border-amber-200/80 rounded-2xl p-1.5 sm:p-2 shadow-xs w-full box-border">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold border transition-all w-full ${
            canUndo
              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 active:scale-95 cursor-pointer'
              : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60'
          }`}
          title="Undo"
        >
          <Undo2 className="w-4 h-4 shrink-0" />
          <span>Undo</span>
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold border transition-all w-full ${
            canRedo
              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 active:scale-95 cursor-pointer'
              : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60'
          }`}
          title="Redo"
        >
          <Redo2 className="w-4 h-4 shrink-0" />
          <span>Redo</span>
        </button>

        <button
          onClick={onHint}
          className="flex items-center justify-center gap-1 py-2 px-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-100 active:scale-95 transition-all shadow-2xs text-xs font-bold cursor-pointer w-full"
          title="Get Hint"
        >
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Hint</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1 py-2 px-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl hover:bg-rose-100 active:scale-95 transition-all shadow-2xs text-xs font-bold cursor-pointer w-full"
          title="Reset Board"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
