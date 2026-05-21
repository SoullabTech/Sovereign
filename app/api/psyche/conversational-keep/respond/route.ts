/**
 * POST /api/psyche/conversational-keep/respond
 *
 * Member's response to a conversational keep affordance.
 *
 * Phase 1.5B of the Psyche Engagement Layer.
 * Governed by: docs/canon/THE_CLEARING.md, docs/specs/CONVERSATIONAL_KEEP_INTEGRATION.md
 *
 * Handles six response kinds:
 *   - accept_offer       → file via offer_accepted path + recordAccept
 *   - decline_offer      → recordDecline (no file)
 *   - pause_offers       → pauseOffers (optional `until` for timed snooze)
 *   - resume_offers      → resumeOffers
 *   - confirm_filing     → file via instruction + (no separate accept record for explicit filings)
 *   - confirm_gesture    → gesture via instruction (1.5B: reserved; target resolution still pending)
 *
 * All responses return a `{ confirmation: string }` payload for the UI to display
 * as a persistent scrollback note.
 *
 * Auth: getMemberIdFromRequest (cookies + x-member-id header).
 *
 * Per the integration spec: this endpoint is gesture-shaped, never accepts a
 * generic patch. memberId always overrides any value in the body.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  applyConversationalKeepResult,
} from '@/lib/psyche/conversational-keep';
import type {
  AppliedGesture,
  FilingInstruction,
  GestureInstruction,
  KeepOffer,
  KeepOfferReason,
} from '@/lib/psyche/conversational-keep';
import {
  pauseOffers,
  recordAccept,
  recordDecline,
  resumeOffers,
} from '@/lib/psyche/keep-governor';

// ════════════════════════════════════════════════════════════════════════════
// Validation
// ════════════════════════════════════════════════════════════════════════════

const VALID_FILING_DESTINATIONS = new Set([
  'keep', 'ideas', 'decisions', 'changes', 'journal', 'dreams', 'reflections', 'protected',
]);

const VALID_GESTURES: Set<AppliedGesture> = new Set([
  'still_alive', 'set_aside', 'protect', 'archive', 'return_to_active',
]);

const VALID_KEEP_OFFER_REASONS: Set<KeepOfferReason> = new Set([
  'explicit_remember', 'explicit_matters', 'decision_language',
  'threshold_language', 'dream_language', 'returning_pattern_language',
  'soft_gesture_invitation',
]);

function isFilingInstruction(x: unknown): x is FilingInstruction {
  if (!x || typeof x !== 'object') return false;
  const i = x as Record<string, unknown>;
  return (
    i.intent === 'file_member_material' &&
    typeof i.destination === 'string' &&
    VALID_FILING_DESTINATIONS.has(i.destination) &&
    i.memberDirected === true &&
    typeof i.excerpt === 'string'
  );
}

function isGestureInstruction(x: unknown): x is GestureInstruction {
  if (!x || typeof x !== 'object') return false;
  const i = x as Record<string, unknown>;
  return (
    i.intent === 'apply_gesture' &&
    typeof i.gesture === 'string' &&
    VALID_GESTURES.has(i.gesture as AppliedGesture) &&
    i.memberDirected === true
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Handler
// ════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || !('kind' in body)) {
    return NextResponse.json({ error: 'Body must include kind' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const kind = b.kind;
  if (typeof kind !== 'string') {
    return NextResponse.json({ error: 'kind must be a string' }, { status: 400 });
  }

  try {
    switch (kind) {
      // ──────────────────────────────────────────────────────────────────
      // accept_offer — member said "Keep" on a salience-triggered offer
      // ──────────────────────────────────────────────────────────────────
      case 'accept_offer': {
        if (typeof b.excerpt !== 'string' || b.excerpt.trim().length === 0) {
          return NextResponse.json({ error: 'excerpt required' }, { status: 400 });
        }
        let suggestedGesture: AppliedGesture | undefined;
        if (typeof b.suggestedGesture === 'string') {
          if (!VALID_GESTURES.has(b.suggestedGesture as AppliedGesture)) {
            return NextResponse.json({ error: 'Invalid suggestedGesture' }, { status: 400 });
          }
          suggestedGesture = b.suggestedGesture as AppliedGesture;
        }

        const offer: KeepOffer = {
          type: 'keep_offer',
          excerpt: b.excerpt,
          // Reason is not actually used in apply; the offer carries it for diagnostic
          // continuity only. Default to explicit_remember if not supplied.
          reason: (typeof b.reason === 'string' && VALID_KEEP_OFFER_REASONS.has(b.reason as KeepOfferReason))
            ? (b.reason as KeepOfferReason)
            : 'explicit_remember',
          suggestedGesture,
        };

        const sessionId = typeof b.sessionId === 'string' ? b.sessionId : undefined;

        const atom = await applyConversationalKeepResult(memberId, {
          kind: 'offer_accepted',
          offer,
          context: { sessionId },
        });

        await recordAccept(memberId);

        const truncated = atom.title.length > 60 ? atom.title.slice(0, 60) + '…' : atom.title;
        const confirmation = suggestedGesture
          ? `Marked "${truncated}" — ${suggestedGesture.replace('_', ' ')}.`
          : `Kept "${truncated}".`;

        return NextResponse.json({ confirmation, atom });
      }

      // ──────────────────────────────────────────────────────────────────
      // decline_offer — member said "Not now"
      // ──────────────────────────────────────────────────────────────────
      case 'decline_offer': {
        await recordDecline(memberId);
        return NextResponse.json({ confirmation: 'Not kept.' });
      }

      // ──────────────────────────────────────────────────────────────────
      // pause_offers — member said "Stop asking" (or used the chip)
      // ──────────────────────────────────────────────────────────────────
      case 'pause_offers': {
        let until: Date | undefined;
        if (typeof b.until === 'string') {
          const parsed = new Date(b.until);
          if (isNaN(parsed.getTime())) {
            return NextResponse.json({ error: 'Invalid until timestamp' }, { status: 400 });
          }
          until = parsed;
        }
        await pauseOffers(memberId, until);
        return NextResponse.json({
          confirmation: until
            ? `I'll pause until ${until.toLocaleDateString()}.`
            : "I'll stop offering. You can say 'ask again' when you want.",
        });
      }

      // ──────────────────────────────────────────────────────────────────
      // resume_offers — member said "you can ask again"
      // ──────────────────────────────────────────────────────────────────
      case 'resume_offers': {
        await resumeOffers(memberId);
        return NextResponse.json({ confirmation: 'Okay, I can ask again.' });
      }

      // ──────────────────────────────────────────────────────────────────
      // confirm_filing — member said "Yes" on a low-confidence filing chip
      // ──────────────────────────────────────────────────────────────────
      case 'confirm_filing': {
        if (!isFilingInstruction(b.instruction)) {
          return NextResponse.json({ error: 'Valid instruction required' }, { status: 400 });
        }
        const atom = await applyConversationalKeepResult(memberId, {
          kind: 'filing',
          instruction: b.instruction,
          context: {},
        });
        const truncated = atom.title.length > 60 ? atom.title.slice(0, 60) + '…' : atom.title;
        return NextResponse.json({
          confirmation: `Saved "${truncated}".`,
          atom,
        });
      }

      // ──────────────────────────────────────────────────────────────────
      // confirm_gesture — reserved for Phase 2 (target resolution pending)
      // ──────────────────────────────────────────────────────────────────
      case 'confirm_gesture': {
        if (!isGestureInstruction(b.instruction)) {
          return NextResponse.json({ error: 'Valid instruction required' }, { status: 400 });
        }
        const targetAtomId = b.targetAtomId;
        if (typeof targetAtomId !== 'string' || targetAtomId.length === 0) {
          return NextResponse.json({
            error: 'targetAtomId required (Phase 2 will resolve from conversation context)',
          }, { status: 400 });
        }
        const atom = await applyConversationalKeepResult(memberId, {
          kind: 'gesture',
          instruction: b.instruction,
          context: { targetAtomId },
        });
        return NextResponse.json({ confirmation: 'Done.', atom });
      }

      default:
        return NextResponse.json({ error: `Unknown kind: ${kind}` }, { status: 400 });
    }
  } catch (err: any) {
    // 23505 = unique violation (e.g., session_excerpt already kept)
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'Already saved' }, { status: 409 });
    }
    console.error('[POST /api/psyche/conversational-keep/respond]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
