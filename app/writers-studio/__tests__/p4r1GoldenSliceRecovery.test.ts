import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('R8B–R8E Chapter 10 golden-slice recovery', () => {
  const shell = read('app/writers-studio/full-redesign/Shell.tsx');
  const css = read('app/dev/writers-studio-full-redesign-review/full-redesign-review.css');
  const develop = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
  const askClient = read('lib/writersStudio/askClient.ts');
  const askRoute = read('app/api/sovereign/manuscripts/[id]/ask/route.ts');
  const workContext = read('lib/manuscript/ask/workContext.ts');
  const askReader = read('lib/manuscript/ask/askReader.ts');

  it('does not reserve a permanent MAIA rail in Develop at rest', () => {
    expect(develop).toContain('const [workTalking, setWorkTalking] = useState(false)');
    expect(develop).toContain('maia={maiaConversationActive ? maia : undefined}');
    expect(shell).toContain("? 'fr-room fr-room-no-maia'");
    expect(css).toContain('.fr-room.fr-room-no-maia');
  });

  it('gives serious conversation a draggable MAIA / Work divider', () => {
    expect(develop).toContain('maiaResizable={maiaConversationActive}');
    expect(shell).toContain('className="fr-maia-divider"');
    expect(shell).toContain('Resize Work and MAIA conversation');
    expect(shell).toContain('onPointerDown={beginMaiaResize}');
    expect(shell).toContain('onDoubleClick={() => setMaiaShare');
    expect(css).toContain(".fr-room[data-resizable-maia='true']");
  });

  it('carries a server-verified chapter-reading identifier into the one Work conversation', () => {
    expect(develop).toContain('chapterReadingId={chapterDialogue.readingId}');
    expect(askClient).toContain('chapterReadingId?: string');
    expect(askRoute).toContain('const chapterReadingId = typeof body.chapterReadingId');
    expect(workContext).toContain('buildChapterConversationContext');
    expect(workContext).toContain('chapterConversation: ChapterConversationContext | null');
    expect(askReader).toContain('renderChapterConversationContext(chapterConversation)');
  });

  it('keeps the chapter surface relational and simple-first', () => {
    expect(develop).toContain('Talk with MAIA about the movement');
    expect(develop).toContain('Talk with MAIA about what to protect');
    expect(develop).toContain('Talk with MAIA about what may need strengthening');
    expect(develop).not.toContain('Try a revision');
    expect(develop).not.toContain('Chapter scorecard');
  });

  it('opens passage work only after MAIA has replied in the chapter conversation', () => {
    const workConversation = read('app/writers-studio/canvas/WorkConversation.tsx');
    expect(workConversation).toContain('afterMaiaTurn && pending === null && turns.some');
    expect(develop).toContain('When you’re ready · choose a passage to work on →');
    expect(develop).toContain("'chapter-review'");
  });

  it('renders MAIA conversation as breathable reading rather than a wall of text', () => {
    const workConversation = read('app/writers-studio/canvas/WorkConversation.tsx');
    const workingStyle = read('lib/writersStudio/workingStyle.ts');
    const css = read('app/dev/writers-studio-p4r1/p4r1-live.css');
    expect(workConversation).toContain('readableMaiaParagraphs');
    expect(workConversation).toContain('data-readable-turn="maia"');
    expect(workConversation).toContain('data-turn-paragraph="true"');
    expect(workingStyle).toContain('short, breathable paragraphs');
    expect(css).toContain("[data-readable-turn='maia'] [data-turn-paragraph='true']");
    expect(css).toContain('font-size:17.5px!important');
    expect(css).toContain('line-height:1.82!important');
    expect(css).toContain('max-width:64ch');
  });
});
