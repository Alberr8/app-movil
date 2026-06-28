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
  coachingNudge?: string;
}

export interface Outfit {
  id: string;
  imageUri: string;
  exerciseType: ExerciseType;
  score: ScoreResult;
  createdAt: string;
  weekKey: string;
  wornDate?: string;  // YYYY-MM-DD local date the outfit was worn (defaults to createdAt date)
}

export interface UserProfile {
  id: string;
  name: string | null;
  language: Language;
  notifications_enabled: boolean;
}

import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  Score: {
    imageUri: string;
    exerciseType: ExerciseType;
    result: ScoreResult;
  };
};

export type TabParamList = {
  Wardrobe: undefined;
  Profile: undefined;
  Camera: undefined;
  Premium: undefined;
  Stats: undefined;
};
