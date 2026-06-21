export type ExerciseType =
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'gym'
  | 'yoga'
  | 'padel'
  | 'tennis'
  | 'football'
  | 'basketball'
  | 'hiking'
  | 'crossfit'
  | 'triathlon'
  | 'boxing'
  | 'martial_arts'
  | 'dance'
  | 'pilates'
  | 'rugby'
  | 'volleyball'
  | 'surf'
  | 'skiing'
  | 'climbing'
  | 'golf'
  | 'horse_riding'
  | 'skateboard'
  | 'baseball';

export type Language = 'es' | 'en';

export interface ScoreBreakdown {
  coordination: number;
  fit: number;
  appropriateness: number;
  trend: number;
  completeness: number;
}

export interface ProductRecommendation {
  name: string;
  brand: string;
  reason: string;
  url: string;
  type: 'replace' | 'add';
}

export interface ScoreResult {
  total: number;
  breakdown: ScoreBreakdown;
  basis: string;
  recommendations: string[];
  products: ProductRecommendation[];
}

export interface Outfit {
  id: string;
  imageUri: string;
  exerciseType: ExerciseType;
  score: ScoreResult;
  createdAt: string;
  weekKey: string;
}

export type RootStackParamList = {
  Main: undefined;
  Score: {
    imageUri: string;
    exerciseType: ExerciseType;
    result: ScoreResult;
  };
};

export type TabParamList = {
  Camera: undefined;
  Premium: undefined;
  Wardrobe: undefined;
  Profile: undefined;
};
