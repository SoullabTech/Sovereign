/* SOULLAB Living Field v3 — owner-review source candidate, not admitted. */
import { randomBytes } from 'node:crypto';
import { requireMemberId } from '@/lib/auth/session';
import { query } from '@/lib/db/postgres';
import { HouseExperience } from '@/app/house/page';
import { HomeThreshold } from './HomeThreshold';
import { FieldV3Shell } from './FieldV3Shell';

export const dynamic = 'force-dynamic';

async function authenticatedMemberId(): Promise<string | null> {
  try { return await requireMemberId(); }
  catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') return null;
    throw error;
  }
}

type HomeProps = { searchParams?: Promise<{ field?: string }> };
export default async function HomePage({ searchParams }: HomeProps) {
  const memberId = await authenticatedMemberId();
  if (!memberId) return <HomeThreshold />;
  const p = (await searchParams) || {};
  if (p.field !== 'v3') return <HouseExperience current="home" />;
  const member = await query('SELECT name FROM members WHERE id = $1', [memberId]);
  if (member.rows.length !== 1) return <HomeThreshold />;
  const firstName = String(member.rows[0].name || 'there').trim().split(/\s+/)[0].slice(0,45);
  // The same strict owner/declarer/manuscript proof as corrected H0R1.
  const works = await query(`
    SELECT w.title
      FROM living_works w
     WHERE w.member_id = $1
       AND EXISTS (
         SELECT 1 FROM living_work_expressions e
           JOIN member_manuscripts m ON m.id = e.expression_id
          WHERE e.living_work_id = w.id
            AND e.expression_type = 'manuscript'
            AND e.declared_by = $1
            AND m.member_id = $1
       )
     ORDER BY w.updated_at DESC
     LIMIT 2`, [memberId]);
  const displayTitles = (works.rows as {title?: string | null}[])
    .map(w => String(w.title || '').trim().slice(0,120))
    .filter(Boolean);
  const nonce = randomBytes(16).toString('hex');
  // No member IDs, tokens, raw conversation, or
  // other-person data enter the iframe. Every destination is reauthorized by
  // the actual application when opened.
  return <FieldV3Shell firstName={firstName} works={displayTitles} nonce={nonce}/>;
}
