# I0 · Smallest founder decision docket before I1–I9

**Stage:** `CIRCLE-05 · INVOKE`, I0 complete. ⛔ **I1 NOT STARTED.**
**Basis:** `CIRCLES_INVOCATION_SUBSTRATE_CENSUS.md` (READ ONLY — nothing implemented).

---

## Tier 1 · Blocking, and two are defects in ratified law

### 🔴 I-01 · Removal does not revoke invite tokens
**FR-05 says removal must cut access. Today it cuts access until the next join request.** Tokens are
Circle-wide, never expire, and `joinWithInvite`'s upsert restores a removed member to `active`. The
only remedy is `regenerateInvite` — **creator-only**, and it invalidates the link for everyone.

**Recommendation:** invites become **per-invitee** or removal revokes live tokens, plus an expiry.
**This is a repair against ratified law, not new INVOKE surface** — it can land before I1.
→ **AUTHORIZE AS A REPAIR NOW / FOLD INTO I1 / OTHER**

### 🔴 I-02 · `/commons/join` invites a consent decision its API refuses
A public page collects a token **and a consent choice**, then the gated API returns 403. **R1 created
this** — correctly closing the API without bringing the member-facing surface along.
**Recommendation:** state the closure honestly on the page, or close the page, before any cohort.
→ **STATE CLOSURE ON PAGE / CLOSE THE PAGE / OTHER**

### D-I1 · What is a declared interest?
**Nothing reusable exists.** Every "interest" in the codebase is inferred and FR-06-barred. This is
built from zero. Needed before I1: is a declaration free text, a chosen term from a vocabulary, or
member-authored-then-matched? **Free text cannot be matched without inference** — which is the
tension FR-06 puts at the centre of discovery.
→ **FREE TEXT / CONTROLLED VOCABULARY / HYBRID**

### D-I2 · Which Commons is *the* Commons?
Three existing substrates carry the name; **none matches FR-02**, and two are built on the status
mechanics FR-08.7 forbids (counts · tiers · points · `min_cognitive_level` gating).
**Recommendation: build the FR-02 Commons fresh; do not extend `community_*` or
`commons_contributions`.** Leave those surfaces alone in their own right.
→ **BUILD FRESH / EXTEND EXISTING / RENAME ONE OF THEM**

### D-I3 · Cohort authority — create `CIRCLE_ACCESS_MEMBER_IDS`?
On the `labAccess.ts` shape: union with founder, fails closed, confers nothing beyond the Circle
door. `circleAccess.ts` already names it as the seam.
**Recommendation: yes, when a cohort is authorized — not before.**
→ **AUTHORIZE NOW / AT COHORT TIME / OTHER**

## Tier 2 · Needed during I1–I9, not before

| # | Question | Note |
|---|---|---|
| **D-I4** | **Outer membrane fields** — *purpose*, *way of participating*, *what stays private* have no columns. Only `name` + `description` exist | doctrine asks for four panes; three are unbuildable today |
| **D-I5** | **Is member count outer or interior?** It is also the FR-11 constitution state, so publishing it pre-entry discloses whether the field is plural | recommend **interior** |
| **D-I6** | **Facilitator assignment** (CA-15) — a Circle's authority is currently fixed at creation, permanently: `created_by` is unchangeable and `facilitator` unassignable | FR-12 forbids widening or auto-promotion |
| **D-I7** | **Invite expiry** — none exists | pairs with I-01 |
| **D-I8** | **Rejoin standing** (CA-08) — reactivates the prior row; revoked shares and tombstoned responses stay gone | is that the intended shape? |
| **D-I9** | **Retire the inert columns** `visibility` / `invite_enabled`, or constitute them | ⛔ meanwhile do not build to them |

## Tier 3 · Recorded, not blocking

- **I-03** — a non-founder cannot distinguish an invalid token from a valid one (gate refuses first).
  Accidentally good for token privacy; worth making deliberate.
- The `community_*` and `commons_contributions` status economies are **not violations in their own
  surfaces**. Only importing them into Circles would be.
- ⛔ Nothing is classed as a violation whose semantics were never constituted (`visibility`,
  `invite_enabled`, the legacy Commons substrates).

---

## The shape of what remains

> **The membrane is verified. The invitation is not built.**

Every boundary a Circle needs to be safe now passes on candidate. What INVOKE adds is almost
entirely **new**: interest declaration, the FR-02 Commons, outer-membrane fields, facilitator
assignment, invite expiry. The reusable inventory is small and honest — the access-gate shape, the
invite mechanism, the verified scoping, and the verifier itself.

**Two exceptions worth separating from that work:** I-01 and I-02 are **defects against already-
ratified law**, not new surface. They can be repaired before I1 opens.

```text
I0        COMPLETE — read only, nothing implemented
I1–I9     NOT STARTED
DEPLOY    NOT AUTHORIZED
COHORT    NOT AUTHORIZED
```
