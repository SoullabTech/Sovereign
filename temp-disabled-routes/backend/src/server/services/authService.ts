// src/services/authService.ts
export const authService = {
  validateToken: (token: string): boolean => {
    return token === "valid-token";
  },
};

// src/services/chatService.ts
export const chatService = {
  processMessage: (message: string): string => {
    return `Echo: ${message}`;
  },
};

// src/services/facetMapService.ts
export const facetMapService = {
  getMap: () => {
    return { "Fire 1": "Visionary", "Water 2": "Alchemist" };
  },
};

// src/services/facilitatorService.ts
export const facilitatorService = {
  getFacilitatorTools: () => {
    return ["Circle Process", "Check-in Protocol", "Conflict Resolution"];
  },
};

// src/services/feedbackService.ts
export interface Feedback {
  userId: string;
  message: string;
  timestamp: Date;
}

const feedbackList: Feedback[] = [];

export const feedbackService = {
  submitFeedback: (feedback: Feedback): void => {
    feedbackList.push(feedback);
  },
  listFeedback: (): Feedback[] => {
    return feedbackList;
  },
};

// src/services/flowService.ts
export const flowService = {
  startFlow: (userId: string): string => {
    return `Flow started for ${userId}`;
  },
};

// src/services/insightHistoryService.ts
export interface Insight {
  userId: string;
  content: string;
  date: Date;
}

const insightLog: Insight[] = [];

export const insightHistoryService = {
  recordInsight: (insight: Insight): void => {
    insightLog.push(insight);
  },
  getHistory: (userId: string): Insight[] => {
    return insightLog.filter((i) => i.userId === userId);
  },
};

// src/services/notionIngestService.ts
export const notionIngestService = {
  ingest: (content: string): string => {
    return `Content ingested to Notion: ${content.substring(0, 50)}...`;
  },
};

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

// src/services/symbolicTrendsService.ts
export const symbolicTrendsService = {
  analyzeSymbols: (symbols: string[]): string => {
    return `Trends show increased presence of: ${symbols.join(", ")}`;
  },
};

// src/services/oracleService.ts
export const oracleService = {
  ask: (question: string): string => {
    return `The Oracle hears your question: "${question}"... and responds in silence.`;
  },
  interpretSymbols: (symbols: string[]): string => {
    return `These symbols—${symbols.join(", ")}—hold keys to your current transformation.`;
  },
};

// src/services/userService.ts
export interface User {
  id: string;
  name: string;
  role?: "admin" | "user" | "oracle";
}

const users: Record<string, User> = {
  u1: { id: "u1", name: "Aria Spiral", role: "oracle" },
};

export const userService = {
  getUser: (id: string): User | null => {
    return users[id] || null;
  },
  isAdmin: (id: string): boolean => {
    return users[id]?.role === "admin";
  },
};

// src/services/sessionService.ts
export interface Session {
  id: string;
  userId: string;
  startedAt: Date;
  context?: string;
}

const mockSessions: Session[] = [];

export const sessionService = {
  startSession: (userId: string, context?: string): Session => {
    const session = {
      id: `${Date.now()}`,
      userId,
      startedAt: new Date(),
      context,
    };
    mockSessions.push(session);
    return session;
  },
  listSessions: (userId: string): Session[] => {
    return mockSessions.filter((s) => s.userId === userId);
  },
};

// src/services/memoryService.ts
export interface MemoryItem {
  userId: string;
  content: string;
  timestamp: Date;
}

const memories: MemoryItem[] = [];

export const memoryService = {
  store: (userId: string, content: string): MemoryItem => {
    const item = { userId, content, timestamp: new Date() };
    memories.push(item);
    return item;
  },
  recall: (userId: string): MemoryItem[] => {
    return memories.filter((m) => m.userId === userId);
  },
};

// src/services/dreamService.ts
export interface Dream {
  id: string;
  userId: string;
  text: string;
  symbols?: string[];
}

const dreams: Dream[] = [];

export const dreamService = {
  record: (dream: Dream): Dream => {
    dreams.push(dream);
    return dream;
  },
  interpret: (dream: Dream): string => {
    return `The dream contains ${dream.symbols?.join(", ") || "no symbols"}, revealing hidden archetypes.`;
  },
};
