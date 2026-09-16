import { createHash } from 'node:crypto';
import {
  PRODUCER_REGISTRY,
  renderTurnForCognition,
  type CanonicalTurn,
  type ProducerId,
  type TierStrategy,
} from '../../../lib/maia/canonical-turn';
import { digest } from '../../../lib/memory/provenance/turnMemoryProvenance';

export class StandingProjectionRefused extends Error {
  constructor(readonly code: string, detail?: string) {
    super(`Standing projection refused: ${code}${detail ? ` — ${detail}` : ''}`);
    this.name = 'StandingProjectionRefused';
  }
}

type Axes = {
  readonly authoredBy: CanonicalTurn['participation']['admitted'][number]['authoredBy'];
  readonly participationClass: CanonicalTurn['participation']['admitted'][number]['participationClass'];
  readonly authority: CanonicalTurn['participation']['admitted'][number]['authority'];
};

interface StandingProjectionBase extends Axes {
  readonly evidenceId: string;
  readonly text: string;
  readonly blockDigest: string;
  readonly claimStanding: {
    readonly state: 'unavailable';
    readonly reason: 'not_carried_by_canonical_turn';
  };
}

export type StandingProjectionEntry =
  | (StandingProjectionBase & {
      readonly kind: 'encounter_input';
      readonly source: 'CanonicalTurn.encounter.input';
    })
  | (StandingProjectionBase & {
      readonly kind: 'participant';
      readonly producerId: ProducerId;
      readonly itemCount?: number;
    });

export interface StandingProjection {
  readonly programme: 'JARVIS-MAIA-STANDING-SHADOW-01';
  readonly turnId: string;
  readonly roomKind: string;
  readonly inputDigest: string;
  readonly inputEvidenceId: string;
  readonly producerRegistryVersion: string;
  readonly participantOrder: readonly ProducerId[];
  readonly entries: readonly StandingProjectionEntry[];
  readonly projectionDigest: string;
}

function mustDigest(text: string): string {
  return digest(text) ?? createHash('sha256').update(text).digest('hex');
}

export function assertProjectableProducer(id: ProducerId): void {
  const spec = PRODUCER_REGISTRY[id];
  if (!spec) throw new StandingProjectionRefused('unregistered_producer', id);
  if ('partitionPending' in spec && spec.partitionPending) {
    throw new StandingProjectionRefused('partition_pending', id);
  }
}

export function projectStandingTurn(turn: CanonicalTurn, strategy: TierStrategy): StandingProjection {
  if (!Object.isFrozen(turn)) throw new StandingProjectionRefused('turn_not_frozen');
  if (turn.encounter.room.kind !== 'writers_studio') {
    throw new StandingProjectionRefused('wrong_room', turn.encounter.room.kind);
  }

  const current = renderTurnForCognition(turn, strategy);
  const admittedById = new Map(turn.participation.admitted.map((p) => [p.producerId, p] as const));
  if (admittedById.size !== turn.participation.admitted.length) {
    throw new StandingProjectionRefused('duplicate_producer');
  }

  const inputDigest = mustDigest(turn.encounter.input);
  const inputEvidenceId = `I:${turn.turnId}:${inputDigest.slice(0, 16)}`;
  const inputEntry: StandingProjectionEntry = {
    kind: 'encounter_input',
    source: 'CanonicalTurn.encounter.input',
    evidenceId: inputEvidenceId,
    text: turn.encounter.input,
    authoredBy: 'member',
    participationClass: 'authored',
    authority: 'situate',
    blockDigest: inputDigest,
    claimStanding: { state: 'unavailable', reason: 'not_carried_by_canonical_turn' },
  };

  const participantEntries: StandingProjectionEntry[] = current.participantOrder.map((rawId) => {
    const id = rawId as ProducerId;
    assertProjectableProducer(id);
    const p = admittedById.get(id);
    if (!p) throw new StandingProjectionRefused('renderer_participant_missing', id);
    const spec = PRODUCER_REGISTRY[id];
    if (
      p.authoredBy !== spec.authoredBy ||
      p.participationClass !== spec.participationClass ||
      p.authority !== spec.authority
    ) {
      throw new StandingProjectionRefused('registry_axis_mismatch', id);
    }

    const blockDigest = mustDigest(p.text);
    const manifestRow = turn.manifest.admitted.find((row) => row.producerId === id && row.reason !== 'mandatory_floor');
    if (!manifestRow) throw new StandingProjectionRefused('manifest_row_missing', id);
    if (
      manifestRow.authoredBy !== p.authoredBy ||
      manifestRow.participationClass !== p.participationClass ||
      manifestRow.authority !== p.authority ||
      manifestRow.blockDigest !== blockDigest
    ) {
      throw new StandingProjectionRefused('manifest_mismatch', id);
    }

    return {
      kind: 'participant',
      evidenceId: `P:${id}:${blockDigest.slice(0, 16)}`,
      producerId: id,
      authoredBy: p.authoredBy,
      participationClass: p.participationClass,
      authority: p.authority,
      text: p.text,
      blockDigest,
      ...(p.itemCount !== undefined ? { itemCount: p.itemCount } : {}),
      claimStanding: { state: 'unavailable', reason: 'not_carried_by_canonical_turn' } as const,
    };
  });

  const entries = [inputEntry, ...participantEntries];
  const projectionMaterial = entries.map((e) =>
    `${e.evidenceId}:${e.authoredBy}/${e.participationClass}/${e.authority}:${e.blockDigest}`,
  ).join('|');

  return Object.freeze({
    programme: 'JARVIS-MAIA-STANDING-SHADOW-01' as const,
    turnId: turn.turnId,
    roomKind: turn.encounter.room.kind,
    inputDigest,
    inputEvidenceId,
    producerRegistryVersion: turn.manifest.producerRegistryVersion,
    participantOrder: Object.freeze(participantEntries.map((e) => (e as Extract<StandingProjectionEntry, { kind: 'participant' }>).producerId)),
    entries: Object.freeze(entries),
    projectionDigest: mustDigest(projectionMaterial),
  });
}

export function renderStandingProjectionForModel(
  turn: CanonicalTurn,
  strategy: TierStrategy,
  projection: StandingProjection,
): string {
  if (projection.turnId !== turn.turnId) throw new StandingProjectionRefused('turn_projection_mismatch');
  const first = turn.floor.blocks.filter((b) => b.position === 'first').map((b) => b.text);
  const last = turn.floor.blocks.filter((b) => b.position === 'last').map((b) => b.text);
  if (first.length === 0 || last.length === 0) throw new StandingProjectionRefused('floor_missing');

  const evidenceBlocks = projection.entries.map((e) => {
    if (e.kind === 'encounter_input') {
      return [
        `[SHADOW EVIDENCE ${e.evidenceId}]`,
        'source: current member utterance (CanonicalTurn.encounter.input)',
        'authoredBy: member',
        'participationClass: authored',
        'authority: situate',
        'claimStanding: unavailable (CanonicalTurn does not establish current/superseded claim status)',
        'content: supplied exactly once as the user message; do not ask for it to be repeated',
      ].join('\n');
    }
    return [
      `[SHADOW EVIDENCE ${e.evidenceId}]`,
      `producer: ${e.producerId}`,
      `authoredBy: ${e.authoredBy}`,
      `participationClass: ${e.participationClass}`,
      `authority: ${e.authority}`,
      'claimStanding: unavailable (CanonicalTurn does not establish current/superseded claim status)',
      'content:',
      e.text,
    ].join('\n');
  });

  const shadowContract = `STANDING SHADOW — RESEARCH OUTPUT CONTRACT\nYou may synthesize freely from the evidence below. Source-standing fields are substrate-owned facts, not suggestions. The current user message is member-authored evidence and has its own evidence id; cite that id when your synthesis depends on what the writer is saying now. Do not substitute older history for the present utterance. Do not infer current/superseded claim standing when it is marked unavailable.\nReturn ONLY the schema-constrained JSON plan requested by the caller.\nYour synthesis text is inserted AFTER the deterministic phrase \"One possibility I see — provisionally:\". Therefore synthesis text must NOT contain I/me/my/mine/myself; write the proposition itself. The final question is rendered directly to the writer; ask it without I/me/my. Do not call the writer \"the member\". Every synthesis item must cite at least one support evidence id.\nRules: preserve explicit correction, rejection, partial adoption and unresolved contradiction in the current member utterance; never make an older MAIA interpretation harder for the writer to overturn.`;

  return [
    ...first,
    ...(strategy.scaffold ? [strategy.scaffold] : []),
    shadowContract,
    ...evidenceBlocks,
    ...(strategy.repairInstruction ? [strategy.repairInstruction] : []),
    ...last,
  ].filter((s) => s && s.trim()).join('\n\n');
}
