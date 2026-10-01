/**
 * SOULLAB MAIL AUTHORITY — EMAIL-IDENTITY-01
 * =========================================
 *
 * `soullab.life` carries two mail systems on one domain, and they own
 * different things:
 *
 *   PROTON  — people talking to people. Human and organizational mailboxes.
 *             Inbound MX for the whole domain lands here.
 *   RESEND  — software talking to people. Transactional mail MAIA sends.
 *
 * Their separation is the design. This module is where it is declared: every
 * `@soullab.life` address the codebase names appears here exactly once, with
 * its class, who owns it, and on which lane (if any) software may send AS it.
 *
 * Two enforcements read this registry:
 *   - runtime: `sendEmail()` refuses a `@soullab.life` sender that is not
 *     authorized on the lane the message would travel (see `adjudicateSender`).
 *   - static:  `__tests__/identity-authority.test.ts` fails when source names a
 *     `@soullab.life` address this registry does not declare, or uses a sender
 *     literal software is not authorized to send as.
 *
 * Adding an entry is a governed act, not a way to unblock a caller. A human or
 * organizational mailbox becoming app-sendable means software can speak in a
 * voice people answer — that is a decision, never a convenience.
 *
 * SCOPE — this authority governs `soullab.life` only. Other Soullab domains
 * found in source (`soullab.org`, `soullab.ai`) are recorded as named debt in
 * `UNGOVERNED_SOULLAB_SENDERS`: not blessed, not refused at runtime (refusing
 * would change live behaviour by a drive-by edit), asserted not to grow.
 *
 * `protonMailbox` reflects the founder's Proton address listing of 2026-10-01
 * (kelly · info · support · admin · legal · beta · nathan · gmail · messages ·
 * noreply). `not_listed` means no mailbox was seen in that listing — inbound
 * mail to it is delivered only if a Proton catch-all is enabled, which has NOT
 * been verified. It is a fact about the listing, not about deliverability.
 */

export const GOVERNED_MAIL_DOMAIN = 'soullab.life';

/** What an address IS, independent of how it is currently used. */
export type MailClass =
  /** A named person's own mailbox. */
  | 'HUMAN'
  /** A role mailbox people write to (info, support, privacy...). Humans answer it. */
  | 'ORGANIZATIONAL'
  /** A software sender identity. Nobody reads it as a person. */
  | 'TRANSACTIONAL'
  /** A mailbox whose credentials an internal pager authenticates as over SMTP. */
  | 'ALERT_RELAY'
  /** Present for history; under review, not to gain new uses. */
  | 'LEGACY';

/** The transport a send travels. Mirrors `EmailProvider.name`. */
export type SendLane = 'resend' | 'smtp';

export interface MailIdentity {
  /** Lowercase mailbox. */
  address: string;
  class: MailClass;
  /** The lanes software may send AS this address on. Empty = software never does. */
  appSendLanes: readonly SendLane[];
  /** Presence in the founder's Proton address listing (see module header). */
  protonMailbox: 'active' | 'not_listed';
  /** Why it is classified this way, in one or two sentences. */
  note: string;
  /** A question the classification does not settle. Present = founder ruling owed. */
  openRuling?: string;
}

const id = (m: MailIdentity): MailIdentity => m;

export const MAIL_IDENTITIES: readonly MailIdentity[] = [
  // ── HUMAN ────────────────────────────────────────────────────────────────
  id({
    address: 'kelly@soullab.life',
    class: 'HUMAN',
    appSendLanes: ['resend'],
    protonMailbox: 'active',
    note:
      'Founder mailbox, owned by Proton. Software sends founder-voiced mail as it ' +
      '(beta letters, invites); replies land in Proton, which is why that is coherent.',
    openRuling:
      'Founder-voiced app mail is permitted today. Is AUTH mail (send-verification ' +
      'route) founder-voiced, or should it move to noreply@? Not moved here: changes ' +
      'what members see.',
  }),
  id({
    address: 'nathan@soullab.life',
    class: 'HUMAN',
    appSendLanes: [],
    protonMailbox: 'active',
    note: 'Personal mailbox. Appears in calendar fixtures only; software never sends as it.',
    openRuling: 'Keep as a mailbox if Nathan uses it; otherwise convert to an alias.',
  }),

  // ── ORGANIZATIONAL (Proton; software never sends as these) ──────────────
  id({ address: 'info@soullab.life',    class: 'ORGANIZATIONAL', appSendLanes: [], protonMailbox: 'active', note: 'General enquiries.' }),
  id({ address: 'support@soullab.life', class: 'ORGANIZATIONAL', appSendLanes: [], protonMailbox: 'active', note: 'Named in member-facing error copy (auth routes). The address a member is told to write to.' }),
  id({ address: 'admin@soullab.life',   class: 'ORGANIZATIONAL', appSendLanes: [], protonMailbox: 'active', note: 'Administrative contact.' }),
  id({ address: 'legal@soullab.life',   class: 'ORGANIZATIONAL', appSendLanes: [], protonMailbox: 'active', note: 'Legal contact.' }),
  id({ address: 'beta@soullab.life',    class: 'ORGANIZATIONAL', appSendLanes: [], protonMailbox: 'active', note: 'Beta tester correspondence (BetaTesterHub mailto).' }),

  // Public contact addresses with NO mailbox in the Proton listing. Each is
  // shown to people as a place to write. Unless a catch-all exists, mail to
  // them goes nowhere — the opposite of what the page promises.
  id({ address: 'hello@soullab.life',        class: 'ORGANIZATIONAL', appSendLanes: [], protonMailbox: 'not_listed', note: 'Terms page and the /api/ask offline message.', openRuling: 'Create in Proton, alias to info@, or replace in copy.' }),
  id({ address: 'privacy@soullab.life',      class: 'ORGANIZATIONAL', appSendLanes: [], protonMailbox: 'not_listed', note: 'Privacy pages. Data-rights requests are sent here.', openRuling: 'Highest priority of the unlisted set: a privacy request that goes nowhere is a legal exposure.' }),
  id({ address: 'contact@soullab.life',      class: 'ORGANIZATIONAL', appSendLanes: [], protonMailbox: 'not_listed', note: 'Powered-by page.', openRuling: 'Create, alias, or replace in copy.' }),
  id({ address: 'partnerships@soullab.life', class: 'ORGANIZATIONAL', appSendLanes: [], protonMailbox: 'not_listed', note: 'Partner config contact.', openRuling: 'Create, alias, or replace in copy.' }),
  id({ address: 'research@soullab.life',     class: 'ORGANIZATIONAL', appSendLanes: [], protonMailbox: 'not_listed', note: 'Partner config contact.', openRuling: 'Create, alias, or replace in copy.' }),
  id({ address: 'collaborate@soullab.life',  class: 'ORGANIZATIONAL', appSendLanes: [], protonMailbox: 'not_listed', note: 'Partner config contact.', openRuling: 'Create, alias, or replace in copy.' }),
  id({
    address: 'problem@soullab.life',
    class: 'ORGANIZATIONAL',
    appSendLanes: [],
    protonMailbox: 'not_listed',
    note:
      'Voice help copy, AND the RECIPIENT of problem reports from /api/feedback. The ' +
      'provider accepts the send, so the ledger records success even if no mailbox exists.',
    openRuling:
      'Member-reported problems may be landing nowhere. Create the mailbox / alias, or ' +
      'route problem reports to support@.',
  }),

  // ── TRANSACTIONAL (Resend) ───────────────────────────────────────────────
  id({
    address: 'noreply@soullab.life',
    class: 'TRANSACTIONAL',
    appSendLanes: ['resend'],
    protonMailbox: 'active',
    note: 'Default system sender: auth codes, magic links, recovery, invites, alerts.',
    openRuling:
      'It is also an active Proton address, so replies and bounces collect there. Keep ' +
      '(a place bounces can be read) or retire the Proton side.',
  }),
  id({ address: 'team@soullab.life',      class: 'TRANSACTIONAL', appSendLanes: ['resend'], protonMailbox: 'not_listed', note: 'Team notifications.' }),
  id({ address: 'reminders@soullab.life', class: 'TRANSACTIONAL', appSendLanes: ['resend'], protonMailbox: 'not_listed', note: 'Session reminders.' }),
  id({ address: 'bookings@soullab.life',  class: 'TRANSACTIONAL', appSendLanes: ['resend'], protonMailbox: 'not_listed', note: 'Portal booking mail, often practitioner-named. A client who replies reaches no mailbox.', openRuling: 'Set replyTo (practitioner or support@) on booking mail.' }),
  id({ address: 'portal@soullab.life',    class: 'TRANSACTIONAL', appSendLanes: ['resend'], protonMailbox: 'not_listed', note: 'Client portal mail.' }),
  id({ address: 'updates@soullab.life',   class: 'TRANSACTIONAL', appSendLanes: ['resend'], protonMailbox: 'not_listed', note: 'Practitioner follow-ups and scheduled sends, practitioner-named. Same reply problem as bookings@.', openRuling: 'Set replyTo on practitioner-named mail.' }),
  id({ address: 'gifts@soullab.life',     class: 'TRANSACTIONAL', appSendLanes: ['resend'], protonMailbox: 'not_listed', note: 'Gift / bead notifications.' }),
  id({
    address: 'monitor@soullab.life',
    class: 'TRANSACTIONAL',
    appSendLanes: ['resend'],
    protonMailbox: 'not_listed',
    note:
      'Default sender of scripts/maia-monitor.js, the out-of-band uptime monitor. It calls ' +
      'the Resend HTTP API directly, outside sendEmail(), so the runtime check does not reach it — ' +
      'deliberately: a monitor must not depend on the app it watches. Only the static census governs it.',
  }),
  id({ address: 'maia@soullab.life',     class: 'TRANSACTIONAL', appSendLanes: ['resend'], protonMailbox: 'not_listed', note: 'Focus reminders, sent as MAIA.', openRuling: 'A sender named MAIA speaks as the companion in the inbox; confirm that is intended (Sovereignty Invariants: no attachment capture).' }),

  // ── ALERT RELAY ─────────────────────────────────────────────────────────
  id({
    address: 'messages@soullab.life',
    class: 'ALERT_RELAY',
    appSendLanes: ['smtp'],
    protonMailbox: 'active',
    note:
      'Build-alert pager authenticates as this mailbox over SMTP (ALERT_SMTP_USER). ' +
      'The one sanctioned software path through Proton; never through Resend.',
  }),

  // ── LEGACY ──────────────────────────────────────────────────────────────
  id({ address: 'gmail@soullab.life', class: 'LEGACY', appSendLanes: [], protonMailbox: 'active', note: 'Proton address from a Gmail import. Not referenced in source.', openRuling: 'Retire after confirming no inbound use.' }),
];

/**
 * Soullab sender literals on domains this authority does NOT govern. Named debt,
 * same discipline as KNOWN_UNMIGRATED in the provider-import guard: not
 * sanctioned, not silently moved, and the static guard asserts the list does
 * not grow.
 */
export const UNGOVERNED_SOULLAB_SENDERS: readonly { address: string; where: string; note: string }[] = [
  {
    address: 'kelly@soullab.org',
    where: 'lib/email/sendBetaInvite.ts',
    note: 'Deliberately left on soullab.org (see that file). Fails as provider_config if the domain is unverified.',
  },
  {
    address: 'notifications@soullab.ai',
    where: 'lib/notifications/safety.ts',
    note:
      'Stellium SAFETY escalation to practitioners. soullab.ai ownership and verification ' +
      'unconfirmed — if unverified, safety notices are being refused. Highest-severity item.',
  },
];

// ============================================================================
// LOOKUP + ADJUDICATION
// ============================================================================

const BY_ADDRESS: ReadonlyMap<string, MailIdentity> = new Map(
  MAIL_IDENTITIES.map((m) => [m.address, m]),
);

/** `'Name <a@b>'` or `'a@b'` → `'a@b'`, lowercased. */
export function mailboxOf(from: string): string {
  const bracketed = from.match(/<([^<>]+)>/);
  return (bracketed?.[1] ?? from).trim().toLowerCase();
}

export function lookupIdentity(address: string): MailIdentity | undefined {
  return BY_ADDRESS.get(address.trim().toLowerCase());
}

export type SenderVerdict =
  | { authorized: true; governed: boolean }
  | { authorized: false; reason: 'unregistered' | 'not_app_sendable' | 'wrong_lane'; mailbox: string };

/**
 * May software send AS `from` on `lane`?
 *
 * Only `@soullab.life` senders are governed. Anything else — a practitioner's
 * own domain on a bring-your-own key, or the named ungoverned debt above —
 * passes through `governed: false`; this authority does not speak for it.
 */
export function adjudicateSender(from: string, lane: SendLane): SenderVerdict {
  const mailbox = mailboxOf(from);
  if (!mailbox.endsWith(`@${GOVERNED_MAIL_DOMAIN}`)) {
    return { authorized: true, governed: false };
  }
  const identity = BY_ADDRESS.get(mailbox);
  if (!identity) return { authorized: false, reason: 'unregistered', mailbox };
  if (identity.appSendLanes.length === 0) return { authorized: false, reason: 'not_app_sendable', mailbox };
  if (!identity.appSendLanes.includes(lane)) return { authorized: false, reason: 'wrong_lane', mailbox };
  return { authorized: true, governed: true };
}

/**
 * The lane a provider sends on. `memory` is the capture transport used in
 * tests and dry runs; it stands in for the default application lane, so it is
 * held to the Resend rule rather than exempted.
 */
export function laneOfProvider(providerName: string): SendLane | undefined {
  if (providerName === 'resend' || providerName === 'memory') return 'resend';
  if (providerName === 'smtp') return 'smtp';
  return undefined;
}
