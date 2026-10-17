# Glenn Perry × MAIA — Stage A original-commentary readiness

**Date:** 2026-10-17  
**Branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Disposition:** **Prepared for founder editorial review; not admitted, indexed, deployed, or activated.**  
**Rights-holder contact:** Kelly will contact Glenn Perry personally in the future. **Do not send an email, make contact, or treat the prepared draft as permission.**

## Why this is a separate path

The purpose is to carry Soullab's *original, attributed commentary* about concepts encountered in Glenn Perry's publicly available work **without reproducing or training on his books or essays**. The work is editorial synthesis created for founder consideration, not a pretense that Soullab owns the source books or that Kelly has personally authored every sentence of this draft.

**Path A: original commentary** — could be eligible for a narrowly governed Soullab source after content, attribution, organizational authority, rights basis, and separate founder sign-off are verified.

**Path B: Glenn Perry's copyrighted source text** — fully blocked pending permissions that actually cover the intended uses, potentially including internal embeddings, member-facing excerpts and deletion. Neither owning physical copies nor the existence of an author's public web essays automatically supplies those permissions.

## Stage A file inventory

| File | What it supplies |
| --- | --- |
| `soullab-original-teaching-candidate.md` | Seven original relational inquiry movements, three fictional dialogues, two-lineage comparisons, source links and limits. |
| `claims.json` | 15 separately typed claims: 7 Perry propositions; 8 Soullab editorial/epistemic choices. Every claim is review-only and not retrieval-eligible. |
| `editorial-reading-guide.md` | Extended teaching context and six-part astrology-reading contract. |
| `sources.json` | 11 source records (two books and nine author essays), rights flags all disabled; unresolved edition variants. |
| `acceptance-cases.json` | 16 fictional prompts with safe and prohibited responses. |
| `candidate.test.mjs` | Offline static source and governance tests. |
| `governed-admission-preflight.test.mjs` | Offline tests importing the actual `lib/corpus/admission.ts` and `lib/library/globalRetrievalAuthority.ts` into disposable fixtures. |

## Observed evidence

- Source-contract suite: **9 passed / 0 failed** on the pinned review commit `a60806071bdba964bb57bad7fd95591c9cac06c0`. It verified source IDs, ownership claims not assumed, explicit non-retrieval status, attribution, the new seven-movement teaching, edition uncertainty, and fictional acceptance cases.
- Actual-governance suite: **5 passed / 0 failed** on pinned review commit `cf97cf6648a3f21bec7b1acb13f517d9308e4a77`. It loaded actual repository admission and global retrieval-authority implementation (type-stripped to temporary ESM), then checked that (1) Perry commentary under the source tree remains excluded by the existing manifest; (2) a forged `safe_for_retrieval:true` frontmatter cannot override exclusion; (3) an admission rule without structured rights evidence is excluded; (4) fabricated rights and a false SHA-256 are excluded; (5) global Library authorization yields `AND FALSE` with no permissible source keys.
- Earlier mutant check on a disposable candidate manifest: changing `embedding_allowed` to `true` made the test fail for that exact reason.
- All test runs were on Kelly's authorized Mac Studio using downloaded source from exact pinned GitHub commits in disposable directories. The real production database, live member data, credentials, deployments, and actual model inference were not touched.

These checks substantiate **guard behavior in controlled fixtures**, not production status, empirical astrological validity, author licensing, MAIA response quality or permission to admit text.

## Important scholarly distinctions before approval

1. Perry's language of a life script includes teleology and qualified statements about fate. The original Soullab teaching **deliberately diverges** from those claims by preserving member-authored meaning. This must be explicit; do not imply Perry fully rejects fate.
2. Perry's references to Maslow, Jung, Deci, Piaget and others are intellectual analogies, not scientific validation of astrological diagnosis or developmental stage correlations.
3. The original Soullab teaching reframes Perry's concepts as **optional questions** for a conversation. It is not Perry's writing; the source-linked lineage must remain visible.
4. No chart is evidence for a psychiatric diagnosis, specific trauma history, recalled abuse, or future event. Present calculations separately from interpretation.
5. Book editions remain unverified. Do not assign chapter or page references based on the web catalog alone.

## What is not authorized by the current review stage

No Perry source book or essay text stored as RAG material. No `data/ain/source` admission changes. No changes to `data/ain/corpus-admission.json`, `lib/maia`, `lib/astrology`, models, prompt injection, database, protected branches or production. No declaration that the founder has ratified the teaching. No email sent.

## The next narrow founder decision

After reading `soullab-original-teaching-candidate.md`, the founder can explicitly decide whether to approve it **as editorial material for the next isolated MAIA integration test**, not as live teaching or original Perry intellectual property.

Suggested scope of a future approval:

> Approve an isolated, review-only integration test of the Soullab-authored, Perry-attributed commentary. Keep copyrighted Perry text excluded. Do not enable live retrieval, update protected canon, or deploy without separate approval.

If approved, the next developer act is **only** to propose an exact-source-hash-bound organizational authority record and per-file admission patch in a disposable checkout, test it with fictional conversation fixtures, and return the diff for founder decision. Provenance must distinguish editorial composition from original third-party claims. Actual release, copyright permissions and a further founder authority act are separate gates.

**Single accountable lane:** continue on the existing Perry review branch. Do not create a parallel knowledge programme.
