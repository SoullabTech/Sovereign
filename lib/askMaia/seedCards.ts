/**
 * Ask MAIA Seed Cards
 * 40 initial knowledge cards for the consciousness insight feed
 *
 * Distribution by Type:
 * - Daily Transmissions: 5
 * - Concept Cards: 12
 * - Practice Cards: 8
 * - Archetype Cards: 6
 * - Deep Dives: 5
 * - Contrast Cards: 4
 *
 * Distribution by Level:
 * - Personal: 25 cards
 * - Practitioner: 10 cards
 * - Pro: 5 cards
 */

import { AskMaiaCard, CardType, AccessLevel } from './types';

// Helper to create a past date (days ago from now)
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const SEED_CARDS: Omit<AskMaiaCard, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // ============================================
  // DAILY TRANSMISSIONS (5) - All Personal
  // ============================================
  {
    cardType: 'daily_transmission',
    accessLevel: 'personal',
    title: 'The Threshold Calls',
    subtitle: 'Today\'s invitation from the liminal space',
    content: `You stand at a threshold today—a place between what was and what is becoming. The threshold is not a place of weakness but of profound power. It is where transformation lives.

Notice where you feel the pull of the familiar, the comfortable. Then notice what calls from beyond that edge. The discomfort you feel is not a warning; it is an invitation.

Today's practice: When you encounter resistance, pause. Ask: "What is trying to emerge through me?" Listen not for answers but for the quality of the question itself.

The threshold knows your name. It has been waiting.`,
    source: 'MAIA Transmission',
    tags: ['threshold', 'transformation', 'liminality', 'daily'],
    readTimeMinutes: 2,
    isFeatured: true,
    isDaily: true,
    publishedAt: daysAgo(0),
  },
  {
    cardType: 'daily_transmission',
    accessLevel: 'personal',
    title: 'The Shadow\'s Gift',
    subtitle: 'What darkness offers the willing heart',
    content: `Your shadow is not your enemy. It is the guardian of gifts you have not yet been ready to receive.

Every quality you reject in yourself holds medicine. Every trait you project onto others contains seeds of your own becoming. The shadow asks only this: to be seen without judgment, to be integrated without violence.

Today, notice what irritates you in another person. This is your shadow waving. Not to shame you—but to show you where your gold is hidden.

What you deny in yourself, you cannot offer to the world.`,
    source: 'MAIA Transmission',
    tags: ['shadow work', 'integration', 'projection', 'daily'],
    readTimeMinutes: 2,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(1),
  },
  {
    cardType: 'daily_transmission',
    accessLevel: 'personal',
    title: 'Belonging to the Mystery',
    subtitle: 'When knowing is not the goal',
    content: `You do not need to understand everything. You do not need to have answers ready. The compulsion to know, to figure out, to solve—this is the mind's way of managing fear.

But life is not a problem to be solved. It is a mystery to be lived.

Today, practice belonging to what you do not understand. Let confusion be a doorway rather than a wall. When certainty retreats, curiosity can enter.

The mystery does not ask for your comprehension. It asks only for your presence.`,
    source: 'MAIA Transmission',
    tags: ['mystery', 'not-knowing', 'presence', 'surrender', 'daily'],
    readTimeMinutes: 2,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(2),
  },
  {
    cardType: 'daily_transmission',
    accessLevel: 'personal',
    title: 'The Body Remembers',
    subtitle: 'Wisdom stored in flesh and bone',
    content: `Your body is not a machine to be managed or a vessel to be transcended. It is a library of wisdom, a record of every moment you have survived.

The tension in your shoulders holds a story. The tightness in your chest has something to say. The restlessness in your legs knows where it wants to go.

Today, pause and ask your body: "What do you want me to know?" Then listen—not with your mind, but with your attention. Let sensation be language.

Your body has been speaking all along. Perhaps today, you can begin to hear.`,
    source: 'MAIA Transmission',
    tags: ['somatic', 'body wisdom', 'embodiment', 'daily'],
    readTimeMinutes: 2,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(3),
  },
  {
    cardType: 'daily_transmission',
    accessLevel: 'personal',
    title: 'Sacred Ordinary',
    subtitle: 'Finding the divine in the mundane',
    content: `The sacred is not elsewhere. It is not waiting in some future achievement, some special state, some moment of enlightenment yet to come.

The sacred is in the way morning light falls through your window. In the warmth of your hands around a cup. In the rhythm of your breath as you read these words.

Enlightenment is not about escaping ordinary life. It is about seeing ordinary life for what it truly is: a continuous miracle that we have learned to call "normal."

Today, refuse the normal. See everything as if for the first time. This is not poetic sentiment—it is the most practical mysticism.`,
    source: 'MAIA Transmission',
    tags: ['sacred ordinary', 'presence', 'mindfulness', 'daily'],
    readTimeMinutes: 2,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(4),
  },

  // ============================================
  // CONCEPT CARDS (12)
  // ============================================
  {
    cardType: 'concept',
    accessLevel: 'personal',
    title: 'The Shadow Self',
    subtitle: 'Jung\'s concept of the repressed unconscious',
    content: `The shadow, as defined by Carl Jung, represents the unconscious aspects of personality that the conscious ego does not identify with. It contains everything we have rejected, denied, or repressed—both negative traits and positive qualities we were taught to hide.

**Key Points:**

1. **Formation**: The shadow forms in childhood as we learn what is acceptable and what must be hidden to receive love and belonging.

2. **Projection**: We often see our shadow in others—what irritates us most in someone else frequently reflects our own disowned qualities.

3. **Integration**: Shadow work involves recognizing, accepting, and integrating these hidden aspects rather than continuing to deny them.

4. **The Golden Shadow**: Not all shadow content is negative. We also repress positive qualities like creativity, power, and joy when they weren't safe to express.

**Practice**: Notice your strongest reactions to others this week. Ask: "What might this reveal about parts of myself I haven't accepted?"

The goal is not to eliminate the shadow but to bring it into conscious relationship, transforming its destructive potential into creative energy.`,
    source: 'Jungian Psychology',
    tags: ['shadow', 'jung', 'unconscious', 'psychology', 'integration'],
    readTimeMinutes: 4,
    isFeatured: true,
    isDaily: false,
    publishedAt: daysAgo(5),
  },
  {
    cardType: 'concept',
    accessLevel: 'personal',
    title: 'Nervous System Regulation',
    subtitle: 'The foundation of emotional wellbeing',
    content: `Your nervous system is the master regulator of your emotional and physical state. Understanding how it works is fundamental to psychological health and personal growth.

**The Autonomic Nervous System (ANS)**

The ANS operates through two main branches:

**Sympathetic (Fight/Flight)**: Activated when you perceive threat. Increases heart rate, releases stress hormones, prepares body for action.

**Parasympathetic (Rest/Digest)**: Promotes calm, recovery, and connection. Associated with the vagus nerve.

**Polyvagal Theory** (Stephen Porges)

Adds a third state: the dorsal vagal "freeze" response when threat overwhelms our capacity to fight or flee.

**The Window of Tolerance**

Dr. Dan Siegel's concept of the optimal zone where we can experience and integrate emotions without becoming dysregulated:
- **Hyperarousal**: Anxiety, panic, hypervigilance
- **Window of Tolerance**: Calm, present, connected
- **Hypoarousal**: Numbness, dissociation, shutdown

**Regulation Strategies**:
- Breathwork (especially extended exhale)
- Cold exposure
- Movement and exercise
- Social co-regulation
- Grounding techniques

Building nervous system resilience expands your window of tolerance, allowing you to handle more of life's challenges while staying present.`,
    source: 'Neuroscience / Polyvagal Theory',
    tags: ['nervous system', 'regulation', 'polyvagal', 'trauma', 'somatic'],
    readTimeMinutes: 5,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(6),
  },
  {
    cardType: 'concept',
    accessLevel: 'personal',
    title: 'Individuation',
    subtitle: 'The journey to psychological wholeness',
    content: `Individuation is Jung's term for the lifelong process of becoming who you truly are—integrating conscious and unconscious aspects of the psyche into a unified, authentic self.

**The Process**

1. **Confronting the Persona**: Recognizing the masks we wear for social acceptance are not our true self.

2. **Meeting the Shadow**: Acknowledging and integrating rejected aspects of ourselves.

3. **Encountering Anima/Animus**: Integrating our inner feminine/masculine—the contrasexual element of our psyche.

4. **Facing the Self**: Approaching the central archetype that represents wholeness and the organizing principle of the psyche.

**Key Characteristics**:

- It is not a straight path but a spiral, returning to themes with greater depth
- It often involves a "dark night of the soul" or significant life crisis
- It requires both solitude for inner work and relationship for reflection
- The goal is not perfection but completeness—embracing all of who we are

**Warning Signs of Avoiding Individuation**:
- Chronic dissatisfaction despite external success
- Persistent sense of inauthenticity
- Midlife crisis or identity confusion
- Repetitive relationship patterns

Individuation is not about becoming isolated or "individual" but about becoming genuinely yourself in relationship with others and the world.`,
    source: 'Jungian Psychology',
    tags: ['individuation', 'jung', 'self', 'wholeness', 'growth'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(7),
  },
  {
    cardType: 'concept',
    accessLevel: 'personal',
    title: 'Attachment Styles',
    subtitle: 'How early bonds shape adult relationships',
    content: `Attachment theory, developed by John Bowlby and expanded by Mary Ainsworth, explains how our early relationships with caregivers create templates for all future relationships.

**The Four Attachment Styles**

**Secure (≈56% of population)**
- Comfortable with intimacy and independence
- Trust that relationships can meet their needs
- Can regulate emotions effectively

**Anxious/Preoccupied (≈20%)**
- Fear of abandonment
- Need frequent reassurance
- May appear "clingy" or hypervigilant to rejection

**Avoidant/Dismissive (≈23%)**
- Discomfort with closeness
- Value independence highly
- May suppress emotional needs

**Disorganized/Fearful (≈5%)**
- Both desire and fear intimacy
- Often from traumatic early experiences
- Unpredictable relationship patterns

**Important Insights**:

1. Attachment styles are not fixed—they can shift with awareness and healing relationships
2. We may have different styles in different relationships
3. Understanding your style helps decode relationship patterns
4. The goal is "earned secure attachment" through self-work and healthy relationships

**Practice**: Reflect on your relationship patterns. Do you tend to pursue or withdraw when stressed? What does this reveal about your attachment style?`,
    source: 'Developmental Psychology',
    tags: ['attachment', 'relationships', 'psychology', 'bowlby', 'intimacy'],
    readTimeMinutes: 5,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(8),
  },
  {
    cardType: 'concept',
    accessLevel: 'personal',
    title: 'Ego Death',
    subtitle: 'The dissolution of the false self',
    content: `Ego death refers to a complete loss of subjective self-identity—the temporary dissolution of the sense of being a separate, bounded self. It is described in mystical traditions worldwide and is now studied in psychedelic research.

**What Happens**

The ordinary sense of "I"—the story we tell ourselves about who we are—temporarily falls away. What remains is pure awareness without the usual filters of identity, preference, and separation.

**Contexts Where It Occurs**:
- Intensive meditation practice
- Psychedelic experiences
- Near-death experiences
- Spontaneous mystical states
- Extreme physical endurance
- Profound grief or shock

**The Transformation**

When the ego reconstructs after such an experience, it is often fundamentally changed:
- Reduced fear of death
- Increased sense of connection with all life
- Decreased attachment to material concerns
- Greater access to compassion and equanimity
- Paradoxically, a healthier, more flexible ego

**Caution**: Ego death is not a goal to pursue aggressively. Forced or premature dissolution can be destabilizing. The psyche needs to be prepared through gradual practice and integration support.

This is not about destroying the ego—we need it to function. It's about recognizing its constructed nature and loosening its grip.`,
    source: 'Transpersonal Psychology',
    tags: ['ego death', 'mysticism', 'consciousness', 'psychedelics', 'awakening'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(9),
  },
  {
    cardType: 'concept',
    accessLevel: 'personal',
    title: 'Projection',
    subtitle: 'Seeing ourselves in others',
    content: `Projection is the unconscious transfer of our own unaccepted emotions, traits, or impulses onto another person or group. We see in others what we cannot see in ourselves.

**How Projection Works**

1. A trait exists in our unconscious (often in the shadow)
2. We encounter someone who exhibits this trait
3. We have a strong emotional reaction to it
4. We're convinced the issue is entirely about them

**Types of Projection**:

**Negative Projection**: Seeing our disowned "bad" qualities in others
- "He's so arrogant" (when we fear our own pride)
- "She's manipulative" (when we're uncomfortable with our own influence)

**Positive Projection**: Placing our unowned gifts onto others
- Idolizing mentors or partners
- Believing others possess qualities we can't access in ourselves

**Signs You're Projecting**:
- Disproportionate emotional reaction
- Rigid certainty about someone else's character
- The same issue appears in multiple relationships
- Strong attraction or repulsion

**Working with Projection**:

1. Notice strong reactions to others
2. Ask: "What if this quality exists in me?"
3. Explore how you might express this quality unconsciously
4. Reclaim the projection by integrating the quality consciously

"Everything that irritates us about others can lead us to an understanding of ourselves." — C.G. Jung`,
    source: 'Depth Psychology',
    tags: ['projection', 'shadow', 'jung', 'relationships', 'psychology'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(10),
  },
  {
    cardType: 'concept',
    accessLevel: 'practitioner',
    title: 'Transference and Countertransference',
    subtitle: 'The relational field in therapeutic work',
    content: `Transference and countertransference are powerful dynamics that emerge in any deep relational work—therapy, coaching, mentorship, or spiritual guidance.

**Transference**

The client unconsciously redirects feelings and attitudes from past significant relationships onto the practitioner.

*Examples*:
- Seeing the therapist as a critical parent
- Falling in love with the coach
- Expecting rejection similar to past experiences
- Idealizing the practitioner as a savior figure

**Countertransference**

The practitioner's unconscious reactions to the client, often triggered by the client's transference.

*Types*:
- **Complementary**: Responding as the projected figure would (becoming the critical parent)
- **Concordant**: Identifying with the client's experience
- **Induced**: Feelings that provide information about the client's inner world

**Working with These Dynamics**:

For Practitioners:
1. Maintain regular supervision
2. Track your emotional reactions to clients
3. Use countertransference as data about the client's relational world
4. Name transference dynamics when therapeutically useful

The relational field is not a problem to be eliminated but a rich source of information about how the client organizes their relational experience. The art is in using it skillfully for healing.`,
    source: 'Psychoanalytic Theory',
    tags: ['transference', 'countertransference', 'therapy', 'clinical', 'relationships'],
    readTimeMinutes: 5,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(11),
  },
  {
    cardType: 'concept',
    accessLevel: 'practitioner',
    title: 'Holding Space',
    subtitle: 'The art of presence without fixing',
    content: `Holding space is the practice of being fully present with someone without trying to fix, change, or judge their experience. It is perhaps the most fundamental skill in transformational work.

**What Holding Space Requires**:

**Being, Not Doing**
Resisting the helper's impulse to intervene, advise, or rescue. Trusting that presence itself is healing.

**Emotional Regulation**
Staying grounded in your own body while remaining open to another's experience. If you're flooded, you can't hold space.

**Non-Judgment**
Creating safety by accepting whatever arises without labeling it good or bad, right or wrong.

**Container Maintenance**
Maintaining appropriate boundaries that allow intensity to be processed safely.

**Signs You're Holding Space Well**:
- The other person feels free to express
- You notice what's happening in your body
- You're curious rather than reactive
- Silence feels natural and productive
- You don't have an agenda for them

**Signs You've Lost the Space**:
- You're planning what to say next
- You feel urgent need to help or fix
- You're giving advice they didn't ask for
- You're making it about your experience
- You've lost track of your own body

Holding space looks passive but is actually an active, embodied practice requiring years to master.`,
    source: 'Somatic & Relational Practice',
    tags: ['holding space', 'presence', 'coaching', 'therapy', 'embodiment'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(12),
  },
  {
    cardType: 'concept',
    accessLevel: 'pro',
    title: 'Parts Work & Internal Family Systems',
    subtitle: 'Understanding the multiplicity of self',
    content: `Internal Family Systems (IFS), developed by Dr. Richard Schwartz, proposes that the mind is naturally multiple—composed of various "parts" organized around a core Self.

**The Model**

**Self**: The centered, compassionate core of who we are. Characterized by curiosity, calm, clarity, compassion, confidence, courage, creativity, and connectedness (the 8 C's).

**Protector Parts**:
- *Managers*: Proactive parts that try to control and prevent pain (perfectionism, caretaking, intellectualizing)
- *Firefighters*: Reactive parts that extinguish overwhelming feelings (addiction, dissociation, self-harm)

**Exiles**: Young, vulnerable parts carrying pain, shame, and trauma. Protected by managers and firefighters.

**The Therapeutic Process**:

1. Access Self-energy
2. Identify parts and get to know them
3. Develop relationships with protectors
4. When protectors trust, access and witness exiles
5. Unburden exiles from their extreme beliefs and feelings
6. Allow parts to take on new roles

**Why IFS is Revolutionary**:
- No part is bad—all parts have positive intentions
- Problems arise from parts being in extreme roles
- Healing happens through relationship, not elimination
- Self-leadership replaces parts domination

This model offers a non-pathologizing way to understand complex inner experiences and has shown remarkable results with trauma, depression, and addiction.`,
    source: 'Internal Family Systems',
    tags: ['IFS', 'parts work', 'trauma', 'therapy', 'self-leadership'],
    readTimeMinutes: 5,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(13),
  },
  {
    cardType: 'concept',
    accessLevel: 'personal',
    title: 'The Witness',
    subtitle: 'Pure awareness behind experience',
    content: `The Witness, also called the Observer or Pure Awareness, is the aspect of consciousness that notices experience without being caught in it.

**Understanding the Witness**

You are not your thoughts—you are the awareness that notices thoughts.
You are not your emotions—you are the awareness that notices emotions.
You are not your body—you are the awareness that notices sensations.

This Witnessing awareness remains constant while all contents of experience change.

**Accessing the Witness**:

1. Notice that you are thinking
2. Who is noticing the thinking?
3. Rest as that which notices

**Qualities of Witness Consciousness**:
- Spacious
- Unchanging
- Impartial
- Peaceful
- Already present

**Common Misunderstandings**:

❌ The Witness is cold, detached, dissociated
✅ The Witness includes all experience with intimate presence

❌ You need to stop thinking to find the Witness
✅ The Witness is already present, watching thoughts

❌ The Witness is another "part" of you
✅ The Witness is your true nature, not an object to find

**Practice**: Throughout the day, periodically ask: "What is aware right now?" Don't try to find an answer—just rest in the question and notice what happens.`,
    source: 'Contemplative Psychology',
    tags: ['witness', 'awareness', 'meditation', 'consciousness', 'presence'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(14),
  },
  {
    cardType: 'concept',
    accessLevel: 'personal',
    title: 'Spiritual Bypassing',
    subtitle: 'When spirituality becomes avoidance',
    content: `Spiritual bypassing, a term coined by psychologist John Welwood, refers to using spiritual beliefs and practices to avoid dealing with painful emotions, unresolved wounds, and developmental needs.

**Common Forms**:

**Premature Forgiveness**
Forcing forgiveness before fully processing hurt and anger

**Toxic Positivity**
"Just think positive" when genuine grief is needed

**Emotional Avoidance**
Using meditation to dissociate rather than feel

**Superiority**
"I'm too spiritual to feel angry/jealous/afraid"

**Deflection**
"Everything happens for a reason" as dismissal of legitimate suffering

**Signs of Spiritual Bypassing**:
- Difficulty tolerating negative emotions
- Spiritual practices increase rather than decrease anxiety
- Interpersonal issues remain unaddressed
- Condescension toward "less evolved" people
- Chronic niceness masking authentic feelings

**Healthy Integration**:

True spiritual development includes:
- Feeling emotions fully before letting them go
- Psychological work alongside contemplative practice
- Recognizing spiritual insight doesn't exempt us from human work
- Groundedness in the body, not just elevated states

"You have to be somebody before you can be nobody." The ego needs to develop before it can be transcended.`,
    source: 'Integral Psychology',
    tags: ['spiritual bypassing', 'psychology', 'avoidance', 'integration', 'shadow'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(15),
  },
  {
    cardType: 'concept',
    accessLevel: 'practitioner',
    title: 'The Therapeutic Container',
    subtitle: 'Creating safety for transformation',
    content: `The container is the bounded, safe space in which therapeutic or transformational work occurs. Like an alchemical vessel, it must be strong enough to hold the heat of transformation.

**Elements of the Container**:

**Physical**
- Consistent location
- Comfortable seating
- Privacy and soundproofing
- Attention to lighting and temperature

**Temporal**
- Reliable start and end times
- Consistent session frequency
- Clear policies around cancellation

**Relational**
- Clear roles and boundaries
- Confidentiality agreements
- Practitioner's regulated presence

**Psychological**
- Explicit and implicit agreements
- Trust built through consistency
- Capacity to hold intensity

**Why Containers Matter**:

Without adequate containment:
- Clients may feel unsafe to go deep
- Material that emerges can't be processed
- Re-traumatization becomes possible
- Transformation lacks the pressure needed to occur

**Container Ruptures**:

Inevitable breaks in the container (missed sessions, practitioner mistakes, boundary issues) are not failures but opportunities—IF repaired well, they actually strengthen the container and the relationship.

The paradox: A strong container allows for greater freedom and depth within it.`,
    source: 'Clinical Practice',
    tags: ['container', 'therapy', 'safety', 'boundaries', 'clinical'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(16),
  },

  // ============================================
  // PRACTICE CARDS (8)
  // ============================================
  {
    cardType: 'practice',
    accessLevel: 'personal',
    title: '5-Minute Grounding Sequence',
    subtitle: 'Quickly return to embodied presence',
    content: `When you feel anxious, overwhelmed, or disconnected, this grounding sequence brings you back to your body and the present moment.

**The Practice**

**1. Arrive (30 seconds)**
Sit or stand with feet firmly on the ground. Close your eyes or soften your gaze.

**2. Three Breaths (30 seconds)**
Take three slow, deep breaths. Exhale longer than you inhale. Feel your weight dropping down.

**3. 5-4-3-2-1 Senses (2 minutes)**
- Name 5 things you can see
- 4 things you can touch/feel
- 3 things you can hear
- 2 things you can smell
- 1 thing you can taste

**4. Root Down (1 minute)**
Feel your connection to the ground. Imagine roots growing from your feet deep into the earth. Feel supported.

**5. Expand (1 minute)**
From this grounded place, let your awareness expand to include the room, the building, the city. You are held by something larger.

**When to Use**:
- Before important conversations
- When anxiety spikes
- After disturbing news or content
- As a transition between activities
- When you notice you've been in your head too long

Practice daily even when calm to build the skill for when you need it most.`,
    source: 'Somatic Practice',
    tags: ['grounding', 'anxiety', 'somatic', 'nervous system', 'presence'],
    readTimeMinutes: 3,
    isFeatured: true,
    isDaily: false,
    publishedAt: daysAgo(17),
  },
  {
    cardType: 'practice',
    accessLevel: 'personal',
    title: 'Shadow Journaling',
    subtitle: 'A weekly practice for shadow integration',
    content: `This journaling practice helps you identify and integrate shadow material by working with your reactions to others.

**Weekly Practice (20-30 minutes)**

**Step 1: The Trigger**
Recall someone who triggered a strong reaction this week. It could be irritation, judgment, admiration, or envy.

Write:
- Who was it?
- What specifically triggered you?
- What were you feeling in your body?

**Step 2: The Mirror**
Ask yourself: "How might this quality exist in me?"

Consider:
- Do I express this openly?
- Do I express this in hidden ways?
- Did I suppress this quality in childhood?
- Do I secretly wish I could express this?

**Step 3: The Origin**
When did I learn to reject this quality?
What would happen if I owned this fully?

**Step 4: The Integration**
Write a brief dialogue between you and this quality. Let it speak. Let it tell you what it needs.

**Step 5: The Gift**
How might this shadow quality serve me if integrated consciously?

**Commitment**: Practice weekly for 3 months. Track patterns and notice how your reactivity shifts as you reclaim projected material.

Remember: The goal is not to act out shadow material but to own it consciously so it stops running your life unconsciously.`,
    source: 'Jungian Practice',
    tags: ['shadow work', 'journaling', 'integration', 'self-awareness', 'practice'],
    readTimeMinutes: 5,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(18),
  },
  {
    cardType: 'practice',
    accessLevel: 'personal',
    title: 'Loving-Kindness Meditation',
    subtitle: 'Cultivating compassion for self and others',
    content: `Loving-kindness (Metta) meditation systematically develops feelings of goodwill toward yourself and all beings. Regular practice rewires the brain toward compassion.

**The Practice (15-20 minutes)**

**Preparation**
Sit comfortably. Take several deep breaths. Place a hand on your heart if helpful.

**1. Self (3-4 minutes)**
Bring yourself to mind. Repeat silently:
- May I be happy
- May I be healthy
- May I be safe
- May I live with ease

Feel the intention behind the words.

**2. Beloved (3-4 minutes)**
Bring to mind someone you love unconditionally. Repeat:
- May you be happy
- May you be healthy
- May you be safe
- May you live with ease

**3. Neutral Person (3-4 minutes)**
Think of someone you neither like nor dislike (cashier, neighbor). Extend the same wishes.

**4. Difficult Person (3-4 minutes)**
Bring to mind someone with whom you have difficulty. Start mild. Extend the wishes, noting any resistance.

**5. All Beings (3-4 minutes)**
Expand to all beings everywhere:
- May all beings be happy
- May all beings be healthy
- May all beings be safe
- May all beings live with ease

**Tips**:
- Start with self—you can't give what you don't have
- It's okay if you don't feel it at first—intention matters
- With difficult people, start with mildly challenging relationships`,
    source: 'Buddhist Practice',
    tags: ['meditation', 'compassion', 'loving-kindness', 'metta', 'buddhism'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(19),
  },
  {
    cardType: 'practice',
    accessLevel: 'personal',
    title: 'Breath Regulation for Nervous System Reset',
    subtitle: 'Three breathing patterns for different states',
    content: `Your breath is the fastest way to shift your nervous system state. Here are three evidence-based techniques for different situations.

**1. Physiological Sigh (Immediate Calm)**
*Use when*: Acute stress, panic, need immediate relief

**How to**:
- Double inhale through the nose (full breath, then sip more air)
- Long slow exhale through the mouth
- Repeat 1-3 times

*Why it works*: Reinflates collapsed alveoli, rapidly decreases CO2

**2. Box Breathing (Focus & Balance)**
*Use when*: Need sustained focus, moderate anxiety, preparation for challenge

**How to**:
- Inhale 4 counts
- Hold 4 counts
- Exhale 4 counts
- Hold 4 counts
- Repeat for 4-5 minutes

*Why it works*: Balances sympathetic and parasympathetic systems

**3. 4-7-8 Breathing (Deep Relaxation)**
*Use when*: Sleep, deep relaxation, processing difficult emotions

**How to**:
- Inhale through nose for 4 counts
- Hold for 7 counts
- Exhale through mouth for 8 counts
- Repeat 4 cycles

*Why it works*: Extended exhale activates parasympathetic response

**General Principles**:
- Nose breathing is generally more regulating than mouth
- Extended exhale activates calm
- Extended inhale activates alertness
- Practice when calm to build skill for when stressed`,
    source: 'Neuroscience',
    tags: ['breathwork', 'nervous system', 'anxiety', 'regulation', 'somatic'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(20),
  },
  {
    cardType: 'practice',
    accessLevel: 'personal',
    title: 'The Self-Compassion Break',
    subtitle: 'Three steps when you\'re suffering',
    content: `Developed by Dr. Kristin Neff, this practice offers a structured way to respond to difficult moments with kindness rather than self-criticism.

**When to Use**
Any moment of suffering, failure, shame, or self-judgment.

**The Three Steps**

**1. Mindfulness**
*Acknowledge the suffering without over-identification*

"This is a moment of suffering."
"This hurts."
"This is hard right now."

*Why*: Names the experience without drowning in it

**2. Common Humanity**
*Remember you're not alone*

"Suffering is part of being human."
"Other people feel this way too."
"I'm not the only one who struggles with this."

*Why*: Counters the isolation of shame

**3. Self-Kindness**
*Offer yourself compassion*

Place your hands on your heart and say:
"May I be kind to myself."
"May I give myself the compassion I need."
"May I be patient with myself."

*Why*: Activates the care system

**Physical Component**
Touch is powerful. Options:
- Hand on heart
- Hands cradling face
- Self-hug
- Hand on belly

**Personalize It**
Find the phrases that resonate for you. The words should feel true and supportive, not forced.

Practice this dozens of times with small difficulties to build the habit for major ones.`,
    source: 'Self-Compassion Research',
    tags: ['self-compassion', 'practice', 'mindfulness', 'suffering', 'kindness'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(21),
  },
  {
    cardType: 'practice',
    accessLevel: 'practitioner',
    title: 'Somatic Tracking',
    subtitle: 'Following sensation to release stuck energy',
    content: `Somatic tracking is a gentle practice of following sensations in the body without trying to change them. It allows stuck energy and unprocessed emotion to move naturally.

**The Practice (15-20 minutes)**

**1. Settle**
Find a comfortable position. You can lie down, sit, or even stand. Take a few breaths to arrive.

**2. Body Scan**
Slowly move your attention through your body. Notice any areas of sensation—tightness, warmth, pressure, movement, numbness.

**3. Choose a Sensation**
Pick one area that draws your attention. It doesn't need to be the most intense.

**4. Track**
- Simply observe the sensation with curiosity
- Notice its qualities: size, shape, temperature, texture, movement
- Follow where it wants to go
- Stay present without trying to change anything

**5. Allow Expression**
As you track, the body may want to:
- Make sounds
- Move or stretch
- Breathe differently
- Express emotion

Allow whatever wants to happen (within safety).

**6. Complete**
When the sensation has shifted or released, rest. Notice the new state.

**Key Principles**:
- Follow, don't lead
- Curiosity, not judgment
- Slower is better
- Trust the body's intelligence
- Stay within your window of tolerance

**Caution**: With trauma, work with a trained practitioner. Tracking intense sensation alone can be destabilizing.`,
    source: 'Somatic Experiencing',
    tags: ['somatic', 'trauma', 'body', 'sensation', 'release'],
    readTimeMinutes: 5,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(22),
  },
  {
    cardType: 'practice',
    accessLevel: 'personal',
    title: 'Morning Pages',
    subtitle: 'Clearing the mind through longhand writing',
    content: `Morning Pages, developed by Julia Cameron, is a practice of writing three pages longhand first thing in the morning to clear mental debris and access deeper creativity.

**The Practice**

**What**
Write three pages by hand, every morning, immediately upon waking.

**How**
- Use a notebook and pen (not computer)
- Write continuously—no stopping to think
- Don't edit, censor, or reread
- Write whatever comes to mind
- If stuck, write "I don't know what to write" until something comes

**When**
First thing in the morning, before checking phone, email, or engaging with the day.

**What You'll Write About**
- What's worrying you
- Dreams from the night
- Complaints and frustrations
- Plans and to-dos
- Random thoughts
- Deeper realizations (eventually)

**What Morning Pages Do**:
1. Drain the mental swamp of surface concerns
2. Bypass the inner critic
3. Access intuition and creativity
4. Reveal patterns and priorities
5. Create a container for anxiety

**Important**:
- Don't show them to anyone
- Don't reread them (at least for first 8 weeks)
- Don't use them for "journaling" or insight—just dump

After 8 weeks of consistent practice, you may reread to notice themes. But the magic is in the writing, not the reading.`,
    source: 'The Artist\'s Way',
    tags: ['journaling', 'creativity', 'morning routine', 'writing', 'practice'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(23),
  },
  {
    cardType: 'practice',
    accessLevel: 'pro',
    title: 'Parts Dialogue',
    subtitle: 'Facilitating internal communication',
    content: `This IFS-informed practice helps you develop relationship with inner parts by giving them voice through written dialogue.

**The Practice (20-30 minutes)**

**1. Ground and Center**
Take a few minutes to settle. Access a sense of calm curiosity—what IFS calls Self-energy.

**2. Identify a Part**
Notice a part that's active—perhaps one that's anxious, critical, avoidant, or protective. Don't try to change it.

**3. Turn Toward It**
Internally acknowledge this part: "I notice you're here."

**4. Ask Permission**
Ask the part: "Are you willing to talk with me?" If you sense resistance, honor that. Perhaps ask what it needs to feel safe.

**5. Begin Dialogue**
In your journal, write a conversation:

**Self**: Hello. I notice you've been active lately.
**Part**: (Write what comes, even if it seems made up)
**Self**: What do you want me to know?
**Part**: ...
**Self**: How long have you been doing this job?
**Part**: ...
**Self**: What are you afraid would happen if you stopped?
**Part**: ...

**Key Questions to Ask Parts**:
- What is your role?
- What are you protecting me from?
- How old were you when you took on this job?
- What do you need from me?
- What would you like to do if you didn't have this job?

**6. Thank and Close**
Thank the part for communicating. Let it know you'll return.

**Caution**: If overwhelming emotion arises, stop and ground. Consider working with an IFS-trained therapist.`,
    source: 'Internal Family Systems',
    tags: ['IFS', 'parts work', 'dialogue', 'inner work', 'therapy'],
    readTimeMinutes: 5,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(24),
  },

  // ============================================
  // ARCHETYPE CARDS (6)
  // ============================================
  {
    cardType: 'archetype',
    accessLevel: 'personal',
    title: 'The Hero\'s Journey',
    subtitle: 'The universal pattern of transformation',
    content: `Joseph Campbell's Hero's Journey (or Monomyth) is the archetypal pattern underlying myths, stories, and personal transformation across cultures.

**The Stages**

**I. Departure**
1. **Ordinary World**: Life before the adventure
2. **Call to Adventure**: Something disrupts the familiar
3. **Refusal of the Call**: Initial hesitation and fear
4. **Meeting the Mentor**: A guide appears with wisdom or tools
5. **Crossing the Threshold**: Leaving the known world

**II. Initiation**
6. **Tests, Allies, Enemies**: Challenges reveal character
7. **Approach to Inmost Cave**: Nearing the central ordeal
8. **Ordeal**: The hero faces their greatest fear
9. **Reward**: Seizing the treasure or insight

**III. Return**
10. **The Road Back**: Beginning the journey home
11. **Resurrection**: Final test, death and rebirth
12. **Return with the Elixir**: Bringing the gift back to the community

**In Your Life**

You are always on multiple hero's journeys—in career, relationships, health, spirituality. Ask:
- What is calling me right now?
- What threshold am I avoiding?
- Who are my mentors and allies?
- What ordeal is asking to be faced?
- What elixir do I have to bring back?

The journey is not about becoming someone else. It's about becoming who you were always meant to be.`,
    source: 'Mythology',
    tags: ['hero\'s journey', 'campbell', 'archetype', 'mythology', 'transformation'],
    readTimeMinutes: 5,
    isFeatured: true,
    isDaily: false,
    publishedAt: daysAgo(25),
  },
  {
    cardType: 'archetype',
    accessLevel: 'personal',
    title: 'The Wise Elder',
    subtitle: 'The archetype of earned wisdom',
    content: `The Wise Elder (Senex/Crone) is the archetype of accumulated wisdom, earned through experience and the willingness to face life's full range of joys and sufferings.

**Qualities of the Wise Elder**

- Speaks truth without cruelty
- Holds space without absorbing
- Sees patterns across time
- Comfortable with paradox
- At peace with mortality
- Authority without domination
- Humor and lightness within gravity

**Shadow Expressions**

**Inflated**: Cynicism, rigidity, "I know best," using experience to dismiss rather than guide

**Deflated**: Refusing to claim wisdom, perpetual impostor syndrome, avoiding the mentor role

**Meeting the Inner Elder**

The Wise Elder is not only external mentors but an inner resource you can access:

1. Close your eyes and imagine moving forward in time
2. Meet the wisest, most integrated version of yourself
3. Ask them for guidance on your current situation
4. Listen for their response
5. Thank them before returning

**The Elder's Task**

The Wise Elder has completed enough hero's journeys to guide others on theirs. Their task is not to prevent others' suffering but to accompany them through it.

"A mentor is someone who allows you to see the hope inside yourself." — Oprah Winfrey`,
    source: 'Archetypal Psychology',
    tags: ['wise elder', 'archetype', 'mentorship', 'wisdom', 'inner guide'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(26),
  },
  {
    cardType: 'archetype',
    accessLevel: 'personal',
    title: 'The Divine Child',
    subtitle: 'Wonder, potential, and new beginnings',
    content: `The Divine Child archetype represents purity, wonder, potential, and the capacity for renewal. It is the part of us that can begin again, see with fresh eyes, and believe in possibility.

**Qualities of the Divine Child**

- Spontaneous wonder
- Natural creativity
- Trust and openness
- Living fully in the present
- Authentic emotional expression
- Capacity for play
- Sense of limitless potential

**The Wounded Child**

Most adults carry a wounded child—the part that absorbed early trauma, rejection, or abandonment:

- Chronic shame: "I am fundamentally flawed"
- Abandonment fears: "I will be left"
- Trust issues: "The world is not safe"
- Lost capacity for play and joy

**Reclaiming the Divine Child**

Healing involves:
1. Acknowledging the wounded child's pain
2. Re-parenting yourself with the love that was missing
3. Creating safety so the innocent child can emerge
4. Making space for play, wonder, and creativity

**Practices**:
- Look at old photos and offer compassion to that child
- Do activities you loved as a child
- Notice when the wounded child is running your reactions
- Let yourself not know, not achieve, not perform

The Divine Child holds the energy for your next rebirth. Without access to this archetype, genuine renewal is impossible.`,
    source: 'Jungian Psychology',
    tags: ['divine child', 'archetype', 'inner child', 'healing', 'potential'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(27),
  },
  {
    cardType: 'archetype',
    accessLevel: 'personal',
    title: 'The Shadow',
    subtitle: 'The archetype of the rejected self',
    content: `The Shadow is the archetype of everything in us that we cannot accept—the dark, rejected, disowned aspects of self that have been exiled to the unconscious.

**What Lives in the Shadow**

- Traits judged unacceptable by family/culture
- Emotions we were punished for expressing
- Desires that conflict with our self-image
- Instincts and aggression
- Creativity that wasn't safe
- Our gold (positive qualities we couldn't own)

**How the Shadow Operates**

The Shadow doesn't disappear when denied—it finds other ways to express:

- **Projection**: Seeing your shadow in others
- **Symptoms**: Anxiety, depression, compulsions
- **Dreams**: Shadow figures appear as enemies, monsters, or outcasts
- **Slips**: "Accidents" that reveal hidden desires
- **Inflation**: Sudden outbursts of denied energy

**The Shadow's Gift**

Carl Jung: "One does not become enlightened by imagining figures of light, but by making the darkness conscious."

Within your shadow lies:
- Vital life energy
- Authenticity
- Creative power
- Wholeness

**Integration, Not Elimination**

The goal is not to get rid of the shadow but to develop conscious relationship with it. What we accept, we can direct. What we deny, runs our lives from the dark.

Meeting the shadow requires courage—and changes everything.`,
    source: 'Jungian Psychology',
    tags: ['shadow', 'jung', 'archetype', 'unconscious', 'integration'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(28),
  },
  {
    cardType: 'archetype',
    accessLevel: 'practitioner',
    title: 'The Healer-Wounded Healer',
    subtitle: 'Transformation through the wound',
    content: `The Wounded Healer is the archetype of one whose own suffering has become the source of their capacity to heal others. It is central to understanding the therapeutic calling.

**The Myth**

Chiron, the centaur of Greek mythology, was a master healer who could not heal his own wound. It was precisely this incurable wound that made him the greatest teacher of healing arts.

**The Dynamic**

The Wounded Healer carries paradox:
- Strength and vulnerability
- Knowing and not knowing
- Healed and forever healing
- Separate and deeply connected

**For Practitioners**

Your wounds are not obstacles to your work—they are its source:

- **Resonance**: Your experience lets you feel what clients feel
- **Map**: You've traveled the territory you're guiding others through
- **Humility**: You cannot stand above your clients
- **Motivation**: Your suffering drives your dedication

**The Danger**

The shadow side:
- Using clients to work on your own issues
- Needing to be needed
- Unable to hold boundaries
- Chronic over-giving leading to burnout

**The Balance**

Effective wounded healers:
1. Do their own ongoing inner work
2. Have support and supervision
3. Know the difference between their wounds and the client's
4. Allow their wounds to inform but not control

"The therapist is effective only to the extent that they have overcome their own wounds." — Adolf Guggenbühl-Craig`,
    source: 'Archetypal Psychology',
    tags: ['wounded healer', 'archetype', 'therapy', 'practitioner', 'chiron'],
    readTimeMinutes: 5,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(29),
  },
  {
    cardType: 'archetype',
    accessLevel: 'personal',
    title: 'The Trickster',
    subtitle: 'The archetype of holy disruption',
    content: `The Trickster is the archetype of disruption, boundary-crossing, and creative chaos. Found in every culture—Loki, Coyote, Hermes, Anansi—the Trickster upends the established order.

**Qualities of the Trickster**

- Challenges authority and convention
- Thrives at crossroads and thresholds
- Breaks rules and taboos
- Shape-shifts and transforms
- Uses humor and cunning
- Creates through destruction
- Cannot be controlled

**The Trickster's Gift**

The Trickster serves essential functions:
- Prevents systems from becoming rigid
- Reveals hypocrisy and pretense
- Creates openings for change
- Introduces new perspectives
- Brings the unconscious into the open

**The Trickster Shadow**

When the Trickster energy is unconscious or inflated:
- Chronic lying and manipulation
- Addiction to chaos and drama
- Inability to commit or be reliable
- Using humor to avoid intimacy
- Destructiveness without creation

**Working with Your Inner Trickster**

Ask:
- Where am I too rigid? Where do I need disruption?
- Where am I using chaos to avoid responsibility?
- Can I play more? Take myself less seriously?
- What sacred cows am I protecting that need questioning?

The Trickster reminds us that the universe is more playful and less controllable than our egos prefer. Learn to laugh with the Trickster, or you'll be the butt of the joke.`,
    source: 'Mythology',
    tags: ['trickster', 'archetype', 'mythology', 'change', 'transformation'],
    readTimeMinutes: 4,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(30),
  },

  // ============================================
  // DEEP DIVE CARDS (5)
  // ============================================
  {
    cardType: 'deep_dive',
    accessLevel: 'personal',
    title: 'The Neuroscience of Meditation',
    subtitle: 'What actually happens in the brain',
    content: `Three decades of research have revealed how meditation changes the brain—not through mystical means, but through neuroplasticity and repeated practice.

**Key Brain Changes**

**1. Prefrontal Cortex**
The brain's executive center, responsible for attention, decision-making, and impulse control.

*Findings*: Increased gray matter density and cortical thickness in meditators. These changes correlate with better emotional regulation and decision-making.

**2. Amygdala**
The brain's threat detection center, central to fear and stress responses.

*Findings*: Decreased amygdala reactivity and reduced size in long-term meditators. Less activation when viewing emotional stimuli.

**3. Default Mode Network (DMN)**
The brain network active during mind-wandering, self-referential thought, and rumination.

*Findings*: Reduced DMN activity during meditation. Experienced meditators show less DMN activation even at rest, suggesting reduced habitual rumination.

**4. Insula**
Central to interoception—awareness of internal body states.

*Findings*: Increased insula thickness and activity. Correlates with better emotional awareness and empathy.

**5. Hippocampus**
Critical for memory and learning, vulnerable to stress.

*Findings*: Increased hippocampal volume in meditators, potentially protective against stress-related damage.

**Mechanism: Neuroplasticity**

The brain changes through repeated practice:
1. Attention training strengthens prefrontal networks
2. Non-reactive observation weakens habitual stress responses
3. Body awareness develops interoceptive circuits
4. Compassion practices activate care networks

**Time Required**

Research shows:
- 8 weeks of MBSR: Measurable brain changes
- Daily practice: Cumulative effects increase
- 10,000+ hours: Dramatic differences in brain structure and function

**Key Insight**

Meditation is not relaxation or positive thinking. It's a form of brain training that, through repeated practice, changes the organ that creates your experience of reality.

The mystics were right about the effects. Now we're beginning to understand the mechanisms.`,
    source: 'Contemplative Neuroscience',
    tags: ['neuroscience', 'meditation', 'brain', 'neuroplasticity', 'research'],
    readTimeMinutes: 8,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(31),
  },
  {
    cardType: 'deep_dive',
    accessLevel: 'personal',
    title: 'Understanding Trauma',
    subtitle: 'A comprehensive guide to what trauma is and isn\'t',
    content: `Trauma is not what happened to you. Trauma is what happened inside you as a result of what happened to you. This distinction, articulated by Dr. Gabor Maté, transforms our understanding.

**What Trauma Actually Is**

Trauma occurs when an experience overwhelms our capacity to cope, leaving us fundamentally changed. The key factors:

1. **Overwhelm**: The nervous system is flooded beyond its ability to process
2. **Helplessness**: No effective action is possible
3. **Isolation**: The experience is faced alone

**Types of Trauma**

**Acute/Shock Trauma**
Single incidents: accidents, assaults, natural disasters, sudden loss

**Developmental/Complex Trauma**
Ongoing childhood experiences: neglect, abuse, chronic stress, attachment disruption

**Intergenerational Trauma**
Patterns passed down through families, affecting gene expression and relational patterns

**What Happens in the Body**

Trauma is stored not in the memory but in the body:
- Incomplete fight/flight responses remain frozen
- Chronic nervous system dysregulation develops
- The body remains "braced" for danger
- Implicit memory triggers responses without conscious recall

**The Adaptive Nature of Trauma Responses**

Trauma symptoms are adaptations that once served survival:
- Hypervigilance kept you safe
- Dissociation protected you from unbearable pain
- Shame kept you attached to caregivers
- Anxiety signaled real danger

**What Trauma Is Not**

- A sign of weakness or dysfunction
- Something that happened to others but not you
- Always visible or dramatic
- Healed by "just getting over it"
- A label that defines you

**The Path of Healing**

Trauma healing involves:
1. **Safety**: Establishing internal and external safety
2. **Stabilization**: Developing regulation skills
3. **Processing**: Working through traumatic material (with support)
4. **Integration**: Making sense of what happened
5. **Post-traumatic growth**: Finding meaning and purpose

**Key Principle**

Healing trauma is not about erasing the past. It's about completing what was interrupted and reclaiming what was lost.

"The wound is the place where the Light enters you." — Rumi`,
    source: 'Trauma Theory',
    tags: ['trauma', 'healing', 'psychology', 'nervous system', 'recovery'],
    readTimeMinutes: 10,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(32),
  },
  {
    cardType: 'deep_dive',
    accessLevel: 'practitioner',
    title: 'The Art of Therapeutic Presence',
    subtitle: 'Being as the foundation of helping',
    content: `Before technique, before intervention, before any therapeutic strategy comes presence—the quality of being fully here with another person. Presence is not something you do; it is something you are.

**What Presence Is**

Therapeutic presence is the state of being fully in the moment with a client, with no part of yourself held back or somewhere else. It involves:

- Grounded embodiment
- Open, receptive attention
- Non-anxious availability
- Deep listening
- Regulated nervous system
- Contact with your own inner life

**Why Presence Matters**

Research shows that the quality of the therapeutic relationship is the strongest predictor of outcome—more than technique or theoretical orientation. And at the heart of relationship is presence.

Presence provides:
- **Safety**: The client's nervous system registers your state
- **Modeling**: They learn regulation through co-regulation
- **Permission**: Your presence says their experience is acceptable
- **Witnessing**: Being truly seen is healing in itself

**The Barriers to Presence**

What takes us away:
- **Agenda**: Needing the session to go a certain way
- **Performance Anxiety**: Worrying about doing it right
- **Countertransference**: Our own material being triggered
- **Fatigue**: Depleted capacity
- **Distraction**: Mind on other things

**Cultivating Presence**

**Before Sessions**:
- Transition ritual (walk, breathe, shake)
- Set aside personal concerns
- Remember your intention

**During Sessions**:
- Track your own body
- Notice when you leave
- Return without judgment
- Trust silence

**Between Sessions**:
- Personal practice (meditation, therapy, supervision)
- Adequate rest
- Nourish yourself

**Advanced Presence**

With experience, presence deepens:
- Presence even with intense material
- Presence even when uncertain
- Presence that includes your own reactions
- Presence as a field that holds both people

**The Paradox**

The most powerful thing you can do is nothing—just be. And being fully present is the hardest "nothing" there is.

"People start to heal the moment they feel heard." — Cheryl Richardson`,
    source: 'Clinical Practice',
    tags: ['presence', 'therapy', 'clinical', 'healing', 'relationship'],
    readTimeMinutes: 9,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(33),
  },
  {
    cardType: 'deep_dive',
    accessLevel: 'pro',
    title: 'Working with Dissociation',
    subtitle: 'Clinical approaches to fragmented experience',
    content: `Dissociation exists on a spectrum from everyday experiences (daydreaming, highway hypnosis) to severe fragmentation. Understanding and working with dissociation is essential for trauma treatment.

**The Dissociative Spectrum**

**Normative Dissociation**
- Absorption in activities
- Highway hypnosis
- Daydreaming

**Peritraumatic Dissociation**
- During overwhelming experiences
- Protective numbing
- Time distortion

**Chronic Dissociation**
- Depersonalization
- Derealization
- Amnesia
- Identity fragmentation

**The Function of Dissociation**

Dissociation is a brilliant survival adaptation:
- When you can't flee physically, you can flee psychologically
- Parts of experience are compartmentalized
- Overwhelm is managed through fragmentation
- Functioning is maintained in impossible situations

**Recognizing Dissociation in Session**

Signs your client may be dissociating:
- Glazed or unfocused eyes
- Flat or absent affect
- Difficulty tracking the conversation
- Automatic "I don't know" responses
- Sense that "no one is home"
- Sudden shift in presentation

**Clinical Approaches**

**1. Grounding First**
Before processing, ensure the client is present:
- Feet on floor, orientation to room
- Sensory engagement (ice, scent, texture)
- Eye contact (gentle)
- Movement

**2. Titration**
Work in small doses:
- Brief exposure to difficult material
- Return to safety frequently
- Build tolerance gradually

**3. Window of Tolerance**
Track activation:
- Stay within the client's capacity
- Notice signs of narrowing window
- Intervene before flooding

**4. Parts Work**
For structural dissociation:
- Establish relationships with parts
- Understand their protective functions
- Work toward communication and cooperation
- Avoid trying to eliminate parts

**5. Dual Awareness**
Develop capacity to:
- Be present while accessing the past
- Stay grounded while processing
- Maintain observer alongside experiencer

**Key Principles**

1. Never overwhelm the system
2. Build resources before processing
3. Pacing over pushing
4. Relationship is the healing agent
5. Parts have wisdom

**When to Refer**

Complex dissociative presentations (DID, extensive amnesia, severe depersonalization) require specialized training. Know your limits and consult appropriately.`,
    source: 'Trauma Therapy',
    tags: ['dissociation', 'trauma', 'clinical', 'therapy', 'nervous system'],
    readTimeMinutes: 11,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(34),
  },
  {
    cardType: 'deep_dive',
    accessLevel: 'personal',
    title: 'The Science of Psychedelics and Consciousness',
    subtitle: 'What research is revealing',
    content: `After decades of prohibition, psychedelic research has re-emerged with remarkable findings about consciousness, healing, and the nature of mind.

**The Research Renaissance**

Major institutions (Johns Hopkins, Imperial College, NYU, MAPS) are conducting rigorous research on:
- Psilocybin (magic mushrooms)
- MDMA (ecstasy)
- LSD
- Ayahuasca/DMT
- Ketamine

**Key Findings**

**Depression**
- Single psilocybin sessions produce effects lasting weeks to months
- Response rates surpass conventional antidepressants in trials
- Particularly effective for treatment-resistant depression

**End-of-Life Anxiety**
- 80%+ show significant reduction in death anxiety
- Effects persist at 6-month follow-up
- Described as among most meaningful experiences of life

**Addiction**
- Psilocybin for smoking cessation: 80% abstinence at 6 months
- Psilocybin for alcohol use disorder: significant reductions
- MDMA-assisted therapy for other addictions showing promise

**PTSD**
- MDMA-assisted therapy: 67% no longer meet PTSD criteria after treatment
- FDA breakthrough therapy designation granted

**Mechanisms of Action**

What's happening in the brain:

1. **Default Mode Network Disruption**
The DMN (self-referential thinking) is temporarily weakened, loosening rigid patterns

2. **Increased Connectivity**
Brain regions that don't normally communicate begin talking

3. **Neuroplasticity**
New neural connections form, potentially lasting after the experience

4. **Serotonin System**
Primary action on 5-HT2A receptors, but downstream effects are complex

**The Experience**

Common elements of mystical experiences under psychedelics:
- Unity consciousness
- Transcendence of time and space
- Deep sense of meaning
- Ineffability
- Positive mood
- Noetic quality (sense of direct knowing)

**Critical Context**

These are not magic bullets:
- Set and setting are crucial
- Preparation and integration essential
- Not appropriate for everyone
- Current research occurs in controlled clinical settings
- Recreational use differs significantly from therapeutic use

**Implications for Consciousness**

Psychedelics suggest:
- Consciousness may be filtered/reduced by normal brain function
- The brain may be more receiver than generator of consciousness
- Mystical states have biological correlates
- The self is more constructed than we assume

This research is reshaping our understanding of mental health treatment and the nature of mind itself.`,
    source: 'Psychedelic Research',
    tags: ['psychedelics', 'consciousness', 'research', 'therapy', 'neuroscience'],
    readTimeMinutes: 10,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(35),
  },

  // ============================================
  // CONTRAST CARDS (4)
  // ============================================
  {
    cardType: 'contrast',
    accessLevel: 'personal',
    title: 'Jung vs. Freud on the Unconscious',
    subtitle: 'Two visions of the hidden mind',
    content: `Sigmund Freud and Carl Jung, once mentor and student, eventually split over fundamental disagreements about the nature of the unconscious. Their debate still shapes how we understand the psyche.

**FREUD'S VIEW**

**The Personal Unconscious**
Contains only personal content—repressed memories, desires, and experiences from the individual's life.

**Content**
Primarily sexual and aggressive drives. The unconscious is the repository of what is unacceptable to consciousness.

**Nature**
The unconscious is fundamentally primitive, dangerous, and in conflict with civilization. It must be controlled and sublimated.

**Goal of Analysis**
"Where id was, ego shall be." Bring unconscious material to consciousness for rational management.

**Metaphor**
A basement filled with rejected garbage.

---

**JUNG'S VIEW**

**The Collective Unconscious**
Beyond the personal unconscious lies a deeper layer shared by all humanity—the collective unconscious.

**Content**
Archetypes—universal patterns of human experience: the Hero, the Shadow, the Anima/Animus, the Self. Not just personal history but inherited psychic structures.

**Nature**
The unconscious is both dangerous AND profoundly wise. It contains the seeds of wholeness and healing, not just pathology.

**Goal of Analysis**
Individuation—integrating conscious and unconscious into a unified whole. The unconscious is a partner, not an enemy.

**Metaphor**
An ocean connecting all islands, with depths containing both treasure and monsters.

---

**KEY DIFFERENCES**

| Aspect | Freud | Jung |
|--------|-------|------|
| Scope | Personal only | Personal + Collective |
| Content | Repressed material | Archetypal patterns |
| Libido | Sexual energy | Life energy broadly |
| Religion | Illusion to outgrow | Genuine spiritual function |
| Goal | Rational control | Wholeness/individuation |

**Contemporary Relevance**

Both views have merit:
- Freud illuminates how personal history shapes us
- Jung illuminates transpersonal dimensions of psyche

Modern integrative approaches draw from both, recognizing both personal and collective layers of the unconscious.`,
    source: 'History of Psychology',
    tags: ['jung', 'freud', 'unconscious', 'psychology', 'history'],
    readTimeMinutes: 6,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(36),
  },
  {
    cardType: 'contrast',
    accessLevel: 'personal',
    title: 'Eastern vs. Western Psychology',
    subtitle: 'Different maps of the mind',
    content: `Eastern contemplative traditions and Western psychology have developed different approaches to understanding and treating the human mind. Increasingly, they're informing each other.

**WESTERN PSYCHOLOGY**

**Core Assumptions**
- Individual self is the basic unit of analysis
- Mental health = functional ego, adapted to society
- Mind is produced by brain
- Normal waking consciousness is baseline

**Goals**
- Symptom reduction
- Improved functioning
- Strong, coherent sense of self
- Adaptation to reality

**Methods**
- Talk therapy
- Behavioral techniques
- Pharmacology
- Analysis of personal history

**Strengths**
- Rigorous research methodology
- Effective for acute conditions
- Understanding of development and pathology
- Integration with medicine

---

**EASTERN APPROACHES**

**Core Assumptions**
- Self is constructed, not fundamental
- Mental health = liberation from identification with self
- Mind may transcend brain
- Higher states of consciousness are possible

**Goals**
- Freedom from suffering
- Awakening to true nature
- Transcendence of ego
- Compassion for all beings

**Methods**
- Meditation
- Contemplative inquiry
- Ethical discipline
- Teacher-student relationship

**Strengths**
- Sophisticated understanding of attention and awareness
- Technologies for working with mind directly
- Recognition of non-ordinary states
- Emphasis on wisdom and compassion

---

**THE EMERGING INTEGRATION**

Neither approach is complete:
- Western psychology often ignores contemplative development
- Eastern approaches may bypass psychological wounds

**Integrative Models**:
- **Transpersonal Psychology**: Includes higher states in psychological models
- **Contemplative Psychotherapy**: Uses meditation in clinical work
- **Buddhist Psychology + Western**: Mindfulness-based interventions
- **Integral Psychology**: Ken Wilber's "all quadrants, all levels" approach

**Key Insight**

"You have to be somebody before you can be nobody." The ego needs to develop healthily before it can be transcended. Both individual and transpersonal work have their place.

The future likely lies in integration—using Western methods for healing wounds and developing capacity, and Eastern methods for transcending the ego and accessing wisdom.`,
    source: 'Transpersonal Psychology',
    tags: ['eastern', 'western', 'psychology', 'meditation', 'integration'],
    readTimeMinutes: 7,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(37),
  },
  {
    cardType: 'contrast',
    accessLevel: 'practitioner',
    title: 'Top-Down vs. Bottom-Up Approaches',
    subtitle: 'Two paths to transformation',
    content: `Therapeutic approaches can be classified by whether they work primarily through cognition (top-down) or through the body (bottom-up). Understanding both illuminates when to use each.

**TOP-DOWN APPROACHES**

**How They Work**
Change cognition → emotions and behavior follow

**Examples**
- Cognitive Behavioral Therapy (CBT)
- Psychoanalysis/Psychodynamic
- Narrative therapy
- Acceptance and Commitment Therapy (ACT)
- Most talk therapies

**Strengths**
- Strong research base
- Addresses meaning-making
- Works with beliefs and interpretations
- Effective for many conditions
- Accessible (requires only talking)

**Limitations**
- May not access pre-verbal or somatic material
- Can become intellectualized
- Limited effectiveness for trauma stored in body
- May bypass emotional processing
- Less effective when nervous system is dysregulated

---

**BOTTOM-UP APPROACHES**

**How They Work**
Change body/nervous system → cognition and emotion follow

**Examples**
- Somatic Experiencing
- Sensorimotor Psychotherapy
- EMDR
- Breathwork
- Yoga therapy
- Neurofeedback

**Strengths**
- Accesses pre-verbal material
- Works directly with nervous system
- Effective for trauma
- Can shift states that talking cannot reach
- Honors body wisdom

**Limitations**
- Less extensive research base (changing)
- May not address cognitive patterns
- Requires body awareness training
- Can be overwhelming without proper titration
- Meaning-making may still be needed

---

**INTEGRATION**

Most effective treatment integrates both:

**When to Go Top-Down**
- Client has good body awareness and regulation
- Primary issue is cognitive distortions
- Client is in their window of tolerance
- Meaning-making is central to the work

**When to Go Bottom-Up**
- Nervous system is dysregulated
- Trauma is stored in the body
- Client tends to over-intellectualize
- Talk therapy has plateaued
- Pre-verbal experiences are relevant

**Sequencing**
Often:
1. Bottom-up to establish regulation
2. Top-down to process meaning
3. Bottom-up to integrate
4. Both maintained ongoing

The question isn't which is better—it's which is needed now.`,
    source: 'Integrative Psychotherapy',
    tags: ['top-down', 'bottom-up', 'therapy', 'somatic', 'CBT', 'clinical'],
    readTimeMinutes: 6,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(38),
  },
  {
    cardType: 'contrast',
    accessLevel: 'pro',
    title: 'Pathologizing vs. Contextualizing Distress',
    subtitle: 'Is suffering a disorder or a response?',
    content: `Mental health treatment sits between two poles: understanding distress as pathology (disorder) or as contextual response (normal reaction to abnormal circumstances). This tension has profound implications.

**THE PATHOLOGY MODEL**

**Core View**
Mental suffering indicates disorder—dysfunction in the brain/mind requiring diagnosis and treatment.

**Assumptions**
- Distress signals something wrong with the individual
- Symptoms are targets for elimination
- Diagnosis enables appropriate treatment
- Biological substrate underlies psychological problems

**Advantages**
- Validates suffering as real and serious
- Enables research through standardized categories
- Guides treatment selection
- May reduce moral blame ("It's not your fault")
- Allows access to care and accommodations

**Risks**
- Locates problem in individual, ignoring context
- Can become self-fulfilling ("I have X, so I am Y")
- May lead to excessive medication
- Pathologizes normal responses to abnormal situations
- Power dynamics in diagnosis are hidden

---

**THE CONTEXTUAL MODEL**

**Core View**
Much mental distress is a normal response to difficult circumstances—not disorder but adaptation.

**Assumptions**
- Symptoms often make sense in context
- Focus should include circumstances, not just individual
- "Disorders" may be spectrum variations
- Social/political factors create much suffering

**Advantages**
- Validates the person's response as understandable
- Addresses root causes, not just symptoms
- Avoids stigmatizing normal responses
- Includes social justice considerations
- Empowers rather than pathologizes

**Risks**
- May minimize genuine suffering
- Can delay needed treatment
- Some conditions have clear biological bases
- May become ideological rather than practical
- Doesn't provide clear treatment paths

---

**AN INTEGRATED VIEW**

Both perspectives hold truth:

1. **Some conditions have strong biological components**
   Schizophrenia, bipolar disorder, severe OCD have clear biological signatures

2. **Most distress is context-dependent**
   Depression after loss, anxiety in chaotic environments, dissociation after trauma are adaptive

3. **Diagnosis can help AND harm**
   Useful when it guides treatment; harmful when it becomes identity

4. **Individual AND systemic**
   We can help individuals while also working for social change

**Clinical Wisdom**

Ask:
- What is this symptom trying to accomplish?
- What context created this response?
- What would need to change for this to resolve?
- Does diagnosis serve the person's healing?

The goal is not ideology but pragmatism—what understanding best serves this person's liberation from suffering?`,
    source: 'Critical Psychology',
    tags: ['diagnosis', 'pathology', 'context', 'mental health', 'clinical'],
    readTimeMinutes: 7,
    isFeatured: false,
    isDaily: false,
    publishedAt: daysAgo(39),
  },
];

// Export a function to get cards for seeding
export function getSeedCards(): Omit<AskMaiaCard, 'id' | 'createdAt' | 'updatedAt'>[] {
  return SEED_CARDS;
}

// Export card counts for reference
export const SEED_CARD_STATS = {
  total: SEED_CARDS.length,
  byType: {
    daily_transmission: SEED_CARDS.filter(c => c.cardType === 'daily_transmission').length,
    concept: SEED_CARDS.filter(c => c.cardType === 'concept').length,
    practice: SEED_CARDS.filter(c => c.cardType === 'practice').length,
    archetype: SEED_CARDS.filter(c => c.cardType === 'archetype').length,
    deep_dive: SEED_CARDS.filter(c => c.cardType === 'deep_dive').length,
    contrast: SEED_CARDS.filter(c => c.cardType === 'contrast').length,
  },
  byLevel: {
    personal: SEED_CARDS.filter(c => c.accessLevel === 'personal').length,
    practitioner: SEED_CARDS.filter(c => c.accessLevel === 'practitioner').length,
    pro: SEED_CARDS.filter(c => c.accessLevel === 'pro').length,
  },
};
