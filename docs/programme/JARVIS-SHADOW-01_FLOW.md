# JARVIS-SHADOW-01 — Jarvis Flow · Shadow Field

```yaml
# Machine-readable cockpit. Jarvis edits this block only on a founder act or a stage exit.
flow: SHADOW-01
field: Shadow Field — Voluntary Encounter with the Unowned Self
lane: MAIA-SHADOW-FIELD-01
branch: claude/maia-shadow-practice-3pvlms   # docs only; no runtime file touched on this branch
conductor: Jarvis (conducts; is not the constitutional authority)
authority: founder
constitution: docs/programme/MAIA-SHADOW-FIELD-01_CONSTITUTION_v0.2_2026-09-06.md   # RATIFIED
acceptance_instrument: F1–F16 (FALSIFY §7)   # Acceptance Instrument v1
design: docs/programme/MAIA-SHADOW-FIELD-01_DESIGN_2026-09-06.md   # CLOSED / ACCEPTED
contract: docs/design/contracts/shadow-field.md   # Designed / Accepted · Not Live
discover: CLOSED / ACCEPTED
falsify: CLOSED / ACCEPTED
constitute: CLOSED / RATIFIED
design_stage: CLOSED / ACCEPTED
claim_state: DESIGNED · NOT LIVE
hard_stop: CROSSED   # explicit founder act 2026-09-06
prototype: OPEN — P0–P7 GREEN; P8 OPEN: technical + DB + model-behaviour (rater) verification PASS, ASSISTANT-executed (ChatGPT, against 6516a3224); FOUNDER authenticated browser / felt-experience walk PENDING (credentials unavailable to the assistant; boundary not worked around)
witness: HOLD
promote: HOLD
runtime: UNCHANGED
s1_guardian: PRESERVED AS SPECIMEN
prototype_v1_scope: Dedicated Shadow Field room only   # founder sequencing ruling 2026-09-06
invoked_entrance: DESIGNED · DEFERRED until activation-turn isolation is structurally demonstrated
merge: NOT AUTHORIZED
deploy: NOT AUTHORIZED
maia_runtime_change: NOT AUTHORIZED
current_node: PROTOTYPE / P8 open — founder walk may resume
next_possible_act: the founder's authenticated browser walk from The House → Shadow Field — seven paths plus the F16 probe
last_state_change: 2026-09-06 (House navigation tests run and PASS on a7e0aeee5 — 45 tests, 0 failed; P3 GREEN. Earlier: P3-R1 reachability repair: Shadow Field is now a member-chosen House place at /maia/shadow-field, founder-audience and interim; arriving does not enter; gates 33/0. Earlier: assistant-executed P8 technical/rater verification recorded — six adversarial model-behaviour cases PASS, first evidence for the rater halves of F4/F7/F13/F15/F16; attribution corrected from founder to assistant; five browser-walk items remain founder-pending)
```

```text
FLOW           SHADOW-01
FIELD          Shadow Field
DISCOVER       CLOSED / ACCEPTED
FALSIFY        CLOSED / ACCEPTED
CONSTITUTE     CLOSED / RATIFIED
DESIGN         CLOSED / ACCEPTED
CLAIM STATE    DESIGNED · NOT LIVE
HARD STOP      CROSSED
PROTOTYPE      OPEN · P0–P7 GREEN · P8 OPEN (assistant rater PASS · founder browser walk pending)
WITNESS        HOLD
PROMOTE        HOLD
RUNTIME        UNCHANGED
```

## 1 · The flow

```text
SHADOW FIELD
Voluntary Encounter with the Unowned Self

DISCOVER      read-only census of prior art            ↓ founder acceptance
FALSIFY       failure tests before constitution        ↓ founder ratification
CONSTITUTE    decisions, then law                      ↓ founder ratification
DESIGN        the member's journey                     ↓ founder acceptance
════════════════════ HARD STOP ════════════════════
              explicit founder act required
═══════════════════════════════════════════════════
PROTOTYPE     bounded build, Dedicated room only       ↓ founder acceptance
WITNESS       consenting human experience              ↓ founder adjudication
PROMOTE       permanent Field / House capability?      ↓
LIVE / GOVERNED
```

Stage records: `MAIA-SHADOW-FIELD-01_LANE_DEFINITION` · `…_DISCOVER` · `…_FALSIFY` ·
`…_CONSTITUTE` · `…_CONSTITUTION_v0.2` · `…_DESIGN` (all `2026-09-06`, `docs/programme/`).

## 2 · What Jarvis does at every stage

| Responsibility | Meaning |
|---|---|
| **Orient** | Tell the founder exactly where the Shadow Field is in the flow (the cockpit above is the answer). |
| **Gather** | Retrieve the governing records, evidence, prior art and falsifiers the current stage needs. |
| **Conduct** | Run bounded agents and work only inside the authorized stage. |
| **Gate** | Stop when founder authority is required. Never infer permission from momentum. |
| **Witness** | Verify that what was actually produced matches what the stage claims. |

Jarvis is the conductor, not the constitutional authority.

## 3 · Node card — where the flow stands now

```text
SHADOW-01 / HARD STOP

WHAT EXISTS
✓ Constitution v0.2 ratified (eight laws; L8 Field-scoped)
✓ Acceptance Instrument v1 — F1–F16
✓ Experience design accepted (DG-C1–C4 applied)
✓ Shadow Field contract accepted
✓ Dedicated + Invoked architecture designed

WHAT IS TRUE
Designed / Not Live. No person has experienced the Field. Runtime unchanged.
The live Shadow Guardian (S1) still fires on the ordinary path; it is a specimen, not a
dependency, and its containment is a separate act outside this flow.

NEXT POSSIBLE ACT
PROTOTYPE

AUTHORITY
Founder only

JARVIS MAY
• inspect prototype prerequisites
• assemble the bounded prototype plan
• identify affected files
• identify refusal tests
• identify isolation requirements
• estimate blast radius
• present the proposal

JARVIS MAY NOT
• write runtime code
• change schema
• modify prompts
• alter Guardian behavior
• create a prototype
• merge or deploy

UNTIL
Founder explicitly authorizes PROTOTYPE
```

## 4 · PROTOTYPE — the bounded subflow (NOT AUTHORIZED; shape only)

```text
SHADOW-01 / PROTOTYPE

P0  BOUND        exact prototype scope · Dedicated room only for v1
P1  ASSEMBLY     prove the Shadow Field owns its interpretive assembly;
                 exclude Guardian / ordinary frame producers
P2  ENTRY        member-authored activation act; no content-triggered activation
P3  EXPERIENCE   Encounter → Stay → Differentiate → Reclaim → Choose → Return
P4  MEMORY       explicit keep gesture only; no MAIA possibility persistence
P5  EXIT         immediate deactivation; withdrawal writes nothing
P6  REFUSALS     implement / run F1–F16
P7  F12          re-run the compliant-Guardian attack against the actual assembly
P8  GATE         founder adjudication
════════ STOP ════════
WITNESS requires new authority
```

**Sequencing ruling (founder, 2026-09-06).** Prototype v1 = the Dedicated Shadow Field room.
The Invoked entrance remains designed; Jarvis does not add it until activation-turn isolation can
be demonstrated structurally. Sequencing, not a reduction of the designed Field.

## 5 · The runway — prepared at the stop, not crossed

Everything below is inspection and proposal under §3 JARVIS MAY. Nothing is built, no file is
changed, no prompt exists. It is presented so the PROTOTYPE authorization act, if it comes, can
be exact.

### 5.1 Prerequisite finding — the closed registry is not v1's path

The constitution's PROTOTYPE handoff (§6) names "one registered producer `shadow-field` in the
closed canonical-turn registry." Inspection: `lib/maia/canonical-turn/producerRegistry.ts` is a
**closed** registry (`PRODUCER_REGISTRY … as const`, `ProducerId = keyof`), pinned by refusal
**R30** (no expansion of the authorized field without a policy-version bump against the
adjudicated seed `fixtures/cmt-01-pp-1-admission.json`), and it lives on the CMT-01 branch that is
**FROZEN TO A SINGLE WRITER** until the live M2 witness completes (session anchor). Registering a
`shadow-field` producer is therefore a CMT-01 act, not a Shadow Field act, and would cross a lane
boundary the flow does not own.

**Proposal.** For v1 the registry is not needed. The Dedicated room is a **separate surface**,
the pattern the Relational Navigation Room already uses: its own API route with its own prompts,
calling the model directly, honouring the `sanctuary` flag, never entering `/list` and never
importing `maiaService`. On that pattern, assembly sovereignty (constitution Part III) is
satisfied **structurally and trivially**: no ordinary-path producer can participate in a turn that
the ordinary path never assembles. F1, F5, F6 and Part III become import-graph facts. The
registry entry becomes necessary only when the Invoked entrance joins `/list`, which is already
deferred. **Founder decision at authorization:** confirm that v1 as a separate room satisfies the
§6 handoff's intent (assembly sovereignty) without the registry line, or hold v1 until CMT-01
unfreezes. Jarvis recommends the former.

### 5.2 Bounded prototype plan (proposal)

| P | Scope | Pattern in tree |
|---|---|---|
| P0 | Dedicated room only; no Invoked entrance; no astrology; no practitioner surface; one door set; the arc; keep act; exit | design §1.1, §2, §2.6, §3 |
| P1 | New route `app/api/maia/shadow-field/route.ts` + `lib/maia/shadowField/prompts.ts`; imports: model client, `enforceFieldSafety`, member identity, atoms writer for the keep act only; imports **none** of `maiaService`, `WisdomRouter`, `maia-path-revelation`, `ElementalOracleBridge`, `processingProfiles`, `panconsciousFieldRouter`, `relationalObserver`, `shadowWorkFlows`, `ShadowIntegrationTracker`, `shadow-insight` | `app/api/maia/relational-navigation/route.ts` (306 lines; direct Anthropic client; `sanctuary` flag threaded end to end); `lib/maia/relationalNavigation/prompts.ts` (invariant header + registers); `lib/nowWhat/roomGrammar.ts` (turn grammar, `LIVED_RETURN_GROUNDING`) |
| P2 | Activation = the room's *Enter the Shadow Field* gesture, sent as a typed event with `member · placed · situate` provenance; the route refuses any turn without an activation event in the session; no text is ever inspected to activate | design §1.1; constitution §2 |
| P3 | Prompt law per movement (design §2) as prompt constants under the §1 ceiling rule; movement is member-driven; Encounter precedes the projection door structurally | design §2, §4 |
| P4 | Keep act = one POST that writes a `member_memory_atoms` row with `source_type: 'spontaneous'` + `provenance` JSONB `{ origin: 'shadow-field', authoredBy: 'member', participationClass: 'placed' }` — **zero migration**; MAIA-proposed wording shown and accepted before the write; nothing else in the route writes | migration `20260521000001` (`spontaneous` requires body); `20260624000002` (`provenance` JSONB) |
| P5 | Leave = client gesture that ends the session token; the route rejects further Field turns; no closing turn is generated; Sanctuary sessions never expose the keep act | design §3, §5 |
| P6 | Refusal checks `refusal-32…` onward (tail is `refusal-31`): F1 (no lexical/semantic gate on activation), F2 (activation provenance), F5 (no member-keyed cross-turn state), F8 (single writer, member-verbatim or accepted), F11 (no score / dominant element / label), F13 (no status vocabulary), F14 (exit writes nothing), F16 (no supplied-past strings), Part III (forbidden-import list) — structural; F3, F4, F7, F15 as offline rater items on synthetic transcripts | `tests/constitutional/refusal-registry/harness.ts` `RefusalCheck`; README numbering |
| P7 | F12 rerun against the built route: the compliant Guardian cannot exist inside it (no content trigger, no hidden frame, no `/list` assembly) — recorded, not assumed | FALSIFY §2; constitution Part IV |
| P8 | Founder walk of the room; adjudication | — |

### 5.3 Affected files (proposal; none touched)

- **Door (inherit, re-point):** `components/maia/panels/JournalPanel.tsx:66-71` (button exists);
  `app/maia/page.tsx:32, 816, 1779` and `components/maia/MaiaModalManager.tsx:138` (sheet
  mount); `components/consciousness/ShadowWorkSheet.tsx` (shell kept) → body replaced by the Field
  room; `ShadowWorkGuide.tsx` retired from the door (its step-shape and body prompts inherited as
  design, not code).
- **New:** `app/api/maia/shadow-field/route.ts`; `lib/maia/shadowField/prompts.ts`;
  `components/maia/shadowField/*` (arrival, doors, movements, keep menu, Leave);
  `tests/constitutional/refusal-registry/refusal-32-…` onward + `index.ts` + README rows.
- **Shelf:** `lib/maia/fieldLab/experiments.ts` entry with the Field's `governingUncertainty`
  (*"Can MAIA participate intelligently in shadow work without becoming psychologically blind or
  acquiring concealed interpretive authority over the member?"*) — validated by
  `governance.ts:99-165`.
- **Untouched by construction:** `lib/sovereign/maiaService.ts`, `WisdomRouter.ts`,
  `maia-path-revelation.ts`, `elemental-oracle-bridge.ts`, `producerRegistry.ts`, all migrations,
  the Guardian, `agent_runs` writers.

### 5.4 Isolation requirements (what P1 must prove)

1. The route's import graph contains none of the forbidden modules (refusal test, structural).
2. The route never calls `getMaiaResponse` or any `/list` assembly (grep-level refusal).
3. No member-keyed state lives outside the request other than the session's activation token
   and the transcript the client holds (F5).
4. `enforceFieldSafety` / failure boundaries remain in the path and route **out** of the Field.
5. Sanctuary flag threaded from client to route to the keep-act gate (as Relational Navigation
   threads it).

### 5.5 Blast radius (estimate)

- **`/list` cognition:** zero. Nothing on the ordinary path is imported, edited, or registered.
- **Schema:** zero migrations if the keep act uses `spontaneous` + `provenance` JSONB.
- **Typecheck gate:** new files under `app/**` and `components/**` are inside
  `tsconfig.ship.json` and must add no diagnostics to the baseline.
- **Co-Lab release gate:** the keep act writes memory atoms, a named gate trigger — the gate must
  run before any tester wave, even though the room itself is not a Co-Lab surface.
- **Member-visible change:** the existing "Shadow Work" door opens the Field room instead of the
  inert guided flows. Members who used the old flows lose nothing persisted (the flows persisted
  nothing).
- **Quarantined tables (`ea_shadow_*`), `agent_runs` shadow rows:** untouched (DISCOVER
  dispositions stand).
- **Lane boundaries:** none crossed if 5.1 is adopted; CMT-01 crossed if the registry line is
  insisted on for v1.

### 5.6 What authorization must state, to be exact

`PROTOTYPE AUTHORIZED` · v1 scope = Dedicated room · registry decision per 5.1 · keep-act class
per P4 (or a schema act if a dedicated `source_type` is preferred) · which refusals are P6
structural vs rater · the founder walk as P8's instrument.

## 6 · Standing rules the flow carries

- Runtime is unchanged until an explicit founder act says otherwise; a "small harmless
  implementation" never crosses the stop.
- The Shadow Guardian's production containment is a **separate, narrowly bounded act**, never
  blended into this flow.
- Nothing here generalizes to other Fields or to the ordinary path (Anti-Drift Law); L8's
  promotion to an Invariant is a post-WITNESS proposition.
- Claim discipline: the Field is *Designed*; it becomes *Live* only after WITNESS and PROMOTE,
  never on prototype green.
