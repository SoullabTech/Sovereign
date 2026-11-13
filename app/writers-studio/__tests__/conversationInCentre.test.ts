/**
 * Founder direction 2026-11-12: "the right column should be a guideline and interactive dashboard while the middle is where the creative
 * process between MAIA and writer happens". Source-level pins; the browser walk after deploy is the acceptance.
 */
import fs from 'node:fs';
import path from 'node:path';
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
const controller = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');

describe('the conversation happens in the middle; the right column is the guide', () => {
  it('⭐ MUST FAIL IF the conversation about the Work renders in the right column', () => {
    const maia = view.slice(view.indexOf('const writeMaia = props.work ? ('), view.indexOf('const blankArrival'));
    expect(maia).not.toMatch(/\{workConversation\}|workConversationOpen \? \(\s*workConversation/);
    expect(view).toMatch(/\) : craftVisible \? craftWork : workCentre \?\? workSurface\}/);
  });
  it('⭐ the letter stays in view on the right while the writer talks', () => {
    expect(view).not.toMatch(/<div hidden=\{workConversationOpen\} data-write-letter="true"/);
    expect(view).toMatch(/<div data-write-letter="true"/);
  });
  it('the centre conversation has a way back to the page that asks about an unsent draft', () => {
    expect(view).toMatch(/data-write-centre-back="true" onClick=\{\(\) => \{ if \(!requestConversationDeparture\(\)\) return;/);
  });
  it('"Talk about it" arrives as Focus (the desk opens on the passage) and never as a revision request', () => {
    const talk = controller.slice(controller.indexOf('const onTalkPassIssue'), controller.indexOf('if (phase !== \'ready\' || !context)'));
    expect(talk).toMatch(/next\.set\('insightAction', 'focus'\)/);
    expect(talk).not.toMatch(/try-revision/);
    expect(controller).toMatch(/onTalkPassIssue=\{onTalkPassIssue\}/);
  });
});
