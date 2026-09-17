import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { matchRule } from '@/config/accessMatrix';
import { POST as retiredDelete } from '@/app/api/sovereignty/delete-my-memory/route';
import { GET as retiredSummary } from '@/app/api/sovereignty/my-data-summary/[userId]/route';

const ROOT = process.cwd();

function source(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function gitBlob(rel: string): string {
  const body = readFileSync(join(ROOT, rel));
  return createHash('sha1')
    .update(Buffer.from(`blob ${body.length}\0`))
    .update(body)
    .digest('hex');
}

describe('F5 P5-C legacy sovereignty retirement', () => {
  it('the legacy deletion address is a stable no-change 410', async () => {
    const response = await retiredDelete();
    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      error: 'legacy_erasure_surface_retired',
      accountChanged: false,
      canonicalPath: '/account/settings',
    });
  });

  it('the mock data-summary address is also retired and advertises no deletion', async () => {
    const response = await retiredSummary();
    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      error: 'legacy_sovereignty_summary_retired',
      dataSummaryAvailable: false,
      deletionAvailable: false,
    });
  });

  it('removes the standalone Express deletion engine instead of retaining a second authority', () => {
    expect(existsSync(join(ROOT, 'services/user-sovereignty/delete-memory-api.js'))).toBe(false);
  });

  it('leaves no service bridge, old confirmation phrase, or mock success in retired handlers', () => {
    for (const rel of [
      'app/api/sovereignty/delete-my-memory/route.ts',
      'app/api/sovereignty/my-data-summary/[userId]/route.ts',
    ]) {
      const src = source(rel);
      expect(src).not.toMatch(/UserDataSovereignty|delete-memory-api\.js/);
      expect(src).not.toContain('DELETE ALL MY CONSCIOUSNESS DATA');
      expect(src).not.toMatch(/success\s*:\s*true/);
    }
  });

  it('makes the Lab Tools surface historical/status-only', () => {
    const page = source('app/labtools/sovereignty/page.tsx');
    expect(page).toContain('Legacy data-sovereignty control retired');
    expect(page).toContain('/account/settings');
    expect(page).not.toMatch(/fetch\s*\(/);
    expect(page).not.toContain('DELETE ALL MY CONSCIOUSNESS DATA');
    expect(page).not.toContain('demo_user_001');
  });

  it('removes accidental lexical adjacency without changing /api/sovereign policy', () => {
    expect(matchRule('/api/sovereignty/delete-my-memory')?.prefix).toBe('/api/sovereignty/');
    expect(matchRule('/api/sovereignty/notifications')?.prefix).toBe('/api/sovereignty/');
    expect(matchRule('/api/sovereignty/tts-monitor')?.prefix).toBe('/api/sovereignty/');
    expect(matchRule('/api/sovereign/manuscripts/example')?.prefix).toBe('/api/sovereign');
  });

  it('preserves unrelated sovereignty diagnostic siblings', () => {
    expect(existsSync(join(ROOT, 'app/api/sovereignty/notifications/route.ts'))).toBe(true);
    expect(existsSync(join(ROOT, 'app/api/sovereignty/tts-monitor/route.ts'))).toBe(true);
  });

  it('keeps canonical account deletion and Account Settings byte-identical to P5-B', () => {
    expect(gitBlob('app/api/members/delete-account/route.ts')).toBe('256c8e2bfcd390308ba53458ca30581f109fb7af');
    expect(gitBlob('components/account/AccountSettings.tsx')).toBe('c3d82a4463d24dd7e588dcaabf383af9beabea58');
  });

  it('kills the legacy-fallback mutant at the canonical route', () => {
    const canonical = source('app/api/members/delete-account/route.ts');
    expect(canonical).not.toMatch(/\/api\/sovereignty|UserDataSovereignty|delete-memory-api/);
  });
});
