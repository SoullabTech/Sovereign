import fs from 'node:fs';
import path from 'node:path';
import {resolveVoiceMemberIdentity} from '../voiceMemberIdentity';

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';

describe('MAIA voice member identity — only server credential authorizes private memory',()=>{
  it('accepts an explicitly matching verified member ID',()=>{
    expect(resolveVoiceMemberIdentity(A,A)).toEqual({ok:true,memberId:A});
  });
  it('rejects an A-server/B-body mismatch before member memory lookup',()=>{
    expect(resolveVoiceMemberIdentity(A,B)).toMatchObject({ok:false,status:403});
  });
  it('rejects unverified member claim from an anonymous caller',()=>{
    expect(resolveVoiceMemberIdentity(null,A)).toMatchObject({ok:false,status:401});
  });
  it('keeps genuinely anonymous voice guest-scoped',()=>{
    expect(resolveVoiceMemberIdentity(null,undefined)).toEqual({ok:true,memberId:null});
    expect(resolveVoiceMemberIdentity(null,'')).toEqual({ok:true,memberId:null});
  });
  it('uses verified A even when no body ID is supplied',()=>{
    expect(resolveVoiceMemberIdentity(A,undefined)).toEqual({ok:true,memberId:A});
  });
  it.each([7,{},[],false])('rejects non-string identity claim %#',value=>{
    expect(resolveVoiceMemberIdentity(A,value)).toMatchObject({ok:false,status:400});
  });
  it('the actual streaming source does not prefer bodyUserId',()=>{
    const file=path.resolve(process.cwd(),'app/api/voice/stream-conversation/route.ts');
    const route=fs.readFileSync(file,'utf8');
    expect(route).not.toContain('bodyUserId || await getMemberIdFromRequest(req)');
    const authAt=route.indexOf('const voiceIdentity = resolveVoiceMemberIdentity(');
    const prefsAt=route.indexOf('getMemberVoicePreferences(userId');
    const memoryAt=route.indexOf('MemoryBundleService.build({');
    expect(authAt).toBeGreaterThan(0);
    expect(prefsAt).toBeGreaterThan(authAt);
    expect(memoryAt).toBeGreaterThan(prefsAt);
    expect(route).toContain('if (userId && !sanctuary)');
  });
});
