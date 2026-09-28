import fs from 'node:fs';
import path from 'node:path';

const read = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');

const panel = read('components/maia/living-field/LifeFacetFlowPanel.tsx');
const evidenceRoute = read('app/api/house/facet-flow-evidence/route.ts');
const helper = read('lib/house/facetCrossing.server.ts');

describe('LOF-02 — member-chosen lens over explicit facet-flow evidence', () => {
  it('offers all six cross-cutting lenses as member choices, never automatic classification', () => {
    for (const lens of ['elemental', 'spiralogic', 'developmental', 'relational', 'temporal', 'symbolic']) {
      expect(panel).toContain(`id: '${lens}'`);
    }
    expect(panel).toContain('Choose a perspective. Nothing is classified or saved by choosing one.');
    expect(panel).not.toContain('setLens(' + "'elemental'" + ')');
  });

  it('fetches underlying evidence only after a member chooses a lens', () => {
    const choose = panel.indexOf('async function chooseLens');
    const fetch = panel.indexOf("'/api/house/facet-flow-evidence?flowId='");
    expect(choose).toBeGreaterThan(-1);
    expect(fetch).toBeGreaterThan(choose);
    expect(panel).not.toContain('useEffect(() => {\n    void apiFetch(\'/api/house/facet-flow-evidence');
  });

  it('shows an editable transfer preview before MAIA receives anything', () => {
    expect(panel).toContain('What MAIA will receive');
    expect(panel).toContain('value={message}');
    expect(panel).toContain('onChange={(event) => setMessage(event.target.value)}');
    expect(panel).toContain('Edit or clear this first.');
  });

  it('uses canonical in-place MAIA presence and no lens persistence', () => {
    expect(panel).toContain('presence.openMaiaWith(prompt)');
    expect(panel).toContain("source: 'living-field:facet-flow'");
    expect(panel).not.toMatch(/localStorage|sessionStorage|method:\s*['"](POST|PUT|PATCH|DELETE)['"]/);
  });

  it('frames every lens as perspective rather than verdict authority', () => {
    expect(panel).toContain('Treat the lens as a perspective, not a verdict.');
    expect(panel).toContain('what this lens merely suggests');
    expect(panel).toContain('Ask me about my lived meaning rather than deciding it for me.');
    expect(panel).toContain('Do not turn an element into a fixed identity.');
    expect(panel).toContain('Do not assign me a fixed stage.');
  });

  it('keeps the evidence endpoint authenticated, GET-only, and member-scoped', () => {
    expect(evidenceRoute).toContain('getMemberIdFromRequest');
    expect(evidenceRoute).toContain('loadFacetFlowEvidence(memberId, flowId)');
    expect(evidenceRoute).not.toMatch(/export async function (POST|PUT|PATCH|DELETE)/);
    expect(helper).toContain('AND member_id = $2::uuid');
    expect(helper).toContain("decision_scope = 'personal'");
    expect(helper).toContain('personal_member_id = $2::uuid');
  });

  it('resolves exact source and target text without writing a semantic relation', () => {
    expect(helper).toContain('resolveFacetCarrySource');
    expect(helper).toContain('resolveFacetTargetEvidence');
    expect(helper).toContain('description');
    expect(helper).toContain('context');
    expect(evidenceRoute).not.toContain('member_facet_crossings');
    expect(evidenceRoute).not.toContain('INSERT');
  });
});
