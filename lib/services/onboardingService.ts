'use client';

// Sovereignty mode: Onboarding service disabled (Supabase removed)

export interface OnboardingData {
  explorerId: string;
  explorerName: string;
  elementalResonance?: string;
  userIntention?: string;
  orientationFeedback?: string;
}

export async function completeOnboarding(data: OnboardingData) {
  console.log('[onboardingService] Sovereignty mode: Onboarding persistence disabled');

  // Save to localStorage for local persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('maia_onboarding_complete', 'true');
    localStorage.setItem('maia_explorer_name', data.explorerName);
    if (data.elementalResonance) {
      localStorage.setItem('maia_elemental_resonance', data.elementalResonance);
    }
  }

  return {
    success: true,
    user: {
      id: data.explorerId,
      sacred_name: data.explorerName,
      beta_onboarded_at: new Date().toISOString()
    }
  };
}

export async function getOnboardingStatus(userId: string): Promise<{ completed: boolean; data?: any }> {
  console.log('[onboardingService] Sovereignty mode: Status check from localStorage');

  if (typeof window === 'undefined') {
    return { completed: false };
  }

  const completed = localStorage.getItem('maia_onboarding_complete') === 'true';
  const explorerName = localStorage.getItem('maia_explorer_name');

  return {
    completed,
    data: completed ? { sacred_name: explorerName } : undefined
  };
}

export async function updateUserFeedback(userId: string, feedback: string) {
  console.log('[onboardingService] Sovereignty mode: Feedback storage disabled');

  if (typeof window !== 'undefined') {
    localStorage.setItem('maia_orientation_feedback', feedback);
  }

  return { success: true };
}
