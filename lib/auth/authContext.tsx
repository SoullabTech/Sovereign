"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  agentId: string;
  agentName: string;
  createdAt: string;
  // Legacy fields for compatibility
  email?: string;
  sacredName?: string;
  lastLogin?: string;
}

/** @deprecated Legacy type - will be removed */
interface OracleAgent {
  id: string;
  name: string;
  archetype: string;
  personality_config: any;
  conversations_count: number;
  wisdom_level: number;
  last_conversation_at?: string;
  created_at: string;
}

interface AuthContextType {
  // Core fields
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => void;
  // Legacy compatibility fields (deprecated)
  /** @deprecated Use `loading` instead */
  isLoading: boolean;
  /** @deprecated Computed from user */
  isAuthenticated: boolean;
  /** @deprecated No longer used */
  session: any;
  /** @deprecated No longer used */
  oracleAgent: OracleAgent | null;
  /** @deprecated No longer tracked here */
  error: string | null;
  /** @deprecated No-op for compatibility */
  refreshSession: () => Promise<void>;
  /** @deprecated No-op for compatibility */
  updateProfile: (data: any) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('beta_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const assignPersonalAgent = (username: string) => {
    // Assign a unique agent based on username hash for consistency
    const agents = [
      { id: 'maya-fire', name: 'Maya (Fire Element)' },
      { id: 'maya-water', name: 'Maya (Water Element)' },
      { id: 'maya-earth', name: 'Maya (Earth Element)' },
      { id: 'maya-air', name: 'Maya (Air Element)' },
      { id: 'maya-aether', name: 'Maya (Aether Integration)' }
    ];
    
    // Simple hash to consistently assign same agent to same user
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = ((hash << 5) - hash) + username.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % agents.length;
    return agents[index];
  };

  const signIn = async (username: string, password: string) => {
    try {
      // For beta, simple validation (in production, this would hit an API)
      if (!username || password.length < 6) {
        throw new Error('Invalid credentials');
      }

      // Check if user exists in localStorage (beta mock)
      const users = JSON.parse(localStorage.getItem('beta_users') || '{}');
      
      if (users[username]) {
        // Existing user
        if (users[username].password !== password) {
          throw new Error('Invalid password');
        }
        const userData = users[username];
        setUser(userData);
        localStorage.setItem('beta_user', JSON.stringify(userData));
      } else {
        throw new Error('User not found. Please sign up first.');
      }
      
      router.push('/oracle');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (username: string, password: string) => {
    try {
      if (!username || password.length < 6) {
        throw new Error('Username required and password must be at least 6 characters');
      }

      // Check if username exists
      const users = JSON.parse(localStorage.getItem('beta_users') || '{}');
      
      if (users[username]) {
        throw new Error('Username already taken');
      }

      // Create new user with assigned agent
      const agent = assignPersonalAgent(username);
      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        agentId: agent.id,
        agentName: agent.name,
        createdAt: new Date().toISOString()
      };

      // Store user (in beta, using localStorage)
      users[username] = { ...newUser, password };
      localStorage.setItem('beta_users', JSON.stringify(users));
      
      setUser(newUser);
      localStorage.setItem('beta_user', JSON.stringify(newUser));
      
      router.push('/onboarding');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('beta_user');
    router.push('/');
  };

  // Legacy compatibility - deprecated fields
  const isAuthenticated = useMemo(() => !!user, [user]);
  const refreshSession = useCallback(async () => {}, []);
  const updateProfile = useCallback(async () => ({ error: null }), []);

  const contextValue: AuthContextType = {
    // Core
    user,
    loading,
    signIn,
    signUp,
    signOut,
    // Legacy compatibility (deprecated)
    isLoading: loading,
    isAuthenticated,
    session: null,
    oracleAgent: null,
    error: null,
    refreshSession,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}