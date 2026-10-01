/**
 * SOULLAB-LIVING-ARCHIVE-01 · Dark Field reference model.
 *
 * This is deliberately NOT a renderer, route, persistence service, or telemetry
 * layer. It exists so LA30-F1…F11 can kill wrong worlds before a member-facing
 * archive surface exists.
 */

export type ArchiveViewer = 'anonymous' | 'member' | 'founder';
export type PrivacyClass = 'ordinary' | 'sealed_self' | 'withheld_third_party';
export type PointVisibility = 'public' | 'member' | 'founder' | 'none';
export type AdmissionStage = 'discovered' | 'catalogued' | 'reviewed' | 'admitted';
export type DisplayStatus = 'hidden' | 'eligible' | 'redacted' | 'exhibited' | 'restricted' | 'private';
export type CustodyStatus = 'active' | 'withdrawn';

export interface ArtifactRecord {
  readonly archiveId: string;
  readonly parentArchiveId: string | null;
  readonly privacyClass: PrivacyClass;
  readonly pointVisibility: PointVisibility;
  readonly admissionStage: AdmissionStage;
  readonly displayStatus: DisplayStatus;
  readonly custodyStatus: CustodyStatus;
  /** Stable normalized chronology input, e.g. day ordinal or era bucket ordinal. */
  readonly dateOrdinal: number;
}

export interface KnownGapRecord {
  readonly gapId: string;
  readonly privacyClass: PrivacyClass;
  readonly pointVisibility: PointVisibility;
  readonly admissionStage: AdmissionStage;
  readonly displayStatus: Exclude<DisplayStatus, 'redacted'>;
  readonly dateOrdinal: number;
}

export interface ArchiveCatalogue {
  readonly artifacts: readonly ArtifactRecord[];
  readonly knownGaps: readonly KnownGapRecord[];
}

export type FieldPointKind = 'artifact' | 'sealed' | 'known_gap' | 'withdrawal';

export interface FieldPoint {
  readonly id: string;
  readonly kind: FieldPointKind;
}

export interface Coordinate {
  readonly x: number;
  readonly y: number;
}

export interface HazeMark {
  readonly locationId: string;
  /** Forbidden in v1; present only so falsifier fixtures can express the wrong world. */
  readonly density?: number;
  readonly intensity?: number;
  readonly estimatedCount?: number;
  readonly estimateBasis?: string;
}

export interface ThreadCandidate {
  readonly id: string;
  readonly artifactIds: readonly string[];
  /** All fields below are forbidden behavior-derived salience surfaces. */
  readonly recommended?: boolean;
  readonly score?: number;
  readonly rank?: number;
  readonly behaviorWeight?: number;
  readonly highlightedBecause?: string;
}

export interface NavigationCandidate {
  readonly transport: 'client_only' | 'path' | 'query' | 'network';
  readonly networkRequests: number;
  readonly urlMutation: string | null;
}

export interface DarkFieldCandidate {
  readonly points: readonly FieldPoint[];
  readonly coordinates: Readonly<Record<string, Coordinate>>;
  readonly haze: readonly HazeMark[];
  readonly threads: readonly ThreadCandidate[];
  readonly navigation: NavigationCandidate;
  readonly stayWithField: boolean;
  readonly abandoned?: boolean;
  readonly progressPercent?: number;
  readonly completionBadge?: string;
  readonly completed?: boolean;
  readonly aweNarration?: string | null;
}

export type FalsifierId =
  | 'LA30-F1'
  | 'LA30-F2'
  | 'LA30-F3'
  | 'LA30-F4'
  | 'LA30-F5'
  | 'LA30-F6'
  | 'LA30-F7'
  | 'LA30-F8'
  | 'LA30-F9'
  | 'LA30-F10'
  | 'LA30-F11';

export interface Violation {
  readonly falsifier: FalsifierId;
  readonly detail: string;
}

const visibilityRank: Readonly<Record<ArchiveViewer, number>> = {
  anonymous: 1,
  member: 2,
  founder: 3,
};

const pointRank: Readonly<Record<PointVisibility, number>> = {
  none: 99,
  public: 1,
  member: 2,
  founder: 3,
};

function viewerMaySeePoint(viewer: ArchiveViewer, pointVisibility: PointVisibility): boolean {
  if (pointVisibility === 'none') return false;
  return visibilityRank[viewer] >= pointRank[pointVisibility];
}

export function expectedArtifactPoint(artifact: ArtifactRecord, viewer: ArchiveViewer): FieldPoint | null {
  if (artifact.parentArchiveId !== null) return null;
  if (artifact.admissionStage !== 'admitted') return null;
  if (artifact.privacyClass === 'withheld_third_party') return null;
  if (!viewerMaySeePoint(viewer, artifact.pointVisibility)) return null;
  if (artifact.privacyClass === 'sealed_self') {
    if (viewer === 'anonymous') return null;
    return { id: artifact.archiveId, kind: artifact.custodyStatus === 'withdrawn' ? 'withdrawal' : 'sealed' };
  }
  return { id: artifact.archiveId, kind: artifact.custodyStatus === 'withdrawn' ? 'withdrawal' : 'artifact' };
}

export function expectedGapPoint(gap: KnownGapRecord, viewer: ArchiveViewer): FieldPoint | null {
  if (gap.admissionStage !== 'admitted') return null;
  if (gap.privacyClass === 'withheld_third_party') return null;
  if (!viewerMaySeePoint(viewer, gap.pointVisibility)) return null;
  if (gap.privacyClass === 'sealed_self' && viewer === 'anonymous') return null;
  return { id: gap.gapId, kind: gap.privacyClass === 'sealed_self' ? 'sealed' : 'known_gap' };
}

/** LA-27: coordinates derive from identity + admitted chronology, never catalogue size. */
export function coordinateV1(id: string, dateOrdinal: number): Coordinate {
  let hash = 2166136261;
  const seed = `LA-LAYOUT-v1|${id}`;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  const unit = hash / 0xffffffff;
  return {
    x: dateOrdinal,
    y: Math.round((unit * 2 - 1) * 1_000_000) / 1_000_000,
  };
}

export function buildReferenceDarkField(
  catalogue: ArchiveCatalogue,
  viewer: ArchiveViewer,
  threads: readonly { id: string; artifactIds: readonly string[] }[] = [],
  hazeLocations: readonly string[] = [],
): DarkFieldCandidate {
  const points: FieldPoint[] = [];
  const coordinates: Record<string, Coordinate> = {};

  for (const artifact of catalogue.artifacts) {
    const point = expectedArtifactPoint(artifact, viewer);
    if (!point) continue;
    points.push(point);
    coordinates[point.id] = coordinateV1(artifact.archiveId, artifact.dateOrdinal);
  }

  for (const gap of catalogue.knownGaps) {
    const point = expectedGapPoint(gap, viewer);
    if (!point) continue;
    points.push(point);
    coordinates[point.id] = coordinateV1(gap.gapId, gap.dateOrdinal);
  }

  const visibleIds = new Set(points.map((point) => point.id));
  return {
    points,
    coordinates,
    haze: hazeLocations.map((locationId) => ({ locationId })),
    threads: threads.map((thread) => ({
      id: thread.id,
      artifactIds: thread.artifactIds.filter((id) => visibleIds.has(id)),
    })),
    navigation: {
      transport: 'client_only',
      networkRequests: 0,
      urlMutation: null,
    },
    stayWithField: false,
    aweNarration: null,
  };
}

function sameCoordinate(a: Coordinate | undefined, b: Coordinate): boolean {
  return Boolean(a && a.x === b.x && a.y === b.y);
}

export function validateDarkFieldCandidate(
  candidate: DarkFieldCandidate,
  catalogue: ArchiveCatalogue,
  viewer: ArchiveViewer,
  previousCoordinates: Readonly<Record<string, Coordinate>> = {},
): readonly Violation[] {
  const violations: Violation[] = [];
  const artifacts = new Map(catalogue.artifacts.map((artifact) => [artifact.archiveId, artifact]));
  const gaps = new Map(catalogue.knownGaps.map((gap) => [gap.gapId, gap]));

  const seenPointIds = new Set<string>();
  for (const point of candidate.points) {
    if (seenPointIds.has(point.id)) {
      violations.push({ falsifier: 'LA30-F7', detail: `catalogue record ${point.id} rendered more than once` });
    }
    seenPointIds.add(point.id);

    const artifact = artifacts.get(point.id);
    const gap = gaps.get(point.id);
    if (!artifact && !gap) {
      violations.push({ falsifier: 'LA30-F1', detail: `decorative point ${point.id} has no catalogue record` });
      continue;
    }

    if (artifact) {
      if (artifact.parentArchiveId !== null) {
        violations.push({ falsifier: 'LA30-F7', detail: `sub-artifact ${point.id} inflated Dark Field density` });
      }
      if (artifact.privacyClass === 'withheld_third_party') {
        violations.push({ falsifier: 'LA30-F9', detail: `withheld artifact ${point.id} rendered as a point` });
      }
      const expected = expectedArtifactPoint(artifact, viewer);
      if (!expected || expected.kind !== point.kind) {
        violations.push({ falsifier: 'LA30-F2', detail: `artifact ${point.id} rendered with collapsed/incorrect darkness class` });
      }
    }

    if (gap) {
      if (gap.privacyClass === 'withheld_third_party') {
        violations.push({ falsifier: 'LA30-F9', detail: `withheld known gap ${point.id} rendered as a point` });
      }
      const expected = expectedGapPoint(gap, viewer);
      if (!expected || expected.kind !== point.kind) {
        violations.push({ falsifier: 'LA30-F2', detail: `known gap ${point.id} did not remain distinct from artifact/sealed darkness` });
      }
    }
  }

  for (const thread of candidate.threads) {
    if (
      thread.recommended === true
      || thread.score !== undefined
      || thread.rank !== undefined
      || thread.behaviorWeight !== undefined
      || thread.highlightedBecause !== undefined
    ) {
      violations.push({ falsifier: 'LA30-F3', detail: `thread ${thread.id} carries recommendation/ranking metadata` });
    }
    for (const id of thread.artifactIds) {
      const artifact = artifacts.get(id);
      const gap = gaps.get(id);
      if (!artifact && !gap) {
        violations.push({ falsifier: 'LA30-F1', detail: `thread ${thread.id} references uncatalogued record ${id}` });
        continue;
      }
      if (artifact?.privacyClass === 'withheld_third_party' || gap?.privacyClass === 'withheld_third_party') {
        violations.push({ falsifier: 'LA30-F9', detail: `withheld record ${id} leaked through thread adjacency` });
        continue;
      }
      const visible = artifact ? expectedArtifactPoint(artifact, viewer) : expectedGapPoint(gap!, viewer);
      if (!visible) {
        violations.push({ falsifier: 'LA30-F2', detail: `non-visible record ${id} leaked through thread adjacency` });
      }
    }
  }

  if (
    candidate.progressPercent !== undefined
    || candidate.completionBadge !== undefined
    || candidate.completed !== undefined
  ) {
    violations.push({ falsifier: 'LA30-F4', detail: 'completion/progress state exists in the archive journey' });
  }

  if (candidate.aweNarration) {
    violations.push({ falsifier: 'LA30-F5', detail: 'MAIA narrates archive scale/awe instead of letting evidence show it' });
  }

  if (candidate.stayWithField && candidate.abandoned === true) {
    violations.push({ falsifier: 'LA30-F6', detail: 'Stay with the field is treated as abandonment' });
  }

  for (const haze of candidate.haze) {
    if (
      haze.density !== undefined
      || haze.intensity !== undefined
      || haze.estimatedCount !== undefined
      || haze.estimateBasis !== undefined
    ) {
      violations.push({ falsifier: 'LA30-F8', detail: `haze ${haze.locationId} carries quantity-bearing visual metadata` });
    }
  }

  for (const [id, coordinate] of Object.entries(candidate.coordinates)) {
    const artifact = artifacts.get(id);
    const gap = gaps.get(id);
    if (artifact?.privacyClass === 'withheld_third_party' || gap?.privacyClass === 'withheld_third_party') {
      violations.push({ falsifier: 'LA30-F9', detail: `withheld record ${id} leaked through coordinates` });
      continue;
    }
    const dateOrdinal = artifact?.dateOrdinal ?? gap?.dateOrdinal;
    if (dateOrdinal === undefined) {
      violations.push({ falsifier: 'LA30-F1', detail: `coordinate ${id} has no catalogue record` });
      continue;
    }
    const visible = artifact ? expectedArtifactPoint(artifact, viewer) : expectedGapPoint(gap!, viewer);
    if (!visible) {
      violations.push({ falsifier: 'LA30-F2', detail: `non-visible record ${id} leaked through coordinates` });
      continue;
    }
    const expected = coordinateV1(id, dateOrdinal);
    if (!sameCoordinate(coordinate, expected)) {
      violations.push({ falsifier: 'LA30-F11', detail: `coordinate ${id} is not deterministic under coord_v1` });
    }
    const previous = previousCoordinates[id];
    if (previous && !sameCoordinate(previous, coordinate)) {
      violations.push({ falsifier: 'LA30-F11', detail: `coordinate ${id} moved after catalogue growth` });
    }
  }

  if (
    candidate.navigation.transport !== 'client_only'
    || candidate.navigation.networkRequests !== 0
    || candidate.navigation.urlMutation !== null
  ) {
    violations.push({ falsifier: 'LA30-F10', detail: 'thread choice is recoverable from URL/network transport' });
  }

  return violations;
}
