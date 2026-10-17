# Reflect E010 — production-action security review and final activation gate

**October 17, 2026 | Disposition: HOLD — review-only, no production-action adapter or activation.**

This packet reviews the LOCAL E010 one-founder canary control at commit `ca5b8eaa62ce16680bb25d9b7a9e7e0726b64487` and its subsequent exact-target hardening. It is **not an independent human security approval** and does not create an approved execution path. Previous user authorization allowed a bounded founder-only canary, but a separate automated production-action attempt was blocked by an execution safeguard. This review does **not** override that refusal.

## Release identity and existing evidence

- Frozen live E010 source: `e010c0977320ea3cceb7424e84a5cf5c58770cc2`.
- Prepared/running reader image at the last successful read-only inspection: `sha256:ed8272ad08d00aea1616907b0cdd38047e6e88439c32af4bbea481501603c30a`.
- Protected pre-E010 rollback image: `sha256:d6bc2e06c01534b5e7792feae3f6d38cedf59f68f34fa60a0d358f27eb574c48`.
- Read-only E010 preflight tested through the verified Tailscale SSH host. Subsequent static hardening binds that interface to **exactly one SSH identity and IP**, rather than a general tailnet address range.
- Reflect's frozen server route reads two independent configuration keys, requires a server-validated existing member session and **exact** one-member allowlist equality, then navigates to existing `/maia/encounter`. It provides no paid Reflect/Practice/client capability.
- 60 GiB is the numeric hard disk precondition; 90 GiB is an operational advisory, not a mandatory beta gate.

## Decisive open release risks — close before enabling any real account

| Gate | Current evidence / gap | Exact closure criterion |
| --- | --- | --- |
| 1. Permitted operator authority | No production **write** adapter exists. Earlier automation of the live flag edit was blocked. Read-only SSH evidence cannot authorize mutation. | Review and permit an explicit operator action through a trusted channel, without circumventing the block or repurposing a broader GitHub deployment workflow. |
| 2. Founder identity provenance | Fictional tests accept caller-provided identity/consent booleans. Prior live Safari proof was private and time-bound. | Re-attest the actual founder's own current signed-in session, verify exact member identity through a private user-mediated channel, preserve values only in protected process memory, and refuse another account or stale session. |
| 3. Authorized release lock | Fictional filesystem `flock` is not the production `.deploy.lock` mechanism. | Bind both config edit and reader recreation to the *same*, currently governed production lock; stop on any unrelated writer/runner. |
| 4. Protected config custody | Local 0600 backup, atomic rename and fsync passed. Fictional journal has plain SHA-256, not independently authenticated provenance. | Durable original-config backup, hash, owner and mode checks, independent custody/restore witness, no secret values in logs, plus verified recovery after forced process termination on the *approved* operator substrate. |
| 5. Exact one-member scope | Proposed keys are correctly modeled; no production change has been made. | Modify only `PRO_STUDIO_REFLECT_BETA_ENABLED=true` and `PRO_STUDIO_REFLECT_BETA_MEMBER_IDS=<privately reverified one member ID>`; reject any pre-existing keys, wildcard, extra member, unrelated environment change, or wrong running session. |
| 6. Bounded reader-only recreation | Fictional logic enforces no-build/no-pull/no-deps. Real Docker interaction has **not** been exercised. | Use reviewed frozen E010 compose source and existing local image, recreate only `maia-sovereign`; reprove image ID, configuration, healthy MAIA/API/PostgreSQL/summary, 35 Studio containers, root available and rollback custody. No model turn, migration or mail action. |
| 7. **Emergency revocation under low disk** | Current fictional OFF/recovery goes through `_preflight()` and REFUSES when available disk falls below 60 GiB. During a real incident, that can leave a previously enabled process ON. **Blocking design risk.** | Before activation, ratify and rehearse an independently permitted emergency-access-denial and restoration path that still works when root available is below 60 GiB, without uncontrolled cleanup, schema change, or unnecessary PostgreSQL/Studio impact. Specify who authorizes break-glass risk and how it fails closed; do NOT silently waive the floor. |
| 8. Browser/session protections | Earlier fictional WebKit HTTPS PASS and anonymous live 307->signin PASS. No real founder Reflect session has been admitted. | Real user-present desktop Safari and physical iPhone Safari evidence: invited founder only, anonymous and unauthorized denied, RSC/SSR protected content withheld with no-store, existing MAIA link, and no extra provider turn. |
| 9. Verified live OFF | Local disk-fixture and process-crash tests pass. No live disable/restart has occurred. | In the same bounded canary, remove the two settings under the approved lock, recreate only E010, verify authenticated former founder **can no longer reach protected Reflect**, guest still denied, config/runtime flags absent, and core services unaffected. A file edit alone is NOT revocation. |

**Stop priority:** Any incorrect account, unauthorized admission, unverified login/consent, unknown or drifted config, missing rollback custody, additional running/changed services, below-floor disk without the approved emergency rescue, invalid identity/session, browser content leak, failure to prove actual revocation, or loss of the operator release lock => HOLD / incident; never claim a pass or add members.

## Already verified offline

- The fictional policy control and physical temp-file integration passed 87 tests through the previous local checkpoint.
- The read-only production-inspection adapter passed 35 additional acceptance/refusal tests, including exact image, manifest, migration and environment **presence booleans**, not values.
- The new SSH-target hardening adds one refusal case for another tailnet address; all 123 offline checks currently PASS.
- The finite-state fictional recovery may **only restore OFF** after process restart; it cannot silently reactivate access.
- Passing synthetic conditions does not prove real Docker restart, Safari member admission, secured confidential member-identity transfer, nor approved break-glass operations.

## Minimum safe operator transaction — design only, NOT executable here

1. **Prepare:** user-present identity/consent check, protected source+image+baseline+rollback attestation, disk budget, zero pending migration metadata, healthy MAIA/Studio, no deploy lock holder, both Reflect settings absent, and no new releases in flight.
2. **Custody:** acquire the governed release lock; store an encrypted/owner-only verified original config backup and tamper-evident journal in approved private storage, without exposing contents.
3. **Single limited ON:** exact two settings only, atomic commit with compare-against-original, persist proof; no build/pull or access broadening.
4. **Reader recreation:** already-built E010 source/image through the approved immutable compose and **only** the MAIA reader; verify health, exact one-member allowlist count and outside-user denial without logging the ID.
5. **Human witness:** inspect desktop and physical iPhone Safari; no real MAIA provider turn without further consent; no unapproved observer/member requests.
6. **Single limited OFF:** execute and witness fully reversible configuration/running-reader access withdrawal (including the low-disk emergency mechanism above); capture redacted evidence. Keep the protected prior reader.
7. **Close:** no wider beta or mail/invitation change; retain private custody until the acceptance is certified.

## Explicit prohibited substitutions

Do not run the existing generic GitHub Deploy MAIA action, write a release issue comment expecting it to activate flags, patch the current process outside the governed lock, manually insert another user's ID, copy a real ID to chat/GitHub, restart PostgreSQL/Studio, rebuild E010, prune Docker, install OS updates, run a paid provider turn, perform a migration, or bypass an execution safeguard.

**Review conclusion:** the exact remaining objective is **one permitted, independently reviewed live production-action interface and tested emergency OFF contract**, not another fictional feature development cycle. The current adapter remains inspection-only and the real Reflect beta remains OFF.
