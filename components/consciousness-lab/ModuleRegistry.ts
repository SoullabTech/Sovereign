/**
 * Module Registry - Central mapping for disposable pixel components
 */

import { WelcomePioneerBanner } from './WelcomePioneerBanner';
import { ConsciousnessComputingPanel } from './ConsciousnessComputingPanel';
import { ReflectionJournal } from './ReflectionJournal';

// Core module registry for the consciousness computing lab
export const MODULE_REGISTRY = {
  WelcomePioneerBanner,
  ConsciousnessComputingPanel,
  ReflectionJournal,
} as const;

// Type definitions for module configuration
export interface ExperienceModuleConfig {
  id: keyof typeof MODULE_REGISTRY;
  region: 'top' | 'center' | 'bottom' | 'sidebar';
  priority: number;
  props: Record<string, any>;
}

export interface ExperienceConfig {
  modules: ExperienceModuleConfig[];
  theme?: {
    elemental?: string[];
    mode?: 'light' | 'dark' | 'sacred';
  };
}

// Default lab configuration for when no backend response exists
export function getDefaultLabModules(): ExperienceModuleConfig[] {
  return [
    {
      id: 'WelcomePioneerBanner',
      region: 'top',
      priority: 100,
      props: {
        badgeLabel: "Consciousness Computing Pioneer",
        showCommunityCommonsBranding: true,
        pioneerLevel: "Beta Tester"
      }
    },
    {
      id: 'ConsciousnessComputingPanel',
      region: 'center',
      priority: 90,
      props: {
        showAwarenessLevel: false, // No awareness data yet
        showSuggestions: false
      }
    },
    {
      id: 'ReflectionJournal',
      region: 'bottom',
      priority: 80,
      props: {
        prompt: "What brings you to consciousness computing today?",
        placeholder: "Share what's present for you... What are you curious about or working with?"
      }
    }
  ];
}

// Helper to validate module configuration
export function validateModuleConfig(config: ExperienceModuleConfig): boolean {
  return config.id in MODULE_REGISTRY &&
         typeof config.priority === 'number' &&
         ['top', 'center', 'bottom', 'sidebar'].includes(config.region);
}

export type ModuleId = keyof typeof MODULE_REGISTRY;