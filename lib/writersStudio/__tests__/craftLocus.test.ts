import { resolveCraftLocusHint } from '../craftLocus';
import type { RebuildSection } from '../rebuild/model';

const section = (
  id: string,
  heading: string,
  body: string,
  position: number,
): RebuildSection => ({
  draftSectionId: id,
  sourceSectionId: null,
  position,
  heading,
  headingDepth: 2,
  headingSignal: 'markdown',
  body,
  headingPrefix: '',
  editable: true,
});

const fire = section(
  'fire',
  'FIRE — ACTIVATING, AMPLIFYING, ACTUALIZING',
  [
    'Fire begins through Activating, when something awakens within us.',
    'We notice a spark of possibility, a vision, desire, question, calling, or sense that something more is trying to emerge.',
    'Fire illuminates our awareness and turns our attention toward the future.',
    'Later the section continues into more explanation.',
  ].join(' '),
  138,
);

describe('R8I Hermes high-confidence craft locus', () => {
  it('uses a problem-bearing quoted phrase to orient to one unique current heading', () => {
    const body = [
      'Maya has embodied moments that work well.',
      'But the chapter gets more conceptual when it breaks down the phases.',
      'The way Fire moves through "Activating, Amplifying, Actualizing" feels too systematic and less organic.',
    ].join('\n\n');

    const hint = resolveCraftLocusHint(body, [
      section('maya', 'MEET MAYA', 'Maya began noticing this in ordinary moments.', 134),
      fire,
    ]);

    expect(hint?.sectionId).toBe('fire');
    expect(hint?.start).toBe(0);
    expect(hint?.end).toBeGreaterThan(hint?.start ?? 0);
    expect(hint?.anchor).toBe('Activating, Amplifying, Actualizing');
    expect(fire.body.slice(hint!.start, hint!.end)).toContain('Fire begins through Activating');
  });

  it('does not turn a positively cited example into the craft problem locus', () => {
    const body = 'This embodied passage works — "A single human moment can contain intuition, emotion, sensation, memory, thought, relationship, instinct, and meaning all at once."';
    const hint = resolveCraftLocusHint(body, [
      section(
        'moment',
        'A SINGLE HUMAN MOMENT CAN CONTAIN INTUITION EMOTION SENSATION MEMORY THOUGHT RELATIONSHIP INSTINCT AND MEANING ALL AT ONCE',
        'This is already alive on the page.',
        137,
      ),
    ]);
    expect(hint).toBeNull();
  });

  it('refuses to pick when the same literal anchor names more than one current heading', () => {
    const body = 'The systematic problem appears around "Activating, Amplifying, Actualizing" and the phases feel too conceptual.';
    const hint = resolveCraftLocusHint(body, [
      fire,
      section('fire-2', 'Activating, Amplifying, Actualizing', 'Another current section.', 139),
    ]);
    expect(hint).toBeNull();
  });
});
