import type { MemoryBundle } from '../../../memory/MemoryBundle';
import { observeMemoryBundleStanding } from '../memoryBundleShadow';


function legacyFormat(bundle: MemoryBundle): string {
  const parts: string[] = [];
  if (bundle.relationshipSnapshot.encounterCount > 0) {
    const rs = bundle.relationshipSnapshot;
    parts.push(`🧠 RELATIONSHIP: ${rs.encounterCount} turns across sessions. ${rs.breakthroughCount} breakthroughs recorded${rs.dominantElement ? ` (${rs.dominantElement} dominant)` : ''}.`);
  }
  if (bundle.recentContinuity) parts.push(bundle.recentContinuity);
  if (bundle.memoryBullets.length > 0) {
    const bulletText = bundle.memoryBullets.map((b) => `• [${b.source}${b.facet ? `/${b.facet}` : ''}] ${b.content}`).join('\n');
    parts.push(`\n📚 RELEVANT MEMORIES:\n${bulletText}`);
  }
  if (bundle.relationshipSnapshot.recentBreakthroughs.length > 0) {
    parts.push(`\n⭐ RECENT BREAKTHROUGHS:\n${bundle.relationshipSnapshot.recentBreakthroughs.map((b) => `• ${b}`).join('\n')}`);
  }
  return parts.join('\n\n');
}

function fixture(): MemoryBundle {
  return {
    recentContinuity: 'Recent conversation:\n• User: "I am changing" → MAIA responded about change',
    memoryBullets: [
      {
        id: 'turn-1',
        content: 'I want this remembered.',
        source: 'turn',
        authoredBy: 'member',
        participationClass: 'retrieved',
        authority: 'situate',
        significance: 0.5,
        timestamp: new Date('2026-10-01T12:00:00Z'),
      },
      {
        id: 'dev-1',
        content: 'A developmental pattern was inferred.',
        source: 'developmental',
        authoredBy: 'system',
        participationClass: 'inferred',
        authority: 'infer',
        significance: 0.8,
        timestamp: new Date('2026-09-30T12:00:00Z'),
      },
      {
        id: 'break-1',
        content: 'A breakthrough was system-marked.',
        source: 'breakthrough',
        authoredBy: 'system',
        participationClass: 'computed',
        authority: 'compute',
        significance: 0.9,
        timestamp: new Date('2026-09-29T12:00:00Z'),
      },
    ],
    relationshipSnapshot: {
      encounterCount: 12,
      firstSeen: new Date('2026-09-01T12:00:00Z'),
      lastSeen: new Date('2026-10-01T12:00:00Z'),
      breakthroughCount: 1,
      recentBreakthroughs: ['A system-noticed breakthrough'],
      dominantElement: 'water',
      integrationRate: 0,
    },
    selectionTrace: [],
    retrievalStats: {
      turnsRetrieved: 2,
      turnsSameSession: 0,
      turnsCrossSession: 2,
      semanticHits: 1,
      breakthroughsFound: 1,
      totalCandidates: 3,
      afterRanking: 2,
    },
  };
}

describe('MemoryBundle canonical shadow visibility', () => {
  it('reconstructs the live prompt bytes exactly without changing the formatter', () => {
    const bundle = fixture();
    const live = legacyFormat(bundle);
    const observed = observeMemoryBundleStanding(bundle, live);

    expect(observed.present).toBe(true);
    expect(observed.contentParity).toBe(true);
    expect(observed.liveDigest).toBe(observed.rebuiltDigest);
    expect(observed.unresolvedMixedSections).toContain('recent_continuity');

    const bullets = observed.sections.find((section) => section.section === 'memory_bullets');
    expect(bullets?.standing.status).toBe('itemized');
    if (bullets?.standing.status === 'itemized') {
      expect(bullets.standing.items).toEqual([
        {
          source: 'turn',
          identity: { authoredBy: 'member', participationClass: 'retrieved', authority: 'situate' },
        },
        {
          source: 'developmental',
          identity: { authoredBy: 'system', participationClass: 'inferred', authority: 'infer' },
        },
        {
          source: 'breakthrough',
          identity: { authoredBy: 'system', participationClass: 'computed', authority: 'compute' },
        },
      ]);
    }
  });


  it('preserves byte parity across all optional-section combinations', () => {
    for (let mask = 0; mask < 16; mask += 1) {
      const bundle = fixture();
      if ((mask & 1) === 0) {
        bundle.relationshipSnapshot = { ...bundle.relationshipSnapshot, encounterCount: 0 };
      }
      if ((mask & 2) === 0) bundle.recentContinuity = '';
      if ((mask & 4) === 0) bundle.memoryBullets = [];
      if ((mask & 8) === 0) {
        bundle.relationshipSnapshot = { ...bundle.relationshipSnapshot, recentBreakthroughs: [] };
      }

      const live = legacyFormat(bundle);
      const observed = observeMemoryBundleStanding(bundle, live);
      expect(observed.contentParity).toBe(true);
      expect(observed.liveDigest).toBe(observed.rebuiltDigest);
    }
  });

  it('detects byte drift in the live prompt channel', () => {
    const bundle = fixture();
    const live = legacyFormat(bundle);
    expect(observeMemoryBundleStanding(bundle, live + ' drift').contentParity).toBe(false);
  });


  it('does not render participation axes into the live prompt', () => {
    const bundle = fixture();
    const live = legacyFormat(bundle);
    expect(live).toContain('• [turn] I want this remembered.');
    expect(live).toContain('• [developmental] A developmental pattern was inferred.');
    expect(live).toContain('• [breakthrough] A breakthrough was system-marked.');
    expect(live).not.toContain('member/retrieved/situate');
    expect(live).not.toContain('system/inferred/infer');
  });
});
