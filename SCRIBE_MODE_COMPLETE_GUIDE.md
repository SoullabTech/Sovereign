# Scribe Mode: Complete User Guide

**Date:** 2025-12-17
**Status:** ✅ IMPLEMENTATION COMPLETE - Ready for Frontend Integration

---

## Overview

MAIA's Scribe mode provides **two powerful capabilities** for therapists, healers, and clients:

1. **During-Session Interaction** ✅ ALREADY WORKS
2. **Post-Session Review** ✅ NEWLY IMPLEMENTED

---

## Part 1: During-Session Interaction

### What It Is

While in an active Scribe session, therapists or clients can **type questions to MAIA** and receive insights based on the ongoing session context.

### Key Use Cases

#### Use Case 1: Tarot Reading Interpretation

**Scenario:** Therapist does tarot reading for client during session

**How It Works:**
```
[Session in progress for 20 minutes, client has been discussing work anxiety]

Therapist types into MAIA:
"I just pulled three tarot cards for the client:
- Past: Ten of Swords (defeat, hitting rock bottom)
- Present: The Moon (illusion, uncertainty, hidden fears)
- Future: The Star (hope, renewal, healing)

Can you interpret this reading based on what we've discussed so far?"

MAIA responds:
"Given that [client name] has been describing feeling 'trapped' in perfectionism
(mentioned 4 times so far) and experiencing anxiety about the work presentation,
this tarot spread shows a powerful arc:

**Ten of Swords (Past):** The 'rock bottom' aligns with what they described
about the failed project last year. They said 'I felt like a complete failure.'
This was their dark night - all the swords of self-criticism penetrating at once.

**The Moon (Present):** The current anxiety isn't about the presentation itself -
it's about the hidden fear underneath. Notice how when you asked 'What's the worst
that could happen?', they went silent for 8 seconds (Turn 12). The Moon suggests
they're not seeing clearly yet what they're truly afraid of. There's illusion here -
possibly that their worth = their performance.

**The Star (Future):** This is the healing available. The Star comes after The Tower
in the major arcana - after the complete breakdown, there's renewal. For them, this
could mean releasing the perfectionism pattern and discovering they're okay even
when imperfect. The 'hope' isn't in avoiding failure, but in surviving it and
remaining whole.

**Elemental Note:** The session started at 60% Water (emotional overwhelm), has
decreased to 45% now. The Star card is Water element - suggesting emotional healing
through vulnerability, not through achieving perfection.

**Suggested Exploration:** Ask them: 'What would it feel like to present imperfectly
and be okay?' This moves toward The Star."
```

#### Use Case 2: Client Asking for Support

**Scenario:** Client having an emotional moment during personal reflection session

**How It Works:**
```
[Client has been journaling about relationship conflict]

Client types:
"I'm feeling overwhelmed right now. I don't know if I should keep trying or walk away.
What do you see in what I've shared?"

MAIA responds:
"You're in a tender place right now. Let me reflect what I'm noticing:

You've used the word 'exhausted' three times - twice about the relationship,
once about yourself. When you described the argument, your language shifted:
'I just can't do this anymore' (Turn 8). That's different from 'I don't want to' -
it's capacity, not desire.

Earlier (Turn 3) you said: 'I love them, but I'm losing myself.' That's the core
tension, isn't it? Not whether you love them, but whether you can stay whole
while loving them.

**Elemental State Right Now:**
- Water: 65% (high emotion, grief present)
- Earth: 15% (depleted resources, ungrounded)
- Fire: 10% (very low activation - exhaustion)
- Air: 10% (mental clarity low)

**What I notice:** Your Fire is almost gone. That's not anger - it's life force.
The question might not be 'Should I leave or stay?' but 'How do I resource myself
first, so I can see clearly what's true?'

**Gentle suggestion:** Before making the big decision, what if you focused on
one small act of self-restoration today? Not deciding about the relationship,
just... one thing that brings your Earth up a bit. What would that be?"
```

#### Use Case 3: Therapist Seeking Pattern Insight

**Scenario:** Therapist notices something but wants MAIA's perspective

**How It Works:**
```
[35 minutes into therapy session]

Therapist types:
"I'm noticing the client keeps changing the subject whenever I ask about their mother.
They've done it three times now. What are you seeing?"

MAIA responds:
"Yes - strong pattern visible:

**Turn 7:** You asked 'How does your mother respond when you share your feelings?'
→ Client immediately shifted to talking about work ('Actually, speaking of feelings,
my boss...')

**Turn 14:** You gently brought it back: 'Earlier you mentioned your mother...'
→ Client: 'Oh yeah, she's fine. But you know what I've been thinking about?'
[shifted to childhood memory with father]

**Turn 22:** You tried: 'I'm curious about your relationship with your mother.'
→ Client: 'It's complicated. Hey, did I tell you what happened last week?'

**Pattern:** Not just avoidance - it's automatic redirection with energy. Each time,
they introduce a new topic with urgency, as if offering you something more
interesting instead.

**Elemental shift during mother mentions:**
- Baseline: 40% Water, 30% Fire, 20% Earth, 10% Air
- When mother mentioned: Water spikes to 65%, Earth drops to 10%
- After redirect: Returns to baseline quickly

**Hypothesis:** Talking about mother = flooding (high Water, no ground). The redirect
is a survival strategy - they're avoiding overwhelm, not hiding information.

**Suggested approach:** Instead of asking about mother, try: 'I notice whenever we
start to talk about your mother, your body shifts and you move to something else.
What happens inside when I mention her?' This names the pattern without requiring
them to talk ABOUT mother - they can talk about their RESPONSE to talking about her.
That's less flooding."
```

### How To Use During-Session Interaction

**Step 1:** Start a session in Scribe mode
**Step 2:** Have your normal conversation/session
**Step 3:** At any point, type a question or provide context to MAIA
**Step 4:** MAIA responds with insights based on the full session history so far
**Step 5:** Continue the session naturally

**Important:** MAIA has access to:
- All conversation history from the current session
- Elemental tracking (Water/Fire/Earth/Air balance)
- Cognitive level detection (Bloom's taxonomy)
- Pattern recognition (recurring words, themes, behaviors)

---

## Part 2: Post-Session Review (NEW - Just Implemented)

### What It Is

After ending a session, you can **ask MAIA questions about the completed session** and receive structured insights, summaries, or specific analyses.

### The Flow

```
1. Session happens (active conversation)
2. User clicks "End Session" button
3. MAIA auto-generates comprehensive summary (10-15 seconds)
4. User can:
   A) View the auto-generated summary
   B) Ask MAIA questions about the session
   C) Request specific formats (SOAP notes, DAP notes, etc.)
   D) Compare with previous sessions
```

### Auto-Generated Summary Includes

When you end a session, MAIA automatically generates:

1. **Synopsis** (2-3 paragraphs)
   - Overview of what happened
   - Arc of the session (beginning → middle → end)
   - Significant moments

2. **Key Themes** (3-5 items)
   - Main topics discussed
   - Using client's own language

3. **Elemental Analysis**
   - Beginning state (Water/Fire/Earth/Air percentages)
   - Ending state
   - Primary shift description
   - Recommendations for balancing

4. **Cognitive Profile**
   - Average Bloom's level (1-6 scale)
   - Trajectory (rising/stable/declining)
   - Insights about cognitive development

5. **Notable Patterns**
   - Recurring words, phrases, themes
   - Behavioral patterns
   - Cognitive patterns

6. **Progress Markers**
   - Signs of growth or breakthroughs
   - New skills demonstrated
   - Positive shifts

### Conversational Interrogation Examples

After the session ends, you can ask MAIA anything about it:

#### Example 1: Request Specific Format

```
User: "Give me a SOAP note for this session"

MAIA: "SOAP Note - Session 2025-12-17:

SUBJECTIVE:
Client reports increased anxiety about upcoming work presentation. States 'I can't
stop thinking about all the ways it could go wrong.' Sleep disrupted (waking at 3am).
Describes feeling 'trapped' in perfectionism pattern. Expressed fear of failure
(mentioned 7 times during session). Stated 'If I'm not perfect, I'm a failure.'

OBJECTIVE:
Affect: Anxious, tearful at times (Turn 12, Turn 18)
Speech: Rapid, pressured when discussing work stress
Behavior: Fidgeting noted, avoided eye contact during discussion of past failure
Mental Status: Alert, oriented x4, intact memory, no SI/HI
Breathing: Shallow during anxiety discussion, deepened after grounding exercise

ASSESSMENT:
Generalized Anxiety Disorder, moderate severity. Client showing good insight into
cognitive patterns (all-or-nothing thinking identified independently - new skill).
Progress toward treatment goals: 60% (improved from 40% last month).
Perfectionism schema remains core issue, connected to childhood experiences.
Therapeutic alliance: Strong, client expressed feeling 'heard and understood.'

PLAN:
- Continue weekly sessions
- Introduce progressive muscle relaxation for acute anxiety management
- Assign daily thought record homework (identify + challenge catastrophic thoughts)
- Explore childhood origins of perfectionism in next 2-3 sessions
- Consider medication consultation if anxiety doesn't improve in 2 weeks
- Follow-up on homework compliance at next session
- Next session: 2025-12-24, 2:00 PM"
```

#### Example 2: Ask About Patterns

```
User: "What patterns did you notice about them?"

MAIA: "Several significant patterns emerged:

**Linguistic Patterns:**
1. 'Trapped' - Used 3 times in different contexts:
   - 'Trapped in this perfectionism pattern' (Turn 6)
   - 'I feel trapped at work' (Turn 14)
   - 'Trapped between what I want and what I think I should want' (Turn 22)

   Each time they said 'trapped,' their breathing became shallow and they looked
   away to the left. This is a somatic marker - their body signaling distress.

2. 'Should' - Used 11 times total. Classic perfectionism language.
   Examples: 'I should be better at this,' 'I should have known,' 'I shouldn't
   feel this way.'

**Cognitive Patterns:**
1. All-or-nothing thinking: 'If I'm not perfect, I'm a failure' (Turn 8)
2. Catastrophizing: Immediately jumps to worst-case scenarios
3. Filtering: When you mentioned their recent success, they dismissed it ('Yeah,
   but...' - Turn 16)

**Behavioral Patterns:**
1. Avoidance: Changes subject when discussing childhood (similar to last session)
2. Self-interruption: Starts to express a feeling, then says 'Never mind' or 'It's
   not that bad' (happened 4 times)

**Energetic/Elemental Pattern:**
- Baseline: 40% Water, 30% Fire, 20% Earth, 10% Air
- When discussing failure: Water spikes to 70%, Earth drops to 5% (overwhelm + ungrounded)
- After grounding exercise: Water to 35%, Earth to 30% (regulation improving)

**Developmental Observation:**
NEW THIS SESSION: They caught themselves catastrophizing mid-sentence and said
'Wait, I'm doing the thing we talked about, aren't I?' (Turn 19). This is
meta-cognitive awareness - a significant development. They're starting to observe
their own thought patterns in real-time."
```

#### Example 3: Compare Across Sessions

```
User: "How does this session compare to our first session three months ago?"

MAIA: "Significant progress visible:

**Emotional Regulation:**
- First session: Water 85% throughout (overwhelming emotional state, tearful
  for entire 50 minutes)
- This session: Started at 60% Water, ended at 35% (demonstrated ability to
  regulate during session)

**Cognitive Development:**
- First session: Bloom's Level 1-2 (Knowledge/Comprehension) - could describe
  feelings but not analyze them
- This session: Bloom's Level 3-4 (Application/Analysis) - independently
  identified cognitive distortion and made connections to past experiences

**Insight & Awareness:**
- First session: 'I don't know why I feel this way' (no pattern awareness)
- This session: 'I notice I'm catastrophizing again' (real-time self-observation)

**Specific Breakthroughs:**
1. First session: You asked 'Where did you learn you had to be perfect?' - they
   couldn't answer
   This session: They made the connection unprompted: 'My dad used to... oh. OH.
   That's where this comes from.' (Turn 17)

2. First session: Couldn't ground themselves (grounding exercise had minimal effect)
   This session: Grounding exercise brought Earth from 10% to 30% in 5 minutes -
   they're developing this skill

**Persistent Themes:**
- Perfectionism (present in all sessions)
- Fear of failure (present in all sessions)
- Use of word 'trapped' (now in 5 out of 7 sessions)

**Trajectory Assessment:**
Positive developmental arc. They're building:
✅ Emotional regulation skills
✅ Meta-cognitive awareness
✅ Ability to connect present patterns to past experiences
⚠️  Still early in healing the core perfectionism schema

**Recommendation for Next Phase:**
Ready for deeper schema work. Consider introducing:
- Inner child dialogue (addressing childhood origins of perfectionism)
- Parts work / IFS (the 'perfectionist part' vs. other parts)
- Cognitive restructuring with evidence logs (challenging 'perfect or failure'
  dichotomy with concrete examples of middle ground)"
```

#### Example 4: Ask for Recommendations

```
User: "Based on this session, what should I focus on next time?"

MAIA: "Based on session analysis, here are recommendations for next session:

**1. Explore Childhood Origins of Perfectionism**

They made the spontaneous connection in Turn 17: 'My dad used to check my homework
and if there was one mistake, he'd make me redo the whole thing.'

This is ripe for exploration. Questions to consider:
- 'Tell me more about those homework moments with your dad.'
- 'What did you learn about mistakes from those experiences?'
- 'What did you believe about yourself when he made you redo everything?'

They're at Bloom Level 3-4 now (analysis), ready for deeper excavation work.

**2. Continue Grounding Practice**

The somatic work is having clear impact:
- Breathing exercise brought Water from 60% → 35%
- Earth increased from 10% → 30%

Recommendation: Teach them portable grounding technique they can use at work
before the presentation. Example: 5-4-3-2-1 sensory awareness or feet-on-floor
breathing.

**3. Address the 'Trapped' Pattern**

They've used 'trapped' in 5 out of 7 sessions, always with the same somatic
marker (shallow breath, looking away). This is a core metaphor.

Next session, try: 'You've said you feel trapped several times. If that feeling
were a room you're in, what would the room look like? What would freedom look like?'

Using their metaphor to explore it can bypass cognitive defenses.

**4. Build on the Meta-Cognitive Breakthrough**

They caught themselves catastrophizing in real-time (Turn 19). This is HUGE.

Next session, celebrate this skill and strengthen it:
- 'Last week you noticed yourself catastrophizing mid-thought. How did you catch that?'
- Practice together: 'Let's pause right now - what are you thinking? Is that thought
  based on evidence or is it catastrophizing?'

Teaching them to observe their thoughts creates space between stimulus and response.

**5. Homework Assignment (If Appropriate)**

Given their increased capacity for self-observation:
- Thought record: When you notice catastrophizing this week, write down:
  1. The catastrophic thought
  2. Evidence for it
  3. Evidence against it
  4. A more balanced thought

This moves them from Level 3 (Application) toward Level 4 (Analysis).

**Don't Rush:**
- Avoid pushing into trauma work yet - they're building skills first
- Let them set the pace on childhood exploration
- Continue validating their progress (they tend to dismiss their own growth)"
```

#### Example 5: Interpret Tarot Reading (Post-Session)

```
User: "I pulled tarot cards during the session but didn't have time to fully interpret
them with the client. The spread was Past: Ten of Swords, Present: The Moon,
Future: The Star. Can you give me a deeper interpretation now that I can share
next session?"

MAIA: "Deep interpretation based on complete session context:

## The Spread: Ten of Swords → The Moon → The Star

### Ten of Swords (Past)

**Traditional meaning:** Rock bottom, betrayal, painful ending, defeat

**For this client:** This directly maps to the failed project they described (Turn 4):
'I put everything into it and it still wasn't good enough. I felt like I'd been
stabbed in the back - by myself.'

Notice: 'Stabbed in the back by myself' - the Ten of Swords is SELF-INFLICTED here.
They internalized the failure as complete annihilation of their worth. They said
'I couldn't get out of bed for three days' (Turn 6).

**The swords are:** All the self-critical thoughts:
- 'I'm not good enough'
- 'I should have known better'
- 'I let everyone down'
- 'I'm a failure'
- 'I'll never succeed'
...and five more penetrating thoughts they've carried since childhood.

**Key insight:** Ten of Swords is often about MENTAL anguish more than external
events. The project failure was the trigger, but the devastation was about their
relationship with themselves.

---

### The Moon (Present)

**Traditional meaning:** Illusion, hidden fears, uncertainty, intuition calling

**For this client:** They're not seeing clearly right now. Notice in Turn 12 when
you asked 'What's the worst that could happen with this presentation?' - they went
SILENT for 8 seconds, then said 'I don't know, I just know it will be bad.'

That silence was The Moon. They couldn't articulate the fear because it's not about
the presentation - it's about something deeper, hidden.

**What's hidden under The Moon?**
Based on session content, likely: 'If I fail, I don't exist. My worth = my performance.
Without perfection, I am nothing.'

This is the ILLUSION of The Moon: They believe their worth is conditional. The Moon
distorts reality - they can't see their inherent value separate from achievement.

**The Moon as invitation:** It's also calling them to look at what's hidden. Their
intuition KNOWS something is off (they said 'I feel like I'm chasing something I can
never catch' - Turn 18). The Moon asks: What are you running from? What's the fear
beneath the fear?

**Elemental connection:** Moon is Water element. Session started at 60% Water
(emotional overwhelm, not clarity). The Moon in Water can be: drowning in feelings,
OR diving deep to find truth. They're between these states.

---

### The Star (Future)

**Traditional meaning:** Hope, renewal, healing, spiritual insight, naked truth

**For this client:** This is the most beautiful card for them. Here's why:

**The Star comes after The Tower in major arcana:** After complete destruction, after
the dark night, there's healing. For this client, The Tower was the failed project
(Ten of Swords). They're IN The Moon's confusion now. The Star says: 'There's light
coming.'

**The Star is depicted naked:** Vulnerability, authenticity, no masks. For a
perfectionist, this is profound medicine. The Star doesn't hide imperfections - she
pours water (emotions/healing) onto the earth (grounding/embodiment) under the stars
(hope/guidance).

**For this client, The Star represents:**
1. Releasing perfectionism (the mask) and discovering they're okay underneath
2. Emotional healing through vulnerability (Water → Earth in the card's imagery,
   which mirrors the elemental shift they achieved in session: Water 60% → 35%,
   Earth 10% → 30%)
3. Hope that isn't dependent on achieving perfection, but on SURVIVING imperfection
   and remaining whole

**The Star's water pouring:** In the card, The Star pours water with one hand onto
earth, and with the other into a pool (which flows to the ocean). This is:
- Grounding emotional energy (water to earth)
- Letting emotions flow without attachment (water to water)

This is EXACTLY what they need: Take the overwhelming Water (emotion/anxiety) and
either ground it (Earth practices like somatic work) or let it flow (not holding
onto catastrophic thoughts).

---

## Synthesis for Client

**You might share next session:**

'I've been reflecting on the tarot spread from last week, and I want to share what
I'm seeing now that I've sat with it.

The Ten of Swords was that failed project - but more than that, it was all the
self-critical thoughts that came with it. You said it felt like being stabbed in
the back by yourself. That image is so powerful.

The Moon is where you are now - that feeling of uncertainty, of not quite seeing
clearly. You know something is off, but you're not sure what. I wonder if what's
hidden under The Moon is the belief that your worth depends on your performance.
That's the illusion - and The Moon is inviting you to look at what's really there.

But here's what gives me hope: The Star. That's where this is heading. The Star
comes after complete breakdown - she appears AFTER The Tower. And she's naked,
vulnerable, authentic. She pours water onto the earth - taking emotion and grounding
it, which is exactly what you did in our session when we did the breathing work.

The Star isn't about achieving perfection. She's about discovering you're okay even
when you're imperfect. She's about healing through vulnerability, not through control.

What do you think about that? Does any of this land?'

---

## Therapeutic Direction

This spread suggests:
1. **Honor the past pain** (Ten of Swords) - don't minimize the failed project's impact
2. **Illuminate what's hidden** (The Moon) - explore the core belief: 'I = my performance'
3. **Move toward authentic healing** (The Star) - practice imperfection, vulnerability,
   self-compassion

The arc is: Destruction → Confusion → Healing
They're in Confusion right now. The Star promises Healing is possible.

**Mantra for them (if appropriate):**
'I am whole even when I fail. My worth is not conditional.'"
```

---

## Part 3: Technical Implementation

### Database Schema

```sql
-- Session completion tracking
ALTER TABLE maia_sessions
  ADD COLUMN status TEXT DEFAULT 'active',
  ADD COLUMN completed_at TIMESTAMP,
  ADD COLUMN session_summary JSONB,
  ADD COLUMN elemental_final_state JSONB,
  ADD COLUMN cognitive_final_profile JSONB;
```

### API Endpoints

**POST /api/scribe/end-session**
- Marks session as completed
- Generates comprehensive summary
- Stores summary in database
- Returns summary object

**GET /api/scribe/end-session?sessionId=xxx**
- Checks session status
- Returns whether summary exists

**POST /api/scribe/review-session**
- Accepts question about completed session
- Returns MAIA's response with full session context

**GET /api/scribe/review-session?sessionId=xxx**
- Returns completed session metadata
- Used for displaying session info before review

### Services Implemented

**`/lib/scribe/sessionSummaryGenerator.ts`**
- `generateSessionSummary()` - Creates comprehensive summary
- `storeSessionSummary()` - Saves to database
- `getSessionSummary()` - Retrieves existing summary
- `getCompletedSessions()` - Lists all completed sessions for user

**`/lib/scribe/sessionReviewMode.ts`**
- `buildSessionReviewPrompt()` - Constructs prompt with full session context
- `getCompletedSessionData()` - Loads session with all metadata
- `getOrGenerateSessionSummary()` - Gets or creates summary
- `compareSessionsPrompt()` - Multi-session comparison (future)

---

## Part 4: What's Left To Build (Frontend)

### Components Needed

1. **EndSessionButton** (`components/scribe/EndSessionButton.tsx`)
   - Shows when in active Scribe session
   - Triggers end-session API call
   - Displays loading state during summary generation
   - Shows success/error messages

2. **SessionSummaryDisplay** (`components/scribe/SessionSummaryDisplay.tsx`)
   - Displays auto-generated summary
   - Shows all sections (synopsis, themes, elemental, patterns, etc.)
   - Print/PDF button
   - "Ask MAIA About This Session" button

3. **SessionReviewConversation** (`components/scribe/SessionReviewConversation.tsx`)
   - Question input field
   - Conversation history (Q&A pairs)
   - Suggested questions (quick access)
   - Clear, user-friendly layout

4. **PastSessionsList** (`components/scribe/PastSessionsList.tsx` - Future)
   - Lists all completed sessions
   - Shows date, duration, preview of themes
   - Click to enter review mode

### Integration Points

**In `OracleConversation.tsx` (or equivalent):**

```typescript
// Show "End Session" button when appropriate
{mode === 'scribe' && sessionStatus === 'active' && turnCount > 5 && (
  <EndSessionButton
    sessionId={sessionId}
    userId={userId}
    onSessionEnded={handleSessionEnded}
  />
)}

// After session ended, show summary
{sessionStatus === 'completed' && sessionSummary && (
  <SessionSummaryDisplay
    summary={sessionSummary}
    onAskQuestion={() => setShowReview(true)}
  />
)}

// Show review conversation interface
{showReview && (
  <SessionReviewConversation
    reviewedSessionId={sessionId}
    summaryData={sessionSummary}
  />
)}
```

---

## Part 5: User Experience Flow

### Flow A: Therapist Using Scribe Mode (Full Journey)

1. **Start Session**
   - Therapist selects "Scribe" mode
   - Session begins

2. **During Session (Interaction)**
   - Therapist has conversation with client
   - At 20 minutes, pulls tarot cards
   - Types into MAIA: "I pulled [cards], can you interpret based on our discussion?"
   - MAIA responds with interpretation based on session context
   - Therapist shares relevant parts with client
   - Session continues

3. **End Session**
   - Therapist clicks "End Session & Generate Summary"
   - MAIA generates comprehensive summary (10-15 seconds)
   - Summary displayed

4. **Review & Documentation**
   - Therapist reviews auto-summary
   - Clicks "Ask MAIA About This Session"
   - Asks: "Give me a SOAP note for this session"
   - MAIA generates SOAP note
   - Therapist clicks "Print / Save as PDF"
   - Adds to client file

5. **Future Sessions**
   - Can ask: "Compare this session to three weeks ago"
   - Can ask: "What patterns have emerged over the last 5 sessions?"

### Flow B: Client Using Scribe Mode for Personal Journaling

1. **Start Session**
   - Client selects "Scribe" mode for personal reflection

2. **During Session**
   - Journals about relationship conflict
   - Gets emotional, asks MAIA: "What do you see in what I've shared?"
   - MAIA offers compassionate reflection with patterns observed
   - Client feels supported, continues journaling

3. **End Session**
   - Clicks "End Session"
   - Reviews summary showing themes, patterns, progress markers

4. **Self-Reflection**
   - Asks: "What patterns did you notice about me?"
   - MAIA points out recurring 'trapped' language, somatic markers
   - Client gains insight
   - Saves conversation for future reference

---

## Part 6: Competitive Advantage

### MAIA vs. Fathom

| Feature | Fathom | MAIA Scribe |
|---------|--------|-------------|
| During-meeting interaction | ❌ No | ✅ Yes - ask questions anytime |
| Post-meeting summary | ✅ Yes (static) | ✅ Yes (conversational) |
| Custom question answering | Limited | ✅ Unlimited - full conversation |
| Elemental/energetic analysis | ❌ No | ✅ Yes - unique to MAIA |
| Pattern recognition | Basic | ✅ Deep - linguistic, somatic, cognitive |
| Clinical note generation | ❌ No | ✅ Yes - SOAP, DAP, progress notes |
| Multi-session comparison | ❌ No | ✅ Yes - developmental trajectory |
| Tarot/intuitive interpretation | ❌ No | ✅ Yes - based on session context |
| Consciousness development tracking | ❌ No | ✅ Yes - Bloom's taxonomy |

**MAIA's Unique Value:** Combines Fathom's efficiency with therapeutic/spiritual depth, PLUS conversational interrogation, PLUS during-session interaction.

---

## Part 7: Next Steps

### Immediate (This Week)
- [ ] Build frontend components (EndSessionButton, SessionSummaryDisplay, SessionReviewConversation)
- [ ] Wire into existing OracleConversation.tsx
- [ ] Test end-to-end flow
- [ ] Run database migration
- [ ] Deploy to staging

### Short-Term (Next 2 Weeks)
- [ ] Build "Past Sessions" archive page
- [ ] Add PDF export functionality
- [ ] Test with real therapist/healer users
- [ ] Iterate on summary format based on feedback
- [ ] Add suggested questions library

### Medium-Term (Next Month)
- [ ] Multi-session comparison feature
- [ ] Historical trend visualization
- [ ] Custom user interests (somatic, archetypal, attachment focus)
- [ ] Email delivery of summaries
- [ ] Sharing/supervision features (for therapists)

### Long-Term (Future)
- [ ] HIPAA compliance audit
- [ ] EHR integration (SimplePractice, TherapyNotes)
- [ ] Voice-to-text session recording
- [ ] Mobile app integration
- [ ] Group session support

---

**Status:** ✅ Backend Implementation Complete | ⏳ Frontend Components Pending
**Ready for:** Frontend development and user testing
**Estimated Frontend Time:** 8-12 hours for MVP

🎯
