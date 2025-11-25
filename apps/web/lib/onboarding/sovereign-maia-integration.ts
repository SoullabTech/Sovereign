/**
 * SOVEREIGN MAIA - ONBOARDING INTEGRATION
 *
 * Simple bridge between onboarding and MAIA interface.
 *
 * Flow:
 * 1. One-time onboarding ritual (rich elemental journey)
 * 2. Simple "Welcome back [name]" on return
 * 3. Direct to /maia interface
 */

import { SpiralogicElement } from '../consciousness/spiralogic-core';

// ═══════════════════════════════════════════════════════════════════════════════
// SIMPLE ONBOARDING COMPLETION
// ═══════════════════════════════════════════════════════════════════════════════

export interface OnboardingCompletion {
  userId: string;
  userName: string;
  completedAt: Date;
  currentMission?: string;           // Optional: their stated mission
  activeElement?: SpiralogicElement; // Optional: their chosen element
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMPLE CONNECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Mark onboarding as completed - called at end of onboarding flow
 */
export function markOnboardingCompleted(userId: string, userName: string, mission?: string): void {
  const completion: OnboardingCompletion = {
    userId,
    userName,
    completedAt: new Date(),
    currentMission: mission,
  };

  localStorage.setItem('sovereign_maia_onboarding', JSON.stringify({
    ...completion,
    completedAt: completion.completedAt.toISOString()
  }));

  // Set existing flags for compatibility
  localStorage.setItem('betaOnboardingComplete', 'true');
  localStorage.setItem('explorerName', userName);
  localStorage.setItem('explorerId', userId);

  console.log('✅ [SOVEREIGN-MAIA] Onboarding completed for:', userName);
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(userId: string): boolean {
  const stored = localStorage.getItem('sovereign_maia_onboarding');
  if (!stored) {
    // Check existing system
    return localStorage.getItem('betaOnboardingComplete') === 'true';
  }

  try {
    const data = JSON.parse(stored);
    return data.userId === userId;
  } catch {
    return false;
  }
}

/**
 * Get simple welcome message for returning users
 */
export function getWelcomeMessage(userId: string): string | null {
  const stored = localStorage.getItem('sovereign_maia_onboarding');
  if (!stored) return null;

  try {
    const data = JSON.parse(stored);
    if (data.userId === userId) {
      return `Welcome back, ${data.userName}`;
    }
  } catch {
    // Fall back to existing system
    const userName = localStorage.getItem('explorerName');
    if (userName) {
      return `Welcome back, ${userName}`;
    }
  }

  return null;
}

/**
 * Simple bridge - connects onboarding completion to MAIA interface
 * Called from existing onboarding components to mark completion
 */
export function bridgeToSovereignMaia(userId: string, userName: string): void {
  markOnboardingCompleted(userId, userName);
  // Redirect handled by existing onboarding flow
}