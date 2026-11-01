/**
 * Source-coupling witness for JARVIS's late MAIA response refuser.
 * A static placement check is not a full authenticated controller/browser
 * proof. Pure behavioral negatives live in editorialResponseScopeR1.test.ts.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(
  join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'),
  'utf8',
);
const send = source.slice(
  source.indexOf('  const sendEditorial = useCallback('),
  source.indexOf('  const refreshContext = useCallback('),
);

describe('JARVIS source integration: old MAIA responses have no new-Work presentation authority', () => {
  it('requires server-returned Work identity before binding even a URL-addressed thread', () => {
    const bind = source.slice(
      source.indexOf('  const bindEditorialThread = useCallback('),
      source.indexOf('  useEffect(() => {\n    if (!requestedEditorialThread'),
    );
    expect(bind).toContain('thread.workId !== context.manuscriptId');
    expect(bind).toContain('thread.targetSectionId !== focusId');
    expect(bind.indexOf('thread.workId !== context.manuscriptId')).toBeLessThan(bind.indexOf('setEditorialThread(thread)'));
    expect(bind).toContain('setEditorialLivingWorkId(work.id)');
    expect(bind).toContain('workContext.kind !== \'work\'');
    expect(bind).toContain('workReentryRequired.current');
  });

  it('does not rebind manuscript-global URL or chosen history without LivingWork provenance', () => {
    const urlResume = source.slice(
      source.indexOf('  useEffect(() => {\n    if (!requestedEditorialThread'),
      source.indexOf('  const chooseRelationship = useCallback('),
    );
    const choice = source.slice(
      source.indexOf('  const chooseRelationship = useCallback('),
      source.indexOf('  const startNewEditorial = useCallback('),
    );
    const discover = source.slice(
      source.indexOf('  const resolveEditorialForAct = useCallback('),
      source.indexOf('  const openCarryChooser = useCallback('),
    );
    expect(urlResume).not.toContain('readBoundEditorialThread(');
    expect(choice).not.toContain('readBoundEditorialThread(');
    expect(choice).not.toContain('bindEditorialThread(');
    // Founder ruling 2026-11-01: a discovered thread is resumed only when the
    // server verifies it against THIS Work's relationship; otherwise a new
    // conversation opens beside it and the older one is left untouched.
    expect(discover).toContain('readBoundEditorialThread(candidate.threadId, focusId, scopedA2Relationship.id)');
    expect(discover).not.toContain('readBoundEditorialThread(candidate.threadId, focusId, null)');
    expect(discover).toContain('It was left untouched; this is a new conversation.');
    const refresh = source.slice(
      source.indexOf('  const refreshContext = useCallback('),
      source.indexOf('  const applySuggested = useCallback('),
    );
    expect(refresh).toContain('body.manuscriptId !== manuscriptAtRequest');
    expect(refresh.indexOf('editorialActScopeRef.current !== scopeAtRequest')).toBeLessThan(
      refresh.indexOf('setContext(body)'),
    );
  });

  it('captures selection and Work scope before any asynchronous editorial request', () => {
    const scope = source.slice(
      source.indexOf('  const editorialActScope = JSON.stringify('),
      source.indexOf('  const workContextSentence ='),
    );
    expect(scope).toContain('context?.manuscriptId');
    expect(scope).toContain('work?.id');
    expect(scope).toContain('selectedPassage?.start');
    expect(scope).toContain('selectedPassage?.revisionNumber');
    expect(scope).toContain('selectedPassage?.text');
    expect(scope).toContain('editorialActGenerationRef.current += 1');
  });

  it('refuses stale results from both discovery/read and thread creation before binding', () => {
    const start = source.slice(
      source.indexOf('  const startNewEditorial = useCallback('),
      source.indexOf('  const resolveEditorialForAct = useCallback('),
    );
    const resolve = source.slice(
      source.indexOf('  const resolveEditorialForAct = useCallback('),
      source.indexOf('  const openCarryChooser = useCallback('),
    );
    expect(start).toContain('const postureAfterOpen = readCurrentSanctuaryPosture()');
    expect(start).toContain('!stillCurrent() || !postureAfterOpen.resolved || postureAfterOpen.sanctuary');
    expect(start.indexOf('postureAfterOpen.sanctuary')).toBeLessThan(start.indexOf('return bindEditorialThread(opened.thread)'));
    expect(resolve).toContain('if (!stillCurrent()) return null;');
    expect(resolve).toContain('startNewEditorial(stillCurrent)');
  });

  it('refuses changed Work, selection and Sanctuary before sending or showing a reply', () => {
    expect(send).toContain('resolveEditorialForAct(stillCurrent)');
    expect(send).toContain('thread.workId !== context.manuscriptId');
    expect(send).toContain('thread.locusText !== desired');
    expect(send).toContain('!posture.resolved || posture.sanctuary');
    const called = send.indexOf('const outcome = await sendBoundEditorialTurn(');
    const checked = send.indexOf('if (!stillCurrent()) {', called);
    // A valid Work ID is not enough if the writing queue has changed locally.
    expect(send).toContain('writingRef.current.bodyOf(focusId) === bodyAtGesture');
    expect(send).toContain('writingRef.current.currentRevisionId() === revisionAtGesture');
    const checkedPosture = send.indexOf('const currentPosture = readCurrentSanctuaryPosture()', called);
    const checkedReply = send.indexOf('mayPublishEditorialResponse(', called);
    const published = send.indexOf('setEditorialThread(outcome.thread)', called);
    expect(called).toBeGreaterThan(0);
    expect(checked).toBeGreaterThan(called);
    expect(checkedPosture).toBeGreaterThan(checked);
    expect(checkedReply).toBeGreaterThan(checkedPosture);
    expect(published).toBeGreaterThan(checkedReply);
    expect(send).toContain('if (sameVisibleRequest()) setEditorialBusy(false)');
    // When the Source changes without a React context update, retire this
    // request's busy flag without allowing it to clear a newer Work's request.
    expect(send).toContain('const sameVisibleRequest = () =>');
    // A relationship change may cancel the reply without a manuscript edit.
    // Keep the author-facing explanation accurate for either cause.
    expect(send).toContain('earlier reply was withheld because the current Work, relationship, passage or writing could not be reconfirmed.');
    expect(send).toContain('No change was applied.');
  });
});
