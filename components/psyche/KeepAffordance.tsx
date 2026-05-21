/**
 * KeepAffordance — small attached UI for conversational keep gestures.
 *
 * Phase 1.5B of the Psyche Engagement Layer.
 * Governed by: docs/canon/THE_CLEARING.md, docs/specs/CONVERSATIONAL_KEEP_INTEGRATION.md
 *
 * Rendered beneath MAIA's message bubble as a footnote-style affordance.
 * NOT a floating system message. The placement implies the keep is about
 * THAT specific response.
 *
 * Three intent kinds in 1.5B:
 *   - 'filed'                — high-confidence filing already executed; persistent confirmation
 *   - 'filing_confirmation'  — low-confidence; chip-style ("File as idea? Yes / No")
 *   - 'offer'                — salience-triggered keep offer ("Keep this for me?")
 *
 * (Gesture-from-conversation deferred until conversation-atom context tracking
 *  is implemented. Conversational gesture instructions in 1.5B are recognized
 *  but not actionable inline — members use the portfolio surface for those.)
 *
 * Discipline:
 *   - Accept morphs into persistent "Kept." that stays in scrollback.
 *   - Decline morphs into "Not kept." that stays in scrollback.
 *   - Stop-asking morphs into a persistent confirmation that pauses are active.
 *   - The component NEVER deletes itself — every member action leaves a visible trace.
 */
'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type {
  AppliedGesture,
  FilingDestination,
  FilingInstruction,
  KeepOffer,
} from '@/lib/psyche/conversational-keep';

// ════════════════════════════════════════════════════════════════════════════
// Public types
// ════════════════════════════════════════════════════════════════════════════

export type KeepIntent =
  | { kind: 'filed'; atomTitle: string; destination: FilingDestination }
  | { kind: 'filing_confirmation'; instruction: FilingInstruction }
  | { kind: 'offer'; offer: KeepOffer };

interface Props {
  intent: KeepIntent;
  sessionId?: string;
  /** Called when the member completes a response (accept, decline, pause, etc.) */
  onResolved?: (result: { accepted: boolean }) => void;
}

// ════════════════════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════════════════════

export function KeepAffordance({ intent, sessionId, onResolved }: Props) {
  const [resolvedText, setResolvedText] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 'filed' arrives pre-resolved — high-confidence command already executed server-side.
  if (intent.kind === 'filed') {
    return <ResolvedNote text={filedText(intent.destination, intent.atomTitle)} />;
  }

  if (resolvedText !== null) {
    return <ResolvedNote text={resolvedText} />;
  }

  async function postResponse(body: Record<string, unknown>): Promise<string | null> {
    setSubmitting(true);
    setError(null);
    try {
      // apiFetch handles iOS Capacitor x-member-id header injection automatically
      const r = await apiFetch('/api/psyche/conversational-keep/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const errText = await r.text().catch(() => '');
        console.error('[KeepAffordance] response failed', r.status, errText);
        setError("Couldn't save right now.");
        return null;
      }
      const data = await r.json();
      return data.confirmation ?? null;
    } catch (err) {
      console.error('[KeepAffordance] response error', err);
      setError("Couldn't save right now.");
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Offer: "Keep this for me?" with Keep / Not now / Stop asking
  // ────────────────────────────────────────────────────────────────────────
  if (intent.kind === 'offer') {
    return (
      <AffordanceShell>
        <span className="text-stone-700">Keep this for me?</span>
        <button
          disabled={submitting}
          onClick={async () => {
            const confirmation = await postResponse({
              kind: 'accept_offer',
              excerpt: intent.offer.excerpt,
              suggestedGesture: intent.offer.suggestedGesture,
              sessionId,
            });
            if (confirmation) {
              setResolvedText(confirmation);
              onResolved?.({ accepted: true });
            }
          }}
          className="text-amber-700 hover:text-amber-900 disabled:text-stone-300"
        >
          Keep
        </button>
        <button
          disabled={submitting}
          onClick={async () => {
            const confirmation = await postResponse({ kind: 'decline_offer' });
            if (confirmation) {
              setResolvedText(confirmation);
              onResolved?.({ accepted: false });
            }
          }}
          className="text-stone-500 hover:text-stone-700 disabled:text-stone-300"
        >
          Not now
        </button>
        <button
          disabled={submitting}
          onClick={async () => {
            const confirmation = await postResponse({ kind: 'pause_offers' });
            if (confirmation) {
              setResolvedText(confirmation);
              onResolved?.({ accepted: false });
            }
          }}
          className="text-stone-400 hover:text-stone-600 text-xs ml-auto disabled:text-stone-300"
        >
          Stop asking
        </button>
        {error && <span className="text-xs text-stone-500 ml-2">{error}</span>}
      </AffordanceShell>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Filing confirmation: chip-style Yes / No
  // ────────────────────────────────────────────────────────────────────────
  if (intent.kind === 'filing_confirmation') {
    return (
      <AffordanceShell>
        <span className="text-stone-700">
          {filingConfirmationText(intent.instruction.destination)}
        </span>
        <button
          disabled={submitting}
          onClick={async () => {
            const confirmation = await postResponse({
              kind: 'confirm_filing',
              instruction: intent.instruction,
            });
            if (confirmation) {
              setResolvedText(confirmation);
              onResolved?.({ accepted: true });
            }
          }}
          className="text-amber-700 hover:text-amber-900 disabled:text-stone-300"
        >
          Yes
        </button>
        <button
          disabled={submitting}
          onClick={() => {
            setResolvedText('Cancelled.');
            onResolved?.({ accepted: false });
          }}
          className="text-stone-500 hover:text-stone-700 disabled:text-stone-300"
        >
          No
        </button>
        {error && <span className="text-xs text-stone-500 ml-2">{error}</span>}
      </AffordanceShell>
    );
  }

  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// Sub-components
// ════════════════════════════════════════════════════════════════════════════

function AffordanceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-center gap-3 text-sm px-3 py-2 bg-stone-100 rounded-md border border-stone-200">
      {children}
    </div>
  );
}

function ResolvedNote({ text }: { text: string }) {
  return (
    <div className="mt-2 text-xs text-stone-500 italic px-3 py-1">
      {text}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Text helpers
// ════════════════════════════════════════════════════════════════════════════

function filingConfirmationText(destination: FilingDestination): string {
  switch (destination) {
    case 'keep':        return 'Keep this for you?';
    case 'ideas':       return 'File this as an idea?';
    case 'decisions':   return 'Save this as a decision?';
    case 'changes':     return 'Save this as a change?';
    case 'journal':     return 'Save this to your journal?';
    case 'dreams':      return 'Save this as a dream?';
    case 'reflections': return 'Save this as a reflection?';
    case 'protected':   return 'Keep this and protect it?';
  }
}

function filedText(destination: FilingDestination, atomTitle: string): string {
  const truncated = atomTitle.length > 60 ? atomTitle.slice(0, 60) + '…' : atomTitle;
  switch (destination) {
    case 'keep':        return `Kept "${truncated}".`;
    case 'ideas':       return `Filed as an idea: "${truncated}".`;
    case 'decisions':   return `Saved as a decision: "${truncated}".`;
    case 'changes':     return `Saved as a change: "${truncated}".`;
    case 'journal':     return `Saved to journal: "${truncated}".`;
    case 'dreams':      return `Saved as a dream: "${truncated}".`;
    case 'reflections': return `Saved as a reflection: "${truncated}".`;
    case 'protected':   return `Kept and protected: "${truncated}".`;
  }
}
