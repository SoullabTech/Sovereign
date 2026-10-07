import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('R8G Craft Canvas / Craftsman Guide recovery', () => {
  const conversation = read('app/writers-studio/canvas/WorkConversation.tsx');
  const develop = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
  const developController = read('app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx');
  const writeController = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  const writeView = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const isolated = read('app/dev/writers-studio-pc3-live/IsolatedEditorialRoom.tsx');
  const dance = read('app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx');
  const workAsk = read('lib/manuscript/ask/askReader.ts');
  const developmentalAsk = read('lib/manuscript/ask/developmentalAskReader.ts');
  const craft = read('lib/writersStudio/craftCanvas.ts');
  const route = read('app/api/writers-studio/editorial/turn/route.ts');

  it('lets a live MAIA turn become an explicit craft handoff without copying the transcript into the URL', () => {
    expect(conversation).toContain('lastMaiaTurnIndex');
    expect(develop).toContain('Work this into the writing →');
    expect(develop).toContain('sourceThreadId: threadId');
    expect(develop).toContain('sourceMaiaTurnIndex: lastMaiaTurnIndex');
    expect(developController).toContain('CRAFT_SOURCE_THREAD');
    expect(developController).toContain('CRAFT_SOURCE_MAIA_TURN');
    expect(developController).not.toContain('query.set(CRAFT_SOURCE_THREAD, chapterDialogue');
  });

  it('distinguishes craft from direct revision, using exact evidence first and writer passage choice only as fallback', () => {
    expect(developController).toContain("craftFromConversation ? 'craft-passage' : 'try-revision'");
    expect(developController).toContain("craftFromConversation ? 'choose-craft-passage' : 'choose-revision-passage'");
    expect(writeController).toContain("incomingAction === 'choose-craft-passage'");
    expect(writeController).toContain("incomingAction === 'craft-passage'");
    expect(writeController).toContain('craftPrimerPrompt()');
    expect(writeController).toContain("proposalPolicy: 'allow'");
    expect(writeController).toContain('proposalRequested: true');
  });

  it('re-resolves conversation context server-side before editorial cognition', () => {
    expect(route).toContain('resolveWorkConversationCraftCarry');
    expect(route).toContain('receiverThreadId: parsed.threadId');
    expect(route).toContain('sourceThreadId: parsed.workConversationThreadId');
    expect(route).toContain('sourceMaiaTurnIndex: parsed.workConversationMaiaTurnIndex!');
    expect(route).toContain('persistMemberEditorialAct');
  });

  it('promotes the existing passage workspace into the Craft Canvas rather than adding another column', () => {
    expect(writeView).toContain('craftMode={props.craftMode}');
    expect(isolated).toContain("aria-label={craftMode ? 'Craft Canvas' : 'Isolated passage editor'}");
    expect(isolated).toContain('Craft Canvas · See · Talk · Make');
    expect(writeView).toContain('Your conversation has become craft');
    expect(writeView).toContain('You do not need to restate what you meant');
  });

  it('keeps examples as primers while authoring one provisional demonstration for the marked manuscript', () => {
    expect(craft).toContain('brief craft primer');
    expect(craft).toContain('ONE provisional demonstration version');
    expect(craft).toContain('example, not a recommendation and not finished prose');
    expect(dance).toContain('Examples to spark your own version');
    expect(dance).toContain('data-craft-working');
    expect(dance).toContain('MAIA’s examples are primers, not answers');
    expect(dance).toContain('Write your version');
    expect(dance).toContain('Apply my version');
  });

  it('corrects the old false boundary: MAIA may co-create but may not silently mutate', () => {
    expect(workAsk).toContain('cannot silently');
    expect(workAsk).toContain('help the writer create');
    expect(workAsk).toContain('primers and possibilities');
    expect(workAsk).toContain('explicit Apply boundary');

    expect(developmentalAsk).toContain('cannot silently');
    expect(developmentalAsk).toContain('help them create');
    expect(developmentalAsk).toContain('primers and possibilities');
    expect(developmentalAsk).toContain('explicit Apply boundary');
  });
});
