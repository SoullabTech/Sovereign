/**
 * R49 held physical journey: no application route, no real author promotion.
 */
import path from 'node:path';
import {readFileSync,readdirSync} from 'node:fs';
import {R42_REAL_SOURCE_DRAFT_ENABLED}
 from '../heldSourceDraftBridgeR42';
import {R47_REAL_PRIVATE_EDITORIAL_ENABLED}
 from '../heldPrivateEditorialReviewR47';
import {R46_REAL_DURABLE_SIGNED_APPLY_ENABLED}
 from '../heldDurableSignedApplyR46';
import {R47_REAL_DURABLE_UNDO_ENABLED}
 from '../heldDurableUndoR47';
import {R48_REAL_SPENT_APPLY_RECOVERY_ENABLED}
 from '../heldSpentApplyEvidenceR48';

function paths(dir:string):string[]{
 return readdirSync(dir,{withFileTypes:true}).flatMap(f=>{
  const p=path.join(dir,f.name);
  return f.isDirectory()?paths(p):
   f.isFile()&&/^route\.(ts|tsx)$/.test(f.name)?[p]:[];
 });
}
describe('R49 continuous one-Work fixture cannot become real Writer route',()=>{
 it('all five protected authorities compile default OFF',()=>{
  expect(R42_REAL_SOURCE_DRAFT_ENABLED).toBe(false);
  expect(R47_REAL_PRIVATE_EDITORIAL_ENABLED).toBe(false);
  expect(R46_REAL_DURABLE_SIGNED_APPLY_ENABLED).toBe(false);
  expect(R47_REAL_DURABLE_UNDO_ENABLED).toBe(false);
  expect(R48_REAL_SPENT_APPLY_RECOVERY_ENABLED).toBe(false);
 });
 it('all new R49 tests require exact fictional-only opt-ins',()=>{
  const source=readFileSync(path.join(process.cwd(),
   'scripts/ops/__tests__/r49SingleWorkWholeJourneyPG16.test.ts'),'utf8');
  const cold=readFileSync(path.join(process.cwd(),
   'scripts/ops/__tests__/r49WholeWorkColdPG16.test.ts'),'utf8');
  expect(source).toContain(
   "process.env[k]==='fictional-only'");
  expect(source).toContain('const tests=enabled?describe:describe.skip');
  expect(cold).toContain("process.env.R49_COLD_PHYSICAL_PG16==='fictional-only'");
  expect(cold).toContain('const tests=enabled?describe:describe.skip');
 });
 it('no active Next API writer route invokes R49 or recovery prototypes',()=>{
  const root=path.join(process.cwd(),'app/api');
  const names=/r49SingleWorkWholeJourney|wsBetaR49WholeWorkPG16|heldPrivateEditorialReviewR47|heldDurableUndoR47|heldSpentApplyEvidenceR48/;
  expect(paths(root).filter(file=>names.test(readFileSync(file,'utf8')))).toEqual([]);
 });
 it('R49 adds neither production migration nor ordinary file vault plain writer',()=>{
  const code=readFileSync(path.join(process.cwd(),
   'scripts/ops/__tests__/r49SingleWorkWholeJourneyPG16.test.ts'),'utf8');
  expect(code).toContain('beginHeldDraftFromOriginalR42');
  expect(code).toContain('recordHeldPrivateReviewR47');
  expect(code).toContain('prepareHeldSignedApplyR46');
  expect(code).toContain('inspectSpentApplyR48');
  expect(code).toContain('submitHeldUndoR47');
  expect(code).not.toMatch(/\bfetch\s*\(|sendEmail|update.*Production|releaseApproved:true/);
 });
});
