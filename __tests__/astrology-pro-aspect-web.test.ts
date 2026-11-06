/**
 * Founder walk 2026-11-05: the wheel drew only the selected planet's aspects
 * ("it only shows 2 aspects"), and the centre label covered lines crossing the
 * middle. A professional chart shows the whole aspect web.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CelestialChartWheel } from '../app/astrology/pro-preview/CelestialChartWheel';
import { calculateBirthChart } from '../lib/astrology/proEphemerisCalculator';
import { aspectEndpointLongitudes } from '../lib/astrology/proChartGeometry';
import ProAspectGrid from '../app/astrology/pro-preview/ProAspectGrid';

jest.mock('../app/astrology/pro-preview/astrology-pro-preview.module.css', () => ({}), { virtual: true });
jest.mock('../app/astrology/pro-preview/pro-aspect-grid.module.css', () => ({}), { virtual: true });

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
    const names = aspectEndpointLongitudes(chart);
    const drawable = (chart.aspects || []).filter((a) =>
      Number.isFinite(a.orb) && a.orb >= 0 && names.has(a.planet1) && names.has(a.planet2));
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

  // Founder walk 2026-11-05, against TimePassages: the web lacked the
  // aspects to the Ascendant and Midheaven, and every minor aspect.
  it('includes aspects to the angles, but never between the two angles', async () => {
    const { chart, html } = await render(true);
    const toAngles = chart.aspects.filter((a) =>
      ['Ascendant', 'Midheaven'].includes(a.planet1) || ['Ascendant', 'Midheaven'].includes(a.planet2));
    expect(toAngles.some((a) => a.planet1 === 'Ascendant' || a.planet2 === 'Ascendant')).toBe(true);
    expect(toAngles.some((a) => a.planet1 === 'Midheaven' || a.planet2 === 'Midheaven')).toBe(true);
    expect(toAngles.every((a) => !(['Ascendant', 'Midheaven'].includes(a.planet1) &&
      ['Ascendant', 'Midheaven'].includes(a.planet2)))).toBe(true);
    expect(html).toMatch(/data-aspect="[^"]*(Ascendant|Midheaven)/);
  });

  it('reports minor aspects within tight orbs, drawn dashed', async () => {
    const { chart, html } = await render(true);
    const minors = ['semisextile', 'semisquare', 'sesquiquadrate', 'quintile', 'biquintile'];
    const found = chart.aspects.filter((a) => minors.includes(a.type));
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((a) => a.orb <= 2)).toBe(true);
    expect(html).toContain('stroke-dasharray="4 3"');
  });

  it('lists the Ascendant and Midheaven as rows in the aspect grid', async () => {
    const { chart } = await render(true);
    const grid = renderToStaticMarkup(React.createElement(ProAspectGrid, {
      chart, declinations: null, onSelectBody: () => {},
    }));
    expect(grid).toContain('title="Ascendant"');
    expect(grid).toContain('title="Midheaven"');
    expect(grid).toMatch(/Ascendant (conjunction|opposition|trine|square|sextile|quincunx|semisextile|semisquare|sesquiquadrate|quintile|biquintile) /);
  });

  // Founder walk 2026-11-05: the side panel read 'Sun sextile NorthNode', and
  // node aspects never reached the wheel or grid, which name it 'North Node'.
  it('names the nodes as the chart does, without the always-exact node pair', async () => {
    const { chart, html } = await render(true);
    const names = chart.aspects.flatMap((a) => [a.planet1, a.planet2]);
    expect(names.some((n) => n === 'NorthNode' || n === 'SouthNode')).toBe(false);
    expect(chart.aspects.some((a) => a.planet1.endsWith(' Node') && a.planet2.endsWith(' Node'))).toBe(false);
    const nodeAspect = chart.aspects.find((a) => a.planet1 === 'North Node' || a.planet2 === 'North Node');
    if (nodeAspect) expect(html).toContain(`data-aspect="${nodeAspect.planet1}-${nodeAspect.type}-${nodeAspect.planet2}"`);
  });
});

