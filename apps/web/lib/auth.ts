// Simple auth utility for beta testing
// Uses localStorage-based authentication

export interface BetaUser {
  id: string;
  username: string;
  agentId: string;
  agentName: string;
  createdAt: string;
  onboarded?: boolean;
}

export function getCurrentUser(): BetaUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('beta_user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

export function getUserId(): string | null {
  const user = getCurrentUser();
  return user?.id || null;
}

export function getUserEmail(): string | null {
  const user = getCurrentUser();
  return user?.username || null;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('beta_user');
  }
}

// Server-side auth helper for API routes
export function getServerAuth(request: Request): { userId: string | null; userEmail: string | null } {
  try {
    // For beta testing, we'll extract user info from headers or use a default
    const authHeader = request.headers.get('authorization');
    const userHeader = request.headers.get('x-user-id');
    
    if (userHeader) {
      return { userId: userHeader, userEmail: userHeader };
    }
    
    // For now, return a default demo user for API testing
    // In production, this would validate JWT tokens or sessions
    return { userId: 'demo-user-seed', userEmail: 'demo@example.com' };
  } catch {
    return { userId: null, userEmail: null };
  }
}