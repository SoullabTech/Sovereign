import fs from 'node:fs';
import path from 'node:path';
import { nextMoveOptions } from '@/lib/writersStudio/writerNextMoves';

const source = fs.readFileSync(
  path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'),
  'utf8',
);

describe('DEVELOPMENTAL-FIELD-01 orientation', () => {
  it('puts whole-Work developmental orientation before problem-first editorial entry', () => {
    expect(source.indexOf('data-developmental-orientation'))
      .toBeLessThan(source.indexOf('Or begin with what you are wondering'));
    expect(source).toContain('Begin with the whole. Choose how you want to move.');
    expect(source).toContain('Development is not a staircase.');
  });

  it('offers open writer choice appropriate to an existing manuscript', () => {
    const options = nextMoveOptions('existing-manuscript', 'whole-work');
    expect(options.map((x) => x.label)).toEqual([
      'Talk about the whole Work',
      'Show me where attention may matter most',
      'Look at a Part or Chapter',
      'Explore sources and intellectual lineage',
      'Something else',
    ]);
    expect(options.every((x) => x.requiresWriterGesture)).toBe(true);
  });

  it('whole-work conversation explicitly refuses silent descent', () => {
    expect(source).toContain('Stay at the whole-Work scale until I choose to go closer.');
    expect(source).toContain('initialDraft={attentionConversationDraft}');
  });

  it('keeps an open path rather than forcing one guided option', () => {
    expect(source).toContain("case 'something-else':");
    expect(source).toContain("setAttentionConversationDraft('')");
  });
});
