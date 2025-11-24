"use client";

import { ReactNode, createContext, useContext } from "react";

interface AuthContext {
  isAuthenticated: boolean;
  user: any;
}

const AuthContext = createContext<AuthContext>({
  isAuthenticated: false,
  user: null
});

interface SecureAuthProviderProps {
  children: ReactNode;
}

export function SecureAuthProvider({ children }: SecureAuthProviderProps) {
  // Simple auth context for now - can be enhanced later
  const authValue = {
    isAuthenticated: false,
    user: null
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}