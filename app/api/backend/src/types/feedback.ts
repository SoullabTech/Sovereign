export interface FeedbackInput {
  responseId: string;
  response: string;
  rating: number;
  comment?: string;
  metadata?: Record<string, unknown>;
}

export interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  positiveFeedback: number;
  negativeFeedback: number;
  elementalDistribution: Record<string, number>;
}

export interface FeedbackAnalysis {
  totalFeedback: number;
  averageRating: number;
  elementalEffectiveness: Record<string, number>;
  patternEffectiveness: Record<string, number>;
  timeframe: {
    start: Date;
    end: Date;
  };
}
