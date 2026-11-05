/**
 * Email transport health, derived from the delivery ledger — pure, no I/O.
 *
 * Built from POSITIVE facts only. "failing" requires a recorded transport-wide
 * refusal newer than the last accepted send; "working" requires a recorded
 * accepted send as the latest meaningful event. With nothing recorded the
 * answer is "unknown", never "working". A per-recipient refusal (one bad
 * address) is not evidence about the transport and is ignored here.
 *
 * Counts, classes and timestamps only. No recipient, subject or body.
 */

export const TRANSPORT_WIDE_CLASSES: ReadonlySet<string> = new Set([
  'quota_exceeded',
  'provider_auth',
  'provider_config',
  'not_configured',
]);

export type EmailAttemptRow = {
  provider: string | null;
  state: string | null;
  purpose: string | null;
  failure_class: string | null;
  created_at: string | Date | null;
};

export type EmailHealth = {
  status: 'working' | 'failing' | 'unknown';
  lastAcceptedAt: string | null;
  lastAcceptedProvider: string | null;
  failingSince: string | null;
  failureClass: string | null;
  failingPurposes: string[];
  basis: string;
};

function iso(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

function time(value: string | Date | null | undefined): number {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
}

export function deriveEmailHealth(rows: EmailAttemptRow[]): EmailHealth {
  const sorted = [...rows].sort((a, b) => time(b.created_at) - time(a.created_at));
  const meaningful = sorted.filter(
    (r) => r.state === 'accepted' || (r.state === 'refused' && TRANSPORT_WIDE_CLASSES.has(r.failure_class ?? '')),
  );
  const basis =
    'from the delivery ledger: recorded accepted sends and transport-wide refusals; a single bad address is ignored';

  if (meaningful.length === 0) {
    return {
      status: 'unknown', lastAcceptedAt: null, lastAcceptedProvider: null,
      failingSince: null, failureClass: null, failingPurposes: [], basis,
    };
  }

  const lastAccepted = meaningful.find((r) => r.state === 'accepted') ?? null;
  const lastAcceptedAt = lastAccepted ? iso(lastAccepted.created_at) : null;
  const lastAcceptedProvider = lastAccepted?.provider ?? null;

  if (meaningful[0].state === 'accepted') {
    return {
      status: 'working', lastAcceptedAt, lastAcceptedProvider,
      failingSince: null, failureClass: null, failingPurposes: [], basis,
    };
  }

  const run: EmailAttemptRow[] = [];
  for (const r of meaningful) {
    if (r.state === 'accepted') break;
    run.push(r);
  }
  const oldest = run[run.length - 1];
  return {
    status: 'failing',
    lastAcceptedAt,
    lastAcceptedProvider,
    failingSince: iso(oldest.created_at),
    failureClass: meaningful[0].failure_class,
    failingPurposes: [...new Set(run.map((r) => r.purpose).filter((p): p is string => !!p))].slice(0, 6),
    basis,
  };
}
