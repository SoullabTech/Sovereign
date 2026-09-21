# OPENCODE-NVIDIA-01 — Native Provider + Model Namespace Repair

**Date:** 2026-09-18
**Canonical base:** `ee7999c244a981ab2305dec6f4f2fd86bad1f9c9`
**Standing:** reconciled implementation qualified locally; merge and deployment remain separate acts.

## Scope

This lane repairs only the JARVIS → OpenCode → NVIDIA Nemotron seam.

Boundaries held:
- NVIDIA Build credential remains in macOS Keychain service `ai.soullab.jarvis.nvidia-api-key`.
- Provider spend and external-network authority are proven before Keychain is read.
- The credential is injected only into the governed OpenCode child process.
- No NVIDIA credential is stored in `opencode.json` or OpenCode auth state by this lane.
- No production read/write, deployment, member/client data, PHI, or repository evidence was sent during reconciliation.
- No merge or deployment is authorized by this record.

## Repair

NVIDIA's upstream model id is:

`nvidia/nemotron-3-ultra-550b-a55b`

OpenCode prefixes that upstream id with its provider id. The governed execution reference is therefore:

`nvidia/nvidia/nemotron-3-ultra-550b-a55b`

The provider registry preserves the upstream id before stripping any optional OpenCode provider prefix, so both the upstream id and complete OpenCode ref normalize safely.

The project config now activates OpenCode's native NVIDIA provider with an empty `nvidia: {}` override. It no longer shadows OpenCode's native endpoint, adapter, catalog, or credential handling.

The canonical two-phase authority flow is preserved:
1. authorize Work Unit network/spend authority;
2. only then read the NVIDIA credential from environment or Keychain;
3. inject that credential only into the OpenCode worker child;
4. clear the local credential value before post-worker verification.

Governed OpenCode calls also receive `--title "$work_unit_id"`, preventing an extra model inference solely to generate a session title.

## Evidence

Existing live provider witness from the bounded implementation lane:
- direct NVIDIA endpoint authentication: HTTP 200
- direct model: `nvidia/nemotron-3-ultra-550b-a55b`
- direct response: `NEMOTRON_WITNESS_OK`
- OpenCode native NVIDIA response: `NEMOTRON_OPENCODE_WITNESS_OK`

Current exact-base reconciliation proof:
- provider governance: **55 passed / 0 failed**
- denied NVIDIA spend does not read Keychain: PASS
- authorized NVIDIA Keychain hydration: PASS
- Keychain secret absent from OpenCode args and result contract: PASS
- post-worker verification cannot see `NVIDIA_API_KEY`: PASS
- exact model provenance `nvidia/nvidia/nemotron-3-ultra-550b-a55b`: PASS
- native OpenCode NVIDIA catalog contains exact model: PASS
- actual NVIDIA Keychain service present: PASS
- JSON parse and `git diff --check`: PASS

The earlier live witness is retained as provider evidence; reconciliation itself made no additional metered NVIDIA call.
