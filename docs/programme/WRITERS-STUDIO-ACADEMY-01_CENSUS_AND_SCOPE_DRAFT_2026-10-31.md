# WRITERS-STUDIO-ACADEMY-01 — Census and Scope (DRAFT)

```
STATUS:      DRAFT for founder ruling. Read-only census + proposed scope.
STANDING:    PROPOSED. Not AUTHORIZED. No lane opened. No code, schema, route,
             copy, or menu entry changed.
CANONICAL:   clean-main-no-secrets @ eb3394749b8f3806eabdf6f82354508585a36664
             (git ls-remote, 2026-10-31). All repo claims below cite that SHA
             via `git show/ls-tree/grep <sha>`, NOT the working tree
             (worktree is on fix/account-settings-save-feedback-20261031 @ d74b261c7,
             dirty, 34 entries — not read as product state).
REQUEST:     "Fully develop out the Writers Academy inside of Writers Studio."
```

## 1. Finding in one paragraph

**There is no Writers Academy.** Not shipped, not designed, not on a preserve branch, not in any
programme record. What *does* exist is (a) a **Learning facet** and in-room "Teach me" acts that already
deliver contextual craft teaching through the writer's own Work, under tight law, and (b) a **Soullab
Academy** that is a different product (Inner Lands, practitioner paths). "Fully develop out" therefore
means *authoring a new capability*, not finishing one — and the governing Writer's Studio law
constrains exactly the shape an "Academy" most naturally takes. The scope question is principled and
belongs to the founder before any build.

## 2. Census (evidence class: code-read at SHA unless stated)

### 2.1 What "Academy" denotes at `eb3394749`
| Referent | Where | Is it a writing product? |
|---|---|---|
| Soullab Academy | `components/academy/{AcademySheet,InnerLandsExplorer}.tsx`, `lib/academy/*`, `database/migrations/20260116000002_academy_paths.sql`, seed `20260116_seed_academy_domains_and_loralee_paths.sql` | **No.** Domains + canonical sequences + practitioner-curated paths + client enrollments. Only writing-adjacent domain label is "Integration & Worldcraft". Git history shows it moved from the nav ribbon to the Lab Tools drawer and was renamed "Soullab" (commit subjects only; hashes not re-verified here). |
| Branches `feature/academy-teaching-field-tf01-20261017`, `…immersive-primary-field-tf06-20261018`, `feature/ws-living-compass-academy-r1-20261022` | origin | **Fully merged** — `git log <canonical>..<branch>` is empty for all three. They hold no unmerged Academy design. |
| "Writers Academy" / "Writer's Academy" | Writer's Studio code, `docs/programme`, `docs/canon`, `docs/product` | **Zero matches** in `app/writers-studio`, `lib/livingWork`, `lib/manuscript`. Only `docs/programme/MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md` mentions "academy" at all, unrelated. |

Names are not identity: the Soullab Academy tables are **not** a substrate for this unless a ruling says so.

### 2.2 Teaching that already exists in Writer's Studio (so "Academy" must compose with it, not duplicate it)
- **Facets GUIDED · LEARNING · DIRECT** — `app/writers-studio/flagship/flagshipTokens.ts`; Learning = *"Help me write — and teach me as we go."* Charter: `WRITERS-STUDIO-CONVERGENCE-01_CHARTER_2026-09-21.md` §9 (FACETS-01).
- **In-room teaching acts** (tests pin them): "Teach me why this editorial direction works or does not work in this exact passage" (`p4r1EditorialDanceConvergence`), "Teach me the one writing or craft idea…" (`p4r1GuidedDepthActions`), `onDepth('learning')` (`p4r1EditorialDanceInteraction`), `Craft depth` toggle (`p4r1IsolatedEditorialRoom`). Surfaces: `develop/DevelopRoom.tsx`, `develop/ObservationDialogue.tsx`, `canvas/EditorialConversation.tsx`.
- **Standing prohibitions already in code:** `flagshipTokens.ts` — *"A `Teach` tab is not a substitute for this control"*; `canvas/WorkDrawer.tsx` + `HomeView.tsx` — *"FIELD ≠ LESSONS"*, "the room should not explain itself"; `FACET_FORBIDDEN_FRAMINGS` (beginner/intermediate/advanced/expert/skill level/recommended for you).
- **Studio map honesty:** `studioMap.ts` — `assertStudioMapHonest()` throws if a `later` destination has an `href`. No Academy/Learn/Courses destination exists; adding one as `available` before it is real is refused by construction.

### 2.3 Not measured / not opened (stated so absence is not read as clean)
- `project_ain_institute_living_inquiry.md` and `project_developmental_landscape_candidate.md` (memory) mention "academy"; **not opened**. They may bear on the *Soullab* Academy, not Writer's Studio.
- No live walk of the current Learning-facet experience was performed (skill §5). **UNKNOWN — requires the writer walk.**
- `docs/programme/WRITERS-STUDIO_AUTHOR_FLOW_INTERNAL_REVIEW_2026-10-31.md` (untracked, today) was not read; it may overlap. Reconcile before ruling.

## 3. Governing law that binds any Academy (cited, not restated as new)

From `WRITERS-STUDIO-CONVERGENCE-01_CHARTER_2026-09-21.md` and amendments:
1. **Work is primary.** The lane *subtracts and composes*; a change that increases what MAIA can DO is out of scope; one that reduces what the writer must OPERATE is in scope.
2. **L6b / §9.3 — a facet changes how much MAIA translates and explains, never how much MAIA writes.** Teaching must not become a channel for MAIA drafting more of the writer's text.
3. **L6c/L6e — never assigned, never inferred, no competence question.** An Academy cannot sort writers into levels or recommend by inferred skill.
4. **Failure condition 4 — "Learning teaches away from the actual Work rather than through it."** A detached course is the named defect.
5. **Failure condition 6 — teaching must describe technique, not prescribe quality.** Imported ideals breach the `voice` lens ("the manuscript is the reference") and Invariant 14. **This condition is not mechanically testable**: HELD as *UNKNOWN — requires human witness* unless resolved structurally (see §5, S2).
6. **Scope control — "idea-development intelligence" and four other capabilities have NO SUBSTRATE and may appear in no menu or intent list until one exists.** `assertStudioMapHonest()` binds promises about the member's book.
7. **"No additional product-capability lane may open until the spine has been walked."** Spine status (WS convergence step 8, Elemental Alchemy walk) must be established before this lane is authorized — **not verified in this census**.
8. **Sovereignty Invariants / Cultural sovereignty (Inv. 14):** no framework imposed on the writer's meaning; growth-obligation check applies (see §7).

## 4. The actual question (one question of principle)

> **Is the Writers Academy (A) the governed craft-teaching content behind the Learning facet — reached only
> through the writer's own passage and observation — or (B) a separately entered place of learning
> (curriculum/library/lessons) in the Studio?**

Why it is the boundary, not an implementation detail: two competent implementers bound by the same rules
**would** differ (A vs B), and the rules above point in opposite directions on B.

## 5. Candidate shapes

| | Shape | What it is | Law fit | Substrate today |
|---|---|---|---|---|
| **A (recommended)** | **Governed craft library behind Learning** | A bounded, reviewable set of craft ideas (technique described, not quality prescribed). "Teach me" acts *draw from* it instead of free-generating; every lesson is anchored to a passage the writer is standing in. No Academy door. | Satisfies #1, #2, #4; **resolves #5 structurally** (teaching drawn from a bounded reviewable set — the charter's own named resolution). No `later` map entry needed. | Acts + facet exist. **Library does not.** |
| B | **Academy room** | New Studio destination: lessons/sequences, optionally anchored to the Work. | Strains #1 (adds capability), #4 (default is detached), FIELD ≠ LESSONS; requires a map entry only when real; reintroduces a "Teach tab" the tokens file rejects. Needs founder lift of those lines. | None for writers. |
| C | **Reuse Soullab Academy tables** | Add a writing domain to `academy_domains/sequences`. | Name-identity risk; imports practitioner-path/enrollment semantics and elemental weighting into Work-primary space; implies member classification. | Tables exist, wrong object. |

Recommendation: **A**, delivered as a thin spine, with B explicitly parked as a later separate ruling if
A shows writers want a place to *browse* (evidence-gated, not assumed).

## 6. Proposed lane slices (ONLY IF A is ruled; each its own act, none authorized)

Ordered to follow lethality-first practice (`TESTING-01 §0`): suite and defeat candidates before implementation.

- **ACAD-0 — Census closure & precondition.** Read the two unread docs (§2.3), confirm convergence-spine status, run the §5 live walk of current Learning acts. *Evidence: walk witness + SHA.*
- **ACAD-1 — Craft-idea contract.** Define the unit (id, technique description, anchoring requirement, **no quality claim**, provenance, review state). Authority: founder ratifies what may enter the set and who reviews. Contract only; no store.
- **ACAD-2 — Falsifier suite + defeat candidates.** Mechanical: lesson not rendered without a passage/observation anchor; facet parity (same observation → same lesson id in all three facets, different depth only); MAIA-authored-prose share does not rise in Learning vs Guided; no level/competence field exists anywhere in the type; no `href` for an Academy destination while `later`. Defeat candidates: detached course, per-facet re-pick, level inference, prescriptive "good writing" copy, lesson text leaking into proposals.
- **ACAD-3 — Seed set + governed content.** Small (single digits) reviewed craft ideas, each drawn from technique visible in the writer's own Work categories (not imported canon of "good prose"). Content authored/ratified by founder; **I do not author craft doctrine unasked.**
- **ACAD-4 — Wire into existing "Teach me" acts only.** Smallest seam; no new surface; flag-gated; Develop is already flag-gated and outside COLAB-BETA-01 §5 (carried open item).
- **ACAD-5 — F6 writer walk by someone other than the founder; production witness.**

## 7. Authority, exclusions, evidence (the seven bounds)

- **Objective (proposed):** Learning-facet teaching is drawn from a governed, reviewable craft set and is always reached through the writer's own Work.
- **Scope:** `app/writers-studio/**` Learning acts, a new content contract under `lib/manuscript/**` or `lib/livingWork/**` (location to be chosen at ACAD-1).
- **Exclusions:** no Academy nav entry/route; no curriculum, courses, progress, streaks, certificates, levels; no cohort/practitioner/enrollment semantics; no use of `academy_*` tables; no change to proposal breadth, authorship authority, or coverage; no external quote/source verification, similarity search, clustering, idea-development intelligence, or edition comparison (the five no-substrate capabilities); no ranking; no MAIA/runtime canon change.
- **Authority required (not held):** founder ruling on §4; founder ratification of content set and review owner; convergence-lane reopening/precondition ruling (§3.7).
- **Stop conditions:** spine unwalked; a draft would add a level/competence signal; a lesson cannot be anchored to a passage; any path lets teaching increase MAIA-authored prose; Soullab Academy tables proposed as substrate without a separate ruling.
- **Evidence required:** code-read for contracts; runtime/test lethality (each falsifier killed by its candidate); **human witness** for "describes technique, not prescribes quality" (stays UNKNOWN until walked); writer walk for usability; production witness by a non-founder.
- **Growth-obligation check (CLAUDE.md):** *uncertainty introduced* — whether any craft statement quietly prescribes quality; preserved by a bounded reviewed set + human witness, never a proxy. *Provenance/ownership* — each idea carries author/reviewer/review date; writers' text never enters the set. *New responsibility* — Soullab now curates what is taught; that curation is accountable and revisable.

## 8. What I am NOT claiming

- That a Writers Academy was ever designed. I found no evidence it was.
- That Shape A is the only lawful reading; B is plausible with a founder lift of lines I cite.
- That the Learning acts work well for writers — unwalked.
- Anything about runtime or production; this is source at one SHA.

## 9. Disposition (superseded by §10 for the §4 question)

`PROPOSED`. Awaiting one founder ruling (§4). Until then: nothing built, nothing wired, no map entry.

## 10. Founder direction, 2026-10-31: "it can be both"

Recorded as direction on §4: **both A and B**. Not a ratification of any line below the heading *Reconciliation*; that part is my proposal.

### Reconciliation: one library, two doors
Both shapes only stay lawful if they are the **same governed content** reached two ways. Two libraries would be two truths, which is the facet-parity failure (FACETS-01) in another form.

| | Door 1 — In the Work (Shape A) | Door 2 — Academy room (Shape B) |
|---|---|---|
| Reached by | The writer's own "Teach me" act at a passage | The writer choosing to enter it |
| Anchor | The passage / observation they are standing in | A Work and a passage the writer picks; **no anchor, no lesson** (unanchored browsing is the named defect, failure cond. 4) |
| Content | Craft-idea set (ACAD-1) | **Same** craft-idea set, same ids |
| Authored text | None by MAIA | None by MAIA; the room shows technique and invites the writer back to the page |
| Map entry | None | `later` until real; `href` only when built (`assertStudioMapHonest()` unchanged) |
| Evidence | Writer walk | Writer walk **and** a measure that the room sends writers back into the Work |

### Sequencing (hard)
1. Door 1 first (ACAD-0 to ACAD-5 as in §6). It creates the library and proves teaching through the Work.
2. Door 2 only after Door 1 has a non-founder writer walk. Reason: the room is the higher-risk shape; it should open onto content already proven in context.

### Lines that must be explicitly lifted or reconciled before Door 2 is built (founder act, not assumed from "both")
- `flagshipTokens.ts`: "A `Teach` tab is not a substitute for this control" — reconcile: the room is not a facet substitute; the facet stays the only control for *how much* MAIA teaches.
- "FIELD is not LESSONS" (`HomeView.tsx`, `WorkDrawer.tsx`) — lift only for the Academy room itself, not for Home or the drawer.
- Charter §3.7: no new capability lane until the spine is walked — needs the spine status established or an explicit exception.
- Failure condition 4 stays in force for the room: every lesson must be enterable from, and returnable to, the writer's passage.

### Still excluded under "both"
No levels, tracks, progress, streaks, certificates, recommendations by inferred skill; no use of `academy_*` tables; no cohort/practitioner/enrollment semantics; no change to proposal breadth or authorship authority; the five no-substrate capabilities remain absent.

### Ratification (founder, 2026-10-31)
"Ratify, start ACAD-0": **one library, two doors, Door 2 gated behind Door 1's non-founder writer walk** is RATIFIED as the order. ⛔ This does not lift the four lines above, which remain a separate founder act before Door 2. ⛔ Authorizes ACAD-0 only (read-only census closure); ACAD-1 onward not authorized.

### Standing
Reconciliation RATIFIED (order only); Door 1 scope unchanged from §6; Door 2 gated behind Door 1's walk and the lifts above. Nothing authorized to build.

## 11. ACAD-0 closure (read-only; canonical `eb3394749`)

### 11.1 Unread records, now read
- `WRITERS-STUDIO_AUTHOR_FLOW_INTERNAL_REVIEW_2026-10-31.md`: **no overlap.** No finding concerns teaching, Learning, or an Academy (matches for teach/learn/academy/craft/facet: none). Its relevant fact: production `9856e27f7`, writers-only gate on, five accounts admitted, no invitation sent, so a non-founder walk has no cohort yet.
- Memory `project_ain_institute_living_inquiry` (Cat 1, held): ⚠️ **a THIRD referent of "Academy"**: the *AIN Institute's* Academy, one of five spaces (Observatory, Library, **Academy: "what can be taught?"**, Laboratory, Hearth). Its ruling: route Institute/Academy work through that paper's §7 rulings, *"never let this start as code"*, materials generative-not-authoritative (Inv 16). It concerns the platform's own long-form inquiry, **not** a writer-facing product. Treated as a separate lane; the Writers Academy must not borrow its name, shelves, or Tier boundary without a ruling. `project_developmental_landscape_candidate` ("College of Becoming" / "Living Academy" as naming candidates) is likewise Vision register, not a substrate.
- Three referents so far: Soullab Academy (shipped, Inner Lands), AIN Institute Academy (held direction), Writers Academy (this lane). Names are not identity; the lane name `WRITERS-STUDIO-ACADEMY-01` should stay explicit.

### 11.2 ⚠️ Correction to this draft
§3.5 and §7 say teaching-describes-technique is "UNKNOWN, requires human witness". That is **superseded** for one case: `WRITERS-STUDIO-CONVERGENCE-01_THREE-LEVEL_WITNESS_2026-09-21.md` records §X **PASS** (Learning did not prescribe) on Reader-06 observation `o2`, a 595-code-point Elemental Alchemy passage, on both the `Teach me`/`Learn more` paths, plus a turn-1 vs turn-3 certainty-drift PASS. Its own §5 limits the claim: *one observation, not a proof no depth can drift on any passage*. The earlier `THREE-LEVEL-SUPPORT` record (same day, "Learning experiential witness OWED") is the pre-walk state, preserved. **Standing for this lane: §X witnessed on one passage; NOT generalized to a curated library. ACAD-2/3 must witness the library's own content; the existing PASS does not transfer.**

### 11.3 Convergence spine status (charter §3.7 precondition)
- C5 experiential walk ✅ CLOSED (`…C5_WALK_CLOSURE_2026-09-21.md`): the loop MAIA marks → accept/question/learn/change/ignore → review in context → apply → undo → still in the manuscript; Q4, §X, Q8, Change it, custody, consent gate, apply/undo all PASS.
- Three-level support witness ✅ PASS (above).
- **Not established by me:** charter *step 8* (whole-work Elemental Alchemy walk with the EA-as-governed-knowledge unreachable precondition). I found no record titled as that walk on canonical; the C5 walk used a real EA passage. Whether C5 + three-level satisfies "the spine has been walked" is a founder reading, **flagged, not decided.**
- Door 1 touches only existing Learning acts, so it adds no new surface; the precondition bites hardest on **Door 2**.

### 11.4 Live walk of current Learning acts
**NOT PERFORMED, UNKNOWN.** Requires an authenticated writer session on the gated production surface or a seeded local stack; I do not enter credentials or use a member account. What stands in its place is the 2026-09-21 witness (§11.2), which is a different SHA era. Needed from you or another writer: walk `Teach me why` / `Teach me more` / `Craft depth` at one passage on current production `9856e27f7` and report what the writer meets.

### 11.5 ACAD-0 disposition
Census closure: **DONE except §11.4**. Nothing changed outside this document. ACAD-1 (craft-idea contract) is NOT authorized; it opens on a separate act, ideally after §11.4.

## 12. Founder direction, 2026-10-31 (later): implicit AND explicit; "connected, not the same"

**Supersedes §10's "one library, two doors" as the content model.** The §10 *order* (Door 1 first; Door 2 gated behind Door 1's non-founder writer walk and the four line lifts) is unchanged and remains ratified. Preserved, not deleted: §10's single-library table is the earlier proposal.

### Direction (founder)
The Academy is both **implicit** (teaching woven into the Work, Door 1) and **explicit** (the room, Door 2). The two **need not hold the same content, but must be connected.**

### Model
- **Tier 1, in-Work set:** small, bounded, reviewed craft ideas; what the existing "Teach me" acts draw from.
- **Tier 2, room content:** wider (longer-form, exploratory); may include material Tier 1 never uses.
- **Connection:** by declared id reference, in both directions. Not thematic overlap.

### Conditions: PROPOSED by Claude, not ratified
1. **Explicit, traceable link.** Every teaching moment shows its source idea; a Tier 1 idea with a room counterpart links to it. Implicit means available at the moment of need, never hidden shaping (no stealth). Declining a teaching moment changes nothing about what MAIA reads or proposes.
2. **No contradiction across tiers.** For a linked pair, the Tier 1 text is the short form of the Tier 2 entry. A divergence is a defect.
3. **Separate evidence.** The 2026-09-21 §X witness covers one passage and the in-Work path only; it does not transfer to Tier 1 library content or to any Tier 2 content. Each tier is witnessed for *describes technique, not prescribes quality*. Tier 2 keeps the rule that every lesson is entered from and returns to a writer-chosen passage.
4. **Higher bar for Tier 2 entry.** Reviewer and measure for room content: **founder decision, open.**

### Effect on slices
ACAD-1 (craft-idea contract) defines two tiers plus the id link, not one unit. ACAD-2 falsifiers gain: link integrity, no-contradiction for linked pairs, visible source on every teaching moment, and decline-changes-nothing. Still no slice authorized beyond ACAD-0.

### Standing
Direction RECORDED; conditions 1-4 PROPOSED; ACAD-1 NOT authorized; nothing built.

## 13. Founder direction, 2026-10-31 (later): reviewers

**Answers §12 condition 4's open question (who reviews).** Founder: *"I review and so do the beta writers."* Review of Academy content (both tiers) is by **the founder and the beta writers.**

### Proposed handling (Claude, NOT ratified)
1. **Two roles, kept distinct.** *Ratify* (what may enter a tier) = founder. *Witness* (does this idea describe technique or prescribe quality, read against the writer's own passage) = beta writers, and the founder too. A writer's witness informs the ruling; it does not itself admit content.
2. **Founder review is necessary, not sufficient.** The project's rule is that founder use is not witness; for the "describes, not prescribes" test the founder is also the author of the set, so independent reads must come from the beta writers.
3. **Per-item, attributed, revisable record.** Each idea carries who reviewed it, when, against which passage, and the verdict (describes / prescribes / unclear). A later prescriptive read reopens the item; the earlier record is kept.
4. **Beta writers' passages are theirs.** Review against their own text must not copy that text into the library, a log, or a prompt beyond the review turn, and takes their consent per the Sanctuary/consent posture. Not collected by default.
5. **No ranking of writers or ideas by reviewer votes.** Disagreement among reviewers is recorded as disagreement, not averaged.
6. **Reach.** Per the 10-31 author-flow review, five accounts are admitted and no invitation has been sent. Beta-writer review depends on that cohort being invited, which is a separate founder act, not assumed here.

### Interaction with existing gates
Beta writers walking Tier 1 in the Work can also supply the non-founder writer walk that gates Door 2 (§10), provided the walk is of the Door 1 experience on current production, recorded as such. The four line lifts are unaffected.

### Standing
Reviewers RECORDED; items 1-6 PROPOSED; ACAD-1 NOT authorized; cohort invitation NOT authorized; nothing built.

---

## 14. Founder answer, 2026-10-31 (later): "yes"

The founder answered "yes" to the §13 summary, which closed on two things:
the six handling proposals, and the observation that a beta writer's walk of
"Teach me" on current production could double as the non-founder walk that
gates Door 2.

**Reading recorded (mine, not the founder's words):** "yes" is taken as
direction to adopt §13 items 1-6 as the working review procedure, and to let a
beta writer's recorded Door 1 walk count as the Door 2 gate walk.

**Ambiguity kept visible:** the message carried no question mark and "yes"
could cover only the last sentence. If only part was meant, the founder
corrects it here and the rest reverts to PROPOSED.

**Conditions that still bind the overlap:**
- The walk counts as the gate walk only if it is recorded as that walk (writer
  account, date, which acts were used, what happened), with the writer's
  consent.
- The writer's passage is not copied into the library or any log (§13 item 4).
- It is one witness on one passage; per §11.2 it does not transfer to a curated
  library.

**Standing:** §13 items 1-6 adopted as working procedure on the founder's yes
(reading above). ACAD-1 NOT authorized. Cohort invitation NOT authorized and
not sent. Four lines before Door 2 NOT lifted. Nothing built.

## 15. ACAD-1 started (founder: "Start ACAD-1", 2026-10-31)

Authorizes ACAD-1 only: the craft-idea contract. Drafted at
`docs/programme/WRITERS-STUDIO-ACADEMY-01_ACAD-1_CRAFT_IDEA_CONTRACT_DRAFT_2026-10-31.md`
(contract only, no code, no store, no content). ACAD-2 onward, the cohort
invitation and the Door 2 line lifts remain unauthorized.

## 16. ACAD-2 started (founder: "Start ACAD-2", 2026-10-31)

Falsifier suite and defeat candidates authored at
`tests/constitutional/writers-studio-academy/` (`contract.ts`, `reference.ts`,
`falsifiers.ts`, `candidates.ts`, `matrix.ts`), plus `tsconfig.ws-academy.json`
and `npm run typecheck:ws-academy` / `matrix:ws-academy`. Bound to canonical
`eb3394749`. Uncommitted.

**Result (this machine, project node_modules):** reference 19/19 hold; 18/18
candidates dead on their named falsifier; `tsc` strict exit 0. Matrix exit 0.

- First run was NOT clean: DC-1 failed AF11 because the candidate dropped id
  ordering (a candidate isolation defect, repaired in the candidate); DC-2 failed
  AF0 because it returned nothing instead of re-picking (repaired). One
  collateral remains and is CLASSIFIED (DC-2 also fails AF11, irreducible).
- Caveats: AF5 (linked-pair divergence) is a PROXY (shared declared source),
  not a semantic check. "Describes, not prescribes" is NOT tested; it stays
  UNKNOWN pending human witness. The reference is a test double, not a design
  for the store. Lethality is decision-level, not implementation-independent.
- FREEZE NOT TAKEN (founder act). ACAD-3 (content), ACAD-4 (wiring), cohort
  invitation, Door 2 line lifts: NOT authorized. No `lib/` or `app/` change.

## 17. ACAD-2 suite FROZEN (founder: "Freeze suite", 2026-10-31)

`tests/constitutional/writers-studio-academy/FREEZE.json` pins by git blob hash:
`contract.ts` · `reference.ts` · `falsifiers.ts` · `candidates.ts`. Not frozen,
with reasons: `matrix.ts`, `tsconfig.ws-academy.json`. Guard:
`npm run verify:ws-academy-freeze` (new `scripts/verify-ws-academy-freeze.ts`,
modelled on the review-custody guard).

**Proven lethal both ways:** intact exit 0 → one appended comment line → drift
exit 1 → restored → exit 0. Matrix still 18/18 dead. `check:record-shas`
84/84 present.

**Custody caveat:** no commit has been taken, so the manifest carries
`freeze_commit_pending`, not a `freeze_commit`. The blob hashes bind the bytes
and the blobs exist in the object store, but the freeze is not in history until
the suite is committed. Local ≠ committed.

Lawful from here: implementation fails suite → repair the implementation.
Forbidden: edit a frozen file to fit. New law lands at its own address.
ACAD-3, ACAD-4, cohort invitation, Door 2 line lifts: NOT authorized.

## 18. Standing under the 2026-11-01 Semantic Field ruling (record only)

`WRITERS-STUDIO-SEMANTIC-FIELD-01_FOUNDER_RULING_MAIA_FIELD_2026-11-01.md` (founder ruling,
on canonical) moves this draft's **learning scope** to `WRITERS-STUDIO-SEMANTIC-FIELD-01` and
states that `ACADEMY-01` **does not open as a separate lane**. It also says this draft is
preserved as census evidence, and that "an Academy product" is not authorized.

Read together with §§10-17:

- **Implicit Academy** (learning inside the writer's own Work, in conversation with MAIA,
  including the Teach-me acts) belongs to SEMANTIC-FIELD-01.
- **Explicit Academy** (a separate room, Door 2) is a design possibility only. It needs a
  founder act to open.
- The ACAD-1 contract (with its §11 rulings and §12 correction) and the frozen ACAD-2 suite
  stand as **design inputs** to SEMANTIC-FIELD-01's learning work. They are not a separate
  build. ACAD-3 and ACAD-4 are not next steps of an open lane.

This section records the ruling's effect; it decides nothing new.

## 19. §11.4 closed: Teach-me reachability walk (local, 2026-11-01)

**Evidence class:** local runtime walk, not production.
- **Code:** canonical `cf8ca0ccc` served by `next dev` on the Mac Studio, against the
  disposable local database `ws-local-pg`.
- **Account:** the local test member `kelly-local` on its fictional QA Work ("Window and
  Rain", 23 words). No real account, no member data.
- **Model call:** MAIA answered through the normal editorial-turn path.

**Path a writer has to take** (each step clicked):

1. Write, then select a passage. The only control offered is **"Work with passage"**.
2. It opens a menu: Focus · Craftsman's Table · Discuss · **"More ways to work"**
   ("Revision, learning, and deeper editorial reasoning").
3. "More ways to work" expands to Revise · **"Teach me — Explain the craft already at work
   here"** · Go deeper.
4. "Teach me" does not teach. It opens the Passage Focus room ("What would help you here?"),
   where **"Teach me about the writing"** appears again as a card under "Learn from the
   passage".
5. That card is refused until two gates are met, and each refusal is honest ("Nothing has
   been sent"):
   - the privacy posture (**Ordinary / Sanctuary**);
   - **"Begin relationship with MAIA"** for this Work (one click).
6. After both, "Teach me about the writing" sends one turn, and MAIA replies "Here's what
   I'm seeing."

**Result:**
- **Reachable: yes.** It takes about six clicks and two gates before the first teaching
  reply, and "Teach me" appears twice before it works.
- **No MAIA observation is needed first.** That corrects the ACAD-1 §12 guess that the acts
  appear only after MAIA marks a passage.
- **Not reached in this walk:** "Teach me why" and "Teach me more" (follow-ups in
  `EditorialDancePanel`), "Craft depth" (`IsolatedEditorialRoom`), and "Teach me" on a
  Craftsman's Table change (`CraftsmansTableR1`).
- The facet selector (Guided · Learning · Direct) did not appear anywhere on the path.

**Against the ACAD-1 no-quality-claim rule (this one reply, read by the author, not a
reviewer).** It describes technique without prescribing quality:
- It names end-focus and shows it in the writer's own three sentences.
- It names a second move: "a verb that belongs to a hand".
- It states a cost ("end-focus is a finite resource").
- It proposes no edit ("Not to change anything, just to see what you've already chosen").
- It offers one further thought only if asked.
- Evaluative phrases ("doing all the lifting", "earns its place") describe effects; none
  states a general rule of good writing.

**Limits:**
- One passage and one model run.
- Local, not production.
- Judged by the author, not an independent reader.
- Like the 2026-09-21 §X witness, it does not generalize to other passages or to any curated
  content.

**For SEMANTIC-FIELD-01** (an observation, not a proposal):
- The teaching MAIA gives is already in the shape the contract asks for.
- What stands between a writer and it is navigation: a label that hides "learn", the repeated
  "Teach me", and two gates met only at the moment of asking.

## 20. Founder direction, 2026-11-01: teaching should be a conversation, at the writer's level

On reading MAIA's §19 reply, the founder said: *"this is great. but it would need to be
adjusted to the level of the writer and maybe more importantly part of a conversation rather
than a full info dump."*

Recorded as a **design input for `WRITERS-STUDIO-SEMANTIC-FIELD-01`**, which owns the
implicit Academy under the 2026-11-01 ruling (§18). Nothing is built or authorized by this
record.

### What causes the "info dump" (code-read at canonical)

- "Teach me" (`teachPassagePrompt()` in
  `app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx`) asks MAIA to "explain one or two
  craft moves that are already happening here".
- It runs at the `learning` depth.
- MAIA answered everything in one turn: two moves, a craft term, a cost, an experiment and an
  offer.

### "Level of the writer": how it may and may not be met

- **May not:** MAIA judges a writer's level and adapts to it. `lib/writersStudio/editorialDepth.ts`
  carries the ratified law (L6c): a depth "names what the writer wants of MAIA, never what
  MAIA has concluded about the writer". Assigning or inferring one is MAIA grading the writer.
- **May:** the writer chooses. The Guided, Learning and Direct depths already exist, member-
  chosen and changeable without ceremony (L6d), with Guided as the same default for everyone.
  The Semantic Field flow (`…_JARVIS_FLOW_2026-10-01.md`) also requires MAIA to follow cues
  the writer gives mid-conversation ("say that more simply", "teach me the craft term", "go
  deeper") without changing the underlying observation.
- **Gap found in §19:** no depth or facet choice was offered anywhere on the path to "Teach
  me".

### Shape the direction points to (proposed, not ruled)

1. One move per turn, in the writer's own words.
2. Then a question that lets the writer steer, for example "Do you want the name for that,
   or what it costs you?"
3. The craft term, the cost, a second move or an experiment come only when the writer asks.
   Depth is set turn by turn by the writer, not inferred.

Every ratified invariant still holds: no prescription of quality, anchored in the passage, no
proposed edit unless asked, and no more MAIA-written prose at any depth.

### Not decided here

- Changing the "Teach me" instruction, the learning directive, or where the depth choice is
  offered. Each is a SEMANTIC-FIELD-01 implementation act and needs its own authorization.
- Whether the change also applies to the other learning acts ("Teach me why", "Teach me
  more", "Craft depth" and "Teach me" on the Craftsman's Table).
