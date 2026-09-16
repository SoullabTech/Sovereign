import { query } from '@/lib/db/postgres';

export interface GovernedOperationalContact {
  id: string;
  sourceCustodyKey: string;
  name: string;
  email: string;
  memberId: string | null;
  contactType: string;
  groups: string[];
  tags: string[];
  joinDate: string | null;
  contribution: string | null;
  legacySource: string | null;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}
async function loadGovernedContacts(betaOnly: boolean): Promise<GovernedOperationalContact[]> {
  const result = await query(
    `SELECT id, name, email, member_id, contact_type, notes, metadata
       FROM ops_contacts
      WHERE source = 'source-custody-migration'
        AND deleted_at IS NULL
        AND pipeline_stage = 'active'
        AND ($1::boolean = false OR contact_type = 'beta_tester')
      ORDER BY created_at ASC, id ASC`,
    [betaOnly],
  );

  return result.rows.map((row) => {
    const metadata = row.metadata && typeof row.metadata === 'object'
      ? row.metadata as Record<string, unknown>
      : {};
    return {
      id: String(row.id),
      sourceCustodyKey: text(metadata.source_custody_key) ?? String(row.id),
      name: String(row.name ?? ''),
      email: String(row.email ?? ''),
      memberId: row.member_id ? String(row.member_id) : null,
      contactType: String(row.contact_type ?? 'other'),
      groups: strings(metadata.groups),
      tags: strings(metadata.tags),
      joinDate: text(metadata.join_date),
      contribution: text(row.notes),
      legacySource: text(metadata.legacy_source),
    };
  });
}
export function loadGovernedBetaContacts(): Promise<GovernedOperationalContact[]> {
  return loadGovernedContacts(true);
}

export function loadGovernedActiveContacts(): Promise<GovernedOperationalContact[]> {
  return loadGovernedContacts(false);
}
