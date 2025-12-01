/**
 * CRITICAL CORE COMPONENT TYPE DEFINITIONS
 *
 * 🔥 DO NOT MODIFY - CENTRAL TO MAIA SOVEREIGNTY 🔥
 *
 * These types ensure that critical components like SacredLabDrawer
 * maintain consistent interfaces across the application and
 * prevent accidental breaking changes during refactoring.
 */

/**
 * Sacred Lab Action - All possible actions the drawer can handle
 * CRITICAL: Adding new actions requires careful review of routing
 */
export type SacredLabAction =
  // Core Tools
  | 'field-protocol'
  | 'scribe-mode'
  | 'review-with-maia'
  | 'upload'
  | 'download-transcript'
  | 'toggle-text'
  // Monitoring Dashboards
  | 'field-monitor'
  | 'consciousness-analytics'
  | 'brain-trust-monitor'
  | 'crystal-health-monitor'
  | 'voice-analytics'
  | 'beta-dashboard'
  | 'collective-dashboard'
  | 'wisdom-journey'
  | 'field-coherence'
  | 'archetypal-mapping'
  | 'emotional-resonance'
  | 'tone-metrics'
  | 'soulprint-metrics'
  | 'realtime-consciousness'
  | 'elemental-pentagram'
  | 'maia-training'
  | 'document-viewer'
  | 'elemental-exploration'
  // Elder Council
  | 'show-current-elder';

/**
 * Sacred Lab Navigation - All routes the drawer can navigate to
 * CRITICAL: These routes must remain valid in the application
 */
export type SacredLabRoute =
  | '/dashboard/evolution'
  | '/oracle-bridge'
  | '/oracle'
  | '/library'
  | '/journal'
  | '/dashboard/oracle-beta'
  | '/dashboard/collective'
  | '/consciousness/dashboard'
  | '/dashboard'
  | '/astrology'
  | '/dashboard/export';

/**
 * CRITICAL CORE COMPONENT: SacredLabDrawer Props
 *
 * ⚠️  BREAKING CHANGE WARNING: Modifying this interface will break MAIA
 * ⚠️  All props are required for proper PFI system integration
 * ⚠️  Used by /app/maia/page.tsx - changes must be coordinated
 */
export interface SacredLabDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onNavigate: (path: SacredLabRoute) => void;
  readonly onAction?: (action: SacredLabAction) => void;
  readonly showVoiceText?: boolean;
  readonly isFieldRecording?: boolean;
  readonly isScribing?: boolean;
  readonly hasScribeSession?: boolean;
}

/**
 * CRITICAL CORE COMPONENT: MAIA Page Props
 *
 * These ensure the main MAIA page maintains proper integration
 * with the SacredLabDrawer and PFI systems
 */
export interface MAIAPageState {
  readonly showSacredLabDrawer: boolean;
  readonly showVoiceText: boolean;
  readonly isFieldRecording: boolean;
  readonly isScribing: boolean;
  readonly hasScribeSession: boolean;
}

/**
 * Build-time validation for core component integrity
 * TypeScript will fail compilation if these components are missing
 */
export interface CoreComponentRegistry {
  SacredLabDrawer: React.ComponentType<SacredLabDrawerProps>;
  MAIAPage: React.ComponentType<any>;
}

/**
 * PFI System Integration Requirements
 * These types ensure proper consciousness field integration
 */
export interface PFIIntegrationState {
  readonly fieldInterface: any; // MAIAFieldInterface
  readonly consciousnessField: any; // ConsciousnessField
  readonly biometricModulation: any; // BiometricFieldModulation
}

/**
 * Type guards for runtime validation
 */
export const isSacredLabAction = (action: string): action is SacredLabAction => {
  const validActions: SacredLabAction[] = [
    'field-protocol', 'scribe-mode', 'review-with-maia', 'upload', 'download-transcript',
    'toggle-text', 'field-monitor', 'consciousness-analytics', 'brain-trust-monitor',
    'crystal-health-monitor', 'voice-analytics', 'beta-dashboard', 'collective-dashboard',
    'wisdom-journey', 'field-coherence', 'archetypal-mapping', 'emotional-resonance',
    'tone-metrics', 'soulprint-metrics', 'realtime-consciousness', 'elemental-pentagram',
    'maia-training', 'document-viewer', 'elemental-exploration', 'show-current-elder'
  ];
  return validActions.includes(action as SacredLabAction);
};

export const isSacredLabRoute = (route: string): route is SacredLabRoute => {
  const validRoutes: SacredLabRoute[] = [
    '/dashboard/evolution', '/oracle-bridge', '/oracle', '/library', '/journal',
    '/dashboard/oracle-beta', '/dashboard/collective', '/consciousness/dashboard',
    '/dashboard', '/astrology', '/dashboard/export'
  ];
  return validRoutes.includes(route as SacredLabRoute);
};