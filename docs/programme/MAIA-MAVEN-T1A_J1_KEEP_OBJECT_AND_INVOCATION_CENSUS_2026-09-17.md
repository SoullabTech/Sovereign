# MAIA-MAVEN-T1A — J1 KEEP OBJECT + INVOCATION CENSUS

**Status:** J1 CENSUS COMPLETE · **J2 NOT OPENED** · ⛔ **NO IMPLEMENTATION AUTHORIZATION**  
**Date:** 2026-09-17  
**Repository evidence base:** `60dbf1e8d238e40a9cbaac298496ac257fab90f6`  
**Parent:** `97c7d94634b8ce1cebfbd8c9f7e6b934d016f472`  
**Parent charter:** `docs/programme/MAIA-MAVEN-T1_TRUTHFUL_AWARENESS_CHARTER_2026-09-17.md`  
**Method:** read-only Git-object census against the exact evidence commit. The ordinary working tree was not used because it contained unrelated work.

---

## 0. Question

The T1 charter left T1-A blocked on the fact that **“Keeps” denotes more than one object** and said the remaining work, after the object ruling, is the **invocation seam**.

This census asks:

> **What does the repository actually mean by a Keep today, which paths can create one, which paths can read one, and can anything become a Keep without the member act the interface claims is required?**

This record does not choose a new product design. It establishes the substrate that a founder ruling and J2 reconciliation must govern.

---

# 1. Executive finding

## F1 — The repository already contains a stronger generic Keep discriminator than the T1 charter recorded

`lib/workbench/sources/keep.ts:4-18` states the distinction explicitly:

> **“Atom” and “Keep” are not the same claim.**

For that adapter, a generic member Keep is a `member_memory_atoms` row satisfying at least:

```text
generated_by = 'member-gesture'
member_id = the calling member
memory_scope = 'personal'
posture_at_creation != 'sanctuary'
status IN ('active', 'still_alive')
```

The decisive discriminator is:

```text
generated_by = 'member-gesture'
```

`lib/psyche/portfolio.ts:459-475` makes `keepSource()` the writer that stamps that value, while the With-Me bridge writes `generated_by='practitioner-observation'` directly (`app/api/studio/with-me/sessions/[sessionId]/route.ts:135-160`).

**Therefore the atom table is a mixed-origin continuity registry. It is not itself the Keep collection.**

This is stronger evidence than the naming ambiguity alone. It supplies a repository-native candidate answer to the object ruling:

> **Generic Personal Keep = a member-authored memory atom whose generation provenance is `member-gesture`.**

This is evidence for founder adjudication, not a founder ruling made by this census.

---

# 2. The three “Keep” families remain materially distinct

| Family | Concrete substrate | Creation authority today | Read authority today |
|---|---|---|---|
| **Press Keep** | `manuscript_keeps` | `POST /api/sovereign/manuscripts/[id]/keeps` | `GET /api/sovereign/keeps` |
| **Portfolio / Field Keep** | `member_memory_atoms` with `generated_by='member-gesture'` | `keepSource()` reached from several member-facing paths | no single Personal-Keeps route that preserves this discriminator end-to-end |
| **House Keep experience** | `/maia` Keep doorway / capture panel and `/maia/keep-capture` | presently crosses two different persistence models: reflection-capsule confirmation and feature-flagged conversational atom filing | `/maia/keep-capture` reads the broader atom registry, not only proven Keeps |

The family term **Keep** is coherent. The implementations are not interchangeable.

---

# 3. Press Keep — strong selection boundary, specialized object

## 3.1 Write path

`app/api/sovereign/manuscripts/[id]/keeps/route.ts`:

- authenticates the member;
- resolves the requested section only through a manuscript owned by that member;
- re-verifies that the submitted passage exists verbatim in the section;
- refuses text the manuscript does not contain;
- inserts `member_id`, `manuscript_id`, `section_id`, and the submitted `verbatim_text`.

Its doctrine says the route is written only by an explicit member gesture and may not be called by a detector, summarizer, or background job.

The live Press UI presents a literal **Keep** button whose `onClick` calls `keepCurrent()` (`app/press/manuscript/page.tsx:978-1005`).

## 3.2 Read path

`app/api/sovereign/keeps/route.ts` is mature and deliberately narrow. Its doctrine suite establishes that the read:

- is credential-scoped;
- refuses unauthenticated access;
- returns the member's kept passage characters unaltered;
- carries provenance;
- is bounded;
- orders by the member act only;
- does not rank, score, select, or inspect unkept section bodies.

## 3.3 Limit

This is a **Press-qualified Keep**. A manuscript quotation selected from a Press candidate flow is not the same object as a general member Keep created in the psyche portfolio.

The T1 charter's statement that a Keeps read route already exists is true **for Press Keeps**. It does not, by itself, prove that a generic Personal Keeps READ route exists.

## 3.4 Mechanical provenance gap

The Press route does not carry a separate gesture receipt or origin field. The API request itself is treated as the gesture. The production caller found is the member button; a witness script also inserts a `manuscript_keeps` fixture directly (`scripts/witness/maia-convergence-witness.ts`).

That witness path is non-production evidence, not a live bypass, but it proves the table alone cannot establish “this row came from a member gesture.”

---

# 4. Portfolio / Field Keep — the strongest generic Keep substrate

## 4.1 Formation service

`lib/psyche/portfolio.ts:364-392` defines `keepSource()` as the formation event and explicitly rejects `practitioner_observation` because those atoms must be written through the facilitated With-Me path.

On insert, `keepSource()` hardcodes:

```text
posture_at_creation = 'normal'
generated_by = 'member-gesture'
```

The provenance migration constrains `generated_by` to a typed set including:

```text
member-gesture
member-utterance
inference
synthesis
derivation
practitioner-observation
unattributed-historical
```

and the database mint trigger refuses a new `unattributed-historical` mint.

This confirms structurally that **memory atom** is the supertype and **Keep** is one provenance-qualified subtype.

## 4.2 Member-facing portfolio path

`/maia/keep-capture` reads source candidates and exposes **Keep this for me** as an explicit button (`app/maia/keep-capture/page.tsx:474-496`). That button calls `POST /api/psyche/portfolio/keep`.

This is a clear member gesture at the UI seam.

## 4.3 Source-verification asymmetry

The generic portfolio POST route authenticates the member and validates the shape of `sourceType`, `sourceId`, title, body, registers, lenses, and threads.

But `keepSource()` only performs source-specific ownership / eligibility resolution for `sourceType='capsule'` (`lib/psyche/portfolio.ts:405-417`). For `idea`, `idea_block`, and other sourced types, the service requires a non-null source id but does **not** re-resolve that source under the authenticated member before minting the atom.

The normal UI candidate query is member-scoped, so the intended browser flow supplies a legitimate source. The write boundary itself, however, does not prove that the submitted source id belongs to the member or even that the polymorphic source exists.

**J2 significance:** the object may be member-invoked while its source provenance is weaker than the invocation claim.

---

# 5. Non-Keep atoms exist by design

The facilitated With-Me completion route inserts practitioner observations directly into `member_memory_atoms` with:

```text
source_type = 'practitioner_observation'
generated_by = 'practitioner-observation'
```

No member Keep gesture creates those rows. That is intentional and correctly attributed.

This answers a naming question decisively:

> **A row in `member_memory_atoms` must never be called a Keep merely because it is an atom.**

The Workbench adapter already enforces this. Other readers do not consistently preserve the distinction.

---

# 6. `/maia/keep-capture` currently reads broader than “Keeps”

`lib/psyche/portfolio.ts:listAtoms()` selects from `member_memory_atoms` by member and view/status, but its selected columns do **not** include `generated_by`, and its queries do not require `generated_by='member-gesture'`.

`app/api/psyche/portfolio/atoms/route.ts` describes these results as the member's “kept atoms.”

The `/maia/keep-capture` surface compensates for one known exception by separating `sourceType='practitioner_observation'` into a **shared with you** section. But because `CrystallizedMemory` does not carry `generated_by`, that surface cannot distinguish other permitted origins such as inference, synthesis, derivation, or unattributed historical rows.

**Result:** the House room is not currently a mechanically pure Personal-Keeps reader.

The Workbench Keep adapter is stricter than the House Keep room.

---

# 7. MAIA already has an ambient atom reader — and it also drops the generic Keep discriminator

`lib/maia/memoryAtomsLoader.ts:230-312` reads `member_memory_atoms` into prompt context when:

- scope permits;
- status is active/still alive;
- return preference is `contextual_doorway` or `ritual_review_opt_in`;
- the atom is not sacred-protected;
- a practitioner observation has facilitator attribution;
- the member has not rejected the observation.

This loader is called by the canonical `/api/sovereign/app/maia/list` route (`:994-1007`).

That means MAIA can already receive eligible atom material ambiently under the existing return-preference system. The T1-A “invocation seam” is therefore **not the first atom-to-MAIA crossing in the repository**.

However, the loader neither selects nor filters `generated_by`. Its projector partitions authorship only by:

```text
sourceType === 'practitioner_observation'
```

Everything else is rendered under:

```text
# MEMBER-PLACED PORTFOLIO
```

with the statement that the member explicitly kept it and that it is not system-inferred (`lib/maia/memoryAtomsLoader.ts:441-460`).

Because the schema explicitly permits non-practitioner origins such as `inference`, `synthesis`, `derivation`, and `unattributed-historical`, this representation is not structurally proven by the SQL it reads.

**J2 significance:** there is a producer/authorship truth gap independent of T1-A's new READ capability.

---

# 8. `/maia` has two concurrent Keep invocation contracts

This is the central J1 finding.

## 8.1 Client contract — recognition does not commit

`lib/consciousness/keepIntent.ts` records a Kelly ruling dated 2026-08-28:

```text
UNDERSTAND   MAIA understands Keep intent.
FACILITATE   the House may surface/open the member-controlled Keep gesture.
COMMIT       only the member's own confirmation may persist the material.
```

It then states:

> Recognition must never silently collapse into commitment.

`components/OracleConversation.tsx:6294-6337` follows that contract:

- it runs after MAIA's reply exists;
- Sanctuary suppresses the doorway;
- `open_keep` opens a zero-persistence preview;
- `keep_material` attaches a member-controlled doorway;
- the block itself performs no persistence.

The capture flow then prepares an unsaved reflection-capsule draft and persists only when the member confirms (`components/OracleConversation.tsx:4797-4848`).

## 8.2 Server contract — high-confidence recognition commits immediately

The same `/maia` surface uses `apiEndpoint="/api/sovereign/app/maia/list"` (`app/maia/page.tsx`).

That server route contains a second, feature-flagged Keep sidecar. When `CONVERSATIONAL_KEEP_ENABLED === 'true'`, a high-confidence filing match calls `applyConversationalKeepResult()` immediately before the response returns (`app/api/sovereign/app/maia/list/route.ts:1848-1888`).

`parseFilingInstruction()` classifies phrases such as:

```text
keep this
keep that
keep it
```

as high-confidence `destination='keep'` and returns:

```text
memberDirected: true
confidence: 'high'
excerpt: utterance
```

`applyConversationalKeepResult()` then mints the atom through `keepSource()`.

So, when the server feature flag is enabled, the sequence can be:

```text
member says “keep this”
        ↓
server recognizes phrase
        ↓
server persists member-gesture atom
        ↓
response reaches client
        ↓
client independently recognizes Keep intent
        ↓
client surfaces a doorway whose own contract says persistence has NOT yet occurred
```

These are not merely two UI implementations. They disagree about **when authority to persist is earned**.

---

# 9. The conversational writer does not resolve the referent of “this”

`parseFilingInstruction()` stores the entire current utterance as `excerpt`.

For a general Keep, `applyConversationalKeepResult()` writes:

```text
sourceType = 'spontaneous'
sourceId   = null
title      = instruction.excerpt
body       = instruction.excerpt
```

Therefore the literal request:

```text
keep this
```

can create an atom whose stored title/body are:

```text
keep this
```

The orchestration path does not resolve whether **this** means:

- MAIA's immediately prior sentence;
- the member's preceding reflection;
- a larger exchange;
- a quoted phrase;
- or another conversational object.

This is a direct object-scope gap. The member act may be explicit while **the thing being kept is not established**.

A second asymmetry follows: destinations such as `ideas`, `decisions`, `changes`, `journal`, `dreams`, and `reflections` map to non-spontaneous source types but `applyConversationalKeepResult()` passes `sourceId=null`; `keepSource()` rejects non-spontaneous inputs without a source id. Those filing commands therefore cannot complete through this bridge as written.

---

# 10. The conversational confirmation UI is presently unwired

`KeepAffordance` exists and can handle:

- accepting an offer;
- declining an offer;
- confirming a low-confidence filing;
- pausing/resuming offers.

But an exhaustive repository grep at the evidence commit found **no rendered `<KeepAffordance ...>` usage**. `OracleConversation.tsx` imports the component and carries a `keepIntent?` type field, but the server's `responseData.keepIntent` is not mapped into a conversation message and there is no consumer of `.keepIntent` in the UI tree.

Therefore:

- a high-confidence server filing can commit silently relative to this affordance;
- a low-confidence server filing can return a confirmation intent that this component does not render;
- the client-side `detectKeepIntent()` doorway is a separate path, not the completion of the server KeepIntent protocol.

No dedicated test suite was found exercising `parseFilingInstruction()` → sovereign `/maia` route → persistence → rendered confirmation as one behavioral chain.

---

# 11. Sanctuary is correctly guarded in the client Keep experience but not in the server conversational writer

The client path has explicit Sanctuary refusal both at Keep-intent routing and at the capture/confirm seam.

The Workbench Keep reader also excludes `posture_at_creation='sanctuary'`.

The canonical sovereign route correctly computes `isSanctuary` and uses it widely to suppress turn persistence, memory loading, relational observation, and other durable behavior.

But its conversational Keep sidecar condition is:

```text
if (userId && message && process.env.CONVERSATIONAL_KEEP_ENABLED === 'true')
```

It does **not** include `!isSanctuary`.

`keepSource()` then hardcodes the minted atom's posture to:

```text
posture_at_creation = 'normal'
```

rather than receiving the actual turn posture.

Thus, **if the server feature flag is enabled**, an explicit Keep-shaped utterance during Sanctuary can reach a writer that mints a normal-posture member atom even though the surrounding route knows the turn is Sanctuary and the client refuses the Keep doorway.

This census did not inspect production environment values. It therefore records the path as **feature-flagged and structurally reachable**, not as a claim that it executed in production on 2026-09-17.

Given the ratified Sanctuary invariant, this is a J2 contradiction candidate, not an implementation instruction.

---

# 12. Salience does not itself Keep — this part is correctly separated

The older `/api/oracle/conversation` sidecar contains `evaluateKeepOffer()` logic that can notice phrases suggesting salience.

That evaluator returns only an offer. It does not call `keepSource()` merely because salience was detected.

Persistence occurs through `offer_accepted`, after a member response.

This distinction is constitutionally important and should be preserved:

```text
system notices / offers
        ≠
member Keeps
```

The problem is not the existence of an offer evaluator. The problem is that this offer/confirmation protocol is not the same protocol currently governing `/maia`'s client-side Keep experience.

---

# 13. Answer to the decisive J1 question

## “Can anything become a Keep without an explicit member act?”

There are three different answers because the repository currently uses three different meanings of Keep.

### Press Keep

**Live product path found:** no system-only creator. The live UI uses an explicit member button and the write route re-verifies exact source text.

**But:** the database row itself carries no independent gesture provenance, and a non-production witness script can insert fixtures directly.

### Generic portfolio Keep (`generated_by='member-gesture'`)

**No salience-only writer was found.** The shared `keepSource()` writer is reached from member-facing requests / instructions and stamps `generated_by='member-gesture'`.

**However, the repository does not mechanically prove that this stamp corresponds to the stronger client contract of a separate member-controlled confirmation.** The feature-flagged `/maia` server parser can mint a member-gesture atom immediately from a high-confidence utterance such as “keep this,” before the client reaches the confirmation path.

Under the stronger `KEEP-INTENT-01` authority contract, the strict answer is therefore:

> **YES — a `member-gesture` Keep can be minted without passing the member-controlled confirmation seam that `/maia` itself says COMMIT requires.**

It is not a system-salience mint; it is an **authority-seam mismatch** between two definitions of what counts as the completing member act.

### `member_memory_atoms` generally

**YES, intentionally:** practitioner observations are inserted without a member Keep gesture. They are not Keeps when `generated_by` is honored. This is precisely why atom ≠ Keep.

---

# 14. J1 reconciliation table

| Area | Repository truth at `60dbf1e8` | Standing for J2 |
|---|---|---|
| Press Keep write | explicit UI button + member-scoped verbatim re-verification | strong specialized ancestor |
| Press Keeps READ | credential-scoped, bounded, orders but never selects | strong specialized ancestor |
| Generic Keep identity | `member_memory_atoms.generated_by='member-gesture'` | strongest generic discriminator found |
| Atom registry | mixed provenance; includes practitioner observations and permits other generation classes | must not be equated with Keeps |
| `/maia/keep-capture` read | reads atoms without `generated_by` | weaker than generic Keep discriminator |
| Workbench Keep read | filters member-gesture + personal + non-Sanctuary | strongest generic read primitive found |
| MAIA atom prompt loader | already loads return-eligible atoms, but does not carry/filter `generated_by` | producer/authorship truth gap |
| `/maia` client Keep intent | recognition → doorway/preview → member confirmation → persist | stronger authority ancestor |
| `/maia` server conversational filing | high-confidence phrase → immediate `keepSource()` | parallel, conflicting invocation semantics |
| Conversational referent | stores utterance as object; “keep this” can store “keep this” | object-scope gap |
| KeepAffordance | component exists but has no rendered consumer | declared/unwired |
| Sanctuary client path | refuses Keep surface and confirmation | strong ancestor |
| Sanctuary server filing | lacks `!isSanctuary`; `keepSource()` stamps normal posture | contradiction candidate if flag enabled |
| Salience offer | offer only; no write until acceptance | conforms to offer ≠ Keep distinction |

---

# 15. What J1 changes about T1-A

The T1 charter currently says T1-A is “further along” because a Keeps READ route already exists.

J1 narrows that statement:

> **A mature Press-Keeps read exists. A truthful generic Personal-Keeps read discriminator also exists, but in the Workbench adapter, not in the Press route and not consistently in the House portfolio reader or MAIA atom loader.**

Therefore T1-A cannot safely be implemented by simply wiring `/api/sovereign/keeps` into `/maia` unless the founder explicitly rules that **Personal Keeps means Press Keeps**.

If the intended object is the broader, member-authored Keep family, J2 must reconcile the existing generic discriminator and the existing atom readers first.

---

# 16. Required founder/J2 rulings before any build

J1 leaves four load-bearing decisions. It does not answer them by implementation:

1. **Object ruling:** Does T1-A Personal Keeps READ mean the generic `generated_by='member-gesture'` Keep family, or a qualified subtype such as Press Keeps?
2. **Completion act:** Does the utterance “keep this” itself authorize persistence, or does it authorize only the member-controlled Keep confirmation seam already recorded by `KEEP-INTENT-01`?
3. **Referent law:** What exact object does deictic language such as “this” or “that” denote, and what happens when it cannot be resolved without guessing?
4. **Existing atom-reader reconciliation:** May MAIA's current ambient atom loader continue to call non-practitioner atoms “member-placed” without proving `generated_by='member-gesture'`?

Sanctuary does **not** need a new policy decision: the existing invariant already says no Sanctuary content may be saved. The server Keep path must eventually reconcile to that stronger law; this census does not authorize the repair.

---

# 17. J1 closure

**J1 repository census: COMPLETE.**

What has been established:

```text
Keep family
  ├─ Press Keep                         specialized, mature read/write boundary
  ├─ member-gesture atom Keep           generic Keep discriminator
  └─ House Keep experience              currently spans multiple substrates

member_memory_atom ≠ Keep

and

/maia currently has more than one Keep authority seam.
```

No source, schema, route, prompt, test, migration, or `/maia` surface has been changed by this record.

**J2 remains unopened. Implementation remains unauthorized.**
