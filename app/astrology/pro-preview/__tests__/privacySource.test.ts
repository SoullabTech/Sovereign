import { readFileSync } from 'fs';
import { join } from 'path';

const DIR = join(process.cwd(), 'app/astrology/pro-preview');
const page = readFileSync(join(DIR, 'page.tsx'), 'utf8');
const client = readFileSync(join(DIR, 'ProAstrologyExperience.tsx'), 'utf8');
const geometry = readFileSync(join(DIR, 'CelestialChartWheel.tsx'), 'utf8');
const localCss = readFileSync(join(DIR, 'astrology-pro-preview.module.css'), 'utf8');
const globalIconCss = readFileSync(join(process.cwd(), 'app/icon-fix.css'), 'utf8');

describe('Astrology Pro private preview safety contract — source-level only', () => {
  it('fails closed without explicit opt-in and prevents search indexing', () => {
    expect(page).toContain("process.env.ASTRO_PRO_PREVIEW_ENABLED !== 'true'");
    expect(page).toContain('notFound()');
    expect(page).toContain('index: false');
  });

  it('does not use legacy browser caches or the birth-data hook that migrates automatically', () => {
    expect(client).not.toMatch(/localStorage|sessionStorage|useBirthChart/);
    expect(client).not.toContain('saveBirthData');
    expect(client).not.toContain("apiFetch('/api/members/profile')");
    expect(client).toContain("apiFetch('/api/astrology/pro/my-chart'");
    expect(client).not.toContain("fetch(apiUrl('/api/astrology/birth-chart')");
    expect(client).not.toContain('body: JSON.stringify(input)');
  });

  it('requires a member action to fetch personal chart data', () => {
    expect(client).toMatch(/async function loadMyChart\(\)/);
    expect(client).toContain('onClick={loadMyChart}');
    expect(client).not.toContain('useEffect(() => { loadMyChart');
  });

  it('does not silently inject a chart into MAIA or persist a member note', () => {
    // R4F's founder safety decision supersedes an earlier share-button
    // preview: transfer is deliberately HARD-OFF pending Class A review.
    expect(client).toContain('Transfer to MAIA is paused');
    expect(client).not.toContain('function explicitlyShareWithMaia()');
    expect(client).not.toContain('onClick={explicitlyShareWithMaia}');
    expect(client).not.toContain('injectedMessage={shared}');
    expect(client).not.toContain('<OracleConversation');
    expect(client).not.toContain('setItem(');
    expect(client).not.toContain('saveReflection');
  });

  it('keeps the chart derived from true zodiacal longitudes and the calculator house cusps', () => {
    expect(geometry).toContain('radialPoint(body.longitude, ascendant,');
    expect(geometry).toContain('chart.houses.map(');
    expect(geometry).not.toContain('house * 30');
  });

  it('does not supply an entitlement bypass disguised as a subscription', () => {
    expect(client).not.toMatch(/stripe|createCheckout|startSubscription|setPaidTier/);
    expect(client).toContain('No Astrology Pro subscription');
  });

  it('restores pointer events only within the interactive chart without relaxing global icon safety', () => {
    expect(globalIconCss).toMatch(/svg\s*\{\s*pointer-events:\s*none;/);
    expect(localCss).toMatch(/\.wheelSvg\s*\{[^}]*pointer-events:\s*auto;/s);
    expect(localCss).toMatch(/\.wheelBody\s*\{[^}]*pointer-events:\s*all;/s);
    expect(geometry).toMatch(/role="button"/);
    expect(geometry).toContain('pointerEvents="none"');
  });
});
