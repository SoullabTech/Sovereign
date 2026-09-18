# OPENCODE-NVIDIA-01 — Native Provider + Model Namespace Repair

**Date:** 2026-09-17
**Standing:** bounded implementation and synthetic live witness complete

## Scope

This lane repairs the JARVIS → OpenCode → NVIDIA Nemotron provider seam only.

Boundaries held:
- NVIDIA credential remains only in macOS Keychain under `ai.soullab.jarvis.nvidia-api-key`.
- JARVIS loads the credential ephemerally into `NVIDIA_API_KEY` for the provider process.
- No credential is stored in OpenCode auth state or committed configuration.
- No production read/write, deployment, member/client data, PHI, or repository evidence was sent to Nemotron.
- No merge or deployment is authorized by this record.

## Defect and repair

The NVIDIA upstream model ID is `nvidia/nemotron-3-ultra-550b-a55b`.

OpenCode prefixes that with its provider ID, so JARVIS must execute the model as:

`nvidia/nvidia/nemotron-3-ultra-550b-a55b`

The prior one-prefix OpenCode reference was therefore namespace-short and returned HTTP 404.

The project config now activates OpenCode's native NVIDIA provider with an empty `nvidia: {}` override. It does not duplicate NVIDIA's adapter, endpoint, model catalog, or credential seam.

## Credential and execution hardening

The Keychain fallback now uses the actual macOS account expression `${USER:-soullab}`; the prior carried-forward draft had escaped it and would have queried a literal account string.

Governed OpenCode execution now supplies `--title "$work_unit_id"`, preventing an additional provider inference solely to generate a session title.

## Evidence

Direct NVIDIA witness, run before this repair:
- endpoint authentication: HTTP 200
- model: `nvidia/nemotron-3-ultra-550b-a55b`
- exact response: `NEMOTRON_WITNESS_OK`

OpenCode synthetic no-files witness after this repair:
- native provider: `nvidia`
- upstream model: `nvidia/nemotron-3-ultra-550b-a55b`
- rendered OpenCode reference: `nvidia/nvidia/nemotron-3-ultra-550b-a55b`
- exit: 0
- exact response: `NEMOTRON_OPENCODE_WITNESS_OK`

The successful witness ran from an ephemeral non-project directory with all model tools denied. Earlier headless Remote Desktop launches stalled inside OpenCode initialization before any NVIDIA inference; they were terminated and did not widen evidence scope.

## Closure condition

This lane is qualified for repository integration when its exact-head local governance, Keychain, model-catalog, syntax, JSON, diff, and secret-scan gates pass. Merge and deployment remain separate acts.
