# House-Map Reconciliation — `accessMatrix` vs `mobileAllowlist`

**Date**: 2026-07-23/24 · **Named tree**: everything read via `git show b33990c6d:<path>`
(production remains `a51233b1b`) · **Runtime probe**: unauthenticated GETs to
`https://soullab.life`, read-only.

**Verdict: RECONCILED — intentionally distinct authorities, not duplication.**
Audit 1's framing ("two unreconciled maps of the same building") was **wrong**. They are not
maps of the same thing. One says *who may enter a room*; the other says *which rooms are in
this edition of the building*.

## 1. Ownership and call sites

| | `config/accessMatrix.ts` | `lib/mobile/mobileAllowlist.ts` |
|---|---|---|
| **Answers** | **Permission** — may this identity enter this route? | **Product scope** — does this route ship in this device shell? |
| **Axis** | tier (`free`/`personal`/`pro`) · role · public | device class (PHONE / TABLET / STUDIO) |
| **Enforced** | server-side, `middleware.ts:232` `checkAccess()` | **build-time** `scripts/capacitor-patch-routes.sh` + **runtime redirect** `components/mobile/MobileRouteGuard.tsx` |
| **Consumers** | 18 files — middleware, `lib/trust/*`, `lib/security/requireAccess`, `lib/auth/setSessionCookies`, API routes | 6 files — the patch script, the route guard, `mobileEntitlements`, 3 pages |
| **Provenance** | **generated** — `scripts/generate-access-matrix.ts` from `OFFERINGS_INVENTORY.json` | hand-authored |

## 2. Is either generated from, or subordinate to, the other?

**No — independent.** `mobileAllowlist.ts` imports nothing from `accessMatrix`, and
`accessMatrix.ts` contains no reference to `mobileAllowlist`. Neither is derived from the
other; they have different upstreams (`OFFERINGS_INVENTORY.json` vs hand-authored shell design).

## 3. Canonical authority

**There is no single canonical authority for "the House," and there should not be** — the
two maps answer different questions and both are canonical for their own:

- **`accessMatrix` is canonical for permission.** No route may be entered against it.
- **`mobileAllowlist` is canonical for shell membership.** A route absent from PHONE_ROUTES
  is *deliberately* not in the phone edition; that is scoping, not a defect.

Divergence is therefore **expected and legitimate in one direction**: a route may be gated
by accessMatrix and absent from a shell, or present in a shell and gated. Neither is an error.

## 4. Set difference, and the one direction where divergence *is* a defect

Of 29 onboarding + phone + tablet routes, **7 have no `accessMatrix` rule**:
`/check-in` · `/history` · `/profile` · `/how-to-use` · `/voice-controller-test` ·
`/insights` · `/timeline`.

This matters because of the unmapped-route default:

```
config/accessMatrix.ts:590
  return process.env.ACCESS_CONTROL_MODE === 'strict' ? 'strict' : 'permissive';

checkAccess(): no rule found
  strict     → { allowed: false }   (MODE B)
  permissive → { allowed: true  }   (MODE A)   ← default
```

**`ACCESS_CONTROL_MODE` is set nowhere** — not in `.env*`, `docker-compose*`, `next.config*`,
`lib/`, or `config/`. Production therefore runs **permissive: any route without a rule is
served without authentication.**

## 5. Runtime probe — the alarm was mostly false

Unauthenticated GETs against production:

| Route | Result |
|---|---|
| `/history` `/check-in` `/profile` `/insights` `/timeline` `/how-to-use` | **404** |
| `/maia` (mapped, control) | **302 → `/signin?next=/maia&reason=no_session_cookie`** ✅ |
| **`/voice-controller-test`** | **200, 30,896 bytes, no signin markers** |

Confirmed at `b33990c6d`: **6 of the 7 have no `page.tsx` at all.** They are *aspirational*
entries in `mobileAllowlist` for shell surfaces not yet built. Unmapped-and-nonexistent is
harmless — there is nothing to gate.

**One is real.** `/voice-controller-test` exists, is unmapped, and is publicly served. Its
own header reads: *"Internal diagnostic… Phase 1 Smoke Test… "* and `mobileAllowlist`
annotates it *"Kelly only."* It contains no auth reference. Low data sensitivity (a
microphone/transcript test harness, no member records), but it is an internal tool on the
public web, and it is only public **because the two maps disagree and the default is
permissive**.

## 6. Findings

1. **The maps are reconciled as intentionally distinct.** Do not merge them; do not
   generate one from the other. Audit 1's finding #5 is **closed as mis-framed**.
2. **The real systemic issue is not the two maps — it is `ACCESS_CONTROL_MODE` defaulting
   to `permissive` and never being set.** Any route added without an accessMatrix rule is
   public by default. That is a fail-open posture on the permission authority, and it is
   what converted a benign map divergence into a live exposure. → **issue #717**
3. **`/voice-controller-test` is publicly reachable and should not be.** → **issue #717**
4. **`mobileAllowlist` contains 6 entries for routes that do not exist.** Harmless today,
   but it means the file is a wish-list and a shipping-manifest at once, so its entries
   cannot be read as evidence that a surface exists. Worth noting, not worth fixing now.

## 7. Method note

The set-difference alone said *"7 unauthenticated routes."* The runtime probe said *"6 do
not exist; 1 does."* Grep sized the candidate set; **runtime graded it**. Reporting the
grep result would have been a seven-fold overstatement of a real single-route finding —
the same failure mode as Audit 1, caught this time before it was written down as a claim.
