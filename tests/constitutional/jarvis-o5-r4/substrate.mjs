import { createHash } from 'node:crypto';

export function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map((k) => JSON.stringify(k)+':'+stable(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export const digest = (value) => createHash('sha256').update(stable(value)).digest('hex');

export function makeEnvelope() {
  return {
    work_unit: {
      identity: { id: 'wu-r4', objective: 'return evidence' },
      scope: { allowed_paths: ['lane-a/**'], forbidden_paths: ['lane-b/**'] },
      authority: { repository_write: 'worktree', merge: false, deploy: false },
      routing: { primary: 'qwen-local' },
      execution: { attempts: [{ attempt_id: 'a1', status: 'completed' }] },
      evaluation: {
        acceptance_conditions: ['evidence remains evidence'],
        falsification_conditions: ['authority escalation'],
        stop_conditions: ['unknown evidence shape'],
        verifier_results: [], findings: [], proposals: [],
      },
      state: { lifecycle_state: 'EXECUTING', disposition: 'open' },
    },
    guard: { authorized_core_snapshot: 'sealed-core-r4' },
  };
}
export function protectedView(env) {
  const w=env.work_unit;
  return stable({ guard: env.guard, identity:w.identity, scope:w.scope, authority:w.authority, routing:w.routing, state:w.state,
    evaluation_conditions:{acceptance_conditions:w.evaluation.acceptance_conditions,falsification_conditions:w.evaluation.falsification_conditions,stop_conditions:w.evaluation.stop_conditions},
    execution:w.execution, verifier_results:w.evaluation.verifier_results });
}
export function makeProgramme() { return { o1Candidates: [], o2: { nodes: [] }, o3: { held_authority: [] } }; }

export function makeLaneWorld() {
  return { lanes: { 'lane-a': { inbox: [] }, 'lane-b': { inbox: [] }, 'lane-c': { inbox: [] } } };
}
export function deliverLaneProjection(world, projection) {
  if (!projection || typeof projection.target_lane !== 'string') return;
  const lane = world.lanes[projection.target_lane];
  if (!lane) return;
  lane.inbox.push(projection.evidence);
}
