import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');

describe('Writer’s Studio Review Proof view', () => {
  const controller = read('app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx');
  const review = read('app/writers-studio/full-redesign/LiveReviewRoom.tsx');
  const proof = read('app/dev/writers-studio-pc3-live/P4R1ProofView.tsx');
  const route = read('app/api/sovereign/manuscripts/[id]/render/route.ts');
  const source = read('lib/manuscript/render/loadMemberRenderSource.ts');

  it('adds Proof to Review without pretending it is a developmental lens', () => {
    expect(review).toContain("...(proof ? ['Proof'] : [])");
    expect(review).toContain("tab === 'Proof' && proof");
    expect(review).toContain('Page-form witness of this same Work');
    expect(controller).toContain('<P4R1ProofView');
  });

  it('keeps current-manuscript Proof available even when no saved MAIA Review is current', () => {
    expect(controller).toContain('aria-label="Review view"');
    expect(controller).toContain("aria-selected={tab === 'Proof'}");
    expect(controller).toContain("onClick={() => setTab('Proof')}");
    expect(controller).toContain("tab === 'Proof' ? (");
    expect(controller).toContain('Review opens saved readings. Entering this room does not ask MAIA to read anything again.');
  });

  it('requires an explicit member act before rendering pages', () => {
    expect(proof).toContain("method: 'GET'");
    expect(proof).toContain("body: JSON.stringify({ format: 'pdf' })");
    expect(proof).toContain("{busy ? 'Making the proof…' : 'Make proof'}");
    expect(proof).not.toContain('void makeProof();');
  });

  it('renders the current authoritative manuscript and refuses silent source fallback', () => {
    expect(source).toContain("sourceAuthority = 'working_draft'");
    expect(source).toContain('The current writing could not be prepared for export. Nothing older was substituted.');
    expect(route).toContain("'X-Soullab-Source-Authority': sourceAuthority");
    expect(route).toContain("'X-Soullab-Source-Revision': sourceRevision ?? ''");
    expect(route).toContain("'X-Soullab-Source-Hash': result.sourceHash");
  });

  it('keeps the rendered artifact transient and provenance-visible', () => {
    expect(route).toContain('fs.unlink(result.filePath)');
    expect(route).toContain("'Cache-Control': 'no-store'");
    expect(route).toContain("'X-Soullab-Page-Count': String(result.pageCount ?? '')");
    expect(route).toContain("'X-Soullab-Production-Profile': result.productionProfile");
    expect(proof).toContain('The server does not keep the rendered PDF.');
    expect(proof).toContain('data-proof-provenance');
  });

  it('keeps page evidence honest while returning observed issues to manuscript identity', () => {
    expect(proof).toContain('Text remains the semantic source');
    expect(proof).toContain('MAIA is not silently visually interpreting these pages');
    expect(proof).toContain('Treat the page issue as my observation, not as something you visually witnessed.');
    expect(proof).toContain('x-soullab-section-first-pages');
    expect(proof).toContain('Likely manuscript return address');
    expect(route).toContain("'X-Soullab-Section-First-Pages'");
  });
});
