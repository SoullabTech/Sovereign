/** Fictional-only, no server, no credentials, no provider or author writes. */
import { apiFetch } from '@/lib/http/apiBase';
import { preflightRealAuthorActionR1J, R1J_REAL_MEMBER_AUTHOR_ACTIONS_RELEASED } from '../realAuthorActionPreflightR1J';
import { readFileSync } from 'node:fs';
import path from 'node:path';

jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
const client = apiFetch as jest.MockedFunction<typeof apiFetch>;
const OWNED_FICTIONAL_MANUSCRIPT = '33333333-3333-4333-8333-333333333333';
const TARGET = '/api/sovereign/writers-studio/manuscripts/' + OWNED_FICTIONAL_MANUSCRIPT + '/protected-readiness';

beforeEach(() => { client.mockReset(); });

describe('R1J real editor: authenticated, read-only, never a write capability', () => {
  it('is compile-time held regardless of build/env flags', () => {
    expect(R1J_REAL_MEMBER_AUTHOR_ACTIONS_RELEASED).toBe(false);
  });
  it.each(['apply', 'undo'] as const)('refuses %s without a valid manuscript scope before any request', async action => {
    for (const id of [null, undefined, '', 'fabricated', '../foreign', '99999999-9999-9999-9999-999999999999']) {
      const outcome = await preflightRealAuthorActionR1J(id, action);
      expect(outcome).toMatchObject({kind:'held',authorized:false,releaseApproved:false,reason:'no_manuscript_scope'});
    }
    expect(client).not.toHaveBeenCalled();
  });
  it.each(['apply', 'undo'] as const)('makes exactly one no-store metadata GET before held %s, never a POST', async action => {
    client.mockResolvedValue({status:423} as Response);
    const outcome = await preflightRealAuthorActionR1J(OWNED_FICTIONAL_MANUSCRIPT,action);
    expect(outcome).toMatchObject({kind:'held',authorized:false,releaseApproved:false,reason:'protected_writer_held'});
    expect(outcome.message).toContain(action === 'apply' ? 'No suggestion was applied.' : 'No Undo was performed.');
    expect(client).toHaveBeenCalledTimes(1);
    expect(client).toHaveBeenCalledWith(TARGET,{method:'GET',cache:'no-store',credentials:'include'});
    const request = client.mock.calls[0];
    expect(JSON.stringify(request)).not.toContain('authorizationId');
    expect(JSON.stringify(request)).not.toContain('memberId');
    expect(JSON.stringify(request)).not.toContain('replacementText');
  });
  it.each([[401,'session_not_verified'],[403,'scope_not_available'],[404,'scope_not_available'],[423,'protected_writer_held'],[500,'readiness_unavailable'],[503,'readiness_unavailable'],[200,'read_only_is_not_authority'],[204,'read_only_is_not_authority']] as const)
    ('cannot turn status %s into Apply authority',async(status,reason)=>{
      client.mockResolvedValue({status, json:async()=>({canApply:true,canUndo:true,releaseApproved:true})} as Response);
      const actual=await preflightRealAuthorActionR1J(OWNED_FICTIONAL_MANUSCRIPT,'apply');
      expect(actual).toMatchObject({kind:'held',authorized:false,releaseApproved:false,reason});
      expect(client).toHaveBeenCalledTimes(1);
    });
  it('refuses on transport exception without a backup write or another request', async()=>{
    client.mockRejectedValue(new Error('SYNTHETIC_READINESS_UNAVAILABLE'));
    const result=await preflightRealAuthorActionR1J(OWNED_FICTIONAL_MANUSCRIPT,'undo');
    expect(result).toMatchObject({kind:'held',authorized:false,reason:'readiness_unavailable'});
    expect(client).toHaveBeenCalledTimes(1);
  });
  it('both ordinary author UI paths perform preflight before legacy Apply, Undo, and autosave settlement',()=>{
    const root=process.cwd();
    const files=[
      'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx',
      'app/writers-studio/rebuild/RebuildStudioClient.tsx',
    ];
    for(const filename of files){
      const src=readFileSync(path.join(root,filename),'utf8');
      const apply=src.slice(src.indexOf('const applySuggested = useCallback('),src.indexOf('const undoSuggested = useCallback('));
      const undo=src.slice(src.indexOf('const undoSuggested = useCallback('),src.indexOf('\n  const ',src.indexOf('const undoSuggested = useCallback(')+50));
      const applyCheck=apply.indexOf("preflightRealAuthorActionR1J(context?.manuscriptId, 'apply')");
      const undoCheck=undo.indexOf("preflightRealAuthorActionR1J(context?.manuscriptId, 'undo')");
      expect(applyCheck).toBeGreaterThan(0);
      expect(undoCheck).toBeGreaterThan(0);
      expect(apply.indexOf('if (!preflight.authorized)')).toBeGreaterThan(applyCheck);
      expect(undo.indexOf('if (!preflight.authorized)')).toBeGreaterThan(undoCheck);
      expect(applyCheck).toBeLessThan(apply.indexOf('settleWriting()'));
      expect(applyCheck).toBeLessThan(apply.indexOf('adoptBoundEditorialVersion('));
      expect(undoCheck).toBeLessThan(undo.indexOf("'/api/writers-studio/editorial/undo'"));
      const settleUndo=undo.indexOf('settleWriting()');
      if(settleUndo!==-1)expect(undoCheck).toBeLessThan(settleUndo);
    }
  });
});
