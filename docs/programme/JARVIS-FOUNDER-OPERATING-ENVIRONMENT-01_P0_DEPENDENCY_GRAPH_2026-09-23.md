# JARVIS-FOUNDER-OPERATING-ENVIRONMENT-01 — P0 · Dependency Graph

**Law of this graph (DC-3, carried):** an edge exists only if a record, ruling or file asserts it; every edge names its source. Nodes are requirements (R-xx, readiness matrix), acts (B1–B8 from the F2 sequence; P1–P8 from this programme), founder decisions (FD-x from F2, OE-x from the P0 docket), blockers (BL-x, blocker register) and child programmes. Observed against canonical `840194ba` · workspace tip `9b1c1acf`.

## 1 · Critical path (what must happen, in order, for Work to be live)

```
FD-3 ──► B4 projector ──┐
B1 contract+validator ──┼──► B5 renderer swap ──► B6 Work live ──► P5 acceptance (work)
B2 read organs ─────────┤        ▲                    ▲
FD-4 ──► B3 registry ───┘        │                    ├── OE-3 (RB-6B or plan-only ruling)
F1 founder walk (owed) ──────────┘                    ├── BL-1 C1 REPO_ROOT repair (owner)
FD-1 · FD-2 · FD-6 ──────────────┘                    ├── BL-2 local-native label repair (owner)
                                                      └── BL-3 O4 reconciliation (owner) — last hop only
B6 ──► OE-1 voice lane (R-16)          B2+B4+B5 ──► B7 Graph (R-09)         B3+B5 ──► Monitor live (R-10)
```

Longest chain to a usable Work surface: **F1 walk → B5 → B6 → OE-3 + BL-1** (four founder-gated steps). Everything left of B5 can run in parallel now (FD-5).

## 2 · Edge table (source named per edge)

| From | To | Relation | Asserted by |
|---|---|---|---|
| F1 founder walk | B5 | blocks (B5 builds what the walk rules KEEP/REVISE) | F2 record §5 row B5; F1R1 founder adjudication ("STOP AT HUMAN WALK") |
| FD-1, FD-2, FD-6 | B5 | required rulings | F2 §6 |
| FD-3 | B4 | required ruling (`complete:true` unlawful without it) | F2 §5 row B4; F1 contract PS-9 |
| FD-4 | B3 | required founder act (ops-script output mode) | F2 §5 row B3; storage-relief record owns the scripts |
| B1 | B2, B3, B4, B5 | provides the view-model contract every adapter targets | F2 §4–§5 |
| B2 | B6, B7, R-06, R-08 | read organs (unit list, events tail, governor report) | F2 §2 rows "List of Work Units", "Run history" |
| B4 | R-02, B7 | programme-state projection feeds Today and the Graph join | F2 §2 "Programme state"; F0 §5 |
| B5 | B6, B7, R-01 (five-surface doorway), R-11 | renderer swap is the surface every live row renders into | F2 §3, §5 |
| B6 | R-03, R-04, R-05, R-15 (plan-only), R-16 | Work live; O1→O2→O3 plan-only | F2 §5 row B6 |
| BL-3 O4 reconciliation | B6 (O4 hop only) | blocks consumption of O4 | F0 §6.3; F0 adjudication D-07; F2 §5 |
| BL-1 C1 `REPO_ROOT` | R-15 (C1 lane), R-12 | dead lane until repaired | F0 §6.1; census §2 (`main.js:1180,1181,1192`) |
| BL-2 local-native label | R-15 (`runWorkUnit` wiring) | label must match mechanism before the bridge is wired | F0 §6.2; `jarvis-runtime-pipeline.mjs:129` |
| BL-4 RB-6 embargo (Condition B) | R-15 (execution from `submit-task`), OE-3 | any Work execution path must not add effect-bearing capabilities or execute via `submit-task` without invocation authority | `JOP-04_RB-6A_CLOSURE_RECORD_2026-09-13.md:141-156`; JOP-04 charter |
| BL-5 Merge Authority NOT FOUND | R-14 | admission unreachable from this workspace | F0 §2.8; F0 adjudication D-01 |
| BL-6 no programme-record parser | R-02, B4 | projector must be written before Today can be true | F2 §2 (0 frontmatter · 171/535 State lines) |
| BL-7 no crash/relaunch handling; owner unnamed | R-12, R-13, OE-5 | reliability walk needs an owner | census §3 (0 hits) ; no record names a desktop-reliability owner |
| BL-8 installed build older than canonical | R-01 | reinstall act owed | JOP-02 (6d3c0cbc4) vs canonical `840194ba` |
| R-03 (O1 wired) | R-16 voice | voice transcript must enter the same intent seam as typed text | F2 §2 O1 seam; MAIA convergence law (`MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`) applied by analogy — CANDIDATE law, founder to ratify in OE-1 |
| OE-1 | R-16 | opens the voice child lane | this docket |
| OE-4 | R-10 (GitHub row), R-17 | read-only GitHub instrument admitted to the registry or refused | this docket; JOP-04 forbids writes |
| OE-6 | R-07 | reveal vs open capability (preload five questions) | preload.js:45 law; this docket |
| JOP-04 (invocation authority) | OE-3 | Condition B closure is the lawful lift | RB-6A closure record |
| D-02 | every P-phase | this programme is flow parent, not owner, of WORKSPACE-01 / WORK-UNIT-01 / ORCHESTRATION-OPERATOR-01 | F0 adjudication D-02; P0 charter §Authority |

## 3 · What blocks nothing (can start today, read-only or pure)

B1 · B2 · B3 (registry half; the ops-script mode waits on FD-4) · B4 (once FD-3 is ruled) · the reliability walk on the installed build (founder, Mac Studio) · the F1 walk (founder, Mac Studio) · owner repairs BL-1/BL-2 in their programmes.

## 4 · What is NOT on this graph, deliberately

Production, minisforum, databases, the MAIA member runtime, Merge Authority internals, connectors' transports, and every child programme's internal sequencing. They appear only as named external dependencies (D-01, D-04) or as *REQUIRES CONNECTOR* rows in the coverage matrix.
