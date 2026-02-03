/**
 * useAssistantName - Hook for getting the member's preferred name for MAIA
 *
 * Returns the name the member has chosen to call MAIA (defaults to 'MAIA').
 * This is a bonding affordance - the member shapes the contact field
 * without changing the underlying integrity of the system.
 *
 * Usage:
 *   const assistantName = useAssistantName();
 *   // Returns 'Maya', 'Sage', 'MAIA', etc.
 */

import { useState, useEffect } from 'react';
import { getAccountSettings } from '@/lib/settings/accountSettings';

/**
 * Hook to get the member's preferred assistant name
 * Listens for settings changes and updates automatically
 */
export function useAssistantName(): string {
  const [assistantName, setAssistantName] = useState<string>('MAIA');

  useEffect(() => {
    // Load initial value
    const loadName = () => {
      const settings = getAccountSettings();
      setAssistantName(settings.preferredAssistantName || 'MAIA');
    };

    loadName();

    // Listen for settings changes
    const handleSettingsChange = () => {
      loadName();
    };

    window.addEventListener('maia-account-settings-changed', handleSettingsChange);
    window.addEventListener('maia-settings-changed', handleSettingsChange);

    return () => {
      window.removeEventListener('maia-account-settings-changed', handleSettingsChange);
      window.removeEventListener('maia-settings-changed', handleSettingsChange);
    };
  }, []);

  return assistantName;
}

/**
 * Get assistant name synchronously (for non-hook contexts)
 * Returns the name the member has chosen to call MAIA
 */
export function getAssistantName(): string {
  if (typeof window === 'undefined') {
    return 'MAIA';
  }
  const settings = getAccountSettings();
  return settings.preferredAssistantName || 'MAIA';
}
