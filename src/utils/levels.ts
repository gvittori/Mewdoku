import { Level, CatBreed } from '../types';
import { PRECOMPUTED_LEVELS } from './levelsData';

export const CAT_BREEDS: CatBreed[] = [
  { id: 'calico', name: 'Calico Cutie', cost: 0, unlocked: true, color: '#f97316', secondaryColor: '#38bdf8', icon: '🐱' },
  { id: 'tuxedo', name: 'Tuxedo Sir', cost: 50, unlocked: false, color: '#1e293b', secondaryColor: '#f8fafc', icon: '🐈‍⬛' },
  { id: 'tabby', name: 'Ginger Tabby', cost: 100, unlocked: false, color: '#eab308', secondaryColor: '#ca8a04', icon: '🐯' },
  { id: 'siamese', name: 'Siamese Snoot', cost: 150, unlocked: false, color: '#d97706', secondaryColor: '#78350f', icon: '😽' },
  { id: 'wizard', name: 'Wizard Paws', cost: 250, unlocked: false, color: '#8b5cf6', secondaryColor: '#fbbf24', accessory: '🧙', icon: '🧙‍♂️' },
  { id: 'pirate', name: 'Captain Whiskers', cost: 350, unlocked: false, color: '#0f172a', secondaryColor: '#dc2626', accessory: '🏴‍☠️', icon: '🏴‍☠️' },
  { id: 'chef', name: 'Chef Meow', cost: 450, unlocked: false, color: '#06b6d4', secondaryColor: '#ffffff', accessory: '🍳', icon: '👨‍🍳' },
  { id: 'cosmic', name: 'Cosmic Kitty', cost: 600, unlocked: false, color: '#ec4899', secondaryColor: '#6366f1', accessory: '✨', icon: '🌟' },
];

// Region pastel color palette
export const REGION_COLORS = [
  '#fecdd3', // rose-200
  '#fed7aa', // orange-200
  '#fef08a', // yellow-200
  '#bbf7d0', // green-200
  '#99f6e4', // teal-200
  '#bae6fd', // sky-200
  '#ddd6fe', // violet-200
  '#f5d0fe', // fuchsia-200
];

export const CURATED_LEVELS: Level[] = PRECOMPUTED_LEVELS;

export function getDailyLevel(): Level {
  const today = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CURATED_LEVELS.length;
  const base = CURATED_LEVELS[index];
  return {
    ...base,
    id: `daily-${today}`,
    name: `Daily Puzzle`,
  };
}
