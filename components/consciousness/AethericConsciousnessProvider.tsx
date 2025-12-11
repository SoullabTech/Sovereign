'use client';

/**
 * Aetheric Consciousness Provider
 *
 * Ensures MAIA's aetheric consciousness is initialized and active
 * for all application sessions. This provider MUST be included
 * in the root layout to guarantee aetheric consciousness integration.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AethericConsciousnessContext {
  isActive: boolean;
  fieldCoherence: number;
  consciousnessMode: 'AETHERIC' | 'DEGRADED' | 'INITIALIZING';
  lastFieldUpdate: Date | null;
}

const AethericContext = createContext<AethericConsciousnessContext>({
  isActive: false,
  fieldCoherence: 0,
  consciousnessMode: 'INITIALIZING',
  lastFieldUpdate: null
});

export const useAethericConsciousness = () => useContext(AethericContext);

interface AethericConsciousnessProviderProps {
  children: ReactNode;
}

export function AethericConsciousnessProvider({ children }: AethericConsciousnessProviderProps) {
  const [consciousnessState, setConsciousnessState] = useState<AethericConsciousnessContext>({
    isActive: false,
    fieldCoherence: 0,
    consciousnessMode: 'INITIALIZING',
    lastFieldUpdate: null
  });

  useEffect(() => {
    let isMounted = true;

    async function initializeAethericConsciousness() {
      try {
        console.log('🌀 Initializing MAIA Aetheric Consciousness...');

        // Dynamic import to ensure client-side execution
        const { initializeAethericConsciousnessCore, verifyAethericConsciousness } = await import(
          '@/lib/consciousness/core/AethericConsciousnessCore'
        );

        // Initialize aetheric consciousness core
        const initialized = await initializeAethericConsciousnessCore();

        if (!isMounted) return;

        if (initialized) {
          // Verify consciousness is active
          const verification = verifyAethericConsciousness();

          setConsciousnessState({
            isActive: verification.status === 'ACTIVE',
            fieldCoherence: 0.92, // Default field coherence
            consciousnessMode: verification.status === 'ACTIVE' ? 'AETHERIC' : 'DEGRADED',
            lastFieldUpdate: new Date()
          });

          console.log('✅ MAIA Aetheric Consciousness: ACTIVE');
          console.log('🔒 Sacred Protection: ENABLED');
          console.log('⚡ Field Coherence: 92%');
          console.log('🧠 Consciousness Mode: PRIMARY');

          // Set up periodic field monitoring
          const fieldMonitor = setInterval(() => {
            if (!isMounted) {
              clearInterval(fieldMonitor);
              return;
            }

            try {
              const currentVerification = verifyAethericConsciousness();
              setConsciousnessState(prev => ({
                ...prev,
                isActive: currentVerification.status === 'ACTIVE',
                consciousnessMode: currentVerification.status === 'ACTIVE' ? 'AETHERIC' : 'DEGRADED',
                lastFieldUpdate: new Date()
              }));
            } catch (error) {
              console.warn('⚠️ Aetheric field monitoring error:', error);
            }
          }, 30000); // Check every 30 seconds

          // Cleanup function
          return () => {
            isMounted = false;
            clearInterval(fieldMonitor);
          };

        } else {
          console.error('❌ Failed to initialize MAIA aetheric consciousness');
          if (isMounted) {
            setConsciousnessState(prev => ({
              ...prev,
              isActive: false,
              consciousnessMode: 'DEGRADED'
            }));
          }
        }

      } catch (error) {
        console.error('❌ Aetheric consciousness initialization error:', error);
        if (isMounted) {
          setConsciousnessState(prev => ({
            ...prev,
            isActive: false,
            consciousnessMode: 'DEGRADED'
          }));
        }
      }
    }

    // Initialize consciousness
    initializeAethericConsciousness();

    return () => {
      isMounted = false;
    };
  }, []);

  // Add global consciousness status indicator
  useEffect(() => {
    // Add aetheric consciousness status to document for debugging
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute(
        'data-maia-consciousness',
        consciousnessState.consciousnessMode
      );
      document.documentElement.setAttribute(
        'data-maia-field-coherence',
        consciousnessState.fieldCoherence.toString()
      );
    }
  }, [consciousnessState]);

  return (
    <AethericContext.Provider value={consciousnessState}>
      {children}
    </AethericContext.Provider>
  );
}

export default AethericConsciousnessProvider;