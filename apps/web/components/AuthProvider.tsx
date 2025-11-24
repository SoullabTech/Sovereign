'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface User {
  id: string;
  email?: string;
  name?: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider that reads from user's sign-in data
 * Gets the user's name from localStorage (where it's stored after sign-in)
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read the user's authentication data from localStorage
    const storedName = localStorage.getItem('maia_user');
    const storedUsername = localStorage.getItem('maia_username');
    const storedEmail = localStorage.getItem('maia_user_email');
    const storedUserId = localStorage.getItem('maia_user_id');

    if (storedUserId && storedName) {
      // Create user from stored authentication data
      setUser({
        id: storedUserId, // The USERID that contains their credentials
        email: storedEmail || undefined,
        name: storedName, // This is what MAIA uses for personal greetings
        username: storedUsername || undefined
      });
    } else if (storedName) {
      // Fallback: generate ID from name if no formal user ID exists
      setUser({
        id: `user-${storedName.toLowerCase().replace(/\s+/g, '-')}`,
        email: storedEmail || undefined,
        name: storedName,
        username: storedUsername || undefined
      });
    } else {
      // Demo fallback
      setUser({
        id: 'demo-user',
        email: 'demo@soullab.com',
        name: 'Demo User',
        username: 'demo'
      });
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
