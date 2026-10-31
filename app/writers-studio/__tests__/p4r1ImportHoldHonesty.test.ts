import fs from 'node:fs';
import path from 'node:path';

/**
 * W3 beta truth: the integrated Import room is real and locally reviewable,
 * while protected member original-file intake remains the same explicit 423.
 * The ordinary member surface offers paste import and names the held file state;
 * only the loopback founder review exposes the active PDF/EPUB chooser.
 */
const read = (name: string) => fs.readFileSync(path.join(process.cwd(), name), 'utf8');
const home = read('app/dev/writers-studio-pc3-live/P4R1HomeView.tsx');
const controller = read('app/dev/writers-studio-pc3-live/P4R1HomeController.tsx');
const room = read('app/dev/writers-studio-pc3-live/P4R1ImportManuscript.tsx');
const localRoute = read('app/api/writers-studio/local-review/import/route.ts');
const authority = read('lib/writersStudio/localReviewAuthority.ts');
const ingest = read('app/api/sovereign/manuscripts/ingest/route.ts');
const release = read('lib/writersStudio/releaseAuthority.ts');

describe('W3 — integrated import truth', () => {
  it('keeps Import inside the six-room Studio rather than leaving for legacy Press', () => {
    const matches = home.match(/>Import writing<\/button>/g) ?? [];
    expect(matches).toHaveLength(2);
    expect(home).toContain('onClick={props.onImport}');
    expect(controller).toContain("params?.get('import') === '1'");
    expect(controller).toContain('<P4R1ImportManuscript');
    expect(controller).toContain('onImport={openImport}');
    expect(controller).not.toContain('IMPORT_HREF');
    expect(controller).not.toContain('window.location.assign');
  });

  it('offers a chooser only for local review or a server-released production image', () => {
    expect(room).toContain('const fileIntakeAvailable = localReview || sourceIntakeReleased');
    expect(room).toContain('{fileIntakeAvailable ? (');
    expect(room).toContain('type="file"');
    expect(room).toContain('.docx,.pdf,.epub,.txt,.md,.markdown');
    expect(room).toContain('Original-file import is held on this Writer image.');
    expect(room).toContain('PDF, EPUB and Word files are not accepted from member accounts yet.');
    expect(controller).toContain('sourceIntakeReleased={releaseCapabilities.authority.sourceIntakeReleased}');
    expect(room).toContain("'/api/writers-studio/local-review/import'");
    expect(room).toContain("'/api/sovereign/manuscripts/ingest'");
  });

  it('makes the writer review source and confirm structure before save', () => {
    expect(room).toContain('Review structure');
    expect(room).toContain("body?.lossless === false");
    expect(room).toContain('Merge ↑');
    expect(room).toContain('Confirm and open in Write');
    expect(room).toContain("{ confirmedText: text }");
    expect(room).toContain("await apiFetch('/api/sovereign/manuscripts'");
  });

  it('the local parser cannot become a remote or persistent Source intake', () => {
    expect(localRoute).toContain('verifyLocalReviewAuthority(request)');
    expect(authority).toContain("process.env.WS_FOUNDER_LOCAL_REVIEW !== '1'");
    expect(authority).toContain('WS_FOUNDER_LOCAL_REVIEW_TOKEN');
    expect(authority).toContain("request.headers.get('host')");
    expect(authority).toContain("request.headers.get('x-forwarded-host')");
    expect(authority).toContain('timingSafeEqual');
    expect(authority).toContain("host === 'localhost'");
    expect(authority).toContain("host === '127.0.0.1'");
    expect(localRoute).toContain("custody: 'none_local_review'");
    expect(localRoute).toContain('persistent: false');
    expect(localRoute).not.toContain('recordArtifactArrival');
    expect(localRoute).not.toContain('getMemberIdFromRequest');
  });

  it('does not loosen the production Source authority', () => {
    expect(release).toContain('sourceIntakeReleased: false');
    expect(ingest).toContain('writerReleaseAuthority().sourceIntakeReleased');
    expect(ingest).toContain('status: 423');
    expect(ingest).toContain('recordArtifactArrival');
    expect(ingest).toContain('getMemberIdFromRequest');
    expect(ingest).toContain('deriveVerifiedAccess');
  });
});
