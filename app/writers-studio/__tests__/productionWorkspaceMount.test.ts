import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), 'utf8');
const page = read('app', 'writers-studio', 'rebuild', 'page.tsx');
const client = read('app', 'writers-studio', 'rebuild', 'RebuildStudioClient.tsx');
const chapterReview = read('lib', 'writersStudio', 'rebuild', 'chapterReview.ts');

describe('Writer’s Studio production workspace mount', () => {
  it('mounts the full manuscript-first workspace at /writers-studio/rebuild', () => {
    expect(page).toContain("import RebuildStudioClient from './RebuildStudioClient'");
    expect(page).toContain('<RebuildStudioClient');
    expect(page).toContain("import './rebuild.css'");
  });

  it('does not replace the member-facing workspace with the bounded flagship proof host', () => {
    expect(page).not.toContain('<FlagshipWriteHost');
    expect(page).not.toContain("import './flagshipWriteHost.css'");
  });

  it('threads the independent Review Discuss flag into the full workspace', () => {
    expect(page).toContain('WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED');
    expect(page).toContain('reviewDiscussEnabled={');
    expect(client).toContain('commissionReviewDiscuss({');
    expect(client).toContain('data-review-discuss-finding={finding.id}');
    expect(client).toContain('observationKey: finding.observationKey');
  });

  it('carries the durable observation key structurally rather than parsing a display id', () => {
    expect(chapterReview).toContain('observationKey: string');
    expect(chapterReview).toContain('observationKey: o.key');
    expect(client).toContain('key: finding.observationKey');
    expect(client).not.toContain("finding.id.slice(finding.readingId.length + 1)");
  });
});
