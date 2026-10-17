# Glenn Perry × MAIA — Stage B isolated code integration witness

**Date:** 2026-10-17  
**User authorization:** “continue Approve Stage B isolated code integration.”  
**Repo:** `SoullabTech/Sovereign`  
**Review branch:** `research/glenn-perry-wisdom-candidate-20261017`  
**Last exact tested source commit:** `dfc78b6b041424cc8e1aa5f38fdc6d899f47cae0`  
**Standing:** **Stage B code-only integration and isolated acceptance PASS. NOT founder editorial ratification, corpus admission, Next.js app E2E, merge, release or production deployment.**

## The actual implementation

1. `lib/maia/knowledge/perrySourceLens.ts` — a new source-bound, per-turn optional symbolic-psychology lens. Its `APPROVED_PERRY_EDITORIAL_SOURCE` is **null**, with no environment override. The operational `MAIA_PERRY_SOURCE_LENS_ENABLED` flag defaults inactive and alone cannot authorize source use.
2. `app/api/sovereign/app/maia/list/route.ts` — minimal bridge at the **actual serving route**, rather than retired `/api/oracle/conversation` or dormant `/api/sovereign/app/maia`. Separately destructures `perrySourceLens` out of client `meta` (not allowed as client prompt material). Invokes the server gate after session identity and Sanctuary posture have been established, then appends only a successful, governed editorial block to the pre-existing knowledge addendum consumed by MAIA.
3. **No** changes to existing `knowledgeField.ts` (still 12 domains), existing app-room UI, membership schema, corpus-admission declaration, `governedKnowledgeRegistry`, canonical knowledge authority, training, embeddings, account records, model provider settings, or production.

## Three distinct approvals which cannot be collapsed

A Perry request is mere **intent**. The helper requires all of:
- exact per-turn source choice `glenn-perry-astropsychology`, valid verified member, and no Sanctuary posture or explicit same-turn refusal;
- operational flag on, **separately** founder-approved original Soullab editorial source registered at a frozen exact repo-relative path/hash;
- the existing corpus admission and global Library path+checksum authorization from the **actual** trusted repo implementation;
- source bytes matching the frozen SHA-256 with `status: stable` and `safe_for_retrieval: true`;
- a separate governed founder editorial-authorization record carrying `CORPUS USE AUTHORIZED — SOULLAB ORIGINAL PERRY-INFORMED COMMENTARY` plus the same source path and digest.

Absent any of these, the helper returns null. **The separate founder approval is currently absent, hence live output is always null.** It cannot be switched on by a client field or only a deploy-time flag.

### Explicit author differentiation

The fixed potential addendum credits a **Soullab editorial synthesis, inspired by Glenn Perry**, not a source copied from his books. It preserves the member's meaning, limits chart claims to properly computed data, prohibits psychiatric/trauma claims and fate certainty, and never copies the full source body into the prompt. None of Perry's book/essay text was downloaded into the staged runtime.

## Evidence: physical and HTTP fictional tests

At commit `dfc78b6b041424cc8e1aa5f38fdc6d899f47cae0`, a **single combined Node 22 test run in disposable directories on the authorized Mac Studio passed 49/49**:

| Group | Passing |
| --- | ---: |
| Original source/claim integrity and corpus review | 9 |
| Real corpus admission and global Library exclusions | 5 |
| Existing MAIA 12-domain knowledge-field isolated rehearsal | 12 |
| Real Perry helper with mocked proof, actual serving route static wiring and loopback HTTP requests | 13 |
| Physical fictional source files through actual corpus admission, real Library key generation, final lens guard | 10 |
| **Total** | **49** |

The tests included fictional session tokens and identity spoofing; guest refusal; explicit source opt-in and opt-out; Sanctuary denial; forged approval markers and wrong digests; source modification after cached admission; unsafe frontmatter; counterfeit third-party rights; and a chart with **unknown birth time** whose client-claimed Ascendant was deliberately not incorporated into prompt material.

The physical-positive test used only **a fabricated original Soullab testing paragraph and a fabricated authorisation record in a temporary directory**; it provides no real rights or release standing. Tests also verified the actual `APPROVED_PERRY_EDITORIAL_SOURCE` constant is null.

**Syntax verification:** TypeScript text stripping and `node --check` passed for both changed TS source files.

### What these tests do NOT prove

- **Not a full Next.js boot or real serving route HTTP test.** The loopback HTTP server is an isolated harness using the actual new helper and a simulated session verifier, **not** the full MAIA Next.js endpoint. The route was inspected for its exact location, calls, and data flow.
- Not a full TypeScript typecheck, Next production build, browser/WebKit test, or provider/model inference (the Mac Studio reference checkout did not have project `node_modules` installed).
- Not member-scoped chart access verification in the actual runtime. The active route currently derives `isSanctuary` from request metadata; a separately trustworthy Sanctuary posture must be established before enabling any new source-lens retrieval.
- Not demonstration that editorial text has undergone clinical/scholarly sign-off or that its author ownership and permissions are approved.
- Not licensing permission to store Perry's books or article bodies, embed them, fine-tune on them, or display long passages.

## Custody

The branch comparison to `clean-main-no-secrets` confirmed that every changed path is confined to:
- `app/api/sovereign/app/maia/list/route.ts`;
- `lib/maia/knowledge/perrySourceLens.ts`;
- `docs/wisdom/source-candidates/glenn-perry/**` (source manifests, notes, and isolated tests).

No protected/default branch, production DB, live member record, currently-running web app, deployment, feature flag configuration, or mail recipient was touched. The permission email draft remains unsent; Kelly will contact Perry personally.

## Next bounded gate

1. Kelly reviews and explicitly approves (or revises) `soullab-original-teaching-candidate.md` as editorial source material. This does not authorize ingesting the books.
2. Before any source admission or member-facing activation: verify trustworthy Sanctuary state, founder/organizational rights and exact content custody; prepare the separate approval record and source-admission patch without applying it, then review.
3. Run the **actual Next.js serving route** against fictional authenticated sessions and a disposable DB with model/provider calls mocked or disabled, plus negative permission tests.
4. Only after separate approvals and witnessed full route behavior can a release be considered. No rollout and no production source retrieval in Stage B.

**Current disposition: STAGE B ISOLATED CODE INTEGRATION COMPLETE; RELEASE GATE CLOSED.**
