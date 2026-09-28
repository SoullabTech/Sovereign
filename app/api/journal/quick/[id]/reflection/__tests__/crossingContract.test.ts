import fs from 'node:fs';
import path from 'node:path';

import { FACET_CROSSINGS } from '../../../../../../../lib/house/livingOrientation';

const quickList = fs.readFileSync(
  path.resolve(process.cwd(), 'app/api/journal/quick/list/route.ts'),
  'utf8',
);
const crossingRoute = fs.readFileSync(
  path.resolve(process.cwd(), 'app/api/journal/quick/[id]/reflection/route.ts'),
  'utf8',
);
const reader = fs.readFileSync(
  path.resolve(process.cwd(), 'components/journal/room/EntryReader.tsx'),
  'utf8',
);

describe('Journal → Reflections crossing authority', () => {
  it('does not auto-create Reflection capsules during Journal save', () => {
    expect(quickList).not.toContain('bridgeToCapsule');
    expect(quickList).not.toContain("import { createCapsule } from '@/lib/capsules/capsuleService'");
    expect(quickList).toContain('Keep as a reflection');
  });

  it('requires an authenticated, owned Journal entry at the crossing seam', () => {
    expect(crossingRoute).toContain('requireMemberId');
    expect(crossingRoute).toContain('user_id = ANY($2::text[])');
    expect(crossingRoute).toContain('journal entry not found');
  });

  it('is idempotent for one Journal source entry', () => {
    expect(crossingRoute).toContain("source_type = 'journal'");
    expect(crossingRoute).toContain('source_id = $2');
    expect(crossingRoute).toContain('alreadyKept: true');
  });

  it('creates the member-confirmed Reflection without LLM re-distillation', () => {
    expect(crossingRoute).toContain('createCapsule({');
    expect(crossingRoute).toContain("tags: ['member-kept', entry.entry_type]");
    expect(crossingRoute).toContain('draft: false');
    expect(crossingRoute).not.toContain('distillCapsuleFromText');
    expect(crossingRoute).not.toContain('VectorEmbeddingService');
  });

  it('exposes the crossing as a visible gesture on a kept Journal entry', () => {
    expect(reader).toContain('Keep as a reflection');
    expect(reader).toContain('/api/journal/quick/${entry.id}/reflection');
    expect(reader).toContain('Kept as a reflection →');
  });

  it('records the repaired crossing as live/member-explicit and retires hidden Journal memory propagation', () => {
    const reflection = FACET_CROSSINGS.find(
      (crossing) => crossing.id === 'journal-keep-as-reflection',
    );
    expect(reflection).toMatchObject({
      from: 'journal',
      to: 'reflections',
      authority: 'member_explicit',
      standing: 'live',
    });

    expect(
      FACET_CROSSINGS.some((crossing) => crossing.id === 'journal-automatic-episodic-memory'),
    ).toBe(false);
    expect(quickList).not.toContain('bridgeToEpisodicMemory');
    expect(quickList).not.toContain('INSERT INTO episodic_memories');
  });
});
