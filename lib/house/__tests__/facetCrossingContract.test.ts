import fs from 'node:fs';
import path from 'node:path';

import { FACET_CROSSINGS } from '../livingOrientation';

const read = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');

const migration = read('database/migrations/20260926000001_member_facet_crossings.sql');
const carrier = read('lib/house/facetCrossing.server.ts');
const carryRoute = read('app/api/house/carry-source/route.ts');
const crossingsRoute = read('app/api/house/crossings/route.ts');
const carryNotice = read('components/house/FacetCarryNotice.tsx');
const originTrail = read('components/house/FacetOriginTrail.tsx');
const journalReader = read('components/journal/room/EntryReader.tsx');
const journalRoom = read('components/journal/room/JournalRoom.tsx');
const journalPage = read('app/journal/page.tsx');
const reflectionDetail = read('components/reflections/ReflectionDetail.tsx');
const changesSheet = read('components/maia/changes/ChangesSheet.tsx');
const changesForm = read('components/maia/changes/NameYourChange.tsx');
const changesRoute = read('app/api/changes/route.ts');
const decisionForm = read('app/studio/decisions/new/page.tsx');
const decisionRoute = read('app/api/studio/decisions/route.ts');
const decisionDetail = read('app/studio/decisions/[id]/page.tsx');
const changeDetail = read('components/maia/changes/ChangeJourney.tsx');
const ideaWorkspace = read('app/maia/ideas/[id]/page.tsx');
const relationshipDetail = read('app/relationships/[id]/page.tsx');

const foundationalIds = [
  'journal-name-as-change',
  'reflection-name-as-change',
  'journal-consider-decision',
  'reflection-consider-decision',
] as const;

const ideaIds = [
  'idea-shift-to-changes',
  'idea-decision-to-decisions',
] as const;

const relationshipIds = [
  'relationship-name-change',
  'relationship-consider-decision',
] as const;

const ids = [...foundationalIds, ...ideaIds, ...relationshipIds] as const;

describe('House facet crossing contract', () => {
  it('registers the governed Journal/Reflection/Idea → Change/Decision crossings as live', () => {
    for (const id of ids) {
      const crossing = FACET_CROSSINGS.find((item) => item.id === id);
      expect(crossing).toBeDefined();
      expect(crossing).toMatchObject({
        authority: 'member_explicit',
        standing: 'live',
        mode: 'persistence',
      });
    }
  });

  it('keeps the durable crossing ledger relational and content-free', () => {
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS member_facet_crossings');
    expect(migration).toContain('source_facet');
    expect(migration).toContain('source_ref_id');
    expect(migration).toContain('target_facet');
    expect(migration).toContain('target_ref_id');
    expect(migration).not.toMatch(/\b(content|summary|excerpt|meaning|score|importance)\s+(text|jsonb|integer|numeric)/i);
    expect(migration).toContain('never copies source prose or invents semantic meaning');
  });

  it('fails closed to an explicit crossing allowlist instead of becoming a generic transfer API', () => {
    for (const id of ids) expect(carrier).toContain(`'${id}'`);
    expect(carrier).toContain("type CarrySourceFacet = 'journal' | 'reflections' | 'ideas' | 'relationships'");
    expect(carrier).toContain("type CarryTargetFacet = 'changes' | 'decisions'");
    expect(carryRoute).toContain('Crossing not admitted');
    expect(carryRoute).toContain('getMemberIdFromRequest');
    expect(carryRoute).toContain('validateFacetCrossingSource');
  });

  it('puts only source identity in Journal and Reflection crossing URLs', () => {
    expect(journalReader).toContain('sourceFacet=journal&sourceRefId=');
    expect(journalReader).toContain('crossingId=journal-name-as-change');
    expect(journalReader).toContain('crossingId=journal-consider-decision');
    expect(reflectionDetail).toContain('sourceFacet=reflections&sourceRefId=');
    expect(reflectionDetail).toContain('crossingId=reflection-name-as-change');
    expect(reflectionDetail).toContain('crossingId=reflection-consider-decision');
    expect(journalReader).not.toContain('encodeURIComponent(entry.content)');
    expect(reflectionDetail).not.toContain('encodeURIComponent(capsule.summary)');
    expect(ideaWorkspace).toContain('sourceFacet=ideas&sourceRefId=');
    expect(ideaWorkspace).toContain('crossingId=idea-shift-to-changes');
    expect(ideaWorkspace).toContain('crossingId=idea-decision-to-decisions');
    expect(ideaWorkspace).not.toContain('encodeURIComponent(block.content)');
  });

  it('admits Idea crossings only from the matching member-authored structural block', () => {
    expect(carrier).toContain("'idea-shift-to-changes': { source: 'ideas', target: 'changes', ideaBlockType: 'change' }");
    expect(carrier).toContain("'idea-decision-to-decisions': { source: 'ideas', target: 'decisions', ideaBlockType: 'decision' }");
    expect(carrier).toContain('AND b.block_type = $3');
    expect(ideaWorkspace).toContain("block.block_type === 'change'");
    expect(ideaWorkspace).toContain("block.block_type === 'decision'");
    expect(ideaWorkspace).toContain('Name this shift as a change →');
    expect(ideaWorkspace).toContain('Take this decision forward →');
  });

  it('keeps Relationship crossings explicit and excludes inferred relationship field state', () => {
    expect(carrier).toContain("'relationship-name-change': { source: 'relationships', target: 'changes' }");
    expect(carrier).toContain("'relationship-consider-decision': { source: 'relationships', target: 'decisions' }");
    expect(carrier).toContain('FROM member_relationships');
    expect(carrier).toContain('AND archived_at IS NULL');
    expect(carrier).not.toContain('relationship_field_state');
    expect(carrier).not.toMatch(/member_relationships[\s\S]{0,240}\bnote\b/);
    expect(relationshipDetail).toContain('Something is changing here →');
    expect(relationshipDetail).toContain('There is a choice here →');
    expect(relationshipDetail).toContain('sourceFacet=relationships&sourceRefId=');
  });

  it('shows source provenance while leaving target meaning for the member to author', () => {
    expect(carryNotice).toContain('Came with you from');
    expect(carryNotice).toContain('The source stays where it is. You decide what belongs here.');
    expect(changesForm).toContain('What is changing?');
    expect(changesForm).toContain('value={title}');
    expect(changesForm).toContain('value={description}');
    expect(decisionForm).toContain('placeholder="What is the decision?"');
    expect(decisionForm).toContain('value={title}');
    expect(decisionForm).toContain('value={context}');
    expect(decisionForm).not.toContain('setTitle(source');
    expect(decisionForm).not.toContain('setContext(source');
  });

  it('requires source resolution before target submit can become actionable', () => {
    expect(changesForm).toContain('(!carrySourceRef || carrySourceReady)');
    expect(changesSheet).toContain('carrySourceReady={carrySourceValid === true}');
    expect(decisionForm).toContain('(!carrySourceRef || carrySourceValid === true)');
    expect(carryNotice).toContain('Source unavailable');
    expect(carryNotice).toContain('Nothing has crossed.');
  });

  it('creates target + relation inside one transaction after source validation', () => {
    expect(changesRoute).toContain("targetFacet: 'changes'");
    expect(changesRoute).toContain('validateFacetCrossingSource');
    expect(changesRoute).toContain('db.transaction(async (client)');
    expect(changesRoute).toContain('recordFacetCrossing(client');

    expect(decisionRoute).toContain("targetFacet: 'decisions'");
    expect(decisionRoute).toContain('validateFacetCrossingSource');
    expect(decisionRoute).toContain('db.transaction(async (client)');
    expect(decisionRoute).toContain('recordFacetCrossing(client');
    expect(decisionRoute).toContain('Facet carry currently enters personal Decisions only.');
  });

  it('keeps durable target provenance visible and provides a return doorway', () => {
    expect(crossingsRoute).toContain('member_facet_crossings');
    expect(crossingsRoute).toContain('member_id = $1');
    expect(originTrail).toContain('Where this began');
    expect(originTrail).toContain('Return to source →');
    expect(changeDetail).toContain('<FacetOriginTrail');
    expect(decisionDetail).toContain('<FacetOriginTrail');
  });

  it('reopens an exact Journal source from identity alone', () => {
    expect(journalPage).toContain("searchParams?.get('entry')");
    expect(journalPage).toContain('<JournalRoom initialEntryId={entryId} />');
    expect(journalRoom).toContain('entries.find((item) => item.id === initialEntryId)');
    expect(journalRoom).toContain("setState({ name: 'reading', entry, reflecting: false })");
    expect(journalRoom).not.toContain('content: initialEntryId');
  });

  it('reopens an exact Idea source block from identity alone', () => {
    expect(ideaWorkspace).toContain("searchParams?.get('block')");
    expect(ideaWorkspace).toContain('blocks.some((block) => block.id === blockId)');
    expect(ideaWorkspace).toContain('scrollToBlock(blockId)');
  });

  it('does not strand Changes transitions behind an AnimatePresence wait gate', () => {
    const contentStart = changesSheet.indexOf('/* Content Area */');
    expect(contentStart).toBeGreaterThan(-1);
    const contentBlock = changesSheet.slice(contentStart);
    expect(contentBlock).not.toContain('<AnimatePresence mode="wait">');
    expect(contentBlock).toContain("view.type === 'create'");
    expect(contentBlock).toContain('<NameYourChange');
  });
});
