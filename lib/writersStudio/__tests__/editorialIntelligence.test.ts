import { editorialDirective, type EditorialDepth } from '../editorialDepth';
import {
  EDITORIAL_INTELLIGENCE_DIRECTIVE,
  EDITORIAL_PACKET_LABELS,
} from '../editorialIntelligence';

const DEPTHS: EditorialDepth[] = ['guided', 'learning', 'direct'];

describe('C3 passage-grounded editorial intelligence', () => {
  it('is composed into every editorial depth without changing the engine', () => {
    for (const depth of DEPTHS) {
      expect(editorialDirective(depth)).toContain(EDITORIAL_INTELLIGENCE_DIRECTIVE);
    }
  });

  it('anchors strength and friction in the passage rather than grading the writer', () => {
    expect(EDITORIAL_INTELLIGENCE_DIRECTIVE).toContain('worth preserving');
    expect(EDITORIAL_INTELLIGENCE_DIRECTIVE).toContain('passage-specific');
    expect(EDITORIAL_INTELLIGENCE_DIRECTIVE).toContain('do not infer a trait');
    expect(EDITORIAL_INTELLIGENCE_DIRECTIVE).toContain('ability in me as a writer');
  });

  it('keeps possibilities optional, unranked, and reader effects hypothetical', () => {
    expect(EDITORIAL_INTELLIGENCE_DIRECTIVE).toContain('optional direction');
    expect(EDITORIAL_INTELLIGENCE_DIRECTIVE).toContain('not be ranked as better or worse');
    expect(EDITORIAL_INTELLIGENCE_DIRECTIVE).toContain('keep it hypothetical');
    expect(EDITORIAL_INTELLIGENCE_DIRECTIVE).toContain('a reader may, might, or could');
  });

  it('preserves evidence, source truth, and tradeoffs', () => {
    expect(EDITORIAL_INTELLIGENCE_DIRECTIVE).toContain('If the evidence is local, keep the claim local');
    expect(EDITORIAL_INTELLIGENCE_DIRECTIVE).toContain('Do not invent biography');
    expect(EDITORIAL_INTELLIGENCE_DIRECTIVE).toContain('what it may gain and what it could cost');
    expect(EDITORIAL_INTELLIGENCE_DIRECTIVE).toContain('keep the current wording');
  });

  it('uses member-facing labels without creating a persisted score object', () => {
    expect(EDITORIAL_PACKET_LABELS).toEqual({
      preserve: 'What I’d preserve',
      friction: 'Friction I notice',
      possibility: 'What I’d try',
    });
  });
});
