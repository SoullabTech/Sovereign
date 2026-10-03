import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('C4 Review finding → Focus continuity', () => {
  const reviewHost = read('app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx');
  const flagshipReview = read('app/dev/writers-studio-pc3-live/Pc3LiveReviewHost.tsx');
  const reviewRoom = read('app/writers-studio/full-redesign/LiveReviewRoom.tsx');
  const writeController = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  const writeView = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const chapterReviewRoute = read('app/api/sovereign/manuscripts/[id]/chapter-reviews/route.ts');

  it('offers Work with this only when durable Review evidence contains an exact passage', () => {
    expect(reviewHost).toContain("ref.kind === 'passage' && ref.sectionId === finding.sectionId");
    expect(reviewHost).toContain('canWorkWith ? { ...finding, canWorkWith: true } : finding');
    expect(flagshipReview).toContain("ref.kind === 'passage' && ref.sectionId === finding.sectionId");
    expect(flagshipReview).toContain('canWorkWith ? { ...finding, canWorkWith: true } : finding');
    expect(flagshipReview).toContain('onWorkWith={workWithFinding}');
    expect(reviewRoom).toContain('{finding.canWorkWith ? (');
    expect(reviewRoom).toContain('Show edit options');
  });

  it('keeps Open in manuscript distinct from editorial Focus', () => {
    expect(reviewHost).toContain("next.delete('insightReading')");
    expect(reviewHost).toContain("next.delete('insightObservation')");
    expect(reviewHost).toContain("next.delete('insightAction')");
    expect(flagshipReview).toContain("q.set('reviewRun', review.runId)");
    expect(flagshipReview).toContain("q.set('reviewFinding', finding.id)");
    expect(flagshipReview).toContain("q.delete('insightAction')");
    expect(reviewRoom).toContain('Open in manuscript');
  });

  it('carries Review identity plus durable reading/observation identity into Focus', () => {
    expect(reviewHost).toContain("next.set('reviewRun', review.runId)");
    expect(reviewHost).toContain("next.set('reviewFinding', finding.id)");
    expect(reviewHost).toContain("next.set('insightReading', truth.address.readingId)");
    expect(reviewHost).toContain("next.set('insightObservation', truth.address.observationKey)");
    expect(reviewHost).toContain("next.set('insightAction', 'focus')");
    expect(flagshipReview).toContain("q.set('insightReading', truth.address.readingId)");
    expect(flagshipReview).toContain("q.set('insightObservation', truth.address.observationKey)");
    expect(flagshipReview).toContain("q.set('insightAction', 'focus')");
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

  it('lets the canonical Review room commission a fresh reread of the chapter', () => {
    expect(reviewHost).toContain('How does the chapter hold now?');
    expect(reviewHost).toContain('Quick reread');
    expect(reviewHost).toContain('not a full multi-lens Review');
    expect(reviewHost).toContain("'overview'");
    expect(reviewHost).toContain('data-review-quick-result');
    expect(reviewHost).toContain('Deep Review');
    expect(reviewHost).toContain('Run deep Review');
    expect(reviewHost).toContain('runChapterReview(');
    expect(reviewHost).toContain('saveChapterReviewManifest');
    expect(reviewHost).toContain('REVIEW_DEVELOPMENTAL_LENSES,');
    expect(flagshipReview).toContain('REVIEW_DEVELOPMENTAL_LENSES,');
    expect(chapterReviewRoute).toContain("import { REVIEW_DEVELOPMENTAL_LENSES }");
    expect(chapterReviewRoute).toContain('completed.size !== REVIEW_DEVELOPMENTAL_LENSES.length');
    expect(chapterReviewRoute).toContain('REVIEW_DEVELOPMENTAL_LENSES.some((lens) => !completed.has(lens))');
    expect(reviewHost).toContain("next.set('reviewRun', kept.run.id)");
    expect(reviewHost).toContain('What is working now');
    expect(reviewHost).toContain('What still catches');
    expect(reviewHost).toContain('Where I would look next');
    expect(reviewHost).toContain('Save current draft & quick reread');
    expect(reviewHost).toContain("commissioned.refusal === 'no_revision'");
    expect(reviewHost).toContain("commissioned.outcome === 'none'");
    expect(reviewHost).toContain('Nothing further surfaced in this light reread');
    expect(reviewHost).toContain('does not establish that the chapter is finished');
    expect(reviewHost).toContain("failure.refusal === 'no_revision'");
    expect(reviewHost).toContain('checkpointServerDraft');
    expect(reviewHost).toContain('draftRevision');
    expect(reviewHost).not.toContain('draftRevision: context.version');
    expect(reviewHost).toContain('currentRevision: body.draftRevision ?? -1');
    expect(reviewHost).not.toContain('currentRevision: body.version');
    expect(flagshipReview).toContain('currentRevision: body.draftRevision ?? -1');
    expect(flagshipReview).not.toContain('currentRevision: body.version');
    expect(flagshipReview).toContain('How does the chapter hold now?');
    expect(flagshipReview).toContain('Reread this chapter');
    expect(flagshipReview).toContain('runChapterReview(');
    expect(flagshipReview).toContain('saveChapterReviewManifest');
    expect(flagshipReview).toContain("q.set('reviewRun', kept.run.id)");
    expect(flagshipReview).toContain('what improved');
    expect(flagshipReview).toContain('what stayed strong');
    expect(flagshipReview).toContain('introduced a new tradeoff');
    expect(flagshipReview).toContain('Save current draft & reread');
    expect(flagshipReview).toContain('checkpointServerDraft');
    expect(flagshipReview).toContain('draftRevision');
    expect(flagshipReview).not.toContain('draftRevision: context.version');
  });
});
