export interface EntitySource {
  name: string;
  url: string;
  verified_date: string;
  source_type: string;
  is_estimate?: boolean;
  note?: string;
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  value: number;
  display_value: string;
  source: EntitySource;
  image_query: string;
  color?: string; // Appended for UI
}

export interface Metric {
  name: string;
  unit: string;
  description?: string;
}

export interface Question {
  id: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
  metric: Metric;
  reference: Entity;
  challenger: Entity;
  correct_answer: 'HIGHER' | 'LOWER';
  explanation: string;
  data_as_of: string;
}

export interface CategoryData {
  display_name: string;
  metrics: Record<string, Omit<Metric, 'name'>>;
  questions: Question[];
}

export interface CherryDataset {
  dataset_version: string;
  generated_at: string;
  description: string;
  categories: Record<string, CategoryData>;
}

// Alias GameItem to Entity for backwards compatibility where possible
export type GameItem = Entity;

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
