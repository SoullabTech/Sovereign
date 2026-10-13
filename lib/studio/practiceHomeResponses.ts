/**
 * PRO-STUDIO-01-A-R1b-R2 — fail-closed Practice Home response selectors.
 *
 * Every returned record must match the fields actually used by Practice Home.
 * Reject a malformed successful response rather than silently drop a record
 * and imply that fewer clients or sessions exist. These functions do NOT
 * authorize access; protected Studio APIs continue to own member/practitioner
 * identity and data scoping. No logging, mutation, network or data retention.
 */
export interface PracticeHomeIdentity {
  memberId: string;
  practitionerId: string;
  name?: string | null;
  portalType?: string | null;
}

export interface PracticeClientRow {
  id: string;
  name: string;
  status?: string;
  lastSessionAt?: string | null;
  nextSessionAt?: string | null;
  totalSessions?: number;
}

export interface PracticeBooking {
  id: string;
  startAt: string;
  status?: string;
  serviceName?: string | null;
  clientName?: string | null;
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function optionalString(value: unknown): boolean {
  return value == null || typeof value === 'string';
}

// TIMESTAMPTZ JSON must carry an ISO date, clock and explicit timezone.
// Date.parse alone accepts aliases such as '0' and normalizes February 30.
const ISO_TIMESTAMP = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,6})?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/;

function dateString(value: unknown): value is string {
  if (!nonemptyString(value)) return false;
  const match = ISO_TIMESTAMP.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function optionalDateString(value: unknown): boolean {
  return value == null || dateString(value);
}

function validClient(value: unknown): value is PracticeClientRow {
  if (!record(value)) return false;
  return nonemptyString(value.id)
    && nonemptyString(value.name)
    && optionalString(value.status)
    && optionalDateString(value.lastSessionAt)
    && optionalDateString(value.nextSessionAt)
    && (value.totalSessions == null
      || (typeof value.totalSessions === 'number'
        && Number.isInteger(value.totalSessions)
        && value.totalSessions >= 0));
}

function validBooking(value: unknown): value is PracticeBooking {
  if (!record(value)) return false;
  // sessions.scheduled_start is NOT NULL in the live source schema. A null or
  // unparsable start time is therefore a failed read, not an unscheduled entry.
  return nonemptyString(value.id)
    && dateString(value.startAt)
    && optionalString(value.status)
    && optionalString(value.serviceName)
    && optionalString(value.clientName);
}

/**
 * /api/studio/whoami returns the verified practitioner identity together with
 * authenticated:true and isPractitioner:true only after its server-side check.
 * UI validation is defense in depth, not a substitute for that server boundary.
 */
export function selectPracticeIdentity(data: unknown): PracticeHomeIdentity | null {
  if (!record(data) || data.authenticated !== true || data.isPractitioner !== true) {
    return null;
  }
  const identity = data.identity;
  if (!record(identity)
    || !nonemptyString(identity.memberId)
    || !nonemptyString(identity.practitionerId)
    || !optionalString(identity.name)
    || !optionalString(identity.portalType)) {
    return null;
  }
  return identity as unknown as PracticeHomeIdentity;
}

export function selectPracticeClients(data: unknown): PracticeClientRow[] | null {
  if (!record(data) || !Array.isArray(data.clients)) return null;
  // Array.every([]) is true: an actually verified empty list stays empty.
  // Every invalid record holds the ENTIRE response, never filter(Boolean).
  return data.clients.every(validClient) ? data.clients : null;
}

export function selectPracticeBookings(data: unknown): PracticeBooking[] | null {
  if (!record(data) || !Array.isArray(data.bookings)) return null;
  return data.bookings.every(validBooking) ? data.bookings : null;
}
