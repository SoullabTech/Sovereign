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
