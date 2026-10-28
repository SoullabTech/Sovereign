import {readFileSync} from 'fs';import path from 'path';
const read=(rel:string)=>readFileSync(path.join(process.cwd(),rel),'utf8');
describe('threshold Policy R3A source boundary',()=>{
 it('accepts one explicit purpose/action decision and never couples join plus recording',()=>{
  const route=read('app/api/open/threshold/[token]/route.ts');
  expect(route).toContain("new Set<EncounterConsentPurpose>(['join','record_audio'])");
  expect(route).toContain('appendEncounterConsentDecision');
  expect(route).not.toContain('body.consent');
  expect(route).not.toContain("VALUES ($1, $2, 'join'");
  expect(route).not.toContain('participantIdPrefix');expect(route).not.toContain('encounterIdPrefix');
 });
 it('presents joining and recording as separate choices and does not start the recorder',()=>{
  const page=read('app/open/threshold/[token]/page.tsx');
  expect(page).toContain('Enter this room');expect(page).toContain('Allow recording');
  expect(page).not.toContain('RecordingCoordinator');expect(page).toContain('does not start a recorder');
  expect(page).toContain('Prevent future room entry');expect(page).toContain('already-open room is a later held gate');
 });
 it('preserves old grants as legacy generation-zero provenance rather than current authority',()=>{
  const migration=read('database/migrations/20261027000002_exp21_encounter_consent_ledger.sql');
  expect(migration).toContain("agreement_version = 'legacy-v0'");
  expect(migration).toContain('kind = NULL');
  expect(migration).toContain('generation = 0');
  expect(migration).toContain('legacy_provenance = FALSE');
  expect(migration).toContain('actor_participant_id = participant_id');
  expect(migration).toContain('enforce_encounter_consent_append_only');
  expect(migration).not.toContain('pg_trigger_depth()');
  expect(migration).toContain('NOT EXISTS (SELECT 1 FROM public.encounters');
  expect(migration).toContain('NOT EXISTS (SELECT 1 FROM public.encounter_participants');
  expect(migration).toContain('trg_encounter_consent_no_truncate');
  const streamRoute=read('app/api/open/threshold/[token]/stream/route.ts');
  expect(streamRoute).toContain("kind = 'record'");
  expect(migration).toContain('legacy_provenance = FALSE AND generation > 0 AND kind IS NULL');
 });
});
