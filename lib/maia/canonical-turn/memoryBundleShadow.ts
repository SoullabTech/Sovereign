/**
 * Shadow-only standing witness for the legacy FAST MemoryBundle channel.
 *
 * This file MUST NOT feed cognition. It independently reconstructs the exact
 * MemoryBundle prompt bytes from structured bundle data, then records only
 * digests / standing metadata so CMT can observe the channel without changing
 * what MAIA receives.
 */
import type { MemoryBundle } from '../../memory/MemoryBundle';
import { digest } from '../../memory/provenance/turnMemoryProvenance';
import type { ParticipationIdentity } from './participationDisposition';

export const MEMORY_BUNDLE_SHADOW_MARKER = '[MAIA/shadow-memory]';

export interface MemoryBundleShadowSection {
  readonly section: 'relationship' | 'recent_continuity' | 'memory_bullets' | 'recent_breakthroughs';
  readonly digest: string;
  readonly chars: number;
  readonly standing:
    | { readonly status: 'resolved'; readonly identity: ParticipationIdentity }
    | { readonly status: 'unresolved_mixed'; readonly reason: string }
    | {
        readonly status: 'itemized';
        readonly items: readonly {
          readonly source: string;
          readonly identity: ParticipationIdentity;
        }[];
      };
}

export interface MemoryBundleShadowObservation {
  readonly present: boolean;
  readonly contentParity: boolean;
  readonly liveDigest: string;
  readonly rebuiltDigest: string;
  readonly sections: readonly MemoryBundleShadowSection[];
  readonly unresolvedMixedSections: readonly MemoryBundleShadowSection['section'][];
}

export function observeMemoryBundleStanding(
  bundle: MemoryBundle | null,
  liveMemoryContext: string,
): MemoryBundleShadowObservation {
  if (!bundle || liveMemoryContext.length === 0) {
    return {
      present: false,
      contentParity: liveMemoryContext.length === 0,
      liveDigest: digest(liveMemoryContext) ?? 'none',
      rebuiltDigest: digest('') ?? 'none',
      sections: [],
      unresolvedMixedSections: [],
    };
  }

  const parts: string[] = [];
  const sections: MemoryBundleShadowSection[] = [];

  if (bundle.relationshipSnapshot.encounterCount > 0) {
    const rs = bundle.relationshipSnapshot;
    const text = `🧠 RELATIONSHIP: ${rs.encounterCount} turns across sessions. ${rs.breakthroughCount} breakthroughs recorded${rs.dominantElement ? ` (${rs.dominantElement} dominant)` : ''}.`;
    parts.push(text);
    sections.push({
      section: 'relationship',
      digest: digest(text) ?? 'none',
      chars: text.length,
      standing: {
        status: 'resolved',
        identity: { authoredBy: 'system', participationClass: 'computed', authority: 'compute' },
      },
    });
  }

  if (bundle.recentContinuity) {
    parts.push(bundle.recentContinuity);
    sections.push({
      section: 'recent_continuity',
      digest: digest(bundle.recentContinuity) ?? 'none',
      chars: bundle.recentContinuity.length,
      standing: {
        status: 'unresolved_mixed',
        reason: 'system-composed continuity summary contains member snippets and MAIA-derived topic text',
      },
    });
  }

  if (bundle.memoryBullets.length > 0) {
    const bulletText = bundle.memoryBullets
      .map((b) => `• [${b.source}${b.facet ? `/${b.facet}` : ''}] ${b.content}`)
      .join('\n');
    const text = `\n📚 RELEVANT MEMORIES:\n${bulletText}`;
    parts.push(text);
    sections.push({
      section: 'memory_bullets',
      digest: digest(text) ?? 'none',
      chars: text.length,
      standing: {
        status: 'itemized',
        items: bundle.memoryBullets.map((b) => ({
          source: b.source,
          identity: {
            authoredBy: b.authoredBy,
            participationClass: b.participationClass,
            authority: b.authority,
          },
        })),
      },
    });
  }

  if (bundle.relationshipSnapshot.recentBreakthroughs.length > 0) {
    const text = `\n⭐ RECENT BREAKTHROUGHS:\n${bundle.relationshipSnapshot.recentBreakthroughs.map((b) => `• ${b}`).join('\n')}`;
    parts.push(text);
    sections.push({
      section: 'recent_breakthroughs',
      digest: digest(text) ?? 'none',
      chars: text.length,
      standing: {
        status: 'resolved',
        identity: { authoredBy: 'system', participationClass: 'computed', authority: 'compute' },
      },
    });
  }

  const rebuilt = parts.join('\n\n');
  const unresolvedMixedSections = sections
    .filter((section) => section.standing.status === 'unresolved_mixed')
    .map((section) => section.section);

  return {
    present: true,
    contentParity: rebuilt === liveMemoryContext,
    liveDigest: digest(liveMemoryContext) ?? 'none',
    rebuiltDigest: digest(rebuilt) ?? 'none',
    sections,
    unresolvedMixedSections,
  };
}

export function emitMemoryBundleStandingShadow(
  turnId: string,
  observation: MemoryBundleShadowObservation,
): void {
  console.log(`${MEMORY_BUNDLE_SHADOW_MARKER} ${JSON.stringify({ turnId, ...observation })}`);
}
