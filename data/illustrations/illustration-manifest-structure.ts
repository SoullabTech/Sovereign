/**
 * Illustration Manifest Structure
 * For Elemental Alchemy Reader Integration
 */

// Types for illustration system
export interface ChapterThreshold {
  id: string;
  chapter: string;
  title: string;
  imagePath: string;
  altText: string;
  element: ElementType;
  mood: string;
}

export interface Vignette {
  id: string;
  chapter: string;
  segmentStart: number;
  segmentEnd: number;
  imagePath: string;
  altText: string;
  element: ElementType;
  mood: string;
  placement: 'before-segment' | 'after-segment' | 'inline' | 'drawer';
}

export type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'neutral' | 'all';

export interface IllustrationManifest {
  bookId: string;
  version: string;
  styleProfile: string;
  thresholds: ChapterThreshold[];
  vignettes: Vignette[];
}

// Example manifest data
export const illustrationManifest: IllustrationManifest = {
  bookId: 'elemental-alchemy',
  version: '1.0.0',
  styleProfile: 'modern-sacred-universal',

  thresholds: [
    {
      id: 'threshold-preface',
      chapter: 'preface',
      title: 'The Awakening Dream',
      imagePath: '/illustrations/thresholds/preface-awakening-dream.png',
      altText: 'Solitary figure at forest edge, dawn light breaking through mist with elemental spirals',
      element: 'neutral',
      mood: 'wonder, arrival, remembering'
    },
    {
      id: 'threshold-introduction',
      chapter: 'introduction',
      title: 'The Living Elements',
      imagePath: '/illustrations/thresholds/introduction-living-elements.png',
      altText: 'Five streams of elemental light converging into central spiral',
      element: 'all',
      mood: 'integration, wholeness, invitation'
    },
    {
      id: 'threshold-ch01',
      chapter: 'ch01',
      title: 'The First Step',
      imagePath: '/illustrations/thresholds/ch01-first-step.png',
      altText: 'Path of light emerging from darkness toward dawn horizon, figure at beginning',
      element: 'neutral',
      mood: 'courage, beginning, calling'
    },
    {
      id: 'threshold-ch02',
      chapter: 'ch02',
      title: 'The Eternal Return',
      imagePath: '/illustrations/thresholds/ch02-eternal-return.png',
      altText: 'Luminous toroidal form with light particles flowing in continuous cycle',
      element: 'aether',
      mood: 'cyclical wisdom, eternal flow'
    },
    {
      id: 'threshold-ch03',
      chapter: 'ch03',
      title: 'Three Become One',
      imagePath: '/illustrations/thresholds/ch03-three-become-one.png',
      altText: 'Three interlocking circles with luminous center where all overlap',
      element: 'neutral',
      mood: 'unity, understanding, sacred structure'
    },
    {
      id: 'threshold-ch04',
      chapter: 'ch04',
      title: 'The Elemental Wheel',
      imagePath: '/illustrations/thresholds/ch04-elemental-wheel.png',
      altText: 'Circular composition with five elemental sections flowing into each other',
      element: 'all',
      mood: 'completeness, balance'
    },
    {
      id: 'threshold-ch05',
      chapter: 'ch05',
      title: 'The Sacred Flame',
      imagePath: '/illustrations/thresholds/ch05-sacred-flame.png',
      altText: 'Abstract flame of light with human silhouette visible within',
      element: 'fire',
      mood: 'awakening, vision, spiritual knowing'
    },
    {
      id: 'threshold-ch06',
      chapter: 'ch06',
      title: 'The Depths Within',
      imagePath: '/illustrations/thresholds/ch06-depths-within.png',
      altText: 'View into deep water with silhouette descending into luminous depths',
      element: 'water',
      mood: 'depth, emotional truth, descent'
    },
    {
      id: 'threshold-ch07',
      chapter: 'ch07',
      title: 'The Rooted Self',
      imagePath: '/illustrations/thresholds/ch07-rooted-self.png',
      altText: 'Tree cross-section showing branches and vast root systems with figure grounded at base',
      element: 'earth',
      mood: 'grounding, stability, sacred medicine'
    },
    {
      id: 'threshold-ch08',
      chapter: 'ch08',
      title: 'The Expansive Mind',
      imagePath: '/illustrations/thresholds/ch08-expansive-mind.png',
      altText: 'Vast sky with thought-like cloud patterns, small meditating figure floating within',
      element: 'air',
      mood: 'clarity, expansion, cognitive freedom'
    },
    {
      id: 'threshold-ch09',
      chapter: 'ch09',
      title: 'The Infinite Self',
      imagePath: '/illustrations/thresholds/ch09-infinite-self.png',
      altText: 'Figure with arms wide open merging into field of iridescent light',
      element: 'aether',
      mood: 'unity, infinite presence, dissolution'
    },
    {
      id: 'threshold-ch10',
      chapter: 'ch10',
      title: 'The Spiral Path',
      imagePath: '/illustrations/thresholds/ch10-spiral-path.png',
      altText: 'Spiral path from above with five color zones, figure walking toward luminous center',
      element: 'all',
      mood: 'practice, embodiment, lived wisdom'
    }
  ],

  vignettes: [
    // Preface vignettes
    {
      id: 'p-01',
      chapter: 'preface',
      segmentStart: 0,
      segmentEnd: 3,
      imagePath: '/illustrations/vignettes/preface/p-01-vivid-dream.png',
      altText: 'Human silhouette surrounded by swirling elemental wisps while dreaming',
      element: 'all',
      mood: 'dream state, awakening',
      placement: 'before-segment'
    },
    {
      id: 'p-02',
      chapter: 'preface',
      segmentStart: 4,
      segmentEnd: 6,
      imagePath: '/illustrations/vignettes/preface/p-02-tent-dawn.png',
      altText: 'Two resting silhouettes in abstract interior with dawn light',
      element: 'neutral',
      mood: 'protection, threshold',
      placement: 'before-segment'
    },
    {
      id: 'p-03',
      chapter: 'preface',
      segmentStart: 7,
      segmentEnd: 9,
      imagePath: '/illustrations/vignettes/preface/p-03-i-am-elements.png',
      altText: 'Human form made entirely of flowing elemental energies',
      element: 'all',
      mood: 'elemental identity, unity',
      placement: 'inline'
    },
    {
      id: 'p-04',
      chapter: 'preface',
      segmentStart: 10,
      segmentEnd: 12,
      imagePath: '/illustrations/vignettes/preface/p-04-barefoot-dew.png',
      altText: 'Bare feet touching ground with luminous particles rising',
      element: 'earth',
      mood: 'embodiment, grounding',
      placement: 'inline'
    },
    // ... additional preface vignettes

    // Introduction vignettes
    {
      id: 'i-01',
      chapter: 'introduction',
      segmentStart: 0,
      segmentEnd: 4,
      imagePath: '/illustrations/vignettes/introduction/i-01-to-healers.png',
      altText: 'Multiple silhouettes in postures of service connected by golden light',
      element: 'neutral',
      mood: 'vocation, service',
      placement: 'before-segment'
    },
    {
      id: 'i-02',
      chapter: 'introduction',
      segmentStart: 5,
      segmentEnd: 8,
      imagePath: '/illustrations/vignettes/introduction/i-02-mystery-awe.png',
      altText: 'Single figure standing before vast luminous space',
      element: 'aether',
      mood: 'awe, humility',
      placement: 'inline'
    },
    // ... additional introduction vignettes
  ]
};

// Helper function to get threshold for chapter
export function getChapterThreshold(chapter: string): ChapterThreshold | undefined {
  return illustrationManifest.thresholds.find(t => t.chapter === chapter);
}

// Helper function to get vignettes for segment range
export function getVignettesForSegment(chapter: string, segmentIndex: number): Vignette[] {
  return illustrationManifest.vignettes.filter(
    v => v.chapter === chapter &&
         segmentIndex >= v.segmentStart &&
         segmentIndex <= v.segmentEnd
  );
}

// Helper function to get all vignettes for chapter
export function getChapterVignettes(chapter: string): Vignette[] {
  return illustrationManifest.vignettes.filter(v => v.chapter === chapter);
}

// Element color map for UI
export const elementColors: Record<ElementType, { primary: string; accent: string }> = {
  fire: { primary: '#D97706', accent: '#FBBF24' },
  water: { primary: '#4F46E5', accent: '#A5B4FC' },
  earth: { primary: '#78716C', accent: '#84CC16' },
  air: { primary: '#0EA5E9', accent: '#F8FAFC' },
  aether: { primary: '#6366F1', accent: '#E0E7FF' },
  neutral: { primary: '#44403C', accent: '#FAFAF9' },
  all: { primary: '#8B5CF6', accent: '#DDD6FE' }
};
