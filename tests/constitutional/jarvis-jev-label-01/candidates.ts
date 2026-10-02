/**
 * JARVIS-JEV-LABEL-01 — defeat candidates. Each replaces EXACTLY ONE decision of STRICT: the
 * smallest competent embodiment of one named error. They are executable counter-implementations,
 * not fixture names. Lethality is DECISION-LEVEL (not implementation-independent): each candidate
 * runs on an identical substrate, so the evidence is that the suite goes red on the named
 * corruption — not that sixteen standalone implementations would all be caught.
 */
import { STRICT, type AdmittedJudgment, type Decisions, type JudgmentTreatment } from './core';
import { cpUpperTwoSided } from './stats';

export interface Candidate {
  id: string;
  named: string;
  error: string;
  decisions: Decisions;
  /** Other falsifiers this candidate necessarily also kills, each with the reason removing it would destroy the model. */
  collateral: Record<string, string>;
}

const mk = (id: string, patch: Partial<Decisions>): Decisions => ({ ...STRICT, ...patch, id });

const treat = (kind: AdmittedJudgment['kind'], over: Partial<Record<AdmittedJudgment['kind'], JudgmentTreatment>>): JudgmentTreatment =>
  over[kind] ?? STRICT.classifyJudgment(kind);

export const CANDIDATES: Candidate[] = [
  {
    id: 'DC-ACCURACY-HEADLINE',
    named: 'LB-F6',
    error: 'gates admissibility on overall agreement with the human label',
    decisions: mk('DC-ACCURACY-HEADLINE', { domainFails: (_q, r) => r.agreement_with_jev === null || r.agreement_with_jev < 0.9 }),
    collateral: {
      'LB-F1': 'its verdict ignores the dangerous-direction bound, so every falsifier whose expected verdict is bound-driven disagrees with it',
      'LB-F4': 'same: LB-F4 asserts a bound-driven NOT_ADMISSIBLE that overall agreement cannot produce',
      'LB-F11': 'same: LB-F11 asserts bound-driven depth verdicts',
      'LB-F13': 'same: LB-F13 asserts a bound-driven NOT_ADMISSIBLE baseline',
    },
  },
  {
    id: 'DC-ABSTAIN-AS-ERROR',
    named: 'LB-F3',
    error: 'counts an abstention as a dangerous error (rewards forced answers)',
    decisions: mk('DC-ABSTAIN-AS-ERROR', { classifyJudgment: (k) => treat(k, { abstain: { inDenominator: true, countsAsError: true, bucket: 'abstain' } }) }),
    collateral: {
      'LB-F4': 'an abstention counted as a dangerous error also moves the point rate LB-F4 asserts abstentions never move',
      'LB-F14': 'LB-F14 asserts a non-answer produces no dangerous error, which is the exact property this candidate corrupts',
    },
  },
  {
    id: 'DC-ABSTAIN-AS-SUCCESS',
    named: 'LB-F4',
    error: 'counts an abstention as agreement (rewards never answering)',
    decisions: mk('DC-ABSTAIN-AS-SUCCESS', { classifyJudgment: (k) => treat(k, { abstain: { inDenominator: true, countsAsError: false, bucket: 'abstain' } }) }),
    collateral: {},
  },
  {
    id: 'DC-MIN-LABEL',
    named: 'LB-F5',
    error: 'takes the lenient label as headline',
    decisions: mk('DC-MIN-LABEL', { headlineDepth: (a, b) => Math.min(a, b), headlineCaution: (a, b) => a && b }),
    collateral: {},
  },
  {
    id: 'DC-POINT-ESTIMATE',
    named: 'LB-F1',
    error: 'takes the verdict on the point rate, ignoring the bound',
    decisions: mk('DC-POINT-ESTIMATE', { riskQuantity: (k, n) => (n === 0 ? 1 : k / n) }),
    collateral: {},
  },
  {
    id: 'DC-LABEL-AFTER-RESPONSE',
    named: 'LB-F7',
    error: 'accepts labels committed after provider output exists',
    decisions: mk('DC-LABEL-AFTER-RESPONSE', { labelOrderOk: () => true }),
    collateral: {},
  },
  {
    id: 'DC-ADJUDICATION-OVERWRITES',
    named: 'LB-F8',
    error: 'adjudication replaces A and B',
    decisions: mk('DC-ADJUDICATION-OVERWRITES', { adjudicate: (a, b, adj) => (adj === undefined ? { a, b } : { a: adj, b: adj }) }),
    collateral: {},
  },
  {
    id: 'DC-PACKET-ONLY-TRUTH',
    named: 'LB-F9',
    error: 'scores only against the packet-only (P) label, hiding the packet-sufficiency gap',
    decisions: mk('DC-PACKET-ONLY-TRUTH', { verdictDomains: () => ['P'] }),
    collateral: {},
  },
  {
    id: 'DC-AUTHORITY-TARGET',
    named: 'LB-F10',
    error: 'admits an authority fact as a label target',
    decisions: mk('DC-AUTHORITY-TARGET', { acceptTarget: () => true }),
    collateral: {},
  },
  {
    id: 'DC-MAGNITUDE-BLIND',
    named: 'LB-F11',
    error: 'counts a one-band and a four-band undercall identically',
    decisions: mk('DC-MAGNITUDE-BLIND', { depthUnder: (h, b) => (b < h ? 1 : 0) }),
    collateral: {},
  },
  {
    id: 'DC-TWO-SIDED-INTERVAL',
    named: 'LB-F2',
    error: 'silently substitutes the conventional two-sided 95% Clopper–Pearson interval for the frozen one-sided bound',
    decisions: mk('DC-TWO-SIDED-INTERVAL', {
      upperBound: (k, n) => (n === 0 ? 1 : cpUpperTwoSided(k, n)),
      riskQuantity: (k, n) => (n === 0 ? 1 : cpUpperTwoSided(k, n)),
    }),
    collateral: {},
  },
  {
    id: 'DC-UNINTERPRETABLE-AS-FAIL',
    named: 'LB-F12',
    error: 'collapses UNINTERPRETABLE into NOT_ADMISSIBLE (a question that cannot be judged is scored as a failure)',
    decisions: mk('DC-UNINTERPRETABLE-AS-FAIL', { uninterpretableVerdict: () => 'NOT_ADMISSIBLE' }),
    collateral: {
      'LB-F15': 'LB-F15 asserts UNINTERPRETABLE for a set with no human second label, which is another instance of the property this candidate corrupts',
    },
  },
  {
    id: 'DC-UTILITY-IN-SAFETY',
    named: 'LB-F13',
    error: 'credits abstention in the safety score (bound scaled by the answered fraction)',
    decisions: mk('DC-UTILITY-IN-SAFETY', {
      domainFails: (q, r, util, cfg) => {
        const credit = 1 - (util.abstain_rate ?? 0);
        const conf = r.confident.some((c) => c.bound * credit > cfg.ceiling_confident);
        if (q === 'Q_DEPTH') return (r.material !== null && r.material.bound * credit > cfg.ceiling_depth_material) || conf;
        return r.any.bound * credit > cfg.ceiling_dangerous || conf;
      },
    }),
    collateral: {},
  },
  {
    id: 'DC-HOSTFAIL-AS-ABSTAIN',
    named: 'LB-F14',
    error: 'merges host failure into model abstention',
    decisions: mk('DC-HOSTFAIL-AS-ABSTAIN', { classifyJudgment: (k) => treat(k, { host_failure: { inDenominator: false, countsAsError: false, bucket: 'abstain' } }) }),
    collateral: {},
  },
  {
    id: 'DC-MODEL-LABEL-AS-GOLD',
    named: 'LB-F15',
    error: 'counts a model label as the second human',
    decisions: mk('DC-MODEL-LABEL-AS-GOLD', { isGoldLabel: () => true }),
    collateral: {},
  },
  {
    id: 'DC-BAND-ROUNDING',
    named: 'LB-F11',
    error: 'maps Score to bands by rounding instead of the frozen floor mapping',
    decisions: mk('DC-BAND-ROUNDING', { bandOf: (s) => Math.min(5, Math.round(4 * s) + 1) }),
    collateral: {},
  },
];

export const CANDIDATE_IDS = CANDIDATES.map((c) => c.id);
