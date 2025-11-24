/**
 * API Client with Stub/Real Backend Toggle
 * 
 * This allows seamless switching between stub implementations
 * and real backend API calls based on environment configuration.
 */

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || 'stub';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Type definitions
export interface OracleResponse {
  message: string;
  mayaResponse?: string;
  sessionId?: string;
  uiState?: any;
  metadata?: any;
}

export interface OracleService {
  chat: (message: string, userId: string) => Promise<OracleResponse>;
  getProfile: (userId: string) => Promise<any>;
  uploadFile: (file: File, userId: string) => Promise<any>;
  getInsights: (userId: string) => Promise<any>;
}

// Stub Implementation (current)
const stubImplementation: OracleService = {
  async chat(message: string, userId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      message: "Oracle response (stub mode)",
      mayaResponse: `I hear you saying: "${message}". This is a stub response while the backend is being deployed.`,
      sessionId: `stub-session-${Date.now()}`,
      uiState: {
        showVirtualOracle: true,
        oracleState: 'contemplating'
      }
    };
  },
  
  async getProfile(userId: string) {
    return {
      userId,
      elements: { fire: 0.3, water: 0.2, earth: 0.2, air: 0.2, aether: 0.1 },
      phase: 'exploration',
      confidence: 0.7
    };
  },
  
  async uploadFile(file: File, userId: string) {
    return {
      success: true,
      fileId: `stub-file-${Date.now()}`,
      message: 'File uploaded (stub mode)'
    };
  },
  
  async getInsights(userId: string) {
    return {
      insights: ['Stub insight 1', 'Stub insight 2'],
      patterns: [],
      recommendations: []
    };
  }
};

// Real API Implementation
const realAPIClient: OracleService = {
  async chat(message: string, userId: string) {
    const response = await fetch(`${API_URL}/api/oracle/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId })
    });
    
    if (!response.ok) {
      console.error('API call failed, falling back to stub');
      return stubImplementation.chat(message, userId);
    }
    
    return response.json();
  },
  
  async getProfile(userId: string) {
    try {
      const response = await fetch(`${API_URL}/api/shift/profile?userId=${userId}`);
      if (!response.ok) throw new Error('API call failed');
      return response.json();
    } catch (error) {
      console.error('API call failed, falling back to stub');
      return stubImplementation.getProfile(userId);
    }
  },
  
  async uploadFile(file: File, userId: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    } catch (error) {
      console.error('Upload failed, falling back to stub');
      return stubImplementation.uploadFile(file, userId);
    }
  },
  
  async getInsights(userId: string) {
    try {
      const response = await fetch(`${API_URL}/api/oracle/insights?userId=${userId}`);
      if (!response.ok) throw new Error('API call failed');
      return response.json();
    } catch (error) {
      console.error('API call failed, falling back to stub');
      return stubImplementation.getInsights(userId);
    }
  }
};

// Export the appropriate implementation based on environment
export const oracleService: OracleService = API_MODE === 'stub' 
  ? stubImplementation 
  : realAPIClient;

// Utility to check current mode
export const getAPIMode = () => API_MODE;
export const isStubMode = () => API_MODE === 'stub';

// Function to test backend connectivity
export const testBackendConnection = async (): Promise<boolean> => {
  if (API_MODE === 'stub') return false;
  
  try {
    const response = await fetch(`${API_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
};