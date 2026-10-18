import React from 'react';
import { GameScreen } from '../types';
import { Shirt, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  currentScreen: GameScreen;
  setScreen: (screen: GameScreen) => void;
  levelDisplay: string;
  score: number;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  setScreen,
  levelDisplay,
  score,
  muted,
  setMuted,
  onBack,
}) => {
  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-amber-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-xs box-border w-full">
      {/* Zone 1: Level Number & Score (Only show while playing a level) */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {currentScreen !== 'title' && onBack && (
          <button
            onClick={onBack}
            className="p-1.5 sm:p-2 rounded-xl text-amber-700 hover:bg-amber-100 active:scale-95 transition-all"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {currentScreen === 'game' && (
          <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap">
            <span className="bg-amber-100 border border-amber-300/80 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-extrabold text-amber-900 shadow-2xs">
              {levelDisplay}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-amber-800">
              Score: <span className="font-extrabold text-amber-950 font-mono">{score}</span>
            </span>
          </div>
        )}
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-amber-800">
        <button
          onClick={() => setScreen('level-select')}
          className={`hover:text-amber-950 transition-colors whitespace-nowrap shrink-0 ${
            currentScreen === 'level-select' ? 'font-bold text-amber-950 underline underline-offset-4' : ''
          }`}
        >
          Puzzles
        </button>
        <button
          onClick={() => setScreen('wardrobe')}
          className={`hover:text-amber-950 transition-colors whitespace-nowrap shrink-0 ${
            currentScreen === 'wardrobe' ? 'font-bold text-amber-950 underline underline-offset-4' : ''
          }`}
        >
          Cat Wardrobe
        </button>
        <button
          onClick={() => setScreen('stats')}
          className={`hover:text-amber-950 transition-colors whitespace-nowrap shrink-0 ${
            currentScreen === 'stats' ? 'font-bold text-amber-950 underline underline-offset-4' : ''
          }`}
        >
          Statistics
        </button>
        <button
          onClick={() => setScreen('rules')}
          className={`hover:text-amber-950 transition-colors whitespace-nowrap shrink-0 ${
            currentScreen === 'rules' ? 'font-bold text-amber-950 underline underline-offset-4' : ''
          }`}
        >
          How to Play
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            const nextMuted = !muted;
            setMuted(nextMuted);
            soundManager.setMuted(nextMuted);
          }}
          className="p-2 rounded-xl text-amber-700 hover:bg-amber-100 transition-colors"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setScreen('wardrobe')}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0"
        >
          <Shirt className="w-4 h-4" />
          <span>Shop</span>
        </button>
      </div>
    </header>
  );
};
