# Fixing Original PersonalOracleAgent

## Issue 1: OracleStateMachineManager Constructor

**Error**: `Expected 2-3 arguments, but got 0`

**Fix**: Update PersonalOracleAgent.ts line 188:

```typescript
// OLD:
this.stateMachineManager = new OracleStateMachineManager();

// NEW:
this.stateMachineManager = new OracleStateMachineManager(
  new CapacitySignalsFramework(), // You'll need to import and create this
  new ProtectiveFrameworkService() // You'll need to import and create this
);
```

## Issue 2: Missing Methods

Add these methods to `src/core/OracleStateMachineManager.ts`:

```typescript
// Add after line 686
applyStageFilters(userId: string, input: string, response: string): string {
  // Crisis override always comes first
  const crisisOverride = this.applyCrisisOverride(input);
  if (crisisOverride) return crisisOverride;

  return response; // Simplified for now
}

private applyCrisisOverride(input: string): string | null {
  const crisisKeywords = [
    'want to die', 'end it all', 'kill myself', 'not worth living',
    'want to disappear', 'can\'t go on', 'no point in living'
  ];
  
  const lowerInput = input.toLowerCase();
  const isCrisis = crisisKeywords.some(keyword => lowerInput.includes(keyword));
  
  if (isCrisis) {
    return "I hear that you're going through something very difficult right now. Your wellbeing is what matters most. If you're in immediate danger, please reach out to emergency services or a crisis hotline.";
  }
  
  return null;
}
```

## Issue 3: TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020", // Already set
    "downlevelIteration": true, // ADD THIS LINE
    // ... rest of config
  }
}
```

## Issue 4: Missing activeOnboardingCondition

Comment out the problematic line in PersonalOracleAgent.ts around line 322:

```typescript
// OLD:
const masteryVoiceActive = (effectiveStageConfig.stage === "transparent_prism" && 
                           stageSummary.relationshipMetrics.trustLevel >= 0.75) ||
                          (activeOnboardingCondition?.name === 'integrationReadiness');

// NEW:
const masteryVoiceActive = (effectiveStageConfig.stage === "transparent_prism" && 
                           stageSummary.relationshipMetrics?.trustLevel >= 0.75);
// activeOnboardingCondition temporarily disabled
```

## Decision Point

**Recommendation**: Keep using the simplified system (`PersonalOracleAgentSimplified`) which works perfectly for readiness testing. Fix the original agent separately when you have time to properly integrate the state machine architecture.

**Current Working Commands**:
- ✅ `npm run test:readiness` 
- ✅ `npm run readiness-check`
- ✅ `npm run readiness-check -- --mode=quick`