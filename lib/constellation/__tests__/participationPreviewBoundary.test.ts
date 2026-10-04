/** @jest-environment node */
import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { requireFounder } from '../../founder/founderAuth';
import PreviewPage from '../../../app/founder/constellation/participation/page';
import Preview from '../../../app/founder/constellation/participation/ParticipationPreview';
import { isWebOnlyRoute } from '../../mobile/mobileAllowlist';

jest.mock('../../founder/founderAuth', () => ({ requireFounder: jest.fn() }));
jest.mock('../../../app/founder/constellation/participation/participation.module.css', () => ({
  __esModule: true, default: {},
}));
const auth = requireFounder as jest.Mock;
const oldStatic = process.env.CAPACITOR_BUILD;
const code = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');
beforeEach(() => { jest.clearAllMocks(); delete process.env.CAPACITOR_BUILD; });
afterAll(() => {
  if (oldStatic === undefined) delete process.env.CAPACITOR_BUILD;
  else process.env.CAPACITOR_BUILD = oldStatic;
});

describe('C7B1 preview boundary, not live study enrollment', () => {
  it.each([401, 403])('does not mount the client for an unauthorized founder result %s', async status => {
    auth.mockResolvedValue({ ok: false, status, error: 'not allowed' });
    const result = await PreviewPage();
    expect(result.props['aria-label']).toBe('Founder access required');
    expect(result.type).not.toBe(Preview);
  });
  it('mounts only after server founder authorization', async () => {
    auth.mockResolvedValue({ ok: true, memberId: 'fixture-founder' });
    const result = await PreviewPage();
    expect(auth).toHaveBeenCalledTimes(1);
    expect(result.type).toBe(Preview);
    expect(result.props).toEqual({});
  });
  it('stays web-only without a separate native export exception', () => {
    expect(isWebOnlyRoute('/founder/constellation/participation')).toBe(true);
    expect(code('scripts/capacitor-patch-routes.sh')).toContain('"app/founder/constellation"');
  });
  it('does not mount in a static native build', async () => {
    auth.mockResolvedValue({ ok: true, memberId: 'fixture-founder' });
    process.env.CAPACITOR_BUILD = '1';
    expect((await PreviewPage()).type).not.toBe(Preview);
  });
  it('clearly labels the initial render without a feedback form or prechecked consent', () => {
    const html = renderToStaticMarkup(createElement(Preview));
    expect(html).toContain('Founder preview · no real participation');
    expect(html).toContain('Nothing is sent');
    expect(html).toContain('Skip this preview');
    expect(html).not.toContain('checked=""');
    expect(html).not.toContain('<form');
    expect(html).not.toContain('data-preview-payload');
  });
  it('the interaction files contain no data transport or browser persistence capability', () => {
    const files = [
      'lib/constellation/participationPreview.ts',
      'app/founder/constellation/participation/ParticipationPreview.tsx',
    ];
    for (const file of files) {
      const source = code(file).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      expect(source).not.toMatch(/\b(fetch|apiFetch|sendBeacon|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB)\b/);
      expect(source).not.toMatch(/document\s*\.\s*cookie|\buseEffect\b|\bsetInterval\b/);
      expect(source).not.toMatch(/from\s+['"][^'"]*(?:server|store|db\/|analytics|http\/)/);
    }
  });
  it('does not mount the preview into either public doorway or the Studio host', () => {
    for (const file of [
      'app/writers-studio/discover/WriterDoorway.tsx',
      'app/astrology/discover/AstrologyDoorway.tsx',
      'app/dev/writers-studio-p4r1/P4R1StudioHost.tsx',
    ]) expect(code(file)).not.toContain('ParticipationPreview');
  });
});
