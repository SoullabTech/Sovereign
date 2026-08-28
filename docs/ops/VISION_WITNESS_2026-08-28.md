# MAIA Vision — acceptance witness

**Candidate**: `MAIA-VISION-01` · branch `claude/maia-image-upload-xufpsn`
**Architecture**: ACCEPTED (ruling 2026-08-28)
**Outstanding**: device witness · privacy witness
**Do not mark live until every gate below has a recorded result.**

---

## 0. The two invariants under witness

```text
VISION-SEES-01
  image supplied → Claude receives image bytes
                 → MAIA describes a genuinely visual detail
                 → no filename-only fallback language

VISION-EPHEMERAL-01
  image supplied → model receives image bytes
  AND  conversation persistence contains no image bytes
  AND  memory stores contain no image bytes
  AND  telemetry contains no image bytes
  AND  server logs contain no image bytes
  AND  retry/resend payload persistence contains no image bytes
```

Filename and media metadata may be retained (`[Attached: IMG_0421.jpg]`, the
`attachments: { seen, rejected[] }` counts). **Raw image content may not.**

---

## 1. Privacy witness — VISION-EPHEMERAL-01

Two halves. The first is already automated and green; the second needs a real
turn to have happened.

### 1a. Shape (automated, runs in CI/pre-commit)

```bash
npx jest app/api/sovereign/app/maia/list/__tests__/visionEphemeral.test.ts
```

7 assertions on the carrier chain: `images` is destructured **out** of the
client-controlled `meta` rest-spread; validated images reach an enumerated set
of call sites and no other; no persistence writer receives them; vision logs
route through `describeImagesForLog` (counts and media types only); no
whole-body logger exists in the route.

This is a **drift alarm, not a proof** — it fires when the shape moves. Both
failure modes were mutation-tested: removing `images:` from the destructure
fails assertion 1; adding any new sink for `visionImages` fails assertion 3.

### 1b. Absence at rest (run after real image turns)

```bash
ssh soullab@minisforum 'docker exec maia-sovereign sh -c \
  "DATABASE_URL=\$DATABASE_URL npx tsx scripts/verify-vision-ephemeral.ts --recent-hours=24"'
```

Scans **every** text/varchar/json/jsonb column in **every** public table for the
base64 signatures image payloads necessarily begin with (`/9j/`, `iVBORw0KGgo`,
`R0lGOD`, `UklGR`, `data:image/`). Deliberately not scoped to the tables the
vision path is known to touch — the point is to catch a sink nobody predicted,
including a generic request logger or a telemetry blob.

Read-only. Never prints a matched value, only table · column · count.

- **PASS** = exit 0, no violations.
- **FAIL** = exit 1, each offending `table.column` named.
- Unscannable columns are reported as **UNPROVEN**, never counted as clean.

Both controls were exercised against a live PostgreSQL before shipping: clean DB
→ PASS/exit 0; a JPEG seeded into a `jsonb` telemetry blob and a PNG into a
memory row → FAIL/exit 1, both named. The probe detects.

### 1c. Log half

```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since 24h 2>&1 \
  | grep -cE "/9j/|iVBORw0KGgo|data:image/"'     # must print 0
```

### 1d. Resend half

Already settled by code shape, recorded here so the witness is complete:
`handleResend` sends `target.text` with `attachments: undefined`. No image
bytes exist in client message state to resend — which is also why a resent
image turn is a text turn (§4).

---

## 2. Device witness — VISION-SEES-01

Only a real iPhone settles this. Both paths must be run: **library selection and
live camera are different capture/encoding paths**, and the tester hit both.

### 2a. iPhone photo library (HEIC)

Choose a photo whose content is **unmistakable and not inferable from its
filename**. Ask something concrete about what is visually present.

```text
HEIC selected in the picker
  → client conversion succeeds        (no toast: "MAIA couldn't open …")
  → request accepted                  👁️ [MAIA] vision-received { accepted: { count: 1 } }
  → Claude receives an image block    👁️ [MAIA] vision-attached { model: …, count: 1 }
  → MAIA names a genuinely visual detail
  → response carries attachments: { seen: 1, rejected: [] }
  → NO filename-only fallback language
```

The HEIC leg is the highest-risk step in the whole change: HEIC is not an
Anthropic-accepted media type, so the client canvas re-encode is load-bearing.
If it fails, the member sees a toast and MAIA is told she cannot see — a clean
failure, but a failure.

### 2b. iPhone live camera

Take a **new** photo inside the flow. Ask about a different unmistakable visual
property than 2a, so a lucky guess cannot pass both.

### 2c. No-vision lane

Force an image-blind route (unset `ANTHROPIC_API_KEY` to fall through to local
Ollama, or set `MAIA_INFERENCE_MODE=local_only`) and send an image.

```text
👁️ [MAIA] vision-unavailable — provider cannot see attachments { count: 1 }
MAIA says, in substance: an image was attached, but this path cannot inspect it.
NO description. NO inference about contents. NO implication that she looked.
```

**A hallucinated description here fails the candidate outright** — it is the
invariant the whole design exists to protect.

### 2d. DEEP downgrade

Send an image with an explicit depth request (the phrasing that normally routes
DEEP).

```text
👁️ [MAIA] vision-tier-downgrade { from: 'DEEP', to: 'CORE', … }
and NO  👁️ [MAIA] vision-reached-deep   ← that warning means the downgrade regressed
```

### 2e. No-regression

One ordinary text-only turn: **no vision log lines at all**, no `attachments`
key on the response.

### Live watch

```bash
ssh soullab@minisforum 'docker logs -f maia-sovereign 2>&1 \
  | grep -E "vision-received|vision-attached|vision-tier-downgrade|vision-unavailable|vision-reached-deep"'
```

---

## 3. Limits must remain truthful

| Case | Expected |
|---|---|
| PDF attached | still filename-only; MAIA does not claim to have read it |
| Resend of an image turn | image absent; §2c language, not a description |
| 5+ images | first 4 accepted, remainder rejected `too-many`, member told |
| Oversize image | client re-compresses; if still over, rejected `too-large`, member told |
| Unsupported type | rejected `unsupported-type`, member told |
| Corrupt/undecodable | client toast names the file; the member's words still send |

---

## 4. Where to run this

**There is no iPhone-reachable staging surface.** `docker-compose.staging.yml`
serves `maia-staging` behind `caddy-staging` at `http://staging.soullab.life:8090`,
and `Caddyfile.staging:5` records that it **requires an `/etc/hosts` entry**. An
iPhone cannot practically take one, and the host is not in public DNS — so the
device witness cannot run there.

Production is therefore the only realistic iPhone surface, and the deploy must be
explicitly bounded as a vision witness:

1. Pin the exact SHA — no branch-tip deploys:
   ```bash
   ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
     && git fetch origin <merge-branch> \
     && scripts/pre-deploy-gate.sh deploy-maia <SHA>'
   ```
2. Record the SHA here with the witness results.
3. Verify provenance before testing:
   ```bash
   ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'   # == <SHA>
   ```
4. Run §2 immediately, then §1b and §1c.
5. Rollback point is `maia-sovereign:previous` (refreshed by the gate). The
   change is additive — a text-only turn is byte-identical to before — so
   rollback risk is a code-path revert, not a data migration.

---

## 5. Result log

| Gate | Date | SHA | Result | Note |
|---|---|---|---|---|
| 1a shape tests | 2026-08-28 | `7f2bd6a` | **PASS** 7/7 | mutation-tested both ways |
| 1b bytes at rest | — | — | pending | needs real turns first |
| 1c logs | — | — | pending | |
| 2a library HEIC | — | — | pending | **decisive** |
| 2b live camera | — | — | pending | **decisive** |
| 2c no-vision lane | — | — | pending | hallucination = fail |
| 2d DEEP downgrade | — | — | pending | |
| 2e no-regression | — | — | pending | |
| 3 limits | — | — | pending | |

**Disposition until every row above reads PASS: BUILT + WIRED, not live.**
