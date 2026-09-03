# Productizing the coaching platform

**Date:** 2026-09-02 · **Status:** assessment — authorizes no change
**Question:** what stands between the Now What? build and a coaching platform sellable to other practitioners?

---

## 0. The product split (founder ruling, 2026-09-02)

Two products, not one. This resolves a tension that had been costing design time: Larry was being asked to be the design client for a product whose value proposition exceeds what he wants.

| | **Now What?** | **Soullab practitioner product** |
|---|---|---|
| Core model | Branded relational MAIA | Full practitioner environment |
| Primary gesture | **Talk** | Work within a coaching relationship |
| Visible surfaces | **Talk · Return · Keep** | Rooms + richer coaching surfaces |
| Organization | Lightweight session history and categories | Practitioner-defined architecture |
| Practitioner UI | **None** | Yes |
| Intelligence | Mostly invisible | May be explicitly surfaced |
| Demo | `now-what-larry-simple.html` | `part2-rooms-mockup.html`, `part2-chatbot-mockup.html` |

**Keep is the one piece of the sophisticated architecture that belongs in even the simplest version.** Conversation gives Now What? immediacy; Keep gives it continuity and ownership. Without it Larry has a branded chatbot. With it he has a relational place his clients return to — and he never has to understand the machinery that makes it possible.

> ### ⚠️ Invitation-carried `fieldContext` is transitional routing context, not practitioner-membership authority.

Three separate facts, and conflating them is how a shortcut becomes an architecture:

| | |
|---|---|
| **Authentication** | establishes **who** the member is |
| **The invitation** | establishes **which** experience was requested |
| **Neither** | proves durable membership in a practitioner's field |

`/now-what/conversation` (Lane B, shipped 2026-09-02) is reached through an invitation carrying `fieldContext` — exactly how Now What? invitations already operate. It is the bounded delivery path for the Larry conversational experience, **not** the Larry tenancy model.

**What this means today:** the public `/now-what/welcome` sign-in cannot know a member belongs to Larry's field. So `welcome → sign in → Larry conversation` is **not solved**, and must not be claimed. The honest path is `invitation → existing auth → conversation`.

**Lane A, next:** a `practice_field_members` relation — field, member, status, role, joined_at — rather than a `field_id` column on `members`, because a member may participate in more than one practitioner or program field over time. Server-side resolution then answers *"given this authenticated member, which field contexts are they entitled to?"*, and `welcome → sign in → resolve membership → the right experience` becomes trustworthy. That seam serves both products, so it is not Larry-specific debt — it is the multi-practitioner architecture.

Two rules hold the boundary:

- **Categories are archive organization, never product navigation.** A title and category are suggested *after* a conversation and can be changed. The person is never asked to classify themselves before speaking. Conversation first, organization second.
- **Keep is member-authored significance, not everything MAIA remembers.** Memory sustains the relationship; Keep is the person saying *this matters to me*. Collapsing the two would turn a drawer into a dashboard.

Both run on the same architecture. Memory, retrieval, the room ontology and the coach field remain live under the simple cut as **capabilities of the conversation, never destinations in the interface.**

**Nothing built so far is wasted.** The sophisticated environment stops being a thing to persuade one customer to want and becomes the product sold to practitioners who already want it. The assessment below is about that product.

---

## 1. The finding

**The platform is already multi-practitioner. Larry is a tenant, not the architecture.**

| Evidence | |
|---|---|
| Tenancy seam | `fieldContext` across **52 files**; `practice_fields`; practitioner portal / caseload / settings / themes migrations |
| Relational core | `lib/coachField/*`, `lib/relationship/scope.ts` — practitioner⇄client identity is already generic |
| Larry coupling | 22 runtime files mention him; **nearly all are comments**. His soul portrait is already commented out of `lib/soulPortrait/registry.ts` |

⛔ **Do not fork.** A fork rots within two releases and doubles the governance surface. Larry becomes the first configured field of one product.

---

## 2. What you are actually selling

Not a flourishing framework. **Relational infrastructure that a practitioner brings their own method to.**

The differentiated assets, all built and live:

| Asset | Where | Why it is hard to copy |
|---|---|---|
| Member-authored sharing | `lib/coachField/bringForward.ts` | Permission is a third object with opaque lineage — the source stays unreachable from any practitioner-scoped query. Not a flag on a row. |
| Return continuity | `lib/nowWhat/carriedThread.ts` | One act, labelled by what it is. What the member sees and what the room is told are the same by construction. |
| Non-inference | `lib/nowWhat/livedRelation.ts` | A relation exists only because the member walked back through the door. Nothing downstream may read it as progress. |
| Response grammar | `lib/nowWhat/roomGrammar.ts` | Every turn must be impossible to send unchanged to another person. |
| Suppressible symbolic register | same | The register can be withheld where it is contraindicated. |

**Positioning:** *other coaching software manages clients; this sustains a developmental relationship.*

---

## 3. The one thing you cannot sell

⛔ **The flourishing taxonomy.**

The six domains are Larry-derived, **unratified**, and **unlicensed** — the Materials Agreement is unsigned and Attachment A §3 is empty. They may not ship to another practitioner in any form: not as defaults, not as an onboarding suggestion, not as seed data.

**This constraint improves the product.** A generic platform with a fixed taxonomy is a framework competing with its buyer's method. A platform with **no** taxonomy, where each practitioner declares their own vocabulary, is infrastructure the buyer's method runs on.

> **The practitioner brings the method. The platform brings the relationship.**

Required for the practitioner product: make `flourishing_dimension` per-field configuration rather than a global CHECK constraint. That is the single largest technical item, and it is what makes the product sellable rather than what makes it late.

---

## 4. Work to package

| # | Item | Size |
|---|---|---|
| 1 | Replace hardcoded practitioner strings with field config (`NowWhatRoom.tsx:988` and siblings) | small |
| 2 | Per-field flourishing vocabulary; retire the global constraint | **largest — §2** |
| 3 | Product name distinct from *Now What?*, which is Larry's (provenance class unestablished) | small, blocking on naming |
| 4 | Field provisioning: create a practitioner field without a migration | medium |
| 5 | Neutralise Larry-named comments in shared modules | trivial, do last |
| 6 | Extend the Co-Lab release gate to multi-field boundary checks | medium |

Items 1 and 3–5 are packaging. Item 2 is the product decision. Item 6 is the safety floor.

---

## 5. Sequence

1. **Freeze nothing tonight.** Tomorrow's encounter is evidence for this decision too — watch whether Larry values the *method* or the *relational infrastructure*. His answer sizes the market.
2. Name the generic product.
3. Per-field vocabulary (§2) — everything else waits on it.
4. Field provisioning, then string extraction.
5. Extend the release gate before any second field goes live.

---

## 6. What this does not change

Attachment A §3 stays empty. The taxonomy stays unratified. Transcript custody stays unresolved. **Selling the platform to others does not require any of Larry's material — and must not include it.**

---

## 7. Carry-forward after the first Larry encounter (2026-09-03)

**Posture correction.** The thin conversation is not a demo of what Larry might want. It is a **response to what did not work for him in the existing experience** — which was the practitioner product, not this one. So his prior complaints are **not requirements against the new product** until he has actually encountered it.

Working name for the lane: **Larry response build** (not "tomorrow's demo" — that framing is stale).

### Sequence

1. **Reconcile the two branches — then the host.** ⚠️ Amended after the finding below: the host is downstream, not the problem.

   **Production runs `eeb3fbb6c`, which is not on main.** It lives on `claude/canonical-maia-turn-j92opb` — 7 commits and ~4,966 lines main does not have: the Canonical MAIA Turn programme (closed turn object, participation disposition contract, shadow deployment on `/list`, refusals 25–31, a witness script) plus the deploy tooling. The seven "uncommitted" files on minisforum **are that branch's work**, so reconciling the branch cleans the host.

   ⛔ **Deploying main would roll production backwards** — off a live shadow deployment and seven constitutional refusals another lane is mid-flight on. Do not deploy either branch until they are merged properly, through the four required status checks (both pushes of 2026-09-03 bypassed them, so CI has not witnessed those SHAs).

   Note the convergence: that branch and this one fixed the same compose provenance defect independently and reached the same shape — `GIT_COMMIT` only under `build.args`. Lucky, not designed. Two agents deploying to one production host from an unversioned checkout is the underlying condition; the deploy lock serializes them but nothing coordinates *what* they deploy.
2. **Deploy and witness `/now-what/conversation`.** Prove the actual path end to end.
3. **Let Larry encounter the thin product.** Only then can his feedback be sorted into three classes: complaints that vanish because the practitioner UI vanished · actual conversational defects · genuinely missing capabilities.
4. **Address his requests from evidence**, not from impressions attached to a retired UX.

### His three open items

**Conversational identity.** `"You are MAIA"` is hardcoded in three system prompts (`app/api/now-what/interview/route.ts` 107, 144, 161). That is the real boundary; the visible label is cosmetic. The solution is **field-configurable conversational identity**, never a Larry-specific string replacement. Larry decides whether it is called Now What?, carries another name, or has no persona-name at all.

**Uploads — three classes, not one bucket.** An attachment must not become durable memory merely because someone dropped it into a chat:

| Who uploads | Where it lands | Why |
|---|---|---|
| **Practitioner** | field corpus, persistent | a deliberate act of publishing into their field |
| **Client** | conversation context, that conversation only | dropping a file is not a decision to be remembered |
| **Client, then Keeps it** | durable client-held material | the member's own act of significance |

This is the Memory/Keep distinction (§ above) applied to files: **memory sustains the relationship; Keep is the person saying *this matters*.** A generic upload bucket would collapse them.

**"Glitches."** Do not repair an unspecified complaint against a surface he has never used — `/now-what/conversation` has never been deployed, so he met the practitioner product. Removing navigation, framing transitions and room state may remove the perceived glitch outright. After deployment, ask for reproduction **against the new surface**; then it becomes an engineering observation rather than an impression.

### What this protects

Larry's dissatisfaction no longer determines the architecture of the practitioner product. It can inform his branded conversational product without collapsing the two back together.
