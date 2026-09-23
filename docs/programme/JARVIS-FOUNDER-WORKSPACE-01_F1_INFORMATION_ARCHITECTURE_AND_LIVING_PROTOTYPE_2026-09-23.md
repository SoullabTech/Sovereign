# JARVIS-FOUNDER-WORKSPACE-01 / F1 — Information Architecture + Living Prototype over Recorded Evidence

**Lane:** `JARVIS-FOUNDER-WORKSPACE-01` · **Act:** F1 (opened by F0 founder adjudication §XII, against exact F0 candidate `8b8592d9d69e9181484cb6ac9771a1be0c3b1e84`)
**Standing:** PROTOTYPE DELIVERED · vocabulary map v1 DELIVERED · `programme-state.v1` contract + fixture DELIVERED (candidate) · ⛔ no runtime change · ⛔ F1 NOT EXITED — **exit is the founder walk** (adjudication §XV)
**Freshness:** observed against `b4f73ac4ccd9cb96e6b2b6dc7b682e689c77771f` (unchanged since F0; re-checked at F1 authoring) · fixture recorded 2026-09-23 · candidate = the commit introducing this record.

## 1 · Deliverables
| Artifact | Path | What it is |
|---|---|---|
| Living prototype | `prototypes/jarvis-founder-workspace-f1/index.html` (+ `fixtures.js`, `vocabulary.js`) | one static page, five surfaces, opens from `file://`, no dependencies, no network, no IPC, no mutation |
| Vocabulary map v1 | `prototypes/jarvis-founder-workspace-f1/vocabulary.js` → generated `docs/programme/JARVIS-FOUNDER-WORKSPACE-01_F1_VOCABULARY_MAP_V1_2026-09-23.md` | 55 entries: internal term → ordinary-language sentence → source · 51 verified · 4 marked `candidate` (rendered with a visible marker) |
| `programme-state.v1` | contract `docs/programme/JARVIS-FOUNDER-WORKSPACE-01_F1_PROGRAMME_STATE_V1_CONTRACT_2026-09-23.md` · fixture `prototypes/…/programme-state.v1.fixture.json` (generated) | D-03 projection contract with rules PS-1…PS-8 (each a falsifier for the future projector); 13 programmes projected by hand from cited records |
| README | `prototypes/jarvis-founder-workspace-f1/README.md` | how to open, what it is not, the law it is bound by |

Regenerate derived files after editing the sources (never edit the derived files by hand):
```bash
cd prototypes/jarvis-founder-workspace-f1 && node -e "global.window={};require('./fixtures.js');require('fs').writeFileSync('programme-state.v1.fixture.json',JSON.stringify(window.JFW_FIXTURES.programme_state,null,2)+'\n')"
```
(The vocabulary markdown is generated the same way; the exact script is in this lane's git history for the commit that introduced it.)

## 2 · Information architecture (as built)
One environment, one left rail (bottom bar on phones), five founder questions:

| Surface | Founder question | Composed from (recorded) | Classification (F0 §8, adjudication §II) |
|---|---|---|---|
| **Today** | What needs me? What is in motion? What changed? Where am I? | `programme-state.v1` fixture (needs_founder · stage · last_change) · workspace binding · events · Merge Authority as an external boundary | COMPOSITION for repo/work state; programme-level *what changed* demonstrated via the projection (NEW CAPABILITY: the projector) |
| **Work** | Say what I want; see current work, history, handoffs, results; pick up again | intent entry → *what JARVIS would propose* (O1→O2→O3→W0.v2 chain shown, nothing created) · illustrative W0.v2 units · git history · handoffs · results · manual §25 "continue" | COMPOSITION; the intent→proposal flow is shown as *would*, never *does* |
| **Graph** | How do programmes, decisions, work and systems relate? | 22 nodes · 19 edges, **every edge cites** a doc path, a ruling section, or a git command; kind filters; node inspector listing each connection with its evidence | NEW CAPABILITY over existing records (no join exists in JARVIS today) |
| **Monitor** | Is what I depend on actually observed and functioning? | 21 rows, local-first: this checkout · Mac Studio storage/worktrees/backups · repository health · production (deliberately not observed) · costs (not instrumented) — each with instrument, observed_at, age, evidence_state | NEW CAPABILITY as a surface; every row is COMPOSITION of one named instrument or shows the gap |
| **System** | Why does JARVIS believe that? | provenance (artifact vs substrate) · authority-at-a-glance (four permissions per programme) · **six vocabularies kept six** · searchable vocabulary map · raw `programme-state.v1` | COMPOSITION |

**Cross-cutting mechanics:** every statement row carries a *Why does JARVIS believe that?* disclosure whose technical layer (monospace) shows subject · axis · value · instrument · observed_at · evidence_state · source (DC-1). Five semantic levels are distinct in colour **and** form (dashed border for *not observed*), never one score (HU-4, DC-5). The only local state is the last-opened tab in `localStorage` (DC-2).

## 3 · Where unopened acts would appear (D-02, prototyped as places, not capabilities)
- **O7 Operator Decision Surface** — under Today → *Needs you*, a sentence states that answering here is O7's future place and that nothing is answerable yet. No affordance is offered.
- **O10 Desktop Operator Witness** — not represented as a surface; the founder walk (§6) is the act that would produce it, and F1 makes no claim that walking this prototype is it.

## 4 · How each binding law is honoured (self-check, design-level — ⛔ not the walk)
| Law | Where |
|---|---|
| HU-1 ordinary language first | every row's first line is a sentence; codes/SHAs/JSON only inside *Why?* |
| HU-2 truth layered, never removed | technical layer per row; raw `programme-state.v1` on System |
| HU-3 no restyled identifiers | labels come from `vocabulary.js` or the organ's own legibility words; an unmapped term renders inside a marked technical chip |
| HU-4 no invented health | Monitor headline is a **count** per level; no percentage, no colour without an instrument; `unobserved` dashed |
| HU-5 six vocabularies stay six | System → *Six vocabularies, kept six*; Monitor levels are a seventh **presentation** axis, never a synthesis of the six |
| HU-6 presence ≠ liveness | Builder OS / Ollama / continuity rows are *not observed — the console was not launched*; running app SHA *not observed* |
| HU-7 nothing confers authority | no Run, no Authorize, no Confirm, no Reject; the Work proposal ends in *hold* |
| HU-8 founder is a person | "Needs you" everywhere; the hard-coded name is documented in the map, not reproduced |
| HU-9 refusal is not disclosure | failures show class + fix; no payloads, credentials, member or corpus material anywhere in the fixtures |
| DC-3 edges need evidence | `graph.edges[*].evidence` mandatory; renderer draws only edges with it |
| DC-4 no new probes | fixtures only; Production row reads *not observed from this workspace · additional authority required* (D-04) |
| DC-6 vocabulary is a document | `vocabulary.js` → generated markdown; `candidate` glosses marked on screen |
| DC-7 no preload widening | the prototype is not the console; zero IPC |
| DC-8 freshness on screen | banner + rail foot carry `observed against` and the F0 candidate |
| D-05 costs | Monitor → Costs: *Cost monitoring is not instrumented yet.* — no number |
| D-06 no reject button | Work → callout states the `ACCEPTED_ADJUDICATION_REQUIRED` limit plainly |
| D-07 defects shown, not fixed | Monitor: C1 lane **Failed** (static, runtime inferred) · local-native label mismatch **needs care** · O4 **unverified** in Graph/Today |

## 5 · Defeat conditions — how the prototype can still fail, honestly
DF-1…DF-7 and the six additional conditions (adjudication §XIV) are **founder-walk conditions**. This record claims only that the design *addresses* each (§4); it does not claim any is *proved*. Two are explicitly at risk and named for the walk:
- *"the founder must already understand JARVIS's internal vocabulary"* — the Work surface's technical layer still shows W0.v2 / W2 / W3 / E1 chains; the sentence above them is the test.
- *"a technical identifier becomes the primary label because no translation was authored"* — Graph commit nodes are labelled by SHA with a sub-label; whether *51890bc0 · O4 router impl* reads as a label or as an identifier is the founder's call.

## 6 · Founder walk (the F1 exit — ⛔ not performed by JARVIS)
Open `prototypes/jarvis-founder-workspace-f1/index.html` on the Mac Studio and answer the seven questions of adjudication §XV; then rule per surface **KEEP · REVISE · REMOVE · NEW CAPABILITY REQUIRED**. Results: *Unknown — requires the founder walk* until then. Only after that does F2 open.

## 7 · Containment
⛔ `jarvis-desktop/src/**`, `preload.js`, `main.js`, `scripts/builder/**`, `app/**`, `lib/**`, `database/**` untouched · ⛔ no network/SSH/DB/provider/production access by the prototype or by this act · ⛔ no live IPC · ⛔ no hidden state · ⛔ O4 not consumed as authority · ⛔ M1R1R1 referenced only · ⛔ F2 not opened. Fixture values marked `ILLUSTRATIVE` (three Work Units) are labelled on screen and in `fixtures.js`; every other value names a recorded source.
