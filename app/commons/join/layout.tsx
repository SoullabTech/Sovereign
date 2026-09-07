import { requireFounder } from '@/lib/founder/founderAuth';
import GateScreen from '@/components/access/FounderGateScreen';

/**
 * /commons/join — closed-state gate (I0.5 · I-02, founder ruling 2026-09-07).
 *
 * WHY THIS EXISTS. R1 closed the Circle API surface behind requireCircleAccess()
 * without bringing the member-facing surface along. The result was a
 * contradiction the system authored itself: /commons/join asked an unauthorized
 * visitor to paste an invite token AND to choose a Circle consent mode, and then
 * POSTed both to an endpoint guaranteed to answer 403.
 *
 * That is not a cosmetic mismatch. Asking someone for a consent decision on a
 * relationship they cannot enter collects a sovereign act the system has no
 * standing to receive. THE PAGE AND THE API MUST TELL THE SAME TRUTH.
 *
 * So while Circle release access remains closed, an unauthorized visitor is
 * never asked to:
 *   - enter or confirm an invite token
 *   - choose a Circle consent mode
 *   - submit a join action whose refusal is already determined
 *
 * ⛔ I-03 IS PRESERVED DELIBERATELY. The closed surface is identical whether or
 * not the URL carries a token, and whether or not that token is valid: nothing
 * here reads circle_invites. Before Circle access is authorized, a valid token
 * and an invalid token remain indistinguishable to an unauthorized visitor.
 *
 * ⛔ This gate is NOT the authorization. The authorization is
 * requireCircleAccess() on the API (lib/circles/circleAccess.ts). A layout does
 * not run for a route handler; this closes the surface, never the door. Do not
 * relax the API on the strength of this file.
 *
 * ⛔ I8 OBLIGATION, recorded here because this is where it will be missed. This
 * gate checks requireFounder(); the API checks requireCircleAccess(). They agree
 * TODAY only because Circle API authority is itself founder-only while the
 * cohort is unauthorized. When CIRCLE_ACCESS_MEMBER_IDS is constituted at I8,
 * THIS FILE MUST MIGRATE to the same Circle-access authority — otherwise the
 * page and the API disagree again, which is I-02 one posture later.
 *
 * The 401 case is NOT redirected to /signin. A redirect would imply that signing
 * in leads to joining, which is untrue while the cohort is unauthorized. The
 * closed state is stated once, and sign-in is offered as an exit rather than
 * imposed as a step.
 */
export default async function CommonsJoinLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireFounder();

  if (!auth.ok) {
    return (
      <GateScreen
        eyebrow="Circles"
        title="Joining is not open"
        description="Circle invitations are not being accepted yet."
        reason="The invitation system is still being built. No invite link can be redeemed at this time."
        exits={
          auth.status === 401
            ? [
                { href: '/signin?next=/commons/join', label: 'Sign in', emphasis: 'primary' },
                { href: '/maia', label: 'Back to MAIA', emphasis: 'secondary' },
              ]
            : [{ href: '/maia', label: 'Back to MAIA', emphasis: 'primary' }]
        }
      />
    );
  }

  return <>{children}</>;
}
