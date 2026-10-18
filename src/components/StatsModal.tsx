import React from 'react';
import { GameStatistics } from '../types';
import { Trophy, Flame, Award, Gamepad2, Star } from 'lucide-react';

interface StatsModalProps {
  stats: GameStatistics;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats }) => {
  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 flex flex-col gap-6 overflow-x-hidden box-border">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-amber-900 tracking-tight">Player Statistics</h1>
        <p className="text-amber-700 text-sm mt-0.5">Track your puzzle-solving mastery and cat care records.</p>
      </div>

      {/* Hero Score Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-xs">
            ⭐
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-100 font-bold block">Total Saved Score</span>
            <div className="text-3xl font-extrabold font-mono tracking-tight">{stats.score ?? 0}</div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-amber-200 font-semibold block">Auto-Saved</span>
          <span className="text-xs bg-amber-800/60 px-2.5 py-0.5 rounded-full font-bold text-amber-100 border border-amber-500/30">
            Persistent
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 text-center shadow-sm">
          <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center mx-auto mb-2 font-bold">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-amber-900">{stats.gamesPlayed}</span>
          <p className="text-xs text-amber-600 font-medium mt-0.5">Games Played</p>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 text-center shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-2 font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-amber-900">{winRate}%</span>
          <p className="text-xs text-amber-600 font-medium mt-0.5">Win Rate</p>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 text-center shadow-sm">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2 font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-amber-900">{stats.currentStreak}</span>
          <p className="text-xs text-amber-600 font-medium mt-0.5">Current Streak</p>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 text-center shadow-sm">
          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mx-auto mb-2 font-bold">
            <span>🐟</span>
          </div>
          <span className="text-2xl font-extrabold text-amber-900">{stats.fishTreats}</span>
          <p className="text-xs text-amber-600 font-medium mt-0.5">Fish Treats</p>
        </div>
      </div>
    </div>
  );
};
