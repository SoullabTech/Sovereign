# 🌀 Claude Code Playbook for Soullab Beta

*A systematic prompt series for maintaining clean, functional, and soulful code*

This playbook provides engineered prompts that guide Claude through review, refinement, and generation. Each prompt builds on the last, maintaining Soullab's "everyday sacred" design principle.

## 🎯 Core Principles

- **Everyday Sacred**: Soulful without being "woo" or mystical
- **Soullab Palette**: Terracotta (#E07A5F), Sage (#81B29A), Ocean (#3D405B), Amber (#F2CC8F)
- **Typography**: Blair (headers) + Lato (body)
- **Performance**: <2s response times, graceful degradation
- **No Purple**: Avoid purple/indigo/violet - stay earthy and grounded

---

## Phase 1: Pre-Beta (Prompts 1-4)

### 1. 🔍 Audit & Refactor

```
You are a senior front-end engineer reviewing Soullab's Beta Mirror codebase. 

Task: Perform a complexity audit and refactor.

- Identify unused imports, console.logs, and duplicated logic
- Suggest simplifications without removing the voice/text hybrid power
- Flag "complexity debt" (nested conditions, over-engineered state)
- Rewrite the code with clarity, minimalism, and brand consistency

Keep the "everyday sacred" design principle - soulful but not mystical.

Focus on these key files:
- components/voice/ContinuousConversation.tsx
- components/chat/ChatInput.tsx
- hooks/useMayaStream.ts
- components/OracleInterface.tsx

Output: Clean, simplified code with technical debt removed.
```

### 2. 🎨 UI/UX Polish

```
You are now the UI/UX design assistant.

Task: Refine Soullab's chat + onboarding flows.

- Apply Soullab color tokens (Terracotta #E07A5F, Sage #81B29A, Ocean #3D405B, Amber #F2CC8F)
- Enforce Blair font (headers) + Lato font (body text)
- Add micro-interactions (breathing 1.6s cycles, stagger 150ms delays, hover 1.05x scale)
- Ensure elegance: minimal, no "woo," just soulful clarity
- Remove any purple/indigo/violet colors - stay earthy

Generate updated Tailwind classes + Framer Motion specs.

Focus on:
- Button hover states and active feedback
- Message bubble animations
- Loading state transitions
- Voice recording visual feedback

Output: Polished components with Soullab design system applied.
```

### 3. ♿ Accessibility & Responsiveness

```
Review all Soullab Beta Mirror components.

Task: Add accessibility + responsiveness.

- Ensure keyboard navigation works (Tab, Enter, ESC)
- Provide aria-labels for voice buttons, sliders, and charts
- Add reduced-motion fallbacks for users with motion sensitivity
- Confirm layouts adapt fluidly (mobile-first → desktop)
- Test with screen readers in mind

Output tested React code with:
- Proper ARIA roles and labels
- Semantic HTML structure
- Tailwind responsive breakpoints
- Focus management for modal/overlay states

Verify these components:
- VoiceRecorder button states
- Chat input accessibility
- Theme toggle keyboard navigation
- Dashboard chart screen reader support
```

### 4. 🎤 Voice/Text Hybrid Stability

```
Focus on the HybridVoiceInput + ConversationFlow system.

Task: Guarantee reliability.

- Fix no-speech errors gracefully (timeout handling)
- Ensure transcripts always send before voice restart
- Handle Safari/iOS audio unlock edge cases
- Add unit tests for voice ↔ text switching
- Prevent memory leaks in audio processing
- Add fallback modes when voice fails

Generate updated ContinuousConversation.tsx with:
- Robust error boundaries
- Clean state management
- Safari-specific audio context handling
- Graceful degradation to text-only mode

Test scenarios to handle:
- Microphone permission denied
- Network interruption during voice
- Browser tab backgrounding
- iOS Safari audio context issues
```

---

## Phase 2: Beta Prep (Prompts 5-7)

### 5. 📊 Analytics & Control Room

```
You are now an analytics engineer.

Task: Validate Soullab Beta Control Room instrumentation.

- Check that audio unlock, reflections, and theme events all dual-write to Supabase
- Add event logging for HybridInput mode switches (text↔voice transitions)
- Verify daily aggregation APIs return in <2s
- Ensure dashboard widgets use Soullab earthy palette (no purple/indigo)
- Add error tracking for voice pipeline failures

Verify these endpoints work correctly:
- /api/analytics/overview
- /api/analytics/audio
- /api/analytics/reflections
- /api/analytics/theme

Output:
- Performance-optimized analytics queries
- Clean dashboard components using soullabColors
- Event logging that doesn't impact UX
- Error monitoring without breaking user flow

Suggest optimizations to keep dashboards performant and soulful.
```

### 6. 🎨 Figma/Uizard Sync

```
You are now working with design tools.

Task: Output design tokens + prompts for Figma and Uizard.

Generate JSON export for Soullab design system:
- Colors: Terracotta, Sage, Ocean, Amber with opacity variants
- Typography: Blair (headers), Lato (body) with size scales
- Spacing: 4px grid system
- Border radius: Consistent rounding (8px, 12px, 16px)
- Motion: Breathing (1.6s), Hover (150ms), Stagger (150ms)

Create 2 design exploration directions:
1. **Minimalist**: Apple-like clarity, clean lines, subtle depth
2. **Soulful**: Gentle auras, organic shapes, warm gradients

Output ready-to-import design tokens as:
- Figma variables JSON
- CSS custom properties
- Tailwind config extensions
- Uizard component prompts

Provide specific prompts for:
- Chat interface mockups
- Voice recording states
- Dashboard layout variations
```

### 7. 🚀 Pre-Flight Deployment

```
Act as DevOps engineer.

Task: Prepare for beta launch.

Run these checks:
1. Execute ./scripts/beta-cleanup.sh if it exists
2. Remove test files and temporary assets
3. Replace console.logs with proper analytics logging or safe debug statements
4. Run typecheck validation: npm run typecheck
5. Run build verification: npm run build
6. Check environment variables are properly configured
7. Verify API endpoints respond correctly

Security checklist:
- No hardcoded API keys in client code
- Supabase RLS policies properly configured
- Error messages don't leak sensitive data
- CORS settings appropriate for production

Performance verification:
- Bundle size analysis
- Core Web Vitals check
- Voice pipeline latency testing
- Dashboard load times

Output comprehensive go/no-go deployment readiness report with:
- Passed/failed checklist items
- Performance benchmarks
- Rollback plan documentation
- Critical path dependencies
```

---

## Phase 3: Post-Beta Evolution (Prompt 8)

### 8. ✨ Ceremonial Layer

```
You are now the sacred technology designer.

Task: Prepare for the post-beta ceremonial upgrade.

Add subtle sacred elements while maintaining performance:
- Gentle aura glows on active voice states
- Gradient thresholds that respond to engagement depth  
- Subtle ripple effects on message send
- Breathing animations for waiting states

CRITICAL CONSTRAINTS:
- Keep response times <2s (sacred should never slow the experience)
- Maintain "everyday sacred" - avoid mystical cliché
- No overwhelming visual effects
- Respect user's reduced-motion preferences

Motion specifications:
- Aura glow: 3s breathing cycle, 0.1 opacity range
- Ripples: 800ms duration, fade-out only
- Gradient shifts: 2s transitions, subtle stops
- Sacred geometry: Simple golden ratio proportions

Generate:
- Motion specification document
- Example React components with Framer Motion
- Progressive enhancement strategy (add ceremonial only after core stability)
- A/B testing plan for ceremonial vs. minimal modes

Focus on these enhancement areas:
- Voice recording feedback (gentle glow)
- Message sending (subtle ripple)
- Maia response arrival (breathing light)
- Reflection submission (completion aura)
```

---

## 🔄 Usage Workflow

### Pre-Beta Sequence
1. **Week -3**: Run Prompt 1 (Audit & Refactor)
2. **Week -2**: Run Prompt 2 (UI/UX Polish) 
3. **Week -2**: Run Prompt 3 (Accessibility & Responsiveness)
4. **Week -1**: Run Prompt 4 (Voice/Text Hybrid Stability)

### Beta Launch Sequence  
5. **Week -1**: Run Prompt 5 (Analytics & Control Room)
6. **Week 0**: Run Prompt 6 (Figma/Uizard Sync) for designer handoff
7. **Deploy Day**: Run Prompt 7 (Pre-Flight Deployment)

### Post-Beta Evolution
8. **Month +1**: Run Prompt 8 (Ceremonial Layer) after proven stability

---

## 📋 Quick Reference

### File Paths to Focus On
```
components/
├── voice/ContinuousConversation.tsx
├── chat/ChatInput.tsx  
├── OracleInterface.tsx
├── ui/ThemeToggle.tsx
└── dashboard/OverviewDashboard.tsx

hooks/
├── useMayaStream.ts
└── useVoiceRecorder.ts

lib/
├── theme/soullabColors.ts
└── supabase/client.ts

app/api/
├── analytics/overview/route.ts
├── analytics/theme/route.ts
└── maya-chat/route.ts
```

### Soullab Design Tokens
```typescript
const soullabColors = {
  red: '#E07A5F',     // Terracotta - alerts, failures
  green: '#81B29A',   // Sage - success, positive metrics  
  blue: '#3D405B',    // Ocean - primary actions, trends
  yellow: '#F2CC8F',  // Amber - highlights, active states
  // NO PURPLE/INDIGO/VIOLET
}
```

### Performance Benchmarks
- API response: <2s
- Voice processing: <1s  
- Page load: <3s
- Bundle size: <500KB gzipped

---

## 🎯 Team Usage

**Developers**: Copy-paste prompts into Claude Code sessions for systematic code review

**Designers**: Use Prompt 6 for Figma/Uizard token generation  

**DevOps**: Use Prompt 7 before each deployment

**Product**: Use full sequence for major feature releases

---

*This playbook maintains Soullab's sacred technology vision while ensuring production-ready quality. Each prompt builds systematic excellence into the codebase.*