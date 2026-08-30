'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { GROUND, INK, RADIUS, RULE, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';
import { useMemberIdentity } from '../useMemberIdentity';
import { handoffToMaia } from '../workContext';
import type { LivingWork } from '../useLivingWorks';

/**
 * WS2-03D — MAIA's conversation, inside the Studio.
 *
 * ── THE CANONICAL RUNTIME, IN A DIFFERENT CONTAINER ────────────────────────
 *
 * This spawns no Writer's-Studio conversation engine. It renders
 * `OracleConversation` — the same component `/maia` renders, posting to the
 * same canonical endpoint, minting the same turns, carrying the same
 * `workContext`, and therefore inheriting SITUATED-WORK-DEEP-01 unchanged.
 * Only the container differs.
 *
 * That is the whole design. A second conversation model would have been the
 * easy path and would have forked prompt composition, memory, provenance and
 * containment on day one.
 *
 * Loaded dynamically because it is a very large component and the Studio must
 * not pay for it until a member actually opens Conversations. `ssr: false`
 * because it is thoroughly a client surface.
 *
 * ── IDENTITY FAILS CLOSED ──────────────────────────────────────────────────
 *
 * No server-resolved member, no conversation. The panel says so rather than
 * opening an exchange it cannot name the participant in. Identity comes from
 * /api/members/me — never from browser storage, which is member-editable and
 * would make the most load-bearing id in the room a claim.
 *
 * ── CONVERSATION IDENTITY IS GIVEN, NEVER DISCOVERED ───────────────────────
 *
 * `conversationId` is minted by the Studio when the panel first opens and
 * passed in. This component never asks which conversation belonged to this
 * Work — that is a most-recent question and the answer would be a guess.
 */

const OracleConversation = dynamic(() => import('@/components/OracleConversation'), {
  ssr: false,
  loading: () => <StudioText role="metadata">opening…</StudioText>,
});

export interface StudioConversationProps {
  work: LivingWork;
  manuscriptId: string;
  /** Minted by the Studio, stable for the life of this page. */
  conversationId: string;
}

export default function StudioConversation({
  work,
  manuscriptId,
  conversationId,
}: StudioConversationProps) {
  const identity = useMemberIdentity();

  if (identity.phase === 'loading') {
    return <StudioText role="metadata">opening…</StudioText>;
  }
  if (identity.phase === 'unauthorized') {
    return (
      <StudioText role="metadata">
        This conversation is yours, so it opens only to you.{' '}
        <a href="/signin" style={{ textDecoration: 'underline' }}>Sign in</a>.
      </StudioText>
    );
  }
  if (identity.phase === 'error' || !identity.memberId) {
    return (
      <StudioText role="metadata">
        MAIA could not confirm who you are just now, so this conversation has not
        opened. Your work is not affected.
      </StudioText>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* The Work this exchange is in, stated where the member can see it.
          Hidden context is not situated context — the same rule the /maia
          banner holds, applied to the room the conversation now lives in. */}
      <div
        data-studio-conversation="situated"
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: SPACE.snug,
          paddingBottom: SPACE.snug,
          marginBottom: SPACE.base,
          borderBottom: `1px solid ${RULE.soft}`,
          flexWrap: 'wrap',
        }}
      >
        <StudioText role="metadata" as="span" tone="quiet">
          In relation to
        </StudioText>
        <StudioText role="navItem" as="span" tone="secondary">
          {work.title ?? 'your work'}
        </StudioText>
        <span style={{ flex: 1 }} />
        {/* FULL MAIA — an explicit member choice, never the default. Carries
            the Work, the way back, and the exchange already under way, so the
            full environment continues this conversation rather than opening
            a second one beside it. */}
        <Link
          href={handoffToMaia('/maia', { workId: work.id, manuscriptId, conversationId })}
          data-open-in-maia="true"
          style={{
            textDecoration: 'none',
            border: `1px solid ${RULE.soft}`,
            borderRadius: RADIUS.sm,
            padding: `${SPACE.tight}px ${SPACE.snug}px`,
            background: GROUND.base,
            color: INK.secondary,
          }}
        >
          <StudioText role="metadata" as="span">Open in MAIA →</StudioText>
        </Link>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <OracleConversation
          userId={identity.memberId}
          userName={identity.name ?? undefined}
          sessionId={conversationId}
          apiEndpoint="/api/sovereign/app/maia/list"
          consciousnessType="maia"
          workContext={{ workId: work.id }}
          /* ── CONSENT. Text-only in v1, and these two are not styling. ──
             The authenticated witness caught this: OracleConversation defaults
             to voiceEnabled=true / initialShowChatInterface=false, so embedding
             it bare inherited voice-first mode — a full-viewport LISTENING
             presence over the Studio, and an OPEN MICROPHONE, from a member
             gesture that was "show me a panel".

             Opening Conversations is an invitation to converse. It is not
             consent to listen. Those are separate acts and only the second may
             turn on a microphone.

             voiceEnabled={false} is the real gate, not a hint: it is the outer
             conjunct of the render guard on <ContinuousConversation>, the only
             capture component in this tree. Not rendered ⇒ no getUserMedia ⇒
             no permission prompt and no listening state. Verified in
             studioConversation.test.ts against BOTH halves, because a prop
             whose mechanism is not asserted is a promise, not a guarantee.

             Voice is not merely off here — it is absent. There is deliberately
             no in-Studio microphone toggle in v1: adding one would put the
             permission-bearing gesture back in a surface that has not been
             designed for it. A writer who wants to speak uses "Open in MAIA",
             where voice-first is the intentional design. */
          voiceEnabled={false}
          initialShowChatInterface
        />
      </div>
    </div>
  );
}
