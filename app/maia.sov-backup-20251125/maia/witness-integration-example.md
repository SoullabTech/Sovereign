# Simple Witness Mode Integration

## The Problem
MAIA's voice mode is sensitive to timing issues and React state changes can throw off the audio pipeline.

## The Solution
A dead-simple witness mode that's just a boolean flag. No complex state, no side effects, no timing issues.

## Integration Steps

### 1. Add to MAIA Page (minimal change)

```tsx
// app/maia/page.tsx
import { SimpleWitnessToggle, WitnessStatus } from '@/components/ui/SimpleWitnessToggle';
import { useSimpleWitnessMode } from '@/hooks/useSimpleWitnessMode';

export default function MAIAPage() {
  // Add this ONE line
  const { isWitnessMode, toggleWitnessMode } = useSimpleWitnessMode();

  // ... existing code ...

  return (
    <div>
      {/* Add toggle button - completely separate from voice UI */}
      <SimpleWitnessToggle
        isWitnessing={isWitnessMode}
        onToggle={toggleWitnessMode}
      />

      <WitnessStatus isActive={isWitnessMode} />

      {/* Pass flag to OracleConversation */}
      <OracleConversation
        userId={explorerId}
        userName={explorerName}
        sessionId={sessionId}
        voiceEnabled={true}
        isWitnessMode={isWitnessMode} // ADD THIS
      />
    </div>
  );
}
```

### 2. Update OracleConversation (minimal change)

```tsx
// components/OracleConversation.tsx

interface OracleConversationProps {
  // ... existing props
  isWitnessMode?: boolean; // ADD THIS
}

// In the component, when processing input:
const handleUserInput = (transcript: string) => {
  // Simple check - no complex logic
  if (props.isWitnessMode) {
    // Just display the message, don't send to MAIA
    addMessageToUI(transcript, 'user');
    return; // STOP HERE - no API call
  }

  // Normal flow - send to MAIA
  sendToMaiaAPI(transcript);
};
```

## Why This Works

1. **No State Interference**: The witness mode is completely separate from voice processing
2. **No Timing Issues**: It's just a boolean check, no async operations
3. **No React Effects**: No useEffect chains that could cause re-renders at bad times
4. **Simple Toggle**: One button, one flag, that's it

## Voice Command Support (Optional)

If you want voice commands, keep them SUPER simple:

```tsx
// In voice transcript handler
if (transcript.toLowerCase().includes("witness mode")) {
  toggleWitnessMode();
  return; // Don't process as normal input
}
```

## Testing

1. Start MAIA normally
2. Click witness toggle - purple eye appears
3. Speak/type - messages appear but MAIA doesn't respond
4. Click toggle again - normal mode resumes
5. NO timing issues, NO voice glitches

## What NOT to Do

❌ Don't add complex state management
❌ Don't add multiple modes at once
❌ Don't add animations that trigger re-renders
❌ Don't add API calls during mode switches
❌ Don't mess with the voice pipeline AT ALL

## The Golden Rule

**If it could possibly interfere with voice timing, DON'T ADD IT.**

The witness mode should be invisible to the voice system - just a simple flag that determines whether to call the API or not.