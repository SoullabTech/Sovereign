import fs from 'fs';
import path from 'path';

/* Founder ruling 2026-11-05 + relationships.ts law: auto-picking a conversation is a
   defect; the writer decides. Defeat candidates: "resume the first verified one", and
   "drop the request while asking" (both seen in local walks). */
const src = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'), 'utf8');
const resolve = src.slice(src.indexOf('const resolveEditorialForAct = useCallback'), src.indexOf('const openCarryChooser = useCallback'));

test('every conversation of this Work is verified before deciding, and several are offered, not picked', () => {
  expect(resolve).toContain('if (out.ok) verified.push(out.thread);');
  expect(resolve).not.toMatch(/if \(out\.ok && bindEditorialThread\(out\.thread\)\) return out\.thread;/);
  expect(resolve).toContain('if (verified.length === 1)');
  expect(resolve).toContain('setConversationChoices([...verified].sort(');
});

test('the request that asked waits in flight for the writer’s answer, then continues with its own checks', () => {
  expect(resolve).toContain('await new Promise<ConversationAnswer>((resolve) => { choiceResolverRef.current = resolve; });');
  expect(resolve).toMatch(/if \(answer\.kind === 'cancel' \|\| !stillCurrent\(\)\) return null;/);
  expect(resolve).toContain("if (answer.kind === 'new') return startNewEditorial(stillCurrent);");
  expect(resolve).toContain('return bindEditorialThread(answer.thread) ? answer.thread : null;');
});

test('choosing answers the waiting request; a new one is an answer too; leaving cancels it', () => {
  const choose = src.slice(src.indexOf('const chooseConversation = useCallback'), src.indexOf('const chooseRelationship = useCallback'));
  expect(choose).toContain("choiceResolverRef.current({ kind: 'thread', thread: chosen });");
  expect(choose).toContain("choiceResolverRef.current?.({ kind: 'new' });");
  const clear = src.slice(src.indexOf('const clearEditorial = useCallback'), src.indexOf('const focusWritingSection = useCallback'));
  expect(clear).toContain('cancelConversationChoice();');
});

test('a refused request tells the writer plainly; server detail never reaches the screen', () => {
  // Local walk 2026-11-05: "unknown field(s): replyLength — these are server facts…" was shown.
  expect(src).not.toContain('setEditorialFailure(outcome.detail');
  expect(src).toContain("setEditorialFailure('MAIA couldn’t answer that just now. Nothing was changed. Please try again.');");
});

test('while MAIA asks which conversation, the writer can still leave, and leaving cancels the question', () => {
  // Local walk 2026-11-05: Back to the page and Return to Develop were disabled while she waited.
  const view = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'), 'utf8');
  expect(view).toContain('const busy = (props.editorialBusy && !awaitingConversationChoice) ||');
  const close = src.slice(src.indexOf('const closeWorkspace = useCallback'), src.indexOf('const returnToStartingPassage = useCallback'));
  expect(close).toContain('(editorialBusy && !awaitingChoice)');
  expect(close).toContain('if (awaitingChoice) { cancelConversationChoice(); setConversationChoices([]); }');
  expect(src).toContain('useEffect(() => { if (!workspaceOpen) cancelConversationChoice(); }, [workspaceOpen]);');
});
