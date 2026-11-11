# Writer — second-reader notes on `0f726b4d` + Thursday preflight (2026-10-26)

**STATUS: working note. NOT Class A acceptance. NOT release authorization.**
Read-only. Source read from clone `/Volumes/Soullab Build/WRITER_GATE3_7FC8_NONPROD`
(commit `0f726b4dba42f9202773fe72eebe2c2254af8b62`, parent `9bb0ee60e9`, tree `00b86db9bb`,
88 paths, +1395/−470). Nothing was written to that clone. **No tests were run by this reader**;
every test total in the ChatGPT report is that lane's own claim.

## A. What was read (and what was not)

Read in full: `proxy.ts` Writer-admission block, `lib/writersStudio/admissionServer.ts`,
`planAccessServer.ts`, `restrictedCorridor.ts`, `lib/auth/sessionCredentialAuthority.ts`.
Skimmed by grep: the two ungated `ingest` / `local-review/import` routes.
**Not read:** the database-client sweep across ~70 other paths, the Free/Pro policy
(`planPolicy.ts`, `betaAccessServer.ts`), the tests, the provider seam files.

## B. Observations (questions for the owner, not verdicts)

1. **Corridor is an allowlist of manuscript actions — unlisted actions fail OPEN to the invitation grant.**
   `ADVANCED_MANUSCRIPT_ACTIONS` gates 15 actions. Routes under `/api/sovereign/manuscripts/[id]/`
   NOT in the set: `draft`, `draft/checkpoint`, `draft/revisions`, `candidates`, `collections`,
   `keeps`, `render`; and root `manuscripts` + `ingest`. They still need a session and Work
   ownership, but not the Writer invitation. `draft` + `draft/revisions` are the Save /
   version-history surface. **Question: is "excluded account can still save/read versions of its
   OWN Work via the shared Press route" intended?** The file header says shared Press operations
   are deliberately outside the classifier; if so, say it in the review packet. A deny-by-default
   classifier (gate everything under the prefix except an explicit shared list) would be the safer
   shape, because a future new action is invisible to the current one.
2. **`ingest` is ungated at the proxy.** The ChatGPT report says original-file ingestion is
   "separately held". The route has its own 401/403 logic, but I did not verify it checks Writer
   admission. Confirm the hold is enforced somewhere, not only described.
3. **`/api/writers-studio/local-review/*` is explicitly exempt.** The import route's header says it
   404s unless `WS_FOUNDER_LOCAL_REVIEW=1`. Acceptable only if that variable is provably absent
   from every deployed environment — add that to the preflight (section C).
4. **Session authority (`sessionCredentialAuthority.ts`) reads sound.** All presented credentials
   must be well-formed, current, unrevoked and map to one member; any invalid or conflicting one
   refuses the request; tokens are not logged. Minor: it runs one query per distinct token
   sequentially (max 3 transports, fine). DB errors propagate by design — confirm each caller maps
   that to 503/401 rather than falling through to "unauthenticated = allow".
5. **Admission failure mode is correct:** any thrown error → 503, never an optimistic grant.
6. **Placement:** the Writer block sits after the access-matrix section and before header
   forwarding. Early returns exist above it (rewrite at ~L324, JSON at ~L348, redirects ~L470–528);
   I did not trace whether any can bypass the Writer block for a Writer path. Trace before sign-off.
7. **Product wording:** `P4R1WriteEditController` retired-label text is reported fixed;
   confirm "Revise from this" has zero hits in active `app/` + `lib/` on this SHA.

## C. Thursday preflight (admitted-image cohort; sample/fictional Work only)

Do before any tester enters. A box is checked only with an observed value.

- [ ] **Served build identity.** `curl https://<beta-host>/api/health` → `version`; and
      `docker exec maia-sovereign printenv GIT_COMMIT` on the host serving the cohort.
      Must equal the admitted image's source (build `zf06WO-Ct_cuNW6Oj_g0o`), or another
      explicitly admitted exact image. Do not infer from "a build exists".
- [ ] **`0f726b4d`/`7fc8` NOT served.** Confirm the cohort URL is not the unaccepted provider path.
- [ ] **`WS_FOUNDER_LOCAL_REVIEW` absent** in the serving container env.
- [ ] **`DATABASE_URL` explicit** in the serving env (if the served image predates fail-closed,
      note which behaviour it has).
- [ ] **Roster:** each invited account is on the private beta roster; list excluded accounts;
      excluded account gets 403 on a Writer page + a Writer API.
- [ ] **Sample Work present**; no tester can reach another tester's Work (two-account refusal).
- [ ] **Rollback path:** previous tag `maia-sovereign:previous` exists and is the admitted image.
- [ ] **No real manuscript** through any provider path; provider calls disabled or fictional-only.
- [ ] **Stop conditions agreed:** leakage of another account's data, a button that implies a
      capability that is not live, any provider error text containing manuscript content.
- [ ] **Andrea's packet** (`WRITER_THURSDAY_BETA_ANDREA_REVIEW_20261029`, manifest sha256
      `450ce6df…b5cc`) is the runbook; this list only adds the build-identity and env checks.

## D. Still gated (unchanged by anything here)
Class A on the two provider-seam files · provider/consent authorization · fictional provider
encounter · vault/recovery (#1793) · frozen signed image · founder exact-image decision.
