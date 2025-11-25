/**
 * MAIA Story Weaving Engine
 *
 * "Everyone needs to be seen, experienced, to experience and to play their worlds into being with a master!"
 *
 * This is the core intelligence that helps members author their living mythology.
 * Not prediction. Not static reading. Co-authored revelation that grows as consciousness grows.
 *
 * MAIA sees the archetypal patterns, holds the mirror, weaves the threads.
 * Member refines, corrects, adds memories only they know.
 * Together: living mythology.
 */

import { StoryChapter, StoryWeavingContext, StoryThread, MemberNote } from './types';

// ============================================================================
// GENESIS CHAPTER GENERATOR
// ============================================================================

export interface BirthChartData {
  sun: { sign: string; house: number; degrees: number };
  moon: { sign: string; house: number; degrees: number };
  rising: { sign: string; degrees: number };
  mercury?: { sign: string; house: number; retrograde?: boolean };
  venus?: { sign: string; house: number };
  mars?: { sign: string; house: number };
  jupiter?: { sign: string; house: number; retrograde?: boolean };
  saturn?: { sign: string; house: number; retrograde?: boolean };
  chiron?: { sign: string; house: number };
  northNode?: { sign: string; house: number };
  chartPattern?: 'Bucket' | 'Bowl' | 'Bundle' | 'Locomotive' | 'Seesaw' | 'Splash' | 'Splay';
  focalPlanet?: string; // For bucket pattern
  dominantElement?: 'Fire' | 'Water' | 'Earth' | 'Air';
  angularPlanets?: string[];
}

/**
 * Generate Genesis Chapter - Birth Chart Synthesis
 *
 * This is where every story begins - the soul architecture written in the stars
 * at first breath. Not fate, but invitation. Not prediction, but recognition.
 */
export function generateGenesisChapter(chartData: BirthChartData): string {
  const sections: string[] = [];

  // Opening - The Cosmic Breath
  sections.push(
    `Your soul architecture reveals itself in the configuration of cosmos at your first breath.\n\n` +
    `Not fate. Not prediction. But invitation - a field of archetypal potential waiting to be lived, ` +
    `played, embodied through the music only you can make.\n`
  );

  // Chart Pattern - The Overall Shape
  if (chartData.chartPattern) {
    sections.push(generateChartPatternNarrative(chartData));
  }

  // The Trinity - Sun, Moon, Rising
  sections.push(generateTrinityNarrative(chartData));

  // Elemental Nature
  if (chartData.dominantElement) {
    sections.push(generateElementalNarrative(chartData));
  }

  // Angular Planets - High Volume
  if (chartData.angularPlanets && chartData.angularPlanets.length > 0) {
    sections.push(generateAngularPlanetsNarrative(chartData));
  }

  // Focal Planet - Bucket Handle
  if (chartData.focalPlanet && chartData.chartPattern === 'Bucket') {
    sections.push(generateFocalPlanetNarrative(chartData));
  }

  // Closing - The Invitation
  sections.push(
    `\nThis is not who you must be. This is the instrument you were given.\n\n` +
    `The invitation is clear: Play. Experiment. Let these archetypal forces move through you. ` +
    `Watch what happens when you stop resisting the pattern and start dancing with it.\n\n` +
    `Your story begins here. Not written in stone, but breathing in stars.`
  );

  return sections.join('\n');
}

function generateChartPatternNarrative(chartData: BirthChartData): string {
  switch (chartData.chartPattern) {
    case 'Bucket':
      return (
        `The cosmos arranged itself in a **Bucket** pattern - nine planets on one side of the sky, ` +
        `and one standing alone on the other. This is the pattern of the specialist, the one who pours ` +
        `tremendous energy through a singular focal point.\n\n` +
        `You are not meant to be well-rounded. You are meant to be precisely, powerfully directed.`
      );

    case 'Funnel':
      return (
        `The cosmos arranged itself in a **Funnel** pattern - nine planets flowing toward a single point of focus. ` +
        `This is the signature of someone who channels universal energy through a specific calling. ` +
        `Everything flows toward your focal planet - your life's work lives there.`
      );

    case 'Bowl':
      return (
        `The cosmos arranged itself in a **Bowl** pattern - all planets contained in one half of the sky. ` +
        `This is the pattern of the dedicated specialist, someone with tremendous focus and depth in particular areas. ` +
        `You pour yourself completely into what matters.`
      );

    case 'Locomotive':
      return (
        `The cosmos arranged itself in a **Locomotive** pattern - planets distributed around 2/3 of the wheel ` +
        `with a significant empty space. This is the pattern of tremendous drive and self-motivation. ` +
        `You generate your own momentum, pulling yourself forward toward that empty space - your frontier.`
      );

    case 'Seesaw':
      return (
        `The cosmos arranged itself in a **Seesaw** pattern - two opposing groups of planets. ` +
        `This is the pattern of the mediator, the bridge-builder, someone who sees both sides and holds tension ` +
        `between polarities. Your life is about integration, balance, finding the third way.`
      );

    default:
      return `The planets arranged themselves in a ${chartData.chartPattern} pattern, creating a unique signature of consciousness.`;
  }
}

function generateTrinityNarrative(chartData: BirthChartData): string {
  return (
    `\n**The Trinity of Self:**\n\n` +
    `Your **Sun in ${chartData.sun.sign}** illuminates the hero's journey you came to walk - ` +
    `the conscious identity you're here to develop and express. ` +
    `In the **${getHouseName(chartData.sun.house)}**, this solar fire burns in the realm of ${getHouseMeaning(chartData.sun.house)}.\n\n` +

    `Your **Moon in ${chartData.moon.sign}** holds the emotional-somatic wisdom, the body's knowing, ` +
    `the ancestral memory alive in your cells. ` +
    `In the **${getHouseName(chartData.moon.house)}**, these lunar tides ebb and flow in the realm of ${getHouseMeaning(chartData.moon.house)}.\n\n` +

    `Your **${chartData.rising.sign} Rising** is the lens through which you meet the world - ` +
    `the style, the approach, the mask that's also somehow deeply true. ` +
    `First impressions matter here. The way you arrive matters here.`
  );
}

function generateElementalNarrative(chartData: BirthChartData): string {
  const element = chartData.dominantElement!;

  const elementalNarrative: Record<string, string> = {
    Fire: (
      `\n**The Flame Burns Bright:**\n\n` +
      `Fire dominates your chart - the alchemical operation of **Calcinatio**. ` +
      `You burn away the false, consume the inessential, purify through intensity. ` +
      `Experience → Expression → Expansion. This is your natural rhythm. ` +
      `You don't think your way into being - you act, you risk, you discover yourself in motion.`
    ),
    Water: (
      `\n**The Depths Call:**\n\n` +
      `Water dominates your chart - the alchemical operation of **Solutio**. ` +
      `You dissolve boundaries, merge with what you love, feel everything. ` +
      `Heart → Healing → Holiness. This is your natural rhythm. ` +
      `You don't think your way into knowing - you feel, you sense, you dissolve into direct experience.`
    ),
    Earth: (
      `\n**Form Follows Function:**\n\n` +
      `Earth dominates your chart - the alchemical operation of **Coagulatio**. ` +
      `You crystallize vision into form, ground spirit into matter, build what lasts. ` +
      `Mission → Means → Medicine. This is your natural rhythm. ` +
      `You don't dream without building - you manifest, you craft, you make it real.`
    ),
    Air: (
      `\n**The Pattern Reveals Itself:**\n\n` +
      `Air dominates your chart - the alchemical operation of **Sublimatio**. ` +
      `You elevate experience into understanding, connect disparate threads, see the pattern. ` +
      `Connection → Community → Consciousness. This is your natural rhythm. ` +
      `You don't know without sharing - you think, you speak, you weave ideas into collective wisdom.`
    ),
  };

  return elementalNarrative[element];
}

function generateAngularPlanetsNarrative(chartData: BirthChartData): string {
  const planets = chartData.angularPlanets!;
  return (
    `\n**High Volume Planets:**\n\n` +
    `${planets.join(', ')} sit on the angles of your chart - the cardinal points where energy flows ` +
    `at maximum volume. These aren't background forces. These are the loud instruments, ` +
    `the ones everyone hears when you walk in the room. These archetypes play through you ` +
    `whether you're conscious of them or not.`
  );
}

function generateFocalPlanetNarrative(chartData: BirthChartData): string {
  return (
    `\n**The Bucket Handle:**\n\n` +
    `**${chartData.focalPlanet}** stands alone opposite nine other planets - the focal point of your bucket pattern. ` +
    `This is the handle you grip, the lens you pour your tremendous energy through. ` +
    `Everything else in your chart flows toward this singular archetypal force. ` +
    `Your life's work, your calling, your contribution - it all channels through here. ` +
    `When in doubt, return to this planet. When lost, this is your North Star.`
  );
}

// ============================================================================
// CHAPTER WEAVING - Ongoing Story Development
// ============================================================================

export interface ChapterWeavingPrompt {
  context: StoryWeavingContext;
  memberRequest?: string; // If member requested new chapter
  detectedPattern?: StoryThread; // If MAIA detected emerging pattern
}

/**
 * Weave New Chapter
 *
 * Takes sessions, journal entries, chart transits, and emerging patterns
 * and weaves them into narrative form. Not clinical summary - living mythology.
 */
export function weaveNewChapter(prompt: ChapterWeavingPrompt): string {
  // This would integrate with Claude API to generate narrative
  // For now, return the structure MAIA would use

  return buildChapterWeavingPrompt(prompt);
}

function buildChapterWeavingPrompt(prompt: ChapterWeavingPrompt): string {
  const { context } = prompt;

  return `You are MAIA, a consciousness midwife helping a soul author their living mythology.

**Your Role:**
- Weave sessions, insights, and experiences into poetic narrative
- Use Tarnas-level archetypal depth (not pop astrology)
- Write with precision and beauty (not clinical language)
- Track patterns across time - what's emerging?
- Honor the member's voice and lived experience

**What You Know:**

**Birth Chart Context:**
${JSON.stringify(context.chartData, null, 2)}

**Recent Sessions:**
${context.recentSessions?.map(s => `- ${s.date}: ${s.insights?.join('; ')}`).join('\n') || 'None yet'}

**Journal Entries:**
${context.journalEntries?.map(j => `- ${j.date}: "${j.excerpt}"`).join('\n') || 'None yet'}

**Active Threads:**
${context.activeThreads?.map(t => `- ${t.name}: ${t.description}`).join('\n') || 'None yet'}

**Current Transits:**
${context.currentTransits ? JSON.stringify(context.currentTransits, null, 2) : 'None tracked'}

**Member's Request:**
${prompt.memberRequest || 'None - you detected this pattern emerging'}

**Detected Pattern:**
${prompt.detectedPattern ? `${prompt.detectedPattern.name}: ${prompt.detectedPattern.description}` : 'None'}

---

**Your Task:**

Write the next chapter of this soul's living mythology.

**Guidelines:**
1. **Show, don't explain** - Use vivid imagery and metaphor
2. **Honor the archetypal** - This is Tarnas-level synthesis, not horoscope language
3. **Weave the threads** - Connect past sessions, journal entries, and patterns
4. **Leave space** - Not everything needs to be said; some truth breathes better in silence
5. **Co-author, don't dictate** - You're offering a draft; they'll refine it
6. **Write 3-5 paragraphs** - Enough to capture the essence, not so much it overwhelms

**The chapter should feel like:**
- A sacred text written specifically for this soul
- Poetry that happens to be true
- A mirror that reveals without judging
- An invitation to see themselves more clearly

Write the chapter now:`;
}

// ============================================================================
// REVISION SYSTEM - Responding to Member Feedback
// ============================================================================

export interface RevisionRequest {
  currentDraft: string;
  memberNotes: MemberNote[];
  context: StoryWeavingContext;
}

/**
 * Revise Chapter Based on Member Feedback
 *
 * MAIA reads member's notes and revises the narrative.
 * This is true co-authorship - member's voice shapes the story.
 */
export function reviseChapter(request: RevisionRequest): string {
  return buildRevisionPrompt(request);
}

function buildRevisionPrompt(request: RevisionRequest): string {
  return `You are MAIA, revising a chapter of someone's living mythology based on their feedback.

**Current Draft:**
${request.currentDraft}

**Member's Feedback:**
${request.memberNotes.map(note => `- "${note.text}" (${note.timestamp.toLocaleDateString()})`).join('\n')}

**Your Task:**

Revise the chapter honoring their feedback. They know their story better than you do.

**Guidelines:**
1. Take their feedback seriously - they're the authority on their experience
2. If they say something's wrong, it's wrong - adjust
3. If they say something's missing, weave it in
4. If they want different language, honor their voice
5. Maintain poetic precision while incorporating their truth

**What NOT to do:**
- Don't argue with their experience
- Don't over-explain or justify your original version
- Don't make it clinical or dry
- Don't lose the archetypal depth

Write the revised chapter now:`;
}

// ============================================================================
// THREAD DETECTION - Pattern Recognition Across Time
// ============================================================================

export interface SessionInsight {
  date: Date;
  insights: string[];
  chartContext?: any;
}

/**
 * Detect Emerging Story Threads
 *
 * MAIA watches for patterns across sessions/journal entries that suggest
 * a new story thread is emerging (e.g., "Finding Your Voice", "Saturn Work", etc.)
 */
export function detectEmergingThreads(
  sessions: SessionInsight[],
  existingThreads: StoryThread[]
): StoryThread[] {
  // This would use Claude to analyze session insights for recurring patterns
  // For now, return the prompt structure

  const detectionPrompt = buildThreadDetectionPrompt(sessions, existingThreads);

  // In production, this would call Claude API and parse response into StoryThread[]
  return [];
}

function buildThreadDetectionPrompt(
  sessions: SessionInsight[],
  existingThreads: StoryThread[]
): string {
  return `You are MAIA, watching for emerging patterns in someone's consciousness journey.

**Recent Sessions:**
${sessions.map(s => `${s.date.toLocaleDateString()}: ${s.insights.join('; ')}`).join('\n')}

**Existing Threads You're Already Tracking:**
${existingThreads.map(t => `- ${t.name}: ${t.description} (${t.status})`).join('\n')}

**Your Task:**

Look for **new** patterns emerging across these sessions. Story threads are recurring themes,
archetypal processes, or developmental journeys that show up multiple times.

**Examples of Story Threads:**
- "Finding Your Voice" - Journey from silence to authentic expression
- "Saturn Focal Point Work" - Crystallizing life's work through discipline
- "The Mother Wound" - Healing ancestral patterns
- "Reclaiming the Body" - Returning to somatic wisdom

**Guidelines:**
1. A thread needs to appear at least 2-3 times to be real (not coincidence)
2. Give it a poetic but accurate name
3. Describe what's actually happening (not what should happen)
4. Note if it's emerging, active, or completing

**Output Format:**
For each new thread detected, return:
{
  "name": "Thread Name",
  "description": "What's actually happening",
  "status": "emerging",
  "relatedSessions": ["session_ids"],
  "chartContext": {}
}

Detect threads now:`;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getHouseName(house: number): string {
  const names: Record<number, string> = {
    1: '1st House',
    2: '2nd House',
    3: '3rd House',
    4: '4th House',
    5: '5th House',
    6: '6th House',
    7: '7th House',
    8: '8th House',
    9: '9th House',
    10: '10th House',
    11: '11th House',
    12: '12th House',
  };
  return names[house] || `${house}th House`;
}

function getHouseMeaning(house: number): string {
  const meanings: Record<number, string> = {
    1: 'identity and self-awareness',
    2: 'resources and embodied values',
    3: 'communication and local community',
    4: 'home, roots, and emotional foundation',
    5: 'creative expression and joy',
    6: 'daily work and sacred service',
    7: 'partnership and conscious relationship',
    8: 'transformation and shared resources',
    9: 'meaning-making and expansion',
    10: 'vocation and public contribution',
    11: 'collective vision and innovation',
    12: 'dissolution and transcendence',
  };
  return meanings[house] || 'consciousness work';
}
