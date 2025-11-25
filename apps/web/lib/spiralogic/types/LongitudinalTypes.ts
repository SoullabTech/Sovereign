// Longitudinal tracking types for Phase 2 features
// These types support weekly insights, edge panels, and pattern tracking

export interface ConversationSnapshot {
  timestamp: Date;
  dominantElement: string;
  activeFacets: string[];
  emotionalTone: number; // -1 to 1
  symbolsPresent: string[];
}

export interface ElementalDistribution {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

export interface FacetTransition {
  from: string;
  to: string;
  timestamp: Date;
  significance: number;
}

export interface ShadowPattern {
  theme: string;
  frequency: number;
  lastOccurrence: Date;
  context: string[];
}

export interface NarrativeArc {
  type: 'emergence' | 'integration' | 'dissolution' | 'transformation';
  narrative: string;
  keyMoments: Date[];
}

export interface Practice {
  title: string;
  description: string;
  element: string;
  duration: string;
}

export interface CollectiveTheme {
  pattern: string;
  prevalence: number; // percentage of users
  anonymous: true;
}

export interface SpiralPath {
  points: Array<{
    date: Date;
    element: string;
    intensity: number;
    x: number;
    y: number;
  }>;
}

export interface WeeklyInsight {
  id: string;
  userId: string;
  period: { start: Date; end: Date };
  theme: string;
  spiralJourney: SpiralPath;
  elementalBalance: ElementalDistribution;
  facetProgression: FacetTransition[];
  shadowWork: ShadowPattern[];
  growthArc: NarrativeArc;
  collectiveResonance?: CollectiveTheme;
  integrationPractice: Practice;
  rawSummary: string;
}

export interface MonthlyPattern {
  userId: string;
  month: Date;
  dominantCycle: string;
  elementalFlow: ElementalDistribution[];
  majorTransitions: FacetTransition[];
  consolidatedShadows: ShadowPattern[];
}

export interface SeasonalCycle {
  userId: string;
  season: string;
  year: number;
  overarchingTheme: string;
  elementalJourney: ElementalDistribution;
  transformationStages: NarrativeArc[];
}

export interface LongitudinalTracking {
  daily: ConversationSnapshot[];
  weekly: WeeklyInsight[];
  monthly: MonthlyPattern[];
  seasonal: SeasonalCycle[];
}

export type Edge = 'top' | 'bottom' | 'left' | 'right';

export interface EdgePanelContent {
  top: 'history' | 'timeline' | 'spiralView';
  bottom: 'experiments' | 'checkins' | 'practices';
  left: 'divination' | 'guides' | 'rituals';
  right: 'stats' | 'balance' | 'insights';
}

export interface EdgePanelState {
  activePanel: Edge | null;
  content: EdgePanelContent;
  lastUpdated: Date;
}