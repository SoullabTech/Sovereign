// Creativity Section - Types
// Mathematics of Creativity Framework Types

export type AttemptType = 'idea' | 'draft' | 'experiment' | 'prototype';
export type AttemptStatus = 'raw' | 'developed' | 'shipped' | 'archived';
export type SessionMode = 'diverge' | 'converge' | 'edge';
export type ActivityType = 'learning' | 'creating' | 'refining';
export type RelationType = 'remix' | 'evolution' | 'fusion';
export type AchievementType = 'attempt_count' | 'streak' | 'combination' | 'hours';

export interface CreativeAttempt {
  id: string;
  memberId: string;
  createdAt: Date;
  updatedAt: Date;
  type: AttemptType;
  contentText: string | null;
  contentVoiceUrl: string | null;
  contentImageUrl: string | null;
  status: AttemptStatus;
  qualityRating: number | null;
  outlierScore: number;
  isOutlier: boolean;
  outlierReasons: string[];
  viewCount: number;
  editCount: number;
  totalTimeSpent: number;
  engagementScore: number;
}

export interface CreateAttemptInput {
  memberId: string;
  type?: AttemptType;
  contentText?: string;
  contentVoiceUrl?: string;
  contentImageUrl?: string;
}

export interface UpdateAttemptInput {
  contentText?: string;
  contentVoiceUrl?: string;
  contentImageUrl?: string;
  status?: AttemptStatus;
  qualityRating?: number;
}

export interface CreativeAttemptEvent {
  id: string;
  attemptId: string;
  memberId: string;
  eventType: string;
  valueInt: number | null;
  createdAt: Date;
}

export interface BuildingBlock {
  id: string;
  memberId: string;
  createdAt: Date;
  updatedAt: Date;
  contentText: string;
  sourceAttemptId: string | null;
  domain: string | null;
  tags: string[];
  usageCount: number;
  lastUsedAt: Date | null;
}

export interface AttemptLineage {
  parentAttemptId: string;
  childAttemptId: string;
  relationType: RelationType;
  createdAt: Date;
}

export interface CreativePracticeLog {
  id: string;
  memberId: string;
  date: Date;
  skillDomain: string;
  durationMinutes: number;
  activityType: ActivityType;
  notes: string | null;
  createdAt: Date;
}

export interface CreativeSession {
  id: string;
  memberId: string;
  createdAt: Date;
  endedAt: Date | null;
  mode: SessionMode;
  structureLevel: number;
  durationMinutes: number | null;
  outputCount: number;
  qualitySelfRating: number | null;
  notes: string | null;
}

export interface SkillDomain {
  id: string;
  memberId: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
}

export interface PracticeStreak {
  memberId: string;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: Date | null;
  streakMinimumMinutes: number;
  updatedAt: Date;
}

export interface ChaosProfile {
  memberId: string;
  optimalStructureLevel: number;
  optimalRangeMin: number;
  optimalRangeMax: number;
  bestHourForChaos: number | null;
  bestHourForStructure: number | null;
  bestDayForCreative: number | null;
  confidence: number;
  updatedAt: Date;
}

export interface CreativityJourney {
  memberId: string;
  currentStage: number;
  completedStages: number[];
  unlockedFeatures: string[];
  lastStageChange: Date;
  createdAt: Date;
}

export interface MemberAchievement {
  id: string;
  memberId: string;
  achievementType: AchievementType;
  achievementKey: string;
  earnedAt: Date;
}

// API Response types
export interface AttemptStats {
  totalAttempts: number;
  todayAttempts: number;
  thisWeekAttempts: number;
  outlierCount: number;
  averageQualityRating: number | null;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: Date | null;
  atRisk: boolean;
}

// Achievement definitions
export const ACHIEVEMENT_MILESTONES = {
  attempt_count: [10, 50, 100, 500, 1000, 5000, 10000],
  streak: [7, 14, 30, 60, 100, 365],
  hours: [10, 50, 100, 500, 1000, 5000, 10000],
} as const;

export const ACHIEVEMENT_NAMES: Record<string, string> = {
  attempts_10: 'First Steps',
  attempts_50: 'Getting Started',
  attempts_100: 'Centurion',
  attempts_500: 'Prolific',
  attempts_1000: 'Edison Club',
  attempts_5000: 'Master of Volume',
  attempts_10000: 'Legend',
  streak_7: 'Week Warrior',
  streak_14: 'Fortnight Fighter',
  streak_30: 'Monthly Master',
  streak_60: 'Two Month Terror',
  streak_100: 'Centurion Streak',
  streak_365: 'Year of Creation',
  hours_10: 'Ten Hour Mark',
  hours_50: 'Fifty Hours In',
  hours_100: 'Century of Hours',
  hours_500: 'Half Grand',
  hours_1000: 'Grand Master',
  hours_5000: 'Five Thousand Strong',
  hours_10000: 'Ten Thousand Hours',
};
