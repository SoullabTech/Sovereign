import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import ProStudioIntroduction from '../page';

jest.mock('@/lib/auth/serverSessions', () => ({ getCurrentSession: jest.fn() }));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    require('react').createElement('a', { href, ...props }, children),
}));

const html = async () => renderToStaticMarkup(await ProStudioIntroduction());
const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('Pro Studio introduction (Stage 1) — fictional sessions only', () => {
  beforeEach(() => jest.clearAllMocks());

  test('signed-out visitor sees the introduction and a sign-in door, nothing personal', async () => {
    (getCurrentSession as jest.Mock).mockResolvedValue(null);
    const out = await html();
    expect(out).toContain('A workspace for the work you do with others.');
    expect(out).toContain('href="/signin?next=%2Fpro-studio"');
    expect(out).toContain('Sign in to talk with MAIA');
    expect(out).not.toContain('href="/maia/encounter"');
    expect(out).not.toContain('Already have a Pro Studio?');
  });

  test('signed-in member is offered the MAIA conversation and a way to an existing studio', async () => {
    (getCurrentSession as jest.Mock).mockResolvedValue({ memberId: 'fiction-only-member' });
    const out = await html();
    expect(out).toContain('href="/maia/encounter"');
    expect(out).toContain('Talk with MAIA about your practice');
    expect(out).toContain('href="/studio"');
    expect(out).not.toContain('Sign in to talk with MAIA');
  });

  test('a practitioner-looking or paid-looking session changes nothing: no workspace is opened', async () => {
    (getCurrentSession as jest.Mock).mockResolvedValue({
      memberId: 'fiction-only-member', tier: 'pro', isPractitioner: true, studioMode: 'practice',
    });
    const out = await html();
    expect(out).toContain('What the full studio holds');
    expect(out).toContain('They are not open from this page.');
    expect(out).toContain('has not been set yet');
  });

  test('makes no promise about tiers, prices, Reflect or unbuilt previews', async () => {
    (getCurrentSession as jest.Mock).mockResolvedValue({ memberId: 'fiction-only-member' });
    const out = await html();
    expect(out).not.toMatch(/\$\s?\d/);
    expect(out).not.toMatch(/free trial|upgrade|subscribe|waitlist|sample studio|premium/i);
    expect(out).not.toMatch(/Reflect|pro-studio\/reflect/);
    expect(out).not.toContain('<form');
    expect(out).not.toContain('<input');
  });

  test('the module list is derived from the product definitions, never hand-copied', async () => {
    (getCurrentSession as jest.Mock).mockResolvedValue(null);
    const { MODULE_DEFINITIONS } = await import('@/lib/studio/moduleDefinitions');
    const { LEARN_AND_TRY_SLUGS } = await import('@/lib/proStudio/learnAndTry');
    const out = await html();
    // every allowlisted slug must still exist as a shipped practice module (rename/removal fails loudly)
    for (const slug of LEARN_AND_TRY_SLUGS) {
      const m = MODULE_DEFINITIONS.find((x) => x.slug === slug);
      expect(m).toBeDefined();
      expect(m!.comingSoon).not.toBe(true);
      expect(out).toContain(m!.label.replace(/&/g, '&amp;'));
      expect(out).toContain(m!.description.replace(/&/g, '&amp;'));
    }
    // and nothing outside the allowlist, notably developer tooling and unbuilt modules
    for (const m of MODULE_DEFINITIONS.filter((x) => !LEARN_AND_TRY_SLUGS.includes(x.slug))) {
      expect(out).not.toContain(`<span class="font-medium">${m.label.replace(/&/g, '&amp;')}</span>`);
    }
  });

  test('static boundary: no write, no provisioning, no tier/practitioner read, no Reflect link', () => {
    const src = stripComments(read('app/pro-studio/page.tsx') + read('components/pro-studio/LearnAndTryView.tsx') + read('lib/proStudio/learnAndTry.ts'));
    expect(src).not.toMatch(/personal\/enter|practitioners\/create|personalStudioProvisioning/);
    expect(src).not.toMatch(/from ['"]@\/lib\/db|\bquery\(|\bfetch\(|apiFetch/);
    expect(src).not.toMatch(/\.tier\b|isPractitioner|studioMode|getCurrentPractitioner/);
    expect(src).not.toMatch(/pro-studio\/reflect|reflectBetaAccess/);
  });

});
