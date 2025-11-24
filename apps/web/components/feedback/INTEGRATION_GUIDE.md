# ExpandedReflectionPanel Integration Guide

## Quick Integration

### 1. In ConversationFlow.tsx

```tsx
import { ExpandedReflectionPanel } from '@/components/feedback'

// Inside your component
{messages.length >= 5 && !feedbackSubmitted && (
  <ExpandedReflectionPanel
    sessionId={sessionId || 'anonymous'}
    messageCount={messages.length}
    triggerAfter={5}
    onSubmitSuccess={() => setFeedbackSubmitted(true)}
  />
)}
```

### 2. In BetaMirror.tsx

```tsx
import { ExpandedReflectionPanel } from '@/components/feedback'

// Add state
const [feedbackShown, setFeedbackShown] = useState(false)

// In render
{messageCount >= 5 && !feedbackShown && (
  <ExpandedReflectionPanel
    sessionId={sessionId}
    messageCount={messageCount}
    onClose={() => setFeedbackShown(true)}
    onSubmitSuccess={() => {
      console.log('✅ Beta feedback captured')
      setFeedbackShown(true)
    }}
  />
)}
```

### 3. In SacredMirror.tsx (Bottom of conversation)

```tsx
<AnimatePresence>
  {messages.length >= 5 && (
    <ExpandedReflectionPanel
      sessionId={sessionId}
      messageCount={messages.length}
      triggerAfter={5}
    />
  )}
</AnimatePresence>
```

## Analytics Integration

The component automatically tracks:
- `feedback_submitted` event with session_id, feeling, and optional fields
- Engagement metrics (has_surprise, has_frustration)
- Trigger context (message count when shown)

## Customization

```tsx
// Trigger after 10 messages instead of 5
<ExpandedReflectionPanel
  triggerAfter={10}
  sessionId={sessionId}
  messageCount={messages.length}
/>

// Custom callbacks
<ExpandedReflectionPanel
  onClose={() => console.log('User skipped feedback')}
  onSubmitSuccess={() => {
    toast.success('Thank you for your reflection!')
  }}
/>
```

## Database Setup

Run in Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS beta_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  feeling text,
  surprise text,
  frustration text,
  created_at timestamptz DEFAULT now()
);

-- Index for quick session lookups
CREATE INDEX idx_beta_feedback_session ON beta_feedback(session_id);
CREATE INDEX idx_beta_feedback_created ON beta_feedback(created_at DESC);
```