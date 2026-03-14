# Field Release Checklist

**Required before every TestFlight build that touches Field.**

Estimated time: 10–15 minutes. Every item is a command or a one-line UI check.

---

## 1. Local — Before Building

```bash
# TypeScript
npm run typecheck

# Sovereignty checks (no Supabase, no PHI leaks, no inline names)
npm run preflight

# Smoke test
npm run smoke
```

**If any fail: fix before building. Do not proceed.**

---

## 2. Verify Field Boot Is Clean

Open `/field/talk` in a browser (or simulator) with DevTools → Network tab open.

**Before first interaction, confirm zero calls to:**
- `/api/studio/*`
- `/api/practitioner/*`
- `/api/admin/*`
- Any call with `?heavy=true` or similar

**Allowed during boot:**
- `/api/maia/session/start` (non-blocking, fire-and-forget)
- `/api/oracle/conversation` (only after user sends first message)

**If a studio call appears during boot:** find the source, defer it to post-first-interaction. Do not ship.

---

## 3. Verify Build Stamp

After building, open `/field/talk?debug=1` on device or simulator.

**Confirm:**
- `SHA:` matches `git rev-parse --short HEAD`
- `Date:` matches today
- `Field: true` (not false)
- `Safe: no` (unless you intentionally set `FIELD_SAFE_MODE=true`)

**If SHA is wrong or `Field: false`:** the build is stale or the wrong code shipped. Do not distribute.

---

## 4. Verify Instrumentation Headers

```bash
# Replace with a real session cookie/token if your test setup requires it
curl -sI -X OPTIONS https://soullab.life/api/oracle/conversation | grep -i "x-field\|x-route\|x-build"
```

Or after a real conversation turn, check Network tab for the `POST /api/oracle/conversation` response headers:

| Header | Expected |
|--------|----------|
| `X-Field-Mode` | `1` (from Field), `0` (from /maia) |
| `X-Field-Safe-Mode` | `0` (normal) or `1` (safe mode active) |
| `X-Route-Latency-Ms` | Some number. Flag if consistently > 8000 |
| `X-Build-SHA` | Matches your git SHA |

---

## 5. Regulation Arc Spot Check (Field Mode)

Have a 2-turn conversation in `/field/talk`.

**Turn 1 response must:**
- Be 1–3 sentences only
- Acknowledge the message, not explain
- Not contain frameworks, pattern summaries, or multi-part analysis

**If Turn 1 is a long explanation:** the `fieldMode` prop or header is not reaching the oracle. Check:
1. `app/field/talk/page.tsx` passes `fieldMode={true}` to OracleConversation
2. OracleConversation includes `fieldMode: true` in the POST body
3. Oracle route extracts `isFieldMode` and passes `effectiveFieldMode` to `generateSpiralogicResponseWithLLM`

---

## 6. Rollback Path

**Last known good build:** keep this updated every time a build ships successfully.

```
Last good build: 766
Last good git tag: (run `git tag -l "build-*" | sort | tail -3` to find)
Last good SHA: <fill in after each successful build>
```

**To rollback TestFlight:** go to App Store Connect → TestFlight → Builds → select the previous build → submit for testing.

**To rollback web:** `docker compose -f docker-compose.production.yml up -d` after reverting to the last good commit.

---

## 7. After Successful Deploy

Update this section:

```
Last successful build: ___
SHA: ___
Date: ___
Notes: ___
```

Tag the build in git:

```bash
git tag build-<number>-<YYYY-MM-DD>
git push origin --tags
```

---

## Field Safe Mode (Emergency)

If the iOS app is broken and you need to disable heavy Field processing without a new build:

```bash
# On the Mac Studio (production):
# Add to docker-compose.production.yml → maia service → environment:
FIELD_SAFE_MODE: "true"
# Then restart:
docker compose -f docker-compose.production.yml up -d maia
```

**Effect:**
- Field regulation arc prompt is suppressed
- Request headers will show `X-Field-Safe-Mode: 1`
- Client debug panel will show `Safe: YES ⚠️`
- Deep retrieval and heavy processing remain gated (future implementation)

To disable: remove the env var and restart.

---

## What "No Hope Builds" Means

A build ships only when:
1. `typecheck` passes
2. Boot call guard shows no studio calls
3. Build stamp is correct on device
4. Regulation arc is working (Turn 1 is short + present)
5. Rollback path is documented

If any item is unknown: investigate first. The checklist exists so "investigate first" takes 10 minutes, not days.
