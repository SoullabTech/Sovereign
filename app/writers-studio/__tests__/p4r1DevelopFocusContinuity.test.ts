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

  it('shows Work with this only for exact passage targets while preserving Show me where', () => {
    expect(developView).toContain('{workSectionId ? (');
    expect(developView).toContain('Work with this');
    expect(developView).toContain('{sectionId ? (');
    expect(developView).toContain('Show me where');
  });

  it('carries the exact Develop observation into Write with an explicit focus action', () => {
    expect(developController).toContain("query.set('insightReading', readingId)");
    expect(developController).toContain("query.set('insightObservation', observationKey)");
    expect(developController).toContain("query.set('insightAction', 'focus')");
    expect(developController).toContain('Keep developField / developIntent / r as the exact return address.');
  });

  it('refuses automatic Focus without an exact passage range', () => {
    expect(writeController).toContain("if (incomingAction === 'focus' && !passage.range) return;");
    expect(writeController).toContain("if (incomingAction !== 'focus' || !arrivalInsight || !selectedPassage || workspaceOpen) return;");
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
