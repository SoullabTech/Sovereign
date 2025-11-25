/**
 * Teen Profile Utils - STUB (Implementation pending)
 * Utility functions for teen profile management
 */

export interface UserData {
  userId?: string;
  birthDate?: string;
  age?: number;
  pronouns?: string;
}

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function getUserData(): UserData {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem('userData');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error getting user data:', error);
  }

  return {};
}
