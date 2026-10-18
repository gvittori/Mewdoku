import React, { useState } from 'react';
import { Level } from '../types';
import { CURATED_LEVELS, getDailyLevel } from '../utils/levels';
import { Play, CheckCircle2 } from 'lucide-react';

interface LevelSelectModalProps {
  onSelectLevel: (level: Level) => void;
  bestTimes: Record<string, number>;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({ onSelectLevel, bestTimes }) => {
  const [activeTab, setActiveTab] = useState<'campaign' | 'daily'>('campaign');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const filteredLevels = CURATED_LEVELS.filter(
    (lvl) => difficultyFilter === 'all' || lvl.difficulty === difficultyFilter
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 overflow-x-hidden box-border">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-amber-900 tracking-tight">Select Level</h1>
        <p className="text-amber-700 text-sm mt-1">Pick a puzzle board to begin your feline logic challenge.</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center justify-center gap-2 p-1.5 bg-amber-100/70 rounded-2xl max-w-sm mx-auto w-full">
        <button
          onClick={() => setActiveTab('campaign')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'campaign'
              ? 'bg-white text-amber-900 shadow-sm'
              : 'text-amber-700 hover:text-amber-900'
          }`}
        >
          Campaign Levels
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'daily'
              ? 'bg-white text-amber-900 shadow-sm'
              : 'text-amber-700 hover:text-amber-900'
          }`}
        >
          Daily Challenge 🌟
        </button>
      </div>

      {activeTab === 'daily' ? (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 text-center shadow-md flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-3xl shadow-md">
            📅
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-900">Today's Daily Challenge</h2>
            <p className="text-sm text-amber-700 mt-1">A fresh unique puzzle crafted for today. Compete for the best time!</p>
          </div>
          <button
            onClick={() => onSelectLevel(getDailyLevel())}
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 active:scale-95 transition-all shadow-md text-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play Daily Challenge</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Grid Size Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar justify-center sm:justify-start">
            {['all', '5x5', '6x6', '7x7', '8x8'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors whitespace-nowrap ${
                  difficultyFilter === diff
                    ? 'bg-amber-900 text-white shadow-xs'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                {diff === 'all' ? 'All Sizes' : diff}
              </button>
            ))}
          </div>

          {/* Level Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredLevels.map((lvl) => {
              const bestTime = bestTimes[lvl.id];
              return (
                <div
                  key={lvl.id}
                  onClick={() => onSelectLevel(lvl)}
                  className="bg-white border border-amber-200/80 rounded-2xl p-3 shadow-xs hover:shadow-md hover:border-amber-400 active:scale-98 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-amber-950 group-hover:text-amber-600 transition-colors">
                      {lvl.name}
                    </span>
                    <span className="text-2xs font-bold text-amber-700 bg-amber-100/80 border border-amber-200/60 px-2 py-0.5 rounded-lg">
                      {lvl.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    {bestTime !== undefined ? (
                      <div className="flex items-center gap-1 text-2xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{bestTime}s</span>
                      </div>
                    ) : (
                      <span className="text-2xs text-amber-400 font-medium">Unplayed</span>
                    )}
                    <div className="w-7 h-7 bg-amber-100 group-hover:bg-amber-600 group-hover:text-white text-amber-800 rounded-xl flex items-center justify-center transition-colors shadow-2xs">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
