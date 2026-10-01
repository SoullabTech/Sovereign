import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildReferenceDarkField,
  coordinateV1,
  validateDarkFieldCandidate,
  type ArchiveCatalogue,
  type DarkFieldCandidate,
  type FalsifierId,
} from '../../../lib/livingArchive/referenceModel';

const catalogue: ArchiveCatalogue = {
  artifacts: [
    {
      archiveId: 'LA-ART-001', parentArchiveId: null, privacyClass: 'ordinary',
      pointVisibility: 'public', admissionStage: 'admitted', displayStatus: 'exhibited',
      custodyStatus: 'active', dateOrdinal: 1991,
    },
    {
      archiveId: 'LA-ART-002', parentArchiveId: null, privacyClass: 'sealed_self',
      pointVisibility: 'member', admissionStage: 'admitted', displayStatus: 'private',
      custodyStatus: 'active', dateOrdinal: 1999,
    },
    {
      archiveId: 'LA-ART-003', parentArchiveId: null, privacyClass: 'withheld_third_party',
      pointVisibility: 'none', admissionStage: 'admitted', displayStatus: 'private',
      custodyStatus: 'active', dateOrdinal: 2003,
    },
    {
      archiveId: 'LA-ART-001-A', parentArchiveId: 'LA-ART-001', privacyClass: 'ordinary',
      pointVisibility: 'none', admissionStage: 'admitted', displayStatus: 'eligible',
      custodyStatus: 'active', dateOrdinal: 1991,
    },
  ],
  knownGaps: [
    {
      gapId: 'LA-GAP-001', privacyClass: 'ordinary', pointVisibility: 'public',
      admissionStage: 'admitted', displayStatus: 'exhibited', dateOrdinal: 1995,
    },
    {
      gapId: 'LA-GAP-SEALED', privacyClass: 'sealed_self', pointVisibility: 'member',
      admissionStage: 'admitted', displayStatus: 'private', dateOrdinal: 1997,
    },
  ],
};

const lawful = buildReferenceDarkField(
  catalogue,
  'member',
  [{ id: 'inner-worlds', artifactIds: ['LA-ART-001', 'LA-ART-002', 'LA-ART-003'] }],
  ['box-a'],
);

assert.deepEqual(validateDarkFieldCandidate(lawful, catalogue, 'member'), []);
assert.deepEqual(lawful.points.map((p) => [p.id, p.kind]), [
  ['LA-ART-001', 'artifact'],
  ['LA-ART-002', 'sealed'],
  ['LA-GAP-001', 'known_gap'],
  ['LA-GAP-SEALED', 'sealed'],
]);
assert.deepEqual(lawful.threads[0].artifactIds, ['LA-ART-001', 'LA-ART-002']);

function expectKilled(id: FalsifierId, candidate: DarkFieldCandidate, previous = lawful.coordinates): void {
  const violations = validateDarkFieldCandidate(candidate, catalogue, 'member', previous);
  assert.ok(
    violations.some((violation) => violation.falsifier === id),
    `${id} was not killed; got ${JSON.stringify(violations)}`,
  );
}

// F1 — Decorative scale.
expectKilled('LA30-F1', {
  ...lawful,
  points: [...lawful.points, { id: 'DECORATIVE-STAR', kind: 'artifact' }],
});

// F2 — Collapsed darkness: a sealed point masquerades as an ordinary artifact.
expectKilled('LA30-F2', {
  ...lawful,
  points: lawful.points.map((point) => point.id === 'LA-ART-002' ? { ...point, kind: 'artifact' as const } : point),
});

// F3 — Recommended/ranked thread.
expectKilled('LA30-F3', {
  ...lawful,
  threads: lawful.threads.map((thread) => ({ ...thread, recommended: true, behaviorWeight: 0.91 })),
});

// F4 — Completion pressure.
expectKilled('LA30-F4', { ...lawful, progressPercent: 34, completionBadge: 'Explorer' });

// F5 — Narrated awe.
expectKilled('LA30-F5', { ...lawful, aweNarration: 'Look how vast this archive is.' });

// F6 — Wandering penalized.
expectKilled('LA30-F6', { ...lawful, stayWithField: true, abandoned: true });

// F7 — Granularity inflation: one notebook page becomes a second point.
expectKilled('LA30-F7', {
  ...lawful,
  points: [...lawful.points, { id: 'LA-ART-001-A', kind: 'artifact' }],
  coordinates: { ...lawful.coordinates, 'LA-ART-001-A': coordinateV1('LA-ART-001-A', 1991) },
});
// F7 also kills duplicate rendering of one catalogue object as two points.
expectKilled('LA30-F7', {
  ...lawful,
  points: [...lawful.points, lawful.points[0]],
});

// F8 — Haze performs quantity.
expectKilled('LA30-F8', { ...lawful, haze: [{ locationId: 'box-a', intensity: 0.8, estimatedCount: 400 }] });

// F9 — Shadow disclosure through a thread and coordinate.
expectKilled('LA30-F9', {
  ...lawful,
  threads: [...lawful.threads, { id: 'clinical', artifactIds: ['LA-ART-003'] }],
  coordinates: { ...lawful.coordinates, 'LA-ART-003': coordinateV1('LA-ART-003', 2003) },
});

// F10 — Navigation becomes loggable transport.
expectKilled('LA30-F10', {
  ...lawful,
  navigation: { transport: 'path', networkRequests: 1, urlMutation: '/archive/thread/inner-worlds' },
});

// F11 — Coordinate drift after catalogue growth.
expectKilled('LA30-F11', {
  ...lawful,
  coordinates: {
    ...lawful.coordinates,
    'LA-ART-001': { x: lawful.coordinates['LA-ART-001'].x, y: lawful.coordinates['LA-ART-001'].y + 0.01 },
  },
});

// Anonymous entry is PUBLIC-only: sealed self vanishes, not merely closes.
const anonymous = buildReferenceDarkField(catalogue, 'anonymous');
assert.deepEqual(anonymous.points.map((p) => p.id), ['LA-ART-001', 'LA-GAP-001']);
assert.ok(!anonymous.points.some((p) => p.id === 'LA-GAP-SEALED'), 'anonymous visitors must not see sealed known-gap points');

// Existence leaks count too: an anonymous visitor may not receive a sealed record
// indirectly through thread adjacency or a coordinate with no visible point.
const anonymousLeak = {
  ...anonymous,
  threads: [{ id: 'leaky-thread', artifactIds: ['LA-ART-002'] }],
  coordinates: {
    ...anonymous.coordinates,
    'LA-ART-002': coordinateV1('LA-ART-002', 1999),
  },
};
const anonymousLeakViolations = validateDarkFieldCandidate(anonymousLeak, catalogue, 'anonymous');
assert.ok(anonymousLeakViolations.some((v) => v.falsifier === 'LA30-F2'), 'sealed existence leak must be killed for anonymous entry');

// Catalogue growth cannot move an existing coordinate.
const grown: ArchiveCatalogue = {
  ...catalogue,
  artifacts: [
    ...catalogue.artifacts,
    {
      archiveId: 'LA-ART-004', parentArchiveId: null, privacyClass: 'ordinary' as const,
      pointVisibility: 'public' as const, admissionStage: 'admitted' as const,
      displayStatus: 'exhibited' as const, custodyStatus: 'active' as const, dateOrdinal: 2026,
    },
  ],
};
const grownField = buildReferenceDarkField(grown, 'member');
assert.deepEqual(grownField.coordinates['LA-ART-001'], lawful.coordinates['LA-ART-001']);

// Schema binding: the migration must encode the same authority boundaries rather
// than leaving them as comments in the reference model.
const migration = readFileSync('database/migrations/20261001215400_living_archive_source_vault.sql', 'utf8');
for (const table of [
  'living_archive_catalogue_versions',
  'living_archive_artifacts',
  'living_archive_provenance_claims',
  'living_archive_known_gaps',
  'living_archive_lineage_edges',
]) {
  assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`), `${table} missing`);
}
assert.match(migration, /living_archive_subartifact_not_point/);
assert.match(migration, /living_archive_withheld_no_geometry/);
assert.match(migration, /living_archive_known_gaps_withheld_no_geometry/);
assert.match(migration, /living_archive_known_gaps_sealed_content_closed/);
assert.match(migration, /LA-CATALOGUE-UNIT-v1/);
assert.doesNotMatch(migration, /INSERT\s+INTO\s+living_archive_artifacts/i, 'R1 must not ingest artifacts');
assert.doesNotMatch(migration, /INSERT\s+INTO\s+living_archive_known_gaps/i, 'R1 must not backfill gaps');
assert.doesNotMatch(migration, /REFERENCES\s+library_sources/i, 'Living Archive must not inherit Library authority');
assert.doesNotMatch(migration, /REFERENCES\s+manuscript_source_arrivals/i, 'Living Archive must not inherit Studio custody authority');

console.log('LIVING-ARCHIVE-SOURCE-VAULT-R1: 11/11 falsifiers lethal; layered entry PASS; coordinate growth PASS; schema binding PASS');
