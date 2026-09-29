import { readFileSync } from 'fs';
import { join } from 'path';
import { WRITERS_STUDIO_BETA_CRITERIA, WRITERS_STUDIO_BETA_HARD_GATES } from '@/lib/writersStudio/betaCriteria';

const ROOT = process.cwd();
const conversation = readFileSync(join(ROOT, 'app/writers-studio/canvas/WorkConversation.tsx'), 'utf8');
const askReader = readFileSync(join(ROOT, 'lib/manuscript/ask/askReader.ts'), 'utf8');
const beta = readFileSync(join(ROOT, 'app/dev/writers-studio-p4r1/P4R1BetaFeedback.tsx'), 'utf8');
const betaMigration = readFileSync(join(ROOT, 'database/migrations/20260929000005_writer_studio_beta_feedback.sql'), 'utf8');
const betaAccess = readFileSync(join(ROOT, 'lib/writersStudio/betaAccessServer.ts'), 'utf8');
const feedbackRoute = readFileSync(join(ROOT, 'app/api/sovereign/writers-studio/beta-feedback/route.ts'), 'utf8');

describe('WRITERS-STUDIO-SMALL-BETA-01', () => {
  it('turns the eight beta priorities into explicit criteria', () => {
    expect(WRITERS_STUDIO_BETA_CRITERIA.map((x) => x.id)).toEqual([
      'orientation', 'authorship', 'developmental_usefulness', 'continuity',
      'correction_quality', 'epistemic_trust', 'return_to_writing', 'transfer_independence',
    ]);
    expect(WRITERS_STUDIO_BETA_HARD_GATES).toContain('authorship_violation');
    expect(WRITERS_STUDIO_BETA_HARD_GATES).toContain('correction_failure');
    expect(WRITERS_STUDIO_BETA_HARD_GATES).toContain('data_consent_failure');
  });

  it('offers reorientation without auto-sending or changing the Work', () => {
    expect(conversation).toContain('Where are we?');
    expect(conversation).toContain("setDraft([");
    expect(conversation).toContain('Do not introduce a new interpretation yet.');
    expect(conversation).not.toContain("onClick={() => void send()} data-reorient-work");
  });

  it('makes correction an explicit writer act on an exact MAIA turn', () => {
    expect(conversation).toContain('Correct MAIA');
    expect(conversation).toContain('maiaTurnIndex');
    expect(conversation).toContain('What should MAIA carry forward instead?');
    expect(conversation).toContain('Keep correction');
    expect(askReader).toContain('A correction changes your current working understanding; it does not erase what you said earlier.');
  });

  it('keeps beta feedback explicit and requires both beta=1 and server-side pilot membership', () => {
    expect(beta).toContain("params?.get('beta') === '1'");
    expect(beta).toContain("/api/sovereign/writers-studio/beta-access");
    expect(beta).toContain('!requested || !accessSettled || !eligible');
    expect(betaAccess).toContain("contact_type = 'beta_tester'");
    expect(betaAccess).toContain("pipeline_stage = 'active'");
    expect(betaAccess).toContain('c.member_id = $1');
    expect(feedbackRoute).toContain('not_in_beta_pilot');
    expect(beta).toContain('Keep beta note');
  });

  it('stores no passive engagement, dwell, emotion, or manuscript prose telemetry', () => {
    const table = betaMigration.match(/CREATE TABLE IF NOT EXISTS writer_studio_beta_feedback \(([\s\S]*?)\n\);/)?.[1] ?? '';
    expect(table).not.toMatch(/dwell|engagement|emotion|manuscript_body|clickstream/i);
    expect(table).toContain('orientation_context');
    expect(table).toContain('note TEXT');
    expect(betaMigration).toContain('No passive telemetry');
  });
});
