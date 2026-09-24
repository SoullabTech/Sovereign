import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), 'utf8');
const page = read('app', 'writers-studio', 'rebuild', 'page.tsx');
const host = read('app', 'writers-studio', 'rebuild', 'FlagshipWriteHost.tsx');
const client = read('app', 'writers-studio', 'rebuild', 'RebuildStudioClient.tsx');
const chapterReview = read('lib', 'writersStudio', 'rebuild', 'chapterReview.ts');

/* 2026-09-24 founder direction: /writers-studio/rebuild mounts the founder-accepted
 * flagship Studio (V10 PASS at f9fbb828b), not the legacy RebuildStudioClient. */
describe('Writer’s Studio production workspace mount', () => {
  it('mounts the founder-accepted flagship Studio at /writers-studio/rebuild', () => {
    expect(page).toContain("import FlagshipWriteHost from './FlagshipWriteHost'");
    expect(page).toContain('<FlagshipWriteHost');
    expect(page).toContain("import '../flagship/flagship.css'");
    expect(page).toContain("import './flagshipWriteHost.css'");
  });

  it('does not mount the legacy workspace as the member-facing surface', () => {
    expect(page).not.toContain('<RebuildStudioClient');
  });

  it('threads both server flags into the flagship host', () => {
    expect(page).toContain("editorialEnabled={process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1'}");
    expect(page).toContain("reviewDiscussEnabled={process.env.WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED === '1'}");
    expect(host).toContain('reviewDiscussEnabled = false');
  });

  it('carries the durable observation key structurally rather than parsing a display id', () => {
    expect(chapterReview).toContain('observationKey: string');
    expect(chapterReview).toContain('observationKey: o.key');
    expect(client).toContain('key: finding.observationKey');
    expect(client).not.toContain("finding.id.slice(finding.readingId.length + 1)");
  });
});
