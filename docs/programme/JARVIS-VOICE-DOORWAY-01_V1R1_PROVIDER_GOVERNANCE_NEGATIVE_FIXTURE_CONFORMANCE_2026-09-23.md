# JARVIS-VOICE-DOORWAY-01 — V1R1 · Provider-Governance Negative-Fixture Conformance

**Programme:** `JARVIS-VOICE-DOORWAY-01`
**Act:** `V1R1 — PROVIDER-GOVERNANCE NEGATIVE-FIXTURE CONFORMANCE ONLY`
**Exact predecessor:** `0f3a951fa9ce504fc4cff27814f9d5747b657bb0`
**Current canonical at execution:** `a7b7825ec3e58904856280a5b10d8f48bbe6bf8c`
**Evidence disposition:** BOUNDED TEST-FIXTURE REPAIR · V1 LAW UNCHANGED · NO RUNTIME OR PROVIDER-POLICY CHANGE · V2 CLOSED.

## Defect

The V-F2 law requires the JARVIS doorway to own one fixed loopback STT endpoint and refuse a caller-supplied endpoint.

Its negative fixture used the literal `https://api.openai.com/v1/audio/transcriptions` only as an obviously forbidden alternate endpoint. That made the provider-governance scanner correctly classify the newly introduced test file as a new OpenAI surface, blocking canonical admission of the reconciled Founder Workspace lineage.

The literal was not required by V-F2. The proposition is **non-local override must fail**, not **OpenAI specifically must fail**.

## Repair

Exactly one fixture value changed in `tests/constitutional/voice-doorway/matrix.mjs`:

`https://api.openai.com/v1/audio/transcriptions`
→ `https://example.invalid/nonlocal-stt`

No contract clause, defeat candidate, runtime source, STT constant, TTS constant, provider assignment, allowlist, or provider policy changed.

The runtime law remains:

`STT_ENDPOINT = http://127.0.0.1:8080/inference`

and caller-supplied endpoint authority remains absent.

## Witness

- `matrix:voice-doorway`: **PASS · LETHAL + DISCRIMINATING**;
- `DC-V2` still dies specifically on `V-F2`;
- provider governance: **PASS · no new OpenAI surface**;
- migration debt remains the pre-existing allowlisted population; no allowlist entry was added.

Old fixture blob: `c9a3f9fc5685f88af3e5eb66fd213b55e5d2534c`.
Repaired fixture blob: `a1dea342056f560244f535ba9a76e28b15800d83`.

## Scope held

No Voice runtime implementation. No microphone/STT/TTS activation. No Desktop mutation. No V2. No provider-policy edit. No migration-debt expansion. Production untouched.
