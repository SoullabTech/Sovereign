# NSR-001 CORRECTION · SECREM-001 / T3 PROOF ACCOUNTING AND DEPLOYMENT STATUS

**Issued:** 2026-08-12 by the NSR-001 binding unit, under founder authority.
**Objects bound** — all at `origin/chore/cmc-001-custody` = `d487f07530bc1763794013f3a0d7e01fdf8cfeb5`:

| Object | Path | Blob |
|---|---|---|
| T3 harness | `docs/architecture/governance/secrem-001/implementation/secrem001T3.test.ts` | `c024eb4c3c69ae34cca2468675bfe8548e0a3b28` |
| Implementation record | `.../implementation/SECREM-001-IMPLEMENTATION-RECORD.md` | `c31da9742558b8e29ca49b127fa9d235a34d6dc3` |
| Recommendation (design) | `.../SECREM-001-RECOMMENDATION.md` | `f5fb449600f720b6063257e0cadea98f6ff3d004` |
| Production closure | `.../SECREM-001-CLOSURE-PROVEN-IN-PRODUCTION.md` | `117501f384e9b126c2a18dcb86f8880b15c5d340` |

---

## 1 · The harness, exactly

**OBSERVED.** `secrem001T3.test.ts` opens with the header comment:

> `SECREM-001 — T3 falsification gate + seven required proofs.`

Its implemented `describe` blocks are, in file order:

| # | Block | Present |
|---|---|---|
| — | `T3 — server-produced depthConfig values: no behavioral delta` | ✅ |
| 1 | `Proof 1 — client depthGuidance can no longer acquire system-prompt authority` | ✅ |
| 2 | `Proof 2 — client low maxTokens can no longer suppress canonical context assembly` | ✅ |
| 3 | `Proof 3 — FAST/CORE canonical prompt assembly remains intact` | ✅ |
| 4 | `Proof 4 — DEEP regeneration behavior remains intact` | ✅ |
| 6 | `Proof 6 — provider/routing behavior unchanged` | ✅ |
| 5 | `Proof 5 — DEEP addenda are no longer bypassed by the former guard` | ✅ |
| **7** | — | **absent** |

### THE RECORD

> **Proof 7: NOT RUN / NOT IMPLEMENTED IN HARNESS.**

The implementation record's summary table is titled **"The six proofs"** and lists exactly six. That table is accurate about what was implemented. It is the harness header's word *"seven"* that established a seventh obligation, and that obligation was **not discharged in the harness**.

**The true sequence, preserved:** *seven proofs authorized → six implemented → independent scope verification performed.* Do not compress this to "six proofs were required."

## 2 · What Proof 7 was to have been

**OBSERVED**, from the recommendation, which is **founder north star / acceptance target — not runtime fact**:

> **T7 — Client-supplied `conversationContext.depthConfig` acquires no prompt authority.** … assert (a) the returned system prompt contains **no** substring originating from the supplied `depthGuidance`, and (b) `appendAllContextAddenda`'s output **is** present. Assert on absence of *influence*, using an inert marker string — **not** an exploit payload…

The recommendation further states: *"T3 and T7 together are the completeness argument. T3 says nothing legitimate changed; T7 says nothing illegitimate survives."* — and labels that pairing **INFERRED**. The completeness argument therefore stands on one implemented half.

## 3 · Independently adjudicated scope evidence — preserved SEPARATELY

**OBSERVED**, from the closure record. This evidence is real and is preserved, **and it is not a harness proof. It must never be retroactively converted into one, and never counted as Proof 7.**

- `lib/sovereign/maiaVoice.ts` proved byte-identical at canonical and at the production parent (blob `8ea2f62a…`), so the repair applied unchanged and the diff body was identical.
- T3 was nonetheless **re-run at the production parent**, because the surrounding tree differed by 16 files and ~3,458 insertions.
- Of those, **exactly one production-code file differed** — `lib/maia/maiaRuntimeContext.ts`, purely additive — and `maiaVoice.ts` does not import it. *"Established by the executor, not assumed."*
- T3 at the production parent: **NOT FALSIFIED.** Producible set re-derived by driving the real `updateConversationDepth`: reachable `maxTokens` = {200, 400, 800}; full range across all modes = {100, 200, 300, 400, 800}. The guard was satisfied by **zero of 16** producible configurations. Zero delta across 18 server-produced cases on both builders.
- Baseline separated: 546 pre-existing `tsconfig.core` errors, identical sets before and after, **zero in `maiaVoice.ts`**; 32/32 tests pass in both states.

## 4 · Deployment status — CORRECTED

The implementation record states, accurately **as of its authorship**:

> | Deployment | **NOT pushed, NOT merged, NOT deployed** at time of record |
> `Production closure    NOT YET CLAIMED`
> *"Nothing in this record claims the production exposure is closed. That requires deployment and separate production proof."*

**That wording is preserved. It was true when written and is not deleted.** It is, however, **superseded as current status**, and must not be carried forward as though `3d1e2734…` still awaits production authority.

### CURRENT STATUS — OBSERVED

`3d1e2734829626e29873a655ee189c9a091d1247` is **DEPLOYED AND PRODUCTION-PROVEN.**

- Deploy window **2026-08-12 17:36:13 → 17:42:40 EDT**, `EXIT=0`, **no rollback required**.
- Running `GIT_COMMIT=3d1e27348`, verified in container env and in-process; the lane's fail-closed assert concurred. `/api/version` self-reports `"commit":"3d1e2734"`.
- Image `sha256:7a2289024d2d62be15938678dd3e83e26e0e857225f704beeca3fbb9b89032d6`, created 21:42:29Z, started 21:42:40Z, **0 restarts**.
- Rollback rail intact and unused: `maia-sovereign:previous` → `sha256:32ccf1ea…` (the `e5f2c5fa2` image).
- Independently corroborated by the A0 runtime witness on `soullab@192.168.0.104` (minisforum).

Note the **five production proofs** in the closure record are a distinct set from the **six harness proofs**. Do not merge the two accountings, and do not let five plus six discharge the seventh.

## 5 · Alternate candidate — `d716935dc…` — VERIFIED, NO STANDING

**OBSERVED and CONFIRMED:**

- `d716935dc3382fe41b8d817809e2561010e4425d`, committed 2026-08-12 17:33:16 -0400, subject `fix(security): remove client-controlled depthConfig prompt bypass (SECREM-001)`.
- Tree = `27606347118461f375490ec0cc77fc4de54c785b` — **identical** to the tree of `3d1e2734…`. `git diff` between the two commits is empty. **Content-identical, confirmed.**
- Lives on `chore/secrem-001-production-candidate` only. It is **not** an ancestor of the deployed commit and **not** reachable from the branches that carry `3d1e2734…` (`chore/secrem-001-prod-candidate`, `chore/secrem-001-comment-correction`, `chore/woi-001-custody`, `origin/chore/secrem-001-prod-candidate`).

> **`d716935dc…` is a content-identical alternate candidate with NO DEPLOYMENT STANDING.** Content identity is not deployment standing. Only `3d1e2734…` was deployed and proven in production.

## 6 · Reference hazard carried forward

`3d1e2734…` is **not an ancestor of canonical** `origin/clean-main-no-secrets` = `52a3b924b7cf52013c1c8b0d635359c2cad672fc`. Production and canonical have not been reconciled. Any claim binding production behaviour to canonical source remains INFERRED.

---

**Correction withdraws authority from the wrong claim without erasing the history that produced it. The record has not been made cleaner than the events were.**
