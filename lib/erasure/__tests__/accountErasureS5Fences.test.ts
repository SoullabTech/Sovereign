import fs from 'fs';
import path from 'path';

const migration = fs.readFileSync(
  path.join(process.cwd(), 'database/migrations/20260917000002_account_erasure_p5d_s5_fences.sql'),
  'utf8',
);
const restore = fs.readFileSync(
  path.join(process.cwd(), 'scripts/restore-governed.sh'),
  'utf8',
);


describe('F5 P5-D S5 successor', () => {
  it('permits a durable pre-freeze act_failed but no destructive event before freeze', () => {
    expect(migration).toMatch(/NEW\.event_type = 'act_failed' AND NOT frozen/);
    expect(migration).toMatch(/erasure execution cannot begin before plan_frozen/);
  });

  it('uses the member tombstone as the anti-resurrection subject fence', () => {
    expect(migration).toMatch(/object_kind = 'members'/);
    expect(migration).toMatch(/account_erasure_refuse_erased_member_reference/);
    expect(migration).toMatch(/current_setting\('s5\.restore_lane'/);
  });

  it('R1 binds the generic fence only to durable table relkinds and fails unknown kinds loudly', () => {
    expect(migration).toMatch(/pg_catalog\.pg_class/);
    expect(migration).toMatch(/c\.relkind IN \('r', 'p'\)/);
    expect(migration).toMatch(/c\.relkind NOT IN \('r', 'p', 'v', 'm', 'i', 'I', 'S', 'c', 't'\)/);
    expect(migration).toMatch(/unsupported identity-bearing relation kind\(s\)/);
    expect(migration).not.toMatch(/FROM information_schema\.columns[\s\S]*CREATE TRIGGER account_erasure_member_fence/);
  });

  it('R2 binds one Circle trigger function to each concrete row shape', () => {
    expect(migration).toMatch(/account_erasure_shared_artifact_state_fence/);
    expect(migration).toMatch(/account_erasure_circle_response_state_fence/);
    expect(migration).toMatch(/account_erasure_circle_membership_state_fence/);
    expect(migration).not.toMatch(/CREATE OR REPLACE FUNCTION account_erasure_circle_state_fence\(\)/);

    const share = migration.slice(
      migration.indexOf('CREATE OR REPLACE FUNCTION account_erasure_shared_artifact_state_fence'),
      migration.indexOf('CREATE OR REPLACE FUNCTION account_erasure_circle_response_state_fence'),
    );
    expect(share).toMatch(/NEW\.shared_by/);
    expect(share).not.toMatch(/NEW\.member_id/);

    const response = migration.slice(
      migration.indexOf('CREATE OR REPLACE FUNCTION account_erasure_circle_response_state_fence'),
      migration.indexOf('CREATE OR REPLACE FUNCTION account_erasure_circle_membership_state_fence'),
    );
    expect(response).toMatch(/NEW\.member_id/);
    expect(response).not.toMatch(/NEW\.shared_by/);

    const membership = migration.slice(
      migration.indexOf('CREATE OR REPLACE FUNCTION account_erasure_circle_membership_state_fence'),
      migration.indexOf('DROP TRIGGER IF EXISTS account_erasure_circle_state_fence ON shared_artifacts'),
    );
    expect(membership).toMatch(/NEW\.member_id/);
    expect(membership).not.toMatch(/NEW\.shared_by|NEW\.response_text|NEW\.response_type|NEW\.revoked_at/);
  });

  it('does not physically delete Circle history during governed restore', () => {
    expect(migration).toMatch(/NEW\.status := 'left'/);
    expect(migration).toMatch(/NEW\.response_text := NULL/);
    expect(migration).toMatch(/NEW\.response_type := NULL/);
    expect(migration).toMatch(/NEW\.revoked_at := COALESCE/);
  });

  it('refuses active Circle representation for an erased member outside restore', () => {
    expect(migration).toMatch(/active Circle share for erased member refused/);
    expect(migration).toMatch(/live Circle response for erased member refused/);
    expect(migration).toMatch(/active Circle membership for erased member refused/);
  });

  it('makes the governed restore consume the member subject fence without deleting Circle history', () => {
    expect(restore).toMatch(/object_kind <> 'members'/);
    expect(restore).toMatch(/shared_artifacts:revoked/);
    expect(restore).toMatch(/circle_inquiry_responses:withdrawn/);
    expect(restore).toMatch(/circle_memberships:left/);
    expect(restore).toMatch(/SET status = 'left'/);
    expect(restore).toMatch(/response_text = NULL/);
    expect(restore).toMatch(/DELETE FROM members m USING provenance_tombstones/);
  });

  it('sweeps direct member-bound identity columns before ending the member row', () => {
    expect(restore).toMatch(/information_schema\.columns/);
    expect(restore).toMatch(/subject_member_id/);
    expect(restore).toMatch(/account_erasure_acts/);
    expect(restore.indexOf('FOR col IN')).toBeLessThan(restore.indexOf('DELETE FROM members m USING provenance_tombstones'));
  });

});
