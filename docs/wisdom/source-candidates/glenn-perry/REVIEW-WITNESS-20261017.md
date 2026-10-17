# Glenn Perry wisdom integration — isolated source candidate witness

**Date:** 2026-10-17  
**Status:** Curation and source-contract review complete; **not corpus-admitted, not deployed, and not licensed for copyrighted text ingestion.**  
**Repository:** `SoullabTech/Sovereign`  
**Review branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Verified source commit:** `87a6f1f68600e7260b273b67980fb68eff28213c`

## What was actually delivered

1. `README.md`: preliminary, attributed reading and curation boundaries.
2. `sources.json`: two Perry books, nine author-published essays, provenance, deny-by-default copyright/retrieval flags; edition conflicts explicitly open.
3. `editorial-reading-guide.md`: original, non-literal synthesis, grounded in publicly available author descriptions and essays; does **not** include book or essay body.
4. `acceptance-cases.json`: 16 **fictional** scenarios with expected boundaries, including diagnostic inference, protected member data, Sanctuary, consent, rights and astrology-as-fate.
5. `candidate.test.mjs`: a standalone offline source-candidate contract test (does not run MAIA).

**None** of these files is in `data/ain/source`, `/data/oracle-corpus`, runtime prompt injection, a model training dataset, a member-facing retrieval index, production storage, or a database. No application source, protected branch, admission declaration, production server, or member records were changed.

## Source verification

On 2026-10-17, both author book pages and all nine author essay URLs in `sources.json` were independently opened on `aaperry.com`. This verifies accessible source references, not the textual contents of either complete book. Catalog disagreements were identified and recorded:

- *An Introduction to AstroPsychology*: author's overview says 376 pp., individual 2012 product page says 386 pp. / ISBN 9780615616025.
- *Depth Analysis of the Natal Chart*: author's overview says 229 pp. 6×9, product detail says 229 pp. 8.5×11; a distinct 2021 424-page hardcover is also cataloged.

Never cite a specific page/chapter before verifying the copy/ISBN supplied by Kelly.

## Actual execution evidence

On the authorized Mac Studio, the five source-branch candidate files and unchanged `data/ain/corpus-admission.json` were fetched into a new, disposable `/tmp/perry-final-proof.*` directory from the **exact pinned commit** above. No local repository worktree was checked out or changed.

Command run:

```bash
node --test docs/wisdom/source-candidates/glenn-perry/candidate.test.mjs
```

Observed result (2026-10-17): **7 tests passed, 0 failed, exit 0**.

Previously, a deliberately mutated disposable copy of `sources.json` had `flags.embedding_allowed` changed to `true`; the guard returned the expected **FAILED** result: `embedding_allowed must fail closed`. No real source, permission or repository file was modified for that mutant.

The following were **not** tested: live MAIA route responses, model quality, production RAG, clinical safety with members, permission-holder licensing, authenticated retrieval, production deployment, or book-text ingestion.

The temporary test folders were configured to be removed on command exit; no member data or credentials were part of the tests.

## Gates still outstanding (strict)

1. Kelly to verify the two physical editions (title/copyright pages or ISBN plus tables of contents) so book-level attribution is accurate.
2. Founder scholarly review of conceptual synthesis; separately decide whether to adopt it as a Soullab teaching.
3. **Two independent permissions paths must not be conflated:** (A) Soullab's **own original commentary, bibliographic metadata and links** can be proposed for curated knowledge admission without reproducing Perry's copyrighted source text, subject to founder editorial sign-off and the project's normal source/rights classification. (B) **Perry's protected book/essay text, licensed excerpts or full-text embeddings** require a separately verified legal basis that actually covers the intended AI-assisted retrieval use. Ownership of paper copies is not itself permission for full-text RAG. A **licensing inquiry draft** exists in Gmail but was **not sent** during this work.
4. Both paths need their own corpus-authority evidence, metadata, member-facing constraints, and distinct founder admission authorization under the existing declaration. Never auto-admit material because it sits in a folder. A permissions approval for path B does not confer authority to override clinical/privacy restrictions.
5. After founder review, path A can proceed **independently** through the source-linked, original-curation admission gate and isolated MAIA response testing. Path B stays separately blocked until rights-holder authorization. Neither path is deployed or admitted by this branch.

## Interpretation discipline

Perry's symbolic model is valuable as one named interpretive perspective. It is **not** a validated way to infer a clinical diagnosis, a trauma history, actual natal placements, future events, or a member's own meaning. Astrological conclusions remain explicitly conditional, editable by the person, and subordinate to computed facts and lived experience.

**Next bounded actions:** obtain founder review/approval for path A (original attributed curation), verify owned book editions, and separately request a license for path B if desired. The copyrighted books themselves remain outside retrieval until a compatible license is proven.
