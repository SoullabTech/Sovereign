'use client';

/**
 * The invitation surface — the member's side of the bridge.
 *
 * ── Three voices, never collapsed ───────────────────────────────────────────
 *
 *   System        "Your practitioner invited you into a reflection."
 *   Practitioner  their words, verbatim, attributed
 *   Member        accept · decline — and nothing written here
 *
 * The member's own meaning does not live in this component. Accepting opens no
 * text field, because an insight written afterward belongs to the member and is
 * stored with no link back to the invitation (CF-D5c). This surface ends at the
 * gesture. That boundary is the architecture, not a simplification.
 *
 * ⛔ ADD THE BRIDGE; DO NOT REBUILD THE HOUSE. This component is additive: it
 *    does not restructure the Home, rename a universal zone, or introduce
 *    practitioner vocabulary into a universal surface.
 *
 * ⛔ No completion state is rendered, because none exists. An accepted
 *    invitation shows that the member chose it — never that they owe it.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

const ACCENT = '#ffe27a';

const PANEL =
  'rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 sm:px-6 sm:py-5';

type InvitationResponse = 'accepted' | 'declined';

interface ReceivedInvitation {
  id: string;
  body: string;
  authoredBy: string;
  offeredAt: string;
  myResponse: InvitationResponse | null;
}

export default function MemberInvitations({
  fieldSlug,
  programSlug,
}: {
  fieldSlug: string;
  programSlug?: string;
}) {
  const [invitations, setInvitations] = useState<ReceivedInvitation[] | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ fieldSlug });
    if (programSlug) params.set('programSlug', programSlug);

    apiFetch(`/api/now-what/invitations?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!cancelled) setInvitations(data.invitations ?? []);
      })
      .catch(() => {
        // A surface that cannot load is silent rather than alarming: an
        // invitation is an offer, and a failed fetch is not a member's problem.
        if (!cancelled) setInvitations([]);
      });

    return () => {
      cancelled = true;
    };
  }, [fieldSlug, programSlug]);

  async function respond(id: string, response: InvitationResponse) {
    setPending(id);
    setError(null);
    try {
      const res = await apiFetch('/api/now-what/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: id, response }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setInvitations((prev) =>
        (prev ?? []).map((i) => (i.id === id ? { ...i, myResponse: response } : i)),
      );
    } catch {
      setError('That did not save. It is still yours to answer.');
    } finally {
      setPending(null);
    }
  }

  // Nothing offered is not an empty state worth announcing. The Home does not
  // advertise a capability that has produced nothing for this member.
  if (!invitations || invitations.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-slate-100 text-xl sm:text-2xl font-extralight tracking-wide">
        Invitations
      </h2>
      {/* SYSTEM VOICE — names the act, claims nothing about its meaning. */}
      <p className="mt-1 text-sm font-light text-slate-400">
        Offered to you. Yours to take up, or not.
      </p>

      <div className="mt-4 space-y-3">
        {invitations.map((invitation) => (
          <article key={invitation.id} className={PANEL}>
            {/* PRACTITIONER VOICE — attributed, always. An authored practice
                rendered without its source is absorption, not neutrality. */}
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              From {invitation.authoredBy}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-[15px] font-light leading-relaxed text-slate-100">
              {invitation.body}
            </p>

            {invitation.myResponse === null ? (
              /* MEMBER VOICE — the gesture, in the member's register.
                 Never "Start", never "Complete", never "Accept assignment". */
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending === invitation.id}
                  onClick={() => respond(invitation.id, 'accepted')}
                  className="rounded-full px-4 py-1.5 text-sm font-light text-slate-900 disabled:opacity-50"
                  style={{ backgroundColor: ACCENT }}
                >
                  I want to work with this
                </button>
                <button
                  type="button"
                  disabled={pending === invitation.id}
                  onClick={() => respond(invitation.id, 'declined')}
                  className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-light text-slate-300 disabled:opacity-50"
                >
                  Not this one
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm font-light text-slate-400">
                {invitation.myResponse === 'accepted'
                  ? 'You chose to work with this.'
                  : 'You set this one aside.'}{' '}
                {/* Changing their mind is always open. A declined invitation is
                    not a closed door, and an accepted one is not a debt. */}
                <button
                  type="button"
                  disabled={pending === invitation.id}
                  onClick={() =>
                    respond(
                      invitation.id,
                      invitation.myResponse === 'accepted' ? 'declined' : 'accepted',
                    )
                  }
                  className="underline underline-offset-4 hover:text-slate-200 disabled:opacity-50"
                >
                  Change this
                </button>
              </p>
            )}
          </article>
        ))}
      </div>

      {error ? <p className="mt-3 text-sm font-light text-rose-300">{error}</p> : null}
    </section>
  );
}
