/**
 * Teen Profile Utilities
 * Helper functions for managing teen user profiles and age calculations
 */

import { TeenProfile } from './teenSupportIntegration';

export interface UserData {
  id: string;
  username?: string;
  name?: string;
  displayName?: string;
  birthDate?: string;
  age?: number;
  isNeurodivergent?: boolean;
  hasEatingDisorder?: boolean;
  familyDynamics?: 'controlling' | 'supportive' | 'chaotic' | 'unknown';
  supportNeeds?: string[];
  onboarded?: boolean;
  createdAt?: string;
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;

  try {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  } catch (e) {
    console.error('Error calculating age:', e);
    return null;
  }
}

/**
 * Determine if user is a teen (ages 13-18)
 */
export function isTeenUser(userData?: UserData): boolean {
  if (!userData?.birthDate) return false;

  const age = calculateAge(userData.birthDate);
  return age !== null && age >= 13 && age <= 18;
}

/**
 * Extract teen profile from user data
 */
export function getTeenProfile(userData?: UserData): TeenProfile | undefined {
  if (!userData || !isTeenUser(userData)) {
    return undefined;
  }

  const age = calculateAge(userData.birthDate!);

  return {
    age: age || undefined,
    isNeurodivergent: userData.isNeurodivergent,
    hasEatingDisorder: userData.hasEatingDisorder,
    familyDynamics: userData.familyDynamics,
    supportNeeds: userData.supportNeeds
  };
}

/**
 * Load user data from localStorage
 */
export function getUserData(): UserData | null {
  if (typeof window === 'undefined') return null;

  // Check NEW system first (beta_user from auth system)
  const betaUser = localStorage.getItem('beta_user');
  if (betaUser) {
    try {
      const userData = JSON.parse(betaUser);
      return userData;
    } catch (e) {
      console.error('❌ Error parsing beta_user:', e);
    }
  }

  // Check OLD system (for backward compatibility)
  if (localStorage.getItem('betaOnboardingComplete') === 'true') {
    const id = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');
    const name = localStorage.getItem('explorerName');
    if (id && name) {
      return {
        id,
        username: name,
        name,
        onboarded: true
      };
    }
  }

  return null;
}

/**
 * Save teen profile data to user data
 */
export function saveTeenProfile(teenProfile: Partial<TeenProfile>): void {
  if (typeof window === 'undefined') return;

  const userData = getUserData();
  if (!userData) return;

  const updatedUserData = {
    ...userData,
    isNeurodivergent: teenProfile.isNeurodivergent ?? userData.isNeurodivergent,
    hasEatingDisorder: teenProfile.hasEatingDisorder ?? userData.hasEatingDisorder,
    familyDynamics: teenProfile.familyDynamics ?? userData.familyDynamics,
    supportNeeds: teenProfile.supportNeeds ?? userData.supportNeeds
  };

  localStorage.setItem('beta_user', JSON.stringify(updatedUserData));
}

/**
 * Get age-appropriate greeting
 */
export function getAgeAppropriateGreeting(age?: number): string {
  if (!age) return 'Welcome';

  if (age >= 13 && age <= 18) {
    return 'Hey there';
  } else if (age >= 19 && age <= 25) {
    return 'Hello';
  } else {
    return 'Welcome';
  }
}
