# Step 2 — caller-controlled identity repair

**Date:** 2026-08-09 · **Scope:** `/api/caseload/**` and `/api/premium-storage/**` only
**Authorization:** founder, *"Proceed with Step 2 only … Do not map routes, enable strict mode, or begin the CI pin in the same change."*
**Boundary respected:** no route was mapped, `ACCESS_CONTROL_MODE` was not set anywhere, and the repository-wide route-declaration gate (Step 4) was not begun.
**State** (per `INCIDENT_RESPONSE_STANDARD.md` — seven independent facts, split by repair because they diverge):

| repair | designed | implemented | tested | merged | deployed | live-verified | closed |
|---|---|---|---|---|---|---|---|
| `export` DELETE object-authz (§3) | ✅ | ✅ | ✅ 7/7 | ✅ | ✅ | ✅ | ✅ |
| the other **26** handlers | ✅ | ✅ | ✅ 77/77 | ❌ | ❌ | ❌ | ❌ |

**Deployment status (corrected 2026-08-09, post-deploy):**
- ✅ **The `premium-storage/export` DELETE object-authorization fix (§3) is MERGED AND DEPLOYED** — PR #996, `46cdd47dd`, verified live. That defect is **CLOSED**; see `EXPORT_DELETE_INCIDENT_SCOPE_2026-08-09.md`.
- ⚠️ **The remaining 26 handlers in this document are branch-only** (`feature/labtools-redesign`). `lib/auth/selfScopedIdentity.ts` is **not on trunk**. Those caller-supplied-identity defects **are still live in production.**

⛔ Do not read this document as "the namespaces are repaired." One handler shipped; the rest have not.

---

## 1. Authority model traced before any change

Per the instruction *"do not mechanically replace one ID with another without tracing the domain authority model"* — both namespaces were read before being touched.

### `/api/caseload/**` — practitioner-owned, no delegation

`lib/caseload/CaseStore.ts` constrains **every** query by `practitioner_id`:

```
getCase              WHERE id = $1 AND practitioner_id = $2
getCaseWithStats     WHERE c.id = $1 AND c.practitioner_id = $2
listCases            WHERE c.practitioner_id = $1
updateCase           WHERE id = $1 AND practitioner_id = $2
listNotes            WHERE case_id = $1 AND practitioner_id = $2
deleteNote           WHERE id = $1 AND practitioner_id = $2
getUnlinkedCaptureSessions   WHERE cs.user_id = $1
```

**The store layer was never the defect.** The parameter the routes call `memberId` *is* the practitioner — it is documented in-file as *"Practitioner's member ID"*. No route in this namespace accepts a separate client identity, so **there is no delegation to preserve**: nobody may legitimately act as somebody else here.

⭐ Decisive corroboration: **`app/api/caseload/transcribe/route.ts` already did it correctly**, using `getMemberIdFromRequest`. The repair makes the other eight match the one in the same namespace that was already right — not an imported pattern, a restored local one.

Note also `caseload/list` calls `CaseStore.isPractitioner(memberId)`. Against a caller-supplied id that role check proved nothing. **After this repair it becomes a real role gate**, at no extra cost.

### `/api/premium-storage/**` — member-owned, no delegation

`lib/services/premium-storage.ts` scopes every operation by `userId` — `where: { userId }` on lookups, per-user storage directories on the filesystem. `ExportArchive.userId` exists in the Prisma model. Same shape: single-owner, self-scoped, no admin or on-behalf-of path.

**Conclusion:** both namespaces are the *same* authority shape, and it is the shape the `delete-my-memory` pattern was built for. The pattern transfers because the model matches — and `lib/auth/selfScopedIdentity.ts` says explicitly, in its header, where it must **not** be used (any surface with real delegation), so it cannot be cargo-culted into a domain with different rules.

## 2. What was changed

**`lib/auth/selfScopedIdentity.ts`** (new) — `requireSelfScopedMember(request, suppliedId?, label?)`:

- identity from `getMemberIdFromRequest()` only — which validates a session token against `auth_sessions`, **refuses a bare `x-member-id`**, and rejects a mismatching `x-member-id` claim as impersonation;
- no verified session → **401**;
- supplied id naming anyone but the caller → **403**, and the operation reaches nothing;
- supplied id absent or equal to the caller → proceed.

**14 route files, 27 handlers — 203 insertions, 0 deletions.** The change is purely additive: the guard is inserted *before* each existing validation, and no existing message, status code, or downstream call was altered. Because the guard 403s on mismatch, every later use of the caller-supplied variable is provably equal to the session member.

| Namespace | Files | Guards |
|---|---|---|
| `/api/caseload/**` | 8 (+1 already correct) | 16 |
| `/api/premium-storage/**` | 6 | 11 |

## 3. ⚠️ A second, more severe defect found while repairing

**`premium-storage/export` DELETE took no identity at all.** It resolved an archive by `exportId` alone and then unlinked the file and deleted the row:

```ts
const exportRecord = await prisma.exportArchive.findUnique({ where: { id: exportId } });
await fs.unlink(exportRecord.filePath);
await prisma.exportArchive.delete({ where: { id: exportId } });
```

Any caller who knew or guessed an id could destroy another member's export — file and record. This is an **object-level authorization gap**, a different and worse class than caller-supplied identity: there was no identity to misuse because none was required.

Repaired: authenticate the caller, then compare `exportRecord.userId !== auth.memberId` **before** the unlink and before the delete. The refusal returns **404, not 403**, so the endpoint does not confirm to a non-owner that an id exists.

A second miss by the same scan: `premium-storage/conversation` POST destructured `userId` across multiple lines and was guarded by hand.

**Both were found by re-scanning for handlers with no identity at all, not by the pattern that found the first ten.** Method note: a scan tuned to one defect shape will not see a second shape. The re-scan is now a test (§4).

## 4. Evidence

| Suite | Result |
|---|---|
| `lib/auth/__tests__/selfScopedIdentity.test.ts` | **23/23** — adversarial |
| `app/api/caseload/__tests__/callerIdentityBoundary.test.ts` | **54/54** — regression pin |
| Prior suites (deletion honesty ×2, corrigibility, practitioner pins) | 85/85 unchanged |
| **Total** | **162/162** |
| `npm run typecheck` | 237 vs 239 baseline — **no regressions** |

**Adversarial cases proven refused:** another member's id · uppercased caller id · whitespace-padded id · trailing null byte · `' OR '1'='1` · numeric `0` · boolean `true` · array wrapping the id · crafted object with a `toString` · `*` · `%` · `../<victim>` · a bare `x-member-id` header with no session. Refusal bodies name no identifier.

**Regression pin asserts**, per handler, across both namespaces: every exported handler resolves a verified identity; the guard appears **before** the first store/Prisma call; and the export-DELETE ownership check sits before both the `fs.unlink` and the row delete.

## 5. Behaviour preserved — and the one change that is not backward compatible

The caseload UI reads `memberId` from `localStorage.beta_user.id` (the signed-in member) and sends it as a query parameter. That value equals the session member, so **the guard passes and the UI is unaffected**.

⚠️ **One deliberate behaviour change:** a client holding `beta_user` in localStorage **without a valid server session** previously received data and now receives **401**. That is correct — it was never authenticated — but it is a real change, and it lands hardest where CLAUDE.md documents the Capacitor cookie trap: **`x-member-id` alone does not authenticate.** An iOS caller must present a valid `x-session-token`. The caseload pages use plain `fetch` (web-only) rather than `apiFetch`, so no iOS surface is known to be affected — **but this was reasoned from the call sites, not verified on a device.**

## 6. Limits — stated plainly

1. **Partially deployed — split the two facts.** The `premium-storage/export` DELETE fix (§3) shipped as PR #996 and is verified closed in production at `46cdd47dd`. **Everything else here is branch-only**, so the anonymous-reachability finding still stands for `/api/caseload/**` and the other five `/api/premium-storage/**` handlers until they ship.
2. **No post-repair production probe was run**, and none should be read into this document: the fix is on `feature/labtools-redesign`, not on `clean-main-no-secrets`.
3. **Store-layer scoping was verified by reading**, not by executing queries against a database.
4. **No cross-member exploitation was performed** — per instruction. Reachability plus static authority analysis is the whole evidentiary basis for the vulnerability claim.
5. The ~76-route inventory from the boundary audit is **not** complete after this change. **27 handlers across 2 namespaces are repaired; the remainder are untouched** and are Step 2's continuation, not part of this change.

## 7. Founder decisions this surfaced

1. **`premium-storage/export` DELETE had no object-level authorization at all.** Was any archive deleted by a non-owner? Determining that needs access logs, which were not examined. If those logs exist and are retained, this is worth an incident-scope determination in the manner of `MEMBER_CONTENT_RETENTION_INVENTORY.md`.
2. **Deploy urgency.** This is a security repair sitting on a feature branch behind other work. Whether it should be cherry-picked to `clean-main-no-secrets` and deployed ahead of the rest is a founder call, not mine.
3. **Does `/api/premium-storage` still serve a live product?** It uses Prisma while the rest of the system uses `lib/db/postgres.ts` directly. If the surface is dormant, retiring it may be more honest than defending it.

---

*Step 2 only. No routes mapped, no strict mode, no CI pin, no production change.*
