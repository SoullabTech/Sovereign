/**
 * Onboarding carries the member's return place all the way through (2026-11-13).
 *
 * Sign-up sends a brand-new member to `/faq?next=<where they were going>` (register-email), and `/onboarding` honours
 * `next` on completion. The FAQ step in between dropped it, so a person invited straight to a Studio path, e.g. the
 * college essay (`/writers-studio?path=college-essay`), finished sign-up on Soullab Home instead of the path they
 * were invited to. These pin the carry, and that it never carries anything but a safe same-origin place.
 */
import fs from 'fs';
import path from 'path';
import { onboardingAfterFaq } from '../faqContinuation';

describe('the FAQ step carries the member’s return place into onboarding', () => {
  it('carries a same-origin place, query included', () => {
    expect(onboardingAfterFaq('/writers-studio?path=college-essay'))
      .toBe('/onboarding?next=%2Fwriters-studio%3Fpath%3Dcollege-essay');
  });
  it('with no place, onboarding opens as before', () => {
    expect(onboardingAfterFaq(null)).toBe('/onboarding');
    expect(onboardingAfterFaq('')).toBe('/onboarding');
  });
  it('never carries an off-site or protocol-relative place', () => {
    for (const bad of ['https://evil.example/x', '//evil.example', 'javascript:alert(1)']) {
      expect(onboardingAfterFaq(bad)).toBe('/onboarding');
    }
  });
  it('the FAQ page uses it, reading `next` from its own address', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'app/faq/page.tsx'), 'utf8');
    expect(src).toContain("onboardingAfterFaq(searchParams?.get('next'))");
    expect(src).not.toContain("router.push('/onboarding')");
  });
});
