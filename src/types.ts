export type CellState = 'empty' | 'cat' | 'cross';

export type ToolMode = 'cat' | 'cross' | 'erase';

export interface Level {
  id: string;
  name: string;
  difficulty: '5x5' | '6x6' | '7x7' | '8x8' | 'easy' | 'medium' | 'hard' | 'expert';
  size: number; // e.g. 5, 6, 7, 8
  regions: number[][]; // size x size grid with region IDs (0 to K-1)
  solution: { r: number; c: number }[]; // coordinates of cats in solution
}

export interface CatBreed {
  id: string;
  name: string;
  cost: number;
  unlocked: boolean;
  color: string;
  secondaryColor: string;
  accessory?: string;
  icon: string;
}

export interface GameStatistics {
  score: number;
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  bestTimes: Record<string, number>; // levelId -> seconds
  fishTreats: number;
  unlockedBreeds: string[];
  equippedBreed: string;
}

export type GameScreen = 'title' | 'level-select' | 'game' | 'wardrobe' | 'stats' | 'rules';
