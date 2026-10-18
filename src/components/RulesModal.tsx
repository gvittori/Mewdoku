import React from 'react';
import { Cat, X, ShieldAlert, Sparkles } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 flex flex-col gap-6 overflow-x-hidden box-border">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-amber-900 tracking-tight">How to Play Mewdoku</h1>
        <p className="text-amber-700 text-sm mt-0.5">Master the four strict feline logic constraints.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
          <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg">
            1
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-base">One Cat Per Row & Column</h3>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Every horizontal row and vertical column must contain exactly one cat.
            </p>
          </div>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
          <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg">
            2
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-base">One Cat Per Colored Region</h3>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Each distinct colored shape/region on the board must contain exactly one cat.
            </p>
          </div>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
          <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg">
            3
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-base">Personal Space (No Touching)</h3>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              No two cats can be adjacent to each other—not even diagonally. Placing a cat blocks all 8 surrounding cells!
            </p>
          </div>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
          <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg">
            4
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-base">Marking Impossible Cells (X)</h3>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Use the cross tool (X) to eliminate spaces where a cat cannot legally go. This exposes forced placements!
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 transition-colors shadow-sm text-sm"
        >
          Got it, Let's Play!
        </button>
      </div>
    </div>
  );
};
