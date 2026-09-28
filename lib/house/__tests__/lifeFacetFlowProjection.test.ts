import fs from 'node:fs';
import path from 'node:path';

const read = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');

const helper = read('lib/house/facetCrossing.server.ts');
const route = read('app/api/house/facet-flows/route.ts');
const panel = read('components/maia/living-field/LifeFacetFlowPanel.tsx');
const dashboard = read('components/maia/living-field/PersonalLivingFieldDashboard.tsx');
const changesPage = read('app/changes/page.tsx');
const changesSheet = read('components/maia/changes/ChangesSheet.tsx');
const livingFieldRoute = read('app/api/maia/living-field/route.ts');

describe('LOF-01 — member-authored facet flow projection', () => {
  it('reads only durable member-scoped crossing facts for the flow list', () => {
    expect(helper).toContain('FROM member_facet_crossings');
    expect(helper).toContain('WHERE member_id = $1::uuid');
    expect(helper).toContain('ORDER BY created_at DESC');
    expect(helper).toContain('loadRecentFacetFlows');
  });

  it('keeps the projection endpoint authenticated and GET-only', () => {
    expect(route).toContain('getMemberIdFromRequest');
    expect(route).toContain('loadRecentFacetFlows');
    expect(route).toContain('export async function GET');
    expect(route).not.toMatch(/export async function (POST|PUT|PATCH|DELETE)/);
    expect(route).not.toContain("searchParams.get('memberId')");
  });

  it('binds the parent Living Field to the authenticated session with no member-id query override', () => {
    expect(livingFieldRoute).toContain('await getMemberIdFromRequest(request)');
    expect(livingFieldRoute).not.toContain("searchParams.get('memberId')");
    expect(livingFieldRoute).not.toContain('probeAuthPosture');
  });

  it('keeps the Living Field client read-only', () => {
    expect(panel).toContain("apiFetch('/api/house/facet-flows?limit=8')");
    expect(panel).not.toMatch(/method:\s*['"](POST|PUT|PATCH|DELETE)['"]/);
    expect(panel).toContain('Threads across your life');
    expect(panel).toContain('Paths you chose to carry');
    expect(panel).toContain('They do not claim');
  });

  it('renders literal member-authored movement rather than inferred semantic edges', () => {
    expect(panel).toContain('You carried this path');
    expect(panel).toContain('psychologically, causally, or developmentally connected');
    expect(panel).not.toMatch(/support(s|ed)? you|caused|means that|suggests that|pattern between/i);
  });

  it('places explicit flow before developmental/spiral readings in Living Field', () => {
    const constellation = dashboard.indexOf('<LivingConstellationPanel focus="living"');
    const flow = dashboard.indexOf('<LifeFacetFlowPanel />');
    const spirals = dashboard.indexOf('/* Active spirals */');
    const weather = dashboard.indexOf('Emotional Weather');

    expect(constellation).toBeGreaterThan(-1);
    expect(flow).toBeGreaterThan(constellation);
    expect(spirals).toBeGreaterThan(flow);
    expect(weather).toBeGreaterThan(flow);
  });

  it('makes projected Change targets directly returnable by id', () => {
    expect(changesPage).toContain("searchParams?.get('change')");
    expect(changesPage).toContain('initialChangeId={initialChangeId}');
    expect(changesSheet).toContain('initialChangeId?: string | null');
    expect(changesSheet).toContain("setView({ type: 'journey', changeId: initialChangeId })");
  });

  it('preserves crossing-create precedence over direct Change opening', () => {
    const effectStart = changesSheet.indexOf('if (!isOpen) return;');
    const carry = changesSheet.indexOf('if (carrySourceRef)', effectStart);
    const direct = changesSheet.indexOf('if (initialChangeId)', effectStart);
    expect(carry).toBeGreaterThan(effectStart);
    expect(direct).toBeGreaterThan(carry);
  });

  it('resolves source and target through their own ownership boundaries', () => {
    expect(helper).toContain('resolveFacetCarrySource');
    expect(helper).toContain('resolveFacetTarget');
    expect(helper).toContain('member_id = $2::uuid');
    expect(helper).toContain("decision_scope = 'personal'");
    expect(helper).toContain('personal_member_id = $2::uuid');
  });
});
