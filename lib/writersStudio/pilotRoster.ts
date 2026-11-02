/**
 * WRITER PILOT ROSTER — the pure planning step.
 *
 * Writer's Studio admission (lib/writersStudio/betaAccessServer.ts) is true for a
 * member exactly when an ops_contacts row exists that is: not deleted · linked to
 * THAT member · contact_type 'beta_tester' · pipeline_stage 'active' · metadata
 * writers_studio_beta = true. A tester whose name and email sit on a list but whose
 * contact is not linked to the account they sign in with is NOT admitted, and meets
 * the invitation page instead of the Studio.
 *
 * This module decides, for each roster row, what would make that true. It touches
 * no database: the script loads the rows and applies the plan, and a dry run is the
 * default. ⛔ It never grants admin_role, and it never decides admission by email
 * alone — registration emails are not verified, so an email match is only a
 * CANDIDATE for an operator to link, never authority in itself.
 */

export type RosterInput = { name: string; email: string };
export type MemberRef = { id: string; email: string | null };
export type ContactRef = {
  id: string;
  email: string | null;
  member_id: string | null;
  contact_type: string;
  pipeline_stage: string;
  metadata: Record<string, unknown> | null;
  deleted_at: string | null;
};

export type ContactAction = 'create_contact' | 'update_contact' | 'none';
export type RosterPlan =
  | { status: 'ADMITTED'; memberId: string; contactId: string }
  | { status: 'WOULD_ADMIT'; action: Exclude<ContactAction, 'none'>; memberId: string; contactId?: string }
  | { status: 'WAITING_FOR_SIGNUP'; action: ContactAction; contactId?: string }
  | { status: 'NEEDS_A_PERSON'; reason: 'several_members' | 'several_contacts' | 'contact_has_another_role' | 'contact_is_churned' };

/** Contact types it is safe to turn into a beta tester. Anything else is a person's call. */
const RECLASSIFIABLE = new Set(['lead', 'beta_tester', 'other']);

export const normalizeEmail = (email: string | null | undefined): string =>
  (email ?? '').trim().toLowerCase();

/** Enough to recognise a row, not enough to leak an address into a log. */
export function maskEmail(email: string): string {
  const e = normalizeEmail(email);
  const at = e.lastIndexOf('@');
  if (at < 1) return '***';
  return `${e[0]}***${e.slice(at)}`;
}

export function isAdmittedBy(contact: ContactRef, memberId: string): boolean {
  return contact.deleted_at === null
    && contact.member_id === memberId
    && contact.contact_type === 'beta_tester'
    && contact.pipeline_stage === 'active'
    && contact.metadata?.writers_studio_beta === true;
}

export function planRosterRow(
  row: RosterInput,
  members: readonly MemberRef[],
  contacts: readonly ContactRef[],
): RosterPlan {
  const email = normalizeEmail(row.email);
  const matchedMembers = members.filter((m) => normalizeEmail(m.email) === email);
  if (matchedMembers.length > 1) return { status: 'NEEDS_A_PERSON', reason: 'several_members' };
  const member = matchedMembers[0] ?? null;

  const candidates = new Map<string, ContactRef>();
  for (const c of contacts) {
    if (c.deleted_at !== null) continue;
    if (normalizeEmail(c.email) === email || (member && c.member_id === member.id)) candidates.set(c.id, c);
  }
  if (candidates.size > 1) return { status: 'NEEDS_A_PERSON', reason: 'several_contacts' };
  const contact = [...candidates.values()][0] ?? null;

  if (member && contact && isAdmittedBy(contact, member.id)) {
    return { status: 'ADMITTED', memberId: member.id, contactId: contact.id };
  }
  if (contact) {
    if (!RECLASSIFIABLE.has(contact.contact_type)) return { status: 'NEEDS_A_PERSON', reason: 'contact_has_another_role' };
    if (contact.pipeline_stage === 'churned') return { status: 'NEEDS_A_PERSON', reason: 'contact_is_churned' };
  }

  if (member) {
    return contact
      ? { status: 'WOULD_ADMIT', action: 'update_contact', memberId: member.id, contactId: contact.id }
      : { status: 'WOULD_ADMIT', action: 'create_contact', memberId: member.id };
  }
  // No account yet. Mark the contact so the intent is recorded, and say plainly that
  // nothing is admitted until they register and the roster is run again.
  const marked = !!contact && contact.contact_type === 'beta_tester' && contact.pipeline_stage === 'active'
    && contact.metadata?.writers_studio_beta === true;
  if (contact) {
    return { status: 'WAITING_FOR_SIGNUP', action: marked ? 'none' : 'update_contact', contactId: contact.id };
  }
  return { status: 'WAITING_FOR_SIGNUP', action: 'create_contact' };
}

/** Minimal CSV: header `name,email`, double-quoted fields allowed. */
export function parseRosterCsv(text: string): RosterInput[] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];
  const split = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 1; }
        else if (ch === '"') quoted = false;
        else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out.map((v) => v.trim());
  };
  const header = split(lines[0]!).map((h) => h.toLowerCase());
  const nameAt = header.indexOf('name');
  const emailAt = header.indexOf('email');
  if (nameAt < 0 || emailAt < 0) throw new Error('ROSTER_CSV_NEEDS_HEADER: name,email');
  const rows: RosterInput[] = [];
  for (const line of lines.slice(1)) {
    const cells = split(line);
    const email = normalizeEmail(cells[emailAt]);
    if (!email.includes('@')) throw new Error(`ROSTER_CSV_BAD_EMAIL: ${maskEmail(cells[emailAt] ?? '')}`);
    rows.push({ name: (cells[nameAt] ?? '').trim() || email, email });
  }
  const seen = new Set<string>();
  for (const r of rows) {
    if (seen.has(r.email)) throw new Error(`ROSTER_CSV_DUPLICATE: ${maskEmail(r.email)}`);
    seen.add(r.email);
  }
  return rows;
}
