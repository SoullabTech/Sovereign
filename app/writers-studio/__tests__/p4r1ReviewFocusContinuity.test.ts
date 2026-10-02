import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('C4 Review finding → Focus continuity', () => {
  const reviewHost = read('app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx');
  const reviewRoom = read('app/writers-studio/full-redesign/LiveReviewRoom.tsx');
  const writeController = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  const writeView = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');

  it('offers Work with this only when durable Review evidence contains an exact passage', () => {
    expect(reviewHost).toContain("ref.kind === 'passage' && ref.sectionId === finding.sectionId");
    expect(reviewHost).toContain('canWorkWith ? { ...finding, canWorkWith: true } : finding');
    expect(reviewRoom).toContain('{finding.canWorkWith ? (');
    expect(reviewRoom).toContain('Work with this');
  });

  it('keeps Open in manuscript distinct from editorial Focus', () => {
    expect(reviewHost).toContain("next.delete('insightReading')");
    expect(reviewHost).toContain("next.delete('insightObservation')");
    expect(reviewHost).toContain("next.delete('insightAction')");
    expect(reviewRoom).toContain('Open in manuscript');
  });

  it('carries Review identity plus durable reading/observation identity into Focus', () => {
    expect(reviewHost).toContain("next.set('reviewRun', review.runId)");
    expect(reviewHost).toContain("next.set('reviewFinding', finding.id)");
    expect(reviewHost).toContain("next.set('insightReading', truth.address.readingId)");
    expect(reviewHost).toContain("next.set('insightObservation', truth.address.observationKey)");
    expect(reviewHost).toContain("next.set('insightAction', 'focus')");
  });

  it('lets Write identify Review as the truthful return source', () => {
    expect(writeController).toContain("const reviewReturnRun = params?.get('reviewRun') ?? null;");
    expect(writeController).toContain("const reviewReturnFinding = params?.get('reviewFinding') ?? null;");
    expect(writeController).toContain("reviewReturnRun && reviewReturnFinding ? 'review'");
    expect(writeView).toContain("props.carriedInsightReturnMode === 'review'");
    expect(writeView).toContain("? 'From Review'");
    expect(writeView).toContain("`Return to ${props.carriedInsightReturnMode === 'review' ? 'Review' : 'Develop'}`");
  });

  it('preserves existing Review Discuss rather than replacing it', () => {
    expect(reviewHost).toContain('commissionReviewDiscuss');
    expect(reviewRoom).toContain('Discuss with MAIA');
    expect(reviewHost).toContain('onDiscuss={discussFinding}');
  });
});
