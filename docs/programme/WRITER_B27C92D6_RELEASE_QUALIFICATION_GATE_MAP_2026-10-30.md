# Writer release qualification — gate map for candidate `b27c92d6`

**Date:** 2026-10-30 · **Status:** local working record. Not posted to GitHub, not admitted to #1938.
**Lane:** Writer release qualification under #1938 (release ledger), #1800 (owner), #1982 (portfolio index).
**Candidate:** `b27c92d6936232a7e0c36bea48ce2bdf1ae7435a` (tree `ab47622b`). The tip of `origin/fix/writer-gate3-provider-accountability-7f6-20261026-r1`, checked by `git fetch` on 2026-10-30.
**Release state:** **HOLD**.
**This session:** read-only. No build, migration, deployment, push, post or production read. Production facts below are from the dated ledger entries cited, not from new observation.

## Sources restored

- #1938 newest entry `6525455338`: the candidate moved to `b27c92d6`.
- #1800 `6525442571`: founder accepted `b27c92d6` and admitted witness `d14d0c8d`.
- #1800 `6525507931`: branch fast-forwarded on GitHub. Not merged and not deployed.
- #1800 `6524146048`: owner handback and the full list of open decisions.
- #1938 `6504447818`: the 29 Oct production preflight (identity, schema, role, migrations).
- #1938 `6450075497` / `6452573937`: production and NAS custody **RED**.
- #1938 `6443074178`: founder chose an internal security review path. External review was declined and no certification is claimed.
- #1938 `6449390418`: Gate 2 fictional joined recovery **PASS**.
- #1982: portfolio index only. It confers no authority.

## Ranked gate map

Gates are ranked by critical path: what invalidates or blocks the most downstream work comes first.

| # | Gate | Evidence that exists | What is missing | Owner act needed |
|---|---|---|---|---|
| **0** | **Release basis: reconcile with canonical** (new finding, a precondition of gates 3 and 4) | Candidate passes Writer 56/56 and Session Room 8/8 on itself. | The candidate's merge-base with canonical is `c9e4f7f7` (2 Oct). The candidate is **51 commits ahead and 197 behind** `clean-main-no-secrets` `048ffd7d`. 244 files changed on the canonical side and **47 overlap** the candidate's changes, including `app/writers-studio/**` (for example PR #1501, "restore full workspace"). Canonical has a migration the candidate lacks: `20261002000002_writer_studio_chapter_overview_lens.sql`. The separate Home/F6 branch is not included either. An image built from `b27c92d6` would ship without canonical Writer work, and every migration, image or rollback witness taken on `b27c92d6` would be void once the SHA changes. | **Founder ruling (one question):** which line is the release basis? Recommended: merge the canonical tip into the candidate through Writer custody. Then rerun the 56-step journey and the closed-browser witness on the resulting single SHA, and name that SHA as the release candidate. |
| **1** | **Production-shaped recovery and deletion safety** (Gate 2, **CRITICAL / RED**) | Fictional PG16 + vault joined recovery PASS: old-generation refusal, no resurrection, ciphertext-first landing (`6449390418`). Read-only production and NAS metadata inventory (`6450075497`, `6452573937`, `6504447818`). | Production holds 13 plaintext-capable originals and 0 encrypted. Two orphan plaintext DOCX files. Plaintext Source text sits in the database and in **unencrypted** `.sql.gz` backups. The app role is `SUPERUSER` + `BYPASSRLS`, with RLS off on Writer tables. Signed R20 ledger and high-water authority is **NOT VERIFIED**. DSM ACL, snapshot, immutability, replication and offsite evidence is **UNKNOWN**. No production-shaped restore and deletion-negative witness exists. Permanent erasure is **not certified**. | Founder authorizes the next named act on #1793: an authenticated **read-only DSM-native audit**. Then a non-executing remediation design. Then separate founder decisions for each operational change (backup encryption, role and RLS, plaintext retirement). |
| **2** | **Class A / R20 convergence** (Gate 1) | Internal security review of the Writer boundary on `5a7f`: 14/14 suites, Semgrep 0, Trivy 0. Founder adopted the internal path and certification is not claimed. R20 H2R2 in-house review and the H2R3 design ruling exist as **local, unadmitted** records (`docs/programme/R20-H2R2-*`, `R20-H2R3_*`). | The internal pass was on `5a7f`, not `b27c92d6`, and it covers only the exact Writer boundary. Class A items #1915, #1914, #1919, #1819, #1917 and #1928 are not reconciled for this candidate. R20 finding **H2R2-M1** is open: the TPM counter binds a number, not an event. H2R3 is design only, and the earlier logical rollback witnesses showed nonce replay and resurrection. The OTP anti-abuse policy (per-email limit and shared-IP ceiling) is undecided. | A founder ruling on the R20 chain design (H2R3 result). A disposition on each Class A issue against the final release SHA. An independent read by the review-only ChatGPT lane, if the founder wants it. An explicit OTP policy decision. |
| **3** | **Migration and rollback compatibility** | Exact pending set from 29 Oct. Static review found that migration 4 changes consent-row semantics. | **Six** candidate migrations are not in production as of 29 Oct: `20261025000001` r20 erasure, `20261026000001` encrypted landing, `20261027000001` legacy retirement, `20261027000002` consent ledger, `20261028000001` auth return, and `20261029000001` encounter room stop (added after the preflight). Add the canonical `20261002000002` once gate 0 is settled. Still owed: an old-reader / every-prefix compatibility witness on a disposable shadow. The migration runner can print a failure on advisory-lock refusal but exit 0 (handback §7). The installed `deploy-production.sh` (`b4bd114c`) differs from the candidate's (`1afdb2e2`). Production runs an **uncommitted** image (`UNCOMMITTED_SRC_SHA256_c6ff0f3d…`, lane `writer-ingest-r3`), so the rollback target has no source identity. `:previous` compatibility was not checked. | A founder act authorizing a disposable-shadow migration and rollback rehearsal on the final SHA. A ruling on the runner exit-code defect: repair it first, or accept it with a wrapper check. |
| **4** | **One exact signed release image** | Immutable-SHA build path exists (`docs/ops/IMMUTABLE_SHA_DEPLOY.md`). Local fictional builds `2yoL_Ar4…` and `wlvVjyQ0…` exist; these are **qualification builds, not release images**. | No signing mechanism or signer-key authority is evidenced. `maia-api` builds with lockfile-less `npm install`, so it is unpinned and not reproducible. Base images use floating tags (`caddy:2-alpine`, `node:22-alpine`, `node:22-bookworm-slim`). No image scan of the exact image. Two #1800 records still disagree on the R11C build ID and receipt hashes (`6504447818` §discrepancy); this needs reconciling or explicit retirement. | Founder names a signer and key authority. Founder authorizes one build slot for the final SHA, from an isolated snapshot, with digest pinning and a Trivy scan of the resulting image. |
| **5** | **External-domain canary and participant admission** (Gates 3–5) | Fictional 2-writer journey, including cross-writer read denial. Closed-door Session Room witness. | Four onboarding observation holds: Alice and Bob × FAQ and completion response bodies. A server-side grant / Pro boundary tested in the compiled backend (Gate 4). An observable production and an acknowledged content-free alert. A privacy and retention notice. Two verified writers on soullab.life first; their identity is not proven by name or email, and the roster stays out of git and issues. Session Room positive admission, media and MAIA/provider stay held. Physical Safari and mobile is a separate gate. | Founder approves each participant individually, scopes the grants, and accepts or rejects a desktop-first limitation. |
| **6** | **Founder exact-image GO** | None. | Everything above, bound to one image digest. | A separate founder act naming the digest. It may not be inferred from any green result above. |

## Dependabot triage: 866 open alerts

GitHub showed 866 open alerts when queried today; the brief said 869. Every alert is npm. The default branch is `clean-main-no-secrets`.

| Manifest | Alerts | Present in default branch / candidate? | Ships in the candidate runtime? |
|---|---|---|---|
| `apps/web/**` (pnpm, package-lock, package.json) | 410 | **No / No** | No. The manifests are gone, so these alerts are stale. |
| `app/api/backend/**` | 180 | **No / No** | No (stale). |
| `app/video-server/package-lock.json` | 14 | Yes / Yes | No. Not in `docker-compose.production.yml`. |
| Root `package-lock.json` / `package.json` | 262 | Yes / Yes | The `maia` image and all its workers build from this lockfile. |

**The 41 critical:** 28 are on manifests that no longer exist. The 13 root criticals were checked against the candidate's own lockfile:

- **11 are already resolved.** The lockfile carries patched versions: next 16.4.3, which is past the `<16.3.3` range; tar 7.5.22; proxy-addr 2.0.8; basic-ftp 5.3.1; @capacitor/ios 8.5.2. next-auth and maplibre-gl are absent. The alerts remain open and were last updated 2026-09-13, so the dependency graph does not appear to be refreshing. The cause is UNKNOWN.
- **2 match only a dev dependency:** handlebars 4.7.9. It is not in the standalone runtime.

**Root high, medium and low:** one high (braces 3.0.3) and one medium (sprintf-js 1.0.3) match runtime packages in the lockfile. Both advisories are **withdrawn**. Everything else is resolved or dev-only.

**Conclusion:** no open, non-withdrawn Dependabot alert matches a runtime dependency of the candidate's `maia` image. That is a lockfile claim, not an image claim.

**What Dependabot cannot see:** `maia-api` (no lockfile; resolved when built), container base images, and the zod 3.25.76 HIGH from `npm audit` (`6443074178`; the Writer boundary imports zod 0 times). These belong in the gate-4 scan of the exact image.

Dismissing or refreshing the stale alerts would be a GitHub mutation. It needs owner approval and is not part of this record.

## Recommended next act

**Founder ruling on gate 0: the release basis.** Recommended answer: reconcile `b27c92d6` with the canonical tip under Writer custody, then rerun the 56-step journey and the Session Room witness on the result, and name that SHA as the only release candidate.

Gates 3 and 4 are defined against an exact SHA. Running them on `b27c92d6` now would produce evidence that dies at reconciliation.

Gate 1's read-only DSM audit does not depend on the SHA. The founder can authorize it in parallel; it is the longest pole.

## Addendum — founder ruling on gate 0, and the dry-run merge it led to (2026-10-30)

**Ruling (founder, in session):** "Reconcile with canonical." State: `AUTHORIZED` as the release-basis direction. It is ⛔ not a custody grant to write the Writer worktree, and ⛔ not push, merge to canonical, build or deploy.

**Dry run (read-only):** `b27c92d6` merged with `048ffd7d` in a disposable worktree outside custody. The merge was aborted and the worktree removed afterwards. Custody worktree untouched, still at `b27c92d6`.

- **20 files conflict, 76 hunks.** The heaviest are in the live Writer surface: `ListenPilot.tsx` 23, `P4R1ProducePanel.tsx` 15, `monoCaptureRoute.ts` 7, `P4R1WriteEditController.tsx` 5. Also `full-redesign/Shell.tsx`, `editorialCollaboration.ts`, `authBoundaryMiddleware.test.ts`, and the manuscript render route. Migrations do not conflict.
- **What reconciling brings in.** The canonical side adds 197 commits that have never been through the Writer acceptance journey, Class A review or the closed-browser witness. By commit scope: ios-p0 48 · writers-studio 31 · ops 12 · astrology 12 · listen 7 · constellation 7 · publish 3. That includes a **live author-voice / mono microphone recording path** (Listen) and **KDP/Publish preparation**. Neither is behind a found feature flag.
- **Consequence.** The reconciled SHA needs a scope decision on these imports before gate 3 can be checked. The 56-step journey covers none of them, and a microphone capture path is the kind of surface the Class A and consent gates exist for.

**Scope ruling (founder, in session, 2026-10-30):** "Include and test all." State: `AUTHORIZED`. The reconciled candidate carries every canonical feature, including Listen microphone recording and Publish/KDP, and **all of them come into the qualification scope**. That means the journey, Class A and consent review, and the closed-browser witness are extended to cover them. ⛔ Including a feature does not qualify it. It is a release blocker until it is tested.

**Owed before the reconciliation commit (scope question now settled):** the founder's scope ruling on the canonical-only features. Then the conflict resolution is prepared as a review packet (exact tree, per-file resolution notes, focused tests) and admitted through the existing Writer custody process. Then the journey and witness are rerun on the result.

**Reconciliation packet prepared (2026-10-30):** `~/JARVIS-handoffs/WRITERS-STUDIO-OWNER-20261021/RECON_B27C92D6_048FFD7D_20261030/` (`SHA256SUMS.txt` sha256 `edd86f97…`).

- Resolved tree **`cf240ae1`**. It is staged, uncommitted, in the disposable worktree `~/.review-worktrees/writer-recon-b27c-048f-20261030`. The custody worktree is untouched and clean at `b27c92d6`.
- Writer jest suites: 2517/2519 pass. Both failures already fail on one of the parents.
- Typecheck: equal to the `b27c92d6` baseline.
- **D1 ruled (founder: "whatever is best"): the constellation referral is held out of Writer's MAIA Ask prompt.** The pin passes. The resolved tree is now **`aa909da4`**, which supersedes `cf240ae1`.
- Open decisions, detailed in the packet: D2 the requested-proposal directive (candidate law kept); D3 the `overview` lens; D4 migrations; D5 extended qualification scope; D6 the legacy `?publish=1` route.

## Not done / not authorized

- No production read or mutation.
- No build, migration, image, signing, deploy, push, merge, GitHub post or alert dismissal.
- Production facts are as of 27–29 Oct and must be re-observed before any act that relies on them.
