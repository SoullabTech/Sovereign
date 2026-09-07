# Resend Credential Rotation — Runbook

Follows MAIL-03 closure. **Separate act, separate witness, separate blast
radius.** No code change, no Postal work, no dependency work, no MAIL-04.

## Why this is still required after MAIL-03

MAIL-03 closed an endpoint. Rotation addresses a **different possible cause**: a
leaked credential — a CI log, an image layer, a copy somewhere. Closing the
endpoint does nothing about a key that is already out.

Causation for the 2026-08 overage was never established, so "the relay is
closed" licenses no inference about whether the key is clean. Two possible
causes, two independent remedies; neither substitutes for the other.

## What the witness proves, and what it cannot

```
1. the OLD key is dead
2. production still sends
3. (1) AND (2) ⟹ production holds a different, working credential
```

**Fact 3 is an inference, and there is no way around that.** The ledger's
`provider` column records `resend`, never *which key*, so no query can attribute
a send to a specific credential. Proving 2 alone is consistent with never having
rotated. Proving 1 alone is consistent with production being broken. Only the
pair establishes rotation.

The old key is tested by **authenticating, never by sending**. `GET /domains`
exercises exactly the credential check and delivers nothing; a send-based probe
would mail someone if the key were still live, turning the test for a leak into
a use of it.

### How Resend actually reports a revoked key

Observed 2026-09-07 against a genuinely revoked key:

```
HTTP 400
{"statusCode":400,"message":"API key is invalid","name":"validation_error"}
```

**400, not 401.** The first version of the witness accepted only 401/403 as
proof of death and classified 400 as "malformed — no verdict", which would have
aborted on a *successful* rotation. The status line cannot carry this decision
alone; the body must be read. A 400 whose body is not an invalid-key error still
yields NO VERDICT, because an empty or malformed key lands on the same status.

## Sequence

### 1 · Capture the pre-rotation SHA

```bash
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
```

Keep it. The witness requires the running artifact to be **unchanged** — if the
SHA moves, something shipped alongside the rotation and the results can no
longer be attributed to it.

### 2 · Rotate

1. Issue a new key in the Resend dashboard.
2. **Revoke every key that existed during the incident window.** Not just the
   one in production — any key that could have leaked.
3. Update `RESEND_API_KEY` in the production environment.
4. Restart `maia-sovereign` so the process reads it. A container started before
   the change keeps the old value in its environment.

Do not deploy. Rotation changes a credential, not an artifact.

### 3 · Witness

```bash
cd /Users/soullab/MAIA-SOVEREIGN
scripts/witness/mail-rotation-witness.sh <MEMBER_ID> <MEMBER_EMAIL> <PRE_ROTATION_SHA>
```

It prompts for the old key with hidden input. **Never pass a key as an argument**
— arguments land in shell history and are visible in `ps` to every user on the
box. The script never echoes it, never writes it to disk, and clears it after
the probe.

It aborts on: a changed SHA, an old key that still authenticates, no accepted
send after rotation, or any non-accepted attempt in the window. A
`failure_code` of `provider_auth` means the container has a wrong or stale key.

### 4 · Confirm delivery

One operator confirmation the script cannot make: **a recovery message actually
arrived**. Provider acceptance is not delivery.

### 5 · Record

```text
ROTATION
ARTIFACT      <sha, unchanged>
OLD KEY       REVOKED     (HTTP 401/403 from GET /domains)
NEW KEY       SENDING     (accepted attempt + issued id)
DELIVERY      <CONFIRMED|PENDING>
MAIL-04       HOLD until confirmed
```

## Failure modes

| Symptom | Meaning |
|---|---|
| Old key returns **200** | Not revoked. Revoke, then re-run. The witness refuses to proceed. |
| No accepted send | New key not in the container. Check `RESEND_API_KEY`, restart. |
| `failure_code = provider_auth` | Wrong or malformed key in production. |
| `members/recover` block active | Leftover limiter state from an earlier run, not a rotation failure. Wait it out. |
| Running SHA changed | Something shipped alongside rotation — not an isolated act. Investigate before attributing anything. |

## Not in this act

MAIL-04 admission work · Postal/transport · Dependabot census · any code change.
Combining any of them makes the witness ambiguous about what it witnessed.
