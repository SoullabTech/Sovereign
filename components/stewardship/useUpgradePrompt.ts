/**
 * useUpgradePrompt Hook
 *
 * Fetches and manages upgrade prompts from the API.
 * Handles prompt display, dismissal, and response recording.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { UpgradePromptData } from './UpgradePromptModal';

interface UseUpgradePromptOptions {
  /** Check for prompts on mount */
  checkOnMount?: boolean;
  /** Feature to check for gating */
  feature?: string;
}

interface UseUpgradePromptReturn {
  /** Current prompt to display (null if none) */
  prompt: UpgradePromptData | null;
  /** Whether prompt modal is open */
  isOpen: boolean;
  /** Whether loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Check for upgrade prompt */
  checkForPrompt: (feature?: string) => Promise<void>;
  /** Record user response to prompt */
  recordResponse: (response: 'upgraded' | 'dismissed' | 'later' | 'not_interested') => Promise<void>;
  /** Close prompt modal */
  closePrompt: () => void;
  /** Open prompt modal (if prompt exists) */
  openPrompt: () => void;
}

export function useUpgradePrompt(options: UseUpgradePromptOptions = {}): UseUpgradePromptReturn {
  const { checkOnMount = false, feature } = options;

  const [prompt, setPrompt] = useState<UpgradePromptData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForPrompt = useCallback(async (checkFeature?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let response: Response;

      if (checkFeature) {
        // POST for feature-specific check
        response = await fetch('/api/pricing/check-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature: checkFeature }),
        });
      } else {
        // GET for general check
        response = await fetch('/api/pricing/check-prompt');
      }

      if (!response.ok) {
        throw new Error('Failed to check for prompt');
      }

      const data = await response.json();

      if (data.prompt) {
        setPrompt(data.prompt);
        setIsOpen(true);
      } else {
        setPrompt(null);
        setIsOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPrompt(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recordResponse = useCallback(async (
    response: 'upgraded' | 'dismissed' | 'later' | 'not_interested'
  ) => {
    if (!prompt) return;

    try {
      await fetch('/api/pricing/check-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: prompt.id,
          response,
        }),
      });

      setIsOpen(false);
      setPrompt(null);
    } catch (err) {
      console.error('Failed to record prompt response:', err);
    }
  }, [prompt]);

  const closePrompt = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openPrompt = useCallback(() => {
    if (prompt) {
      setIsOpen(true);
    }
  }, [prompt]);

  // Check on mount if enabled
  useEffect(() => {
    if (checkOnMount) {
      checkForPrompt(feature);
    }
  }, [checkOnMount, feature, checkForPrompt]);

  return {
    prompt,
    isOpen,
    isLoading,
    error,
    checkForPrompt,
    recordResponse,
    closePrompt,
    openPrompt,
  };
}

/**
 * Hook for checking feature gates
 *
 * Returns whether a feature is allowed and any prompt to show.
 */
export function useFeatureGate(feature: string) {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [gateTier, setGateTier] = useState<'supporter' | 'studio' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAccess = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/pricing/check-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature }),
      });

      if (!response.ok) {
        throw new Error('Failed to check feature access');
      }

      const data = await response.json();

      if (data.prompt) {
        setIsAllowed(data.allowed ?? false);
        setGateTier(data.prompt.type === 'feature_gate'
          ? (feature.includes('studio') ? 'studio' : 'supporter')
          : null
        );
        setMessage(data.prompt.message);
      } else {
        setIsAllowed(true);
        setGateTier(null);
        setMessage(null);
      }
    } catch (err) {
      console.error('Feature gate check failed:', err);
      setIsAllowed(true); // Fail open
    } finally {
      setIsLoading(false);
    }
  }, [feature]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return {
    isAllowed,
    gateTier,
    message,
    isLoading,
    recheckAccess: checkAccess,
  };
}

export default useUpgradePrompt;
