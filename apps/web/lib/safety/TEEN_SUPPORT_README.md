# Teen Support System Integration Guide

## Overview

This system provides comprehensive safety, support, and affirmation for teens (ages 13-18) dealing with eating disorders, neurodivergence, and controlling family environments. It was specifically designed for situations like Nathan Kane's family.

## System Components

### 1. ED-Aware Safety System (`edAwareSystem.ts`)
- **Purpose**: Detect eating disorder language and provide appropriate crisis intervention
- **Detection Categories**: Restriction, purging, body image, control, binge, body checking, crisis
- **Severity Levels**: low, moderate, high, crisis
- **Resources**: NEDA Helpline, Crisis Text Line, 988 Lifeline, Trevor Project

### 2. Neurodivergent-Affirming System (`neurodivergentAffirming.ts`)
- **Purpose**: Detect ADHD/autistic patterns and provide affirming support
- **Detection Patterns**: Executive function, sensory overload, masking, social challenges, special interests, RSD
- **Scaffolding**: Concrete strategies for task initiation, focus, time management, sensory regulation
- **Burnout Detection**: Mild, moderate, severe levels with recovery protocols

### 3. Teen Onboarding Flow (`TeenOnboarding.tsx`)
- **Purpose**: Specialized onboarding for teen users
- **Steps**: Welcome → Age/Consent → Neurodivergence Screening → Support Needs → Safety Resources
- **Profiles**: Captures age, neurodivergent status, ED status, family dynamics, support needs

### 4. Integration System (`teenSupportIntegration.ts`)
- **Purpose**: Combines all three systems into a single API
- **Main Functions**:
  - `performTeenSafetyCheck()` - Analyzes messages for all safety concerns
  - `getTeenSystemPrompt()` - Generates context-aware prompts
  - `generateTeenSupportResponse()` - Creates interventions or scaffolds
  - `getTeenResources()` - Provides relevant professional resources

## Quick Start Integration

### Step 1: Add Teen Profile to User State

```typescript
import { TeenProfile } from '@/lib/safety/teenSupportIntegration';

// In your user state management:
interface UserState {
  // ... existing fields
  teenProfile?: TeenProfile;
  isTeenUser?: boolean;
}
```

### Step 2: Use Teen Onboarding (Optional)

```typescript
import TeenOnboarding from '@/components/onboarding/TeenOnboarding';

// In your onboarding flow:
if (userAge >= 13 && userAge <= 18) {
  return <TeenOnboarding onComplete={(profile) => {
    setUserTeenProfile(profile);
    // Continue to main app
  }} />;
}
```

### Step 3: Check Messages in Conversation Handler

```typescript
import {
  performTeenSafetyCheck,
  getTeenSystemPrompt,
  generateTeenSupportResponse,
  requiresTeenSupport
} from '@/lib/safety/teenSupportIntegration';

// In your MAIA conversation handler:
async function handleUserMessage(userMessage: string, teenProfile?: TeenProfile) {
  // Only run safety checks for teen users
  if (!requiresTeenSupport(teenProfile)) {
    // Normal conversation flow
    return;
  }

  // 1. Perform safety check
  const safetyCheck = performTeenSafetyCheck(userMessage, teenProfile);

  // 2. Generate appropriate response
  const supportResponse = generateTeenSupportResponse(
    userMessage,
    safetyCheck,
    teenProfile
  );

  // 3. If immediate intervention required, show it
  if (supportResponse.shouldIntervene) {
    return {
      type: 'intervention',
      message: supportResponse.interventionMessage,
      resources: safetyCheck.edResult?.resources || []
    };
  }

  // 4. Otherwise, add safety context to MAIA's system prompt
  const teenPrompt = getTeenSystemPrompt(teenProfile, safetyCheck);

  // 5. Call MAIA with enhanced prompt
  const maiaResponse = await callMAIA({
    userMessage,
    systemPrompt: baseSystemPrompt + '\n\n' + teenPrompt,
    context: supportResponse.contextForAI
  });

  // 6. Optionally include scaffolding suggestions
  return {
    type: 'conversation',
    message: maiaResponse,
    scaffolds: supportResponse.scaffoldSuggestions || []
  };
}
```

### Step 4: Display Scaffolding Suggestions (Optional)

```typescript
// In your UI component:
{supportResponse.scaffoldSuggestions && (
  <div className="mt-4 p-4 bg-jade-shadow/20 rounded-lg border border-jade-jade/30">
    <h4 className="font-medium text-jade-sage mb-2">
      💡 Strategies that might help:
    </h4>
    <ul className="space-y-2 text-sm text-jade-mineral">
      {supportResponse.scaffoldSuggestions.map((scaffold, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="text-jade-jade mt-0.5">•</span>
          <span>{scaffold}</span>
        </li>
      ))}
    </ul>
  </div>
)}
```

## Example Usage Scenarios

### Scenario 1: Teen with ED mentions restriction

**User Message**: "I've been skipping meals and I just feel fat all the time"

**System Response**:
1. `performTeenSafetyCheck()` detects:
   - ED patterns: restriction, body image
   - Severity: moderate
2. `generateTeenSupportResponse()` returns:
   - `shouldIntervene: false` (not crisis)
   - `contextForAI: "ED PATTERNS DETECTED (moderate): restriction, bodyImage"`
3. `getTeenSystemPrompt()` adds ED-aware guidelines
4. MAIA responds with:
   - Compassionate acknowledgment without judgment
   - Clear boundary: "I can't give advice about food/eating/weight"
   - Professional resource referral: NEDA Helpline
   - Invitation to explore underlying emotions: "What are you really needing?"

### Scenario 2: Neurodivergent teen struggling with task initiation

**User Message**: "I can't start my homework no matter how hard I try. I just stare at it and my brain won't turn on"

**System Response**:
1. `performTeenSafetyCheck()` detects:
   - ND patterns: executive function
   - No crisis
2. `generateTeenSupportResponse()` returns:
   - `shouldIntervene: false`
   - `contextForAI: "NEURODIVERGENT PATTERNS DETECTED: executiveFunction"`
   - `scaffoldSuggestions`:
     - "Set a timer for just 2 minutes: 'I only have to work for 2 minutes, then I can stop'"
     - "Start with the most interesting part first (forget 'logical' order)"
     - "Use the '5-4-3-2-1 launch' method: count down and physically move toward the task"
3. `getTeenSystemPrompt()` adds neurodivergent-affirming guidelines
4. MAIA responds with:
   - Reframe: "Your nervous system needs engagement, not willpower"
   - Affirmation: "ADHD brains are interest-based, not importance-based"
   - Scaffolds displayed in UI
   - Invitation: "What would make this task more interesting or urgent?"

### Scenario 3: Crisis - Suicidal ideation

**User Message**: "I just want to kill myself. I can't do this anymore"

**System Response**:
1. `performTeenSafetyCheck()` detects:
   - Crisis keywords detected
   - Severity: crisis
   - `interventionRequired: true`
2. `generateTeenSupportResponse()` returns:
   - `shouldIntervene: true`
   - `interventionMessage`: Crisis intervention text with immediate resources
3. **Normal conversation flow is blocked**
4. User sees immediate crisis resources:
   - Call or text 988 (Suicide & Crisis Lifeline)
   - Text HOME to 741741 (Crisis Text Line)
   - Go to nearest emergency room
   - Tell a trusted adult NOW

## Design Principles

### 1. Sovereignty-First
- Validates teen's need for autonomy and agency
- Helps them find healthy ways to reclaim control
- Never undermines their self-knowledge
- Supports individuation within family systems

### 2. Neurodivergent-Celebrating
- Reframes ADHD/autistic traits as differences, not deficits
- Celebrates strengths: pattern recognition, hyperfocus, honesty, creativity
- Provides scaffolding without shame
- Teaches self-advocacy skills

### 3. Non-Pathologizing
- Validates the need for control without judging the method
- Acknowledges pain without minimizing struggles
- Focuses on emotional needs underneath behaviors
- Redirects to healthy coping without shame

### 4. Professional Boundaries
- Clear about what MAIA can and cannot do
- Never gives medical/nutritional advice
- Immediate crisis referrals when needed
- Emphasizes professional support as necessary

### 5. Family-Systems Aware
- Understands controlling family dynamics
- Supports healthy boundaries without vilifying parents
- Teaches differentiation: "What do I actually need vs what I'm told to need?"
- Honors connection while supporting autonomy

### 6. Crisis-Ready
- Immediate intervention for safety concerns
- Multiple crisis resources provided
- Urges involvement of trusted adults
- Blocks normal conversation until safety addressed

## Testing

### Manual Testing Checklist

- [ ] ED detection works for all categories (restriction, purging, body image, etc.)
- [ ] Neurodivergent patterns detected accurately
- [ ] Crisis keywords trigger immediate intervention
- [ ] System prompts are added to MAIA's context
- [ ] Scaffolding suggestions are relevant and helpful
- [ ] Professional resources are displayed correctly
- [ ] Teen onboarding flow completes successfully
- [ ] Parental consent is handled appropriately

### Test Cases

```typescript
// Test ED detection
const testED = performTeenSafetyCheck("I've been throwing up after meals");
console.assert(testED.isED === true);
console.assert(testED.edResult?.severity === 'high');

// Test ND detection
const testND = performTeenSafetyCheck("I can't focus on anything and time just disappears");
console.assert(testND.isNeurodivergent === true);
console.assert(testND.ndPatterns?.includes('executiveFunction'));

// Test crisis detection
const testCrisis = performTeenSafetyCheck("I want to kill myself");
console.assert(testCrisis.isCrisis === true);
console.assert(testCrisis.interventionRequired === true);
```

## Resources Provided

### Eating Disorder Support
- **NEDA Helpline**: 1-800-931-2237 (Mon-Thu 9am-9pm ET, Fri 9am-5pm ET)
- **NEDA Crisis Text Line**: Text "NEDA" to 741741 (24/7)

### Crisis Support
- **988 Suicide & Crisis Lifeline**: Call or Text 988 (24/7)
- **Crisis Text Line**: Text HOME to 741741 (24/7)

### LGBTQ+ Support
- **The Trevor Project**: 1-866-488-7386 or text START to 678678 (24/7)

## Next Steps

### Phase 2: Additional Features
1. **"Find Your No" Practice Sequences**
   - Low-stakes boundary-setting exercises
   - Progressive difficulty levels
   - Celebration of successful boundaries

2. **Family Dashboard**
   - Parent oversight with appropriate privacy
   - Progress tracking without invasiveness
   - Communication tools for family sessions

3. **Clinical Partnership Integration**
   - Therapist/dietitian collaboration features
   - Professional review of system responses
   - Evidence-based protocol refinement

4. **Peer Support**
   - Moderated teen community
   - Shared experiences without triggering content
   - Mentor matching (recovered teens → current teens)

## Support

For questions or issues with the teen support system, contact:
- Technical: Review code in `/apps/web/lib/safety/`
- Clinical: Consult with eating disorder specialists and teen therapists
- Implementation: See examples in this README

---

**Remember**: This system is a support tool, not a replacement for professional mental health care. Always err on the side of caution with crisis situations.
