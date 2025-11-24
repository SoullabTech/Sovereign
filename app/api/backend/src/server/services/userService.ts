// src/services/surveyService.ts

export interface SurveyResponse {
  questionId: string;
  answer: number;
}

const responses: SurveyResponse[] = [];

export const surveyService = {
  /**
   * Store a single survey response
   */
  submitResponse: (response: SurveyResponse): void => {
    responses.push(response);
  },

  /**
   * Retrieve all stored survey responses
   */
  getResponses: (): SurveyResponse[] => {
    return responses;
  },

  /**
   * Clear all responses (optional utility for testing/dev)
   */
  reset: (): void => {
    responses.length = 0;
  },
};
