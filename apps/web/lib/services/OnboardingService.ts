// Onboarding Service - Handles user onboarding and initial setup
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional: boolean;
  order: number;
}

export interface OnboardingProfile {
  userId: string;
  currentStep: number;
  completedSteps: string[];
  preferences: {
    communicationStyle?: 'formal' | 'casual' | 'mystical';
    sessionLength?: 'short' | 'medium' | 'extended';
    focusAreas?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
  personalInfo?: {
    name?: string;
    birthDate?: string;
    timeZone?: string;
    interests?: string[];
  };
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingResponse {
  success: boolean;
  profile?: OnboardingProfile;
  nextStep?: OnboardingStep;
  recommendations?: string[];
  error?: string;
}

export class OnboardingService {
  private profiles: Map<string, OnboardingProfile> = new Map();
  private steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Sacred Oracle',
      description: 'Learn about your spiritual journey companion',
      completed: false,
      optional: false,
      order: 1
    },
    {
      id: 'preferences',
      title: 'Set Your Preferences',
      description: 'Customize how you want to interact with your Oracle',
      completed: false,
      optional: false,
      order: 2
    },
    {
      id: 'profile',
      title: 'Create Your Profile',
      description: 'Tell us about yourself to personalize your experience',
      completed: false,
      optional: true,
      order: 3
    },
    {
      id: 'first_consultation',
      title: 'First Oracle Consultation',
      description: 'Experience your first guided session',
      completed: false,
      optional: false,
      order: 4
    },
    {
      id: 'setup_practices',
      title: 'Choose Your Practices',
      description: 'Select spiritual practices that resonate with you',
      completed: false,
      optional: true,
      order: 5
    }
  ];

  async initializeOnboarding(userId: string): Promise<OnboardingResponse> {
    try {
      const existingProfile = this.profiles.get(userId);
      
      if (existingProfile) {
        return {
          success: true,
          profile: existingProfile,
          nextStep: this.getNextStep(existingProfile)
        };
      }

      const newProfile: OnboardingProfile = {
        userId,
        currentStep: 0,
        completedSteps: [],
        preferences: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.profiles.set(userId, newProfile);

      return {
        success: true,
        profile: newProfile,
        nextStep: this.steps[0],
        recommendations: [
          "Take your time with each step",
          "Answer honestly for the best experience",
          "You can always update your preferences later"
        ]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize onboarding'
      };
    }
  }

  async completeStep(userId: string, stepId: string, data?: any): Promise<OnboardingResponse> {
    try {
      const profile = this.profiles.get(userId);
      
      if (!profile) {
        return {
          success: false,
          error: 'Onboarding profile not found'
        };
      }

      const step = this.steps.find(s => s.id === stepId);
      if (!step) {
        return {
          success: false,
          error: 'Invalid step ID'
        };
      }

      // Update profile with step completion
      if (!profile.completedSteps.includes(stepId)) {
        profile.completedSteps.push(stepId);
      }

      // Handle step-specific data
      await this.processStepData(profile, stepId, data);

      // Update current step
      profile.currentStep = Math.max(profile.currentStep, step.order);
      profile.updatedAt = new Date().toISOString();

      // Check if onboarding is complete
      const requiredSteps = this.steps.filter(s => !s.optional);
      const completedRequiredSteps = requiredSteps.filter(s => 
        profile.completedSteps.includes(s.id)
      );

      if (completedRequiredSteps.length === requiredSteps.length) {
        profile.completedAt = new Date().toISOString();
      }

      this.profiles.set(userId, profile);

      return {
        success: true,
        profile,
        nextStep: this.getNextStep(profile),
        recommendations: this.generateRecommendations(profile)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete step'
      };
    }
  }

  async updatePreferences(userId: string, preferences: Partial<OnboardingProfile['preferences']>): Promise<OnboardingResponse> {
    try {
      const profile = this.profiles.get(userId);
      
      if (!profile) {
        return {
          success: false,
          error: 'Onboarding profile not found'
        };
      }

      profile.preferences = {
        ...profile.preferences,
        ...preferences
      };
      profile.updatedAt = new Date().toISOString();

      this.profiles.set(userId, profile);

      return {
        success: true,
        profile,
        recommendations: this.generateRecommendations(profile)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences'
      };
    }
  }

  async getOnboardingStatus(userId: string): Promise<OnboardingResponse> {
    try {
      const profile = this.profiles.get(userId);
      
      if (!profile) {
        return await this.initializeOnboarding(userId);
      }

      return {
        success: true,
        profile,
        nextStep: this.getNextStep(profile),
        recommendations: this.generateRecommendations(profile)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get onboarding status'
      };
    }
  }

  async getAllSteps(): Promise<OnboardingStep[]> {
    return [...this.steps];
  }

  async resetOnboarding(userId: string): Promise<OnboardingResponse> {
    try {
      this.profiles.delete(userId);
      return await this.initializeOnboarding(userId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset onboarding'
      };
    }
  }

  // Private helper methods

  private getNextStep(profile: OnboardingProfile): OnboardingStep | undefined {
    if (profile.completedAt) {
      return undefined; // Onboarding complete
    }

    // Find the next incomplete step
    return this.steps
      .filter(step => !profile.completedSteps.includes(step.id))
      .sort((a, b) => a.order - b.order)[0];
  }

  private async processStepData(profile: OnboardingProfile, stepId: string, data: any): Promise<void> {
    switch (stepId) {
      case 'preferences':
        if (data) {
          profile.preferences = {
            ...profile.preferences,
            ...data
          };
        }
        break;

      case 'profile':
        if (data) {
          profile.personalInfo = {
            ...profile.personalInfo,
            ...data
          };
        }
        break;

      case 'first_consultation':
        // Could store first consultation results
        break;

      case 'setup_practices':
        if (data?.practices) {
          profile.preferences.focusAreas = data.practices;
        }
        break;

      default:
        // No special processing needed
        break;
    }
  }

  private generateRecommendations(profile: OnboardingProfile): string[] {
    const recommendations: string[] = [];

    if (!profile.completedAt) {
      recommendations.push("Complete your onboarding for a personalized experience");
    }

    if (!profile.preferences.communicationStyle) {
      recommendations.push("Set your communication preferences to tailor responses");
    }

    if (!profile.preferences.focusAreas?.length) {
      recommendations.push("Select focus areas to receive relevant guidance");
    }

    if (profile.preferences.experienceLevel === 'beginner') {
      recommendations.push("Start with short sessions to build your practice");
    }

    if (!recommendations.length) {
      recommendations.push("You're all set! Begin your spiritual journey with confidence");
    }

    return recommendations;
  }

  // Utility methods

  getCompletionPercentage(profile: OnboardingProfile): number {
    const totalSteps = this.steps.length;
    const completedSteps = profile.completedSteps.length;
    return Math.round((completedSteps / totalSteps) * 100);
  }

  isOnboardingComplete(profile: OnboardingProfile): boolean {
    return !!profile.completedAt;
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService();

// Default export
export default OnboardingService;