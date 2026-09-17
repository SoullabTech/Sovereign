import fs from 'fs';
import path from 'path';

const source = fs.readFileSync(
  path.join(process.cwd(), 'lib/erasure/accountErasureExecutor.ts'),
  'utf8',
);

function body(name: string): string {
  const start = source.indexOf(`async function ${name}`);
  if (start < 0) throw new Error(`missing ${name}`);
  const next = source.indexOf('\nasync function ', start + 1);
  return source.slice(start, next < 0 ? source.length : next);
}

describe('F5 P5-D governed executor structure', () => {
  it('mints the durable act before entering destructive planning/execution', () => {
    const live = source.slice(source.indexOf('export async function executeAccountErasure'));
    expect(live.indexOf('mintAct(')).toBeLessThan(live.indexOf('transaction(async'));
  });

  it('uses one SERIALIZABLE transaction from census through completion', () => {
    const live = source.slice(source.indexOf('export async function executeAccountErasure'));
    expect(live).toMatch(/SET TRANSACTION ISOLATION LEVEL SERIALIZABLE/);
    expect(live.indexOf('collectAccountErasureFacts')).toBeLessThan(live.indexOf('freezePlan'));
    expect(live.indexOf('freezePlan')).toBeLessThan(live.indexOf('executeSupportedDispositions'));
    expect(live.indexOf('verifyPostState')).toBeLessThan(live.indexOf('recordCompletionEvidence'));
  });

  it('writes S5 evidence before destructive account/session work and the subject fence before identity end', () => {
    const exec = body('executeSupportedDispositions');
    expect(exec.indexOf('createS5Manifest')).toBeLessThan(exec.indexOf('UPDATE auth_sessions'));
    expect(exec.indexOf('tombstoneExistingAccountRows')).toBeLessThan(exec.indexOf('DELETE FROM member_settings'));
    expect(exec.indexOf("'members'")).toBeLessThan(exec.indexOf('DELETE FROM members'));
  });

  it('reuses the Circle lifecycle rather than duplicating weaker SQL', () => {
    const exec = body('executeSupportedDispositions');
    expect(exec).toMatch(/leaveCircleWithClient/);
    expect(exec).not.toMatch(/UPDATE circle_memberships|UPDATE shared_artifacts|UPDATE circle_inquiry_responses/);
  });

  it('re-runs all governed facts after identity end before completion', () => {
    const verify = body('verifyPostState');
    expect(verify).toMatch(/collectAccountErasureFacts/);
    expect(verify).toMatch(/post-erasure member-bound locus not absent/);
    expect(verify).toMatch(/post-erasure member FK effect not absent/);
    expect(verify).toMatch(/Circle representation remained active/);
  });

  it('R4 separates UUID act identity from text evidence references', () => {
    const completion = body('recordCompletionEvidence');
    expect(completion).toMatch(/SELECT \$1::uuid[\s\S]*CASE WHEN x\.requires_s5 THEN \$3::text ELSE 'p5d-poststate-census'::text END/);
    expect(completion).toMatch(/\[actId, JSON\.stringify\(all\), actId\]/);
    expect(completion).toMatch(/verification_succeeded[\s\S]*CASE WHEN x\.requires_s5 THEN \$3::text ELSE 'p5d-poststate-census'::text END/);
    expect(completion).toMatch(/\[actId, JSON\.stringify\(verified\), actId\]/);
    expect(completion).toMatch(/VALUES \(\$1::uuid, 'act_completed', 'governed_account_erasure_completed', \$2::text\)/);
    expect(completion).toMatch(/\[actId, actId\]/);
    expect(completion).not.toMatch(/THEN \$1 ELSE 'p5d-poststate-census'/);
  });

  it('does not reference the retired sovereignty engine', () => {
    expect(source).not.toMatch(/UserDataSovereignty|delete-memory-api|\/api\/sovereignty\/delete-my-memory/);
  });
});
