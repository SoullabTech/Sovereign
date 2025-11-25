/**
 * Living Soul Story API
 *
 * The bridge between UI and story weaving intelligence.
 * Handles all CRUD operations, chapter generation, revisions, and thread tracking.
 *
 * "Interactive, Iterative, Intelligent, Intuitive, Inspiring" - The 5 I's
 */

import {
  SoulStory,
  StoryChapter,
  StoryThread,
  MemberNote,
  Revision,
  TimelineEvent,
  StoryWeavingContext,
} from './types';

import {
  generateGenesisChapter,
  weaveNewChapter,
  reviseChapter,
  detectEmergingThreads,
  BirthChartData,
  SessionInsight,
} from './storyWeaver';

// ============================================================================
// STORY INITIALIZATION
// ============================================================================

/**
 * Initialize Soul Story for New Member
 *
 * Creates the foundational story structure with Genesis chapter
 */
export async function initializeSoulStory(
  userId: string,
  chartData: BirthChartData,
  userName: string
): Promise<SoulStory> {
  // Generate Genesis chapter from birth chart
  const genesisNarrative = generateGenesisChapter(chartData);

  const genesisChapter: StoryChapter = {
    id: generateId(),
    userId,
    title: 'Genesis',
    chapterNumber: 0,
    status: 'draft', // Starts as draft - member must approve
    currentDraft: genesisNarrative,
    memberNotes: [],
    revisionHistory: [],
    sourceData: {
      chartInsights: ['Birth chart synthesis'],
    },
    createdAt: new Date(),
  };

  // Detect initial thread from chart
  const initialThread: StoryThread = {
    id: generateId(),
    name: detectInitialThreadFromChart(chartData),
    description: 'Your primary archetypal journey, revealed in your birth chart',
    status: 'active',
    relatedChapters: [genesisChapter.id],
    relatedSessions: [],
    relatedJournals: [],
    chartContext: chartData,
    firstDetected: new Date(),
    lastUpdated: new Date(),
  };

  const initialEvent: TimelineEvent = {
    id: generateId(),
    date: new Date(),
    type: 'story-initialized',
    title: 'Your Story Begins',
    description: 'Genesis chapter created from birth chart',
  };

  const story: SoulStory = {
    id: generateId(),
    userId,
    title: `${userName}'s Evolutionary Journey`,
    subtitle: 'A Living Mythology Co-Authored with MAIA',
    chapters: [genesisChapter],
    activeThreads: [initialThread],
    completedThreads: [],
    timeline: [initialEvent],
    chartSummary: {
      sunSign: chartData.sun.sign,
      moonSign: chartData.moon.sign,
      risingSign: chartData.rising.sign,
      chartPattern: chartData.chartPattern,
      dominantElement: chartData.dominantElement,
      keyThemes: extractKeyThemes(chartData),
    },
    settings: {
      narrativeVoice: 'second-person', // "You" - most intimate
      archetypeDepth: 'tarnas-level', // Deep archetypal work
      autoGenerateChapters: true, // MAIA proposes when patterns emerge
      includeTransits: true, // Weave current sky into story
    },
    createdAt: new Date(),
    lastUpdated: new Date(),
  };

  // In production: await db.soulStory.create(story)
  return story;
}

function detectInitialThreadFromChart(chartData: BirthChartData): string {
  // Detect primary thread from chart pattern and focal points
  if (chartData.chartPattern === 'Bucket' && chartData.focalPlanet) {
    return `${chartData.focalPlanet} Focal Point Work`;
  }

  if (chartData.dominantElement) {
    const elementalThreads: Record<string, string> = {
      Fire: 'The Fire Path: From Experience to Expression',
      Water: 'The Water Path: From Heart to Healing',
      Earth: 'The Earth Path: From Vision to Manifestation',
      Air: 'The Air Path: From Pattern to Purpose',
    };
    return elementalThreads[chartData.dominantElement];
  }

  return 'Finding Your Unique Path';
}

function extractKeyThemes(chartData: BirthChartData): string[] {
  const themes: string[] = [];

  if (chartData.chartPattern === 'Bucket') {
    themes.push('Focused Specialization', 'Pouring Energy Through Singular Purpose');
  }

  if (chartData.dominantElement === 'Fire') {
    themes.push('Active Transformation', 'Learning Through Experience');
  } else if (chartData.dominantElement === 'Water') {
    themes.push('Emotional Depth', 'Healing Through Feeling');
  } else if (chartData.dominantElement === 'Earth') {
    themes.push('Grounded Manifestation', 'Building What Lasts');
  } else if (chartData.dominantElement === 'Air') {
    themes.push('Pattern Recognition', 'Collective Consciousness');
  }

  if (chartData.angularPlanets && chartData.angularPlanets.length > 0) {
    themes.push('High Volume Expression', 'Public Visibility');
  }

  return themes;
}

// ============================================================================
// CHAPTER OPERATIONS
// ============================================================================

/**
 * Request New Chapter
 *
 * Member or MAIA can initiate new chapter creation
 */
export async function requestNewChapter(
  storyId: string,
  request: {
    memberRequest?: string;
    detectedPattern?: StoryThread;
    sessionIds?: string[];
    journalIds?: string[];
  }
): Promise<StoryChapter> {
  // 1. Fetch story and build context
  const story = await fetchStory(storyId); // In production: db query
  const context = await buildWeavingContext(story, request);

  // 2. Weave new chapter
  const narrative = weaveNewChapter({
    context,
    memberRequest: request.memberRequest,
    detectedPattern: request.detectedPattern,
  });

  // 3. Create chapter
  const newChapter: StoryChapter = {
    id: generateId(),
    userId: story.userId,
    title: await generateChapterTitle(narrative), // Extract from narrative or ask MAIA
    chapterNumber: story.chapters.length,
    status: 'draft',
    currentDraft: narrative,
    memberNotes: [],
    revisionHistory: [],
    sourceData: {
      sessionIds: request.sessionIds,
      journalIds: request.journalIds,
      threadIds: request.detectedPattern ? [request.detectedPattern.id] : [],
    },
    createdAt: new Date(),
  };

  // 4. Add timeline event
  const event: TimelineEvent = {
    id: generateId(),
    date: new Date(),
    type: 'chapter-created',
    title: `New Chapter: ${newChapter.title}`,
    description: request.memberRequest || 'MAIA detected an emerging pattern',
  };

  // In production:
  // await db.soulStory.update({ id: storyId, chapters: [...chapters, newChapter], timeline: [...timeline, event] })

  return newChapter;
}

/**
 * Add Member Note to Chapter
 *
 * Member provides feedback on MAIA's draft
 */
export async function addMemberNote(
  chapterId: string,
  noteText: string,
  relatedSection?: string
): Promise<MemberNote> {
  const note: MemberNote = {
    id: generateId(),
    text: noteText,
    timestamp: new Date(),
    resolved: false,
    relatedSection,
  };

  // In production: await db.chapter.update({ id: chapterId, memberNotes: [...notes, note] })

  return note;
}

/**
 * Request Chapter Revision
 *
 * MAIA revises chapter based on member feedback
 */
export async function requestRevision(chapterId: string): Promise<StoryChapter> {
  // 1. Fetch chapter
  const chapter = await fetchChapter(chapterId); // In production: db query
  const story = await fetchStoryByChapterId(chapterId);
  const context = await buildWeavingContext(story, {});

  // 2. Generate revision
  const revisedNarrative = reviseChapter({
    currentDraft: chapter.currentDraft,
    memberNotes: chapter.memberNotes,
    context,
  });

  // 3. Save as revision
  const revision: Revision = {
    id: generateId(),
    timestamp: new Date(),
    previousDraft: chapter.currentDraft,
    changes: chapter.memberNotes.map(n => n.text).join('; '),
    revisedBy: 'maia',
  };

  const updatedChapter: StoryChapter = {
    ...chapter,
    currentDraft: revisedNarrative,
    revisionHistory: [...chapter.revisionHistory, revision],
    // Mark notes as resolved
    memberNotes: chapter.memberNotes.map(n => ({ ...n, resolved: true })),
  };

  // In production: await db.chapter.update(updatedChapter)

  return updatedChapter;
}

/**
 * Approve Chapter
 *
 * Member approves MAIA's draft - chapter becomes permanent
 */
export async function approveChapter(chapterId: string): Promise<StoryChapter> {
  const chapter = await fetchChapter(chapterId);

  const approvedChapter: StoryChapter = {
    ...chapter,
    status: 'approved',
    approvedAt: new Date(),
  };

  // Add timeline event
  const event: TimelineEvent = {
    id: generateId(),
    date: new Date(),
    type: 'chapter-approved',
    title: `${chapter.title} Approved`,
    description: 'Member approved this chapter',
  };

  // In production: await db.chapter.update + timeline.push(event)

  return approvedChapter;
}

// ============================================================================
// THREAD OPERATIONS
// ============================================================================

/**
 * Detect New Threads
 *
 * Run pattern detection after new sessions/journals
 */
export async function detectNewThreads(
  storyId: string,
  recentSessions: SessionInsight[]
): Promise<StoryThread[]> {
  const story = await fetchStory(storyId);

  const newThreads = detectEmergingThreads(recentSessions, story.activeThreads);

  // In production: await db.soulStory.update({ activeThreads: [...existing, ...new] })

  return newThreads;
}

/**
 * Update Thread Status
 *
 * Mark thread as integrated/completed when work is done
 */
export async function updateThreadStatus(
  threadId: string,
  status: StoryThread['status']
): Promise<StoryThread> {
  // In production: await db.thread.update({ id: threadId, status, lastUpdated: new Date() })

  return {} as StoryThread; // Placeholder
}

// ============================================================================
// CONTEXT BUILDING
// ============================================================================

async function buildWeavingContext(
  story: SoulStory,
  request: {
    sessionIds?: string[];
    journalIds?: string[];
  }
): Promise<StoryWeavingContext> {
  // In production, fetch actual session and journal data
  const context: StoryWeavingContext = {
    chartData: story.chartSummary as any, // Would be full chart data
    recentSessions: [], // Fetch from db
    journalEntries: [], // Fetch from db
    activeThreads: story.activeThreads,
    completedThreads: story.completedThreads,
    approvedChapters: story.chapters.filter(c => c.status === 'approved'),
  };

  return context;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function generateChapterTitle(narrative: string): Promise<string> {
  // Extract first line or use Claude to suggest title
  // For now, placeholder
  return 'Untitled Chapter';
}

// Placeholder fetch functions (in production, these would be db queries)
async function fetchStory(storyId: string): Promise<SoulStory> {
  return {} as SoulStory;
}

async function fetchChapter(chapterId: string): Promise<StoryChapter> {
  return {} as StoryChapter;
}

async function fetchStoryByChapterId(chapterId: string): Promise<SoulStory> {
  return {} as SoulStory;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const StoryAPI = {
  // Story lifecycle
  initializeSoulStory,

  // Chapter operations
  requestNewChapter,
  addMemberNote,
  requestRevision,
  approveChapter,

  // Thread operations
  detectNewThreads,
  updateThreadStatus,
};
