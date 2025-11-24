// General stub for backend services during migration

export const stubResponse = (serviceName: string) => ({
  success: false,
  message: `${serviceName} is being migrated to API routes`,
  data: null
});

export const asyncStub = async (serviceName: string, delay = 100) => {
  await new Promise(resolve => setTimeout(resolve, delay));
  return stubResponse(serviceName);
};

// Common service stubs
export const MemoryService = {
  store: async (data: any) => asyncStub('MemoryService.store'),
  retrieve: async (id: string) => asyncStub('MemoryService.retrieve'),
  search: async (query: string) => asyncStub('MemoryService.search')
};

export const AIService = {
  process: async (input: any) => asyncStub('AIService.process'),
  analyze: async (data: any) => asyncStub('AIService.analyze')
};

export const RetreatService = {
  create: async (data: any) => asyncStub('RetreatService.create'),
  join: async (id: string, userId: string) => asyncStub('RetreatService.join'),
  getActive: async () => asyncStub('RetreatService.getActive')
};
