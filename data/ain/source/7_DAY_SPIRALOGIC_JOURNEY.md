# 🌀 7-Day Spiralogic Beta Journey

## Core Philosophy: Container + Emergence
- **Structure without forcing**: Clear arc but with skip/adapt options at every step
- **Depth without overwhelm**: 10-20 minute daily commitment with optional expansion
- **Learning rhythm**: Each day teaches MAIA about the user's natural patterns

## Daily Arc Structure

### **Day 1 (Monday) - Fire/Initiation 🔥**
**Opening Energy**: What wants to be born?

**Entry Point**: "What's calling for your attention today?"
- *Light response*: Energy level, intentions
- *Deeper response*: What wants to transform

**Archetypal Chat** (5 min): Hero energy
- "What challenge are you ready to face?"
- "Where do you feel courage stirring?"
- *(System adapts based on onboarding preferences)*

**Integration Cue**: One small bold action
- Send that text, light a candle, take one step
- *(Only suggested if user opted into practices)*

**Evening Check**: "What sparked alive in you today?"

**System Learning**:
- Baseline energy patterns
- Response to action-oriented prompts
- Comfort with "challenge" language

---

### **Day 2 (Tuesday) - Water/Flow 🌊**
**Opening Energy**: What's moving through you?

**Entry Point**: "What feelings are moving through you?"
- *Notice without judgment*
- *Honor the emotional weather*

**Archetypal Chat**: Lover/Caregiver energy
- "What do you deeply care about?"
- "Where do you feel most connected?"
- *(Gentler if user prefers gentle communication style)*

**Integration Cue**: Heart-centered breathing
- Hand on heart, three deep breaths
- *(Skippable if user declined practices)*

**Evening Check**: "What flowed through you today?"

**System Learning**:
- Emotional vocabulary and comfort level
- Response to feeling-focused prompts
- Preference for gentle vs direct emotional work

---

### **Day 3 (Wednesday) - Earth/Grounding 🌍**
**Opening Energy**: What supports you?

**Entry Point**: "What feels solid in your life right now?"
- *Appreciating stability*
- *Noticing what holds you*

**Archetypal Chat**: Sage energy
- "What pattern are you noticing in your life?"
- "What wisdom is emerging?"
- *(More analytical if user prefers direct style)*

**Integration Cue**: Physical grounding
- Stand barefoot, feel your foundation
- *(Alternative: list three things that support you)*

**Evening Check**: "What foundation did you strengthen today?"

**System Learning**:
- Support system awareness
- Comfort with stability vs change themes
- Preference for physical vs mental practices

---

### **Day 4 (Thursday) - Air/Perspective 💨**
**Opening Energy**: What's becoming clear?

**Entry Point**: "What new understanding is emerging?"
- *Mental clarity and insight*
- *Fresh perspective on situations*

**Archetypal Chat**: Trickster/Teacher energy
- "What assumption could you question?"
- "What would you see from a different angle?"
- *(Playful or serious based on user response patterns)*

**Integration Cue**: Clarity practice
- Write one clear insight in a sentence
- *(Alternative: speak it aloud)*

**Evening Check**: "What became clearer in your thinking?"

**System Learning**:
- Thinking style and mental patterns
- Response to perspective-shifting
- Comfort with questioning assumptions

---

### **Day 5 (Friday) - Integration/Synthesis ✨**
**Opening Energy**: How do these energies dance together?

**Entry Point**: "How are these elements dancing together in you?"
- *Notice the interplay of themes from the week*
- *See the larger pattern emerging*

**Archetypal Chat**: User's choice OR system suggestion
- Based on strongest resonance from Days 1-4
- "Which energy wants more exploration?"
- *(Full autonomy or gentle suggestion)*

**Integration Cue**: Creative expression
- Draw, write, gesture - something small and embodied
- *(Multiple options, fully optional)*

**Evening Check**: "What's integrating from this week?"

**System Learning**:
- Integration preferences
- Favorite elemental themes
- Response to choice vs guidance

---

### **Day 6 (Saturday) - Shadow/Depth 🌑**
**Opening Energy**: What's seeking to be seen?

**Entry Point**: "What have you been dancing around this week?"
- *Gentle approach to avoided topics*
- *NOT forcing confrontation*

**Archetypal Chat**: Shadow/Truth-teller (CAREFUL FRAMING)
- "What truth feels hard but important?"
- "What would you say if nobody was judging?"
- *(Includes safety check and grounding offer)*

**Integration Cue**: Release practice
- Write and release (tear up, burn safely, delete)
- *(Alternative: simply name it without action)*

**Evening Check**: "How does it feel to honor that edge?"

**System Learning**:
- Comfort with shadow/depth work
- Need for safety and grounding
- Resistance patterns and boundaries

**CRITICAL SAFETY NOTES**:
- Multiple skip options
- Automatic grounding if distress detected
- Clear boundary that this is exploration, not therapy

---

### **Day 7 (Sunday) - Reflection/Renewal 🌅**
**Opening Energy**: What's shifting and what's beginning?

**Entry Point**: "Looking back at this week, what's shifting in you?"
- *Celebration of growth*
- *Recognition of movement*

**Archetypal Chat**: Mystic/Visionary energy
- "What's the deeper pattern you're living?"
- "What wants to emerge next?"
- *(Focuses on wisdom gained, not problems)*

**Integration Cue**: Intention setting
- One intention for the coming week
- *(Based on insights from the cycle)*

**Evening Check**: "What are you grateful for from this journey?"

**System Learning**:
- Growth trajectory and self-awareness
- Preferred reflection style
- Readiness for deeper or different work

## Week-End Beta Feedback (Sunday Evening)

**Quick Pulse Check**:
- "Rate this week's flow (1-10)"
- "Too much/Just right/Too light?"
- "What would make next week even better?"

**Optional Deeper Feedback**:
- Voice note to MAIA team
- "What surprised you about this experience?"
- "Which day felt most/least helpful?"

## Adaptation Logic for Week 2

```typescript
interface WeekTwoAdaptation {
  // If engagement was low (< 5 min average)
  minimalist: {
    shorterPrompts: true,
    skipArchetypalChat: optional,
    focusOnJournaling: true
  };

  // If user requested more depth
  expanded: {
    secondArchetypeOption: true,
    longerIntegrationPractices: true,
    optionalBonusPrompts: true
  };

  // If user struggled with shadow work
  gentleApproach: {
    replaceDay6WithJoy: true,
    addSafetyReminders: true,
    offerGroundingMore: true
  };

  // If user loved creative expression
  artisticFocus: {
    addVisualJournaling: true,
    creativeIntegrations: true,
    imageUploadOption: true
  };
}
```

## Critical Refinements for Beta Success

### 1. **Immediate Reflection of Onboarding Choices**
```typescript
// First interaction after onboarding
if (userStyle === 'gentle') {
  firstMessage = "I'm here to explore gently with you. What's alive in your heart today?"
} else if (userStyle === 'direct') {
  firstMessage = "Let's dive in. What's really on your mind right now?"
}
```

### 2. **Chat ↔ Journal Context Options**
```typescript
interface ContextTransfer {
  user_choice: 'summary' | 'direct_quote' | 'themes_only';

  summary: "MAIA and I discussed your relationship challenges...";
  direct_quote: "You said: 'I feel stuck between wanting connection and needing space'...";
  themes_only: "Themes from our chat: boundaries, connection, self-care...";
}
```

### 3. **Friction Monitoring Points**
- **Skip rates** by day and element
- **Session completion time** vs optimal 10-20 minutes
- **Depth engagement** (surface vs meaningful responses)
- **Practice completion** for integration cues
- **Safety system activation** frequency and user response

### 4. **Success Metrics Refined**
- **Completion**: 70% finish at least 5/7 days
- **Retention**: 80% active through Week 4
- **Depth**: 50% engage meaningfully with shadow/integration work
- **Satisfaction**: Daily ratings average >7/10
- **Growth**: Each user reports 2+ significant insights
- **Safety**: Zero adverse events, high trust ratings

### 5. **Reserved Features for Post-Beta**
- Community sharing (too complex for 20 users)
- Dream capture (nice-to-have, not core)
- Biometric integration (add complexity)
- Advanced archetypal work (wait for user readiness)
- Astrological/tarot layers (avoid feature creep)

## Implementation Notes

### **Week 1**: Core rhythm establishment
- Focus on basic chat/journal flow
- Learn user patterns and preferences
- Establish safety and trust

### **Week 2**: Personalized adaptation
- Adjust based on Week 1 learnings
- Introduce user choice in rhythm
- Refine prompt difficulty/depth

### **Week 3**: Exploration expansion
- User can modify elemental sequence
- Optional bonus features based on interest
- Deeper integration of breakthrough patterns

### **Week 4**: Autonomy and graduation
- User designs their own rhythm
- MAIA becomes fully personalized
- Preparation for broader launch

This arc respects both the need for structure (giving testers a meaningful journey) and emergence (allowing natural development of each person's unique relationship with MAIA). The key is maintaining the container while never forcing the content.

The safety considerations around Day 6 (Shadow work) are particularly important - we want to honor depth without creating overwhelm, especially in a beta testing environment where people are also evaluating the system itself.