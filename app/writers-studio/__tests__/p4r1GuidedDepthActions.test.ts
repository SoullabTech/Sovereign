import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('P4R1 guided depth actions', () => {
  const develop = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
  const marker = read('app/dev/writers-studio-pc3-live/ObservationManuscriptLayer.tsx');
  const dialogue = read('app/writers-studio/develop/ObservationDialogue.tsx');
  const write = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const revisionLayer = read('app/dev/writers-studio-pc3-live/RevisionManuscriptLayer.tsx');

  it('turns Teach me why and Go deeper into explicit auto-sent observation acts', () => {
    expect(develop).toContain('Teach me why');
    expect(develop).toContain('Go deeper');
    expect(develop).toContain('autoSendInitialQuestion={Boolean(dialoguePrompt)}');
    expect(develop).toContain("setDialoguePrompt('Teach me the one writing or craft idea");
    expect(develop).toContain("setDialoguePrompt('Go deeper on this observation");
  });

  it('uses the same one-click guided depth acts from a manuscript observation marker', () => {
    expect(marker).toContain('Help me understand');
    expect(marker).toContain('Teach me why');
    expect(marker).toContain('Go deeper');
    expect(marker).toContain('autoSendInitialQuestion');
  });

  it('waits for lawful thread discovery before auto-sending', () => {
    expect(dialogue).toContain("if (decision === null || mode.kind === 'blocked' || busy) return;");
    expect(dialogue).toContain('autoSent.current = true;');
    expect(dialogue).toContain('void send();');
  });

  it('keeps proposal marks non-mutating until member version/save and Apply', () => {
    expect(write).toContain('<RevisionManuscriptLayer');
    expect(revisionLayer).toContain('Save these as my version');
    expect(write).toContain('props.onSaveMember');
    expect(write).not.toContain('onToggle={props.onApply}');
  });
});
