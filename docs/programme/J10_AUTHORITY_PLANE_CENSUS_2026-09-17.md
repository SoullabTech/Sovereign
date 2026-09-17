# J10 — BOUNDED AUTHORITY-PLANE CENSUS

**Status:** CENSUS OPENED by founder act 2026-09-17. **READ-ONLY.** ⛔ NOT A BUILD.
**Predecessor:** J9 J4 ✅ **CLOSED @ `d7bc229a`** — `J9_REPRESENTATION_AUTHORITY_ADJUDICATION_2026-09-17.md`
**Governing:** `docs/canon/REPRESENTATION_AUTHORITY_LAW.md`
**Seams in scope (3):** Retrieval · Capability availability · Keep-act recognition

⛔ **Prohibited in this lane:** modify `RetrievalService` · add an authority table · repair the Keep matcher ·
activate `CAPABILITY_REGISTRY` · generalize the implementation primitive across all six lanes.

---

## §0 — ⚠️ A claim of mine is withdrawn, and the law caught it

My prior message concluded: *"six lanes, one missing layer."*

**RULED NOT WARRANTED.** *Layer* is not authorized terminology here, and one universal authority plane may not
be assumed merely because the failures rhyme.

⭐ **This is the Representation Authority Law operating on my own reasoning.** The *rhyme between six findings*
is a representation of those findings. I let it acquire the authority of an architectural conclusion, with no
governed act granting it and no attestation that would fail if the analogy were false. **Substitution: hold
the six findings constant, change the rhyme, and my conclusion changes — so the rhyme was authority-bearing.
Grant: none. Attestation: none.** The law's own defeater rejects it.

**The warranted statement:**

> Six lanes presently exhibit evidence of a missing or insufficiently explicit governed-authority boundary.

**What the census must determine** — and may not presuppose:
1. one reusable architectural authority plane;
2. several domain-specific authority contracts sharing one constitutional law; or
3. some combination.

---

## §1 — ⭐⭐ THE LARGEST FINDING: the authority plane is NOT missing. It is BYPASSED.

`J9 §7` recorded that the retrieval read path has *"no authority-plane join."* That is true of
`RetrievalService.ts` and **false of the repository.**

| Object | Lines | What it does |
|---|---|---|
| `lib/corpus/admission.ts` | 356 | **Declaration-based corpus admission.** `data/ain/corpus-admission.json` names what enters. **Default is EXCLUSION.** `declared + classification + authority → ADMITTED`; undeclared → EXCLUDED; declared-but-human-record-signal → REFUSED. |
| `lib/library/globalRetrievalAuthority.ts` | 99 | Binds **admitted repository path AND SHA-256 of the governed bytes**. Self-described as *"a REPRESENTATION boundary, not a storage boundary."* |
| `lib/library/LibraryService.ts` | — | **Enforces it**, injecting `buildGlobalLibraryAuthoritySql('s', …)` at **two** query sites (`:296`, `:367`). |

**`RetrievalService.ts` imports exactly three things** — `query`, `generateLocalEmbedding`,
`toPgVectorLiteral`. It does not import admission, authority, or LibraryService.

⭐ **So there are two retrieval paths, and only one is authority-bearing.** The finding upgrades from *no
authority plane exists* to **an authority plane exists, is well-built, is enforced on one path, and a second
reader bypasses it entirely.** That is materially more actionable and materially less alarming.

### §1a — A SEVENTH lane, which already built the remedy

`admission.ts` states its own law:

> **Membership must be DECLARED and CHECKED, never INHERITED from where a thing happens to sit.**

Its recorded defect: *"Three beta-tester contact lists sat in that directory, so 21 people's names and
addresses were eligible to become material MAIA could retrieve and speak. Nobody decided that.
**The directory decided it.**"*

⭐ **That is the Representation Authority Law, discovered independently in `SOURCE-CUSTODY-PII-01 ACT 4 §C`,
and it is the precise instance of *table membership does not grant authority*** — one storage layer down.
It also names three prior proofs of the same shape (*a worktree did not mean disclosure-bounded; `--sandbox
read-only` did not mean privacy-bounded; a source directory did not mean knowledge-authorized*).

⚠️ **This strengthens the convergence evidence AND weakens the "one plane" hypothesis in the same stroke** —
the remedy that exists is *domain-specific* (a corpus declaration file), not a general plane. Recorded as
evidence for census outcome **(2)**, ⛔ not as a finding.

---

## §2 — The census

⛔ `UNKNOWN` means not established by this census. It is never read as absence.

### SEAM A — Retrieval (`lib/ain/knowledge/RetrievalService.ts`)

| Question | Finding |
|---|---|
| **Thing** | A governed corpus source: identity, admitted bytes, rights-holder authority |
| **Representation** | embedding presence · `domain` · `categories` · similarity score |
| **Effect** | Determines whether corpus material **exists for retrieval at all** (4 predicates, J9 §6) |
| **Grant** | ⛔ **NONE NAMEABLE.** No governed act grants these four representations eligibility authority. A grant exists for the *other* path (corpus declaration → `globalRetrievalAuthority` → `LibraryService`) and this reader does not consume it. |
| **Scope** | ⛔ Unbounded on this path — no corpus scope, no admission predicate, no rights predicate |
| **Revocation** | ⛔ NONE — authority is table membership; removal requires deleting rows |
| **Attestation** | ⛔ NONE — no retrieval-policy version; classifier and `MODE_FILTERS` may change silently |
| **Absence** | ⛔ **Fails open.** No valid grant ⇒ everything in `ain_knowledge_chunks` is implicitly eligible |
| **Authority class** | Presently **AUTHORITATIVE by default**; each should be **DESCRIPTIVE** or at most **SELECTIVE** |
| **Derivation** | regex (`spiralogicTagger.detectDomain`, `ChunkingService:90`) · local embedding model (unversioned) |
| **Execution** | **CANONICAL** — not evaluation-only |

⭐ **This seam's answer is now specific**: not *build an authority plane* but *this reader does not consume the
one that exists.* ⛔ Whether consuming it is correct or sufficient is **not decided here**.

### SEAM B — Capability availability (`lib/maia/capabilities.ts`)

| Question | Finding |
|---|---|
| **Thing** | Whether MAIA can actually do something for a member |
| **Representation** | `CAPABILITY_REGISTRY` — 13 declared ids with labels, worlds, voice phrases |
| **Effect** | ⭐ **NONE TODAY.** 0 consumers · 0 callers · 0 emissions (J9 / Maven R3) |
| **Grant** | n/a — nothing is granted because nothing is exercised |
| **Scope** | UNKNOWN |
| **Revocation** | UNKNOWN |
| **Attestation** | ⛔ NONE |
| **Absence** | ⛔ **Fails open in a different direction**: `voiceNavigationBridge.ts` (60 lines, window `CustomEvent`, self-described *temporary transport*) carries navigation with **no capability check at all** |
| **Authority class** | Presently **inert**. Intended class **UNDECLARED** — the open question |
| **Derivation** | hand-authored |
| **Execution** | **NEITHER** canonical nor evaluation-only — declared and unreached |
| **Law** | *A capability declaration does not establish capability availability* (Maven R3) |

⚠️ **This seam is the inverse of Seam A and that is why it belongs in the census.** Seam A has effect without
grant; Seam B has **declaration without effect**. A census assuming *representations grab authority* would
mis-describe it. ⭐ It is the control case: it shows the defect is **the grant/effect relation**, not
representations as such.

### SEAM C — Keep-act recognition (`lib/consciousness/keepIntent.ts`)

| Question | Finding |
|---|---|
| **Thing** | The member's actual speech act — KEEP (preservation) vs CONTINUE (Manual §7) |
| **Representation** | deterministic phrase match against `KEEP_MATERIAL_PHRASES` / `OPEN_KEEP_PHRASES` |
| **Effect** | Decides **which gesture is offered**. ⭐ Does **not** persist — the KEEP AUTHORITY CONTRACT holds |
| **Grant** | ⭐ **A GENUINE GRANT EXISTS, AND IT IS NARROWER THAN THE USE.** Kelly ruling 2026-08-28: `UNDERSTAND` (recognize intent) · `FACILITATE` (surface the gesture) · `COMMIT` (**member only**). It grants recognition **that Keep intent was expressed**. ⛔ It does **not** grant authority to decide **which of two different acts** occurred. |
| **Scope** | Recognition and surfacing only. Persistence explicitly excluded and structurally held |
| **Revocation** | Member declines; `keep-governor.ts` records decline streak and cooldown |
| **Attestation** | ⚠️ PARTIAL — `keepIntent.test.ts` and `keepOpenNonPersistent.test.ts` exist, but **nothing goes red when CONTINUE is read as KEEP** (witnessed: *"keep this question open"* → `keep_material`) |
| **Absence** | ✅ **Fails CLOSED** — no match ⇒ no affordance ⇒ nothing offered |
| **Authority class** | **SELECTIVE**, correctly — it determines membership in a bounded result (which affordance) |
| **Derivation** | hand-authored phrase lists |
| **Execution** | CANONICAL |

⭐⭐ **This seam is the most instructive of the three, and it is the one that most resembles a healthy system.**
A grant exists, scope is bounded, revocation exists, absence fails closed, and the class is right. **The defect
is a scope overrun, not an ungoverned authority** — the representation is doing something adjacent to, and
outside, what its grant covers. ⚠️ **That is a distinct failure mode from Seam A** and a census that reported
both as *"missing authority boundary"* would erase the difference.

---

## §3 — Does the same structural contract fit all three?

⛔ **NOT ANSWERED — that is the census's purpose, and one pass over three seams does not settle it.** Recorded
as evidence, not conclusion:

| | Seam A Retrieval | Seam B Capability | Seam C Keep |
|---|---|---|---|
| Grant exists | ⛔ no | n/a | ✅ yes |
| Effect exists | ✅ yes | ⛔ no | ✅ yes |
| Failure direction | **open** | **open** (via bypass) | ✅ **closed** |
| Attestation | ⛔ none | ⛔ none | ⚠️ partial, wrong axis |
| Correct class | DESCRIPTIVE / SELECTIVE | undeclared | ✅ SELECTIVE |
| Remedy shape | **consume an existing domain plane** | **decide intended class** | **narrow the act, or widen the grant** |

⚠️ **The three remedy shapes are not the same shape.** That is the census's most important negative result:
it is **evidence against outcome (1)** — a single reusable authority plane — and **for outcome (2) or (3)**.

⛔ **One pass is not sufficient to rule.** Three seams share one constitutional law and **three different
enforcement needs**; whether a common contract can express all three is an open question the next act must
answer, not assume.

---

## Standing

```text
J9 J4                        ✅ CLOSED @ d7bc229a
REPRESENTATION AUTHORITY LAW CANON · SELECTIVE refined (R3) · taxonomy decomposed (R1/R4)
"six lanes, one layer"       ⛔ WITHDRAWN — unwarranted; defeated by the law's own test
AUTHORITY PLANE              ⭐ EXISTS (admission + globalRetrievalAuthority + LibraryService)
                                ⛔ BYPASSED by RetrievalService
SEVENTH LANE                 SOURCE-CUSTODY-PII-01 ACT 4 §C — same law, domain-specific remedy
SEAM A                       effect without grant · fails open
SEAM B                       declaration without effect · control case
SEAM C                       grant exists · scope overrun · fails closed
COMMON CONTRACT              ⛔ NOT ESTABLISHED — evidence leans (2)/(3), not (1)
RetrievalService             ⛔ UNMODIFIED     Keep matcher  ⛔ UNREPAIRED
CAPABILITY_REGISTRY          ⛔ NOT ACTIVATED  Authority table ⛔ NOT ADDED
IMPLEMENTATION               ⛔ NOT AUTHORIZED
PRODUCTION                   UNTOUCHED · 0 rows · EA ingestion CLOSED
```

**Returned for founder adjudication.**

---

## Appendix — Custody, kept separate as ruled

Three observed custody failures (`MAIA-MAVEN-CANON-01` · `MAIA-NODE-03/04/05` · `J8-R1/R2`) are enough to
**open a custody-system falsification lane** and ⛔ not enough to reconstruct the missing records or fold
custody into authority-plane work.

> **A ruling not in custody cannot govern by recollection.**

⛔ Lane not opened here. ⛔ Nothing reconstructed.
