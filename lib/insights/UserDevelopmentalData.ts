/**
 * User Developmental Data Aggregator
 * Pulls from multiple sources: fascia tracking, journal, practices, breakthroughs
 */

import { FascialHealthStorage, getCyclePhase } from '@/lib/biometrics/FascialHealthTracker';
import { calculateElementalCoherence } from '@/lib/biometrics/ElementalCoherenceCalculator';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UserDevelopmentalSnapshot {
  userId: string;
  timestamp: Date;

  // Fascia & Biometric
  fasciaHealth: {
    currentPhase: 'physical' | 'emotional' | 'quantum' | 'none';
    daysIntoPhase: number;
    totalCycleProgress: number; // 0-100%
    coherenceScore: number; // 0-100
    recentLogs: number;
  } | null;

  // Elemental Coherence
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
    overallCoherence: number;
  } | null;

  // Journal Analytics
  journalActivity: {
    totalEntries: number;
    entriesLast7Days: number;
    entriesLast30Days: number;
    avgSentiment: number; // -1 to 1
    themes: string[];
    depthScore: number; // 0-100
  } | null;

  // Practice Tracking
  practices: {
    currentStreak: number;
    longestStreak: number;
    totalSessions: number;
    last7Days: number;
    last30Days: number;
    consistencyScore: number; // 0-100
    favoritesPractices: string[];
  } | null;

  // Breakthroughs
  breakthroughs: {
    total: number;
    last30Days: number;
    mostRecent: {
      date: Date;
      type: string;
      description: string;
    } | null;
    categories: { [key: string]: number };
  } | null;
}

export interface PracticeSession {
  id: string;
  userId: string;
  timestamp: Date;
  practiceType: string;
  duration: number; // minutes
  quality: number; // 1-10
  notes?: string;
}

export interface Breakthrough {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'insight' | 'synchronicity' | 'download' | 'integration' | 'shift';
  description: string;
  context?: string;
  tags?: string[];
}

export interface JournalEntry {
  id: string;
  userId: string;
  timestamp: Date;
  content: string;
  sentiment?: number;
  themes?: string[];
  depth?: number;
}

// ============================================================================
// INDEXEDDB SETUP
// ============================================================================

const DB_NAME = 'UserDevelopmentalDB';
const DB_VERSION = 1;

const STORES = {
  PRACTICES: 'practice_sessions',
  BREAKTHROUGHS: 'breakthroughs',
  JOURNAL: 'journal_entries'
};

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Practice sessions store
      if (!db.objectStoreNames.contains(STORES.PRACTICES)) {
        const practiceStore = db.createObjectStore(STORES.PRACTICES, { keyPath: 'id' });
        practiceStore.createIndex('userId', 'userId', { unique: false });
        practiceStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Breakthroughs store
      if (!db.objectStoreNames.contains(STORES.BREAKTHROUGHS)) {
        const breakthroughStore = db.createObjectStore(STORES.BREAKTHROUGHS, { keyPath: 'id' });
        breakthroughStore.createIndex('userId', 'userId', { unique: false });
        breakthroughStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Journal entries store
      if (!db.objectStoreNames.contains(STORES.JOURNAL)) {
        const journalStore = db.createObjectStore(STORES.JOURNAL, { keyPath: 'id' });
        journalStore.createIndex('userId', 'userId', { unique: false });
        journalStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// ============================================================================
// DATA ACCESS FUNCTIONS
// ============================================================================

/**
 * Get all practice sessions for a user
 */
export async function getPracticeSessions(userId: string, days: number = 30): Promise<PracticeSession[]> {
  const db = await openDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PRACTICES], 'readonly');
    const store = transaction.objectStore(STORES.PRACTICES);
    const index = store.index('userId');
    const request = index.getAll(userId);

    request.onsuccess = () => {
      const sessions = request.result.filter((s: PracticeSession) =>
        new Date(s.timestamp) >= cutoff
      );
      resolve(sessions);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Log a practice session
 */
export async function logPracticeSession(session: Omit<PracticeSession, 'id'>): Promise<void> {
  const db = await openDB();
  const id = `practice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PRACTICES], 'readwrite');
    const store = transaction.objectStore(STORES.PRACTICES);
    const request = store.add({ ...session, id });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all breakthroughs for a user
 */
export async function getBreakthroughs(userId: string, days: number = 30): Promise<Breakthrough[]> {
  const db = await openDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.BREAKTHROUGHS], 'readonly');
    const store = transaction.objectStore(STORES.BREAKTHROUGHS);
    const index = store.index('userId');
    const request = index.getAll(userId);

    request.onsuccess = () => {
      const breakthroughs = request.result.filter((b: Breakthrough) =>
        new Date(b.timestamp) >= cutoff
      );
      resolve(breakthroughs);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Log a breakthrough moment
 */
export async function logBreakthrough(breakthrough: Omit<Breakthrough, 'id'>): Promise<void> {
  const db = await openDB();
  const id = `breakthrough_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.BREAKTHROUGHS], 'readwrite');
    const store = transaction.objectStore(STORES.BREAKTHROUGHS);
    const request = store.add({ ...breakthrough, id });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get journal entries for a user
 */
export async function getJournalEntries(userId: string, days: number = 30): Promise<JournalEntry[]> {
  const db = await openDB();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.JOURNAL], 'readonly');
    const store = transaction.objectStore(STORES.JOURNAL);
    const index = store.index('userId');
    const request = index.getAll(userId);

    request.onsuccess = () => {
      const entries = request.result.filter((e: JournalEntry) =>
        new Date(e.timestamp) >= cutoff
      );
      resolve(entries);
    };
    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// ANALYTICS & AGGREGATION
// ============================================================================

/**
 * Calculate practice streak
 */
function calculatePracticeStreak(sessions: PracticeSession[]): { current: number; longest: number } {
  if (sessions.length === 0) return { current: 0, longest: 0 };

  // Sort by date descending
  const sorted = [...sessions].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let currentRun = 0;
  let lastDate: Date | null = null;

  for (const session of sorted) {
    const sessionDate = new Date(session.timestamp);
    sessionDate.setHours(0, 0, 0, 0);

    if (!lastDate) {
      currentRun = 1;
      currentStreak = 1;
    } else {
      const dayDiff = Math.floor((lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        currentRun++;
        if (currentStreak === currentRun - 1) {
          currentStreak++;
        }
      } else if (dayDiff > 1) {
        currentRun = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentRun);
    lastDate = sessionDate;
  }

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Analyze journal sentiment with consciousness-aware keywords
 */
function analyzeJournalSentiment(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  // Expansion words (positive consciousness development)
  const expansionWords = [
    'grateful', 'gratitude', 'joy', 'joyful', 'love', 'loving',
    'breakthrough', 'clarity', 'clear', 'peace', 'peaceful',
    'insight', 'insightful', 'growth', 'growing', 'integration',
    'coherence', 'aligned', 'flow', 'flowing', 'presence', 'present',
    'awareness', 'aware', 'awake', 'awakening', 'expansion', 'opening',
    'trust', 'trusting', 'surrender', 'ease', 'grace', 'beautiful'
  ];

  // Contraction words (challenging but growth-inducing)
  const contractionWords = [
    'struggle', 'struggling', 'pain', 'painful', 'difficult', 'hard',
    'stuck', 'stagnant', 'confused', 'confusion', 'frustrated', 'frustration',
    'lost', 'fear', 'afraid', 'anxious', 'anxiety', 'resistance',
    'tight', 'constricted', 'overwhelmed', 'disconnect', 'fragmented'
  ];

  let totalSentiment = 0;
  entries.forEach(entry => {
    const content = entry.content.toLowerCase();
    let score = 0;

    // Count expansion indicators
    expansionWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) score += matches.length * 0.1;
    });

    // Count contraction indicators
    contractionWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) score -= matches.length * 0.1;
    });

    totalSentiment += Math.max(-1, Math.min(1, score));
  });

  return totalSentiment / entries.length;
}

/**
 * Extract themes from journal entries
 */
function extractJournalThemes(entries: JournalEntry[]): string[] {
  if (entries.length === 0) return [];

  const themeKeywords = {
    'Shadow Work': ['shadow', 'unconscious', 'repressed', 'trauma', 'wound', 'healing', 'integrate', 'fragmented'],
    'Relationships': ['relationship', 'partner', 'family', 'friend', 'connection', 'intimacy', 'love', 'conflict'],
    'Purpose & Vision': ['purpose', 'vision', 'calling', 'mission', 'service', 'contribution', 'path', 'direction'],
    'Spiritual Practice': ['meditation', 'prayer', 'ritual', 'ceremony', 'practice', 'devotion', 'sacred', 'divine'],
    'Embodiment': ['body', 'breath', 'sensation', 'somatic', 'physical', 'embodied', 'grounded', 'present'],
    'Creative Expression': ['create', 'creative', 'art', 'music', 'write', 'express', 'inspiration', 'beauty'],
    'Synchronicity': ['synchronicity', 'coincidence', 'sign', 'guidance', 'miracle', 'magic', 'flow'],
    'Integration': ['integration', 'wholeness', 'coherence', 'alignment', 'balance', 'harmony', 'unity'],
    'Breakthrough': ['breakthrough', 'insight', 'realization', 'awakening', 'shift', 'transformation', 'clarity'],
    'Surrender': ['surrender', 'let go', 'release', 'acceptance', 'allowing', 'trust', 'faith']
  };

  const themeCounts: { [key: string]: number } = {};

  // Count theme occurrences
  entries.forEach(entry => {
    const content = entry.content.toLowerCase();

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        }
      });
    });
  });

  // Return themes sorted by frequency (top 5)
  return Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);
}

/**
 * Calculate journal depth score
 * Higher score = more contemplative, less surface-level
 */
function calculateJournalDepth(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;

  let totalDepth = 0;

  entries.forEach(entry => {
    const content = entry.content;
    let depthScore = 0;

    // Word count (longer entries generally more contemplative)
    const wordCount = content.split(/\s+/).length;
    if (wordCount > 200) depthScore += 30;
    else if (wordCount > 100) depthScore += 20;
    else if (wordCount > 50) depthScore += 10;

    // Depth indicators
    const depthWords = [
      'realize', 'understand', 'discover', 'recognize', 'notice',
      'feeling', 'sensation', 'awareness', 'consciousness',
      'pattern', 'belief', 'fear', 'desire', 'need',
      'why', 'because', 'meaning', 'purpose', 'deeper'
    ];

    const contentLower = content.toLowerCase();
    depthWords.forEach(word => {
      if (contentLower.includes(word)) depthScore += 5;
    });

    // Question marks indicate inquiry
    const questionCount = (content.match(/\?/g) || []).length;
    depthScore += questionCount * 3;

    // First-person reflection
    const reflectionCount = (contentLower.match(/\b(i feel|i notice|i realize|i'm becoming|i see)\b/g) || []).length;
    depthScore += reflectionCount * 5;

    totalDepth += Math.min(100, depthScore);
  });

  return totalDepth / entries.length;
}

/**
 * Calculate favorite practices (most frequent practice types)
 */
function calculateFavoritePractices(sessions: PracticeSession[]): string[] {
  if (sessions.length === 0) return [];

  const practiceCount: { [key: string]: number } = {};

  sessions.forEach(session => {
    practiceCount[session.practiceType] = (practiceCount[session.practiceType] || 0) + 1;
  });

  return Object.entries(practiceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([practice]) => practice);
}

/**
 * Get user developmental snapshot
 */
export async function getUserDevelopmentalSnapshot(userId: string): Promise<UserDevelopmentalSnapshot> {
  try {
    // Initialize fascia storage
    const fasciaStorage = new FascialHealthStorage();
    await fasciaStorage.init().catch(() => {});

    // Fetch all data sources in parallel
    const [practices30, breakthroughs30, journal30, fasciaAssessments] = await Promise.all([
      getPracticeSessions(userId, 30),
      getBreakthroughs(userId, 30),
      getJournalEntries(userId, 30),
      fasciaStorage.getAssessments(userId, 30).catch(() => [])
    ]);

    // Get latest fascia assessment for elemental calculation
    const latestFascia = fasciaAssessments.length > 0 ? fasciaAssessments[0] : null;

    // Calculate elemental coherence (simplified - no health data integration for now)
    const elementalData = latestFascia
      ? calculateElementalCoherence(null, latestFascia)
      : null;

    const practices7 = practices30.filter(p => {
      const daysDiff = (Date.now() - new Date(p.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    const journal7 = journal30.filter(e => {
      const daysDiff = (Date.now() - new Date(e.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    // Calculate practice streak
    const streak = calculatePracticeStreak(practices30);

    // Analyze journal
    const avgSentiment = analyzeJournalSentiment(journal30);
    const journalThemes = extractJournalThemes(journal30);
    const journalDepth = calculateJournalDepth(journal30);

    // Breakthrough categories
    const breakthroughCategories: { [key: string]: number } = {};
    breakthroughs30.forEach(b => {
      breakthroughCategories[b.type] = (breakthroughCategories[b.type] || 0) + 1;
    });

    const mostRecentBreakthrough = breakthroughs30.length > 0
      ? breakthroughs30.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      : null;

    return {
      userId,
      timestamp: new Date(),

      fasciaHealth: latestFascia ? {
        currentPhase: latestFascia.cycleDay ? getCyclePhase(latestFascia.cycleDay) : 'none',
        daysIntoPhase: latestFascia.cycleDay ? latestFascia.cycleDay % 30 : 0,
        totalCycleProgress: latestFascia.cycleDay ? (latestFascia.cycleDay / 90) * 100 : 0,
        coherenceScore: elementalData?.overallCoherence || 0,
        recentLogs: fasciaAssessments.length
      } : null,

      elementalBalance: elementalData ? {
        fire: elementalData.fire,
        water: elementalData.water,
        earth: elementalData.earth,
        air: elementalData.air,
        aether: elementalData.aether,
        overallCoherence: elementalData.overallCoherence
      } : null,

      journalActivity: {
        totalEntries: journal30.length,
        entriesLast7Days: journal7.length,
        entriesLast30Days: journal30.length,
        avgSentiment,
        themes: journalThemes,
        depthScore: journalDepth
      },

      practices: {
        currentStreak: streak.current,
        longestStreak: streak.longest,
        totalSessions: practices30.length,
        last7Days: practices7.length,
        last30Days: practices30.length,
        consistencyScore: (practices30.length / 30) * 100,
        favoritesPractices: calculateFavoritePractices(practices30)
      },

      breakthroughs: {
        total: breakthroughs30.length,
        last30Days: breakthroughs30.length,
        mostRecent: mostRecentBreakthrough ? {
          date: new Date(mostRecentBreakthrough.timestamp),
          type: mostRecentBreakthrough.type,
          description: mostRecentBreakthrough.description
        } : null,
        categories: breakthroughCategories
      }
    };

  } catch (error) {
    console.error('[UserDevelopmentalData] Error getting snapshot:', error);
    throw error;
  }
}
