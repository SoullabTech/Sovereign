# JARVIS-CIRCLES-01 · I0.5 — ENTRY SAFETY CLOSURE

**Stage** CIRCLE-05 · INVOKE
**Date** 2026-09-07
**Branch** `claude/jarvis-circles-programme-reouzc`
**Status** ⛔ **IMPLEMENTED · NOT VERIFIED** — the full verifier has not been run in this session.
**Authorization** founder act, 2026-09-07, opening `I0.5 · ENTRY SAFETY CLOSURE` on the I0 census findings.

---

## 0 · Why this stage exists at all

I0 was a **read-only census**. It was not supposed to produce repairs. It produced two findings that
are not design questions but **defects against already-ratified law**, both of them created or
exposed by work this lane has already accepted:

| | |
|---|---|
| **I-01** | An invitation could **overwrite a recorded removal**. FR-05 was ratified and implemented; the entry path silently undid it. |
| **I-02** | `/commons/join` **solicited a token and a consent decision** and then POSTed both to a door R1 had already closed. |

Neither can wait for I1. A design stage that opens on top of an entry path that can undo FR-05 is
designing on a floor that is not there. So: close these two, extend the verifier so neither can
return silently, and **stop**.

⛔ **This stage adds no capability.** No invitation is sent, no cohort is authorized, no discovery is
built, no facilitator is assigned, no founder gate is lifted, no migration is authored, nothing is
deployed.

---

## 1 · I-01 — a generic invitation may not reinstate a removed member

### 1.1 The defect

A Circle invite token is **Circle-wide** (`circle_invites` holds one row per Circle-scoped token, no
per-invitee identity) and **never expires** (there is no `expires_at` column). `joinWithInvite()`
upserted membership:

```sql
ON CONFLICT (circle_id, member_id) DO UPDATE SET status = 'active', ...
```

So a member removed under the full FR-05 contract — authority checked inside the Circle, grounds
required, shares revoked, responses tombstoned, an append-only record written — was restored to
`active` by the same link every other invitee holds. **FR-05 requires removal to cut access. It cut
access only until the next join request.**

### 1.2 The correction to Jarvis's first recommendation

The I0 docket recommended that removal **revoke the invite token**. The founder refused that repair,
and the refusal is the substance of the ruling:

> Removal does **not** require revoking the Circle-wide invite token. That would withdraw the
> invitation from **everyone** in order to answer **one** person's standing.

The defect was never that the token survived. The defect was that **a generic bearer credential had
enough authority to overwrite a recorded relational act**.

### 1.3 FR-18 — ratified

> ### FR-18 · A generic Circle invitation may not reinstate a removed member.
>
> **A recorded removal standing outranks a generic invitation.** An invitation is permission to approach a threshold. It is not
> authority to erase prior relational history. A removed member presenting a valid, live invite is
> refused; the invitation itself is untouched and remains usable by everyone else.

### 1.4 What was built

`lib/circles/inviteService.ts`

- New testability seam `joinWithInviteWithClient(client, token, memberId, consentMode)`; the plain
  `joinWithInvite()` wraps it in `transaction()`. Same seam pattern as `removeMemberWithClient` and
  `withdrawResponseWithClient` — the verifier drives the **real** contract inside a rolled-back
  transaction rather than a re-implementation of it.
- **The authority is the mutation, not a precheck** — see §1.5, which records a founder-found defect
  in the first candidate and its repair.

  ```sql
  INSERT INTO circle_memberships (...) VALUES (...)
  ON CONFLICT (circle_id, member_id)
  DO UPDATE SET status = 'active', consent_mode = $3, consented_at = NOW()
  WHERE circle_memberships.status <> 'removed'
  RETURNING circle_id
  ```

  Zero rows returned ⟺ an existing membership row whose status is `removed` → `REINSTATEMENT_REQUIRED`.

`app/api/circles/join/route.ts`

- `REINSTATEMENT_REQUIRED` → **409**, body `This invitation cannot restore your place in this circle`.
- The refusal carries **no Circle name, no grounds, no token verdict**. A refusal is not an occasion
  to disclose. The removed member learns that this path is closed to them; they learn nothing about
  the Circle's interior, and no third party learns anything from the response shape.

### 1.5 ⭐ The first candidate was rejected — FR-18 was checked but not authoritative

Founder source review of `093379e8d`, **before** the verifier was run.

The first candidate read the standing, refused if it was `removed`, then upserted `status = 'active'`
unconditionally. `transaction()` is an ordinary `BEGIN → callback → COMMIT` with no row lock and no
stronger isolation, so this interleaving was possible:

```
JOIN                                REMOVAL
reads standing = active
                                    removes member (status = removed)
                                    removal record written
                                    COMMIT
upsert status = active
COMMIT

FINAL: membership = active · removal record = says removed
```

The candidate therefore established only: *if the person is already `removed` when the SELECT runs,
refuse them.* FR-18 requires the stronger statement:

> **A generic invitation may not overwrite a removal standing at the membership mutation boundary.**

Those are not the same claim. And **the T10 family as first written could not tell them apart** —
T10a–T10e all evaluate a standing that was already `removed` before the join began, sequentially,
against one transaction. A precheck passes all five.

**Repair:** the rule moved into the upsert itself, guarded by
`WHERE circle_memberships.status <> 'removed'` with `RETURNING`. `ON CONFLICT ... DO UPDATE` takes a
row lock and re-evaluates its `WHERE` against the latest committed version of the conflicting row —
which is the boundary the rule belongs at. The preliminary standing SELECT was **removed entirely**
rather than kept as an advisory precheck, so there is exactly one authority and no second thing a
future reader can mistake for it.

Every intended distinction is preserved: a new member joins · `left` behaves exactly as before
(**CA-08 still open**) · `removed` cannot be reactivated · the Circle-wide token stays live · an
independently eligible member still uses it · **no migration, no schema change**.

**And the instrument was extended to catch this class**: T10f (§3) is a deterministic interleaving
witness. `093379e8d` fails it; the guarded upsert passes it.

> *This is the kind of defect worth finding before a `62/62` that would have been greener than the
> law it claimed to prove.*

### 1.6 What was deliberately NOT done

| | |
|---|---|
| ⛔ **Token revocation on removal** | Circle-wide. Would punish every other invitee. Refused by founder ruling. |
| ⛔ **Per-invitee tokens** | Founder: *do not add yet.* |
| ⛔ **Invite expiry** | Founder: *do not add yet.* |
| ⛔ **A reinstatement workflow** | Founder: *do not add yet.* The refusal is a full stop today, not a queue. |
| ⛔ **Touching `left`** | `left` ≠ `removed`. A member who left of their own accord may return on the same invitation; that is not reinstatement. **CA-08 is not decided here.** |

---

## 2 · I-02 — the closed join surface

### 2.1 The defect

R1 correctly closed every `/api/circles` route behind `requireCircleAccess()`. It did not bring the
member-facing surface along. The result was a contradiction **this lane authored**: `/commons/join`
asked an unauthorized visitor to paste an invite token **and to choose a Circle consent mode**, then
POSTed both to an endpoint already committed to answering 403.

The consent half is the serious half. Asking someone for a sharing decision about a relationship they
cannot enter **collects a sovereign act the system has no standing to receive**.

### 2.2 Founder ruling — STATE CLOSURE ON PAGE

> Do not delete the `/commons/join` route. While Circle release access remains closed, an
> unauthorized visitor must not be asked to: enter or confirm an invite token; choose a Circle
> consent mode; submit a join action that is guaranteed to return 403. **The page and the API must
> tell the same truth.**

### 2.3 What was built

`app/commons/join/layout.tsx` (new) — a server gate calling `requireFounder()`, rendering
`FounderGateScreen` for both the 401 and 403 cases. The page component never renders while access is
closed, so nothing is solicited and nothing is submitted.

Two choices worth naming:

- **The address stays reachable.** An invite link that 404s tells a visitor nothing true. `public:
  true` in the access matrix is unchanged; what changed is that the address no longer **solicits**.
- **401 is not redirected to `/signin`.** A redirect would imply that signing in leads to joining.
  While the cohort is unauthorized that is untrue for almost everyone who would follow it. The
  closure is stated once, and sign-in is offered as an *exit*, not imposed as a *step*.

`config/accessMatrix.ts` — the `/commons/join` entry now records DECLARED vs ENFORCED in the same
shape as `/labtools` and `/commons/circles`. The matrix has no founder concept, so the gate lives
where it can; the note says so rather than letting a reader infer that `public: true` is the whole
truth.

### 2.4 I-03 is preserved deliberately

The closed surface **reads no invite**. It does not query `circle_invites`, does not call
`joinWithInvite`, and behaves identically whether the URL carries a valid token, an invalid token, or
none.

> **Before Circle access is authorized, a valid token and an invalid token remain indistinguishable
> to an unauthorized visitor.**

C21 asserts both halves — that the surface solicits nothing **and** that it validates nothing —
because they are different wrongs with different victims.

### 2.5 I8 convergence note — not a defect today

`/commons/join` currently checks `requireFounder()`, while the API checks `requireCircleAccess()`.
Those agree **today** only because Circle API authority is itself founder-only while the cohort is
unauthorized.

⛔ **When `CIRCLE_ACCESS_MEMBER_IDS` is constituted at I8, `/commons/join` must migrate from its
`requireFounder()` surface check to the same Circle-access authority**, or the page and the API will
disagree again — the exact shape of I-02, one posture later. Recorded as an I8 obligation.
**Do not change it now.**

### 2.6 The API gate is unchanged

⛔ A Next.js layout **does not run for a route handler**. This gate closes a surface, never a door.
`requireCircleAccess()` remains the authorization. Nothing in this stage relaxes it, and C22 exists so
that a future session cannot mistake the page gate for the API gate — which is precisely the shape of
B-01, the gap R1 closed.

---

## 3 · Verifier extension

Nine new **named required obligations**. Under FR-14 the coverage floor is a named set, never a
total: **63 required obligations**, up from 54. The number is descriptive; the named set is the law.

### Group C — source and structure

| ID | Obligation |
|---|---|
| **C20** | I-02 · `/commons/join` checks authorization and acts on it before rendering a join surface |
| **C21** | I-02/I-03 · the closed surface solicits nothing (no form, no input, no consent mode) **and** reads no invite |
| **C22** | I-01 · the join door goes through `requireCircleAccess()`, does not resolve identity directly, and can express a reinstatement refusal |

### Group T — live semantics on rolled-back fixtures

Driving the real `joinWithInviteWithClient()` against a **real, live, unrevoked** invite. `mB` was
removed from `circle` by T3d and is active in `otherCircle`.

| ID | Obligation |
|---|---|
| **T10a** | a valid live invite does **not** reinstate a removed member (`REINSTATEMENT_REQUIRED`) |
| **T10b** | standing remains `removed` — **no write occurred**, not merely a thrown error |
| **T10c** | the FR-05 removal record is **intact and unchanged** after the refusal |
| **T10d** | the **same live invite still admits an independently eligible member** — the invitation was not collateral damage |
| **T10e** | the refusal reaches **no other Circle** |
| **⭐ T10f** | a **real `removeMemberWithClient()` act landing between invitation evaluation and the membership mutation** still defeats the invitation — refusal, standing stays `removed`, removal record intact |

**T10d** makes the founder's first correction falsifiable: a session that "fixes" reinstatement by
revoking the token passes T10a–T10c and **fails T10d**.

**T10f** makes the second one falsifiable. It is constructed deterministically, not concurrently — a
second connection would need committed fixtures and would break this verifier's rollback-only
consequence contract. An `InviteClient` wrapper delegates every statement to the same rolled-back
transaction, and on the membership `INSERT` — the moment before the mutation — it first runs the real
`removeMemberWithClient()`:

```
join crosses the invitation threshold
  ↓
real FR-05 removal is enacted
  ↓
join reaches the membership mutation
  ↓
the generic invitation MUST lose
```

A candidate that refuses via a precheck passes T10a–T10e and **fails T10f**. That is the whole point
of the obligation.

---

## 4 · Standing of this stage

| | |
|---|---|
| ✅ I-01 repaired in code | `lib/circles/inviteService.ts`, `app/api/circles/join/route.ts` |
| ✅ I-02 repaired in code | `app/commons/join/layout.tsx`, `config/accessMatrix.ts` |
| ✅ Verifier extended | C20–C22, T10a–T10f; floor 54 → **63** |
| ⛔ **NOT VERIFIED** | this session has **no `DATABASE_URL` and no `node_modules`**. The verifier was not run, and `npm run typecheck` was not run. |
| ⛔ **NOT DEPLOYED** | production unchanged. No migration was authored in this stage; the schema is untouched. |
| ⛔ **I1 DESIGN NOT OPENED** | the founder conditioned I1 on a **full verifier pass**. A pass has not been observed. Jarvis does not open I1 on an unrun gate. |

**Verified ≠ deployed. Implemented ≠ verified.** The evidence of record for this stage will be a
founder-run full verifier pass reporting `0 failed` **and** `63/63 required obligations discharged by
PASS`, per FR-14.

---

## 5 · Carried forward, not decided here

| | |
|---|---|
| **CA-08** | does a rejoining member recover prior standing? ⛔ untouched — `left` is not `removed` |
| **CA-10** | removal review institution — a refusal today is a full stop, not an appeal |
| **CA-15** | facilitator assignment pathway — still no code path writes `facilitator` |
| **D-I3** | cohort mechanism at I8; identities only at cohort authorization. ⛔ `FOUNDER_MEMBER_IDS` untouched |
| **I8 obligation** | converge the `/commons/join` page gate with Circle-access authority when `CIRCLE_ACCESS_MEMBER_IDS` is constituted (§2.5) |
