/**
 * KEEP-LEGACY-SURFACE-01-R1 — retirement guard.
 *
 * The legacy conversational Keep response endpoint is not a second COMMIT
 * authority. It must hard-refuse before authentication, request-body parsing,
 * governor mutation, gesture mutation, or atom persistence can execute.
 *
 * This guard is deliberately source-topological: if any legacy executable
 * authority is reintroduced below the refusal, the route must stay incapable
 * of reaching it by containing no such imports or call sites at all.
 */
import { readFileSync } from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../../../../../..');
const ROUTE = 'app/api/psyche/conversational-keep/respond/route.ts';

function readRoute(): string {
  return readFileSync(path.join(repoRoot, ROUTE), 'utf8');
}

describe('KEEP-LEGACY-SURFACE-01-R1 — legacy respond authority retired', () => {
  it('hard-refuses with HTTP 410', () => {
    const src = readRoute();

    expect(src).toContain('LEGACY_KEEP_RESPOND_RETIRED');
    expect(src).toContain('{ status: 410 }');
  });

  it('cannot authenticate, parse a command body, or reach legacy persistence/governor seams', () => {
    const src = readRoute();

    for (const forbidden of [
      'getMemberIdFromRequest',
      'request.json()',
      'applyConversationalKeepResult',
      'keepSource',
      'applyAtomGesture',
      'pauseOffers',
      'resumeOffers',
      'recordAccept',
      'recordDecline',
      'isFilingInstruction',
      'isGestureInstruction',
      "case 'accept_offer'",
      "case 'confirm_filing'",
      "case 'confirm_gesture'",
    ]) {
      expect(src).not.toContain(forbidden);
    }
  });

  it('names the canonical successor rather than silently disappearing', () => {
    const src = readRoute();

    expect(src).toContain('/api/capsules');
    expect(src).toContain('UNDERSTAND → FACILITATE → COMMIT');
  });
});
