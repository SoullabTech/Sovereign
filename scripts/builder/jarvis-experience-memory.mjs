#!/usr/bin/env node
/**
 * JARVIS JSL-01 — Experience Memory
 * ═══════════════════════════════════════════════════════════════════════════
 * JSL-00 gives one Work Unit a trace of what was believed, tried and observed.
 * That is worth very little while it stays filed under the Work Unit that
 * produced it: the expensive failure is not forgetting within a run, it is
 * re-entering a known dead end in the NEXT run, under a new id, with a fresh
 * context, at full cost.
 *
 * This module is the retrieval side. It answers exactly one question, across
 * every trace on disk:
 *
 *     "We have been here before. Here is what happened, and here is what
 *      did NOT work."
 *
 * ── DETERMINISTIC BY CONSTRUCTION ───────────────────────────────────────────
 * Scoring is literal token overlap over recorded fields. No embeddings, no
 * vector store, no LLM-in-the-retrieval-path — the same rule jarvis-context.mjs
 * holds for context selection, for the same reason: a retrieval layer that is
 * itself a model is a retrieval layer whose mistakes cannot be audited. Every
 * hit below can be re-derived by hand from the trace files.
 *
 * ── WHAT THIS DOES NOT DO ───────────────────────────────────────────────────
 * It does not conclude, rank by "confidence", or synthesize a lesson. It
 * returns prior experience with its grounding attached and lets the reader —
 * agent or human — do the inferring. The one place it comes close to a
 * judgement is `promotion-candidate`, and that is deliberately built as a GATE
 * rather than a writer:
 *
 *     it PROPOSES a claim to epistemic-guard.mjs; it never records one.
 *
 * It will propose at most HEURISTIC ("check X early because it has failed
 * before" — already in the guard's vocabulary, already lateral, so it can never
 * silently climb toward INVARIANT). Anything stronger than that is a status the
 * guard adjudicates and a human rules on. Automate the work, never the authority.
 *
 * CLI
 *   jarvis-experience-memory.mjs query               [--symptom s] [--subsystem s] [--strategy s] [--limit n] [--json]
 *   jarvis-experience-memory.mjs strategy            <strategy> [--json]
 *   jarvis-experience-memory.mjs promotion-candidate <strategy> [--json]
 */

import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { TRACES_DIR, loadTrace } from './jarvis-learning-trace.mjs';

/** Minimum independent VERIFIED refutations before a failure may be proposed as a HEURISTIC. */
export const HEURISTIC_THRESHOLD = 2;

const STOP = new Set(['the','a','an','of','to','in','on','is','it','was','and','or','for','with','that','this','at','by','be','not','no']);

export const tokenize = (s) =>
  String(s ?? '').toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !STOP.has(t));

/** Every trace on disk, flattened. Bounded only by what exists; callers page with --limit. */
export function allTraces() {
  const dir = TRACES_DIR();
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.jsonl'))
    .map((f) => ({ work_unit_id: path.basename(f, '.jsonl'), entries: loadTrace(path.basename(f, '.jsonl')) }))
    .filter((t) => t.entries.length);
}

/**
 * Overlap score for one entry against a query. Fields are weighted by how
 * specifically they identify a recurrence: a matching symptom is a much stronger
 * signal of "same situation" than a word shared with a free-text statement.
 */
const FIELD_WEIGHTS = { symptom: 4, strategy: 3, subsystem: 2, statement: 1 };

export function scoreEntry(entry, query) {
  let score = 0;
  const matched = [];
  for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
    const q = tokenize(query[field]);
    if (!q.length) continue;
    const e = new Set(tokenize(entry[field]));
    const hits = q.filter((t) => e.has(t)).length;
    if (hits) { score += weight * hits; matched.push(`${field}:${hits}`); }
  }
  return { score, matched };
}

/**
 * Retrieve prior experience. Results are grouped by Work Unit, because "we tried
 * this before" is a fact about an episode, not about a line.
 */
export function query({ symptom, subsystem, strategy, statement, limit = 10 } = {}) {
  const q = { symptom, subsystem, strategy, statement };
  if (!Object.values(q).some((v) => tokenize(v).length)) {
    throw new Error('query: give at least one of --symptom / --subsystem / --strategy / --statement');
  }
  const hits = [];
  for (const t of allTraces()) {
    const scored = t.entries
      .map((e) => ({ entry: e, ...scoreEntry(e, q) }))
      .filter((x) => x.score > 0);
    if (!scored.length) continue;
    scored.sort((a, b) => b.score - a.score);

    // The outcomes of the whole episode, not just the matching lines — a match on a
    // hypothesis is only useful alongside what that episode ultimately found.
    const outcomes = t.entries.filter((e) => e.kind === 'OUTCOME');
    hits.push({
      work_unit_id: t.work_unit_id,
      relevance: scored.reduce((a, x) => a + x.score, 0),
      matched_on: [...new Set(scored.flatMap((x) => x.matched))].sort(),
      best_match: { trace_id: scored[0].entry.trace_id, kind: scored[0].entry.kind, statement: scored[0].entry.statement },
      episode_outcomes: outcomes.map((o) => ({
        trace_id: o.trace_id, outcome: o.outcome, grounding: o.grounding,
        statement: o.statement, strategy: o.strategy ?? null,
      })),
      abandonments: t.entries.filter((e) => e.kind === 'ABANDONMENT').map((e) => e.statement),
      corrections: t.entries.filter((e) => e.kind === 'CORRECTION').map((e) => e.statement),
    });
  }
  // Deterministic total order: relevance, then id — never insertion order, which
  // would make identical queries return different answers across machines.
  hits.sort((a, b) => b.relevance - a.relevance || a.work_unit_id.localeCompare(b.work_unit_id));
  return { query: q, total: hits.length, limit, results: hits.slice(0, limit) };
}

/**
 * The track record of one named strategy across every episode that tried it.
 *
 * VERIFIED and SELF_REPORTED counts are reported SEPARATELY and never summed.
 * That separation is the whole point: an agent that counts its own report of
 * success as evidence of success is an agent that learns itself into confidence.
 * Only `verified_*` may be used to decide anything.
 */
export function strategyRecord(strategy) {
  const key = tokenize(strategy);
  if (!key.length) throw new Error('strategy: name a strategy');
  const episodes = [];
  for (const t of allTraces()) {
    const outcomes = t.entries.filter(
      (e) => e.kind === 'OUTCOME' && key.every((k) => new Set(tokenize(e.strategy)).has(k))
    );
    if (!outcomes.length) continue;
    episodes.push({
      work_unit_id: t.work_unit_id,
      outcomes: outcomes.map((o) => ({
        trace_id: o.trace_id, outcome: o.outcome, grounding: o.grounding,
        statement: o.statement, evidence: o.evidence ?? [], at: o.at,
      })),
    });
  }
  const flat = episodes.flatMap((e) => e.outcomes);
  const v = (o) => flat.filter((x) => x.grounding === 'VERIFIED' && x.outcome === o).length;
  const s = (o) => flat.filter((x) => x.grounding === 'SELF_REPORTED' && x.outcome === o).length;
  return {
    strategy,
    episodes: episodes.length,
    verified_confirmed: v('CONFIRMED'),
    verified_refuted: v('REFUTED'),
    verified_inconclusive: v('INCONCLUSIVE'),
    self_reported_confirmed: s('CONFIRMED'),
    self_reported_refuted: s('REFUTED'),
    self_reported_inconclusive: s('INCONCLUSIVE'),
    detail: episodes,
  };
}

/**
 * Propose — never record — what this strategy's track record could support.
 *
 * The asymmetry here is intentional and is the heart of JSL's epistemics:
 * repeated VERIFIED failure can be proposed as a HEURISTIC (a warning costs
 * little if wrong and is lateral in the guard's ladder), while repeated success
 * is proposed only as a HYPOTHESIS. "It worked the last few times" is not a
 * mechanism, and promoting it toward PROVEN is precisely the move that turns an
 * accumulated model into an ontology.
 *
 * The returned claim is fed to `epistemic-guard.mjs adjudicate`, which applies
 * G1–G5 independently. Self-reported outcomes are carried as evidence kind
 * `worker_claim` — already a WEAK_KIND there — so the guard refuses to let them
 * carry a strong status without JSL needing to re-implement that defence.
 */
export function promotionCandidate(strategy) {
  const rec = strategyRecord(strategy);
  const slug = tokenize(strategy).join('-') || 'strategy';

  // Evidence kinds are carried through EXACTLY as recorded — J5 already guaranteed
  // at write time that each is one the guard can adjudicate, so there is nothing to
  // invent here. A self-reported outcome is relabelled `worker_claim`, which is a
  // WEAK_KIND in the guard: the guard then refuses it a strong status on its own
  // authority, and JSL does not need to re-implement that defence.
  const evidence = rec.detail.flatMap((ep) =>
    ep.outcomes.map((o) => ({
      kind: o.grounding === 'VERIFIED' ? o.evidence[0].kind : 'worker_claim',
      ref: `${ep.work_unit_id}#${o.trace_id}`,
      detail: `${o.outcome} — ${o.statement}`,
    }))
  );

  // The guard reads prior history for HEURISTIC from `incident_refs[]` (or an
  // `incident_record` evidence kind) — not from a count. Each verified refutation
  // is exactly such a prior instance, so it is cited by its own trace address.
  const incidentRefs = rec.detail.flatMap((ep) =>
    ep.outcomes
      .filter((o) => o.grounding === 'VERIFIED' && o.outcome === 'REFUTED')
      .map((o) => `${ep.work_unit_id}#${o.trace_id}`)
  );

  if (rec.verified_refuted >= HEURISTIC_THRESHOLD) {
    return {
      eligible: true, proposed_status: 'HEURISTIC', record: rec,
      why: `${rec.verified_refuted} independent VERIFIED refutations across ${rec.episodes} episode(s)`,
      claim: {
        id: `jsl-heuristic-${slug}`,
        assertion: `'${strategy}' has failed under verification before — check for its known failure early`,
        subject: { kind: 'strategy', ref: strategy },
        status: 'HEURISTIC',
        incident_refs: incidentRefs,
        prior_instances: rec.verified_refuted,
        evidence,
      },
      next: 'adjudicate with epistemic-guard.mjs; record only if PERMITTED',
    };
  }

  if (rec.verified_confirmed > 0) {
    return {
      eligible: true, proposed_status: 'HYPOTHESIS', record: rec,
      why: `${rec.verified_confirmed} verified confirmation(s) — repeated success is not yet a mechanism`,
      claim: {
        id: `jsl-hypothesis-${slug}`,
        assertion: `'${strategy}' may be the effective approach for this class of problem`,
        subject: { kind: 'strategy', ref: strategy },
        status: 'HYPOTHESIS',
        evidence,
      },
      next: 'design a test that discriminates this against a rival explanation before proposing OBSERVATION',
    };
  }

  // The honest empty answer. Silence here is the correct output, not a failure.
  return {
    eligible: false, proposed_status: null, record: rec,
    why: rec.episodes === 0
      ? 'no recorded episode used this strategy'
      : `no VERIFIED outcome (${rec.self_reported_confirmed + rec.self_reported_refuted + rec.self_reported_inconclusive} self-reported outcome(s) do not count)`,
    claim: null,
    next: 'record a VERIFIED outcome — a self-report is not a track record',
  };
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const val = (n) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : undefined; };
  const flag = (n) => argv.includes(n);

  try {
    if (cmd === 'query') {
      const r = query({
        symptom: val('--symptom'), subsystem: val('--subsystem'),
        strategy: val('--strategy'), statement: val('--statement'),
        limit: val('--limit') ? Number(val('--limit')) : 10,
      });
      if (flag('--json')) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }
      if (!r.total) { console.log('no prior experience matches — this appears to be new ground'); process.exit(0); }
      console.log(`${r.total} prior episode(s) match:\n`);
      for (const h of r.results) {
        console.log(`  ${h.work_unit_id}  (relevance ${h.relevance}, matched ${h.matched_on.join(' ')})`);
        console.log(`    best match  ${h.best_match.kind}: ${h.best_match.statement}`);
        for (const o of h.episode_outcomes) console.log(`    outcome     [${o.outcome}/${o.grounding}] ${o.statement}`);
        for (const a of h.abandonments) console.log(`    abandoned   ${a}`);
        for (const c of h.corrections) console.log(`    corrected   ${c}`);
        console.log('');
      }
      process.exit(0);
    }

    if (cmd === 'strategy') {
      const r = strategyRecord(argv[1]);
      if (flag('--json')) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }
      console.log(`strategy '${r.strategy}' — ${r.episodes} episode(s)`);
      console.log(`  VERIFIED       confirmed ${r.verified_confirmed}  refuted ${r.verified_refuted}  inconclusive ${r.verified_inconclusive}`);
      console.log(`  self-reported  confirmed ${r.self_reported_confirmed}  refuted ${r.self_reported_refuted}  inconclusive ${r.self_reported_inconclusive}  (never counted)`);
      process.exit(0);
    }

    if (cmd === 'promotion-candidate') {
      const r = promotionCandidate(argv[1]);
      if (flag('--json')) { console.log(JSON.stringify(r, null, 2)); process.exit(r.eligible ? 0 : 1); }
      console.log(r.eligible
        ? `proposes ${r.proposed_status} — ${r.why}\n  next: ${r.next}`
        : `no claim proposed — ${r.why}\n  next: ${r.next}`);
      process.exit(r.eligible ? 0 : 1);
    }

    console.error('usage: jarvis-experience-memory.mjs {query|strategy|promotion-candidate} [args] [--json]');
    process.exit(2);
  } catch (e) {
    console.error(`🛑 ${e.message}`);
    process.exit(5);
  }
}
