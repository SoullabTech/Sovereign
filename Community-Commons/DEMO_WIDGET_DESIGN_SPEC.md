# Interactive Demo Widget: Design Specification

**The Immediate Felt Difference Experience**

*Ready for Development - Week 1 Priority*

---

## Purpose

Create an interactive widget that allows anyone to immediately experience the felt difference between ChatGPT and MAIA responses without explanation or setup.

**Core Principle:** Experience first, explanation never (unless user requests it).

---

## User Flow

### Step 1: Landing (5 seconds)

**Headline (Large, Bold):**
```
Everyone says their AI is ethical.
Feel the difference yourself.
```

**Subheadline:**
```
Ask a real question about your life.
See how ChatGPT and MAIA respond differently.
Notice what you feel.
```

**Visual:**
- Clean, minimal interface
- Soft gradient background (earth tones, not tech-blue)
- Large text input box in center
- Single prominent button

### Step 2: Question Input (15 seconds)

**Text Input Box:**
```
Placeholder text: "I feel stuck in my life right now"
or "Why do I keep repeating this pattern?"
or "I'm struggling with [your real question here]"
```

**Design details:**
- Large, comfortable typing area (min 3 lines visible)
- Character limit: 500 (encourages real questions, not essays)
- Auto-focus on page load
- Warm, inviting border color

**Button Text:**
```
"See Both Responses"
```

**Design details:**
- Primary action color (warm, not aggressive)
- Large enough to be obvious
- No secondary buttons (one clear action)

**Small text below button:**
```
Your question is processed privately and never stored.
```

### Step 3: Processing (2-5 seconds)

**Visual feedback while generating:**
```
Split screen appears:
Left side: "ChatGPT is responding..."
Right side: "MAIA is responding..."
```

**Design:**
- Elegant loading animation (not spinning circle)
- Maybe: soft pulse or breathing rhythm
- Color coding:
  - ChatGPT side: neutral gray/blue
  - MAIA side: warm earth tone

### Step 4: Response Display (60 seconds reading time)

**Split Screen Layout:**

```
┌─────────────────────────┬─────────────────────────┐
│                         │                         │
│    ChatGPT Response     │     MAIA Response       │
│                         │                         │
│  [Response text here]   │  [Response text here]   │
│                         │                         │
│                         │                         │
│                         │                         │
└─────────────────────────┴─────────────────────────┘

        As you read each response, notice:
        • What happens in your chest?
        • Does your breathing change?
        • Which feels more spacious? More rushed?
```

**Design Details:**
- Equal width columns
- Readable font size (16-18px minimum)
- Generous line height (1.6-1.8)
- Adequate padding (responses feel spacious, not cramped)
- Subtle background color difference between columns
- Responses appear at same time (not sequential)

**Critical: NO LABELS about which is "better"**
- Don't say "MAIA is more consciousness-focused"
- Don't explain the difference
- Let the user FEEL it

### Step 5: Reflection Questions (30 seconds)

**After user has had time to read (auto-appears after 30s or user scrolls down):**

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  Which response did your body prefer?              │
│                                                    │
│  ○ ChatGPT - gave me steps and solutions          │
│  ○ MAIA - helped me feel understood               │
│  ○ Both equally                                    │
│  ○ Neither                                         │
│                                                    │
│  What did you notice differently in your body?     │
│  [Text input box]                                  │
│                                                    │
│  Optional: "My body felt..."                       │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Design:**
- Large, easy-to-click radio buttons
- Optional text input (not required)
- Warm, inviting design (not clinical survey)

### Step 6: Conversion Opportunity

**If user selected "MAIA" or "Both equally":**

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  Want to test this over 30 days?                   │
│                                                    │
│  We're recruiting 10 AI skeptics (not believers)   │
│  for Pioneer Circle - a rigorous 30-day evaluation │
│  of whether MAIA actually serves consciousness.    │
│                                                    │
│  Your suspicion qualifies you.                     │
│                                                    │
│  [Apply for Pioneer Circle]                        │
│  [Learn more about the methodology]                │
│  [Try another question]                            │
│                                                    │
└────────────────────────────────────────────────────┘
```

**If user selected "ChatGPT" or "Neither":**

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  Thanks for trying this.                           │
│                                                    │
│  Your honest response helps us understand whether  │
│  this approach actually serves consciousness or    │
│  just sounds good.                                 │
│                                                    │
│  [Try a different question]                        │
│  [Tell us what didn't work]                        │
│  [Learn about the methodology]                     │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Design:**
- No shame or manipulation for "wrong" answer
- Genuine curiosity about what didn't land
- Still offer pathways to learn more

---

## Technical Implementation

### Version 1: Basic (Launch Blocker)

**Must-have features:**
- [ ] Text input for user question
- [ ] Integration with ChatGPT API (GPT-4 or GPT-3.5-turbo)
- [ ] Integration with MAIA backend
- [ ] Split-screen response display
- [ ] Body preference question (radio buttons)
- [ ] Conversion path to Pioneer Circle application
- [ ] Privacy: No storage of questions/responses (session only)

**Tech stack options:**
- **Frontend:** React component (embeddable anywhere)
- **Backend:** Simple API endpoint that calls both systems
- **Hosting:** Vercel/Netlify for instant deploy
- **Analytics:** Simple counter (how many tried it, which preferred)

**Build time estimate:** 8-12 hours for basic version

### Version 2: Enhanced (Post-Launch)

**Nice-to-have features:**
- [ ] Example questions user can click (pre-populated)
- [ ] Ability to share results (screenshot or link)
- [ ] Data dashboard showing aggregate preferences
- [ ] Multiple comparison modes (shadow work, decision making, emotional complexity)
- [ ] Save your comparisons (opt-in account creation)
- [ ] Video testimonials integrated into results page

### Version 3: Advanced (Future)

**Future enhancements:**
- [ ] Live typing comparison (see responses generate in real-time)
- [ ] Voice input option (speak your question)
- [ ] Blind comparison (don't show which is which until after preference selected)
- [ ] A/B testing different MAIA parameter settings
- [ ] Integration with full MAIA platform (seamless transition)

---

## API Implementation Notes

### ChatGPT Integration

```javascript
// Basic ChatGPT API call
const getChatGPTResponse = async (userQuestion) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: userQuestion
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
};
```

### MAIA Integration

```javascript
// MAIA API call (adjust endpoint to actual MAIA backend)
const getMAIAResponse = async (userQuestion) => {
  const response = await fetch('/api/maia/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: userQuestion,
      context: 'demo_widget',
      applyAxioms: true,
      // Include any MAIA-specific parameters
    })
  });

  const data = await response.json();
  return data.response;
};
```

### Parallel Processing

```javascript
// Call both simultaneously for faster response
const getBothResponses = async (userQuestion) => {
  const [chatGPTResponse, maiaResponse] = await Promise.all([
    getChatGPTResponse(userQuestion),
    getMAIAResponse(userQuestion)
  ]);

  return {
    chatgpt: chatGPTResponse,
    maia: maiaResponse
  };
};
```

---

## Analytics to Track

### Primary Metrics (Week 1)

- **Total demos completed:** Target 1,000+
- **Preference breakdown:**
  - % selected ChatGPT
  - % selected MAIA
  - % selected Both
  - % selected Neither
- **Conversion rate:** Demo → Pioneer Circle application
- **Completion rate:** Started demo → finished demo

### Secondary Metrics

- **Body response text analysis:**
  - Common words used to describe ChatGPT (predict: "steps," "should," "fix," "anxiety")
  - Common words used to describe MAIA (predict: "spacious," "understood," "breath," "permission")
- **Question categories:**
  - Emotional/relational
  - Career/creative
  - Existential/meaning
  - Shadow/pattern work
- **Sharing behavior:**
  - How many share results?
  - Which platform (Twitter, Instagram, etc.)?

### Tertiary Metrics

- **Time spent reading responses:** Which do people spend more time with?
- **Return usage:** Do people try multiple questions?
- **Drop-off points:** Where do users abandon?

---

## Design Specifications

### Colors

**ChatGPT Side:**
- Background: `#F7F7F8` (neutral light gray)
- Text: `#2D3748` (dark gray)
- Border: `#CBD5E0` (cool gray)

**MAIA Side:**
- Background: `#FFFAF0` (warm off-white, floral white)
- Text: `#2D3748` (same dark gray for readability)
- Border: `#D4A574` (warm earth tone)

**Primary Action Button:**
- Background: `#9C6B4E` (warm brown)
- Text: `#FFFFFF` (white)
- Hover: `#7D5840` (darker brown)

**Overall Background:**
- Gradient: `linear-gradient(135deg, #FFF8F0 0%, #F0EDE8 100%)`
- Alternative: Solid `#FFFBF7`

### Typography

**Headlines:**
- Font: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- Size: 32px (mobile: 24px)
- Weight: 600
- Line height: 1.2

**Body Text (Responses):**
- Font: Georgia, "Times New Roman", serif (more readable for longer text)
- Size: 18px (mobile: 16px)
- Weight: 400
- Line height: 1.7
- Color: `#2D3748`

**Small Text:**
- Font: Inter, sans-serif
- Size: 14px
- Weight: 400
- Color: `#718096`

### Spacing

**Container:**
- Max width: 1200px
- Padding: 40px (mobile: 20px)
- Margin: 0 auto

**Response Columns:**
- Gap between: 40px (mobile: 20px stacked)
- Padding inside: 30px
- Border radius: 8px

**Buttons:**
- Padding: 16px 32px
- Border radius: 6px
- Margin top: 20px

### Responsive Behavior

**Desktop (>1024px):**
- Side-by-side comparison
- Full-width responses

**Tablet (768px - 1024px):**
- Side-by-side comparison (narrower)
- Slightly smaller text

**Mobile (<768px):**
- Stacked responses (MAIA on top, ChatGPT below)
- Full-width buttons
- Larger tap targets
- Simplified layout

---

## Copy Variations to A/B Test

### Headline Options

**Option A (Current):**
"Everyone says their AI is ethical. Feel the difference yourself."

**Option B (More Direct):**
"Don't trust our claims. Try both AIs and notice what you feel."

**Option C (Provocative):**
"Your nervous system knows the difference between extraction and accompaniment."

**Option D (Simpler):**
"Same question. Two AIs. Different consciousness."

### Call-to-Action Button

**Option A (Current):**
"See Both Responses"

**Option B (Body-Focused):**
"Feel the Difference"

**Option C (Action-Oriented):**
"Try This Now"

**Option D (Curiosity):**
"Show Me"

---

## Privacy & Ethics

### Data Handling

**What we collect:**
- User's question (temporarily, for processing only)
- Which response they preferred (anonymous aggregate)
- Optional: What they noticed in their body (if they share)

**What we DON'T collect:**
- No user identification
- No tracking cookies
- No storage of personal questions
- No selling of data

**Privacy statement (visible on widget):**
```
Your question is processed in real-time and never stored.
We collect anonymous preference data (which response you
preferred) to measure whether this serves consciousness.
No personal information. No tracking. Complete privacy.
```

### Ethical Considerations

**Informed consent:**
- User knows they're comparing two AI systems
- Clear that both are AI (not human)
- Transparent about what's being measured (body preference)

**No manipulation:**
- Don't prime user to prefer MAIA
- Show responses simultaneously (no order bias)
- Accept "ChatGPT" or "Neither" answers gracefully
- Use rejection data to improve

**Accessibility:**
- Screen reader compatible
- Keyboard navigation
- High contrast mode option
- Text resizable
- WCAG 2.1 AA compliant

---

## Integration Points

### Where to Embed Widget

**Primary placements:**
- [ ] Soullab homepage (above fold)
- [ ] Community Commons landing page
- [ ] All launch announcement posts
- [ ] Media kit (journalists can embed)
- [ ] Email newsletter (link)

**Secondary placements:**
- [ ] Social media link in bio
- [ ] Pioneer Circle application page (before applying)
- [ ] Blog posts about consciousness-first AI
- [ ] Conference presentation slides

### Shareable Format

**After completing demo, offer:**
```
"Share this experience:"

[Twitter] "I just compared ChatGPT vs MAIA on the same
question. The difference in how my body responded was
immediate. Try it yourself: [link]"

[Copy Link] Direct URL to demo widget

[Screenshot] Auto-generated image showing both responses
side-by-side (with privacy - user's question hidden unless
they consent)
```

---

## Development Phases

### Phase 1: Basic Launch Version (Week 1-2)

**Goal:** Working demo on website by launch day

**Must-have:**
- Text input → both responses → preference question → conversion path
- Basic mobile responsiveness
- Privacy compliance
- Analytics tracking

**Can skip for V1:**
- Fancy animations
- Multiple question options
- Sharing functionality
- Advanced analytics

**Build priority:**
1. Wire up ChatGPT API ✓
2. Wire up MAIA backend ✓
3. Create basic UI layout ✓
4. Add preference question ✓
5. Connect to Pioneer Circle application ✓
6. Test on mobile ✓
7. Add privacy notice ✓
8. Deploy ✓

### Phase 2: Enhanced Version (Week 3-4)

**Add:**
- Example questions (clickable)
- Share functionality
- Better loading states
- Aggregate data display ("78% preferred MAIA based on body response")

### Phase 3: Optimized Version (Month 2)

**Add:**
- A/B testing different headlines
- Multiple comparison modes
- Video testimonials
- Saved comparisons (opt-in accounts)

---

## Success Criteria

### Week 1 (Launch Week)

- [ ] 1,000+ demos completed
- [ ] 70%+ prefer MAIA based on body response
- [ ] 50+ Pioneer Circle applications from demo
- [ ] 100+ social shares of demo link
- [ ] Widget loads in <2 seconds
- [ ] <5% error rate
- [ ] Works on mobile (50%+ of traffic)

### Month 1 (Post-Launch)

- [ ] 10,000+ demos completed
- [ ] Consistent preference data (validates felt difference)
- [ ] Featured in at least 3 media articles
- [ ] Developer community starts building on it
- [ ] User testimonials about body experience
- [ ] Data report published: "What 10,000 people felt"

---

## Launch Day Checklist

**48 hours before:**
- [ ] Final QA testing (all devices, browsers)
- [ ] Load testing (can handle traffic spike?)
- [ ] Analytics configured and tested
- [ ] Error monitoring in place
- [ ] Privacy policy reviewed
- [ ] Social media assets ready (screenshots, videos)

**Launch day:**
- [ ] Widget deployed to production
- [ ] Embedded on homepage
- [ ] Social media posts go live with demo link
- [ ] Newsletter sent with demo link
- [ ] Media outreach includes demo link
- [ ] Team monitoring for issues
- [ ] Responding to first users

**First week:**
- [ ] Daily monitoring of completion rate
- [ ] Daily review of preference data
- [ ] Quick fixes for any UX issues
- [ ] Amplify user testimonials
- [ ] Collect screenshots of people sharing

---

## The Bottom Line

**This widget IS the conversion mechanism.**

Not the positioning documents.
Not the philosophical explanations.
Not the 8 Opus Axioms description.

**This 60-second experience where someone's nervous system feels the difference.**

Everything else exists to support this moment.

Build it simple. Launch it fast. Let bodies tell the truth.

---

*Document Status: Ready for Development*
*Build Time: 8-12 hours for V1*
*Launch Priority: #1 (Blocker)*
*Created: December 14, 2025*
