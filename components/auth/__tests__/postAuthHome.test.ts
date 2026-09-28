import fs from 'node:fs';
import path from 'node:path';

const read = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf8');

describe('post-auth routing authority', () => {
  const unified = read('components/auth/UnifiedAuth.tsx');
  const oauth = read('app/oauth-success/page.tsx');
  const enter = read('app/enter/page.tsx');
  const hook = read('lib/hooks/useUserAuth.ts');
  const welcome = read('app/welcome-back/page.tsx');
  const refresh = read('app/api/auth/refresh-and-redirect/route.ts');

  it('defaults ordinary successful sign-in to /home', () => {
    expect(unified).toContain("const afterAuth = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/home';");
    expect(unified).toContain('window.location.assign(afterAuth)');
  });

  it('OAuth success defaults completed members to /home, not /maia', () => {
    expect(oauth).toContain("onboardingStep === 'complete' ? '/home'");
    expect(oauth).toContain("'complete': '/home'");
    expect(oauth).toContain("router.push(stepMap[onboardingStep] || '/home')");
    expect(oauth).toContain("setTimeout(() => router.push('/home'), 1500)");
  });

  it('legacy/compatibility auth entry surfaces also resolve authenticated members to Home', () => {
    expect(enter).toContain("router.replace('/home')");
    expect(hook).toContain("router.replace('/home')");
    expect(welcome).toContain("router.push('/home')");
  });

  it('refresh-and-redirect uses Home as the implicit destination while preserving an explicit next', () => {
    expect(refresh).toContain("request.nextUrl.searchParams.get('next') || '/home'");
  });

  it('does not leave implicit post-auth /maia redirects in the governed auth surfaces', () => {
    for (const source of [unified, oauth, enter, hook, welcome, refresh]) {
      expect(source).not.toMatch(/router\.(?:push|replace)\('\/maia'\)/);
      expect(source).not.toMatch(/window\.location\.(?:assign|replace)\([^\n]*\/maia/);
    }
  });
});
