import {readFileSync} from 'fs';import {resolve} from 'path';
const controller=readFileSync(resolve(__dirname,'../../dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'),'utf8');
const view=readFileSync(resolve(__dirname,'../../dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),'utf8');
// PR #2089 inserted `saveMemberRevisionForId` between the two Saves, so the first Save ends where it begins (otherwise its slice would absorb the second Save's body and satisfy the first Save's assertions with the wrong function's text).
const first=controller.slice(controller.indexOf('  const saveWorkingRevision = useCallback('),controller.indexOf('  const saveMemberRevisionForId = useCallback('));
// PR #2089: the existing-thread Save body is `saveMemberRevisionForId` (it returns the verified
// version id so "Use this" can apply it); `saveMemberRevision` is only its boolean wrapper.
const later=controller.slice(controller.indexOf('  const saveMemberRevisionForId = useCallback('),controller.indexOf('  const saveMemberRevision = useCallback('));
const laterWrapper=controller.slice(controller.indexOf('  const saveMemberRevision = useCallback('),controller.indexOf('  const useVersionNow = useCallback('));
describe('actual mounted member Save custody wiring',()=>{
 it('mounts the MAIA-independent Craft Save callback',()=>{expect(controller).toContain('onSaveWorking={saveWorkingRevision}');expect(view).toContain('onSaveWorking={props.onSaveWorking}');});
 it('first Save carries stable idempotency, current relationship, posture and exact coordinates',()=>{
  expect(first).toContain("apiFetch('/api/writers-studio/editorial/save-working'");expect(first).toContain('idempotencyKey: attempt.key');expect(first).toContain('relationshipId');expect(first).toContain('sanctuary: posture.sanctuary');expect(first).toContain('replacementText: draft.text');
 });
 it('publishes success only after current-authority exact reread',()=>{
  const post=first.indexOf("apiFetch('/api/writers-studio/editorial/save-working'");const reread=first.indexOf('readBoundEditorialThread(body.threadId, focusId, relationshipId)');const exact=first.indexOf('confirmsExactMemberSaveReadback');const publish=first.indexOf('setSuggestedVersionId(body.versionId)');expect(post).toBeGreaterThan(0);expect(reread).toBeGreaterThan(post);expect(exact).toBeGreaterThan(reread);expect(publish).toBeGreaterThan(exact);
 });
 it('does not fabricate MAIA or Apply and reuses uncertain receipt',()=>{expect(first).not.toMatch(/sendBoundEditorialTurn|adoptBoundEditorialVersion|setAppliedVersionId/);expect(first).toContain('retry will reuse the same save receipt');});
 it('existing-thread Save now carries relationship/posture and current reread',()=>{expect(later).toContain("apiFetch('/api/writers-studio/editorial/version'");expect(later).toContain('relationshipId: scopedA2Relationship.id');expect(later).toContain('sanctuary: atGesture.sanctuary');expect(later).toContain('readBoundEditorialThread(draft.threadId, draft.sectionId, scopedA2Relationship.id)');
  expect(laterWrapper).toContain('(await saveMemberRevisionForId(draft)) !== null');
  // Posture is read live at the gesture, before the POST, and again after the readback, before the id is returned.
  const gate=later.indexOf('const atGesture = readCurrentSanctuaryPosture()');const post=later.indexOf("apiFetch('/api/writers-studio/editorial/version'");
  const reread=later.indexOf('readBoundEditorialThread(draft.threadId');const again=later.indexOf('const stillOrdinary = readCurrentSanctuaryPosture()');const out=later.indexOf('return body.versionId as string');
  expect(gate).toBeGreaterThan(-1);expect(post).toBeGreaterThan(gate);expect(again).toBeGreaterThan(reread);expect(out).toBeGreaterThan(again);
  expect(later).toMatch(/!atGesture\.resolved\s*\|\|\s*atGesture\.sanctuary/);expect(later).toMatch(/!stillOrdinary\.resolved\s*\|\|\s*stillOrdinary\.sanctuary/);
 });
});
