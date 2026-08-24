# AUTH-01-D2 — Identity Ingress Census

**Act class:** C0 deterministic inspection. ⛔ **No mutation.** No repair, no request sent anywhere.
**Authority:** founder authorization, 2026-08-24.
**Binding:** `SoullabTech/Sovereign` · branch `claude/auth-01-d-route-identity-containment` @
`e1122a93bdd5b38b025e154977fd58250345a5e8` · descends from canonical tip `73106dc9` · clean tree.

> **The class is not "routes using the wrong helper."**
> **It is any route where the caller gets to nominate which member they are.**

---

## §0 Why this unit exists — a defect in AUTH-01-C

AUTH-01-C built its population as *"reads `x-member-id` AND does not contain the string
`getMemberFromRequest`"*. 14 practitioner routes each define a **local function named
`getMemberFromRequest`**. The name collided with the hardened module, and the filter excluded them.

⭐ **The population was reproducible and under-inclusive.** Two methods agreed because both shared
the same flawed predicate. Agreement is not correctness. This census replaces a
helper-name predicate with a **channel** predicate: every way a member identity can enter a route.

---

## §1 Channel taxonomy — the full ingress surface

923 route files. **134 read at least one identity ingress channel.**

| Channel | Routes |
|---|---|
| `?userId=` query | 45 |
| `?memberId=` query | 29 |
| body `memberId` / `userId` | 22 |
| `x-member-id` header | 18 |
| local shadow `getMemberFromRequest` | 14 |
| `?id=` query | 12 |
| `maia_member_id` cookie | 11 |
| custom `x-*-id` headers | 5 |

Trusted resolvers, for contrast: `getMemberIdFromRequest` 212 · `requireMemberId` /
`getMemberIdIfAuthenticated` 62 · `checkAdminAuth` / `isAdminRequest` 34.

⭐ **`?userId=` and body fields are the two largest channels, and AUTH-01-C looked at neither.**
The header was never the class — it was the one instance of the class we happened to grep for.

---

## §2 Classification

⚠️ **Read §3 before treating any number here as a verdict.**

| Class | Routes | Meaning |
|---|---|---|
| `DERIVED_FROM_CANONICAL` | 26 | a trusted resolver is present in the file; whether the caller value is cross-checked needs a per-route read |
| `CALLER_CONTROLLED` | 94 | an identity channel is read and **no** trusted resolver appears anywhere in the file |
| `EXISTENCE_CHECK_ONLY` | 14 | caller value → `SELECT id FROM members WHERE id = $1` → identity |
| `CANONICAL` | 789 | no caller-controlled identity channel read |

### The 94 are not 94 problems

Narrowing `CALLER_CONTROLLED` by what the value actually does:

| | Routes |
|---|---|
| **no DB access at all** | **64** |
| **caller value reaches a SQL parameter** | **20** |
| DB access, value not seen in a SQL param — needs a read | 10 |

So the actionable population is **44**, not 134 and not 94: 14 confirmed-by-pattern
(`EXISTENCE_CHECK_ONLY`) + 20 high-signal + 10 needing a read.

---

## §3 ⚠️ Calibration — this census over-reports, and here is the proof

This is a **file-level heuristic**. It is coarser than AUTH-01-C's per-route source read, and it is
wrong in a known direction. Two verified false positives, both already adjudicated by the deeper
read:

| Route | D2 says | AUTH-01-C established |
|---|---|---|
| `auth/native-biometry/verify` | `CALLER_CONTROLLED`, value reaches SQL | **SAFE — CLAIM CROSS-CHECKED**: verified against `trusted_devices (id + member_id)` with expiry before a session is minted |
| `auth/native-biometry/enable` | `CALLER_CONTROLLED`, value reaches SQL | **SAFE — same predicate** |
| `telemetry/client` | `CALLER_CONTROLLED` | **NON-AUTHORITY USE**: a label on a bounded allow-listed event |

They trip the heuristic because they cross-check against a **credential table that is not a
session table** — a sound pattern the file-level predicate cannot see.

```
D2 DELIVERS      a population and a channel taxonomy    ✅ VERIFIED
D2 DOES NOT      classify severity per route            ⛔ requires per-route reading
```

⛔ **Do not repair from this list.** Every candidate needs the AUTH-01-C treatment — read the
handler, determine what actually establishes identity, then classify.

---

## §4 EXISTENCE_CHECK_ONLY — 14 routes, confirmed by pattern

All 14 define this identical local resolver:

```ts
async function getMemberFromRequest(request: NextRequest): Promise<{ id: string } | null> {
  const memberId = request.headers.get('x-member-id');
  if (!memberId) return null;
  const result = await query('SELECT id FROM members WHERE id = $1', [memberId]);
  return result.rows.length > 0 ? { id: memberId } : null;
}
```

Verbatim the impersonation pattern `lib/auth/getMemberFromRequest.ts:19-22` documents as fixed.

```
app/api/practitioner/containers/[containerId]/route.ts
app/api/practitioner/containers/[containerId]/transition/route.ts
app/api/practitioner/practices/[practiceId]/route.ts
app/api/practitioner/practices/[practiceId]/dashboard/route.ts
app/api/practitioner/practices/[practiceId]/people/route.ts
app/api/practitioner/practices/[practiceId]/labtools/dashboard/route.ts
app/api/practitioner/practices/[practiceId]/labtools/meetings/route.ts
app/api/practitioner/practices/[practiceId]/labtools/meetings/[meetingId]/route.ts
app/api/practitioner/practices/[practiceId]/labtools/meetings/[meetingId]/action-items/route.ts
app/api/practitioner/practices/[practiceId]/labtools/opportunities/route.ts
app/api/practitioner/practices/[practiceId]/labtools/opportunities/[opportunityId]/route.ts
app/api/practitioner/practices/[practiceId]/labtools/people/[personId]/timeline/route.ts
app/api/practitioner/practices/[practiceId]/labtools/ventures/route.ts
app/api/practitioner/practices/[practiceId]/labtools/ventures/[ventureId]/route.ts
```

⭐ **They share one primitive.** A single shared repair — replace the local shadow with the hardened
resolver — closes all 14 with one reviewable diff. This is the strongest argument that the class
repair is cheap where it is confirmed.

⚠️ Several call `verifyPracticeOwnership(practiceId, memberId)` afterwards, which does constrain
what a forged identity reaches. Ownership checking is not authentication, but it means the impact
per route needs its own read before it is characterised.

---

## §5 The 20 high-signal candidates

Caller value reaches a SQL parameter, no trusted resolver in file. **Candidates for reading, not a
verdict set** (§3).

| Route | Channel(s) |
|---|---|
| `account/storage-consent` | `?memberId=` · body |
| `auth/native-biometry/enable` | `x-member-id` — ⚠️ known false positive (§3) |
| `auth/native-biometry/verify` | `x-member-id` — ⚠️ known false positive (§3) |
| `commons/contributions/my-offerings` | `?memberId=` |
| `commons/contributions/orientation` | `?memberId=` |
| `community/posts` | custom `x-*-id` |
| `community/user-stats` | `?userId=` |
| `connectors/caldav/calendars` | `?userId=` · body |
| `connectors/caldav/events` | `?userId=` |
| `focus/garden` | `?memberId=` |
| `invites/list` | `?memberId=` |
| `maia/trajectory/focus` | `?memberId=` |
| `maia/trajectory/state` | `?memberId=` |
| `maia/trajectory/state-history` | `?memberId=` |
| `maia/trajectory/thresholds` | `?memberId=` |
| `members/magic-link` | `maia_member_id` cookie |
| `members/progress` | `?memberId=` · body |
| `memory/patterns/[patternId]/feedback` | custom `x-*-id` |
| `reality-score` | `?userId=` · body |
| `user/profile` | `?userId=` |

⭐ **`maia/trajectory/*` is four routes reading `?memberId=` over developmental-trajectory
material.** If they resolve as unsafe, that is the same sovereignty class as the primary
conversation route — member developmental material selected by a caller-supplied query string.
They should be read first.

Ten more have DB access with the value not visibly reaching a SQL parameter and need a read:
`auth/exchange` · `auth/google/disconnect` · `commons/contributions/[id]` ·
`maia/living-field` · `members/email-code/verify` · `members/preferred-name` ·
`members/register-email` · `members/register-local` · `members/register` · `members/signout`.

⚠️ Several `members/*` entries read `maia_member_id` **as a cookie they are setting or clearing**,
not as identity input. Another reason §3's caveat is load-bearing.

---

## §6 Bearing on how AUTH-01-D lands

AUTH-01-D repaired 20 routes and is proven red/green. This census establishes that those 20 were
**one channel of at least eight**.

```
AUTH-01-D   VALID PARTIAL REPAIR      ✅
            CLASS CLOSURE             ⛔ NOT ESTABLISHED
```

The record must not imply that caller-selected identity is eliminated. It is not. On the founder's
A/B framing, the evidence supports **A — merge as PARTIAL CONTAINMENT**: the 20-route repair is
self-contained, introduces no second auth authority, leaves middleware untouched, and creates no
inconsistent semantics with the routes still unrepaired (those were already unsafe; D makes none of
them worse). The 14-route shadow set is the natural next bounded unit — one primitive, one diff.

---

## §7 What this census did NOT do

⛔ No repair. ⛔ No request sent to production or anywhere. ⛔ No per-route severity verdict — §3.
⛔ No claim that the 94 or the 20 are vulnerable. ⛔ No middleware analysis (AUTH-01-C §3 stands).
⛔ No history claim (shallow clone).

## §8 Standing

```
CHANNEL TAXONOMY          ✅ VERIFIED — mechanical, reproducible over 923 route files
POPULATION (134 / 94 / 14) ✅ VERIFIED as a channel-read fact
SEVERITY PER ROUTE        ⛔ UNKNOWN except the 14 confirmed by pattern and the 3 known
                             false positives already adjudicated by AUTH-01-C
EXPLOITATION              ⛔ NOT WITNESSED — deliberately not attempted
```

**NEXT AUTHORIZED ACT:** none. Awaiting the founder's landing ruling on AUTH-01-D and a decision on
whether the 14-route shadow repair opens as its own unit.
