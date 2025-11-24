// API configuration and client setup

export const API_ENDPOINTS = {
  analytics: {
    dashboard: '/api/analytics/dashboard',
    metrics: '/api/analytics/metrics',
    insights: '/api/analytics/insights',
  },
  elemental: {
    recommendations: '/api/elemental/recommendations',
    analysis: '/api/elemental/analysis',
  },
  oracle: {
    consult: '/api/oracle/consult',
    insights: '/api/oracle/insights',
    emotional_resonance: '/api/oracle/emotional-resonance',
  },
  files: {
    upload: '/api/oracle/files/upload',
    library: '/api/oracle/files/library',
    manage: '/api/oracle/files/manage',
  },
};

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  async get(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  async post(endpoint: string, data?: any, options?: RequestInit) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  async put(endpoint: string, data?: any, options?: RequestInit) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  async delete(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const apiClient = new APIClient(process.env.NEXT_PUBLIC_API_URL || '');

export default apiClient;