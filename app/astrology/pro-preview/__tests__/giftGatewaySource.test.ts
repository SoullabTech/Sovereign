import { readFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const load = (rel: string) => readFileSync(join(root, rel), 'utf8');
const gateway = load('app/astrology/pro-preview/SoulPortraitGifting.tsx');
const preview = load('app/astrology/pro-preview/ProAstrologyExperience.tsx');
const delivered = load('app/soul-portrait/view/[slug]/page.tsx');
const sendRoute = load('app/api/soul-portrait/[slug]/send/route.ts');
const sendPanel = load('components/soulPortrait/SendPortraitPanel.tsx');

describe('ASTRO-PORTRAIT-GIFTS-01 — reuse without new gift authority', () => {
  it('places the gift invitation after chart exploration without interrupting chart or MAIA', () => {
    expect(preview).toContain("import { SoulPortraitGifting } from './SoulPortraitGifting'");
    expect(preview).toContain('<a href="#soul-portrait-gifts">Soul Portraits</a>');
    const chartIndex = preview.indexOf('id="the-chart"');
    const giftIndex = preview.indexOf('<SoulPortraitGifting />');
    const nextIndex = preview.indexOf('className={styles.openPaths}');
    expect(chartIndex).toBeGreaterThan(0);
    expect(chartIndex).toBeLessThan(giftIndex);
    expect(giftIndex).toBeLessThan(nextIndex);
  });

  it('offers only real authenticated existing routes for adult gifting and returning drafts', () => {
    expect(gateway).toContain('href="/soul-portrait/generate"');
    expect(gateway).toContain('href="/studio/soul-portraits"');
    expect(gateway).toContain('Create a Soul Portrait');
    expect(gateway).toContain('Open my portraits');
    expect(gateway).toContain('PLANNED · NOT YET AVAILABLE');
    expect(gateway).toContain('consenting');
  });

  it('is a presentational gateway, not a new mail, tracking or gift payment endpoint', () => {
    expect(gateway).not.toMatch(/\bfetch\(|axios\.|EmailRouter|Resend|sendEmail|localStorage|sessionStorage|setItem\(|subscribe|checkout|referralCode|trackingPixel/);
    expect(gateway).not.toContain('/api/soul-portrait/');
    expect(gateway).not.toContain('href="/soul-portrait/redeem"');
    expect(gateway).not.toContain('href="/soul-portrait/gift-credit"');
  });

  it('preserves delivered guest page consent, complete portrait and separated quiet colophon', () => {
    expect(delivered).toContain('getDeliveredPortraitBySlug(slug)');
    expect(delivered).toContain('isPortraitConsentLive(portrait.id)');
    expect(delivered).toContain('if (!live) notFound()');
    expect(delivered).toContain('index: false');
    expect(delivered.indexOf('<SoulPortraitRenderer')).toBeLessThan(delivered.indexOf('<SoulPortraitColophon'));
  });

  it('preserves owner-scoped first-send consent and minor refusal', () => {
    expect(sendRoute).toContain('getOwnedPortraitBySlug(slug, memberId)');
    expect(sendRoute).toContain('body.consentAttested !== true');
    expect(sendRoute).toContain('recordPortraitConsent({');
    expect(sendRoute).toContain('portrait.subjectIsMinor');
    expect(sendPanel).toContain('Their consent is recorded');
  });

  it('enforces private-link-only delivery instead of exposing the legacy Resend route', () => {
    expect(sendRoute).not.toContain("import { EmailRouter }");
    expect(sendRoute).not.toContain('router.send(');
    expect(sendRoute).toContain("error: 'email_delivery_held'");
    expect(sendRoute).toContain("delivery: 'private_link_only'");
    expect(gateway).toContain('new email transport remain separately held');
    expect(gateway).toContain('Copy-link sharing');
  });
});
