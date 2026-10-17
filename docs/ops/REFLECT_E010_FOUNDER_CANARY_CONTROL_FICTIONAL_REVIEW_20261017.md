# Reflect E010 — Founder-only canary control, fictional review candidate

**Disposition: LOCAL ONLY — NO PRODUCTION ACT.** This candidate was developed from the exact E010 merge source, but cannot edit production, invoke Docker or authenticate real members. This is source/test evidence, not an activated canary or authority to bypass a previously refused action.

## Source custody

- Frozen baseline: e010c0977320ea3cceb7424e84a5cf5c58770cc2.
- Isolated local branch: feature/reflect-e010-founder-canary-control-20261017.
- Local worktree: /Volumes/T7 Shield/ProjectCache/reflect-e010-founder-canary-control-20261017.
- New module: scripts/reflect_e010_canary_control.py.
- New tests: scripts/test_reflect_e010_canary_control.py.
- No changes to the original E010 worktree, GitHub, protected branch, production, real member information, server files or Docker.

The module is intentionally **fictional-backend-only**. It refuses any backend except an in-memory FictionalRuntime; its command line accepts only --fictional-self-test, with no live activation option.

## Fictional acceptance commands

Run from the isolated worktree on the Mac Studio:

    python3 -m py_compile scripts/reflect_e010_canary_control.py scripts/test_reflect_e010_canary_control.py
    python3 -m unittest discover -s scripts -p 'test_reflect_e010_canary_control.py' -q
    python3 scripts/reflect_e010_canary_control.py --fictional-self-test

The self-test explicitly reports PRODUCTION_ACTIONS=ZERO.

## Boundaries modeled

1. Private, server-verified, consenting founder identity witness: exact UUID format and SHA-256 comparison; 15-minute freshness; refusal for missing consent, altered ID, wildcard or wrong member. The fixture never uses an actual member ID.
2. Exact E010 source and immutable image, protected previous-reader image, prepared artifact, no pending migrations, 60 GiB available disk floor, healthy MAIA/API/PostgreSQL/summary, exactly 35 healthy running Studio containers, no builder/lock conflict. The 90 GiB advisory remains optional.
3. Refusal if either Reflect key already exists in original configuration or runtime. Fictional activation preserves all unrelated bytes and stores an owner-only simulated original-configuration backup.
4. The only allowed simulated changes: PRO_STUDIO_REFLECT_BETA_ENABLED=true and PRO_STUDIO_REFLECT_BETA_MEMBER_IDS equal to one privately verified fictional ID.
5. Simulated E010 reader-only recreation, explicitly no build, no pull, no dependencies. No other containers or unrelated runtime settings may change.
6. Reversible OFF: restore the original exact config and recreate only the reader again; prove both keys absent in runtime and preserve the E010/rollback custody.
7. Failed initial recreation triggers simulated restoration. If restoration fails, escalate as an incident; do not claim successful revocation. **Concurrent config drift is never automatically overwritten**—STOP and require reviewed incident action.
8. The reportable receipt carries only exact source/image, safe check counts and statuses, without account IDs, tokens or cookies.

## Critical gap before any production application

This is **NOT** a production-capable implementation. Independent review and a permitted operator integration must still provide:

- Private user-mediated live founder identity and consent attestation, without exposing credentials or member IDs in arguments, logs, GitHub, shell history or chat.
- Owner-only durable backup, checksum, permissions, symlink refusal, interrupted-write recovery and a reproducible OFF procedure.
- A governed exclusive release lock, exact frozen E010 compose, already-prepared image, NO-BUILD/NO-PULL/NO-DEPS recreation and post-recreate health plus disk checks.
- Real desktop and physical iPhone Safari admission, guest/other/revoked denial, no-store/SSR/RSC protections, existing MAIA link and safe revocation witness. No real MAIA provider turn is included.
- Hard STOP on unexpected source/config/runtime drift, insufficient disk, wrong account or failed recovery, preserving the old production image.
- Exact-source founder review of the new operator control and approval of a **permitted** live execution path. Do not interpret this fictional development approval as a merge, PR, source-deployment GO or permission to work around an execution safeguard.

## Deliberate exclusions

No production writes, no other member records, no model calls, no migrations, no billing or mail, no invitations, no Practitioner/Practice features, no source merge or push, no cache cleanup, no broad Docker prune. Reflect remains OFF on the live server until a separately verified production act succeeds.

**Next:** Review the local fictional control, then qualify the explicit production operator adapter. Do not turn this fiction-only program into an unreviewed production command.

## Local acceptance evidence — October 17, 2026

- Python syntax checks: PASS.
- Fictional positive and failure-injection cases: **36/36 PASS**.
- Fictional one-founder ON → OFF witness: PASS; original configuration restored.
- Backend boundary: Python standard library only; in-memory fictional backend; no production adapter, network, external process, Docker or real member calls.
- GitHub push, PR, merge, production flag change, restart and deployment: **NONE**.

## Local physical filesystem integration — October 17, 2026

- Additional isolated files: scripts/reflect_e010_disk_fixture.py and scripts/test_reflect_e010_disk_fixture.py.
- **57/57 total local tests PASS**: 36 original fictional policy/identity/rollback tests plus 21 disk-backed fixture tests.
- Actual local filesystem acceptance exercises permission-restricted original configuration backup, checksum comparison, same-directory atomic rename, fsync, a real nonblocking exclusive flock, and simulated E010 MAIA-reader-only recreation **without any Docker command**.
- Both sides of interrupted atomic rename are exercised: refusal before rename leaves original bytes intact; refusal after rename triggers observed-state recovery rather than believing the reported write status.
- Reject missing fixture marker, symlink, hardlinked config, owner/mode drift, stale or wrong fictional identity, changed image, competing file lock, changed config, tampered backup, and failed recovery. A noncooperating concurrent fixture writer causes HOLD rather than silent overwrite.
- Reversible ON -> OFF physically restores original bytes; fixture-only runtime flag disappearance and unchanged source/rollback status are asserted. All simulated accounts are fictional and no actual credentials or IDs are used.
- Execution guard: fixture root must be an owner-controlled 0700 *new* temporary directory named reflect-e010-fictional-* with a matching marker; no arbitrary production directory accepted. The fixture imports only Python standard-library modules and the fictional state-machine module. It contains **no SSH, Docker, HTTP, network, or external command execution**.
- Module default invocation continues to refuse production actions. An isolated Python test result is not a reviewed live release adapter and must not be used to circumvent the previous blocked production activation.

### Stop before live integration

A production-capable and independently reviewed operator adapter still requires durable crash/restart custody (private state and backup retrieval across processes), authentic consent/identity witness without credentials in chat, exact protected source/rollback verification, controlled reader recreation, cross-process concurrent-writer coordination, RSC/SSR/Safari acceptance and a real reversible OFF rehearsal. The current ActiveCanary token is in-memory only and **does not yet survive process restart**. Do not enable the member beta from this test module.

No source push, PR, merge, deployment or production change was authorized or performed by this test.

## Durable restart-custody extension — October 17, 2026

**Status:** LOCAL FICTIONAL ACCEPTANCE ONLY. This extension is not a production adapter, production change, or authorization to bypass the previously blocked activation.

### New and modified local files

- New scripts/reflect_e010_durable_fixture.py — persistent, versioned, owner-only fictional canary journal.
- New scripts/test_reflect_e010_durable_fixture.py — process-death and recovery acceptance.
- Updated scripts/reflect_e010_disk_fixture.py — persisted fictional reader environment, separately from the operator process's memory, with pre-write reader-state comparison and the existing 0700 marker-root restriction.
- Updated scripts/test_reflect_e010_disk_fixture.py — Python standard-library import allowlist extended for JSON.
- The existing frozen application/Reflect code and the original E010 source checkout are unchanged.

### Recovery semantics

A single fictional founder canary has one durable journal record and backup; it is written before any simulated access change. It records only source/image custody, exact file checksums, an account-ID fingerprint, the private backup token, and a monotonic phase: INTENT, ON_VERIFIED, OFF_INTENT, or OFF_VERIFIED. The full member ID does not appear in the journal, receipts, shell arguments or stdout. The separate persisted mock reader-state file and configuration file contain **fictional-only** values, are restricted to owner-only test storage and are not release evidence.

After an operator restart, the only supported continuation is recover_off(). It refuses a new or repeated activation. Recovery checks the original 0600 backup, journal integrity and schema, one-member fingerprint, frozen release and previous image, unrelated environment identity, available disk and healthy service/Studio invariants. It restores the exact original configuration and simulates an E010 reader-only NO-BUILD/NO-PULL/NO-DEPS recreation. OFF is recorded only after the observed reader flags have disappeared. A repeated recovery of already verified OFF is idempotent. The durable module also refuses ordinary command-line invocation (exit 2); it exposes no live-action entrypoint.

A corrupted, missing, foreign or permission-drifted journal/backup, unknown running member ID, uncoordinated config or runtime state change, image drift, or below-floor disk returns HOLD/INCIDENT. The state machine never silently overwrites unrelated changes and does not claim OFF while the fictional reader remains ON. Crucially, recovery under a below-60-GiB storage condition remains an explicit operator incident, not an implicit authorization to spend emergency reserves.

### Executed tests

- 87/87 local fictional tests PASS (57 prior + 30 durable/restart/negative checks).
- Actual separate Python interpreters were terminated with os._exit(77) at four activation and four OFF checkpoints; a fresh interpreter then reopened the fictional, access-restricted backup and journal and verified OFF. Nothing was connected to a network, Docker or any production host.
- Extra tests cover ordinary pre/post-rename errors, interrupted reader creation, failed recovery followed by fresh-process retry, unauthorized journal fields, backup tampering/loss, symlink and mode refusal, changed runtime state, persisted reader compare-and-swap, identity mismatch, and privacy-safe receipts.
- Python compilation and standard repository pre-commit governance must independently pass before local freeze (record their observed outcomes separately).

### Limitations that still prevent production admission

This mock journal's SHA-256 checksum detects accidental corruption but is **not an adversarial authenticated signature**. The private on-disk reader-state is an invented mock of a live Docker reader; tests do not prove actual container restart, edge caching, authenticated SSR/RSC refusal, real Safari desktop/iPhone, MAIA handoff or operational rollback timing. A production implementation needs reviewed privileged operator authority, protected persistent custody, crash-atomicity under its real storage model, secure cross-process identity attestation, no-secret logging, reader-only recreate with exact image and no build/pull, actual revocation witness, incident containment below disk floor, and independent approved execution routing.

No GitHub push, PR, merge, live feature change, production-host login, real member query, real credential, MAIA provider turn, deployment, container recreation or cleanup was performed by this extension. The one-founder Reflect beta remains OFF.

## Read-only production operator seam — October 17, 2026

**Local source only; NO ACTIVATE, NO DEPLOY:** New scripts/reflect_e010_readonly_operator.py and scripts/test_reflect_e010_readonly_operator.py provide the first real-target operator integration, restricted to collecting and validating read-only metadata. They do not contain a runtime-flag writer, backup writer, Docker recreate call, or real member-account/session lookup.

- One explicitly named Tailscale SSH target, with BatchMode=yes and StrictHostKeyChecking=yes; no credential or known-host bypass, and no default target.
- One fixed remote Python inspection payload, which reads Docker image identifiers and service health, root disk availability, existing deployment manifest, exact runtime/config *presence booleans* for Reflect settings, Studio count, release lock state and schema-migration **filename metadata only** in an explicit read-only SQL transaction.
- The returned receipt is a strict schema limited to nonsecret facts; neither member IDs nor private environment values, tokens or session cookies are returned. Errors are generic HOLD codes rather than exception dumps.
- Refuses any wrong source/release SHA/image/rollback tag/architecture; wrong production hostname or root filesystem; expired metadata (older than 2 minutes); disk below 60 GiB; pending migration; unhealthy/restarting service; Studio-count drift; active builder or deploy lock; Reflect flags already configured or an incomplete receipt.
- Default command without both --inspect-only and --target is a refusal, not an inspection or activation.
- Actual read-only operator invocation on the verified Mac Studio T7 against the known SSH host returned **PASS_READ_ONLY** twice. The final sample was 2026-10-17 15:25:22 UTC and reported: E010 source and Linux/amd64 image match, rollback image preserved, 35 Writer's Studio containers, zero pending migration files, Reflect flag and allowlist both absent, and 66,105,760 KiB ordinary root disk available (~63.04 GiB). No production write or member access occurred.
- Entire local canary/control suite now **122/122 PASS**, including 35 new operator read-only refusal and acceptance tests. Previous 87 fictional durable/physical tests retain their distinct meaning; passing read-only SSH inspection does NOT upgrade those tests to production activation evidence.

### Live activation still NOT supported

The new operator module has **no apply/enable/disable/reader recreation API**. An independently reviewed production-action adapter remains outstanding, including private live founder-session attestation, secret-safe durable backup, governed lock and exact configuration change, no-build E010 reader recreation, real Safari admission/outsider refusal and verified OFF. The prior execution safeguard that rejected direct activation is not bypassed by this work.

Do not run generic GitHub Deploy MAIA workflow or repurpose the read-only inspector as a configuration editor. No GitHub push/PR/merge, no Reflect activation and no production state mutation occurred here.
