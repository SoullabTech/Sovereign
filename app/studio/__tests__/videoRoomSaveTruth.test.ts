/**
 * Source-contract check only. This does not substitute for a browser UX test.
 * The video room save UI must never claim success on an HTTP denial.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const source = readFileSync(path.join(process.cwd(), 'app/studio/settings/page.tsx'), 'utf8');

describe('Studio save feedback truth', () => {
  it('checks HTTP response.ok before the Saved state', () => {
    const handler = source.split('const handleSaveVideoRoomUrl = async () => {')[1]?.split('const handleGoogleConnect')[0];
    expect(handler).toBeTruthy();
    expect(handler).toMatch(/if \(!response\.ok\)/);
    expect(handler!.indexOf('if (!response.ok)')).toBeLessThan(handler!.indexOf('setVideoRoomUrlSaved(true)'));
  });

  it('offers accessible error feedback instead of silent denial', () => {
    expect(source).toContain('setVideoRoomUrlError(');
    expect(source).toContain('role="alert"');
  });
});
