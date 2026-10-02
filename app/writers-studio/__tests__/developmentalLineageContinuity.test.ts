import fs from 'node:fs';
import path from 'node:path';
import { lineageProcessForState } from '@/lib/writersStudio/intellectualLineageProcess';
import { validIntellectualLineageOrientation } from '@/lib/writersStudio/intellectualLineageOrientation';
import { nextMoveOptions } from '@/lib/writersStudio/writerNextMoves';

const ROOT = process.cwd();
const view = fs.readFileSync(
  path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'),
  'utf8',
);
const controller = fs.readFileSync(
  path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx'),
  'utf8',
);

describe('developmental field → C15 continuity', () => {
  it('keeps C15 state-sensitive without splitting into separate products', () => {
    expect(lineageProcessForState('existing-manuscript').phases).toEqual([
      'whole-field-orientation',
      'chapter-lineage',
      'exact-locus',
      'whole-field-synthesis',
    ]);
    expect(lineageProcessForState('partial-manuscript').phases).toContain('written-vs-planned-map');
    expect(lineageProcessForState('pre-manuscript').phases).toEqual([
      'source-field-orientation',
      'prospective-research',
      'possible-structure',
      'writing-threshold',
    ]);
  });

  it('never hides valid whole-work options merely because MAIA reflected a movement', () => {
    const all = nextMoveOptions('existing-manuscript', 'whole-work', 'differentiating');
    expect(all.map((x) => x.id)).toEqual([
      'whole-work-conversation',
      'see-attention-map',
      'explore-part-or-chapter',
      'trace-source-or-lineage',
      'something-else',
    ]);
  });

  it('carries the selected developmental lens through the navigation address', () => {
    expect(controller).toContain("params?.get('developmentalMovement')");
    expect(controller).toContain("query.set('developmentalMovement', movementId)");
    expect(view).toContain('Carried developmental lens');
    expect(view).toContain('Return to larger question');
    expect(view).toContain('Still carrying');
  });

  it('marks fitting paths without turning them into commands', () => {
    expect(view).toContain('Fits this lens');
    expect(view).toContain("data-suggested={suggestedHere ? 'true' : undefined}");
    expect(view).toContain('These are suggestions, not a workflow');
  });

  it('permits only writer-original candidates to normalize an omitted bibliography list to empty', () => {
    const route = fs.readFileSync(
      path.join(ROOT, 'app/api/sovereign/manuscripts/[id]/lineage-chapter/route.ts'),
      'utf8',
    );
    expect(route).toContain("candidate?.kind === 'writer-original'");
    expect(route).toContain('? []');
    expect(route).toContain(': null');
    expect(route).toContain('bibliographyKeys.every');
  });

  it('refuses malformed lineage orientations rather than rendering partial truth', () => {
    expect(validIntellectualLineageOrientation({
      manuscriptId: 'm',
      revisionNumber: 1,
      readingIds: ['r'],
      bibliographyEntries: [],
      questionsToInvestigate: ['q'],
      terrains: [{
        id: 't1',
        label: 'Terrain',
        description: 'desc',
        chapterSectionIds: [],
        bibliographyKeys: [],
        uncertainty: null,
      }],
    })).toBe(true);

    expect(validIntellectualLineageOrientation({
      manuscriptId: 'm',
      revisionNumber: 1,
      readingIds: ['r'],
      bibliographyEntries: [],
      questionsToInvestigate: ['q'],
      terrains: [{
        id: 't1',
        label: 'Malformed terrain',
        description: 'missing arrays',
      }],
    })).toBe(false);

    expect(controller).toContain('validIntellectualLineageOrientation(cached.orientation)');
  });

  it('treats chapter follow-up questions as optional enrichment, not a reason to discard valid candidates', () => {
    const route = fs.readFileSync(
      path.join(ROOT, 'app/api/sovereign/manuscripts/[id]/lineage-chapter/route.ts'),
      'utf8',
    );
    expect(route).toContain("required: ['candidates']");
    expect(route).toContain("const questions = Array.isArray(payload.questionsToInvestigate)");
    expect(route).toContain(": [];");
  });

  it('carries an exact lineage candidate into the manuscript and back without granting edit authority', () => {
    const writeController = fs.readFileSync(
      path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'),
      'utf8',
    );
    const writeView = fs.readFileSync(
      path.join(ROOT, 'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),
      'utf8',
    );
    expect(controller).toContain("params?.get('lineageCandidate')");
    expect(controller).toContain("query.set('lineageCandidate', candidateId)");
    expect(controller).toContain("query.set('lineageChapter', chapterRootId)");
    expect(writeController).toContain("params?.get('lineageCandidate')");
    expect(writeView).toContain('From intellectual lineage');
    expect(writeView).toContain('Return to lineage');
    expect(writeView).not.toContain('Apply lineage');
  });

  it('groups deep chapter signals by provenance relationship without discarding them', () => {
    expect(view).toContain("kind: 'quotation'");
    expect(view).toContain("kind: 'source-derived-claim'");
    expect(view).toContain("kind: 'writer-synthesis'");
    expect(view).toContain("kind: 'writer-original'");
    expect(view).toContain("kind: 'paraphrase'");
    expect(view).toContain("kind: 'uncertain-attribution'");
    expect(view).toContain('data-lineage-groups');
    expect(view).toContain('data-lineage-candidate={candidate.id}');
  });

  it('carries the exact lineage return address through Source Intake without allowing an arbitrary redirect', () => {
    const sources = fs.readFileSync(
      path.join(ROOT, 'app/writers-studio/sources/page.tsx'),
      'utf8',
    );
    expect(view).toContain("const sourceIntakeHref = '/writers-studio/sources?returnTo=' + encodeURIComponent(");
    expect(view).toContain('href={sourceIntakeHref}');
    expect(sources).toContain("rawReturnTo?.startsWith('/dev/writers-studio-p4r1?')");
    expect(sources).toContain('← Return to lineage question');
  });
});
