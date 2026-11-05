/**
 * Founder walk 2026-11-05: the wheel drew only the selected planet's aspects
 * ("it only shows 2 aspects"), and the centre label covered lines crossing the
 * middle. A professional chart shows the whole aspect web.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CelestialChartWheel } from '../app/astrology/pro-preview/CelestialChartWheel';
import { calculateBirthChart } from '../lib/astrology/proEphemerisCalculator';
import { chartBodies } from '../lib/astrology/proChartGeometry';

jest.mock('../app/astrology/pro-preview/astrology-pro-preview.module.css', () => ({}), { virtual: true });

async function render(showAspects: boolean) {
  const chart = await calculateBirthChart({
    date: '1990-06-15', time: '14:30',
    location: { lat: 40.7128, lng: -74.006, timezone: 'America/New_York' }, houseSystem: 'porphyry',
  });
  const html = renderToStaticMarkup(React.createElement(CelestialChartWheel, {
    chart, focusedBody: 'Sun', onFocusBody: () => {}, showAspects, showHouseLines: true, maxAspectOrb: null,
  }));
  return { chart, html };
}

describe('Pro wheel aspect web', () => {
  it('draws every drawable aspect, not just the focused planet\'s', async () => {
    const { chart, html } = await render(true);
    const names = new Set(chartBodies(chart).map((b) => b.name));
    const drawable = (chart.aspects || []).filter((a) =>
      Number.isFinite(a.orb) && a.orb >= 0 && names.has(a.planet1 as never) && names.has(a.planet2 as never));
    const sunOnes = drawable.filter((a) => a.planet1 === 'Sun' || a.planet2 === 'Sun');
    expect(drawable.length).toBeGreaterThan(sunOnes.length);
    expect((html.match(/data-aspect=/g) || []).length).toBe(drawable.length);
    expect((html.match(/data-focused=/g) || []).length).toBe(sunOnes.length);
  });

  it('hides the centre label while aspects are shown, and shows it otherwise', async () => {
    expect((await render(true)).html).not.toContain('data-centre-label');
    const off = (await render(false)).html;
    expect(off).toContain('data-centre-label');
    expect(off).not.toContain('data-aspect=');
  });
});
