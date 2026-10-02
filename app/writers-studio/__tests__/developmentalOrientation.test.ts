import fs from 'node:fs';
import path from 'node:path';
import {
  DEVELOPMENTAL_ORIENTATION_SYSTEM,
  DEVELOPMENTAL_MOVE_IDS,
} from '@/lib/writersStudio/developmentalOrientation';
import { DEVELOPMENTAL_MOVEMENTS } from '@/lib/writersStudio/workDevelopment';

const ROOT = process.cwd();

describe('developmental orientation law', () => {
  it('uses process movements rather than progress stages', () => {
    expect(DEVELOPMENTAL_MOVEMENTS).toEqual([
      'emerging',
      'gathering',
      'differentiating',
      'organizing',
      'deepening',
      'integrating',
      'refining',
      'releasing',
    ]);
    const law = DEVELOPMENTAL_ORIENTATION_SYSTEM.join(' ');
    expect(law).toContain('not assigning stages');
    expect(law).toContain('may hold several developmental movements at once');
    expect(law).not.toMatch(/score|grade|level \d/i);
  });

  it('keeps the writer in authority over next movement', () => {
    expect(DEVELOPMENTAL_MOVE_IDS).toContain('something-else');
    const law = DEVELOPMENTAL_ORIENTATION_SYSTEM.join(' ');
    expect(law).toContain('Suggested moves are invitations only');
    expect(law).toContain('Keep the default scale at the whole Work');
  });

  it('requires evidence-bound model output in the route', () => {
    const route = fs.readFileSync(
      path.join(ROOT, 'app/api/sovereign/manuscripts/[id]/developmental-orientation/route.ts'),
      'utf8',
    );
    expect(route).toContain('developmental_evidence_required');
    expect(route).toContain('developmental_evidence_unbound');
    expect(route).toContain('current_whole_manuscript_readings_required');
    expect(route).toContain("maxItems: 3");
  });

  it('presents reflections as selectable lenses, not commands', () => {
    const view = fs.readFileSync(
      path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'),
      'utf8',
    );
    expect(view).toContain('What may be moving in the Work right now');
    expect(view).toContain('evidence-bound possibilities, not stages or verdicts');
    expect(view).toContain('Explore this movement');
    expect(view).toContain('Clear lens');
    expect(view).toContain('These are suggestions, not a workflow');
  });
});
