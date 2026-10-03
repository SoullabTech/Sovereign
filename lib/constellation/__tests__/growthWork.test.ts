import fs from 'node:fs';
import path from 'node:path';
import { GROWTH_DEFAULT_OUTCOME, GROWTH_WORK_TASKS, makeGrowthWorkingBrief, type GrowthWorkTask } from '../growthWork';
import { requireFounder } from '../../founder/founderAuth';
import GrowthWorkPage from '../../../app/founder/constellation/work/page';
import GrowthWork from '../../../app/founder/constellation/work/GrowthWork';
import { isWebOnlyRoute } from '../../mobile/mobileAllowlist';

jest.mock('../../founder/founderAuth', () => ({ requireFounder: jest.fn() }));
jest.mock('../../../app/founder/constellation/work/growth-work.module.css', () => ({ __esModule: true, default: {} }));
const auth = requireFounder as jest.Mock;
const source = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Accessible founder workflow — briefs, not pretend delegation', () => {
  it.each(GROWTH_WORK_TASKS)('makes a bounded working brief for $label', task => {
    const brief = makeGrowthWorkingBrief(GROWTH_DEFAULT_OUTCOME,task.id);
    expect(brief).toContain('not a new execution grant');
    expect(brief).toContain('maximum 30-day retention');
    expect(brief).toContain('no return tracking or marketing follow-up');
    expect(brief).toContain(task.instruction);
  });
  it.each(['', '   ', 'x'.repeat(1201)])('refuses an absent or unbounded outcome', outcome => {
    expect(()=>makeGrowthWorkingBrief(outcome,'prepare-pilot')).toThrow();
  });
  it('does not accept an invented executable task',()=>{
    expect(()=>makeGrowthWorkingBrief('Run this','deploy-now' as GrowthWorkTask)).toThrow();
  });
  it.each([401,403])('refuses before mounting the work component for %s',async status=>{
    auth.mockResolvedValue({ok:false,status,error:'not allowed'});
    const page=await GrowthWorkPage();
    expect(page.type).not.toBe(GrowthWork);
    expect(page.props['aria-label']).toBe('Founder access required');
  });
  it('authorized founder reaches the work component',async()=>{
    auth.mockResolvedValue({ok:true,memberId:'synthetic'});
    const prior=process.env.CAPACITOR_BUILD;delete process.env.CAPACITOR_BUILD;
    try {expect((await GrowthWorkPage()).type).toBe(GrowthWork);} finally {
      if(prior!==undefined)process.env.CAPACITOR_BUILD=prior;
    }
  });
  it('admin, founder nav and report point to one workspace',()=>{
    for(const file of ['app/admin/page.tsx','lib/founder/founderNav.ts','app/founder/constellation/LearningReportView.tsx'])
      expect(source(file)).toContain('/founder/constellation/work');
    expect(isWebOnlyRoute('/founder/constellation/work')).toBe(true);
  });
  it('the working brief has clipboard transport only, not an AI or storage side channel',()=>{
    const text=source('app/founder/constellation/work/GrowthWork.tsx');
    expect(text).toContain('navigator.clipboard.writeText(brief)');
    expect(text).not.toMatch(/\b(fetch|apiFetch|localStorage|sessionStorage|WebSocket|sendBeacon)\b/);
  });
  it('the candidate schema cannot be automatically migrated and has elapsed-time retention',()=>{
    const schema=source('lib/constellation/experience/schema.candidate.sql');
    expect(schema).toContain("interval '720 hours'");
    expect(schema).not.toContain("interval '30 days'");
    expect(fs.readdirSync(path.join(process.cwd(),'database/migrations')).some(file=>file.includes('constellation_experience'))).toBe(false);
  });
});
