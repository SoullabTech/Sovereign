import { readFileSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..', '..', '..');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const prompt = strip(readFileSync(join(root, 'app/dev/writers-studio-pc3-live/KeepNotePrompt.tsx'), 'utf8'));
const controller = strip(readFileSync(join(root, 'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'), 'utf8'));

describe('Keep mine · writer-confirmed decision', () => {
  it('"Keep mine" itself records nothing: onKeep only opens the offer', () => {
    const onKeep = controller.slice(controller.indexOf('onKeep={() => {'), controller.indexOf('onLatitude='));
    expect(onKeep).toContain('setKeepNoteFor({ sectionId: focusId');
    expect(onKeep).not.toMatch(/settleDecision|decisionClient|fetch\(|apiFetch/);
  });
  it('a decision is written only by the confirm button, with the text in the box', () => {
    const confirm = prompt.slice(prompt.indexOf('const confirm'), prompt.indexOf('return ('));
    expect(confirm).toContain('settleDecisionNote(workId, text, false');
    // exactly one write call in the whole component, and it is inside confirm
    expect((prompt.match(/settleDecisionNote\(/g) ?? []).length).toBe(1);
    expect(prompt).toMatch(/onClick=\{\(\) => void confirm\(\)\}/);
  });
  it('declining records nothing', () => {
    expect(prompt).toMatch(/<button type="button" onClick=\{onDone\}>No thanks<\/button>/);
  });
  it('Sanctuary or an unresolved setting records nothing and says so', () => {
    const confirm = prompt.slice(prompt.indexOf('const confirm'), prompt.indexOf('settleDecisionNote('));
    expect(confirm).toMatch(/!posture\.resolved \|\| posture\.sanctuary/);
    expect(confirm).toContain('return;');
  });
  it('the sentence is editable by the writer before it is recorded', () => {
    expect(prompt).toMatch(/value=\{text\} onChange=\{\(e\) => setText\(e\.target\.value\)\}/);
  });
});
