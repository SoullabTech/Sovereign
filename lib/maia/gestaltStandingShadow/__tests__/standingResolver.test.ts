import { admitClaim } from '../admission';
import { projectGestalt } from '../projector';
import { assembleRelationalField } from '../standingResolver';
import type { EvidenceObject, StandingRelation } from '../types';
import {
  SCOPE,
  adoptionRelation,
  correctionRelation,
  evidence,
  relation,
  silverCedarBaseRelations,
  silverCedarEvidence,
} from './fixtures';

const byId = (field: ReturnType<typeof assembleRelationalField>, id: string) =>
  field.standing.find((item) => item.objectId === id)!;

describe('GESTALT-STANDING-SHADOW-01 · F1–F10', () => {
  test('F1 Silver Cedar: established guardian meaning cannot be reopened as unknown', () => {
    const field = assembleRelationalField(
      silverCedarEvidence.slice(0, 6),
      silverCedarBaseRelations.filter((r) => r.id !== 'RI1'),
      { processScope: SCOPE, asOf: '2026-09-16T14:46:59.000Z' },
    );
    expect(byId(field, 'E5').useAs).toBe('established');
    expect(byId(field, 'E6').useAs).toBe('established');
    const projection = projectGestalt(field);
    expect(projection.established).toContain(silverCedarEvidence[4].text);

    const admission = admitClaim({
      id: 'Q1', text: 'What is the guardian image?', speechAct: 'QUESTION',
      objectRefs: ['E5'], relationRefs: ['R5'], reopenedObjectRefs: ['E5'],
    }, field);
    expect(admission.admission).toBe('unadmitted');
    expect(admission.reasonCodes).toContain('question-reopens-established');
  });
  test('F2 repetition laundering: repeated MAIA language does not increase standing', () => {
    const repeats: EvidenceObject[] = [];
    const repeatRelations: StandingRelation[] = [];
    for (let i = 0; i < 20; i += 1) {
      const id = `I${i + 20}`;
      repeats.push(evidence(id, 'Silver Cedar represents resilience.', 'maia_interpretation', 'maia', `2026-09-16T15:${String(i).padStart(2, '0')}:00.000Z`));
      repeatRelations.push(relation(`RR${i}`, id, 'RESTATES', 'I1', [id], 'maia', `2026-09-16T15:${String(i).padStart(2, '0')}:01.000Z`));
    }
    const field = assembleRelationalField(
      [...silverCedarEvidence.slice(0, 7), ...repeats],
      [...silverCedarBaseRelations, ...repeatRelations],
      { processScope: SCOPE },
    );
    expect(byId(field, 'I1').useAs).toBe('provisional');
    expect(byId(field, 'I1').origin).toBe('maia');
  });

  test('F3 adoption changes usability without rewriting MAIA authorship', () => {
    const field = assembleRelationalField(
      silverCedarEvidence.slice(0, 8),
      [...silverCedarBaseRelations, adoptionRelation],
      { processScope: SCOPE, asOf: '2026-09-16T14:48:10.000Z' },
    );
    expect(byId(field, 'I1').useAs).toBe('adopted');
    expect(byId(field, 'I1').origin).toBe('maia');
    expect(byId(field, 'I1').governingRelationIds).toContain('RA1');
  });

  test('F4 correction immediately removes current governing use while preserving history', () => {
    const field = assembleRelationalField(
      silverCedarEvidence,
      [...silverCedarBaseRelations, adoptionRelation, correctionRelation],
      { processScope: SCOPE },
    );
    expect(byId(field, 'I1').useAs).toBe('historical_only');
    expect(projectGestalt(field).historicalOnly).toContain('Silver Cedar represents resilience.');
    const claim = admitClaim({
      id: 'C4', text: 'Silver Cedar represents resilience.', speechAct: 'GROUNDED',
      objectRefs: ['I1'], relationRefs: ['RI1'],
    }, field);
    expect(claim.admission).toBe('unadmitted');
  });
  test('F5 contradiction remains unresolved rather than collapsing to a hidden truth', () => {
    const e = [
      evidence('C1', 'I know I should leave.', 'member_statement', 'member', '2026-09-16T16:00:00.000Z', 'choice-process'),
      evidence('C2', 'I still love him.', 'member_statement', 'member', '2026-09-16T16:01:00.000Z', 'choice-process'),
      evidence('C3', 'My body panics when I imagine leaving.', 'member_statement', 'member', '2026-09-16T16:02:00.000Z', 'choice-process'),
      evidence('C4', 'I want my life back.', 'member_statement', 'member', '2026-09-16T16:03:00.000Z', 'choice-process'),
      evidence('H1', 'Deep down, leaving is the single truth.', 'maia_interpretation', 'maia', '2026-09-16T16:04:00.000Z', 'choice-process'),
    ];
    const r = [
      relation('CT1', 'C2', 'CONTESTS', 'C1', ['C1', 'C2'], 'member', '2026-09-16T16:01:30.000Z', 'choice-process'),
      relation('CT2', 'C1', 'CONTESTS', 'C2', ['C1', 'C2'], 'member', '2026-09-16T16:01:31.000Z', 'choice-process'),
      relation('HI1', 'H1', 'INTERPRETS', 'C1', ['C1', 'C2', 'C3', 'C4'], 'maia', '2026-09-16T16:04:05.000Z', 'choice-process'),
    ];
    const field = assembleRelationalField(e, r, { processScope: 'choice-process' });
    expect(byId(field, 'C1').useAs).toBe('unresolved');
    expect(byId(field, 'C2').useAs).toBe('unresolved');
    expect(byId(field, 'H1').useAs).toBe('provisional');
  });

  test('F6 developmental return preserves resemblance and changed present evidence', () => {
    const e = [
      evidence('D1', 'Earlier I was afraid to speak because I expected misunderstanding.', 'member_statement', 'member', '2026-06-01T12:00:00.000Z', 'voice-process'),
      evidence('D2', 'I still feel uncertainty, but I am willing to speak directly now.', 'member_statement', 'member', '2026-09-16T12:00:00.000Z', 'voice-process'),
    ];
    const r = [relation('DR1', 'D2', 'RETURNS_TO', 'D1', ['D1', 'D2'], 'maia', '2026-09-16T12:00:05.000Z', 'voice-process')];
    const field = assembleRelationalField(e, r, { processScope: 'voice-process' });
    expect(byId(field, 'D1').useAs).toBe('established');
    expect(byId(field, 'D2').useAs).toBe('established');
    expect(field.relations.map((x) => x.id)).toContain('DR1');
    expect(byId(field, 'D2').currentScope).toBe('voice-process');
  });
  test('F7 present member self-report can supersede a historical pattern', () => {
    const e = [
      evidence('P1', 'I usually withdraw when I expect misunderstanding.', 'member_statement', 'member', '2026-06-01T12:00:00.000Z', 'voice-process'),
      evidence('P2', 'Today I am choosing to speak directly.', 'member_statement', 'member', '2026-09-16T12:00:00.000Z', 'voice-process'),
    ];
    const r = [relation('PS1', 'P2', 'SUPERSEDES', 'P1', ['P2'], 'member', '2026-09-16T12:00:01.000Z', 'voice-process')];
    const field = assembleRelationalField(e, r, { processScope: 'voice-process' });
    expect(byId(field, 'P1').useAs).toBe('historical_only');
    expect(byId(field, 'P2').useAs).toBe('established');
  });

  test('F8 every MAIA-derived object needs descent or becomes inadmissible', () => {
    const ungrounded = evidence('U1', 'This means the member needs protection.', 'maia_interpretation', 'maia', '2026-09-16T17:00:00.000Z');
    const field = assembleRelationalField(
      [...silverCedarEvidence.slice(0, 7), ungrounded],
      silverCedarBaseRelations,
      { processScope: SCOPE },
    );
    expect(byId(field, 'U1').useAs).toBe('inadmissible');
    expect(byId(field, 'I1').useAs).toBe('provisional');
    expect(byId(field, 'I1').evidencePath).toEqual(expect.arrayContaining(['E2', 'E3', 'E4']));
  });

  test('F9 process-scoped interpretation does not silently become person ontology', () => {
    const scoped = evidence('S1', 'This process appears tense.', 'maia_observation', 'maia', '2026-09-16T18:00:00.000Z', 'process-A');
    const base = evidence('S0', 'I feel tension in this conversation.', 'member_statement', 'member', '2026-09-16T17:59:00.000Z', 'process-A');
    const r = [relation('SG1', 'S1', 'INTERPRETS', 'S0', ['S0'], 'maia', '2026-09-16T18:00:01.000Z', 'process-A')];
    const other = assembleRelationalField([base, scoped], r, { processScope: 'process-B' });
    expect(other.evidence).toHaveLength(0);
    const correct = assembleRelationalField([base, scoped], r, { processScope: 'process-A' });
    expect(byId(correct, 'S1').currentScope).toBe('process-A');
  });
  test('F10 graph centrality / support density cannot raise MAIA authority', () => {
    const supportEvidence: EvidenceObject[] = [];
    const supportRelations: StandingRelation[] = [];
    for (let i = 0; i < 25; i += 1) {
      const id = `Z${i}`;
      supportEvidence.push(evidence(id, `MAIA support echo ${i}`, 'maia_observation', 'maia', `2026-09-16T19:${String(i).padStart(2, '0')}:00.000Z`));
      supportRelations.push(relation(`ZS${i}`, id, 'SUPPORTS', 'I1', [id], 'maia', `2026-09-16T19:${String(i).padStart(2, '0')}:01.000Z`));
    }
    const field = assembleRelationalField(
      [...silverCedarEvidence.slice(0, 7), ...supportEvidence],
      [...silverCedarBaseRelations, ...supportRelations],
      { processScope: SCOPE },
    );
    expect(byId(field, 'I1').useAs).toBe('provisional');
    expect(byId(field, 'I1').origin).toBe('maia');
  });
});
