import fs from 'node:fs';
import path from 'node:path';

const source=(p:string)=>fs.readFileSync(path.resolve(process.cwd(),p),'utf8');
const HOME=source('app/home/HomeAccountGate.tsx');
const MAIA=source('app/maia/encounter/page.tsx');
const SIGNIN=source('components/auth/UnifiedAuth.tsx');
const ACCOUNT=source('lib/auth/accountConflictBoundary.ts');

describe('R5a readmission and mounted private-view invalidation',()=>{
  it('Home hides existing view and revalidates actual cookie on resume',()=>{
    expect(HOME).toContain("const onResume=()=>{");
    expect(HOME).toContain("setView(null);setStatus('checking')");
    expect(HOME).toContain('void open(id,false)');
    expect(HOME).toContain("const lastSession=await fetch('/api/members/session'");
    expect(HOME).toContain('latest.member?.id!==id');
    expect(HOME).toContain('document.visibilityState');
    expect(HOME).toContain("window.addEventListener('focus',onFocus)");
  });
  it('MAIA unmounts on tab visibility changes and uses server session on reentry',()=>{
    expect(MAIA).toContain('firstMember.current!==id');
    expect(MAIA).toContain('setAdmitted(false)');
    expect(MAIA).toContain('if(admitted) return <MaiaEncounterPage />');
    expect(MAIA).toContain("window.addEventListener('focus',onResume)");
    expect(MAIA).toContain("document.addEventListener('visibilitychange',onVisibility)");
    expect(MAIA).toContain("new BroadcastChannel(ACCOUNT_CHANNEL)");
  });
  it('every explicit credential callback awaits sign-in reconciliation',()=>{
    const invocations=SIGNIN.match(/await storeSession\(/g)??[];
    expect(invocations).toHaveLength(6);
    expect(SIGNIN).toContain('await assessFreshSignInAdmission(');
    expect(SIGNIN).toContain('activateAccountScope(localStorage,user.id)');
    expect(ACCOUNT).toContain('assessFreshVerifiedSignInBrowserAccount');
  });
  it('silent auto-resume still uses strict sign-out fence',()=>{
    expect(SIGNIN).toContain("localStorage.getItem('maia_signed_out') === '1'");
    expect(SIGNIN).toContain('assessBrowserAccount(localStorage, d.memberId)');
  });
});
