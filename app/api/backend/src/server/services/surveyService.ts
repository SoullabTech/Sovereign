// src/services/surveyService.ts

export interface SurveyResponse {
  questionId: string;
  answer: string;
}

const responses: SurveyResponse[] = [];

export const surveyService = {
  submitResponse: (response: SurveyResponse): void => {
    responses.push(response);
  },

  getResponses: (): SurveyResponse[] => {
    return responses;
  },
};
