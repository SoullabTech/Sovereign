# Soul Portrait — Consent Architecture

**Status:** RATIFIED · constitutional keystone · drafted 2026-07-05, ratified 2026-07-05 (Kelly)
**Still does NOT authorize build.** This is the constitutional bridge between Stage 1 (ownership)
and every later capability — generator, delivery, invitations, PDFs, public gift links. If
it is correct, those become implementation; if it is weak, every one of them inherits its
ambiguity.

## Ratification record (2026-07-05)

Ratified as the **keystone boundary** for all Soul Portrait capability. The core principle:

> **Generation is not authorization. Consent is not implied by production of an artifact.
> Delivery is a separate act.**

The chain this preserves, in order, each step distinct:

```
Generate draft → Practitioner review → Owner-scoped visibility → Consent event → Handed artifact
```

The separation of three powers is the reason the architecture holds:
- **Practitioner** — records and stewards the container
- **Subject/client** — authorizes use about themselves
- **System** — enforces capability limits

with the load-bearing consequence: **attestation permits practitioner-held use, not
subject-facing self-serve access** — preventing the slide from "I recorded consent" into
"I control consent."

Ratification changes governance state, not repo state: Stage 2 remains **boundary-only**
(generator inside consent, draft tier only — no publishing, no mentor, no consent event, no
delivery, no implementation). No push. No deploy. Design docs remain uncommitted until
explicitly authorized. No downstream Stage 2 work moves except against this document.

---

## The ordering rule (why this comes before Stage 2)

Load-bearing (Kelly): **Path B must govern portraits about clients before Studio can create
them.** Stage 1 settled who *owns* a portrait — the practitioner. This document settles who
may *authorize* one to exist, be delivered, and persist — and, at its center, **how a client
who is not a MAIA member consents.**

---

## What this reconciles with (extract, don't invent)

The consent substrate is already in the ground — Gate 2 (deployed) + Stage 1 (local). This
doc does not invent it; it makes its constitutional reasoning explicit.

- **`soul_portraits`** — `owner_member_id` (practitioner), `subject_member_id` (member
  subject, nullable), `subject_person_id` (studio_people subject, nullable — Stage 1),
  `subject_is_minor`, `portrait_kind` (`self`|`gift`|`parent_child`|`legacy`),
  `consent_state` (denormalized cache: `pending`|`active`|`revoked`), `immutable_text`
  (write-once after publish), `published_at`.
- **`member_guardians`** — `guardian_member_id` may consent for a minor subject.
- **`soul_portrait_consents`** — append-only ledger, **authoritative** for liveness:
  `actor_type` (`guardian`|`subject`|`system`), `actor_member_id` (**nullable**), `action`
  (`set`|`accept`|`refuse`|`change`|`revoke`), `consent_source` (`verbal`|`written`|`digital`),
  `agreement_version`, `flags` (`portrait_read`, `mentor_dialogue`, `retention:false`).
- **Liveness rule** (in the migration): consent-live iff, for the governing actor, the latest
  `set`/`accept` for the current `agreement_version` has no later `refuse`/`revoke`.

Everything below either **ratifies** what the schema already decides or proposes (Candidate)
what it does not.

---

## Actors and jurisdiction — never collapsed

- **Practitioner (`owner_member_id`)** — jurisdiction over **creation and the container**:
  authoring, editing before publish, holding, deleting a draft. Owns the *artifact*. Owns
  neither the subject's meaning nor their consent.
- **Subject (client / friend / self)** — jurisdiction over **consent**: whether a portrait
  may be about them, delivered, and retained. For a competent adult, **only the subject
  authorizes.** A practitioner may *record* that consent; they may never *grant* it in the
  subject's place.
- **Guardian (`member_guardians`)** — for a minor subject, holds the subject's consent
  jurisdiction (`set`/`accept`/`revoke` on the minor's behalf).
- **System / MAIA** — jurisdiction over the **walls only**: records the ledger, computes
  liveness, enforces the gate. Authors no meaning, grants no consent, and never infers
  consent from silence, from ownership, or from URL possession.

**Invariant: owning a portrait ≠ authorizing it about oneself.** A practitioner who owns a
portrait about a client has no authority to make it live; only the subject's (or guardian's)
consent does.

---

## The organizing principle: assurance grade governs capability

A portrait's permitted capabilities scale with the **assurance** of the consent behind it.
The weaker the proof that the subject authorized it, the less the portrait is permitted to
become. This is not new mechanism — it reads directly off existing ledger fields
(`actor_member_id` present/null, `consent_source`, `flags`).

| Consent tier | How recorded (ledger) | What the portrait may become |
|---|---|---|
| **None** (draft) | no event | owner-only private preview (Stage 1 today) — never seen by the subject or anyone else |
| **Practitioner-attested** | `actor_type=subject`, `actor_member_id=NULL`, `consent_source=verbal`/`written`, recorded by the owner as witness | in-session use + a **handed-over artifact** (a PDF/file the practitioner gives the client directly). **Not** a self-serve live link; no mentor dialogue by default |
| **Subject-self (digital)** | `actor_type=subject`, `actor_member_id=<subject's member id>`, `consent_source=digital` | full self-serve delivery — a live, revocable, member-gated page; mentor dialogue + retention per the ledger `flags` |
| **Guardian (minor)** | `actor_type=guardian`, `actor_member_id=<guardian>` | only as the guardian authorizes; minor-safe capabilities only; never self-serve to the minor |

---

## THE CENTER: how a non-member client consents

Stage 1 exposed the seam: a subject identified only by `subject_person_id → studio_people`
has **no `actor_member_id`** — so they cannot be a self-authoring actor in the ledger.
Resolving this is the point of this document.

**Resolution — practitioner *attestation*, not practitioner *authorization*.**
A non-member client's consent is captured as a real, recorded, revocable ledger event:

- `actor_type = 'subject'` — the client is the authorizing party, **not** the practitioner;
- `actor_member_id = NULL` — they have no account;
- the subject is bound by the portrait's `subject_person_id`;
- `consent_source = 'verbal'` or `'written'` — how the practitioner obtained it;
- the recording practitioner is the **witness** — the portrait's `owner_member_id` **is** the
  recorder. *(Ruled 2026-07-05: no separate `witnessed_by` field for now — `owner_member_id` +
  the consent event + `consent_source` suffice for Stage 2; add one only if a verifier later
  demands it.)*

The practitioner is the **recorder** of the client's consent, never its **source**. This
preserves sovereignty: the client authorizes; the practitioner supplies provenance of that
authorization; the system holds the record.

**Assurance is lower — so capability is bounded.** Attested consent is an *assertion*, not a
self-authored digital act. It therefore unlocks only the bounded tier — in-session use, or an
artifact **handed over in-session or by direct practitioner communication** (the practitioner
sends the PDF) — and **never** self-serve live delivery. A verbal claim relayed by a
practitioner must never become a world-reachable link. *(Ratified 2026-07-05: attestation is
sufficient for handed PDF delivery precisely because the artifact is handed, not linked.)*

**The upgrade path.** If the client later claims a MAIA account, `studio_people.member_id`
links their `subject_person_id` to a real member. They may then self-author consent
(`actor_member_id` set, `consent_source='digital'`), raising the portrait to the full tier.
**Assurance can only be raised by the subject's own act** — never by the practitioner, never
by the system.

**Refusal this implies (must become a test):** a portrait whose subject is a non-member
(subject_person_id, no linked member) can **never** reach self-serve live delivery on
attestation alone. The delivery gate must require subject-self *digital* consent for a live link.

---

## The seven questions, answered

1. **Who may request** — the practitioner (owner) initiates creation; a member may request
   their own (`self`). *A request is not a consent.* [open: the request/invitation flow]
2. **Who authorizes** — the **subject** (self; or the **guardian** for a minor). Never the
   practitioner for a competent adult. [schema: `actor_type`]
3. **Gift vs practitioner relationship** — `portrait_kind` distinguishes them; the consent
   *semantics* differ. A gift's subject still authorizes delivery-to-them; a practitioner–
   client portrait is bounded by the professional relationship + the attestation tier.
   [open: per-kind `agreement_version` statements]
4. **Minors / guardian** — `member_guardians` + `actor_type='guardian'`; the minor never
   self-authorizes; minor-safe capabilities only. [schema-decided]
5. **Revocation** — any live consent is revocable by a later `refuse`/`revoke` from the
   governing actor; `consent_state → revoked`; delivery ceases. `immutable_text` is not
   rewritten (the artifact stands) but access dies. [schema-decided]
6. **Jurisdiction practitioner↔client** — owner = container/creation; subject = consent;
   system = walls. Owning ≠ authorizing. [this doc]
7. **What a portrait may become** — bounded by (a) the assurance tier above, (b)
   `immutable_text` write-once after publish, (c) ledger `flags`. A portrait may never
   silently become more than its consent tier permits. [schema + this doc]

---

## Consent liveness (ratified, unchanged)

`consent_state` is a **denormalized cache**; the `soul_portrait_consents` ledger is
authoritative. Live iff the latest governing `set`/`accept` for the current
`agreement_version` has no later `refuse`/`revoke`. Access checks read the **ledger**, never
the cache. (The Gate 3 helper implements this rule; inert.)

---

## What this does NOT settle (open)

- The concrete **request/invitation flow** — who initiates, how the subject is asked.
- The exact **`agreement_version` consent statements** per kind — the words a subject accepts.
- ~~Whether attestation needs a `witnessed_by` field~~ — **resolved 2026-07-05: not now.**
  `owner_member_id` + the consent event + `consent_source` suffice for Stage 2; revisit only
  if a verifier needs it.
- **Cultural sovereignty** of the consent language (Invariant 14) — the statement must not
  impose a vocabulary of "self," "healing," "growth."
- The **delivery transport** (Gate 4) — this doc governs *what* may be delivered under *which*
  consent, not the mechanism.

---

## Refusals this architecture must enforce (falsifiable — become tests when their capability ships)

1. A portrait with no live consent is never delivered to anyone but its owner.
2. A practitioner cannot make a portrait live about a competent adult — only the subject's own
   consent (or a guardian's, for a minor) can.
3. A non-member subject's *attested* consent never unlocks self-serve live delivery.
4. Revocation immediately ends delivery (liveness reads the ledger, not the cache).
5. The system never infers consent from silence, from URL possession, or from ownership.

**Constitutional Completion:** each capability ships with the refusal that bounds it, or it
does not ship. A delivery surface built without its consent gate silently converts a *free*
refusal into a *violated* one.
