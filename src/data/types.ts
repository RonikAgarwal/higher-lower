export interface GameItem {
  id: string;
  name: string;
  category: string;
  metric: string;
  value: number;
  displayValue: string;
  color?: string; // accent color for the card gradient
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export type GamePhase =
  | 'landing'
  | 'category'
  | 'countdown'
  | 'playing'
  | 'revealing'
  | 'correct'
  | 'wrong'
  | 'gameOver';

export interface LeaderboardEntry {
  name: string;
  score: number;
  streak: number;
  category: string;
  timestamp: number;
}
