import { readFileSync } from 'fs';
import path from 'path';

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
}));

import {
  projectLivingFieldRow,
  projectVisionThreadRow,
  projectPracticeFieldRow,
} from '../projection';

const repoRoot = path.resolve(__dirname, '../../../..');

const read = (relative: string) =>
  readFileSync(path.join(repoRoot, relative), 'utf8');

describe('LC-02 — read-only Living Constellation projection', () => {
  it('preserves Living Field authority rather than flattening a MAIA candidate', () => {
    const node = projectLivingFieldRow({
      id: 'lf-1',
      field_key: 'work_vocation',
      current_expression: 'I am reconsidering the shape of my work.',
      status: 'active',
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-18T00:00:00Z',
      latest_authored_by: 'maia_candidate',
    });

    expect(node.domain).toBe('living_field');
    expect(node.authorship).toBe('maia_candidate');
    expect(node.source.table).toBe('personal_living_fields');
    expect(node.privacy).toBe('member_private');
  });
  it('reports Vision Studio persisted center honestly without using it as corrected provenance', () => {
    const node = projectVisionThreadRow({
      id: 'vs-1',
      title: 'A slower way of working',
      authorship: 'member_confirmed',
      member_decision: 'keep',
      can_be_shown_to_practitioner: false,
      center: 'person',
      spiralogic_phase: 'fire_1',
      field_context: 'my-field',
      created_at: '2026-09-17T00:00:00Z',
      updated_at: '2026-09-18T00:00:00Z',
    });

    expect(node.domain).toBe('vision_studio');
    expect(node.authorship).toBe('member_confirmed');
    expect(node.source.persistedCenter).toBe('person');
    expect(node.privacy).toBe('member_private');
  });

  it('preserves explicit practitioner sharing on a Vision Studio thread', () => {
    const node = projectVisionThreadRow({
      id: 'vs-2',
      title: 'Presence before performance',
      authorship: 'member_authored',
      member_decision: 'create',
      can_be_shown_to_practitioner: true,
      center: 'person',
      spiralogic_phase: 'fire_2',
      field_context: null,
      created_at: '2026-09-17T00:00:00Z',
      updated_at: '2026-09-18T00:00:00Z',
    });

    expect(node.privacy).toBe('member_shared_with_practitioner');
    expect(node.authorship).toBe('member_authored');
  });
  it('shows Practice Field containment as standing, not readiness success', () => {
    const node = projectPracticeFieldRow({
      id: 'pf-1',
      status: 'live',
      about_practice: 'Relational work',
      active_field_content: 'Rest is alive in the practice right now.',
      containment_status: 'contained',
      identity_ratified_at: null,
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-18T00:00:00Z',
    });

    expect(node.domain).toBe('practice_field');
    expect(node.standing).toBe('contained');
    expect(node.details?.readiness).toBe('live');
    expect(node.details?.identityRatified).toBe(false);
  });

  it('contains no semantic-write SQL or mutating route handler', () => {
    const projection = read('lib/maia/living-constellation/projection.ts');
    const route = read('app/api/maia/living-constellation/route.ts');

    for (const forbidden of [
      'INSERT INTO',
      'UPDATE personal_',
      'UPDATE member_',
      'UPDATE practice_',
      'DELETE FROM',
      'ON CONFLICT',
    ]) {
      expect(projection).not.toContain(forbidden);
    }

    expect(route).toContain('export async function GET');
    expect(route).not.toMatch(/export async function (POST|PUT|PATCH|DELETE)/);
  });
  it('binds every source adapter to the authenticated member and only current Vision Studio acts', () => {
    const projection = read('lib/maia/living-constellation/projection.ts');

    expect(projection).toContain('WHERE f.member_id = $1');
    expect(projection).toContain('WHERE member_id = $1');
    expect(projection).toContain('WHERE practitioner_member_id = $1');

    expect(projection).toContain("source_session_ref LIKE 'vs-%'");
    expect(projection).toContain('released_at IS NULL');
    expect(projection).toContain('member_confirmed = TRUE');
  });

  it('uses one shared component in all three rooms with different foregrounds', () => {
    const living = read('components/maia/living-field/PersonalLivingFieldDashboard.tsx');
    const vision = read('components/maia/vision-studio/VisionStudioRoom.tsx');
    const practice = read('components/maia/practice-field/PracticeFieldEditor.tsx');

    expect(living).toContain('<LivingConstellationPanel focus="living"');
    expect(vision).toContain('<LivingConstellationPanel focus="vision"');
    expect(practice).toContain('<LivingConstellationPanel focus="practice"');
  });
  it('keeps the shared constellation client read-only', () => {
    const component = read(
      'components/maia/living-constellation/LivingConstellationPanel.tsx',
    );

    expect(component).toContain("apiFetch('/api/maia/living-constellation')");
    expect(component).not.toMatch(/method:\s*['"](POST|PUT|PATCH|DELETE)['"]/);
    expect(component).toContain('They do not claim');
  });
});
