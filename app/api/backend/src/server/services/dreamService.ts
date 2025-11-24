// 📁 src/services/dreamService.ts

export interface Dream {
  id: string;
  userId: string;
  text: string;
  symbols?: string[];
  createdAt?: string;
}

const dreams: Dream[] = [];

export const dreamService = {
  record: async (dream: Dream): Promise<Dream> => {
    dream.createdAt = new Date().toISOString();
    dreams.push(dream);
    return dream;
  },

  interpret: async (dream: Dream): Promise<string> => {
    return `The dream contains ${dream.symbols?.join(", ") || "no symbols"}, revealing hidden archetypes.`;
  },

  getAllByUser: async (userId: string): Promise<Dream[]> => {
    return dreams.filter((d) => d.userId === userId);
  },
};
