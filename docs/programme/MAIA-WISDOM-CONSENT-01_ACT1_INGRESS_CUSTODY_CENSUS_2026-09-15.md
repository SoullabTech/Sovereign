# MAIA-WISDOM-CONSENT-01 · ACT 1 — Ingress Custody Census

**Status: CENSUS COMPLETE · READ-ONLY · ⛔ NOTHING REPAIRED.**
**Date:** 2026-09-15 · **Repo** `soullabtech/sovereign` @ `cf38ecde` · production branch
`clean-main-no-secrets` inspected via `git cat-file`.

⛔ No route changed · no gate added · no flag flipped · no deploy · production not contacted.

---

## 0. Headline

**There are TWO ingresses into the AIN collective field, not one. They fail differently,
and the one ACT 1C found is not the more consequential.**

| | **Seam 1** `POST /api/ain/collective/breakthrough` | **Seam 2** `/api/between/chat` → `AINSpiralogicBridge` |
|---|---|---|
| Identity | ⛔ **`userId` from request body, unauthenticated** | ⭐ authenticated route context |
| Sanctuary respected | ⛔ **no check** | ⭐⭐ **yes — explicit** |
| Deploy gate | ⛔ none | ⭐ `AIN_FIELD_BRIDGE_ENABLED === '1'`, default off |
| Contribution act | ⛔ **none** | ⛔ **none** |
| Raw text crosses | ⚠️ yes (`text` in body) | ⚠️ yes (`message`) |
| Raw text persisted | ⭐ **no** | ⭐ **no** |

⭐ **Seam 2 shows the authors understood the boundary**: *"Sanctuary sessions NEVER
contribute"* is in the source, and the bridge is off by default.

⛔⛔ **And Seam 2 is still the deeper R15 violation.** Its gate is `!isSanctuary` — **absence
of a privacy act read as presence of a contribution act.** Under R15 (*conversation ≠
contribution*) that inversion is the defect, and it is on an **authenticated, live** route,
where a flag flip would begin contributing every non-sanctuary conversation with no member
ever having offered anything.

> **Seam 1 is the access-control hole. Seam 2 is the consent hole.** ⛔ Fixing only the
> first would leave R15 false and look like a fix.

---

## A. Deployed lineage — ⚠️ PRESENT

`app/api/ain/collective/breakthrough/route.ts` **exists on `clean-main-no-secrets`**
(verified by `git cat-file -e`). Entered via merge `37d63e9b` (PR #1249).

⛔ Under the 2026-09-07 finding — *merge-to-canonical is latent deploy authorization* — it is
in every build cut from that branch. ⚠️ Whether the currently running container carries it is
**UNVERIFIED** (no production access); falsifier below.

## B. Network reachability — ⚠️ LIKELY REACHABLE, with a one-command falsifier

Chain, verified in source:

1. `middleware.ts` matcher covers `/((?!_next/static|_next/image|favicon.ico|api/voice/transcribe-simple|api/sovereign/manuscripts/ingest$).*)` — ⭐ `/api/ain/*` **is** matched.
2. `config/accessMatrix.ts` — ⛔ **no `/api/ain` entry exists.** Confirmed by search.
3. Unmapped route handling:

```ts
// config/accessMatrix.ts:727
export function getAccessMode(): AccessMode {
  return process.env.ACCESS_CONTROL_MODE === 'strict' ? 'strict' : 'permissive';
}
// …
if (!rule) {
  if (mode === 'strict') return { allowed: false, reason: 'no-rule-match', unmapped: true };
  else                   return { allowed: true,  reason: 'no-rule-match', unmapped: true };  // MODE A
}
```

⭐⭐ **The default is `permissive`, and `ACCESS_CONTROL_MODE` is set in no compose file, env
example, Dockerfile or script anywhere in the repository.** In permissive mode an unmapped
route is **allowed through**, and Seam 1 performs no auth of its own.

⚠️ **STATED AS A LIMIT, NOT HEDGED:** `.env.production` on minisforum is gitignored and
unreadable from here. ⛔ **This census cannot assert the deployed value.** What it asserts
is that *nothing in the repository sets it* and *the code default is permissive*.

**⭐ FALSIFIER — two read-only commands, decisive either way:**

```bash
ssh soullab@minisforum 'docker exec maia-sovereign printenv ACCESS_CONTROL_MODE'   # empty ⇒ permissive
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://soullab.life/api/ain/collective/breakthrough \
  -H 'content-type: application/json' --data '{}'
# 400 ⇒ route reached, unauthenticated (its own validator answered)
# 404 ⇒ contained by strict mode   ·   401/403 ⇒ contained by auth
```

⭐ The probe sends `{}` deliberately — it establishes reachability from the route's **own**
`userId and text are required` validator without contributing anything.

## C. Callers of Seam 1

⛔ **No in-repository caller.** No component, page, hook or service fetches this route. It is
reachable **only** from outside the application. ⛔ *"No live surface calls it"* is therefore
**not containment** — it means every possible caller is external.

## D. Write seams into the substrate

Exactly **two**, both through `collectiveBreakthroughService.contributeBreakthrough()`
(the sole `INSERT INTO collective_breakthroughs`, at `:114`):

1. `app/api/ain/collective/breakthrough/route.ts:70` — `contributeBreakthrough(userId, …)` with `userId` from the body.
2. `lib/ain/AINSpiralogicBridge.ts:296` — `contributeBreakthrough(pattern.userId, …)`, reached from `/api/between/chat` (fire-and-forget, `:2420`) and `app/api/oracle/conversation/route.ts`.

⛔ No direct SQL path bypasses the service.

## E / F. Identity — ⛔ NOT ESTABLISHED at Seam 1

```ts
const { userId, text, … } = await request.json();
if (!userId || !text) return NextResponse.json({ error: 'userId and text are required' }, …);
```

⛔ **`userId` is trusted directly from the request body.** No session, no cookie, no
`x-member-id` verification, no ownership check, no membership check. **Any caller may
nominate any member as the contributor** — which R9-lane invariant 6 names explicitly.

## G. Checks present / absent

| Check | Seam 1 | Seam 2 |
|---|---|---|
| Authentication | ⛔ | ⭐ route context |
| Authorization / role / ownership | ⛔ | ⛔ |
| CSRF / origin | ⛔ | n/a |
| Rate limit | ⛔ | ⛔ |
| **Sanctuary** | ⛔ | ⭐⭐ `!isSanctuary` |
| Deploy flag | ⛔ | ⭐ `AIN_FIELD_BRIDGE_ENABLED === '1'` |
| `visibility` / consent | ⛔ | ⛔ |
| **Contribution act** | ⛔ | ⛔ |
| Anonymization (downstream) | ⭐ SHA-256 + salt | ⭐ same |

## H. Raw text handling

Raw text **crosses the boundary** — Seam 1 receives `text` and runs `detectBreakthrough(text)`;
Seam 2 passes `message` to `inferBreakthroughFromText`. ⭐ **Neither persists it**: the INSERT
writes `pattern_id`, `catalyst_type`, `spiralogic_phase`, transitions and flags — ⛔ **no text
column exists on `collective_breakthroughs`.** Logging is `console.log('✨ [Collective]
Breakthrough contributed to field')` and an error log of the exception, ⛔ not the body.

⚠️ ⛔ **Unverified and left open:** whether any request-body logging, tracing or queueing sits
in the deployed proxy/observability layer. Repository-side is clean; the edge is not this
census's to read.

## I. What `visibility` actually governs — ⛔ NOTHING, TODAY

`developmental_memories.visibility` and `user_relationship_context.visibility`
(`private | shared | commons | anonymized`, `DEFAULT 'private' NOT NULL`) have ⛔ **no reader
and no writer surface** in the repository. Every `visibility` match found belongs to a
*different* column (circles, practitioner sessions, trust service).

⭐ **The boundary R9 needs is already declared, correctly defaulted, and entirely unenforced.**
⛔ And the contribution path does not consult it — so the column is not merely unused, it is
**bypassed by the only pathway it was plausibly written for.**

## J. Does a contribution gesture already exist?

⭐ **Yes — for a different destination.** `app/maia/community/contribute/page.tsx` POSTs to
`/api/commons/contributions` — the **Commons**, not AIN. ⛔ **No gesture anywhere targets the
collective field.**

⭐ **Useful precedent, ⛔ not a seam to reuse**: ACT 1B flagged the Commons' neighbouring
`contribution_levels` / `community_*` status economy as barred by **R14 / FR-08.7**.

## K. Production risk, stated exactly

**If the falsifier returns `400`:** an unauthenticated internet caller can write rows into the
collective-field substrate, attributing them to **any** member id, at any rate.

Bounded honestly — ⛔ this is a **field-integrity** risk, not a data-exfiltration risk:

- ⭐ No member content is readable through it. The POST writes; it returns no member data.
- ⭐ No raw text is stored, so injected text does not become durable prose.
- ⛔ **But the field's learning can be forged.** Fabricated patterns, phases and elemental
  transitions enter the substrate the efferent path returns as *collective wisdom* — and with
  `ain_collective_warmup` lowering thresholds on sparse fields (`min_count=1` when total < 20),
  ⚠️ **a young field is maximally cheap to poison.**
- ⛔ And attribution is forgeable: `pattern_id = sha256(userId + salt)` means a caller who
  nominates a member id produces that member's genuine signature on material they never lived.

⭐⭐ **The deepest risk is not the endpoint. It is that R9's central prohibition —
*no personal relational material enters AIN merely because a member shared it with MAIA* —
is today enforced by a deploy flag and the absence of a UI, not by a boundary.**

### Recommended minimum containment — ⛔ RECOMMENDED, NOT PERFORMED

Ordered by cost, ⛔ none authorized:

1. ⭐ **Add `/api/ain/collective/*` to `config/accessMatrix.ts`** — the smallest change that
   closes Seam 1 without touching the route, using the mechanism already built. ⛔ *Do not*
   answer this by setting `ACCESS_CONTROL_MODE=strict`: that silently re-gates **every**
   unmapped route in the system, which is its own governed act with its own blast radius.
2. Derive `userId` from the verified session; ⛔ reject a body-supplied contributor.
3. Keep `AIN_FIELD_BRIDGE_ENABLED` **off** until the contribution act exists (R15).
4. ⛔ **Do not** wire the live member route to any AIN pathway (R6, restated).

⚠️ **None of these is the consent gate.** They contain an ingress; ⛔ **a contribution act is
a member-facing design question**, and building the gate before the standing model (F.14)
would flatten *lived success · single observation* into a checkbox.

---

## L. Required return — summary

**Ingress map:** 2 seams · 1 service function · 1 INSERT · 0 in-repo callers of Seam 1.
**Identity boundary:** ⛔ absent at Seam 1 (body-supplied); present at Seam 2.
**Consent boundary:** ⛔ **absent at both.** `visibility` unread. No gesture targets AIN.
**Persistence/logging boundary:** ⭐ repository-side clean — text crosses, ⛔ never stored;
⚠️ edge layer unread.
**Deployed/reachable:** ⚠️ on the production branch; reachability **probable, unproven** —
falsifier in §B.
**Falsifiers:** §B (reachability), §A (running lineage), and for §I: *if any code reads
`developmental_memories.visibility`, the "governs nothing" finding is false.*

**Standing: `MAIA-WISDOM-CONSENT-01` ACT 1 COMPLETE · ⛔ NOTHING REPAIRED · ⛔ NOTHING
DEPLOYED · ⛔ CONTAINMENT NOT AUTHORIZED · ⛔ CONSENT GATE NOT DESIGNED · ⚠️ REACHABILITY
FALSIFIER OWED (founder-side, two read-only commands) · PRODUCTION UNTOUCHED.**

**STOP for adjudication.**

> *The system already knows Sanctuary must never contribute. What it does not yet know is
> that not-Sanctuary is not the same as offered.*
