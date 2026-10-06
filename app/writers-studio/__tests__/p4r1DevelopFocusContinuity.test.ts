import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('C3 Develop → Focus continuity', () => {
  const developController = read('app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx');
  const developView = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
  const writeController = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  const writeView = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
  const dance = read('app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx');

  it('separates orientation targets from exact editorial targets', () => {
    expect(developController).toContain('const observationTargets = useMemo');
    expect(developController).toContain('const observationWorkTargets = useMemo');
    expect(developController).toContain("if (ref.kind !== 'passage') continue;");
    expect(developView).toContain('const sectionId = targets[observation.key];');
    expect(developView).toContain('const workSectionId = workTargets[observation.key];');
  });

  it('keeps exact-passage actions distinct from orientation-only Show me where', () => {
    expect(developView).toContain('{workSectionId ? (');
    expect(developView).toContain('{sectionId ? (');
    expect(developView).toContain('Show me where');
    expect(developView).not.toContain('Try a revision');
    expect(developView).toContain('Talk with MAIA about what may need strengthening');
    expect(developView).toContain('Work this into the writing →');
  });

  it('carries the exact Develop observation into Write with an explicit focus action', () => {
    expect(developController).toContain("query.set('insightReading', readingId)");
    expect(developController).toContain("query.set('insightObservation', observationKey)");
    expect(developController).toContain("query.set('insightAction', 'focus')");
    expect(developController).toContain('Keep developField / developIntent / r as the exact return address.');
  });

  it('turns every explicit Work-on-this handoff into revision work rather than plain canvas navigation', () => {
    expect(developController).toContain("craftFromConversation ? 'craft-passage' : 'try-revision'");
    expect(developController).toContain("craftFromConversation ? 'choose-craft-passage' : 'choose-revision-passage'");
    expect(developController).toContain('Do not degrade “Work on this” into plain canvas');
    expect(writeController).toContain("incomingAction === 'try-revision'");
    expect(writeController).toContain("incomingAction !== 'choose-revision-passage' && incomingAction !== 'choose-craft-passage'");
    expect(writeController).toContain("For a section-level observation, the writer's manual selection is the");
    expect(writeController).toContain('const autoProposalKey = useRef<string | null>(null)');
    expect(writeController).toContain('Offer one possible revision of this selected passage');
    expect(writeController).toContain('{ proposalRequested: true }');
    expect(writeController).toContain('Nothing is to be applied automatically.');
  });

  it('re-orients Develop when the writer chooses another chapter or section', () => {
    for (const fragment of [
      "query.set('mode', 'develop')",
      "query.delete('developField')",
      "query.delete('developIntent')",
      "query.delete('r')",
      "query.delete('attentionItem')",
      "query.delete('insightReading')",
      "query.delete('insightObservation')",
      "query.delete('insightAction')",
      "query.delete('editorialThread')",
      "query.delete('relationship')",
    ]) expect(developController).toContain(fragment);
  });

  it('refuses model-chosen automatic Focus without an exact passage while allowing writer-chosen revision loci', () => {
    expect(writeController).toContain("incomingAction === 'craft-passage') && !passage.range) return;");
    expect(writeController).toContain("if (incomingAction !== 'focus' || !arrivalInsight || !selectedPassage || workspaceOpen) return;");
    expect(writeController).toContain("incomingAction !== 'choose-revision-passage' && incomingAction !== 'choose-craft-passage'");
    expect(writeController).toContain('&& candidate.range,');
    expect(writeController).toContain('if (exact !== selectedPassage.text) return;');
  });

  it('opens the existing workspace seam rather than inventing another editor state', () => {
    expect(writeController).toContain("openWorkspace({ readingId: arrivalInsight.readingId, key: arrivalInsight.observation.key });");
    expect(writeView).toContain('if (props.workspaceOpen && props.held && !isolatedEditorial)');
    expect(writeView).toContain('setIsolatedEditorial(true)');
  });

  it('keeps the Develop observation visible inside Focus and offers a real return path', () => {
    expect(writeView).toContain('data-focus-origin');
    expect(writeView).toContain('From MAIA’s reading');
    expect(writeView).toContain('props.carriedInsight.observation.observation');
    expect(writeView).toContain('props.carriedInsightReturnMode');
    expect(writeView).toContain('props.onMode(props.carriedInsightReturnMode!)');
    expect(writeView).toContain("props.carriedInsightReturnMode === 'review' ? 'Review' : 'Develop'");
  });

  it('carries the frozen observation into the first editorial act only as attributed context', () => {
    expect(writeView).toContain('origin={props.carriedInsight && props.carriedInsightReturnMode ? {');
    expect(writeView).toContain('observation: props.carriedInsight.observation.observation');
    expect(dance).toContain('We arrived at this exact passage from a prior frozen');
    expect(dance).toContain('Treat that as attributed historical context, not a verdict and not an edit instruction.');
    expect(dance).toContain('Use the current passage as the authority for any new editorial claim.');
    expect(dance).toContain('Do not silently convert the prior observation into a revision recommendation.');
    expect(dance).toContain('if (!props.origin || props.thread) return prompt;');
  });
});
