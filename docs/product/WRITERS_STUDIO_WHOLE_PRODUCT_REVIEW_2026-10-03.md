# Writer’s Studio — Whole-Product Review

**Date:** 2026-10-03
**Mode:** governed JARVIS whole-product review
**Review branch:** `chore/writers-studio-whole-product-review-20261003`
**Canonical anchor:** `fc8d5e19e2e832beb71df8b51baef155bf47eb8e`
**Current Writer’s Studio candidate observed:** `fix/ws-preface-refinement-20261003` at `1e1a93f4e…` during the live census
**Live local runtime observed:** `http://localhost:3700/writers-studio`
**Primary real Work:** Kelly Nezat, *Elemental Alchemy*

> This review asks whether Writer’s Studio exists as one coherent product experience, not whether its individual features work in isolation.

---

## 1. Governing product thesis

The strongest statement of the product is:

> **The purpose of editorial intelligence is not to improve the writer into someone else. It is to help the Work become more fully itself.**

The whole product should therefore help a writer move through:

**Work → understand → develop → locate → discuss → consider possibilities → revise → compare → decide → return**

without losing:
- authorship;
- voice;
- place in the Work;
- provenance;
- the distinction between evidence and interpretation;
- the right to leave good writing unchanged.

Writer’s Studio is not primarily an AI editor. It is a **creative and editorial relationship around a Work**.

The distinctive promise is not “MAIA can write well.” It is:

> **MAIA can read with depth, show what she actually read, offer possibilities without taking authority, and remain in relationship with the writer’s decisions.**

---

## 2. Evidence classes

This review keeps four evidence classes separate.

### A — live witnessed product behavior
Directly observed on the current local candidate:
- Studio Home;
- Write;
- Develop;
- Review;
- Chapter 10 → exact passage → revision proposal handoff;
- chapter-to-chapter continuity;
- return from Write to Develop.

### B — current candidate source evidence
Read from `fix/ws-preface-refinement-20261003`, including:
- editorial collaboration and authorship boundaries;
- correction succession;
- beta feedback;
- delete/remove semantics;
- current Home, Write, Develop and Review composition;
- beta/release criteria.

### C — historical programme / product records
Used as historical design intent unless reconfirmed by current evidence:
- `WRITERS_STUDIO_PRODUCT_DEFINITION.md`;
- `WRITERS_STUDIO_MASTER_BRIEF.md`;
- `WRITERS_STUDIO_HIGH_LEVEL_REVIEW_2026-09-21.md`;
- `WRITERS_STUDIO_PROGRAMME_BOARD.md`;
- beta readiness and launch records.

Several of these contain operational state that is demonstrably older than the current product and must not be treated as current merely because the files remain canonical.

### D — case-study evidence
The parallel Elemental Alchemy case-study lane is the authority for deep editorial-quality findings. This review consumes its findings when sealed; it does not duplicate that work.

---

# 3. Whole-product promise audit

## 3.1 Promise

### What already works

The internal product laws are unusually coherent:

- Work-centered, not AI-centered.
- Writer authority is explicit.
- Develop is non-mutating.
- Proposed wording is not manuscript wording.
- Apply is an authored act.
- Undo is a separate authored act.
- Correction does not erase MAIA’s prior statement.
- A writer may retain the original.
- Evidence and coverage constrain what MAIA may claim.
- Delete and Remove are distinct acts with different consequences.
- Feedback is explicit rather than passive behavioral surveillance.

These are not ordinary editor features. Together they define the editorial relationship.

### Current gap

The **product promise is not yet stated plainly enough at arrival**.

Home successfully says:
- enter a creative place;
- begin or bring a Work;
- return to real writing.

But a first-time writer does not yet receive the product’s most important assurance in ordinary language:

> Your work remains yours. MAIA can read, question and propose. You decide what anything means and what, if anything, changes.

This is an onboarding/product-language gap, not a missing architecture.

**Standing:** WATCH CLOSELY / likely pre-beta onboarding refinement, not currently a hard gate.

---

## 3.2 Arrival / Home

### Live witness

Home currently presents:

- “START OR BRING A WORK”
- New Work
- Upload / import writing
- Notes & sources
- “Welcome back to ELEMENTAL_ALCHEMY.”
- “Your last exact writing place is available.”
- “Return to this work”
- a restrained history of authored acts.

### Product judgment

This is one of the strongest surfaces.

It feels like returning to creative life rather than launching software. It avoids:
- progress scoring;
- streaks;
- manufactured recommendations;
- urgency;
- invented “continue where you left off” claims.

It orients around the Work.

### Friction

The unique editorial promise remains implicit. The Home answers **where am I?** better than **what kind of relationship is available here?**

**Standing:** STRONG, with a small promise/onboarding gap.

---

## 3.3 Write

### Live witness

Write presents the manuscript as the primary visual object.

For *Elemental Alchemy*, the writer sees:
- authored manuscript hierarchy;
- Chapter 10 and its subsections;
- the manuscript prose;
- Write / Develop / Review as modes of the same Work.

The product does not foreground an AI composition box over the manuscript.

### Product judgment

Write most closely fulfills the law:

> manuscript first.

The writer can encounter the book before encountering MAIA.

The governed revision substrate is also strong:
- exact passage binding;
- MAIA/member versions remain distinct;
- proposal ≠ application;
- writer-set revision latitude;
- paragraph-removal authority separate from latitude;
- Apply is explicit;
- Undo exists;
- leaving wording unchanged is supported.

### Current risk

The advanced editorial room contains substantial power. Its usability depends on progressive disclosure remaining disciplined. If Preferences, versions, relationships, provenance and action choices all appear at once, the Studio can become an editorial cockpit rather than a writing room.

**Standing:** STRONG substrate; WATCH cognitive load during real beta episodes.

---

## 3.4 Develop

### Live witness

Develop currently exposes, in one room:

- the complete manuscript rail;
- Overview;
- Development;
- Structure;
- Arc;
- Themes;
- Voice;
- Coherence;
- Continuity;
- Reader;
- chapter reading;
- whole-manuscript editorial pass;
- human-language intent starters;
- saved readings;
- MAIA developmental conversation;
- writer understanding;
- developmental orientation;
- intellectual lineage.

The writer is also offered humane starts such as:
- “Something feels off”
- “Help me see the shape”
- “I’m losing the thread”
- “This doesn’t sound like me”
- “I’m not sure what this chapter is doing”
- “I don’t know — help me look”

### Product judgment

Develop contains some of the product’s best intelligence and its largest coherence risk.

The **human-language intent layer is the correct foreground**.

The lens taxonomy, saved-reading machinery, developmental orientation and lineage systems are valuable expert capabilities, but together they can ask a writer to understand the software before the software has helped the writer understand the Work.

This is the most important whole-product UX question before beta:

> **Can Develop begin simply enough that a writer can say what they are wondering, while all of the advanced apparatus remains available without becoming the entrance fee?**

### Important recent repair

A live continuity defect was found and repaired:
- selecting another chapter inherited stale Develop context;
- chapter-root selection could cover a completed Chapter Review with a generic locus screen;
- “Show me an edited version” did not actually request an edited version.

The repaired flow was live-witnessed:
- Chapter 10 → exact evidence → `try-revision` → editorial turn HTTP 200;
- proposal rendered;
- no Apply gesture;
- return to Chapter 10 analysis;
- Chapter 9 independent analysis;
- return to Chapter 10;
- final chapter-switch witness PASS.

### Product recommendation

Do **not** remove advanced Develop capability.

Instead:
1. foreground the relational/question-first arrival;
2. make chapter-level “MAIA read this” the obvious next act;
3. keep lenses as “ways MAIA can look,” not destinations the writer must learn;
4. keep saved readings/history reachable but secondary;
5. keep lineage and specialist analysis available behind deliberate acts.

**Standing:** MOST IMPORTANT EXPERIENCE AREA TO WATCH IN BETA. Not a reason to delay beta if the simple foreground is coherent.

---

## 3.5 Review

### Live witness

Review currently says, explicitly:

> “Review opens saved readings. Entering this room does not ask MAIA to read anything again.”

It distinguishes:
- Quick reread;
- Deep Review;
- Saved Reviews.

It also says:

> “Quick reread is not a full multi-lens Review and never changes your writing.”

### Product judgment

This is excellent epistemic UX.

The room tells the truth about:
- whether MAIA is reading;
- what kind of reading is occurring;
- what has already been read;
- whether anything can change the Work.

Review is a strong example for the rest of the product: **name the act before performing the act.**

**Standing:** STRONG.

---

# 4. Editorial relationship audit

## 4.1 The relationship the product is trying to create

The desired progression is:

1. “It understands what I am trying to protect.”
2. “It is showing me possibilities, not correcting me.”
3. “Ah. Yes. That is what I was trying to say.”
4. “Those are still my words and my thinking.”
5. “I know exactly what changed and why.”
6. “I can keep the original.”
7. “It remembers what I rejected and what I meant.”

The candidate now has meaningful substrate for this relationship.

## 4.2 Editorial covenant in current candidate

The shared editorial intelligence directive includes:

- do not make the writer sound like the model or a conventional ideal;
- help the Work become more fully itself;
- protect voice, thought, imagery, cadence, vocabulary, medicine and degree of certainty;
- treat unusual spiritual, clinical, technical, cultural and personally coined language as potentially meaningful;
- prefer the smallest sufficient intervention;
- make what changed and why legible;
- do not evaluate the writer for literary worth;
- leaving the passage unchanged is a valid editorial outcome.

This covenant is product-defining and should remain a central regression target.

## 4.3 “AI smell” falsifiers

The whole product should treat the following as defects:

- needless rewriting;
- smoother-but-less-true prose;
- generic praise;
- editorial jargon replacing human language;
- treating repetition as inherently bad;
- flattening spiritual, clinical, technical or cultural vocabulary;
- replacing the writer’s vocabulary with model vocabulary;
- confident claims about reader effects;
- treating symbolic or interpretive language as factual identity;
- generating an edit merely because the writer pressed a button;
- endless analysis that prevents returning to writing;
- hiding the option to keep the original.

---

# 5. Trust, correction and authorship

## 5.1 Correct MAIA

Current candidate behavior:

- “Correct MAIA” is attached to an exact persisted MAIA turn.
- The writer is asked: “What should MAIA carry forward instead?”
- Correction kinds remain distinct.
- Corrections are append-only.
- The original MAIA turn remains unchanged.
- The newest correction for that exact turn becomes the current working understanding.
- Correction text is explicitly **not manuscript prose** and grants no editing authority.

This is a major product strength.

### Beta evidence still worth obtaining

The Small Beta contract correctly notes that **authenticated correction persistence** requires a real post-migration witness.

**Standing:** MUST WITNESS before cohort expansion. A single authenticated production proof is sufficient; this does not need another feature programme.

---

## 5.2 Beta feedback

The beta feedback membrane is:
- available only with beta presentation intent **and** server-verified pilot membership;
- explicit;
- writer-authored;
- bounded to orientation metadata plus an optional note.

Signals include:
- I lost the thread
- MAIA misunderstood me
- Too much too quickly
- I wanted more help
- This felt like my voice
- This changed how I see the Work
- I’m not ready to decide
- Something else

The schema explicitly excludes:
- passive dwell;
- engagement;
- clickstream;
- inferred emotion;
- manuscript body telemetry.

This matches the product’s human-agency philosophy.

**Standing:** STRONG. MUST WITNESS one authenticated successful production submission and one non-beta refusal.

---

## 5.3 Delete and Remove

The candidate distinguishes:

**Remove Work**
- removes the container/arrangement;
- writing survives.

**Delete Work and writing**
- deletes writing, sections, drafts and original imported file;
- server-side transaction;
- no optimistic success;
- refusal if custody cannot be honestly confirmed.

This is unusually clear and should inform participant-facing beta disclosure.

**Standing:** STRONG.

---

# 6. Participant-owned manuscript beta boundary

A historical beta-data ruling correctly distinguishes:

### Phase A — controlled-manuscript usability beta
Founder-authorized or licensed manuscripts.

### Phase B — participant-owned Work beta
Requires truthful disclosure of:
1. actual retention;
2. storage location;
3. deletion;
4. MAIA reading retention;
5. logs/telemetry;
6. training/use policy;
7. plain-language participant disclosure;
8. explicit consent;
9. sample-material alternative.

Current source evidence establishes substantial parts of this:
- deletion semantics are explicit;
- correction retention is explicit;
- beta feedback retention is explicit;
- beta feedback excludes manuscript-body behavioral telemetry;
- the beta ruling says participant writing is not to be used for model training.

Still to reconcile against the exact production candidate:
- storage/backup location and recovery boundaries;
- retention of readings/observations/revision history after Work deletion;
- member-safe operational logs;
- current provider path disclosure;
- current training/use policy language suitable for an outside participant.

**Standing:** MUST RECONCILE before ordinary outside writers upload private manuscripts.

This does **not** block a controlled beta using founder-authorized / licensed material.

---

# 7. Programme / custody reconciliation

## Finding

The product has advanced faster than several canonical programme records.

For example:
- the canonical Programme Board still reports Stage 7 building and Stage 8 blocked from early September;
- the current candidate contains sophisticated Develop, Review, revision, correction, beta-feedback and continuity behavior;
- the Production Launch record remains formally parked with no candidate SHA;
- numerous Writer’s Studio changes remain distributed across active PRs / stacked branches.

### Product consequence

A beta participant experiences **one product**.

Engineering currently holds evidence as a distributed stack.

Before cohort launch, there must be one named beta candidate with:
- exact SHA;
- exact migration state;
- exact provider configuration;
- exact route;
- exact release/rollback record.

This is release custody, not feature development.

**Standing:** HARD PRE-BETA GATE.

---

# 8. Lived journey assessment

The intended journey is:

### Arrival
“I am back with my Work.”

**Observed:** strong.

### Orientation
“I know what I can do here without knowing the system.”

**Observed:** strong on Home, mixed in Develop.

### Understanding
“MAIA has actually read this, and I know what she read.”

**Observed:** strong provenance architecture; case-study lane will judge editorial quality.

### Development
“I see something useful about the Work rather than receiving generic analysis.”

**Observed:** promising and deep; largest information-density risk.

### Passage
“I can move from an observation to the exact words that gave rise to it.”

**Observed:** live witnessed.

### Editorial relationship
“I can discuss before changing.”

**Observed:** supported.

### Revision
“I can ask for a possible version without surrendering authorship.”

**Observed:** live witnessed after `try-revision` continuity repair.

### Decision
“I decide whether anything changes.”

**Observed:** structurally strong: Apply / Keep / member version / Undo.

### Return
“I can leave and come back without losing what we were doing.”

**Observed:** chapter/passages have substantial continuity evidence; full production ordinary-door return remains a release witness.

---

# 9. Beta launch ledger

## A. Must fix / prove before a small external beta

1. **Freeze one exact candidate SHA.**
2. **Deploy that exact SHA and verify production identity.**
3. **Run the founder ordinary-door production journey**:
   Home → Write → Develop → evidence → proposal → Apply → Undo → leave → return.
4. **Witness authenticated Correct MAIA persistence.**
5. **Witness authenticated beta-feedback persistence.**
6. **Witness non-beta refusal.**
7. **Reconcile participant-owned manuscript data disclosure** before asking outside writers to upload private Work.
8. **Define and test rollback for the exact beta artifact.**
9. **Zero tolerance:** lost writing, silent mutation, broken Undo, false provenance, ignored correction, consent/data-boundary breach.

## B. Watch closely during beta

1. Develop information density.
2. Whether writers understand “reading” vs “conversation” vs “revision.”
3. Whether “show me an edited version” feels like help rather than model takeover.
4. Whether writer-set revision latitude is understandable without becoming settings bureaucracy.
5. Whether writers can find their way back to the Work after a deep MAIA conversation.
6. Whether MAIA’s praise is earned and specific rather than soothing.
7. Whether writers increasingly use their own judgment rather than outsourcing ordinary decisions.

## C. Later capabilities — do not block this beta

- full Design Studio;
- publishing/distribution completion;
- broad Field-object gathering;
- spoken-story-to-book automation at full depth;
- all expression types;
- advanced similarity / source-verification systems;
- every historical roadmap capability;
- model councils for ordinary editorial turns.

## D. Deliberately do not build

- engagement/streak mechanics;
- hidden writer scores;
- automatic “quality” ranking of the person;
- silent manuscript mutation;
- ambient extraction of participant writing for beta telemetry;
- automatic normalization of unusual language;
- automatic acceptance of MAIA revisions;
- opaque “improved version” replacement;
- AI-authored meaning presented as the writer’s recognition;
- features whose main effect is making the writer learn more software.

---

# 10. Current whole-product determination

Writer’s Studio is already more than a collection of editing tools.

The coherent product now visible is:

> **A place where a writer can bring a living Work, encounter it at multiple scales, think with MAIA about what it may need, explore possible changes without surrendering authorship, and return to the Work with greater clarity.**

The strongest product advantages are:
- authorship architecture;
- evidence/provenance;
- restraint;
- relational correction;
- continuity;
- the ability to leave wording unchanged.

The largest current product risks are:
1. **Develop complexity**
2. **product promise remaining too implicit**
3. **release/candidate custody fragmentation**
4. **participant-owned manuscript disclosure not yet reconciled to the exact candidate**

The first two are experience risks.
The last two are beta-governance risks.

The product should not wait for the entire historical Writer’s Studio roadmap before learning from trusted writers.

It should, however, refuse to invite writers into an artifact whose identity, return behavior, correction persistence or private-manuscript data posture cannot be stated exactly.

---

# 11. Next review acts

The whole-product review proceeds in this order:

1. ingest sealed case-study findings when the parallel lane produces them;
2. perform one independent AI-smell / editorial-covenant review of those findings;
3. reconcile exact candidate data lifecycle and production identity;
4. run the founder production beta journey;
5. classify each observed issue as:
   - beta blocker;
   - beta observation;
   - later capability;
   - deliberate non-build;
6. freeze the final Whole-Product Review and beta launch ledger.

No implementation should begin from this document unless a specific finding is separately authorized.

---

# 12. Independent challenger review and adjudication

A local independent model-family challenge (`gpt-oss:20b`) was run read-only against this review draft. Its output is advisory evidence, not product authority.

## 12.1 Accepted challenges

### A. Temper claims about “depth” and relationship

The challenger correctly noted that live UI/runtime evidence can establish:
- exact coverage/provenance mechanisms;
- explicit writer authority;
- continuity behavior;
- governed proposal/application boundaries.

It cannot, by itself, establish the human conclusion that MAIA “reads deeply” or that the relationship feels genuinely understanding to writers.

Those remain **human/product outcomes** to be established by case-study evidence and beta writers.

**Correction to this review:** where “depth” is used as a product advantage, read it as *the architecture supports accountable depth-reading* unless a human witness specifically establishes the qualitative outcome.

### B. Develop cognitive load needs a human falsifier

Accepted.

The source/live census shows unusually high visible capability density in Develop. Whether that is overwhelming is an experiential question, not settled by code review.

Required beta falsifier:

> Can a writer who has never seen the architecture enter Develop, state an ordinary-language concern, understand MAIA’s first response, and return to writing without learning the lens taxonomy?

### C. Production Undo / return integrity remains owed

Accepted.

Local live evidence has shown:
- explicit Apply;
- Undo restoring original bytes in the Chapter 10 mutation witness;
- chapter/passages returning coherently.

The release claim still requires the exact production artifact to prove:
- Apply;
- Undo;
- leave;
- ordinary-door return;
- exact wording/state restored and intelligible.

### D. Data-lifecycle audit must include MAIA reading/log retention

Accepted.

Beta-feedback privacy alone does not answer:
- what developmental readings persist;
- what editorial threads persist;
- what operational logs contain;
- what backups retain;
- what deletion removes or does not remove;
- what provider processing occurs.

These must be reconciled before Phase B participant-owned Work beta.

## 12.2 Rejected challenger proposals

### A. Reject “author-voice similarity scores” as a beta truth instrument

A lexical/syntactic similarity score would be a weak proxy for the product’s actual law.

It could reward:
- superficial imitation;
- preservation of verbal ticks while altering meaning;
- low-change edits that still flatten epistemic or spiritual nuance.

Writer’s Studio should instead evaluate authorial preservation through:
- exact diff visibility;
- changed-word / changed-paragraph extent;
- smallest-sufficient-intervention evidence;
- explicit protection statements;
- whether Keep original remains a valid outcome;
- writer judgment;
- case-study review of what was gained and lost.

No hidden voice score should be introduced.

### B. Reject a new “AI-off mode”

Write already permits writing without commissioning MAIA.

The product should reduce mode proliferation, not add another mode to express a permission boundary already available through explicit acts.

The stronger law is:

> **MAIA acts only when invited; writing remains usable without inviting her.**

### C. Reject weakening rollback because the cohort is small

The current release contract marks rollback as a stop-on-fail gate.

A small cohort carrying meaningful private work is not a reason to weaken recovery discipline.

Rollback remains a hard beta gate.

## 12.3 Revised next three falsifiers

### F1 — Authorial-preservation falsifier

Use the sealed Elemental Alchemy case study and at least one different writer.

For every proposed revision:
- show exact original and proposal;
- record intervention extent;
- require a stated editorial purpose;
- require what is protected;
- require the strongest case for keeping the original;
- permit Keep/no-op;
- ask the writer whether the result is more faithful, less faithful, or simply different.

**Defeat condition:** Studio systematically produces smoother prose that writers experience as less theirs, even when scope limits technically pass.

### F2 — Production return/undo falsifier

On the exact beta candidate:
- ordinary member entry;
- select an exact passage;
- obtain a proposal;
- Apply;
- verify exact applied bytes;
- Undo;
- verify exact predecessor bytes;
- leave Studio;
- return through ordinary Home;
- confirm Work/place/thread orientation remains intelligible.

**Defeat condition:** any silent mutation, non-exact undo, lost place, false success, or unrecoverable authored state.

### F3 — Participant-data boundary falsifier

For the exact beta candidate, produce a plain-language data map and verify it against runtime/schema:
- manuscript/source storage;
- draft/revision storage;
- developmental readings;
- editorial conversations/versions;
- corrections;
- beta feedback;
- operational logs;
- provider processing;
- backups;
- Delete behavior;
- retention after deletion;
- model-training policy.

**Defeat condition:** any participant-facing claim cannot be tied to an observed/configured behavior, or deletion/retention cannot be described accurately.



---

# 13. Data lifecycle reconciliation — deletion and derived records

## 13.1 Manuscript-linked records

Current candidate schema shows broad manuscript-scoped deletion relationships:

- working draft → manuscript: `ON DELETE CASCADE`;
- working draft revisions → draft: cascade;
- draft sections → draft: cascade;
- authored structure → manuscript: cascade;
- developmental readings → manuscript: cascade;
- developmental standing events → reading: cascade;
- chapter review runs → manuscript: cascade;
- work themes / occurrences → manuscript and reading: cascade;
- Writer’s Studio return state → Work/manuscript/section: cascade;
- writer editorial relationship → Work/manuscript: cascade;
- writer correction → Work / exact ask turn: cascade.

This supports the product claim that deleting a manuscript/Work removes the manuscript-attached developmental substrate rather than simply hiding the Work.

## 13.2 Beta feedback deliberately survives manuscript deletion

`writer_studio_beta_feedback.manuscript_id` uses `ON DELETE SET NULL`.

Therefore an explicitly submitted beta-research record may remain after the manuscript itself is deleted, but no longer retains the manuscript FK.

This is not a contradiction: the writer explicitly authored a separate beta note. It **must**, however, be stated in beta research disclosure because “Delete my Work” and “Delete the research feedback I voluntarily submitted” are separate acts.

## 13.3 Uploaded source bytes

The erasure path:
1. deletes manuscript/database custody transactionally;
2. records vault byte paths in `vault_erasure_queue` inside that transaction;
3. attempts an immediate proven-destruction sweep;
4. retains any failed obligation durably for retry.

An older comment in `eraseManuscript.ts` says autonomous scheduling remained owed. That comment is now stale relative to the current candidate.

Current candidate evidence:
- `scripts/run-media-worker.ts` consumes vault-erasure obligations independently of media-job success;
- the erasure step runs in the worker loop and retries outstanding obligations;
- its log path reports counts, not member/manuscript content;
- the dedicated witness creates an intentionally abandoned erasure obligation, launches the media worker, and proves the worker clears the queue and destroys the bytes **without a manual sweep**.

Current production evidence:
- `maia-media-worker` is running healthy;
- `vault_erasure_queue` currently reports `0` outstanding obligations.

**Determination:** autonomous byte-erasure recovery is implemented and has an explicit falsifier. The stale source comment should be reconciled later as documentation debt, but its old warning must not be repeated as current product truth.

## 13.4 Erasure logging

The low-level immediate sweep logs `artifact_ref` when an erasure remains owed. Current artifact refs are vault-relative opaque locators under `manuscript-sources/` constructed from a timestamp/hash-derived id plus file extension; the participant's original filename is stored separately and is not embedded in that locator.

This is still noisier than the media worker's count-only logging and may be worth normalizing, but current evidence does not support treating it as manuscript-content exposure.

**Standing:** log hygiene / later hardening, not a small-beta blocker.


---

# 14. Data lifecycle reconciliation — inference providers

## 14.1 Writer’s Studio structured inference is deliberately non-fallbackable

The current candidate routes developmental reading, attention-map synthesis, and editorial turns through the shared structured inference seam.

The seam's law is:

- `primary` → execute the pinned structured request through the external structured provider;
- `sovereign` / `local_only` → use a local structured provider if one exists, otherwise refuse;
- no silent fallback from a structured request into the generic chat/text-model path.

Today the local structured provider is explicitly unavailable. Therefore a structured Writer’s Studio call either reaches the authorized external structured provider exactly or refuses.

This is good provenance/sovereignty architecture: a local text model cannot silently impersonate the model named in a frozen reading.

## 14.2 Current primary provider

The developmental reader and editorial runtime default to Claude-family model pins when no capability-specific environment override is present.

Production currently exposes no explicit `MAIA_INFERENCE_MODE` and no Writer’s-Studio-specific model override in the container environment. Under the structured policy, an unset inference mode resolves to `primary`.

Therefore, under the current primary posture, manuscript prose commissioned for structured developmental/editorial inference may be sent to Anthropic.

This must be disclosed plainly for participant-owned Work.

## 14.3 Training policy versus provider processing

Soullab's beta-data ruling states:

> do not use participant writing for model training.

That is a Soullab product/research policy.

Current Anthropic public commercial/API materials state that API/commercial customer content is not used for model training by default. Anthropic also documents zero-data-retention configurations for eligible API customers.

Those statements do **not** establish Soullab's exact account-level retention configuration.

The beta disclosure therefore needs to distinguish:

- **training:** Soullab does not use participant writing to train models; current Anthropic API/commercial policy also says API customer content is not used for model training by default;
- **processing:** some commissioned Writer’s Studio intelligence is currently processed by Anthropic under the primary configuration;
- **retention:** Soullab must establish the exact Anthropic account/contract retention posture before claiming a retention period or zero-data-retention status.

**Standing:** exact provider-retention configuration is a Phase-B participant-owned-manuscript disclosure gate. It does not block a controlled-material beta.



---

# 15. Small-beta cohort boundary

The current Writer’s Studio route is not itself gated by the small-beta predicate.

The beta predicate governs the **feedback membrane**:
- `beta=1` expresses presentation intent;
- the server separately verifies that the member is an active, member-linked `beta_tester` (or founder/CTO witness);
- without both, the beta feedback control does not become available.

Production currently contains 41 active, member-linked `beta_tester` contact records. They are historical beta contacts rather than a Writer’s-Studio-specific cohort; most carry broader Soullab beta/consciousness-pioneer grouping.

The existing contact model already supports `metadata.groups` and `metadata.tags`. No Writer’s Studio-specific marker is currently present.

## Product/research implication

This does not mean 41 people can suddenly see a private Writer’s Studio build merely because the feedback predicate exists. It does mean that the **research evidence** from `writer_studio_beta_feedback` is not intrinsically scoped to a named Writer’s Studio cohort.

For a small invited-writer beta, choose explicitly between:

1. **invitation discipline only** — only selected writers receive `beta=1`, while broader beta members remain technically eligible if they somehow use that URL; or
2. **cohort-bound feedback** — add/reuse a Writer’s Studio group/tag in `ops_contacts.metadata` and require it in the beta-access predicate.

The second gives cleaner research provenance without creating a second account or roster system.

**Standing:** pre-cohort research-governance decision. It is not a Writer’s Studio authorship/safety blocker, but should be settled before interpreting beta feedback as evidence from a defined writer cohort.


---

# 16. HARD FINDING — total erasure and append-only editorial history conflict

## 16.1 The two valid laws

Writer’s Studio currently carries two individually principled laws.

### Total Work erasure

The member-facing deletion law states:

> **The Work is gone.**

It explicitly refuses definitions of Delete that mean:
- hidden;
- archived;
- detached;
- unreferenced but retained.

The manuscript erasure path deletes manuscript-linked database custody and source bytes, and refuses to report complete custody while byte destruction is unconfirmed.

### Authored editorial history

The editorial ontology also deliberately protects authorship history:

- `proposal_chains` are append-only;
- `proposal_versions` are append-only;
- `proposal_chain_insights` refuse ordinary deletion;
- `proposal_chain_directions` refuse ordinary deletion;
- child relations use `ON DELETE RESTRICT`.

This protects a real and important truth during the life of a Work: later activity must not silently rewrite who authored what.

## 16.2 Where the laws collide

A `proposal_chain` stores content-bearing material:

- `expected_text` — exact author passage;
- `proposal_versions.formulation` — proposed/member/MAIA wording;
- editorial observations and directions may also contain Work-specific language.

But `proposal_chains.work_id` is intentionally a bare UUID. It has **no foreign key to `member_manuscripts` or `living_works`**.

Production constraint inspection confirms the only external FK on `proposal_chains` is:

- `member_id → members(id) ON DELETE RESTRICT`.

The current `eraseManuscript()` path does not explicitly erase or constitutionally retire:
- proposal chains;
- proposal versions;
- proposal-chain insights;
- proposal-chain directions.

The existing total-erasure witness likewise does not seed a real editorial proposal chain before erasing the manuscript.

Therefore current evidence cannot support the claim that **Delete Work and writing** ends custody of all reconstructive editorial text after the Work has entered the revision/editorial system.

## 16.3 Production standing

Read-only production evidence at review time:

- proposal chains: 10;
- proposal versions: 5;
- proposal-chain insights: 0;
- proposal-chain directions: 0;
- proposal chains with a currently live manuscript UUID: 10;
- proposal chains without a live manuscript UUID: 0;
- proposal versions on an orphaned chain: 0.

So there is **no observed production orphan residue today**.

The finding is structural and prospective: the present schema can permit editorial content to outlive a later manuscript deletion unless a separate erasure authority/order handles it.

## 16.4 Product determination

This is a direct conflict between:
- **ordinary-history immutability**, and
- **the member’s higher-order total-erasure act**.

The editorial schema itself anticipated that possibility:

> constitutional erasure, if it ever applies, is a separate authority with an explicit deletion order.

Writer’s Studio now has that higher-order product promise. The two laws need explicit reconciliation.

**Standing: HARD BLOCKER for Phase-B participant-owned Work beta.**

It does **not** establish that controlled/founder-authorized beta material is unsafe to use. It does mean ordinary external writers should not be told that Delete ends custody of their private Work until editorial-history erasure has been implemented and witnessed.

## 16.5 Required falsifier before clearing

Create a disposable manuscript under the exact candidate and perform a real governed editorial episode that produces:
- proposal chain;
- at least one proposal version;
- any other content-bearing editorial child rows reachable in the normal product path.

Then invoke the ordinary **Delete Work and writing** member act.

The witness must prove:
1. the member-facing delete succeeds only if total custody succeeds;
2. manuscript/drafts/sections/readings are absent;
3. proposal chain/version/editorial content capable of reconstructing wording is absent;
4. source vault bytes are absent or truthfully remain as an owed erasure until the autonomous worker clears them;
5. no surviving record contains the sentinel manuscript/editorial text;
6. an unrelated bystander Work remains intact.

**Defeat condition:** any exact author passage, proposal wording, or reconstructive editorial content survives the total-erasure act, or immutability makes the member’s higher-order erasure impossible.

No repair design is authorized by this review. The review establishes the product contradiction and the acceptance condition only.


---

# 17. Candidate-wide safety suite

A detached worktree was created at the exact candidate reviewed here:

`1e1a93f4ee04d7722a02c460ee0f4a9e85b8e649`

The following cross-product safety suites were run together:

- small beta authorship;
- editorial recovery;
- Develop → Focus continuity;
- relational Develop guidance;
- Attention Map continuity;
- adoption requires writer gesture;
- capture on leave;
- section save queue;
- Work deletion;
- keep-a-version.

Result:

> **10 suites · 117 tests · 117 PASS · 0 FAIL**

This strengthens the evidence for:
- explicit writer authority;
- save/leave reliability at the tested layer;
- editorial recovery;
- chapter/passage continuity;
- beta correction/feedback boundaries;
- current deletion path behavior.

### Critical limit of this green suite

The existing deletion suite does **not** seed the newer append-only editorial proposal ontology before invoking total Work erasure.

Therefore the 117/117 PASS does not falsify Finding 16.

The correct interpretation is:

> the tested safety contracts are green, and one newly identified cross-subsystem erasure contract is not yet represented in the suite.



---

# 18. Mobile scope

A read-only 390×844 witness was run across Home, Write, Develop and Review.

Observed:
- no horizontal document overflow on any of the four primary rooms;
- Home remains compact and legible;
- Develop and Review remain structurally contained;
- Write successfully renders the long *Elemental Alchemy* manuscript, but the mobile page becomes approximately 53,000 px tall in the witnessed state.

This establishes basic responsive containment, not comfortable manuscript-scale mobile authorship.

The historical beta-readiness ruling also withheld flagship mobile beta until the integrated mobile adventure loop was accepted. Current evidence does not supersede that with an end-to-end mobile writing/revision witness.

## Recommendation for the first writer cohort

Define the initial small beta as **desktop/laptop-first**.

Mobile may remain reachable, but:
- do not recruit participants specifically to evaluate Writer’s Studio on phone;
- do not advertise mobile manuscript-scale authoring as a beta promise yet;
- treat any mobile findings as opportunistic observation until a dedicated Write → Develop → revision → return mobile journey is witnessed.

**Standing:** beta scope definition, not a blocker to a desktop/laptop cohort.


---

# 19. Case-study evidence ingested — editorial quality and semantic provenance

The parallel *Elemental Alchemy* refinement lane reached a clean committed state at:

`77750c075 — docs(writers-studio): record Preface council and source audit`

The whole-product review ingests these committed findings without altering the case-study lane.

## 19.1 Strong confirmation of the editorial covenant

The independent Preface council’s current disposition is:

> **KEEP the Preface prose by default while deeper evidence is gathered.**

The council specifically protects:
- the isolated Zhuangzi epigraph;
- present-tense dream immediacy;
- concrete sensory anchors;
- the first experiential elemental articulation;
- uncertainty and mystery;
- the Call to Adventure's transfer of authority to the reader;
- the rhythm of other voices beside autobiographical vulnerability.

It declines substantial rewriting and repeatedly asks for the strongest case for Keep.

This is strong evidence that the preservation-first editorial covenant can produce the relationship Writer’s Studio intends.

It also separates:
- literary judgment;
- production/source-fidelity artifacts;
- quotation/attribution/permissions verification.

That separation is product-correct: source cleanup should not become an excuse to rewrite the author’s prose.

## 19.2 Whole-book synthesis shows useful restraint

The provisional whole-book compass:
- marks under-read chapters as under-read rather than approved;
- names supported patterns and unknowns separately;
- identifies deeper-reading priorities instead of manufacturing a complete arc;
- explicitly says not to use the compass to justify broad rewriting.

This is good evidence for accountable uncertainty.

## 19.3 HARD QUALITY FINDING — structurally bound evidence can still be semantically false

The Preface overview produced an observation stating:

> the sudden shift from the intimate **campfire scene** to the formal Part One heading creates tonal dissonance.

The sealed Preface evidence at that juncture contains no campfire scene.

Campfire material exists elsewhere in the book, including Chapter 1 and Chapter 5.

The independent council correctly rejected the rationale because the concrete scene it names is absent from the sealed Preface text.

### What this proves

The current evidence system can establish:
- a valid frozen reading;
- a valid section/evidence reference;
- a typed observation;
- a declared non-conclusion.

But those facts alone do not establish that every concrete assertion in the observation is entailed by the cited evidence.

A model can attach a semantically contaminated statement to an otherwise valid evidence reference.

### Product consequence

This is not ordinary editorial disagreement.

A writer is being told that MAIA saw something in **this** passage/chapter that the cited text does not contain.

That is a provenance/evidence-trust failure.

The Small Beta law already names provenance failure as a hard gate.

**Standing: HARD GATE for external writer beta until the known defeat is caught by a repeatable semantic-evidence falsifier or an equivalent product safeguard.**

## 19.4 Required semantic-evidence falsifier

At minimum, a developmental observation that names a concrete textual object, image, scene, term, quotation, event or transition must survive a check against the evidence it cites.

Use the known Preface failure as a fixed defeat fixture:

- reading scope: Preface;
- observation claims an “intimate campfire scene” at the closing transition;
- cited Preface evidence contains no campfire;
- “campfire” exists elsewhere in the manuscript.

The system must refuse, flag, or otherwise prevent this observation from being presented as evidence-grounded Preface analysis.

The falsifier must also preserve true observations that paraphrase rather than quote literally; a naive keyword requirement would punish valid semantic reading.

No specific implementation is authorized by this review.

## 19.5 Quotation audit product consequence

The Preface quotation audit found several distinct classes:

- source/translation substantially verified;
- modern translation requiring permissions review;
- probable misattribution;
- loose paraphrase presented too directly;
- unresolved/high-attribution-risk quotation.

This validates a product distinction that should remain explicit:

> **source verification is not literary editing.**

Writer’s Studio should help surface source/permissions questions without allowing them to become automatic prose revision authority.


---

# 20. Reconciled beta determination

## 20.1 What is already good enough to carry into beta

The review found no reason to rebuild Writer’s Studio before learning from writers.

The following product foundations are strong enough to preserve:

- Work-centered Home;
- manuscript-first Write;
- explicit Develop / Review distinction;
- exact evidence addressing;
- proposal ≠ manuscript;
- explicit Apply;
- explicit Undo substrate;
- Keep / no-op as valid outcomes;
- correction succession without rewriting history;
- beta feedback without passive engagement surveillance;
- chapter/passage continuity after the October repair;
- restrained Review language;
- the editorial covenant;
- separate literary judgment from source/quotation verification.

The candidate-wide safety suite passed 117/117 targeted tests.

The Preface independent council also demonstrates that the system can reach a preservation-first conclusion rather than compulsively rewrite.

## 20.2 Universal gates before inviting outside writers

These apply even if the writer uses controlled/sample material.

### U1 — One exact beta candidate

Name one SHA.

The same SHA must be:
- built;
- tested;
- deployed;
- observed in production;
- rollback-capable.

Today:
- production SHA;
- current canonical SHA;
- current Writer’s Studio candidate SHA

are different.

**Status: OPEN / hard release-custody gate.**

### U2 — Semantic evidence truth

The known Preface “campfire scene” contamination must become a fixed falsifier.

A structurally valid citation may not be presented as grounded evidence when the observation’s concrete claim is not supported by the cited text.

**Status: OPEN / hard epistemic-trust gate.**

### U3 — Exact production authoring/recovery journey

On the exact candidate:

Home → Work → Write → Develop → evidence → proposal → Apply → Undo → leave → ordinary-door return.

Require:
- exact applied wording;
- exact predecessor restoration;
- intelligible return;
- no false success;
- no lost place;
- no lost writing.

**Status: OWED / hard release gate.**

### U4 — Production correction + feedback witness

On the exact candidate:
- authenticated Correct MAIA persists and affects later working context;
- one authenticated beta feedback note persists;
- one non-beta feedback request is refused.

Production currently has the required tables/migrations but zero persisted correction rows and zero beta-feedback rows, so no existing episode closes this.

**Status: OWED.**

### U5 — Rollback

Demonstrate rollback for the exact released candidate.

A small cohort does not relax this requirement.

**Status: OWED for the candidate that will actually be released.**

## 20.3 Additional gates before participants upload private Work

These are Phase-B gates.

### B1 — Reconcile total erasure with append-only editorial history

Finding 16 must close.

The total-erasure act must outrank ordinary editorial-history immutability through an explicit constitutional erasure path, and the real editorial-deletion falsifier must pass.

**Status: OPEN / hard private-Work gate.**

### B2 — Exact third-party retention disclosure

Current primary structured inference can send commissioned manuscript text to Anthropic.

Soullab policy and Anthropic’s default API/commercial training policy support a no-training statement, but Soullab’s exact Anthropic account retention / zero-data-retention posture has not been established here.

Before private Work:
- determine the account/contract retention posture;
- write it in plain language;
- disclose external processing;
- provide a sample-material alternative.

**Status: OPEN / hard disclosure gate.**

### B3 — Research-record distinction

Tell participants separately that an explicitly submitted beta note may remain as a research/product feedback record after a manuscript is deleted; its manuscript FK is set null rather than the feedback record being cascaded away.

**Status: disclosure requirement.**

## 20.4 Cohort decision

The current feedback predicate recognizes the broader historical Soullab beta population.

For a defined small writer study, either:
- rely intentionally on distribution of the `beta=1` invitation URL; or
- scope feedback eligibility with an existing `ops_contacts.metadata.groups/tags` Writer’s Studio marker.

No second identity system is warranted.

**Status: decide before cohort evidence is interpreted.**

## 20.5 Scope of the first cohort

Recommended:

> **desktop/laptop-first**

Do not make manuscript-scale mobile authoring part of the beta promise yet.

## 20.6 Learn during beta — do not pre-solve

These are legitimate beta questions, not reasons to keep building indefinitely:

- Does Develop feel too dense?
- Does a writer naturally begin with their question rather than the lens taxonomy?
- Does MAIA’s help feel specific rather than generic?
- Does revision latitude feel empowering or bureaucratic?
- Do writers understand reading vs conversation vs proposal?
- Do they find their way back to the Work?
- Do they actually use Keep/no-op when it is right?
- Does MAIA reduce or increase their confidence in their own judgment?
- Does the work feel more itself afterward?

## 20.7 Do not hold beta for

- full Design Studio;
- finished publishing/distribution;
- every Field-object intake path;
- all expression types;
- full spoken-wisdom-to-book automation;
- model councils on ordinary turns;
- completion of every historical Writer’s Studio roadmap item.

## 20.8 Product judgment

Writer’s Studio is now coherent enough to review as **one product**.

It is not yet ready for an outside writer cohort today because the review found two classes of unresolved hard evidence:

1. **release/provenance gates** that affect any external cohort;
2. **erasure/provider-disclosure gates** that specifically affect participant-owned private Work.

The important conclusion is not “keep building the product.”

It is:

> **Stop broadening. Close the small number of cross-product trust boundaries, freeze one candidate, prove the ordinary writer journey, then learn from real writers.**

That is a much narrower path to beta than completing the historical roadmap.

---

# 21. Final product sentence

Writer’s Studio should be judged by one outcome:

> **Can a person carrying something worth giving bring it into language, understand and strengthen the Work with intelligence beside them, and leave with the Work more fully itself and their authorship more—not less—intact?**

Everything else is implementation.
