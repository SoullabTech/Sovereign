# PT-3 Falsifier — result

**Authority:** FOUNDER RULING — Writer's Studio · Life of a Work (2026-09-08): PT-3 source semantics
ruled, falsifier AUTHORIZED, remediation NOT authorized.
**Instrument:** `scripts/witness/pt3-source-custody-falsifier.ts`
**Run of record:** 2026-09-08 · disposable fixture cluster (PostgreSQL 16, `server_encoding=UTF8`),
schema built from the repository's own migration files · **23 passed · 0 failed · 3 structurally-unenforced**

> **VERDICT — PT-3 IS BEHAVIORALLY RESPECTED AND STRUCTURALLY UNENFORCED.**
> No shipped Writer's Studio content-working path writes either protected tier. Nothing in the
> architecture would refuse one that did. The red is the finding and is returned intact.

---

## 0. Method, and what it is not

Two claims are kept apart throughout, because one is routinely mistaken for the other:

- **BEHAVIORAL COMPLIANCE** — do the shipped paths refrain from writing either protected tier?
- **STRUCTURAL ENFORCEMENT** — would the architecture *refuse* a path that attempted it?

The instrument's exit code answers **behavioral compliance only**. Structural findings are emitted in
their own vocabulary (`RED`) and deliberately do not mask it: a green exit here means *"nothing shipped
misbehaves"*, never *"the boundary holds."*

**Safety.** Legs 3 and 4 issue deliberately destructive writes. The instrument refuses to run unless
`PT3_FALSIFIER_CONFIRM=1` **and** `DATABASE_URL` names both a local host **and** a database marked
disposable. Both refusals were demonstrated. A hostname check alone was rejected as insufficient — a
developer's machine can hold real member data on localhost. No production or member material was
touched at any point.

**Fixture fidelity.** The fixture cluster was built by applying the repository's real migration files;
all fourteen tables in the manuscript/source lineage were created by their own migrations, and none of
the 56 unrelated migration failures touch that lineage. Three fixture corrections were forced by
**real shipped constraints** — the `member_manuscripts_provenance_check` vocabulary, and the
`manuscript_working_drafts_round_trip` trigger, which flattens draft sections by bare concatenation.
That is worth recording on its own: **the descendant tier already carries structural enforcement of
exactly the kind the protected tiers lack.**

---

## 1. Complete Source-write census (Leg 1 — PASS)

Scan of `app/**` and `lib/**` (tests excluded, comments stripped before scanning) for any
`INSERT` / `UPDATE` / `DELETE` against either protected tier. **Three write sites exist. All three are
classified. The contract is this named set, never its length** (FR-14: an instrument can satisfy all of
its remaining questions by forgetting to ask the difficult ones).

| Site | Tier | Statement | Classification | Purpose |
|---|---|---|---|---|
| `app/api/sovereign/manuscripts/route.ts` | SOURCE REPRESENTATION | `INSERT` | extraction / Source representation creation | Import cuts the arrival into sections. Creates the representation; never revises one. |
| `lib/manuscript/source/arrivals.ts` | HISTORICAL SOURCE | `INSERT` | arrival creation | `recordArtifactArrival` / `recordSuppliedArrival` — written once. |
| `lib/manuscript/source/arrivals.ts` | HISTORICAL SOURCE | `UPDATE` | custody or claim bookkeeping | `claimArrival` binds an unclaimed arrival to a manuscript. Guarded by `manuscript_id IS NULL`; touches no source text, hash, or artifact. |

**No write anywhere in shipped code is classified as a prohibited content-working mutation.** The census
also asserts the reverse direction — every allowlisted site still exists — so it cannot silently go
stale as code moves.

`eraseManuscript` reaches the Historical Source by **FK cascade** from `member_manuscripts`, not by a
direct write, which is why it holds no row above. It is an explicit Source lifecycle operation and is
exercised behaviourally at A4.5.

---

## 2. Behavioral results — every content-working path (Leg 2 — PASS)

Both tiers were witnessed before and after each act: arrival rows + digest + **vault bytes re-hashed
from disk** (not the row's claim about them) + `verifyCustody`; and the full section set digested over
`(id, position, heading, body, heading_depth, heading_signal)`.

| Act | Outcome | Historical Source | Source Representation |
|---|---|---|---|
| `saveSection` — revise a draft section | `saved` — **mutated** | preserved | preserved |
| `authorStructureFromProposal` — adopt a structure | `ok` — **mutated** | preserved | preserved |
| `convertDraftToSections` — first partition of an unconverted draft | `converted` — **mutated** (2 draft sections written) | preserved | preserved |
| `normalizeLegacyScaffoldForDraft` | `refused: not_legacy_composer_variant` | preserved | preserved |
| `convertDraftToSections` on an already-converted draft | `refused: already_converted` | preserved | preserved |

**Stated plainly: three of five acts performed real mutations; two were declined by their own
preconditions and therefore exercised the guard rather than the mutation.** Their refusal reasons are
carried verbatim rather than reported as passes, because a precondition refusal is not evidence of
custody. The first-partition act is additionally asserted to have *actually run* (`B5x`) so that "the
Source did not change" can never be satisfied by an act that did nothing.

`B4` asserts the inverse obligation: the **descendant working representation DID change** (draft
version advanced). Custody must not be satisfiable by paralysis.

**Coverage boundary, stated honestly.** Leg 2 drives the library functions the routes delegate to, not
the HTTP handlers. Exhaustive route-level coverage is carried by **Leg 1**, which scans every route
file in `app/**`; Leg 2 supplies behavioural depth beneath it. Neither leg alone would be sufficient.

**Incidental architectural finding.** `authorStructureFromProposal` computes its topology hash from
`manuscript_draft_sections` — the descendant — and never hashes the Source Representation at all.
Structural authorship is already seated on the descendant tier.

---

## 3. Adversarial results — HISTORICAL SOURCE (Leg 4)

| ID | Attack | Result |
|---|---|---|
| **A4.1** | `UPDATE manuscript_source_arrivals SET source_text, source_text_hash` — forged text **with a matching hash**, so the row stays internally consistent and a hash-only check sees nothing wrong | 🔴 **1 row affected. The received artifact can be rewritten in place.** |
| A4.2 | Second arrival claimed onto the same manuscript | ✅ PASS — added, not merged; the first arrival's text is untouched |
| A4.3 | Destroy the vault bytes, leave every column intact | ✅ PASS — `verifyCustody → false: artifact_missing`. A hash without recoverable bytes is not custody. |
| A4.4 | Restore the bytes | ✅ PASS — `verifyCustody → true: artifact_recovered` |
| **A4.5** | Member-directed `eraseManuscript` | ✅ PASS — arrivals=0, manuscripts=0. **Gone, not altered.** PT-3's amendment holds: custody against working acts has not become immutability that traps the owner. |

Note on A4.2: `verifyCustody` reads the **earliest** arrival for a manuscript, so a manuscript may
accumulate multiple claimed arrivals with the first remaining authoritative. Not a violation; recorded
because a future re-extraction or replacement lifecycle operation will have to rule on it.

## 4. Adversarial results — SOURCE REPRESENTATION (Leg 3)

| ID | Attack | Result |
|---|---|---|
| **A3.1** | Smuggle a `manuscript_sections` id into `saveSection` as if it were a draft section | ✅ PASS — `refused: section_not_found`. Id resolution is **tier-scoped**: the lookup joins on `draft_id`, so a Source id cannot cross into a draft mutation. This is the one genuine structural protection found. |
| **A3.2** | `UPDATE manuscript_sections SET body` — exactly the statement a future WRITE gesture, Restore, or LLM-proposed repair would issue, using the application's own credentials and pool | 🔴 **2 rows affected.** |
| **A3.3** | `DELETE` a Source Representation row beneath a live Working Draft | 🔴 **1 row affected. A Working Draft's origin can be removed from under it.** |

---

## 5. Where PT-3 is structurally unenforced — the exact boundaries

**One boundary, reached three ways: the application's database role has unrestricted DML on both
protected tiers, and neither tier carries any refusal of its own.**

1. **`manuscript_sections` — no `UPDATE` refusal.** Nothing distinguishes a content-working `UPDATE`
   from the import's legitimate `INSERT`. (A3.2)
2. **`manuscript_sections` — no `DELETE` refusal, and no referential protection from its descendants.**
   `manuscript_draft_sections.source_section_id` does not prevent removal of the row it descends from.
   (A3.3)
3. **`manuscript_source_arrivals` — no `UPDATE` refusal.** The custody columns are ordinary mutable
   columns; the arrival's own `claimArrival` guard (`manuscript_id IS NULL`) protects the claim field
   only, and nothing protects `source_text`, `source_text_hash`, `artifact_ref`, or `artifact_hash`.
   (A4.1)

**What is NOT unenforced:** the tier-scoped id resolution in `saveSection` (A3.1), the vault-bytes
custody check (A4.3/A4.4), and the round-trip trigger on the descendant tier. The architecture has
already demonstrated, on the draft tier, that it knows how to refuse.

**The asymmetry is the whole finding.** The descendant working representation — the tier that is
*supposed* to change — carries a database trigger enforcing its coherence. The two tiers that are
constitutionally forbidden to change carry nothing. PT-3 currently holds because no one has yet
written the code that would break it.

---

## 6. Smallest materially different enforcement options

Presented for constitution; **none is implemented, and per the ruling none may be without a new ruling.**

| | Option | Mechanism | Locus of authority |
|---|---|---|---|
| **E1** | **Refusal trigger on each protected tier** | `BEFORE UPDATE OR DELETE` on both tables, raising unless a session-local lifecycle flag is set by a governed lifecycle operation | The database refuses. Authority sits in schema. |
| **E2** | **Least-privilege role split** | Application role holds `INSERT` only on the protected tiers; `UPDATE`/`DELETE` granted to a separate lifecycle role used solely by governed lifecycle operations | The grant refuses. Authority sits in role configuration. |
| **E3** | **Single mandatory Source seam** | All protected-tier writes routed through one module; enforced by the Leg 1 census as a build-time gate | Code refuses. Authority sits in review + CI. |
| **E4** | **Census-only (status quo + this instrument in CI)** | Leg 1 fails the build on any unclassified Source write | Nothing refuses at runtime. Authority sits in the gate's continued existence. |

### 7. Costs and architectural consequences

**E1 — trigger.** *Strongest.* Refuses every path including psql, migrations, and future code nobody
reviews. **Costs:** the lifecycle escape hatch becomes the new boundary and must itself be governed, or
PT-3 is merely relocated; a session-flag mechanism is invisible in the schema and easy to misuse;
migrations that legitimately touch these tables must learn to disarm it; error surfaces are database
exceptions far from the calling code. **Consequence:** the constitution becomes schema, which is where
it is hardest to erode and hardest to change — including hardest to change when a future ruling needs
it changed.

**E2 — role split.** *Strong and conventional.* Refuses at the connection, no application logic.
**Costs:** the deployment gains a second credential and a second connection path — real operational
surface in a self-hosted stack, and a new secret to rotate (cf. MAIL-04c); the erasure path and any
future re-extraction must acquire it; a misconfiguration fails *open* if the app is accidentally run as
the privileged role, and nothing would report that. **Consequence:** custody depends on deployment
configuration, which is exactly the class of fact this project has repeatedly found to drift
unattributed.

**E3 — single seam.** *Most legible.* One module to read, one place to review, errors near the caller,
and it composes with PT-2's "enforce at the mutation boundary". **Costs:** it is advisory — a direct
`query()` still works, so it protects against accident and never against intent; it is only as strong
as the census that guards it. **Consequence:** the boundary becomes a code-review institution rather
than a structural fact.

**E4 — census only.** *Cheapest, honest about what it is.* **Costs:** proves nothing at runtime; a
deploy that skipped the gate carries no protection; PT-3 stays a property of the code. **Consequence:**
the constitutional claim remains true by discipline, which is the condition this run just documented.

**Not a recommendation, but the shape worth noting:** E1 and E2 both make custody *structural* at the
cost of relocating the escape hatch, and neither can be constituted before the ruling that governs
legitimate Source lifecycle operations — re-extraction, replacement, withdrawal, deletion — since each
enforcement option must name exactly what is permitted to pass through it. **The lifecycle ruling is
therefore upstream of the enforcement ruling, not parallel to it.**

---

## 8. Standing

⛔ No remediation performed. No trigger, role, grant, constraint, migration, Source seam, Encounter,
Restore, intention authority, or lineage. WS2-08B HOLD untouched. The instrument is committed red and
must not be made green by weakening the claim.
