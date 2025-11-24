'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/system/ToastProvider';
import { SecureAuthProvider } from '@/components/SecureAuthProvider';
import IOSFixInitializer from '@/components/system/IOSFixInitializer';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <div suppressHydrationWarning>
      <ThemeProvider>
        <SecureAuthProvider>
          <ToastProvider>
            <IOSFixInitializer />
            {children}
          </ToastProvider>
        </SecureAuthProvider>
      </ThemeProvider>
    </div>
  );
}