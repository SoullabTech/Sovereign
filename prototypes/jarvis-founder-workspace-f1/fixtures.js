// JARVIS-FOUNDER-WORKSPACE-01 / F1 — recorded-evidence fixtures.
// Every record names its source and evidence state. Nothing here is live.
// evidence_state ∈ OBSERVED (recorded) · INFERRED · UNVERIFIED · UNOBSERVED ·
//                  NOT FOUND · CANDIDATE · RATIFIED · ILLUSTRATIVE (fixture, no recorded observation)
window.JFW_FIXTURES = {
  meta: {
    prototype: 'JARVIS-FOUNDER-WORKSPACE-01 / F1',
    observed_against: 'b4f73ac4ccd9cb96e6b2b6dc7b682e689c77771f',
    f0_candidate: '8b8592d9d69e9181484cb6ac9771a1be0c3b1e84',
    fixture_recorded_at: '2026-09-23',
    workspace: {
      repo: 'Sovereign (MAIA-SOVEREIGN)',
      path: '/home/user/Sovereign  (Mac Studio: /Users/soullab/MAIA-SOVEREIGN — recorded, not observed here)',
      branch: 'claude/sharp-cannon-cyrdeb',
      head: '065b9c66',
      clean: true,
      resolved_by: 'JARVIS_REPO_ROOT → saved choice → upward walk (jop-04 resolution order; recorded from repo-resolution.js)',
      source: 'jarvis-desktop/src/main.js status probe (git rev-parse / status --porcelain) — value recorded from this checkout at fixture time',
      evidence_state: 'OBSERVED'
    }
  },

  // programme-state.v1 — projection fixture (D-03). Source of truth = the governed records cited.
  programme_state: {
    schema: 'programme-state.v1',
    projected_at: '2026-09-23',
    observed_against: 'b4f73ac4ccd9cb96e6b2b6dc7b682e689c77771f',
    projector: 'manual F1 fixture — the deterministic projector is a later governed act',
    programmes: [
      { id: 'JARVIS-FOUNDER-WORKSPACE-01', name: 'Founder Workspace', kind: 'programme',
        question: 'Make JARVIS the place you actually work every day.',
        standing: 'F0 PASS · F1 OPEN — INFORMATION ARCHITECTURE + LIVING PROTOTYPE OVER RECORDED EVIDENCE ONLY',
        stage: { current_act: 'F1', mode: 'PROTOTYPE · no runtime change' },
        needs_founder: [ { what: 'Walk the F1 prototype and rule each surface KEEP · REVISE · REMOVE · NEW CAPABILITY REQUIRED', why: 'F1 exits only on a founder walk', source: 'docs/programme/JARVIS-FOUNDER-WORKSPACE-01_F0_FOUNDER_ADJUDICATION_2026-09-23.md §F1 Exit' } ],
        last_change: { date: '2026-09-23', authority: 'founder adjudication', source: 'docs/programme/JARVIS-FOUNDER-WORKSPACE-01_F0_FOUNDER_ADJUDICATION_2026-09-23.md' },
        custody: { branch: 'claude/sharp-cannon-cyrdeb', candidate_sha: '8b8592d9', observed_against: 'b4f73ac4' },
        authority: { merge: 'NOT AUTHORIZED', deploy: 'NOT AUTHORIZED', production_write: 'NOT AUTHORIZED', member_facing: 'N/A' },
        external: false, evidence_state: 'OBSERVED',
        sources: ['docs/programme/JARVIS-FOUNDER-WORKSPACE-01_CHARTER_2026-09-23.md', 'docs/programme/JARVIS-FOUNDER-WORKSPACE-01_F0_PRODUCT_CENSUS_AND_FOUNDER_EXPERIENCE_CONSTITUTION_2026-09-23.md'] },

      { id: 'JARVIS-MERGE-AUTHORITY-01', name: 'Merge Authority', kind: 'programme',
        question: 'Who may merge to canonical, and under what credentialed execution.',
        standing: 'AUTHORIZED · UNSPENT · IDLE PENDING CREDENTIALED EXECUTION CAPACITY',
        stage: { current_act: 'M1R1R1', mode: 'Externally governed · execution pending · protected from this lane' },
        needs_founder: [],
        last_change: { date: '2026-09-23', authority: 'founder ruling D-01 (reference-level dependency)', source: 'docs/programme/JARVIS-FOUNDER-WORKSPACE-01_F0_FOUNDER_ADJUDICATION_2026-09-23.md §D-01' },
        custody: { branch: 'outside this repository', candidate_sha: null, observed_against: null },
        authority: { merge: 'GOVERNED ELSEWHERE', deploy: 'GOVERNED ELSEWHERE', production_write: 'GOVERNED ELSEWHERE', member_facing: 'N/A' },
        external: true, evidence_state: 'NOT FOUND (in this checkout) · standing by founder statement',
        sources: ['founder adjudication 2026-09-23 §V'] },

      { id: 'JARVIS-ORCHESTRATION-OPERATOR-01', name: 'Operator Organs', kind: 'programme',
        question: 'How JARVIS turns what you say into governed, bounded work without gaining authority.',
        standing: 'O0–O3 CLOSED · CANONICAL · O4 contract only (runtime standing UNVERIFIED) · O7 Operator Decision Surface NOT OPEN · O10 Desktop Operator Witness NOT OPEN',
        stage: { current_act: 'O4 reconciliation owed', mode: 'HOLD' },
        needs_founder: [ { what: 'Reconcile the O4 router implementation (51890bc0, d2db8896) with its contract, which says NO O4 RUNTIME IMPLEMENTATION', why: 'implementation exists; governed runtime standing unverified', source: 'docs/programme/JARVIS-ORCHESTRATION-OPERATOR-01_O4_CAPABILITY_ROUTER_CONTRACT_2026-09-22.md :6 + git log' } ],
        last_change: { date: '2026-09-22', authority: 'commit d2db8896 (no adjudication record found)', source: 'git log -- jarvis-desktop/src/operator-capability-router.mjs' },
        custody: { branch: 'clean-main-no-secrets', candidate_sha: 'd2db8896', observed_against: 'b4f73ac4' },
        authority: { merge: 'landed', deploy: 'N/A (desktop)', production_write: 'N/A', member_facing: 'N/A' },
        external: false, evidence_state: 'OBSERVED (docs + git) · runtime UNVERIFIED',
        sources: ['docs/programme/JARVIS-ORCHESTRATION-OPERATOR-01_O3_AUTHORITY_PLANNER_2026-09-21.md :250,:253'] },

      { id: 'JARVIS-ROUTING-INTELLIGENCE-01', name: 'Routing Intelligence', kind: 'programme',
        question: 'Which model or capability handles a piece of work, without capability becoming authority.',
        standing: 'J5 RATIFIED · R4 · R5A founder-accepted · R5B IMPLEMENTED LOCALLY · FALSIFICATION GREEN · AWAITING FOUNDER ADJUDICATION',
        stage: { current_act: 'R5B adjudication', mode: 'STOP' },
        needs_founder: [ { what: 'Adjudicate R5B — one-time human authorization to run an external model', why: 'implemented and falsified locally; no provider execution until ruled', source: 'docs/programme/JARVIS-ROUTING-INTELLIGENCE-01_CHARTER_2026-09-18.md §Status correction 2026-09-22' } ],
        last_change: { date: '2026-09-22', authority: 'charter status correction', source: 'docs/programme/JARVIS-ROUTING-INTELLIGENCE-01_CHARTER_2026-09-18.md' },
        custody: { branch: 'clean-main-no-secrets', candidate_sha: null, observed_against: 'b4f73ac4' },
        authority: { merge: 'landed (R1·R4·R5A·R5B)', deploy: 'N/A', production_write: 'NOT AUTHORIZED', member_facing: 'NOT AUTHORIZED' },
        external: false, evidence_state: 'OBSERVED (docs)', sources: ['docs/programme/JARVIS-ROUTING-INTELLIGENCE-01_R5B_HUMAN_PROVIDER_EXECUTION_AUTHORIZATION_2026-09-18.md'] },

      { id: 'JARVIS-WORK-UNIT-01', name: 'Work Units', kind: 'programme',
        question: 'One governed shape for a piece of work: identity, scope, authority, routing, evidence, state.',
        standing: 'W0 RATIFIED · W1–W5 CLOSED · RGR-01 CLOSED',
        stage: { current_act: 'none open', mode: 'CLOSED' }, needs_founder: [],
        last_change: { date: '2026-09-18', authority: 'programme closure', source: 'docs/programme/JARVIS-WORK-UNIT-01_W1_W5_PROGRAMME_CLOSURE_2026-09-18.md' },
        custody: { branch: 'clean-main-no-secrets', candidate_sha: 'fab09573 (report, not re-verified)', observed_against: 'b4f73ac4' },
        authority: { merge: 'landed', deploy: 'N/A', production_write: 'N/A', member_facing: 'N/A' },
        external: false, evidence_state: 'OBSERVED (docs)', sources: ['docs/programme/JARVIS-WORK-UNIT-01_W0_CANONICAL_CONTRACT_2026-09-18.md'] },

      { id: 'JARVIS-CONTINUITY-BRIDGE-01', name: 'Continuity', kind: 'programme',
        question: 'Recall prior work locally, without anything leaving the machine.',
        standing: 'LOCAL CONTINUITY + BRANCH-AWARE RECALL IMPLEMENTED AND PROVEN · merge/deploy unopened',
        stage: { current_act: 'none open', mode: 'LOCAL_ONLY' }, needs_founder: [],
        last_change: { date: '2026-09-17', authority: 'lane record', source: 'docs/programme/JARVIS-CONTINUITY-BRIDGE-01_2026-09-17.md' },
        custody: { branch: 'bounded branch', candidate_sha: null, observed_against: null },
        authority: { merge: 'NOT OPENED', deploy: 'NOT OPENED', production_write: 'N/A', member_facing: 'N/A' },
        external: false, evidence_state: 'OBSERVED (docs)', sources: ['jarvis-desktop/src/continuity.js', 'scripts/builder/jarvis-recall.py'] },

      { id: 'JARVIS-SVE-01', name: 'SVE Constitution', kind: 'programme',
        question: 'A candidate constitution for how JARVIS specifies, verifies and evaluates work.',
        standing: 'CANDIDATE CONSTITUTION — NOT RATIFIED · STOP for founder adjudication',
        stage: { current_act: 'ratification', mode: 'STOP' },
        needs_founder: [ { what: 'Ratify, amend or hold the SVE constitution', why: 'it wraps other programmes and is unratified', source: 'docs/programme/JARVIS-SVE-01_CONSTITUTION_2026-09-23.md' } ],
        last_change: { date: '2026-09-23', authority: 'lane candidate', source: 'docs/programme/JARVIS-SVE-01_CONSTITUTION_2026-09-23.md' },
        custody: { branch: 'clean-main-no-secrets', candidate_sha: null, observed_against: 'b4f73ac4' },
        authority: { merge: 'N/A (doc)', deploy: 'N/A', production_write: 'N/A', member_facing: 'N/A' },
        external: false, evidence_state: 'OBSERVED (docs)', sources: [] },

      { id: 'DEPLOYMENT-SAFETY-03 / REVIEW-CUSTODY-01 · R1', name: 'Deployment Safety R1', kind: 'programme',
        question: 'Bring frozen review-custody law and the deploy ordering (gate → migrate → tags → swap → verify) onto canonical together.',
        standing: 'FULL-LINEAGE RECONCILIATION PREPARED · ⛔ NOT CANONICAL YET · FOUNDER R1 ADJUDICATION OWED · NO DEPLOY · NO SCHEMA OR PRODUCTION MUTATION',
        stage: { current_act: 'R1 adjudication', mode: 'STOP' },
        needs_founder: [ { what: 'Adjudicate merge candidate 5c12d891 (parents bd91e5bb + 6f447b17)', why: 'conflict-free reconciliation prepared; not canonical until ruled', source: 'docs/programme/DEPLOYMENT-SAFETY-03_R1_CANONICAL_RECONCILIATION_2026-09-21.md' } ],
        last_change: { date: '2026-09-21', authority: 'lane record', source: 'CLAUDE.md priority thread 2026-09-21' },
        custody: { branch: 'reconciliation candidate', candidate_sha: '5c12d891', observed_against: 'bd91e5bb' },
        authority: { merge: 'ADJUDICATION OWED', deploy: 'NOT AUTHORIZED', production_write: 'NOT AUTHORIZED', member_facing: 'N/A' },
        external: false, evidence_state: 'OBSERVED (CLAUDE.md, not re-verified against the record)', sources: [] },

      { id: 'REVIEW-CUSTODY-01 · DEV-LANE PROVIDER EXPOSURE', name: 'Review Custody', kind: 'programme',
        question: 'Bind code review to what was actually read, and keep repository text away from lab-tier providers.',
        standing: 'FINDING VALID · FOUNDER INTERIM HOLD TAKEN · STEP 1 ✅ · FREEZE @ bbb5ff5c · STEP 2 ✅ · ⛔ STEP 3 NOT OPENED · INSTRUMENT UNWIRED',
        stage: { current_act: 'Step 3 (founder act naming the first bound surface)', mode: 'NOT OPENED' },
        needs_founder: [ { what: 'Name the first surface where a bound review is REQUIRED (Step 3)', why: 'the instrument has custody over a record nothing yet requires', source: 'CLAUDE.md priority thread 2026-09-20' } ],
        last_change: { date: '2026-09-20', authority: 'founder acts (freeze + Step 2)', source: 'docs/programme/REVIEW-CUSTODY-01_STEP2_REVIEW_AUTHORING_PROCEDURE_2026-09-20.md' },
        custody: { branch: 'claude/optimistic-wozniak-pruzjq', candidate_sha: 'bbb5ff5c', observed_against: null },
        authority: { merge: 'N/A', deploy: 'N/A', production_write: 'N/A', member_facing: 'N/A' },
        external: false, evidence_state: 'OBSERVED (CLAUDE.md)', sources: [] },

      { id: 'WRITERS-STUDIO-CONVERGENCE-01', name: "Writer's Studio Convergence", kind: 'programme',
        question: "Converge Writer's Studio around one relationship between the writer, the Work and MAIA.",
        standing: 'CONVERGENCE LAW FROZEN · FACETS-01 RATIFIED (GUIDED · LEARNING · DIRECT) · OBSERVATION-IDENTITY-01/I1 CLOSED · OBSERVATION-ADDRESS-01 ESTABLISHED, NOT OPENED · STEPS 2–8 NOT STARTED',
        stage: { current_act: 'OBSERVATION-ADDRESS-01 (not opened)', mode: 'HOLD' },
        needs_founder: [ { what: 'Open OBSERVATION-ADDRESS-01 (bridge from observation_id to existing standing, no migration)', why: 'facet work may not create member actions until it closes', source: 'docs/programme/WRITERS-STUDIO-OBSERVATION-ADDRESS-01_CLOSURE_AND_CHARTER_2026-09-21.md' } ],
        last_change: { date: '2026-09-21', authority: 'founder adjudication', source: 'docs/programme/WRITERS-STUDIO-OBSERVATION-ADDRESS-01_CLOSURE_AND_CHARTER_2026-09-21.md' },
        custody: { branch: 'lane branch', candidate_sha: 'e8f39cff', observed_against: 'a8a686cd' },
        authority: { merge: 'NOT AUTHORIZED', deploy: 'NOT AUTHORIZED', production_write: 'NOT AUTHORIZED', member_facing: 'NOT AUTHORIZED' },
        external: false, evidence_state: 'OBSERVED (CLAUDE.md)', sources: [] },

      { id: 'JARVIS-CIRCLES-01', name: 'Circles', kind: 'programme',
        question: 'Let members find one another around a shared interest, safely.',
        standing: 'I0.5 CODE deployed · I0.5 SCHEMA deployed (under no recorded authorization) · CANONICAL VERIFY not yet accepted · I1 HOLD · REVERT NOT AUTHORIZED',
        stage: { current_act: 'I0.5 acceptance (two witnesses)', mode: 'HOLD' },
        needs_founder: [ { what: 'Accept I0.5 as current deployed state on two independent witnesses (canonical verifier 63/63 + production schema read)', why: 'schema reached production ahead of its ruling; reconcile forward was ruled', source: 'CLAUDE.md priority thread 2026-09-07 (schema drift)' } ],
        last_change: { date: '2026-09-07', authority: 'founder ruling: reconcile forward', source: 'CLAUDE.md priority thread' },
        custody: { branch: 'claude/jarvis-circles-programme-reouzc', candidate_sha: '3ed98ceab', observed_against: null },
        authority: { merge: 'landed', deploy: 'happened (unattributed)', production_write: 'NOT AUTHORIZED', member_facing: 'founder-only gate' },
        external: false, evidence_state: 'OBSERVED (CLAUDE.md)', sources: [] },

      { id: 'WORKSTATION-STORAGE-RELIEF', name: 'Mac Studio Storage', kind: 'ops',
        question: 'Keep the workstation from treating a full disk as a memory failure.',
        standing: 'worktree relief CLOSED · Library census + 48 GB baseline NEXT · ⛔ do not run Act B again',
        stage: { current_act: 'restart → baseline → read-only ~/Library census', mode: 'NEXT' },
        needs_founder: [ { what: 'Decide on ~/Library items (Messages 44 GB · Voice Memos 21 GB · Claude vm_bundles 9.5 GB)', why: 'these are human decisions, not reclaim acts', source: 'docs/ops/WORKSTATION_STORAGE_RELIEF_2026-09-22.md' } ],
        last_change: { date: '2026-09-22', authority: 'ops record', source: 'docs/ops/WORKSTATION_STORAGE_RELIEF_2026-09-22.md' },
        custody: { branch: null, candidate_sha: null, observed_against: null },
        authority: { merge: 'N/A', deploy: 'N/A', production_write: 'N/A', member_facing: 'N/A' },
        external: false, evidence_state: 'OBSERVED (docs)', sources: ['scripts/ops/workstation-storage-census.sh'] },

      { id: 'TEMPORAL-MEMORY-CUT1-TRACEABILITY-01', name: 'Memory Traceability', kind: 'programme',
        question: 'Make it knowable, after the fact, which valid memories decay kept out of a turn.',
        standing: '✅ CLOSED IN PRODUCTION · behavioural reconciliation ⛔ UNOPENED',
        stage: { current_act: 'none open', mode: 'CLOSED' }, needs_founder: [],
        last_change: { date: '2026-09-16', authority: 'production witness + closure', source: 'docs/programme/TEMPORAL-MEMORY-CUT1-TRACEABILITY-01_PRODUCTION_WITNESS_AND_CLOSURE_2026-09-16.md' },
        custody: { branch: 'clean-main-no-secrets', candidate_sha: '98542ff06 (runtime)', observed_against: null },
        authority: { merge: 'landed (PR #1301)', deploy: 'done', production_write: 'done (trace table)', member_facing: 'no visible change' },
        external: false, evidence_state: 'OBSERVED (docs)', sources: [] }
    ]
  },

  // Work — current work, history, handoffs, results.
  work: {
    intent_examples: [
      'Fix the button that says "Run locally with JARVIS" — it fails every time.',
      'What is waiting on me this week?',
      'Continue where we left off on Writer\'s Studio.'
    ],
    // Illustrative Work Units in the W0.v2 shape (fields per the canonical form). No recorded Work Unit
    // was observable from the census container ($AIN_HOME not visible), so these are marked ILLUSTRATIVE.
    units: [
      { id: 'wu-fixture-01', title: 'Repair the "Run locally with JARVIS" button', plain: 'Someone (not this lane) needs to declare the missing REPO_ROOT so local runs stop failing.',
        state: 'DRAFT', state_plain: 'Drafted, not yet bound to a checkout', work_class: 'MODIFY', evidence_class: 'E2 — source-grounded', routing_posture: 'local only', authority: ['repo.read', 'repo.write:worktree (bounded)'],
        route: 'not routed yet', last_event: '2026-09-23 · drafted from F0 §6.1', evidence_state: 'ILLUSTRATIVE (the defect is real: main.js:1180-1192; the Work Unit is a fixture)', source: 'docs/programme/…F0… §6.1 · founder ruling D-07' },
      { id: 'wu-fixture-02', title: 'Check the O4 router against its contract', plain: 'Held until you decide whether the O4 implementation is lawful — nothing runs.',
        state: 'HELD_FOR_AUTHORITY', state_plain: 'Waiting for your authority', work_class: 'INSPECT', evidence_class: 'E1 — document-grounded', routing_posture: 'deterministic', authority: ['repo.read'],
        route: 'HELD', last_event: '2026-09-22 · contract vs commit 51890bc0', evidence_state: 'ILLUSTRATIVE (the drift is real; the Work Unit is a fixture)', source: 'founder ruling D-07' },
      { id: 'wu-fixture-03', title: 'Write the first founder vocabulary map', plain: 'Done and recorded; you can read it under System → Vocabulary.',
        state: 'CLOSED', state_plain: 'Closed with evidence', work_class: 'SYNTHESIZE', evidence_class: 'E1 — document-grounded', routing_posture: 'deterministic', authority: ['repo.read'],
        route: 'deterministic', last_event: '2026-09-23 · closed', evidence_state: 'ILLUSTRATIVE (the map exists: prototypes/jarvis-founder-workspace-f1/vocabulary.js; it was not produced through a Work Unit)', source: 'F1 record' }
    ],
    history: [
      { at: '2026-09-23', what: 'F0 adjudication recorded; F1 opened', sha: '065b9c66', kind: 'commit', evidence_state: 'OBSERVED (git)' },
      { at: '2026-09-23', what: 'F0 census + founder experience constitution delivered', sha: '8b8592d9', kind: 'commit', evidence_state: 'OBSERVED (git)' },
      { at: '2026-09-23', what: 'Founder Workspace charter opened', sha: 'd4efcbfb', kind: 'commit', evidence_state: 'OBSERVED (git)' },
      { at: '2026-09-23', what: 'Canonical merged PR #1494 (JEV-INT-01R3 dev-lane ratification)', sha: 'b4f73ac4', kind: 'commit', evidence_state: 'OBSERVED (git)' },
      { at: '2026-09-22', what: 'O4 capability router implemented and hardened', sha: '51890bc0 · d2db8896', kind: 'commit', evidence_state: 'OBSERVED (git)' }
    ],
    handoffs: [
      { at: '2026-09-23', from: 'JARVIS (F0)', to: 'Founder', what: 'Eight decisions (D-01…D-08)', status: 'RULED', evidence_state: 'OBSERVED (adjudication record)' },
      { at: '2026-09-23', from: 'Founder', to: 'JARVIS (F1)', what: 'Build the living prototype over recorded evidence', status: 'IN PROGRESS', evidence_state: 'OBSERVED (adjudication record)' }
    ],
    results: [
      { title: 'F0 census + founder experience constitution', path: 'docs/programme/JARVIS-FOUNDER-WORKSPACE-01_F0_PRODUCT_CENSUS_AND_FOUNDER_EXPERIENCE_CONSTITUTION_2026-09-23.md', kind: 'record', evidence_state: 'OBSERVED (git)' },
      { title: 'F0 founder adjudication', path: 'docs/programme/JARVIS-FOUNDER-WORKSPACE-01_F0_FOUNDER_ADJUDICATION_2026-09-23.md', kind: 'ruling', evidence_state: 'OBSERVED (git)' },
      { title: 'This prototype', path: 'prototypes/jarvis-founder-workspace-f1/index.html', kind: 'prototype', evidence_state: 'OBSERVED (git)' }
    ],
    adjudication_note: 'The canonical W0.v2 implementation currently accepts only decision = accepted (ACCEPTED_ADJUDICATION_REQUIRED). A governed "No — not acceptable" is owed by the Work Unit programme (founder ruling D-06). This prototype shows that limit; it does not invent a Reject button.'
  },

  // Monitor — local-first (D-04). Each row: subject · axis · value · instrument · observed_at · evidence_state.
  monitor: [
    { group: 'This workspace', subject: 'Checkout', axis: 'branch / head / clean', value: 'claude/sharp-cannon-cyrdeb · 065b9c66 · clean', plain: 'Your working copy is clean and on the Founder Workspace branch.', level: 'good', instrument: 'git rev-parse / git status --porcelain (Desktop status probe, main.js)', observed_at: '2026-09-23', evidence_state: 'OBSERVED (this checkout)' },
    { group: 'This workspace', subject: 'Canonical freshness', axis: 'origin/clean-main-no-secrets vs census', value: 'b4f73ac4 = census SHA', plain: 'Canonical has not moved since the F0 census, so nothing here is stale on that account.', level: 'good', instrument: 'git fetch + rev-parse origin/clean-main-no-secrets', observed_at: '2026-09-23', evidence_state: 'OBSERVED' },
    { group: 'This workspace', subject: 'Work engine (Builder OS)', axis: 'session.mjs status', value: 'not observed — the console was not launched during F0', plain: 'JARVIS did not check its own work engine for this snapshot.', level: 'unobserved', instrument: 'node scripts/builder/session.mjs status --json', observed_at: null, evidence_state: 'UNOBSERVED' },
    { group: 'This workspace', subject: 'Local model worker', axis: 'Ollama 127.0.0.1:11434/api/tags', value: 'not observed', plain: 'Whether the local model is running was not checked for this snapshot.', level: 'unobserved', instrument: 'HTTP GET 127.0.0.1:11434/api/tags (main.js)', observed_at: null, evidence_state: 'UNOBSERVED' },
    { group: 'This workspace', subject: '"Run locally with JARVIS" (C1 lane)', axis: 'static integrity', value: 'FAILED — uses an undeclared name (REPO_ROOT) at main.js:1180-1192', plain: 'This button cannot work right now. The repair belongs to the lane that owns C1, not to this workspace.', level: 'failed', instrument: 'source inspection (F0 §6.1); runtime effect inferred, app not run', observed_at: '2026-09-23', evidence_state: 'OBSERVED (static) · INFERRED (runtime)' },
    { group: 'This workspace', subject: 'Local-native work lane', axis: 'label vs mechanism', value: 'labelled "read-only"; mechanism requires bounded worktree write', plain: 'The description of this lane is out of date. It is not reachable from the console today.', level: 'warn', instrument: 'source inspection: main.js:535 vs jarvis-runtime-pipeline.mjs:129', observed_at: '2026-09-23', evidence_state: 'OBSERVED (static)' },
    { group: 'This workspace', subject: 'External reasoning (frontier model)', axis: 'authority', value: 'manual only · requires external_ok=true · automatic C3 not authorized', plain: 'JARVIS may ask an outside model only when you say so, each time.', level: 'unauthorized', instrument: 'FRONTIER.validate (frontier-worker.js) · router law', observed_at: '2026-09-23', evidence_state: 'OBSERVED (source)' },
    { group: 'This workspace', subject: 'Recall prior work (continuity)', axis: 'script + database + python present', value: 'not observed on this machine', plain: 'Whether recall is ready on the Mac Studio was not checked for this snapshot.', level: 'unobserved', instrument: 'CONTINUITY.status (file existence: jarvis-recall.py, ~/.jarvis/continuity/continuity.sqlite3, python3)', observed_at: null, evidence_state: 'UNOBSERVED' },
    { group: 'This workspace', subject: 'Memory / Postgres', axis: 'connection', value: 'UNCONFIGURED by design', plain: 'The console never connects to a database. Memory state is read from the host, not from here.', level: 'unobserved', instrument: 'declared in main.js:518 (no probe by law)', observed_at: '2026-09-23', evidence_state: 'OBSERVED (source: deliberately not probed)' },

    { group: 'Mac Studio', subject: 'Internal disk', axis: 'free space', value: '76 GB free (84% used)', plain: 'The workstation has room again. Free space here doubles as memory headroom on this machine.', level: 'good', instrument: 'scripts/ops/workstation-storage-census.sh', observed_at: '2026-09-22', evidence_state: 'OBSERVED (recorded in docs/ops/WORKSTATION_STORAGE_RELIEF_2026-09-22.md)' },
    { group: 'Mac Studio', subject: 'Swap / compressor', axis: 'GB', value: 'swap 10.4 · compressor 14.4', plain: 'Memory pressure eased after the stale servers were stopped.', level: 'good', instrument: 'workstation-storage-census.sh', observed_at: '2026-09-22', evidence_state: 'OBSERVED (recorded)' },
    { group: 'Mac Studio', subject: 'Git worktrees', axis: 'count', value: '269 (0 removable left internally)', plain: 'Worktree cleanup is finished. Do not run the second reclaim act again.', level: 'good', instrument: 'scripts/ops/worktree-census.sh', observed_at: '2026-09-22', evidence_state: 'OBSERVED (recorded)' },
    { group: 'Mac Studio', subject: 'Docker Desktop', axis: 'reserved', value: '12.25 GB RAM · 10 CPUs', plain: 'A quarter of unified memory is reserved for Docker and is invisible to ps.', level: 'warn', instrument: 'recorded in WORKSTATION_STORAGE_RELIEF_2026-09-22.md', observed_at: '2026-09-22', evidence_state: 'OBSERVED (recorded)' },
    { group: 'Mac Studio', subject: 'Backups', axis: 'scheduled?', value: 'four backup scripts present; scheduling not observed', plain: 'JARVIS cannot see whether backups actually run. There are four overlapping scripts.', level: 'unobserved', instrument: 'scripts/backup-postgres.sh · backup-database.sh · backup-db.sh · maia-auto-backup.sh · setup-backup-cron.sh', observed_at: '2026-09-23', evidence_state: 'OBSERVED (files) · UNOBSERVED (scheduling)' },

    { group: 'Repository health', subject: 'Type errors', axis: 'count vs baseline', value: '239 baseline (2026-07-30); later lanes reported 229–230', plain: 'Known type debt, not a gate failure. It only fails if it gets worse.', level: 'warn', instrument: 'npm run typecheck:full vs typecheck-baseline.json', observed_at: '2026-07-30', evidence_state: 'OBSERVED (recorded, 55 days old)' },
    { group: 'Repository health', subject: 'GitHub dependency alerts', axis: 'default branch', value: '764 (31 critical · 383 high · 289 moderate · 61 low)', plain: 'GitHub is reporting a large backlog of vulnerable dependencies. Nobody has instrumented it beyond this message.', level: 'warn', instrument: 'GitHub remote message during git push (Dependabot)', observed_at: '2026-09-23', evidence_state: 'OBSERVED (push output)' },

    { group: 'Production (soullab.life)', subject: 'Production', axis: 'any', value: 'not observed from this workspace · additional authority required', plain: 'This workspace does not look at production. Seeing it would need its own authority act naming transport, target, credentials, allowed observations, disclosure boundary, cadence and stop conditions.', level: 'unauthorized', instrument: 'none permitted (founder ruling D-04; main.js:519 "NOT PROBED")', observed_at: null, evidence_state: 'DELIBERATELY NOT OBSERVED' },
    { group: 'Production (soullab.life)', subject: 'Last known runtime', axis: 'GIT_COMMIT', value: '98542ff06 (recorded 2026-09-16)', plain: 'The most recent runtime SHA written into the record. It is a week old and may be stale.', level: 'unobserved', instrument: 'recorded in docs/programme/TEMPORAL-MEMORY-CUT1-TRACEABILITY-01_PRODUCTION_WITNESS_AND_CLOSURE_2026-09-16.md', observed_at: '2026-09-16', evidence_state: 'OBSERVED (recorded, 7 days old)' },
    { group: 'Production (soullab.life)', subject: 'Co-Lab release gate', axis: 'passed / failed / warned', value: '33 · 0 · 0 on runtime ca5fdff44', plain: 'The last recorded run of the member-safety gate passed. It is 17 days old.', level: 'good', instrument: 'scripts/verify-constitution-colab.ts (in container)', observed_at: '2026-09-06', evidence_state: 'OBSERVED (recorded, 17 days old)' },
    { group: 'Production (soullab.life)', subject: 'Completed deploys', axis: 'ledger', value: 'no durable ledger exists', plain: 'JARVIS cannot tell you when the last deploy happened, because the deploy lane keeps no append-only record (finding 2026-09-07).', level: 'unobserved', instrument: 'scripts/deploy-lock.sh writes holder metadata into the lockfile, overwritten on each acquisition', observed_at: '2026-09-07', evidence_state: 'NOT FOUND (instrument absent)' },

    { group: 'Costs', subject: 'Provider spend', axis: 'any', value: 'Cost monitoring is not instrumented yet.', plain: 'There is no cost instrument, so no number is shown (founder ruling D-05).', level: 'unobserved', instrument: 'none', observed_at: null, evidence_state: 'NOT FOUND (instrument absent)' }
  ],

  // Graph — every edge carries evidence. Node kinds: programme · act · branch · commit · unit · system · boundary · decision
  graph: {
    nodes: [
      { id: 'FW', kind: 'programme', label: 'Founder Workspace', sub: 'F1 open' },
      { id: 'FW.F0', kind: 'act', label: 'F0 census', sub: 'PASS' },
      { id: 'FW.F1', kind: 'act', label: 'F1 prototype', sub: 'open' },
      { id: 'br.fw', kind: 'branch', label: 'claude/sharp-cannon-cyrdeb', sub: 'lane branch' },
      { id: 'c.b4f7', kind: 'commit', label: 'b4f73ac4', sub: 'canonical (census)' },
      { id: 'c.8b85', kind: 'commit', label: '8b8592d9', sub: 'F0 candidate' },
      { id: 'MA', kind: 'boundary', label: 'Merge Authority', sub: 'externally governed' },
      { id: 'OO', kind: 'programme', label: 'Operator Organs', sub: 'O4 unverified' },
      { id: 'OO.O7', kind: 'act', label: 'O7 Decision Surface', sub: 'NOT OPEN' },
      { id: 'OO.O10', kind: 'act', label: 'O10 Desktop Witness', sub: 'NOT OPEN' },
      { id: 'c.5189', kind: 'commit', label: '51890bc0', sub: 'O4 router impl' },
      { id: 'RI', kind: 'programme', label: 'Routing Intelligence', sub: 'R5B awaiting ruling' },
      { id: 'JEV', kind: 'programme', label: 'JEV', sub: 'J0 ratified' },
      { id: 'WU', kind: 'programme', label: 'Work Units', sub: 'closed' },
      { id: 'CB', kind: 'programme', label: 'Continuity', sub: 'local only' },
      { id: 'DS', kind: 'programme', label: 'Deployment Safety R1', sub: 'adjudication owed' },
      { id: 'sys.console', kind: 'system', label: 'JARVIS console', sub: 'jarvis-desktop' },
      { id: 'sys.builder', kind: 'system', label: 'Builder runtime', sub: 'scripts/builder' },
      { id: 'sys.prod', kind: 'boundary', label: 'Production', sub: 'not observed' },
      { id: 'd.R5B', kind: 'decision', label: 'Rule R5B', sub: 'needs you' },
      { id: 'd.O4', kind: 'decision', label: 'Reconcile O4', sub: 'needs you' },
      { id: 'd.DS', kind: 'decision', label: 'Adjudicate R1 merge', sub: 'needs you' }
    ],
    edges: [
      { from: 'FW', to: 'FW.F0', rel: 'has act', evidence: { kind: 'doc', ref: 'docs/programme/JARVIS-FOUNDER-WORKSPACE-01_CHARTER_2026-09-23.md §Flow' } },
      { from: 'FW', to: 'FW.F1', rel: 'has act', evidence: { kind: 'ruling', ref: 'F0 adjudication §XII D-08' } },
      { from: 'FW.F0', to: 'c.8b85', rel: 'candidate', evidence: { kind: 'git', ref: 'git log claude/sharp-cannon-cyrdeb' } },
      { from: 'c.8b85', to: 'c.b4f7', rel: 'observed against', evidence: { kind: 'doc', ref: 'F0 record §0 freshness block' } },
      { from: 'c.8b85', to: 'br.fw', rel: 'on branch', evidence: { kind: 'git', ref: 'git branch --contains 8b8592d9' } },
      { from: 'FW', to: 'MA', rel: 'depends on (reference only)', evidence: { kind: 'ruling', ref: 'F0 adjudication §V D-01' } },
      { from: 'FW', to: 'OO', rel: 'composes organs of', evidence: { kind: 'ruling', ref: 'F0 adjudication §VI D-02' } },
      { from: 'OO', to: 'OO.O7', rel: 'unopened act', evidence: { kind: 'doc', ref: 'JARVIS-ORCHESTRATION-OPERATOR-01_O4_CAPABILITY_ROUTER_CONTRACT_2026-09-22.md :329' } },
      { from: 'OO', to: 'OO.O10', rel: 'unopened act', evidence: { kind: 'doc', ref: 'JARVIS-ORCHESTRATION-OPERATOR-01_O3_AUTHORITY_PLANNER_2026-09-21.md :253' } },
      { from: 'c.5189', to: 'OO', rel: 'implements O4 (unwitnessed)', evidence: { kind: 'git', ref: 'git log -- jarvis-desktop/src/operator-capability-router.mjs' } },
      { from: 'd.O4', to: 'OO', rel: 'blocks reliance on O4', evidence: { kind: 'ruling', ref: 'F0 adjudication §XI' } },
      { from: 'JEV', to: 'RI', rel: 'sub-lane J2-R1 of', evidence: { kind: 'doc', ref: 'JARVIS-JEV-01_J0_CONSTITUTION_AND_J1_JUDGMENT_CONTRACT_2026-09-22.md header' } },
      { from: 'd.R5B', to: 'RI', rel: 'blocks provider execution', evidence: { kind: 'doc', ref: 'JARVIS-ROUTING-INTELLIGENCE-01_CHARTER_2026-09-18.md §Status correction' } },
      { from: 'sys.console', to: 'WU', rel: 'must consume W0.v2, not reimplement', evidence: { kind: 'doc', ref: 'docs/programme/evidence/JARVIS-ROUTING-INTELLIGENCE-01/J6_WORK_UNIT_I4/DESKTOP_NATIVE_EXPERIENCE_STANDING_2026-09-18.md :20' } },
      { from: 'sys.console', to: 'sys.builder', rel: 'presentation over', evidence: { kind: 'doc', ref: 'jarvis-desktop/package.json description' } },
      { from: 'sys.console', to: 'CB', rel: 'recall via', evidence: { kind: 'doc', ref: 'jarvis-desktop/src/continuity.js header' } },
      { from: 'sys.console', to: 'sys.prod', rel: 'never probes', evidence: { kind: 'doc', ref: 'jarvis-desktop/src/main.js :519 + F0 adjudication §VIII' } },
      { from: 'd.DS', to: 'DS', rel: 'gates canonicalization', evidence: { kind: 'doc', ref: 'docs/programme/DEPLOYMENT-SAFETY-03_R1_CANONICAL_RECONCILIATION_2026-09-21.md' } },
      { from: 'FW', to: 'sys.console', rel: 'redesigns the experience of', evidence: { kind: 'doc', ref: 'charter §Subject' } }
    ]
  },

  // System — the six vocabularies stay six (HU-5).
  vocabularies: [
    { name: 'Legibility (how a row reads)', owner: 'jarvis-desktop/src/legibility.js · JOP-01', values: ['READY','WORKING','NEEDS_SETUP','NEEDS_AUTHORITY','DEGRADED','BLOCKED','FAILED','UNVERIFIED'] },
    { name: 'Operator gate (may JARVIS continue?)', owner: 'operator-constitution.js · O0', values: ['CONTINUE','NEEDS_OPERATOR_AUTHORITY','NEEDS_OPERATOR_JUDGMENT','BLOCKED_BY_EVIDENCE','STOP'] },
    { name: 'Reconciliation (what a result means)', owner: 'work-unit-control.js · FLOW-02', values: ['NOT_RUN','SECOND_REVIEW_OWED','REPAIR_BEFORE_WITNESS','NEEDS_KELLY','REVIEW_DISAGREEMENT','EVIDENCE_PRESENTED'] },
    { name: 'Adjudication (manual §12)', owner: 'JARVIS_INSTRUCTIONAL_MANUAL_v1.md', values: ['PASS','STOP','RETURN','HOLD','PARK'] },
    { name: 'Work Unit lifecycle (W2)', owner: 'scripts/builder/work-unit-lifecycle-v2.mjs', values: ['DRAFT','BOUND','AUTHORIZED','ROUTED','EXECUTING','EVIDENCE_READY','ADJUDICATED','CLOSED'] },
    { name: 'Route outcome (O4 / R4)', owner: 'operator-capability-router.mjs (unverified) · routing-execution-admission.mjs', values: ['DETERMINISTIC','ROUTED_LOCAL','EXTERNAL_REVIEW_READY','HELD_FOR_AUTHORITY','HOLD','ADMITTED','MANUAL_ONLY','REFUSED'] }
  ],
  provenance: {
    artifact: { app_build_sha: 'not observed (build/build-info.json is written at pack time on the Mac Studio)', evidence_state: 'UNOBSERVED' },
    substrate: { head: '065b9c66', branch: 'claude/sharp-cannon-cyrdeb', evidence_state: 'OBSERVED' },
    rule: 'Which JARVIS is this? = the artifact that is running vs the checkout it is bound to (provenance.js).'
  },
  events: [
    { at: '2026-09-23', kind: 'ruling', text: 'F0 PASS · F1 open', source: 'JARVIS-FOUNDER-WORKSPACE-01_F0_FOUNDER_ADJUDICATION_2026-09-23.md' },
    { at: '2026-09-23', kind: 'commit', text: '8b8592d9 F0 record', source: 'git' },
    { at: '2026-09-23', kind: 'commit', text: 'd4efcbfb charter', source: 'git' },
    { at: '2026-09-23', kind: 'commit', text: 'b4f73ac4 canonical merge PR #1494', source: 'git' },
    { at: '2026-09-22', kind: 'commit', text: 'd2db8896 harden O4 authority-gate evidence', source: 'git' },
    { at: '2026-09-22', kind: 'doc', text: 'ROUTING-INTELLIGENCE-01 charter status correction (R5B awaiting adjudication)', source: 'docs/programme' },
    { at: '2026-09-22', kind: 'ops', text: 'Workstation storage relief closed (worktrees)', source: 'docs/ops/WORKSTATION_STORAGE_RELIEF_2026-09-22.md' }
  ]
};
