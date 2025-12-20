# Trust & Transparency Integration Patch

## Exact Changes for `/components/chat/ChatMessage.tsx`

### 1. Add imports (after line 6)

```typescript
import { useTrustReceiptsEnabled } from '@/lib/ui/trustReceipts';
import { TrustDrawer } from '@/components/trust/TrustDrawer';
```

### 2. Add state inside `ChatMessage` component (after line 27, before line 28)

```typescript
export function ChatMessage({ message, isLatest = false, onPlayAudio }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasAudio = message.audioUrl && message.role === 'assistant';
  const hasCitations = message.citations && message.citations.length > 0;

  // ADD THESE TWO LINES:
  const { enabled: trustReceiptsEnabled } = useTrustReceiptsEnabled();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
```

### 3. Replace the timestamp section (lines 92-97) with this:

**OLD CODE:**
```typescript
          <time className="text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </time>
```

**NEW CODE:**
```typescript
          <time className="text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </time>
          {/* Trust Receipts Icon - only show for MAIA messages when enabled */}
          {!isUser && trustReceiptsEnabled && (
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors px-1"
              onClick={() => setDrawerOpen(true)}
              aria-label="Trust details"
              title="View trust & transparency details"
            >
              ⓘ
            </button>
          )}
```

### 4. Add TrustDrawer at the end of the return statement (after line 171, before the closing div on line 172)

```typescript
          )}
        )}

        {/* Trust Drawer - only for MAIA messages */}
        {!isUser && (
          <TrustDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            metadata={message.metadata}
          />
        )}
      </div>
    </div>
  );
}
```

---

## Complete Patched Section (lines 54-174)

Here's what the complete `ChatMessage` component should look like after the changes:

```typescript
export function ChatMessage({ message, isLatest = false, onPlayAudio }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasAudio = message.audioUrl && message.role === 'assistant';
  const hasCitations = message.citations && message.citations.length > 0;

  // Trust & Transparency state
  const { enabled: trustReceiptsEnabled } = useTrustReceiptsEnabled();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const getElementColor = (element?: string) => {
    const colors = {
      fire: 'text-red-400',
      water: 'text-blue-400',
      earth: 'text-green-400',
      air: 'text-amber-400',
      aether: 'text-gold-divine'
    };
    return element ? colors[element as keyof typeof colors] || 'text-gold-divine' : 'text-gold-divine';
  };

  const getElementEmoji = (element?: string) => {
    const emojis = {
      fire: '🔥',
      water: '💧',
      earth: '🌱',
      air: '💨',
      aether: '✨'
    };
    return element ? emojis[element as keyof typeof emojis] || '✨' : '✨';
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} ${isLatest ? 'mb-6' : 'mb-4'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser
          ? 'bg-blue-500/20 border border-blue-500/30'
          : 'bg-gold-divine/20 border border-gold-divine/30'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-blue-400" />
        ) : (
          <Sparkles className={`w-4 h-4 ${getElementColor(message.metadata?.element)}`} />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'} max-w-[80%]`}>
        {/* Message Header */}
        <div className={`flex items-center gap-2 mb-1 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className={isUser ? 'text-soul-textSecondary' : 'text-soul-textSecondary'}>
            {isUser ? 'You' : 'Maya'}
          </span>
          {message.metadata?.element && !isUser && (
            <>
              <span>·</span>
              <span className={getElementColor(message.metadata.element)}>
                {getElementEmoji(message.metadata.element)} {message.metadata.element}
              </span>
            </>
          )}
          {message.metadata?.confidence && !isUser && (
            <>
              <span>·</span>
              <span className="text-gray-500">
                {Math.round(message.metadata.confidence * 100)}%
              </span>
            </>
          )}
          <time className="text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </time>
          {/* Trust Receipts Icon - only show for MAIA messages when enabled */}
          {!isUser && trustReceiptsEnabled && (
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors px-1"
              onClick={() => setDrawerOpen(true)}
              aria-label="Trust details"
              title="View trust & transparency details"
            >
              ⓘ
            </button>
          )}
        </div>

        {/* Message Bubble */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            ...(message.role === 'assistant' && {
              boxShadow: [
                "0 0 0px rgba(139, 92, 246, 0.3)",
                "0 0 16px rgba(139, 92, 246, 0.6)",
                "0 0 0px rgba(139, 92, 246, 0.3)"
              ]
            })
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
            boxShadow: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className={`relative p-4 rounded-2xl ${
            isUser
              ? 'bg-soul-surface/40 border border-soul-accent/30'
              : 'bg-soul-surface/60 border border-soul-accent/20'
          }`}>

          {/* Audio Play Button */}
          {hasAudio && (
            <button
              onClick={() => onPlayAudio?.(message.audioUrl!)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-soul-accent/20 hover:bg-soul-accentGlow/30 border border-soul-accent/40 rounded-full flex items-center justify-center transition-colors"
              title="Play Maya&apos;s voice"
            >
              <div className="w-0 h-0 border-l-[6px] border-l-soul-accentGlow border-y-[3px] border-y-transparent ml-0.5" />
            </button>
          )}

          {/* Message Text */}
          <div className="max-w-none">
            <p className={`whitespace-pre-wrap leading-relaxed mb-0 ${
              isUser ? 'text-soul-textSecondary' : 'text-soul-textSecondary'
            }`}>
              {message.content}
            </p>
          </div>

          {/* Citations - only show if memory references are enabled */}
          {hasCitations && process.env.NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED === 'true' && (
            <div className="mt-3 pt-3 border-t border-gold-divine/10">
              <div className="text-xs text-gold-amber/60 mb-2 font-medium">
                Referenced from your library:
              </div>
              <CitationList citations={message.citations!} />
            </div>
          )}
        </motion.div>

        {/* Citation Summary (for messages with many citations) */}
        {hasCitations && message.citations!.length > 3 && process.env.NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED === 'true' && (
          <div className="mt-2 text-xs text-gray-400">
            <span>Referenced {message.citations!.length} sources from </span>
            <span className="text-gold-divine">
              {[...new Set(message.citations!.map(c => c.fileName))].length}
            </span>
            <span> files</span>
          </div>
        )}

        {/* Trust Drawer - only for MAIA messages */}
        {!isUser && (
          <TrustDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            metadata={message.metadata}
          />
        )}
      </div>
    </div>
  );
}
```

---

## Testing the Integration

1. **Enable Trust Receipts** - Open browser console and run:
   ```javascript
   localStorage.setItem('maia:trustReceiptsEnabled', 'true');
   window.location.reload();
   ```

2. **Check for ⓘ icon** - You should now see a small ⓘ icon next to MAIA's message timestamps

3. **Click the icon** - Should open the Trust Drawer showing memory metadata

4. **Disable Trust Receipts** - Run in console:
   ```javascript
   localStorage.setItem('maia:trustReceiptsEnabled', 'false');
   window.location.reload();
   ```

---

## Next Steps: Add Settings Toggle

Create a settings panel component that allows users to toggle this preference without console commands. Example location: `/components/settings/TrustSettings.tsx`

```typescript
"use client";

import React from "react";
import { useTrustReceiptsEnabled } from "@/lib/ui/trustReceipts";

export function TrustSettings() {
  const { enabled, setEnabled } = useTrustReceiptsEnabled();

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Trust & Transparency</h3>
      <p className="text-sm text-gray-600">
        MAIA's memory system is certified to persist your conversation history
        and never fabricate details when memory is absent. By default, we keep
        this relationship intimate — but you can see the receipts anytime.
      </p>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">
          Show trust details (ⓘ icon) on messages
        </span>
      </label>
      {enabled && (
        <p className="text-xs text-gray-500 pl-7">
          When enabled, you'll see an ⓘ icon on MAIA's messages. Click it to
          view memory injection details.
        </p>
      )}
    </div>
  );
}
```
