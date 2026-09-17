# SPM · D9-B — REPRESENTATION-BOUNDARY ADVERSARIAL FALSIFICATION

**⛔ No repair. ⛔ No schema. ⛔ No migration. ⛔ No `representation_authority`. ⛔ No SPM.
⛔ No prompt altered. ⛔ No Cut-1 weight changed. ⛔ F5 not begun. ⛔ Production untouched.**

---

## 1 · BINDING AND CUSTODY

| | |
|---|---|
| Branch | `claude/festive-sagan-apvfs5` |
| HEAD at execution | `b16d2eeac95f2aa4c11b2b218e844affe914af2b` |
| Tree state | **clean** — `git status --porcelain` → 0 lines |
| Frozen D9-A artifact | `docs/programme/SPM-D9A_REPRESENTATION-BOUNDARY-ADJUDICATION_2026-09-17.md` |
| Artifact blob | `929eeba0509795956c063902e87bfd2bd3ae8a9a`, committed in `b16d2eea` — **verified present at the named SHA** |
| Census SHA | `8b80ec21060a102ee2007d12f3182049c7c6ad43` |
| **Canonical drift since the census** | `git diff --stat 8b80ec21 HEAD -- lib app database components` → **EMPTY.** The census source state **is** current. No D9-B seam is stale |

**Evidence discipline.** Every finding below is bound to source read at this SHA. Programme
declarations (CLAUDE.md, prior records) were **not** taken as evidence; where a programme claim
was re-verified it is marked, and where inspection contradicted a prior record that is stated.

**Instrumentation.** ⛔ **None created.** No probe, test, fixture or shim was written. All attacks
were executed as static trace over source, schema and call graph. No database was read; no runtime
was observed. This bounds several results to *structural possibility* rather than *observed
behaviour*, and each is labelled accordingly.

---

## 2 · FROZEN D9-A INPUT

```
Standing   INDEPENDENT-WARRANT SUPPORTED · ADJUDICATED HYPOTHESIS · NOT CONSTITUTIONAL LAW
Counts     SURVIVES 7 · FALSIFIED 1 · UNRESOLVED 2
Axes       provenance (accrues) · present standing (non-monotonic) · warrant (granted, spent)
Unresolved retrieval permission ≠ representation permission · persistence ≠ adoption
```

D9-A nominated **one** witness as *"decisive, and live"*: the disclosure-receipt rule. **§5.B3
withdraws that nomination.**

---

## 3 · STRONGEST TERMINAL-LEVEL DEFENCE (Model T)

Stated at full strength, and **not weakened** to protect D9-A.

### 3.1 · The model

> **Model T.** There is no independent warrant axis. Material reaches a sufficiently authorized
> state, and downstream behaviour follows. Everything D9-A called "warrant" is one of four
> concepts the organism already has and that no one disputes:
>
> * **access control** — (actor × resource × scope), ordinary and pre-existing;
> * **material validity** — `valid_to`, `'rejected'`, `'dismiss'`: properties of the material;
> * **mutation authority** — write permission over an artifact, distinct from reading;
> * **idempotency / session mechanics** — de-duplication keys and one-time nonces.

### 3.2 · The defence, specimen by specimen

* **E1 / E2 / E3 as scope-and-reach.** A practitioner cannot reach a client's focus because the
  projection has no column to reach it by; an atom cannot become collective because a CHECK is
  always false; an Ask act names its coordinates. All three are **access control**. Nothing is
  "spent"; a subject simply is or is not within scope.
* **E4 as mutation authority.** Adoption governs a **write** to the Work. Changing the wording
  produces a **different version** — different material, never authorized. Version identity plus
  write permission explains the whole specimen. No warrant needed.
* **Disclosure receipts as idempotency.** `disclosure_id` is a uniqueness key. Reusing one
  collides. That is duplicate-evidence prevention, not authority accounting. ⭐ **And D9-B
  confirms the mechanism supports the defence — see §5.B3.**
* **X10 as non-dispositive.** `refuseBorrowedFirstPerson` lives in `scripts/research/`; its only
  consumer is unawaited, env-gated and member-allowlisted, producing no member-facing output.
  A shadow cannot testify about the organism.
* **Writer's Studio as a room-specific exception.** `canonicalWriterTurn.ts` says so in its own
  header: *"⛔ NOT the organism-wide M3. One room gets a canonical prompt path; every other room
  and caller stays on its current seam."* Generalizing one room's ceremony into a constitutional
  axis is the error.
* ⭐ **And Model T has an affirmative witness D9-A never found.** `epistemicFraming()`
  (`lib/maia/memoryAtomsLoader.ts`) maps `epistemological_status` into member-facing prompt prose,
  under the comment: **"Proportions authority to the quality of the knowledge."** That is a
  terminal-ladder statement, in the organism's own words, at a **live** member-facing site. See
  §5.B10.

### 3.3 · Model T's burden, stated before the attacks (pre-registered)

Model T's claim is that state is a property **of the material**. The pre-registered defeat
condition, fixed before any specimen was run:

> **Model T fails if a specimen exists in which the material's state is identical in the permitted
> and the refused case, and the difference cannot be described without indexing permission by
> actor, purpose, time or use-count.**

⚠️ If Model T survives only by re-indexing "state" on those four variables, that is **not**
Model T surviving — it is Model W under another name, and §7 records it as such rather than as
redundancy.

---

## 4 · PRE-REGISTERED ATTACK MATRIX

Fixed before execution. ⛔ No numeric scoring metric was pre-registered, so **none is used** (§7).

| Attack | Dimension varied | Held constant | Discriminates if |
|---|---|---|---|
| B1 | crossing authority | material, standing, actor | high standing coexists with lawful refusal |
| B2 | member act | authorship, provenance, standing | warrant changes while standing does not |
| B3 | crossing attempt # | Work bytes, provenance, standing, actor, purpose, audience | second crossing refused **and not freely re-obtainable** |
| B4 | purpose coordinates | material, standing, actor, audience | authority must be earned again per purpose |
| B5 | destination | material, standing, actor | lawfully-held material may not lawfully be represented |
| B6 | present standing → ∅ | material, actor | withdrawn material reacquires practical effect |
| B7 | system repetition | member confirmation | machine recurrence outweighs the member act |
| B8 | subsystem | the concept "persistence" | two live sites give opposite answers |
| B9 | derivation | input lawfulness | derived claim acquires member standing without a member act |
| B10 | representation boundary | upstream metadata | metadata loss has an executable consequence |

---

## 5 · B1–B10 · EVIDENCE AND RESULTS

---

### B1 — HIGH-STANDING REFUSAL · **executable case found** · discriminates **weakly**

**Specimen.** A member's selected focus and sovereign-field material: member-authored, current,
lawfully persisted, maximal member standing. **Actor:** an authenticated practitioner with an
active relationship. **Consumer:** `getPractitionerClientProjection`. **Purpose:** accompaniment.

**Observed executable result.** REFUSED, structurally. `PractitionerClientProjection` has no
`focus`, no `reflections`, no `notes`, no `atoms` — *"not set to null, not omitted at
serialization time: absent from the shape."* There is deliberately **no denylist**: the roster
lives in `scripts/verify-practitioner-projection.ts`, which fails if the module's source so much
as mentions a protected table. The client's selected focus is keyed on the member and carries no
`relationship_id`, so no relationship-scoped query has a column by which to reach it.

Second specimen: `member_memory_atoms` — `crossing_allowed BOOLEAN NOT NULL DEFAULT FALSE` with
`CONSTRAINT crossing_must_be_false CHECK (crossing_allowed = FALSE)`. The member's own kept
material, at maximal standing, can never cross to collective.

**Model W predicts** refusal: no warrant exists for this audience.
**Model T predicts** refusal: this is access control, actor × resource.
**Discriminates:** ⚠️ **NO.** Both predict the observed result with equal economy. Access control
is a pre-existing concept and Model T is entitled to it.

**Answer to the question put:** *Yes — maximal epistemic and member standing coexists with a
lawful refusal to cross.* Terminal-level in its **naïve** form (standing alone determines
downstream behaviour) is refuted here. Terminal-level *as stated in §3.1*, which includes access
control, is not.

---

### B2 — LOW-STANDING AUTHORIZED CROSSING · **executable** · discriminates **weakly**

**Specimen.** A `manuscript_revision_offers` row: MAIA-authored, `origin = 'work'`, derived, not
member-authored, no member standing. **Act:** `authorizeVersion` naming one exact `versionId`.

**Observed result.** The crossing occurs — `executeAuthorization` re-reads the Work, re-fits and
mutates — and **nothing about the material's authorship, provenance or standing changes.** The
authorization row carries no `replacement_text`, no `rationale`, no `head/current/latest`. The
offer's `authority jsonb` continues to record *the disclosure that licensed the reading*, not a
truth. **Consequence true by shape:** changing the proposal wording cannot change what an existing
authorization permits.

**Model W:** warrant changed; standing did not. ✓
**Model T:** a new version is **different material** with no authorized state; write permission
over an artifact is mutation authority. ✓
**Discriminates:** ⚠️ **NO.** Both accounts are complete. Model T must say the member's act is
what moved the material into the authorized state — at which point "state" already includes
"has been authorized," which is the disputed term. **Notational, not substantive.**

**Answer:** *Yes — warrant can change while standing is unchanged.* But the specimen does not
force the warrant reading.

---

### B3 — SPENT-WARRANT DISCRIMINATOR · ⭐⭐ **COLLAPSED · D9-A's nomination WITHDRAWN**

This was D9-A's single *"decisive, and live"* witness. **It does not survive attack.**

**The mechanism, traced.** `app/api/writers-studio/focus/route.ts`:

```
const requestId    = randomUUID();
const disclosureId = randomUUID();      // ← server-generated, every request
```

`mintDisclosureAttempt` inserts `ON CONFLICT (disclosure_id) DO NOTHING`. On conflict it re-reads
the whole immutable identity, compares field-by-field, and returns `existing` — which
`mayCross()` does not admit.

**What actually changed between crossing 1 and the refused second attempt:** **the identifier was
already in use.** Nothing else. And the route's own comment states the purpose:

> *"A NEW disclosure identity per member act — never reused, so an unresolved prior attempt can
> never be replayed as though it were this one."*

**Replay prevention. Stated by the organism, in the file.**

**The fatal fact for the warrant reading:** a fresh crossing of **byte-identical Work, identical
provenance, identical standing, identical actor, identical purpose, identical audience** is
available **immediately**, because the server mints a new `disclosureId` on the next request. ⭐
**Nothing is scarce. Nothing is spent.** A warrant that the system manufactures on demand is not
a warrant.

**Explaining the refusal without an independent warrant concept — succeeded.** `disclosure_id` is
an idempotency key over an evidence table. Reuse collides. The rule *"Idempotency may prevent
duplicate evidence. It must not turn old evidence into fresh authority"* is a rule about
**evidence integrity** — it forbids a stale receipt from being *read as* permission. It does not
establish that permission is finite.

**Model W:** predicts refusal, and **over-predicts** — it implies scarcity that does not exist.
**Model T:** predicts refusal, with one concept, correctly, and predicts the free re-crossing
that Model W does not.
**Discriminates:** ⭐ **YES — AGAINST MODEL W.**

> ⚠️ **D9-A §5.2's characterization of this specimen is withdrawn.** The founder's controlled-
> experiment reading — *same Work, same bytes, same provenance, same standing, same actor;
> crossing 1 permitted, crossing 2 refused* — is **accurate about the two calls and wrong about
> what the difference means.** The difference is the identifier, not the authority. ⛔ D9-A's
> §5.2 row for this specimen must not be cited again.

---

### B4 — PURPOSE / AUDIENCE SUBSTITUTION · ⭐⭐ **THE SURVIVING DISCRIMINATOR**

**Specimen.** `ask_authorization_acts`, live at `app/api/sovereign/manuscripts/[id]/ask/route.ts`.

**Held constant:** the material (the manuscript and its frozen reading), the member, the member's
standing, the audience (MAIA cognition), the scope kind (`section`).
**Varied:** the **purpose coordinates** — `threadId`, `readingId`, `observationKey`.

**The traced sequence.**

```
ACT 2   body required, no act presented  → mintAct({member, manuscript, thread, reading, observation}, TTL)
                                          → 'BODY_AUTHORITY_REQUIRED' + pendingAskRef returned to the member
ACT 3   member returns pendingAskRef + authorizes[]
        → authorizationCovers(...)        ⭐ SCOPE BEFORE CLAIM — an incomplete set does NOT spend the act
        → claimAct(...)                   ⭐⭐ THE CLAIM HAPPENS HERE
        → coordinate comparison           ⭐⭐ THE PURPOSE CHECK HAPPENS AFTER THE CLAIM
```

**Observed executable result.** A member act minted for one Ask, presented against a different
thread / reading / observation, is refused `authorization_not_for_this_ask` (HTTP 409) — **and
the act is already consumed.** The route says why:

> *"THE OPPORTUNITY MUST HAVE BEEN FOR THIS EXACT ASK. **A mismatch cannot put a consumed human
> act back — that would turn one act into reusable permission.**"*

**Why Model T fails here, against its own §3.3 burden.**

Model T as stated is *material reaches a sufficiently authorized state → downstream follows.* In
the permitted case and the refused case the material's state is **identical** — same manuscript,
same reading, same member, same validity, same moment. Downstream follows in one and not the
other. **The material's state cannot be the explanation.**

Model T's available rebuttals, each run and each failing:

1. *"Referential integrity — the act simply names different coordinates, like presenting the wrong
   receipt."* ⛔ **Refuted by the ordering.** Under referential integrity a mismatch would match
   nothing and change nothing. Here the claim is executed **first** and the act is **spent by the
   failed attempt**. Spend-on-mismatch is a *defect* under referential integrity and a *law* under
   permission accounting — and the source says it is the law, naming the harm as *"reusable
   permission."*
2. *"A one-time capability token — an existing concept (`googleOAuthState`)."* ⚠️ Admitted — and
   it **concedes §3.3**. A capability indexed by (actor, resource, **purpose**, time, use-count)
   is the warrant axis with a different label. §7 records this as capitulation, **not** redundancy.
3. *"It is scope/access control."* ⛔ Access control does not expire (`expires_at`), is not
   consumed (`act_id UNIQUE` on consumption), and is not destroyed by being exercised wrongly.

**And unlike B3, the scarcity is real in the direction that matters.** Yes, a client may request a
fresh opportunity — so the act is not scarce *in supply*. But it **is** scarce *in use*: this act,
once spent, is gone, and the coordinate check deliberately runs after the spend so that a
mis-presented act cannot be recycled. ⭐ **B3 fails because nothing was spent. B4 holds because
something is, and the organism spends it on purpose.**

**Discriminates:** ⭐⭐ **YES — FOR MODEL W.**

**Answer to the question put:** *Authority does not travel with the material. A new crossing must
earn it independently.* — **at this site.** Enforcement, not documentation: the comparison is five
field equalities in the route, returning 409 before any prose is read.

---

### B5 — RETRIEVAL ≠ REPRESENTATION · **SPLIT RESULT** — the founder's warning applies

⭐ D9-A's primary target, and the place where the model's elegance must not be allowed to drag the
distinction across the line.

#### B5a — machine-readable destinations · **DISTINCTION SUPPORTED, executable**

Three sites where material lawfully in the process may not lawfully be represented:

| Site | Mechanism | Stated reason |
|---|---|---|
| `RefusedReceiptField` (`contextDisclosureReceipt.ts`) | a **type** naming `text · passage · excerpt · summary · embedding · hash · digest · fingerprint · startOffset · endOffset · range · length · wordCount · geometry` as refused | *"a digest leaks nothing WITHOUT the Work — but the Work is exactly what an auditor of this system holds, so a hash beside the manuscript is a selection locator"* |
| `assertManifestEntry` (`participationDisposition.ts:173-176`) | **runtime** refusal of any non-contract key: `for (const key of Object.keys(rec)) if (!ENTRY_KEYS.has(key)) fail(...)` | *"a body cannot be smuggled in under another name"* |
| `scrubMemoryAmnesia` (`memoryCanonGuard.ts`) | post-generation regex, **applied**: `orchestratorResult.text = _memoryScrub;` on the highest-traffic live route | a 2026-08-04 production incident in which MAIA falsely denied her own memory to an authenticated member |

In all three the material is already lawfully held. The refusal is about **where it may go**.
Model T's *"downstream behaviour follows"* is directly contradicted.

⚠️ **But the refusals are indexed by CONTENT, not by purpose.** `RefusedReceiptField` forbids a
class of field; `assertManifestEntry` forbids unknown keys; `scrubMemoryAmnesia` fires on what the
generated text **says**. **None is consumer-bound, none is purpose-bound, none is spent.** These
are *truthfulness and record-shape constraints*, which is a fifth existing concept Model T may
have cheaply.

#### B5b — member-facing speech about the member · **INSUFFICIENT EXECUTABLE EVIDENCE**

Traced through the actual consumers. For MAIA speaking to the member *about the member*, the only
governance found is prose:

* `conversationalRecallBlock.ts` — *"Do not synthesize across them. Do not name patterns that
  cross sessions unless the member names them first."* **CONVENTION.**
* knowledge-gate addendum — *"Use as background intelligence. Do not quote this section
  directly."* **CONVENTION.**
* `refuseBorrowedFirstPerson` — the only executable refusal, and **shadow-only** (K2 stands).

**Result: B5 = DISTINCTION SUPPORTED for machine-readable destinations · INSUFFICIENT EXECUTABLE
EVIDENCE for member-facing speech.** ⛔ The distinction is **not** carried across the line by the
broader model. It remains open exactly where D9-A left it, and the split is now precise.

---

### B6 — WITHDRAWAL / FALLBACK (T-6) · **STRUCTURALLY POSSIBLE · NOT OBSERVED**

**The sequence, traced.** `lib/memory/MemoryBundle.ts`, `getSemanticMemories`:

1. Non-vector baseline runs first — `CUT1_BASELINE_NONVECTOR_SQL` carries
   `AND (valid_to IS NULL OR valid_to > NOW())` **and** `AND content_text IS NOT NULL`.
2. Source comment: *"If non-vector returns nothing, try vector search."*
3. Vector SQL: `FROM developmental_memories WHERE user_id = $2 AND vector_embedding IS NOT NULL`
   — **no validity predicate, no content predicate**; `ORDER BY composite_score DESC LIMIT 8`.

**Answering each question put:**

* **Does it occur?** ⚠️ **UNKNOWN in production** — no database was read. **Structurally reachable:
  yes**, and the trigger condition is *the baseline returned zero rows*, which is the state a
  member produces by withdrawing their memories.
* **Does `valid_to` survive into fallback?** **NO.** The predicate is absent.
* **Evidence or influence?** ⭐ **Influence.** The rows returned become `MemoryCandidate`s and flow
  through `rankCandidates` → `deduped` → `memoryBullets` → `formatForPrompt`. This is not an audit
  read; it is the retrieval that composes the prompt.
* **Is any fresh crossing warrant involved?** **No.** No boundary, no receipt, no act — the
  conversational path crosses none (census C-1).
* **Can historical material silently reacquire current effect?** ⭐ **Yes, structurally** — and
  *silently* is exact: `[MAIA/memprov]` is a log line, explicitly **NOT A STORE**, so no durable
  record would name it.

**Bearing on the models.** This is a failure of **material validity** — Model T's own second
concept. It is not a warrant failure. **Discriminates: NO.** Both models condemn it.

⚠️ **The inverse guard is ENFORCED on the write side**, which sharpens the asymmetry:
`PreferenceConfirmationStore.record()` refuses a confirmation against a withdrawn row
(`AND (valid_to IS NULL OR valid_to > NOW())` → `withdrawn_by_member`), *"Correction is not
temporary disagreement… it may not resurrect the old assertion."* **The organism refuses to let
the member resurrect it and does not refuse the fallback.**

⛔ Not repaired. ⛔ No predicate proposed.

---

### B7 — REPETITION / CONFIRMATION (S-2) · **STRUCTURALLY POSSIBLE · LOOP PARTIAL · NOT OBSERVED**

**Bound mechanism** — `lib/memory/cut1Trace.ts`, `CUT1_BASELINE_NONVECTOR_SQL`:

```
0.40 * COALESCE(calculate_decayed_confidence(significance, memory_type, last_confirmed_at, formed_at), significance)
+ 0.35 * EXP(-age/30d)
+ 0.15 * CASE WHEN confirmed_by_user THEN 0.15 ELSE 0 END     → ceiling 0.0225
+ 0.10 * LEAST(recall_count / 10.0, 1.0)                       → ceiling 0.1000
```

**Holding member confirmation constant and increasing system repetition:** `recall_count` is
incremented by `DevelopmentalMemoryService.incrementRecallCounts` **on retrieval**, no member act.
Ceiling ratio **≈ 4.4 : 1** in favour of machine recurrence.

⚠️ **Two limits, both material.** (i) The loop is **partial**: the writer
(`DevelopmentalMemoryService.recall`/`retrieveMemories`) and the reader
(`MemoryBundle.getSemanticMemories`) are different retrieval paths, so repetition on the reading
path does not feed itself. (ii) Whether `recall_count` is non-zero in production is **UNKNOWN** —
no database read. ⛔ No weight changed, none proposed.

**The separation the instruction asks for, answered.**

* *Confidence in MAIA's inference* — **this is what the scorer moves.** `significance` ×
  decay × recency × recall is a retrieval-confidence function.
* *Authority to attribute the inference as member truth* — ⭐ **the scorer does not move this at
  all.** No path was found by which a high-scoring developmental memory becomes member-attributed:
  its content enters the prompt as a bullet under the `inferred.memory_influence` producer, and
  the only writer of member-standing atoms **refuses** non-member provenance (see B9).

⭐ **This is the cleanest negative result of D9-B, and it cuts in the model's favour by *narrowing*
it:** repetition can buy **salience**, and no evidence was found that it can buy **standing**.
The S-2 inversion is a ranking defect, not an authority defect — **on the evidence available.**

**Discriminates:** NO. Both models condemn the ratio; neither requires it.

---

### B8 — PERSISTENCE / ADOPTION · **CONTRADICTORY SEMANTICS CONFIRMED · NOT NORMALIZED**

Both sites bound, both live, both member-facing.

| | Writer's Studio | Conversational memory |
|---|---|---|
| Object | `proposal_chains` / `proposal_versions` | `member_memory_atoms` |
| Persisted | indefinitely | indefinitely |
| Confers | **nothing** — *"Before the member authorizes an exact version, there is no row here. The existence of the row IS the permission"* | **surfacing** — `return_preference IN ('contextual_doorway','ritual_review_opt_in') AND member_response_status IS DISTINCT FROM 'rejected'` |
| Adoption | a **separate row** in a separate table | **no separate act exists**; `confirmed`/`modified` have no runtime writer |

**What distinguishes them.** ⭐ Not a difference in the concept of persistence — a difference in
**what the member's storing gesture was taken to mean.** Keeping an atom **with a return
preference** already *is* the surfacing decision: `return_preference` is written at the moment of
keeping, so the member's adoption act is **fused into** the persistence act. In the Studio the two
were deliberately separated, because there the downstream effect is a **mutation of the Work**,
and a fused act would let something staged for inspection move the manuscript — the failure that
actually occurred twice on 2026-09-13.

So the answers:

* **Can persistence confer adoption?** At the atoms site, **yes — because the two are one gesture
  with two fields**, not because persistence leaks authority.
* **Does adoption require an independent act?** In the Studio, **yes, enforced.** At the atoms
  site, **no such act exists to require.**
* **Is one subsystem using "persistence" differently?** ⭐ **Yes.** `return_preference` is a
  *disposition recorded at keep time*; a proposal is *material awaiting a decision*.
* **Contradictory authority semantics?** ⚠️ **Not proven.** The two are consistent once the
  fused/separated distinction is seen. They would be contradictory if the atoms path were
  understood to persist material *pending* a decision — it does not.

**Result: persistence ≠ adoption — remains UNRESOLVED as a global property, and is no longer
mysterious.** The organism separates them where the downstream act mutates an artifact and fuses
them where the downstream act is surfacing. ⛔ Not normalized. ⛔ No change proposed.

---

### B9 — SYNTHESIS LAUNDERING · **PROPOSITION SURVIVES FALSIFICATION**

**Attempted falsification of:** *"Valid inputs do not automatically make the derived synthesis a
member claim."*

**Every writer of member-standing atom storage was enumerated.** Exactly two exist:

**(1) `lib/psyche/portfolio.ts:460`** — `generated_by` is **hardcoded `'member-gesture'`**,
`posture_at_creation` hardcoded `'normal'`. So the provenance claim is fixed by the writer, not
supplied by the caller. Attack: can MAIA-authored text enter here? `source_type` admits
`idea · idea_block · journal · dream · reflection · decision · change · session_excerpt ·
spontaneous`. `session_excerpt` is the laundering candidate — a conversation session contains
MAIA's turns. **It is not constructible at this SHA:** `listSourceCandidates` returns `[]` for it
(*"tables don't exist yet … Return empty for Phase 1"*), and every non-`spontaneous` type requires
a `source_id` that must resolve. `spontaneous` requires a body typed by the member.

**(2) `app/api/studio/with-me/sessions/[sessionId]/route.ts:137`** — practitioner observations,
and it **refuses to claim member provenance**: `generated_by = 'practitioner-observation'`,
`epistemological_status = 'observed'`, `primary_register = 'witnessed'`, `crossing_allowed = false`.

⭐ **And the refusal is mutual.** `keepSource` **throws** if `sourceType === 'practitioner_observation'`
— the member path will not mint practitioner provenance, and the practitioner path will not mint
member provenance. **Two writers, each structurally refusing the other's provenance class.**

**Tracing the derived claim against the checklist:**

| Property | Result |
|---|---|
| independent identity | ✅ `developmental_memories.id` |
| preserves derivation provenance | ⚠️ **NO** — no `createdBy`/`generatedBy` on that table (census A-4) |
| acquires present standing | ❌ no path found |
| acquires authority through recurrence | ⚠️ **salience only** (B7) |
| indistinguishable downstream from member-standing material | ⚠️ **at representation, by prose label only** |
| can be expressed first-person | ⚠️ **UNKNOWN** — governed only by prompt convention on the live path |
| can cross to another consumer without a member act | ⭐ **YES — via P-1** (B4's inverse; see §8) |

**Result: the proposition SURVIVES.** No executable path was found by which derived synthesis
becomes a member claim. ⚠️ **But the survival is contingent on absence, not on a guard:**
`session_excerpt` is blocked because *its table does not exist yet*, not because a rule refuses it.
⛔ Recorded, not repaired. This is the single most fragile positive result in D9-B.

---

### B10 — REPRESENTATION STRIPPING · ⭐ **D9-A'S CLAIM IS TOO BROAD — CORRECTED**

**D9-A asserted** that admission metadata does not survive to representation, citing
`render.ts` emitting `p.text` only.

**That is true of the renderer and false as a general claim.** Counter-evidence, live and
member-facing:

`lib/maia/memoryAtomsLoader.ts` → `epistemicFraming(status)` maps `epistemological_status` into
**prompt-facing prose** — `'observed by a practitioner in session'` · `'reported by the member
during a session'` · `'inferred from session patterns — provisional'` · `'provisional practitioner
impression'` · `'stated by the member during a session'` — under the function's own comment:

> **"Proportions authority to the quality of the knowledge."**

So a producer **may** carry its own provenance into its prose before that prose becomes `p.text`,
and at least one producer does, deliberately, with a stated rationale. Metadata is lost **at the
renderer**, not **at the boundary**.

**The executable-consequence test, applied as instructed.** ⛔ A violation is **not** inferred from
metadata loss. Two materially distinct claims — say a `system`/`inferred`/`infer` bullet and a
`member`/`placed`/`situate` bullet — reach cognition as adjacent prose lines, distinguished only
by whatever each producer wrote. No downstream consumer reads `authoredBy` after render; no guard
fires on it; no store records it. **No executable consequence was demonstrated.**

**Classification: STRUCTURAL POSSIBILITY.** ⛔ Not a finding of violation.

**Bearing on the models.** ⭐ This is **Model T's strongest affirmative evidence**: a live,
member-facing site whose stated design is *authority proportioned to epistemic quality* — the
terminal-ladder shape, in the organism's own words. It does not defeat Model W (the framing is
CONVENTION, and it governs how a claim is *described*, not whether it may cross), but D9-A did not
have it, and it must travel with the ruling.

---

## 6 · POSITIVE-CONTROL RESULTS

Attacking over-restriction as aggressively as over-authorization. A model that makes a supported
member act impossible is **wrong, not safe**.

| # | Act | Supported by the organism? | Possible under the candidate boundary? |
|---|---|---|---|
| 1 | member states X | ✅ live | ✅ |
| 2 | MAIA lawfully remembers X | ✅ live | ✅ |
| 3 | MAIA offers an explicitly attributed interpretation Y | ✅ live (`PatternChips`/`PatternDrawer`, mounted) | ✅ |
| 4 | member rejects Y | ✅ live (`feedback` → `expired`) | ✅ |
| 5 | member confirms X | ✅ patterns · ❌ atoms (`confirmed`/`modified` have no writer) | ✅ where supported |
| 6 | member asks MAIA to draft first-person Z | ✅ live | ✅ |
| 7 | member adopts Z without provenance being rewritten | ⚠️ partial — nothing is rewritten because nothing is recorded at the artifact | ✅ |
| 8 | member later corrects Z | ✅ live (`refine` → `updated`) | ✅ |
| 9 | successor current, predecessor historical | ⚠️ partial — `'superseded'`/`'held_lightly'` exist; member-claim succession is in `scripts/research/` | ✅ where supported |
| 10 | member authorizes a crossing for purpose P / audience A | ✅ live (B4) | ✅ |
| 11 | that crossing succeeds | ✅ live (`crossed`; `accepted_at` + `resulting_version`) | ✅ |
| 12 | the same authority does not travel to purpose Q / audience B | ✅ Writer's Studio · ❌ violated at P-1 | ✅ |
| 13 | member withdraws authority without historical erasure | ✅ live (`valid_to`, row retained) · ⚠️ B6 exception | ✅ |

**FALSE REFUSAL count: 0.** No executable rule required by the candidate boundary makes any
supported act impossible. ⛔ No STOP triggered on this axis.

⚠️ Items 5, 7, 9 and 12 are **gaps in the organism**, not restrictions imposed by the model. The
model permits all four; the organism does not currently support them fully.

---

## 7 · FALSE AUTHORIZATION · FALSE REFUSAL · MODEL REDUNDANCY

### 7.1 · FALSE AUTHORIZATION — **1 confirmed in the organism · 1 structurally possible · 0 against the model**

⚠️ **The distinction is load-bearing and must not be used to make the model unfalsifiable.** §6's
FALSE AUTHORIZATION class defeats the *candidate boundary* when the boundary's own rules permit an
unauthorized crossing. Neither finding below is that.

| # | Finding | Class |
|---|---|---|
| FA-1 | **P-1 purpose travel.** `lib/maia/roomComposition.ts` composes `loadPriorCrossSessionExchanges` and `loadMemberMemoryAtomsForPrompt` **directly**, bypassing `PRODUCER_REGISTRY` and `not_registered_for_room`, into `/api/now-what/interview` (5 client refs) and `/api/maia/vision-studio/interview` (0 client refs, reachability UNKNOWN), gated by **one boolean on `members`** carrying no room, consumer or purpose dimension | **Confirmed unauthorized crossing in the organism.** The candidate model **condemns** it, so it is ⛔ **not** a false authorization *of* the model |
| FA-2 | **T-6 vector fallback** (B6) | **Structurally possible**, not observed. Also condemned by the model |

**Against the candidate model: 0.** ⛔ No STOP triggered on this axis.

### 7.2 · FALSE REFUSAL — **0.** ⛔ No STOP triggered.

### 7.3 · MODEL REDUNDANCY — **PARTIAL, AND IT DOES NOT REACH B4**

Redundancy is **confirmed** at B1, B2, B3, B6, B7: at every one of these, Model T explains the
outcome using access control, material validity, mutation authority or idempotency, and Model W
adds nothing. **At B3 Model T is strictly better** — it predicts the free re-crossing that Model W
does not.

Redundancy **fails** at B4, against the pre-registered §3.3 burden. The material's state is
identical in the permitted and the refused case; the refusal is indexed by purpose coordinates;
and the act is **spent by the failed attempt** with the source naming the harm as *"reusable
permission."* Model T survives B4 only by positing a one-time capability bound to
(actor, resource, **purpose**, time, use-count).

⭐ Per §3.3, **that is recorded as capitulation, not redundancy.** Renaming the axis does not
collapse it. ⛔ And the inverse discipline is applied too: **Model W is not credited at B1, B2, B3,
B6 or B7**, where Model T does the work with concepts that already exist.

---

## 8 · MODEL W vs MODEL T — SPECIMEN COMPARISON

⛔ No numeric score: none was pre-registered (§4).

| Specimen | Model W | Model T | Fewer unsupported assumptions |
|---|---|---|---|
| **B1** practitioner refusal | no warrant for this audience | access control (actor × resource) | ⚖️ **Model T** — access control is independently attested |
| **B1b** `crossing_must_be_false` | no warrant to collective | always-deny ACL | ⚖️ **Model T** |
| **B2** adoption | warrant changed, standing did not | new version = new material + mutation authority | ⚖️ **Tie** — Model T must fold "authorized" into state |
| **B3** receipt reuse | warrant spent | idempotency key reused | ⭐ **Model T, decisively.** Model W over-predicts scarcity that does not exist |
| **B4** wrong-Ask act | permission is purpose-bound and consumable | requires a purpose-indexed one-time capability = Model W renamed | ⭐⭐ **Model W** |
| **B5a** manifest / receipt-field refusals | representation independently governed | record-shape and truthfulness constraints | ⚖️ **Tie** — a fifth cheap concept |
| **B5b** member-facing speech | — | — | ❌ **Neither.** Only CONVENTION exists |
| **B6** fallback | — | material-validity failure | ⚖️ **Model T** — its own concept, its own defect |
| **B7** Cut-1 ratio | — | salience weighting | ⚖️ **Model T** |
| **B8** persistence/adoption | two warrants, one fused | one gesture carrying two fields | ⚖️ **Model T** |
| **B9** laundering | no warrant admits MAIA content to member storage | no writer accepts it | ⚖️ **Tie** |
| **B10** `epistemicFraming` | framing is description, not permission | **authority proportioned to epistemic quality** | ⭐ **Model T** |

**Reading the table honestly.** Model T wins or ties **eleven** specimens. Model W wins **one**.

⭐ **And one is enough, because the models are not scored by tally — they are scored by whether
the disputed axis does work the other cannot do.** At B4, Model T as stated in §3.1 is refuted by
its own §3.3 burden, and the only reformulation that survives *is* the warrant axis. Everywhere
else the axis is unnecessary. So the correct conclusion is not *"warrant is everywhere"* but
**"warrant is real and rare."**

---

## 9 · UNRESOLVED CASES

| # | Case | Why unresolved |
|---|---|---|
| R1 | **B5b** — is representation into member-facing speech independently governed? | Only CONVENTION exists on the live path. The one executable refusal is shadow-only |
| R2 | Is `refuseBorrowedFirstPerson` a representation **law** or an enforced rendering **convention**? | K2 stands, untouched by D9-B |
| R3 | Does B4 generalize from **Work mutation** to **speech**? | The one surviving discriminator lives in a room whose own header disclaims generality |
| R4 | Are FA-2 (T-6) and the B7 ratio **operative or latent**? | No database read. Structural possibility only |
| R5 | Is `vision-studio/interview` member-reachable? | 0 client references |
| R6 | Is `significance` a pure function of `memory_type`? | Would collapse EPISTEMIC STANDING into provenance (D9-A §4.2) |
| R7 | Is member-claim **succession** primitive or derived? | D9-A §4.2 falsifier not run |
| R8 | Would `session_excerpt` be **refused** if its source table existed? | B9 survives on absence, not on a guard |
| R9 | Do dynamic `import()` / string-dispatch sites reach modules recorded as statically unreferenced? | Method limit, unchanged from the census |

---

## 10 · FINAL D9-B STANDING

> # **INDEPENDENT-WARRANT SURVIVES — NARROWED**

Justified strictly against the §8 closure rule:

* **Did adversarial testing collapse warrant into an existing concept?** At B1, B2, B3, B6, B7,
  B8 — **yes**, and those collapses are recorded rather than argued away. At **B4 — no.** Model T
  as stated is refuted there by its own pre-registered burden, and the only surviving reformulation
  is the warrant axis renamed.
* **Does the distinction do explanatory work the competing model cannot?** ⭐ **At exactly one
  specimen, yes:** the spend-on-mismatch ordering in the Ask route is a defect under every
  competing account and a law under this one — and the source states it as a law, naming the harm.
* **Does the boundary refuse tested unauthorized crossings?** Yes — B1, B4, B5a. **FALSE
  AUTHORIZATION against the model: 0.**
* **Does it preserve tested legitimate member acts?** Yes — all 13. **FALSE REFUSAL: 0.**

### What the ruling now claims, and what it no longer claims

**Claims:** permission to cross is indexed by **purpose** and is **consumable**, and cannot be
derived from the material's state. One live, response-producing specimen carries this.

**⛔ No longer claims:**
1. ⭐ **that the disclosure receipt witnesses it.** D9-A's sole *"decisive, and live"* nomination
   **collapsed** (B3). `disclosureId` is `randomUUID()` per request; nothing is scarce.
2. **that warrant is pervasive.** Eleven of twelve specimens need no warrant axis.
3. **that representation is separately governed for member-facing speech.** B5b: insufficient.
4. **that metadata never survives to representation.** B10 corrects this, with counter-evidence
   whose stated design is Model T's shape.

**Status: ADJUDICATED HYPOTHESIS — ⛔ STILL NOT CONSTITUTIONAL LAW.** D9-B narrowed it, removed
its headline witness, replaced that witness with a stronger one, and supplied it with counter-
evidence it did not previously carry.

⚠️ **The two candidate sentences remain unconstitutionalized.** *"MAIA can know more without
thereby acquiring more rights over what she knows"* is supported by B4 and unsupported by B10's
site. *"MAIA can become more confident in her own interpretation without that interpretation
becoming more authoritative as a representation of the human"* is **directly contradicted in
design intent** by `epistemicFraming`'s *"Proportions authority to the quality of the knowledge"*
— which is prose, and is nonetheless the organism saying the opposite.

---

## 11 · STRONGEST EVIDENCE AGAINST THIS RULING

Stated as an opponent would state it.

1. ⭐ **The ruling rests on ONE specimen.** Eleven of twelve need no warrant axis. A constitutional
   distinction carried by a single route in a single room, whose own header disclaims generality
   (R3), is a thin foundation.
2. ⭐ **D9-A's decisive witness was wrong, which is evidence about the method.** The receipt was
   read as a controlled experiment and turned out to be an idempotency key. The same error could
   be present in B4 and not yet found.
3. ⭐ **`epistemicFraming` is the organism stating Model T.** *"Proportions authority to the quality
   of the knowledge"* — live, member-facing, deliberate. No comparable sentence states Model W.
4. **Model T is cheaper in concept-novelty.** Access control, material validity, mutation
   authority, idempotency and record-shape constraints are all independently attested. Model W
   introduces an axis with no executable representation anywhere (`representation_authority`: 0
   files).
5. **B4's capability could be ordinary CSRF-shaped session mechanics** that happens to carry
   coordinates, with the spend-on-mismatch an implementation choice the comment rationalizes after
   the fact.
6. **B9 survives on an absent table, not a guard** (R8). One migration could reverse it.

---

## 12 · EXACT FUTURE EVIDENCE CAPABLE OF OVERTURNING THIS STANDING

Each item is decisive by itself and states what it would change.

**Would overturn to INDEPENDENT-WARRANT FALSIFIED:**

1. **A demonstration that B4's spend-on-mismatch is incidental** — e.g. that `claimAct` runs before
   the coordinate check for transactional reasons unrelated to permission, or a governed change
   moving the check before the claim without the record treating it as a constitutional change.
   **This is the single point of failure. Attack it first.**
2. **A purpose-indexed capability elsewhere in the repository that is explicitly NOT a permission**
   (a nonce, a CSRF token) sharing B4's exact shape — spend-on-mismatch included. That would make
   B4 ordinary session mechanics.
3. **Evidence that `authorization_not_for_this_ask` is unreachable** — that no client can present
   an act against a different thread/reading/observation. An unreachable refusal witnesses nothing.

**Would overturn to INDEPENDENT-WARRANT SURVIVES (broadened):**

4. **A live, non-shadow, member-facing case for B5b** — material lawfully in cognition, its
   representation to the member independently refused on consumer or purpose grounds rather than
   on content. This would resolve R1 and D9-A's remaining UNRESOLVED distinction.
5. **A second independent B4-shaped specimen outside the Writer's Studio** — resolving R3 and
   removing the single-specimen objection.
6. **An executable consequence of B10's metadata loss** — a case where two materially distinct
   claims become indistinguishable *and a downstream decision turns on it*. Would upgrade
   STRUCTURAL POSSIBILITY to a finding.

**Would change the evidence state without changing the standing:**

7. **A production read** settling R4 — whether T-6 fires and whether `recall_count` is non-zero.
   Both are condemned by both models; observation changes urgency, not the ruling.
8. **A `session_excerpt` source table landing** — would force R8 from "not constructible" to a
   live test of B9.

---

## 13 · STANDING

```
D9-B                          ✅ COMPLETE
B1 weak · B2 weak · B3 ⭐COLLAPSED(against W) · B4 ⭐⭐DISCRIMINATES(for W)
B5 SPLIT(a supported · b insufficient) · B6 structurally possible · B7 structurally possible
B8 unresolved, explained · B9 proposition survives(fragile) · B10 ⭐D9-A claim corrected
POSITIVE CONTROLS             13/13 preserved
FALSE AUTHORIZATION           0 against the model · 1 confirmed + 1 structural in the ORGANISM
FALSE REFUSAL                 0
MODEL REDUNDANCY              PARTIAL — confirmed at B1·B2·B3·B6·B7 · fails at B4
FINAL STANDING                INDEPENDENT-WARRANT SURVIVES — NARROWED
                              ⛔ ADJUDICATED HYPOTHESIS · NOT CONSTITUTIONAL LAW
D9-A §5.2 receipt witness     ⛔ WITHDRAWN
D9-A §11 X1 stripping claim   ⚠️ CORRECTED — too broad (B10)
F5                            ⛔ HOLD
SPM                           ⛔ CLOSED — unaltered
D9 CLOSURE                    ⛔ NOT TAKEN — founder act
REPAIR                        ⛔ NOT AUTHORIZED — T-6 · S-2 · P-1 · stripping · persistence/adoption
                                 · B9 fragility: all recorded, all unrepaired
INSTRUMENTATION               ⛔ NONE CREATED
PRODUCTION                    ⛔ UNTOUCHED — no database read, no runtime observation
SOURCE                        ⛔ UNCHANGED — no lib/ app/ database/ components/ prompt or test
```

> *The receipt was not a warrant; it was a name that could only be used once.
> The Ask act is a warrant, because the organism spends it even when it is presented wrongly —
> and says, in the file, that the alternative would turn one act into reusable permission.
> One specimen is a narrow foundation. It is also the only thing here that a competing account
> cannot say in its own words.*

**STOP.**
