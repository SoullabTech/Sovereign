import {readFileSync} from 'fs';import {resolve} from 'path';
const controller=readFileSync(resolve(__dirname,'../../dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'),'utf8');
const view=readFileSync(resolve(__dirname,'../../dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),'utf8');
const first=controller.slice(controller.indexOf('  const saveWorkingRevision = useCallback('),controller.indexOf('  const saveMemberRevision = useCallback('));
const later=controller.slice(controller.indexOf('  const saveMemberRevision = useCallback('),controller.indexOf('  const openWorkspace = useCallback('));
describe('actual mounted member Save custody wiring',()=>{
 it('mounts the MAIA-independent Craft Save callback',()=>{expect(controller).toContain('onSaveWorking={saveWorkingRevision}');expect(view).toContain('onSaveWorking={props.onSaveWorking}');});
 it('first Save carries stable idempotency, current relationship, posture and exact coordinates',()=>{
  expect(first).toContain("apiFetch('/api/writers-studio/editorial/save-working'");expect(first).toContain('idempotencyKey: attempt.key');expect(first).toContain('relationshipId');expect(first).toContain('sanctuary: posture.sanctuary');expect(first).toContain('replacementText: draft.text');
 });
 it('publishes success only after current-authority exact reread',()=>{
  const post=first.indexOf("apiFetch('/api/writers-studio/editorial/save-working'");const reread=first.indexOf('readBoundEditorialThread(body.threadId, focusId, relationshipId)');const exact=first.indexOf('confirmsExactMemberSaveReadback');const publish=first.indexOf('setSuggestedVersionId(body.versionId)');expect(post).toBeGreaterThan(0);expect(reread).toBeGreaterThan(post);expect(exact).toBeGreaterThan(reread);expect(publish).toBeGreaterThan(exact);
 });
 it('does not fabricate MAIA or Apply and reuses uncertain receipt',()=>{expect(first).not.toMatch(/sendBoundEditorialTurn|adoptBoundEditorialVersion|setAppliedVersionId/);expect(first).toContain('retry will reuse the same save receipt');});
 it('existing-thread Save now carries relationship/posture and current reread',()=>{expect(later).toContain("apiFetch('/api/writers-studio/editorial/version'");expect(later).toContain('relationshipId: scopedA2Relationship.id');expect(later).toContain('sanctuary: atGesture.sanctuary');expect(later).toContain('readBoundEditorialThread(draft.threadId, draft.sectionId, scopedA2Relationship.id)');});
});
