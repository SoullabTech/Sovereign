import fs from 'node:fs';
import path from 'node:path';
import {
  writerUnderstandingContext,
  type WriterUnderstanding,
} from '@/lib/writersStudio/writerUnderstanding';

const ROOT = process.cwd();
const read = (...p: string[]) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');

const empty: WriterUnderstanding = {
  workId: 'w1',
  workPurpose: null,
  becoming: null,
  preserve: [],
  readerRelationship: null,
  centralIdeas: [],
  voiceCadence: null,
  intentionalAmbiguity: [],
  challengeMeOn: [],
  nonNegotiables: [],
  unresolvedIntentions: [],
  updatedAt: null,
};

describe('C14 writer understanding', () => {
  it('an empty record contributes no hidden intention', () => {
    expect(writerUnderstandingContext(empty)).toBe('');
  });

  it('renders only explicit author declarations as context', () => {
    const text = writerUnderstandingContext({
      ...empty,
      becoming: 'A book that helps readers encounter the elements directly.',
      preserve: ['mystery without vagueness', 'my lived voice'],
      challengeMeOn: ['unnecessary repetition'],
    });
    expect(text).toContain('AUTHOR-DECLARED WRITING CONTEXT');
    expect(text).toContain('A book that helps readers encounter the elements directly.');
    expect(text).toContain('mystery without vagueness');
    expect(text).toContain('unnecessary repetition');
    expect(text).toContain('not manuscript fact and not personality');
  });

  it('exposes one inspectable, correctable surface and no profile generator', () => {
    const ui = read('app/dev/writers-studio-pc3-live/P4R1WriterUnderstanding.tsx');
    expect(ui).toContain('MAIA’s understanding of your writing');
    expect(ui).toContain('Only your explicit Save changes this record.');
    expect(ui).not.toMatch(/generate.*profile|infer.*personality|score.*voice/i);
  });

  it('feeds Develop, Attention and Focus through governed server-side context', () => {
    const workContext = read('lib/manuscript/ask/workContext.ts');
    const askReader = read('lib/manuscript/ask/askReader.ts');
    const attention = read('app/api/sovereign/manuscripts/[id]/attention-map/route.ts');
    const editorial = read('lib/manuscript/editorialRuntime/turn.ts');

    expect(workContext).toContain('writerUnderstandingContextForManuscript');
    expect(askReader).toContain('writerUnderstanding');
    expect(attention).toContain('writerUnderstandingContextForManuscript');
    expect(editorial).toContain("producerId: 'member.writer_intention'");
  });

  it('keeps C14 member-authored rather than model-authored', () => {
    const route = read('app/api/sovereign/living-works/[id]/writer-understanding/route.ts');
    expect(route).toContain('getMemberIdFromRequest');
    expect(route).toContain('WHERE id = $1 AND member_id = $2');
    expect(route).not.toMatch(/runStructured|getMaiaResponse|Anthropic|OpenAI/);
  });

  it('degrades only undefined-table during migrate-before-swap', () => {
    const server = read('lib/writersStudio/writerUnderstandingServer.ts');
    const route = read('app/api/sovereign/living-works/[id]/writer-understanding/route.ts');

    expect(server).toContain("code === '42P01'");
    expect(server.match(/isUndefinedTable\(error\)/g)).toHaveLength(2);
    expect(server).toContain('throw error');
    expect(route).toContain("code === '42P01'");
    expect(route).toContain('throw error');
  });
});
