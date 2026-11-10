/**
 * ⭐ STANDING FOUNDER RULE (Develop): every capability on the stage is reachable by asking MAIA, as an offer the writer clicks.
 * This test is the acceptance check: an unlisted control fails it; open defects are counted and named, never hidden.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { DEVELOP_CAPABILITIES, DEVELOP_ASKABLE_DEFECTS } from '../developAskable';
import { STUDIO_ACTIONS } from '../studioActions';

const ROOT = join(__dirname, '..', '..', '..');
const SOURCES = ['app/dev/writers-studio-pc3-live/DevelopStage.tsx', 'app/writers-studio/canvas/WorkConversation.tsx'];
/* Containers, statuses and read-only displays: not controls. Adding a CONTROL here to dodge the rule defeats it. */
const NOT_CONTROLS = new Set([
  'data-develop-stage', 'data-develop-chapter', 'data-develop-companion', 'data-develop-conversation', 'data-develop-excerpts',
  'data-develop-more-panel', 'data-develop-picked', 'data-develop-plan', 'data-develop-plan-coverage', 'data-develop-plan-decisions-changed',
  'data-develop-plan-event', 'data-develop-plan-note', 'data-develop-she-read',
  'data-chapter-reading', 'data-correction-status', 'data-maia-focus', 'data-maia-refusal', 'data-maia-work-conversation',
  'data-pending-question', 'data-resume', 'data-sanctuary-turn', 'data-sanctuary-turns', 'data-send-mode', 'data-studio-act-status',
  'data-studio-action', 'data-turn', 'data-work-thread', 'data-studio-conversation', 'data-maia-presentation-notice',
  'data-develop-place',
]);

it('every control on the Develop stage and in its conversation is classified against the rule', () => {
  const listed = new Set(DEVELOP_CAPABILITIES.flatMap((c) => c.controls));
  const found = new Set<string>();
  for (const f of SOURCES) for (const m of readFileSync(join(ROOT, f), 'utf8').matchAll(/\b(data-[a-z][a-z-]*)[=\s>]/g)) found.add(m[1]!);
  const unclassified = [...found].filter((a) => !listed.has(a) && !NOT_CONTROLS.has(a)).sort();
  expect(unclassified).toEqual([]);
});

it('every offer named is a real Work-conversation action', () => {
  for (const c of DEVELOP_CAPABILITIES) {
    if (c.reach.kind !== 'offer') continue;
    const a = STUDIO_ACTIONS.find((x) => x.id === (c.reach as { action: string }).action);
    expect(a?.surfaces).toContain('work-conversation');
  }
});

it('no open defects: every capability is reachable by asking MAIA (14 recorded 2026-11-09, all closed the same day)', () => {
  expect(DEVELOP_ASKABLE_DEFECTS.map((d) => d.key)).toEqual([]);
});

it('a doorway (More) is lawful only while nothing behind it is a defect', () => {
  const doors = DEVELOP_CAPABILITIES.filter((c) => c.reach.kind === 'doorway');
  expect(doors.length === 0 || DEVELOP_ASKABLE_DEFECTS.length === 0).toBe(true);
});
