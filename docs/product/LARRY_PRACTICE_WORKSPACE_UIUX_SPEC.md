# Larry Practice Workspace — UI/UX Design Specification

**Status:** DRAFT v1 — design object authored for evaluation (2026-08-03)
**Authorized by:** founder ruling 2026-08-03 — *author the specification as the design object*
**⛔ This document does NOT authorize:** implementation · deployment · client onboarding · pilot
execution · acceptance. Each remains a separate act requiring its own evidence and authorization.

---

## 0. Why this is its own design object

The pilot artifact asks *"does this experience work?"* This document must first answer *"what
experience are we intentionally creating?"* Reversing that order makes the pilot a discovery
mechanism for unresolved architecture — the failure shape this project has repeatedly named:

```
unclear relationship → implementation → evidence interpreted afterward
```

The sequence this document commits to instead:

```
relationship model → visibility boundaries → interface expression → human observation → acceptance
```

## 1. The relationship this surface supports

Larry is a practitioner. His clients are members with their own sovereign accounts and their own
relationship to MAIA that **predates and outlives** the practitioner relationship.

The workspace supports **one thing**: a practitioner and a client who meet, and who each carry
something between meetings. It is not a practice-management system. Per the standing constraint,
*administrative capability follows demonstrated practice, never defines it* — scheduling, billing,
and insurance are explicitly out of scope and must not be added to "complete" the surface.

**The between-sessions layer is the subject.** Not the session. Not the record.

## 2. The three visibility categories

Most systems model two states — visible and hidden. This surface requires three, and the third is
the one that must be designed rather than assumed:

| Category | Meaning | Design consequence |
|---|---|---|
| **Must be recoverable** | required for the relationship to have continuity at all | present by default, no gesture required |
| **May be recoverable with consent** | belongs to the member; the practitioner may see it only by member act | requires an explicit member gesture; default is private |
| **Must remain unrecoverable** | the relationship depends on this being unavailable | must be **unreachable by construction**, not hidden by a guard |

⭐ The third category is not a limitation on the product. It is a **precondition of the product**.
A client who believes the practitioner may be watching between sessions does not use the space
honestly, and the between-sessions layer is the entire value.

### 2.1 Initial assignment (proposed — requires ruling)

| Content | Category |
|---|---|
| That a practitioner–client relationship exists | must be recoverable (both parties) |
| Session occurrence (that a meeting happened, when) | must be recoverable (both parties) |
| Practitioner Notes | practitioner-only; **never** client-recoverable in Slice 0 |
| Client's own private reflection / journal / MAIA conversation | **must remain unrecoverable** to the practitioner |
| Client material the member explicitly shares | may be recoverable with consent |
| Sanctuary-mode content | **must remain unrecoverable**, absolutely, to everyone |

⛔ **Open, not decided here:** whether a client may ever see Practitioner Notes. The existing ruling
records *no client-of-record decision*; attaching notes to `practitioner_clients` was a scoped build
decision and the question stays open. This spec does not close it.

## 3. Practitioner doorway (Larry)

**Neutral before authentication.** Per the ratified door principle: *a door may adapt to the
relationship, but it must not reveal the relationship before the person enters.* Nothing on the
pre-auth surface may indicate that Larry has clients, how many, or who.

After entry, the doorway answers exactly three questions and no more:

1. **Who am I meeting with, and when?**
2. **What did I carry out of last time?** (his own Practitioner Notes — his authored material)
3. **What has this person chosen to share with me?** (member-authored, consent-gated, possibly empty)

⚠️ **(3) is empty by default and must read as legitimate when empty.** An empty state that implies
something is missing or that the client is non-compliant converts absence into pressure, which
reaches the client as surveillance by proxy. Copy must make emptiness unremarkable.

⛔ **Not in the practitioner doorway:** engagement metrics · activity indicators · last-seen ·
streaks · "client hasn't journaled in N days" · sentiment · risk scoring · any MAIA-generated
characterization of the client.

## 4. Client doorway

The client's doorway is **their own** doorway. The practitioner relationship is a *room in their
house*, not the house.

1. **This is my space** — unchanged by the existence of a practitioner
2. **I have a relationship with Larry** — visible, nameable, and severable by the client
3. **This is what I have chosen to share** — an explicit, reviewable, revocable list

⭐ **Member-authored continuity.** The member decides what becomes part of the shared relationship.
The practitioner never has ambient access between sessions. Sharing is an **act**, never a setting
that silently accumulates.

⛔ The client doorway must never present sharing as expected, encouraged, or beneficial. No nudges,
no completion states, no "Larry is waiting."

## 5. Relationship boundaries

- **The relationship is severable by the client, unilaterally, without explanation.** Severing must
  not notify the practitioner in a way that reads as a rebuke, and must not delete the client's own
  material.
- **The practitioner cannot initiate visibility.** There is no request-access gesture in Slice 0 —
  a request is a pressure, and pressure from a practitioner is not neutral.
- **The practitioner may not act on the client's behalf** in the client's own space.
- **MAIA does not carry messages between them** in Slice 0.

## 6. Visibility rules — tested by absence, not presence

⚠️⚠️ **"Nothing is shown" is not evidence of unrecoverability.** A system can hide content while
leaking it through timestamps · counts · ordering · completion states · notification behavior ·
suggested actions · presence/absence patterns · response latency.

The test is therefore **not** *"can Larry see the reflection?"* It is:

> **Can Larry infer that the reflection existed, changed, or mattered — through any indirect signal?**

Each unrecoverable item requires a direct absence test asserting it does not leak through **any** of
the named channels. Presence assertions cannot detect relational failure.

## 7. MAIA's role in this surface

MAIA is **present to each person separately** and does not become a third party to the relationship.

- ⛔ MAIA does not characterize the client to the practitioner — no summary, no theme extraction, no
  progress narrative, no readiness signal.
- ⛔ MAIA does not recommend treatments, interventions, or clinical direction.
- ⛔ MAIA does not diagnose, score, or stage the client.
- ⛔ MAIA does not tell the client what the practitioner thinks.
- ✅ MAIA may support each person's own preparation and reflection, within their own space, under
  their own consent — exactly as it does without a practitioner.

⭐ The sovereignty test applies unchanged: does this increase the client's agency, push life outward,
and reduce the system's psychological centrality over time? A practitioner surface that makes MAIA
the interpreter of the relationship fails all three.

## 8. Slice 0 — the relationship seam

Slice 0 is **the seam only**: that a practitioner and a client are related, that the relationship is
visible to both, and that it is severable by the client.

**In Slice 0:** the relationship exists · both doorways render it · the client can sever it ·
Practitioner Notes remain practitioner-only · nothing about the client's private material reaches
the practitioner by any channel.

**Not in Slice 0:** sharing gestures · shared artifacts · messaging · scheduling · any MAIA
cross-party capability · any client-visible practitioner material.

⭐ Slice 0's value is that it is the smallest change that makes the **boundary** testable. The
sharing gesture is deliberately absent so that the unrecoverability claims can be verified before
anything is shareable.

## 9. Acceptance questions

⛔ These are the questions a future walk must answer. **They are not answered here, and this document
does not assert any of them.**

**Recovery test** (requires observer separation and temporal separation — a same-session self-check
by the author proves nothing):

> Can an independent reader, without the author's internal context, recover what this relationship
> is, what it carries, and what authority each party holds?

**Boundary tests (absence):**

1. Can the practitioner infer the existence, change, or significance of client-private material
   through any indirect channel?
2. Does an empty share-list read as legitimate, or as deficiency?
3. Does severance work without notifying in a way that pressures?
4. Does Sanctuary content remain unreachable by construction under every path?

**Relational tests:**

5. Does the client's experience of their own space change when a practitioner exists?
6. Does the practitioner experience the boundary as a limitation, or as the thing that makes the
   relationship safe to have?

## 10. What this document does not define

⛔ Visual design, component structure, routes, schema, copy (beyond the constraints above),
onboarding flow, invitation mechanics, or pricing. ⛔ It does not resolve the client-of-record
question, the IP custody question, or whether a client may ever see Practitioner Notes.

## 11. Preconditions before implementation or any walk

⛔ **These are named as evidence gaps, not prohibitions** — each awaits its own transition evidence:

| Precondition | Status |
|---|---|
| This specification reviewed and approved | ⛔ **not done** — authored 2026-08-03, unreviewed |
| Larry IP one-pager | ⛔ gates activation; awaiting founder |
| Co-Lab Release Gate `verify-colab-boundaries.ts` **31/31 in production** | ⛔ **mandatory before any invite** (CLAUDE.md; triggers include invitations/roles and Studio people) |
| `sessions.team_id` INSERT paths (#899) | 🔴 session creation broken on 4 paths |
| `sessions.notes` plaintext PHI | 🔴 open |
| Absence-test harness for §6 | ⛔ does not exist |
