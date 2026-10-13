import fs from 'node:fs';
import path from 'node:path';

function read(p:string){return fs.readFileSync(path.resolve(process.cwd(),p),'utf8');}
const HOME=read('app/home/page.tsx');
const HOUSE=read('app/house/page.tsx');
const GATE=read('app/home/HomeAccountGate.tsx');
const MAIA=read('app/maia/encounter/page.tsx');
const SIGNIN=read('components/auth/UnifiedAuth.tsx');
const CONFLICT=read('components/auth/AccountConflictPanel.tsx');
const PRIVATE=read('app/api/auth/home-view/route.ts');

describe('R5 House/MAIA shared-browser source invariants',()=>{
  it('Home and House routes can never server-render HouseExperience',()=>{
    expect(HOME).not.toContain('return <HouseExperience');
    expect(HOUSE).not.toContain('return <HouseExperience');
    expect(HOME).toContain('<HomeAccountGate destination="home" />');
    expect(HOUSE).toContain('<HomeAccountGate destination="house" />');
    expect(HOME+HOUSE).not.toContain('consumeHomeEntry(');
  });
  it('private works only leave server in cookie-bound JSON, never page/RSC HTML',()=>{
    expect(PRIVATE).toContain('getCurrentSession()');
    expect(PRIVATE).toContain('body.expectedMemberId !== session.memberId');
    expect(PRIVATE).toContain('FROM living_works WHERE member_id = $1');
    expect(PRIVATE).toContain("private, no-store");
    expect(PRIVATE).toContain('NextResponse.json(data');
    expect(GATE).toContain("fetch('/api/auth/home-view'");
    expect(GATE).toContain('isHomeViewPayload(data,id)');
  });
  it('MAIA mounts only after server identity reconciliation',()=>{
    expect(MAIA).toContain('assessBrowserAccount(localStorage,id)');
    expect(MAIA).toContain("window.location.replace('/account/conflict')");
    expect(MAIA).toContain('if(admitted) return <MaiaEncounterPage />;');
  });
  it('Sign-in protects silent resume and explicit credential flows',()=>{
    expect(SIGNIN).toContain('assessBrowserAccount(localStorage, d.memberId)');
    expect(SIGNIN).toContain('const boundary = assessBrowserAccount(localStorage, user.id)');
    expect(SIGNIN).toContain("window.location.replace('/account/conflict')");
    expect(SIGNIN).toContain('activateAccountScope(localStorage,user.id)');
  });
  it('House hides private content on tab-account switch and uses scoped storage',()=>{
    expect(GATE).toContain("window.addEventListener('storage',changed)");
    expect(GATE).toContain('BroadcastChannel(ACCOUNT_CHANNEL)');
    expect(GATE).toContain('checkCurrent()');
    expect(GATE).toContain('activateAccountScope(localStorage,id)');
    expect(GATE).toContain('setView(null)');
  });
  it('Conflict panel preserves legacy data and requires sign-out gesture',()=>{
    expect(CONFLICT).toContain('onClick={signOutCurrentSession}');
    expect(CONFLICT).toContain("fetch('/api/members/signout'");
    expect(CONFLICT).not.toContain("localStorage.removeItem('beta_user')");
    expect(CONFLICT).not.toContain("localStorage.removeItem('explorerId')");
  });
});
