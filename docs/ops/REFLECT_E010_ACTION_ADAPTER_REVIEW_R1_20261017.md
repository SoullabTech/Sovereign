# Reflect E010 — Production-action adapter R1, security-review candidate

**Status:** Source-ready for review, **no executable production adapter**. This is a restricted, local, non-operational action contract. **Do not run or deploy to activate Reflect.**

**Decision scope:** The founder's "continue" following the request to develop and review the production-action adapter is treated solely as permission for **local development and review**, not release execution. The prior tool safeguard that blocked activation remains controlling. No alternate route or manual copy-paste workaround is authorized.

## Grounded immutable release contract

The frozen Reflect E010 application source is `e010c0977320ea3cceb7424e84a5cf5c58770cc2`. The current E010 Linux/amd64 reader image is `sha256:ed8272ad08d00aea1616907b0cdd38047e6e88439c32af4bbea481501603c30a`; the prior reader image `sha256:d6bc2e06c01534b5e7792feae3f6d38cedf59f68f34a60a0d358f27eb574c48` must remain recoverable. Production deploy coordination uses the existing governed nonblocking flock on `.deploy.lock` from `scripts/deploy-lock.sh`; DO NOT delete/recreate that file to evade an existing owner. Existing `scripts/pre-deploy-gate.sh cutover-maia` is a **release** command, not a safe canary-settings toggle; it must not be used to bypass a blocked feature activation.

The frozen route `app/pro-studio/reflect/page.tsx` checks an authenticated server-side session and both `PRO_STUDIO_REFLECT_BETA_ENABLED` and `PRO_STUDIO_REFLECT_BETA_MEMBER_IDS` through `lib/proStudio/reflectBetaAccess.ts`. **That underlying helper permits comma-separated ID lists.** It does NOT by itself enforce the approved *one-person canary* cardinality. The future production-action adapter must require exactly ONE privately validated canonical UUID, no duplicate, comma, wildcard, extra member, stale session or unverified consent. It must not mistake this beta invitation for paid/practitioner/client capabilities. Its only manuscript/inference effect is none; Reflect links to existing `/maia/encounter`.

## Reviewed source artifacts

- `scripts/reflect_e010_production_action_review.py` — immutable, exact-source plans for ONE_FOUNDER_ON, NORMAL_OFF and EMERGENCY_QUARANTINE. Only the two Reflect keys and the single existing `maia-sovereign` reader are in normal activation/revocation scope; source/image/rollback/disk-floor/lock and no-build/no-pull/no-dependency guarantees cannot be edited without a test refusal. A future operator would privately obtain and prove the founder's current authenticated member UUID; **the plan does not carry an ID**.
- `scripts/test_reflect_e010_production_action_review.py` — refuses altered images/step order/cardinality/extra environment keys/other containers/broadened source control; tests emergency proof and private exact-one-ID matching with fictional IDs.
- **Critical restriction:** the module cannot execute anything; `execute()` always raises `NO_PERMITTED_PRODUCTION_EXECUTION_BACKEND`, and directly invoking it returns exit 2. There is no SSH, Docker, HTTP or filesystem write import and no remote target. The existing, separate `scripts/reflect_e010_readonly_operator.py` remains an authenticated-host *read-only inspection tool*, not a mutation runner.
- All work remains within isolated local branch `feature/reflect-e010-founder-canary-control-20261017` on the Mac Studio T7. Nothing is pushed, merged or deployed by this candidate.

## Future operator integration — exact authority contract, NOT instructions to execute

The later, separately reviewed and permitted privileged operator must satisfy **all** of these operations before any ON:

1. **Private founder authority:** user-present, session-backed, exact account validation and consent; no client-supplied identity assertion can authorize a production grant. No member IDs/cookies/passwords/API keys in process arguments, logs, GitHub, or chat. Consent remains specific to the restricted founder E010 arrival.
2. **Existing release custody:** repeat exact E010 source, prepared image, prior rollback, immutable registry tags, zero pending migrations, healthy API/PostgreSQL/summary, 35 healthy Studio containers, no competing release lock/build, and available root disk at or above **60 GiB** (90 GiB advisory only).
3. **Emergency capability ready BEFORE ON:** independently reviewed and genuinely permitted emergency denial plan, tested without needing a successful MAIA reader recreation or relying solely on the normal above-floor deployment gate. No floor exception may be self-authorized.
4. **One transaction:** under the existing governed production lock, preserve an access-restricted, tamper-evident original `.env.production` and a durable recovery journal; compare exact file and runtime state before writing. Change ONLY `PRO_STUDIO_REFLECT_BETA_ENABLED=true` and a single `PRO_STUDIO_REFLECT_BETA_MEMBER_IDS`. Use no-build/no-pull/no-deps and recreate **only** the E010 MAIA reader through independently approved operator infrastructure.
5. **One-account acceptance:** verify runtime and configuration keys, exact reader image, zero unexpected service changes, signed-in founder success and other signed-in/anonymous denial on desktop and physical iPhone Safari. Validate no-store and SSR/RSC/prefetch behavior. No paid provider turn, client data, billing, schema migration, mail or other account inclusion.
6. **Normal OFF:** restore original exact config under the same lock, recreate only the existing E010 reader, and prove both keys absent from config and running reader plus authenticated former-founder denial. Editing the config without restarting the reader is NOT access withdrawal.
7. **Containment under low disk:** if production falls below 60 GiB after ON, ordinary reader recreate is held. The future *separately authorized* incident protocol must deny Reflect access **first** using a proven independent ingress control, verify the entire denial matrix, and mark state `ACCESS_QUARANTINED_NOT_OFF`. It must then obtain approved safe capacity/reader restoration and prove actual config+runtime OFF. Never claim `OFF_VERIFIED` from ingress blocking alone; never make an arbitrary disk exception, prune resources or restart other services to conceal the risk.
8. **Post-action:** observe production under the existing 30-minute cutover observation standard, retain exact rollback custody under the existing release contract, preserve redacted evidence and stop immediately for unauthorized access, leaked content or failed revocation.

## Emergency denial matrix (non-executable contract)

The emergency service must independently demonstrate 403/404 or equivalent content-denial without private content for **all** front doors: canonical and alias hosts; `/pro-studio/reflect` and slash/nested/query variants; GET, HEAD, POST and unexpected methods; Next.js RSC/Flight requests with `?_rsc` and router/prefetch headers; bypassing redirects; direct-origin and stale CDN/browser caches; browser back navigation and previously issued authenticated sessions. The disabled state must persist even if the MAIA reader remains ON or cannot restart. Because the live Caddy source contains existing edge route handling, a candidate may eventually use a separately approved edge quarantine, but the exact Caddy matcher, restart/reload effects, routing precedence and all denial paths are **UNPROVEN** and cannot be treated as certified.

A transparent member-facing `403` may be preferable to false success or a broken browser, but content denial—not status code alone—is the acceptance measure. Quarantine is a temporary containment, not true flag-off.

## Security gaps / assigned reviewer decisions

| Gate | Required evidence | Current status |
| --- | --- | --- |
| Authentic private member provenance | Fresh server-validated founder session, independently obtained without disclosure | Prior private proof is not a current live invocation |
| Operator privilege path | Independent review of a *permitted*, narrowly scoped production mutation driver | Not implemented; prior automated attempt blocked |
| Durable custody | Authenticated (not checksum-only) recovery journal, protected secret handling, proven process restart | Local fictional test only |
| Emergency ingress OFF | Source-qualified edge matcher, cache and RSC denial matrix, low-disk incident/recovery ratification | Requirement defined, not implemented or proven |
| Reader-only production recreate | Frozen compose, existing image, zero builds/pulls/other restarts | Fictional tests; no actual activation |
| Safari and former-founder access withdrawal | Real authenticated founder and unauthorized denial on desktop and physical iPhone | Pending ON + verified OFF |

**Acceptance evidence:** Local suite currently totals **140/140 PASS** (previous 123 + 17 new review-only action-policy checks). This is not 140 real production executions. The last separate live production read-only preflight, earlier in the day, passed with approximately 63 GiB available and both Reflect flags absent; it is not proof of current operating health.

## Release disposition

- **GO:** local non-executable action-interface review, security review and independent operator design; can collect metadata and write review comments.
- **HOLD:** production writes, flag ON/OFF, Caddy reload, Docker reader recreation, real-account activation, GitHub source push/PR/merge and beta expansion. No direct or indirect workaround for the previously blocked execution attempt.
- **Exit criterion:** independently reviewed *permitted* action mechanism, pre-ratified low-disk emergency denial, protected member provenance and durable config custody, and successful live founder-only ON→OFF witness.

**Source-authority conclusion:** We have a release contract and tests, not a production action. The next move must be independent privileged operator qualification rather than repeating speculative fictional activation tests.
