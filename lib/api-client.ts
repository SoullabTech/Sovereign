/**
 * MAIA API Client
 *
 * Centralized client for making requests to the MAIA API service.
 * All frontend API calls should go through this client.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE: MAIA-First Hierarchy
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This client talks to the MAIA API at api.soullab.life.
 * The MAIA API is the single backend for all Soullab products.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// API base URL - can be overridden for development
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.soullab.life';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId: string;
    timestamp: string;
    processingTime?: number;
  };
}

export class ApiError extends Error {
  public code: string;
  public statusCode: number;
  public details?: unknown;

  constructor(response: ApiResponse) {
    super(response.error?.message || 'Unknown API error');
    this.code = response.error?.code || 'UNKNOWN_ERROR';
    this.statusCode = 500;
    this.details = response.error?.details;
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a request to the API
   */
  async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/v1${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for auth
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok || !data.success) {
        throw new ApiError(data);
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Network or parsing error
      throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string, options?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown, options?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: unknown, options?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: unknown, options?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, options?: Omit<RequestInit, 'method' | 'body'>): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // Domain-specific methods
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Members API
   */
  members = {
    /**
     * Check if passkey exists
     */
    check: (passkey: string) =>
      this.post<{
        exists: boolean;
        isInvite: boolean;
        onboarded?: boolean;
        onboardingStep?: string;
        username?: string;
        name?: string;
        inviteStatus?: string;
        inviterName?: string;
        error?: string;
      }>('/members/check', { passkey }),

    /**
     * Sign in with username/password
     */
    signin: (username: string, password: string) =>
      this.post<{
        member: {
          id: string;
          username: string;
          name: string;
          preferredName: string;
          onboarded: boolean;
          onboardingStep: string;
        };
      }>('/members/signin', { username, password }),

    // TODO: Add more methods as routes are migrated
    // register: (data: RegisterData) => this.post('/members/register', data),
    // recover: (email: string) => this.post('/members/recover', { email }),
    // getProgress: () => this.get('/members/progress'),
    // updateProgress: (step: string) => this.post('/members/progress', { step }),
  };

  /**
   * Portal API
   */
  portal = {
    /**
     * Get portal configuration
     */
    config: (slug: string) =>
      this.get<{
        config: {
          practitioner_id: string;
          practitioner_name: string;
          slug: string;
          brand: {
            name: string;
            tagline: string;
            logo_url: string | null;
            primary_color: string;
            secondary_color: string;
            accent_color: string;
            font_heading: string;
            font_body: string;
          };
          navigation: unknown[];
          social: {
            instagram: string | null;
            facebook: string | null;
            linkedin: string | null;
            twitter: string | null;
            website: string | null;
          };
          footer_text: string | null;
        };
      }>(`/portal/${slug}/config`),

    // TODO: Add more methods as routes are migrated
    // home: (slug: string) => this.get(`/portal/${slug}/home`),
    // about: (slug: string) => this.get(`/portal/${slug}/about`),
    // services: (slug: string) => this.get(`/portal/${slug}/services`),
    // faq: (slug: string) => this.get(`/portal/${slug}/faq`),
    // articles: (slug: string) => this.get(`/portal/${slug}/articles`),
    // chat: (slug: string, message: string) => this.post(`/portal/${slug}/chat`, { message }),
  };

  /**
   * Health API
   */
  health = {
    /**
     * Check API health
     */
    check: () =>
      this.get<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        service: string;
        version: string;
        timestamp: string;
        uptime: number;
      }>('/health'),

    /**
     * Readiness probe
     */
    ready: () =>
      this.get<{
        ready: boolean;
        timestamp: string;
      }>('/health/ready'),

    /**
     * Liveness probe
     */
    live: () =>
      this.get<{
        alive: boolean;
        timestamp: string;
      }>('/health/live'),
  };
}

// Export singleton instance
export const api = new ApiClient();

// Export class for custom instances
export { ApiClient };

// Default export
export default api;
