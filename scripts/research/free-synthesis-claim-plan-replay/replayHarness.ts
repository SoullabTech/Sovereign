import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { compileClaimPlan } from '../../../lib/maia/prospectiveClaimPlan/claimPlan';
import { renderClaimPlan } from '../../../lib/maia/prospectiveClaimPlan/renderer';
import { auditRenderedRoundTrip } from '../../../lib/maia/prospectiveClaimPlan/roundTrip';
import { bindGestureToPlan } from '../../../lib/maia/prospectiveClaimPlan/gestureBinding';
import { assembleRelationalField } from '../../../lib/maia/gestaltStandingShadow/standingResolver';
import type { ClaimDraft, ClaimPlan } from '../../../lib/maia/prospectiveClaimPlan/types';
import { FIXTURES, type Fixture } from './fixtures';

const MODEL = 'claude-sonnet-4-6';
const TEMPERATURE = 0.65;
const MAX_TOKENS = 2048;
const REPEATS = 2;
const FILTER_IDS = new Set((process.env.REPLAY_FIXTURES || '').split(',').map(s => s.trim()).filter(Boolean));
const ACTIVE_FIXTURES = FILTER_IDS.size ? FIXTURES.filter(f => FILTER_IDS.has(f.id)) : FIXTURES;
const HOST = 'soullab@minisforum';
const REMOTE_HELPER = '/tmp/free-synthesis-claim-plan-replay.js';
const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

const remoteCode = String.raw`const mod=require('/app/node_modules/@anthropic-ai/sdk'); const Anthropic=mod.default||mod;
let b=''; process.stdin.setEncoding('utf8'); process.stdin.on('data',c=>b+=c);
process.stdin.on('end',async()=>{const r=JSON.parse(b); const c=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY});
const m=await c.messages.create({model:r.model,max_tokens:r.maxTokens,temperature:r.temperature,system:r.systemPrompt,messages:[{role:'user',content:r.userInput}]});
const text=m.content.filter(x=>x.type==='text').map(x=>x.text).join(''); process.stdout.write(JSON.stringify({text,model:m.model,usage:m.usage}));});`;
function ssh(command: string, input?: string) {
  const p = spawnSync('ssh', [HOST, command], { input, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 120000 });
  if (p.status !== 0) throw new Error(`ssh-failed:${p.status}:${(p.stderr || '').slice(0,300)}`);
  return p.stdout;
}

function installRemoteHelper() {
  ssh(`docker exec -i maia-sovereign sh -c "cat > ${REMOTE_HELPER}"`, remoteCode);
}
function removeRemoteHelper() {
  try { ssh(`docker exec maia-sovereign rm -f ${REMOTE_HELPER}`); } catch {}
}

function systemPrompt(): string {
  return `You are proposing a STRUCTURED CLAIM PLAN for an offline MAIA research harness. Return JSON only: {"claims":[...]}.
Each claim must have: localId (unique short string), proposition, surfaceText, speechAct (GROUNDED|CANDIDATE|QUESTION), standing (established|adopted|system_fact|historical_only|provisional|open), evidenceRefs, relationRefs, targetLocalIds, and questionIntent when QUESTION (open_edge|confirm|clarify|reopen).
Rules: GROUNDED current claims may use established/adopted/system_fact only and must cite evidenceRefs. A GROUNDED historical report may use historical_only only to mention superseded/corrected material as history, never as present truth. New interpretation must be CANDIDATE + provisional and surfaceText must visibly begin with I wonder, Perhaps, Maybe, One possibility is, It may be, Could it be, or I suspect. QUESTION must be open. A confirm QUESTION must target exactly one CANDIDATE by targetLocalIds using that candidate's localId. Never invent evidence or relation ids. Never reopen established meaning. Preserve unresolved contradiction. If no antecedent is resolved, cite the provided system_fact and ask a clarify question; do not invent an antecedent. Each surfaceText must be exactly one atomic sentence.`;
}

function userPrompt(f: Fixture, repairErrors?: string[]): string {
  const evidenceIds = f.evidence.map(e => e.id);
  return `FIXTURE ${f.id}\nRELATIONAL GESTALT:\n${f.gestalt}\n\nCURRENT MEMBER TURN:\n${f.memberTurn}\n\nALLOWED EVIDENCE IDS: ${JSON.stringify(evidenceIds)}\nALLOWED RELATION IDS: ${JSON.stringify(f.allowedRelations)}\n${repairErrors ? `\nPRIOR PLAN WAS REJECTED BY DETERMINISTIC CHECKS: ${JSON.stringify(repairErrors)}\nRepair only those defects; do not relax constraints.` : ''}`;
}

function callProductionModel(f: Fixture, repairErrors?: string[]) {
  const req = JSON.stringify({ model: MODEL, temperature: TEMPERATURE, maxTokens: MAX_TOKENS, systemPrompt: systemPrompt(), userInput: userPrompt(f, repairErrors) });
  const out = ssh(`docker exec -i maia-sovereign node ${REMOTE_HELPER}`, req);
  return JSON.parse(out.trim()) as { text: string; model: string; usage?: unknown };
}
function parseClaims(text: string): ClaimDraft[] {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const parsed = JSON.parse(trimmed) as { claims?: ClaimDraft[] };
  if (!Array.isArray(parsed.claims)) throw new Error('claims-array-missing');
  return parsed.claims;
}

function validateProposal(f: Fixture, claims: ClaimDraft[], planId: string) {
  const errors: string[] = [];
  const evidenceIds = new Set(f.evidence.map(e => e.id));
  const relationIds = new Set(f.allowedRelations);
  for (const claim of claims) {
    for (const id of claim.evidenceRefs ?? []) if (!evidenceIds.has(id)) errors.push(`unknown-evidence:${id}`);
    for (const id of claim.relationRefs ?? []) if (!relationIds.has(id)) errors.push(`unknown-relation:${id}`);
  }

  const field = assembleRelationalField(f.evidence, f.standingRelations, { processScope: 'fixture' });
  const standing = new Map(field.standing.map(s => [s.objectId, s.useAs]));
  let plan: ClaimPlan | null = null;
  try { plan = compileClaimPlan(planId, claims); } catch (e) { errors.push(`compile:${e instanceof Error ? e.message : String(e)}`); }
  if (!plan) return { accepted: false, errors: [...new Set(errors)], plan: null, roundTrip: null, gestures: null };

  for (const claim of plan.claims) {
    if (claim.speechAct === 'GROUNDED') {
      if (f.forbidGrounded) errors.push('grounded-forbidden');
      if (claim.standing === 'historical_only') {
        let hasHistorical = false;
        for (const id of claim.evidenceRefs) {
          const useAs = standing.get(id);
          if (useAs === 'historical_only') hasHistorical = true;
          if (useAs !== 'established' && useAs !== 'adopted' && useAs !== 'historical_only') {
            errors.push(`historical-evidence-standing:${id}:${useAs ?? 'missing'}`);
          }
        }
        if (!hasHistorical) errors.push('historical-grounding-requires-historical-evidence');
      } else {
        for (const id of claim.evidenceRefs) {
          const useAs = standing.get(id);
          if (useAs !== 'established' && useAs !== 'adopted') errors.push(`grounded-evidence-standing:${id}:${useAs ?? 'missing'}`);
        }
        for (const id of f.forbiddenGroundedEvidence ?? []) {
          if (claim.evidenceRefs.includes(id)) errors.push(`forbidden-grounded-evidence:${id}`);
        }
      }
    }
  }
  for (const id of f.requiredEvidenceRefs ?? []) {
    const found = plan.claims.some(c => c.speechAct === 'GROUNDED' && c.evidenceRefs.includes(id));
    if (!found) errors.push(`required-grounded-evidence-missing:${id}`);
  }
  for (const id of f.requiredHistoricalEvidenceRefs ?? []) {
    const found = plan.claims.some(c => c.speechAct === 'GROUNDED' && c.standing === 'historical_only' && c.evidenceRefs.includes(id));
    if (!found) errors.push(`required-historical-evidence-missing:${id}`);
  }
  if (f.requiredQuestionIntent) {
    const q = plan.claims.find(c => c.speechAct === 'QUESTION' && c.questionIntent === f.requiredQuestionIntent);
    if (!q) errors.push(`required-question-intent-missing:${f.requiredQuestionIntent}`);
    if (f.requiredQuestionIntent === 'confirm' && q) {
      const target = q.targetClaimIds.length === 1 ? plan.claims.find(c => c.claimId === q.targetClaimIds[0]) : undefined;
      if (!target || target.speechAct !== 'CANDIDATE') errors.push('confirm-question-must-target-candidate');
    }
  }
  if (plan.claims.some(c => c.questionIntent === 'reopen')) errors.push('reopen-not-admitted');

  const rendered = renderClaimPlan(plan);
  const roundTrip = auditRenderedRoundTrip(plan, rendered);
  if (!roundTrip.ok) errors.push(`roundtrip:${roundTrip.reason}`);

  let gestures: unknown = null;
  const confirmQuestion = plan.claims.find(c => c.speechAct === 'QUESTION' && c.questionIntent === 'confirm');
  if (confirmQuestion) {
    const yes = bindGestureToPlan('that is exactly it. MAIA!', plan);
    const no = bindGestureToPlan("no, that's not it", plan);
    const expected = confirmQuestion.targetClaimIds[0];
    if (yes.targetClaimId !== expected) errors.push('adoption-target-mismatch');
    if (no.targetClaimId !== expected) errors.push('correction-target-mismatch');
    gestures = { adoption: yes, correction: no };
  }

  return { accepted: errors.length === 0, errors: [...new Set(errors)], plan, roundTrip, gestures };
}

function structuralPlan(plan: ClaimPlan | null) {
  return plan ? plan.claims.map(c => ({ claimId: c.claimId, localId: c.localId ?? null, speechAct: c.speechAct, standing: c.standing, evidenceRefs: c.evidenceRefs, relationRefs: c.relationRefs, questionIntent: c.questionIntent ?? null, targetClaimIds: c.targetClaimIds, targetLocalIds: c.targetLocalIds ?? [] })) : null;
}
async function main() {
  installRemoteHelper();
  const rows: any[] = [];
  const rawRows: any[] = [];
  try {
    for (const f of ACTIVE_FIXTURES) {
      for (let run = 1; run <= REPEATS; run += 1) {
        const first = callProductionModel(f);
        let firstClaims: ClaimDraft[] = [];
        let firstValidation: ReturnType<typeof validateProposal>;
        try {
          firstClaims = parseClaims(first.text);
          firstValidation = validateProposal(f, firstClaims, `${f.id}:run${run}:first`);
        } catch (e) {
          firstValidation = { accepted: false, errors: [`parse:${e instanceof Error ? e.message : String(e)}`], plan: null, roundTrip: null, gestures: null };
        }

        let repair: any = null;
        let finalValidation = firstValidation;
        if (!firstValidation.accepted) {
          const repaired = callProductionModel(f, firstValidation.errors);
          let repairedClaims: ClaimDraft[] = [];
          try {
            repairedClaims = parseClaims(repaired.text);
            finalValidation = validateProposal(f, repairedClaims, `${f.id}:run${run}:repair`);
          } catch (e) {
            finalValidation = { accepted: false, errors: [`parse:${e instanceof Error ? e.message : String(e)}`], plan: null, roundTrip: null, gestures: null };
          }
          repair = { rawHash: sha(repaired.text), model: repaired.model, accepted: finalValidation.accepted, errors: finalValidation.errors, plan: structuralPlan(finalValidation.plan), gestures: finalValidation.gestures };
          rawRows.push({ fixture: f.id, run, stage: 'repair', text: repaired.text });
        }

        rows.push({ fixture: f.id, run, first: { rawHash: sha(first.text), model: first.model, accepted: firstValidation.accepted, errors: firstValidation.errors, plan: structuralPlan(firstValidation.plan), gestures: firstValidation.gestures }, repair, finalAccepted: finalValidation.accepted, finalErrors: finalValidation.errors });
        rawRows.push({ fixture: f.id, run, stage: 'first', text: first.text });
      }
    }
  } finally { removeRemoteHelper(); }

  const total = rows.length;
  const firstValid = rows.filter(r => r.first.accepted).length;
  const repaired = rows.filter(r => !r.first.accepted && r.repair?.accepted).length;
  const finalValid = rows.filter(r => r.finalAccepted).length;
  const errorCounts: Record<string, number> = {};
  for (const r of rows) for (const e of r.finalErrors) errorCounts[e] = (errorCounts[e] ?? 0) + 1;
  const byFixture = Object.fromEntries(ACTIVE_FIXTURES.map(f => {
    const rs = rows.filter(r => r.fixture === f.id);
    return [f.id, { runs: rs.length, firstValid: rs.filter(r => r.first.accepted).length, finalValid: rs.filter(r => r.finalAccepted).length }];
  }));
  const finalStage = (r: any) => r.repair?.accepted ? r.repair : r.first;
  const f2 = rows.filter(r => r.fixture === 'F2_CANDIDATE_DISCIPLINE' && r.finalAccepted).map(finalStage);
  const correctionAdoptionPass = f2.filter((s: any) => s.gestures?.adoption?.outcome === 'BOUND' && s.gestures?.correction?.outcome === 'BOUND' && s.gestures.adoption.targetClaimId === s.gestures.correction.targetClaimId).length;

  const evidence = {
    schema: 'FREE_SYNTHESIS_CLAIM_PLAN_REPLAY_V1',
    authority: 'offline replay only; model proposals untrusted; deterministic compiler/standing/renderer govern',
    productionEquivalent: { provider: 'anthropic', model: MODEL, temperature: TEMPERATURE, maxTokens: MAX_TOKENS, productionCommit: 'bfdc06f71' },
    promptTemplateHash: sha(systemPrompt()), fixtureHashes: Object.fromEntries(ACTIVE_FIXTURES.map(f => [f.id, sha(JSON.stringify(f))])),
    totalRuns: total, firstPassValid: firstValid, firstPassYield: firstValid / total,
    repairedToValid: repaired, finalValid, finalYield: finalValid / total,
    byFixture,
    measured: {
      continuityPreservation: byFixture.F1_SILVER_CEDAR_CONTINUITY,
      candidateDiscipline: byFixture.F2_CANDIDATE_DISCIPLINE,
      correctionHandling: byFixture.F3_MEMBER_CORRECTION,
      contradictionPreservation: byFixture.F4_CONTRADICTION_PRESERVATION,
      opaqueReferenceAbstention: byFixture.F5_OPAQUE_REFERENCE,
      correctionAdoptionRoundTripPasses: correctionAdoptionPass,
    },
    finalFailureModes: errorCounts,
    rows,
  };

  const outName = FILTER_IDS.size ? 'R5B_FOCUSED_REPLAY_EVIDENCE_2026-09-16.json' : 'R2-R6_REPLAY_EVIDENCE_2026-09-16.json';
  const out = path.join(process.cwd(), 'docs/programme/evidence/free-synthesis-claim-plan-replay', outName);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(evidence, null, 2) + '\n');
  fs.writeFileSync('/private/tmp/free-synthesis-claim-plan-replay-raw.json', JSON.stringify(rawRows, null, 2) + '\n');
  console.log(JSON.stringify({ totalRuns: total, firstValid, repaired, finalValid, byFixture, correctionAdoptionPass, finalFailureModes: errorCounts }, null, 2));
}

main().catch(error => { removeRemoteHelper(); console.error(error); process.exit(1); });
