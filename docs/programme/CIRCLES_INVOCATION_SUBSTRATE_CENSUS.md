# CIRCLE-05 · I0 — Existing Invocation Substrate Census

**READ ONLY.** Nothing implemented, migrated, deployed, invited, or altered.
**Epistemic kind: OBSERVED (source + schema, this checkout).** No production DB access this session.
**Standing:** REPAIR closed · VERIFY full candidate pass (54/54) · INVOKE open, I0 only.

---

## §1 · Interest declaration — **NONE EXISTS THAT FR-06 PERMITS**

| Candidate | What it actually is | FR-06 verdict |
|---|---|---|
| `living_field_affinities` (`20260702000001`) | **System-created from private memory atoms.** `created_by DEFAULT 'system'`, `affinity_score NUMERIC`, `evidence_reason` ("register:developmental", "lens:fire", "source_type:dream"). Written by `lib/maia/living-field/indexAtom.ts` | ⛔ **BARRED ABSOLUTELY.** Inferred psychological material derived from atoms. Not a Circle-discovery input under any circumstances |
| `recurring_interests TEXT[]` (`20241202000001` session memory) | inferred from sessions | ⛔ **BARRED.** Inferred |
| `community_user_stats.contribution_tier` | derived from activity counts | ⛔ Not an interest at all — a status tier (§2) |

> **⭐ There is no explicit, member-authored interest declaration anywhere in this codebase.**
> Everything that looks like "interests" is inferred. **I1 builds this from zero** — which is the
> right outcome, because reusing any of the above would violate FR-06 on its first day.

**Consequence:** the north-star verb ("find one another around a shared interest") has **no
substrate and no reusable precedent.** Its input must be created as an explicit member act.

## §2 · Commons — **the name denotes THREE different existing things, none of them the ratified one**

| # | Substrate | What it is | Relation to ratified Commons (FR-02) |
|---|---|---|---|
| A | `community_territories · community_posts · community_comments · community_hearts · community_user_stats · community_bookmarks` (`20251230100000`) | a **forum**: threaded posts, hearts, bookmarks, territories | ⛔ different concept |
| B | `commons_contributions · contribution_levels · contribution_saves · contribution_usages` (`20260120000001`) | a **curated contributions library** with a review queue | ⛔ different concept |
| C | `20260213000004_circles_commons.sql` | **the Circles migration.** "Commons" is in the filename only | ⛔ not a Commons |
| D | **FR-02 Commons** — *a larger shared-interest ecology of persons and Circles* | ratified ontology | **matches none of A, B, C** |

⛔ **Same name, different concepts.** Founder instruction honored: no assumption of equivalence.

### ⭐⭐ The decisive finding: existing Commons is built on the mechanics FR-08.7 forbids

```text
community_user_stats     post_count · comment_count · heart_received_count
                         heart_given_count · breakthrough_count
                         contribution_tier · contribution_points
contribution_levels      level 0|1|2 · accepted_count · endorsed_by
community_territories    min_contribution_tier · min_cognitive_level   ← ACCESS gated by measured activity
```

FR-08.7 bars *"counts, scores, ranks, streaks, badges, leaderboards and trust levels"* from Circle
social surfaces. **Substrate A/B is a status economy**, and `min_cognitive_level` gates entry on a
measured attribute of a person.

> This is exactly the Discourse/Mighty distortion named in the R9 comparison — *trust based on
> measurable activity is contrary to Circle equality* — already built and sitting in the repo under
> the word "Commons."

**⛔ Reusing A or B as the Circle Commons would import that economy on day one.**

## §3 · Circle discovery — **ZERO, and the schema implies otherwise**

`listMyCircles()` is the only listing function. No `listAllCircles` / `discoverCircles` /
`searchCircles`. Verifier **C9** asserts this and passes.

| Surface | State |
|---|---|
| `circles.visibility` (`'invite_only' \| 'open'`) | **INERT** — selected, never written after default, never enforced. `'open'` has no meaning in any code path |
| `circles.invite_enabled` | **INERT** — same |
| invite link | the **only** way a non-member reaches a Circle |
| `/commons/join` | public page, token entry (§9) |
| Circle list API | returns **only** the caller's own active memberships |
| direct URL | `getCircleWithMembership` → `FORBIDDEN` |
| search | none |

⛔ **Do not build to the inert columns.** They encode a discovery model that was never designed and
that FR-06 would now constrain differently.

## §4 · Circle creation

```text
app/commons/circles/new/page.tsx  →  POST /api/circles  →  createCircle()  →  transaction:
    INSERT circles (created_by, name, description)
    INSERT circle_memberships (role='helper', status='active', consent_mode='manual', consented_at=NOW())
```

| | |
|---|---|
| Who may create | **any member reaching the API** — which today means founder-allowlist only (R1) |
| Creator role | **`helper`** — not facilitator (FR-12 forbids auto-promotion) |
| Defaults | `visibility='invite_only'`, `invite_enabled` default, `consent_mode='manual'` **at creation** |
| Invitation behavior | **none** — creating a Circle creates no invite; `regenerateInvite` is a separate act |
| Automatic assumptions | creator is **immediately an active member with consent already recorded**. Under FR-11 the new Circle is **FORMING** (1 member) |

⛔ `helper` untouched, as instructed.

## §5 · Invitations and joining — state machine as it exists

```text
                    regenerateInvite(circleId, memberId)
                    ├─ creator only  (circles.created_by === memberId, else FORBIDDEN)
                    ├─ revokes ALL prior live tokens for the Circle
                    └─ INSERT circle_invites (48-char token from 2 UUIDs)
                                    │
                    invite URL: /commons/join?token=…
                                    │
                    joinWithInvite(token, memberId, consentMode)
                    ├─ token exists AND revoked_at IS NULL, else INVALID_INVITE
                    └─ INSERT circle_memberships (role='member', status='active',
                         consent_mode=$3, consented_at=NOW())
                       ON CONFLICT (circle_id, member_id)
                         DO UPDATE status='active', consent_mode=$3, consented_at=NOW()
```

| Question | Answer |
|---|---|
| Who creates/regenerates | **creator only.** Not helper, not facilitator |
| Circle-specific | ✅ token → exactly one `circle_id` |
| Expiry | ⛔ **NONE.** `circle_invites` has no `expires_at`. A token is valid forever until revoked |
| Revocable | ✅ but **only by regenerating** — no explicit "revoke without reissue" path |
| Does the token grant anything by itself | ⛔ **No** — it is a **bearer credential** that converts to membership on submit by whoever holds it. Possession ⇒ membership |
| When membership is written | at `POST /api/circles/join`, not at link creation |
| Consent captured | `consentMode` (`manual` \| `not_now`) chosen on the join form |
| Rejoin | **reactivates** the prior row; previously revoked shares stay revoked; **tombstoned responses stay tombstoned** |
| Left / removed members | 🔴 **see the finding below** |

### 🔴 I-01 · Removal does not revoke invite tokens

`removeMemberWithClient()` cuts access, revokes shares, tombstones responses, records grounds —
**and does not touch `circle_invites`.** A live token is Circle-wide, not per-person.

> **A removed member holding (or re-finding) the still-live invite link can rejoin immediately, and
> `joinWithInvite`'s upsert restores them to `active`.**

FR-05 says removal **must cut access**. Today it cuts access **until the next join request.** The
only remedy available to a facilitator is `regenerateInvite` — which is creator-only, and which
invalidates the link for *everyone*. **Not repaired (I0 is read-only). Highest-severity finding.**

## §6 · Facilitator authority and role powers

**Writers of `role = 'facilitator'`: NONE.** Confirmed across `lib/`, `app/`, `database/migrations/`.
`createCircle` → `helper`; `joinWithInvite` → `member`. **No code path assigns `facilitator`.**
(CA-15, and FR-12 forbids fixing it by widening or auto-promotion.)

| Power | member | helper | facilitator | creator (orthogonal) |
|---|---|---|---|---|
| read feed / members / pulse / inquiries | ✅ | ✅ | ✅ | — |
| share, revoke own share, set own consent, leave | ✅ | ✅ | ✅ | — |
| respond to inquiry · withdraw own response | ✅ | ✅ | ✅ | — |
| **open an inquiry** | ⛔ | ✅ | ✅ | — |
| **close an inquiry** | opener only | opener only | opener only | — |
| **remove a member** (FR-05) | ⛔ | ⛔ | ✅ | — |
| **regenerate invite** | ⛔ | ⛔ | ⛔ | ✅ **only** |

> ⭐ **Two orthogonal authority axes exist today — `role` and `created_by` — and neither is
> assignable after creation.** The creator cannot be changed; the facilitator cannot be appointed.
> **A Circle's authority is fixed at the moment of creation, permanently.**

## §7 · Pre-release / cohort authority — the precedent exists

`lib/access/labAccess.ts` is the reusable shape, and it was written for exactly this problem:

```text
FOUNDER_MEMBER_IDS        the founder — founder-private surfaces
LAB_ACCESS_MEMBER_IDS     founding members — the internal laboratory
hasLabAccess(id) = isFounderMemberId(id) || LAB_ACCESS_MEMBER_IDS.has(id)
```

Properties worth copying: **union with founder** (never listed twice, never locked out) · **fails
closed** (unset ⇒ nobody) · **confers nothing beyond its own door** · **an explicit ruling against
misclassifying someone as founder to get them through a gate** (2026-09-04).

**Smallest precedent capable of granting Circle-surface access without founder authority and
without Circle membership:** `CIRCLE_ACCESS_MEMBER_IDS` on this exact pattern, consumed only by
`lib/circles/circleAccess.ts` — whose header already names it as the future seam.
⛔ **Not created. I0 is read-only.**

## §8 · Outer membrane — what could safely precede entry

| Class | Fields |
|---|---|
| **SAFE OUTER FACTS** (exist, disclose no interior) | `circles.name` · `circles.description` · `circles.created_at` |
| **INTERIOR — must not cross** | member list · **member count** · feed · shared artifacts · inquiries and their questions · responses · pulse phase · `lastMovementAt` · constitution state |
| **UNAVAILABLE — doctrine asks for these and no column exists** | **purpose** · **way of participating** · **what stays private** · host identity as a declared fact · declared interests (§1) |

⚠️ **The doctrine's outer membrane is mostly unbuildable from current data.** Three of its four
named panes have no field. Only `name` + `description` exist, and `description` is free text never
constituted as a purpose statement.

⛔ **No social proof.** Member count is interior, not outer: it is also the FR-11 constitution state,
so publishing it pre-entry would disclose whether the field is plural.

## §9 · Closed / refusal UX — and a contradiction R1 created

| Surface | founder | authenticated non-founder | signed-out |
|---|---|---|---|
| `/commons/circles` | ✅ enters | GateScreen *"Circles is not open for v1"* | redirect `/signin?next=…` |
| `/commons/join` | ✅ page + submit | ✅ **page renders**, ⛔ **submit 403** | page renders, prompts sign-in, then 403 |
| invite URL `?token=…` | works | **page accepts the token, API refuses** | sign-in → same 403 |
| `/api/circles/**` | ✅ | **403** `"Circles is not open for v1"` | **401** |
| invalid invite | 400 `INVALID_INVITE` | 403 first — never reaches validation | 401 first |

### 🔴 I-02 · `/commons/join` invites an action its submit API refuses

`/commons/join` is `public: true` in the access matrix. It renders a token field, a **consent
choice**, and a submit — then `POST /api/circles/join` returns **403**.

> A person following a real invite link is asked to make a **consent decision** for a Circle they
> will not be allowed to join. The page's promise and the API's answer disagree.

**This contradiction is a consequence of R1** (before R1 the API would have accepted). R1 was
correct — enforced posture now matches declared posture — but the **member-facing surface was not
brought along.** ⛔ Not repaired: I0 is read-only, and the fix is an INVOKE design decision (close
the page, or state the closure honestly on it).

**I-03 (minor):** a non-founder never reaches invite validation, so an **invalid** token and a
**valid** one are indistinguishable — accidentally good for token privacy, and worth keeping
deliberately rather than by accident.

## §10 · Constitutional compatibility classification

| Behavior | Class | Note |
|---|---|---|
| Session-verified identity; membership scoping; consent + revocation cascade; contribute-before-see; tombstone; boundary cascade; pulse contract | **COMPATIBLE** | verified 54/54 on candidate |
| `circleAccess.ts` gate | **COMPATIBLE** | already names the cohort seam |
| `labAccess.ts` pattern | **REUSABLE WITH CHANGE** | copy the shape, new authority name |
| Invite tokens (Circle-specific, revocable) | **REUSABLE WITH CHANGE** | needs expiry + per-removal revocation (I-01) |
| `createCircle` → creator as `helper` | **COMPATIBLE** | FR-12 |
| `/commons/join` public page | **CONTRADICTS RATIFIED LAW** *(as a surface)* | I-02 — invites an action the gate refuses |
| **Removal not revoking tokens** | **CONTRADICTS RATIFIED LAW** | I-01 — FR-05 "removal must cut access" |
| `circles.visibility` / `invite_enabled` | **INERT LEGACY** | ⛔ do not build to them |
| `living_field_affinities`, `recurring_interests` as discovery input | **CONTRADICTS RATIFIED LAW** *(if so used)* | FR-06. ⚠️ **not a violation today — nothing uses them this way**; recorded as a bar, not an offence |
| `community_*` forum + `commons_contributions` status mechanics | **INERT LEGACY** *(for Circles)* | ⛔ not a violation in their own surfaces; **importing them into Circles would be** |
| Explicit interest declaration | **MISSING** | §1 — build from zero |
| Commons matching FR-02 | **MISSING** | §2 — three impostors, no match |
| Outer-membrane fields (purpose / way of participating / what stays private) | **MISSING** | §8 |
| Facilitator assignment | **MISSING** | §6, CA-15 |
| Invite expiry | **MISSING** | §5 |

⛔ Founder instruction honored: **nothing is called a violation whose semantics were never
constituted.** The `visibility`/`invite_enabled` columns and the `community_*` substrates are
legacy, not offences.

---

## Reuse vs. retire

| Reuse | Retire / do not extend |
|---|---|
| `circleAccess.ts` + the `labAccess.ts` shape | `circles.visibility`, `circles.invite_enabled` — inert, misleading |
| `circle_invites` mechanism (with expiry + removal revocation) | `community_user_stats`, `contribution_levels`, `community_territories` gating — **as Circle substrate** |
| `getCircleWithMembership` scoping; the whole verified membrane | `living_field_affinities` / `recurring_interests` **as discovery inputs** |
| The verifier and its 54-obligation floor | the `/commons/join` page **in its current form** |

**Build fresh:** explicit interest declaration · the FR-02 Commons · outer-membrane fields ·
facilitator assignment · invite expiry.
