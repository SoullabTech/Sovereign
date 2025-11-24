"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './SecureAuthProvider';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback = null,
  redirectTo = '/auth/secure'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-spiralogic flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-aether/20 to-recognition/20 rounded-full blur-3xl"></div>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-aether border-t-transparent rounded-full animate-spin aether-energy" />
            </div>
          </div>
          <p className="sacred-subtitle">Verifying sacred identity...</p>
        </div>
      </div>
    );
  }

  // Show fallback or redirect if not authenticated
  if (!isAuthenticated) {
    return fallback || null;
  }

  // Render children if authenticated
  return <>{children}</>;
}