/**
 * types.ts - Soul Lab Onboarding Type Definitions
 * Sacred Mirror interface types for the onboarding flow
 */

export type OnboardingStep = 0 | 1 | 2 | 3;

export type ToneStyle = 'prose' | 'poetic' | 'auto';

export interface UserPreferences {
  tone: number;        // 0-1 scale: grounded (0) to poetic (1)
  style: ToneStyle;    // Communication style preference
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  userPrefs: UserPreferences;
  isTransitioning: boolean;
}

// Component Props
export interface LogoThresholdProps {
  onNext: () => void;
}

export interface GreetingIntroProps {
  onNext: () => void;
}

export interface FourDoorsNavProps {
  onNext: () => void;
}

export interface ToneStyleSelectorProps {
  onFinish: (prefs: UserPreferences) => void;
  initialPrefs?: UserPreferences;
}

export interface OnboardingFlowProps {
  onComplete: (prefs: UserPreferences) => void;
}

// Animation variants for Framer Motion
export interface AnimationVariants {
  hidden: {
    opacity: number;
    y?: number;
    scale?: number;
  };
  visible: {
    opacity: number;
    y?: number;
    scale?: number;
    transition?: {
      duration?: number;
      ease?: string;
      staggerChildren?: number;
      delayChildren?: number;
    };
  };
  exit?: {
    opacity: number;
    y?: number;
    scale?: number;
    transition?: {
      duration?: number;
      ease?: string;
    };
  };
}

// Sacred Mirror color palette
export const SacredColors = {
  gold: '#d4af37',
  deepGold: '#b8941f',
  lightGold: '#f4e5a1',
  darkBg: '#0a0a0f',
  midBg: '#1a1a2e',
  lightBg: '#2a2a4e',
  text: '#f5f5f5',
  textMuted: '#a8a8b3',
  accent: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b'
} as const;