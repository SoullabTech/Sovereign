# MLX Pre-flight Verification — R2 Relationships · Soul Portrait reach

**Date:** 2026-08-25 · **Status:** source-level verification complete · **runtime walk NOT performed**
**Blocks:** MLX-03 composition of My Life

---

## 0 · What was and was not done

**Not done, and why.** The authenticated production walk could not be performed from this session: `ssh` is
not installed in the container and `soullab.life` is not in the network egress allowlist. **No claim below
rests on runtime behaviour.** The executable walk kit is in §3 for a session with access.

**Done.** A full source trace of the Relationships chain (page → API → auth → SQL → migrations → generator →
governing canon) and of Soul Portrait's access model. Two findings emerged that a functional walk would not
have surfaced, and one of them changes R2's disposition.

---

## 1 · FINDING A — Relationships: the functional chain is sound; **build authority is closed**

### 1.1 What is sound

| Check | Result |
|---|---|
| Auth on every handler | ✅ `getCurrentSession()`; 401 without `memberId` |
| Member scoping | ✅ every query filtered by `member_id`; nested resources re-check ownership |
| Archive filtering | ✅ `archived_at IS NULL` |
| Tables exist | ✅ `member_relationships`, `relationship_field_state`, `relationship_entries` all in `20260403000001_relationship_field_v1.sql` |
| Generator discipline | ✅ `relationalCheckin.ts` states *"No diagnosis. No advice. No optimization"*, *"too interpretive = invasive"*, and maps free-form tone to a **closed canonical vocabulary** |

On functional grounds this would very likely walk GREEN.

### 1.2 What blocks it anyway

`docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md` — **RATIFIED EFFECTIVE 2026-08-14** — states, in its own
header:

> ⛔ **Ratification binds this TEXT, not the system's conformance to it.** It does not ratify runtime claims,
> historical database interpretations, or any implementation as conforming.
> ⛔ **BUILD AUTHORITY REMAINS CLOSED.**

The implementation predates it: `20260403000001_relationship_field_v1.sql` is **April 2026**; the constitution
is **August 2026**. It was written knowing this implementation exists, and declined to bless it.

### 1.3 The named, unremedied fault — verified in code

The constitution states a specific fault:

> **BOUNDARY.** An observation or an inference may never silently become a declaration. The system may not
> author into the member's relational record any statement of relational condition that the member has not
> made. **That MAIA today has a write path for *rupture* which no member-facing surface offers is an inversion
> of authorship, stated here as a constitutional fault — the remedy is not designed here.**

**Verified, 2026-08-25:** `app/api/relationships/[id]/entries/route.ts:81` accepts
`['note','reflection','threshold','rupture','repair']`. The only `rupture` affordance anywhere in the member
UI belongs to `components/MaiaFeedbackWidget.tsx` — feedback about *MAIA's own turns*, a different system
entirely. **The relationship room offers the member no way to declare a rupture, while the system can write
one.** The fault stands.

**Related, same class:** every check-in persists MAIA-authored `maia_reflection`, `pattern_hint`,
`field_tone_snapshot` and `suggested_movement` into `relationship_entries`, and upserts `field_tone` /
`dominant_pattern` into `relationship_field_state`. These are Reflection-layer artifacts stored as durable
relational state. Whether they cross into *declaration* is exactly the question the constitution reserves —
**and it is not a question a walk answers.**

### 1.4 Disposition — R2 is not walk-blocked, it is **governance-blocked**

R2 was ruled *"verify, then restore."* The verification found that the blocker is **not** evidence of
function. Restoring Relationships to the House would surface a room whose governing constitution says build
authority is closed and which contains a named, unremedied authorship inversion.

**A walk cannot clear this. Only a founder act can.** Options, for ruling:

| | Path | Cost |
|---|---|---|
| **A** | **Open build authority + remedy the fault** — give the member a rupture affordance (and audit the other system-authored fields against the declaration boundary), then walk, then restore. | Real work on the launch path; the honest version of the differentiator. |
| **B** | **Restore read-only / reduced scope** — surface only what the member authored, with no system-authored relational state, deferring the faulted write paths. | Smaller room, no constitutional violation, ships. |
| **C** | **Forward voice for launch** — landing section 07 describes possibility, no room depicted, Relationships stays out of My Life until the constitution's remedy is designed. | Loses the differentiator as a place. |

**Recommendation: B for launch, A as the real fix.** B is buildable inside the launch window, honours the
constitution as written, and still gives the member a relational place. It also matches the pattern the
project already uses elsewhere — ship the member-authored layer, defer the system-authored one.

---

## 2 · FINDING B — Soul Portrait is not a member destination

MLX-02 placed **Soul Portrait** under `MY SOULLAB → MY LIFE`. **The access model contradicts that.**

| Route | Access, per its own header |
|---|---|
| `/api/soul-portrait/generate` | *"practitioner (owner) only"* |
| `/api/soul-portrait/mine` | *"the authenticated **practitioner's** OWN portrait drafts"* |
| `/api/soul-portrait/[slug]/send` | *"practitioner (owner) only. Path B Gate 4"* — emails `/soul-portrait/view/{slug}` |
| `/soul-portrait/view/[slug]` | the recipient-facing published view |

**Soul Portrait is something a practitioner makes and sends — not a place a member keeps.** It has no entry in
`maiaNav.ts`, and no member-facing surface links to it.

**Correction required to the MLX-02 spine:**

```
   BEFORE                              AFTER
   MY LIFE                             MY PRACTICE
     └── Soul Portrait  ✗                └── Soul Portrait        (the practitioner authors and sends)

                                       MY LIFE
                                         └── (a received portrait, if a member surface
                                              for it is ever built — none exists today)
```

**Consequence for the landing page:** section 08 ("Know yourself") lists Soul Portrait as a member capability.
**It is not one.** Either the section drops it, or it is described as something a practitioner may make with
you — which is a different and more accurate story.

---

## 3 · The walk kit — for a session with production access

Everything below still needs running, for the parts §1 could not settle (empty state, mobile, dead routes).
**Run only after the R2 governance ruling**, since path B changes what is walked.

```bash
# 0. Provenance
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'

# 1. Schema present
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c "\dt member_relationships|relationship_field_state|relationship_entries"'

# 2. Is the room used at all today?
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT count(*) AS relationships, count(DISTINCT member_id) AS members FROM member_relationships WHERE archived_at IS NULL;"'

# 3. THE FAULT — has the system ever authored a rupture the member did not declare?
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
  "SELECT kind, count(*) FROM relationship_entries GROUP BY 1 ORDER BY 2 DESC;"'
```

**Then, in a browser as a real authenticated member:**

| # | Step | Pass |
|---|---|---|
| 1 | House → Relationships | arrives; **real empty state**, not a broken panel |
| 2 | Create in each realm (outer/inner/transpersonal) | persists; listed |
| 3 | Check-in | writes; reflection returns |
| 4 | Entries / history | round-trips |
| 5 | Constitutional read of what is shown | nothing characterizes the member or the other person; no declaration the member did not make |
| 6 | Consent boundary (`relationship-spaces` threshold/consent) | behaves as specified, **or is explicitly deferred** |
| 7 | Mobile | usable at 375pt |
| 8 | Return to House | no dead routes, no misleading affordances |

**Query 3 is the important one.** A non-zero `rupture` count with no member-facing affordance is the
constitutional fault having already occurred in production data — which would make the remedy urgent rather
than theoretical.

---

## 4 · What this changes

1. **R2 is governance-blocked, not walk-blocked.** Needs a founder ruling on A / B / C before a walk is worth
   running.
2. **Soul Portrait moves out of My Life** in the MLX-02 spine, and off the landing page's member capabilities.
3. **MLX-03 may proceed** on everything else. My Life composes as Living Field · Journal · Anchor, with
   Relationships drawn only per the R2 ruling.
