# Message Executor — The First Released Executor (Spec)

- **Date**: 2026-06-22 (rev. 2 — elevated to the Contained/Released distinction, Kelly 2026-06-22)
- **Status**: **DRAFT — does not authorize implementation.** No message draft, no message send, no route, no `propose_message_*` tool, no schema, no channel adapter until this spec is reviewed.
- **Gate**: **Gate 0 (messaging) open** (§5). The draft/send boundary must be established as the Contained/Released boundary before any executor work proceeds. The draft half is a **Contained Executor** (already-validated class); the send half is the first **Released Executor** and is **not authorized**.
- **Class**: Frozen plan (Cat 5). Spec-only; describes a design, grants no runtime authority.
- **Governing distinction**: **Contained vs Released Executors** (§1) — a *constitutional* taxonomy, not a software one. This spec recognizes it as a **candidate general doctrine** and holds its extraction/naming for later (§15).
- **Sibling**: `docs/specs/CALENDAR_AUTHORIZED_ACTION_SPEC_2026-06-18.md` — executor #1, a **Contained Executor**. This spec is the first **Released Executor**; messaging (email-first) is its first implementation.

> **Thesis.** A calendar event saves something *into* the member's sovereign field; it stays **contained**. A message crosses *out* of the field — into another person's attention, under the member's name. The crossing's root property is not irreversibility but **the loss of exclusive authorship** (§2): the member's words become shared social reality. Executors divide by *whether they cross that line*, not by channel. Message is another `actionType` *structurally*; it is a different executor **class** constitutionally.

---

## 0. Constitutional Authority

Same law, new evidence. The **six LOCKED Authorized Action invariants** — **Authorship · Consent · Faithful Execution · No Substitution · Revocability · Legibility** — are stated once by the Constitution; each executor supplies its own evidence. This spec supplies the **first Released Executor's** evidence. It introduces no new philosophy; it discovers what the *existing* law requires of an executor whose effects leave the member's field.

- **`docs/canon/MAIA_CONSENT_GATES.md` Art. 2** — MAIA may only *construct* a proposal (`propose_*`, never `send_*`); a single consent-gated route is the sole path to the sole writer; **MAIA can never call the writer.**
- **Art. 3** — reactive source (the member's request *this turn*), member-scoped; never inferred. Messaging **hardens** Art. 3 (§6): the *recipient* must also come from the member's turn.
- **Derived Principle — Non-transferable Authority** (§6) — load-bearing here as it never was for calendar.

---

## 1. The constitutional taxonomy — Contained vs Released

Executors are classified by **crossing type**, not channel. The classifying question: *do the effects leave the member's sovereign field?*

**Class A — Contained Executors.** Effects remain inside the member's field.
- *examples*: calendar draft, journal, notes, reminders, memory, practices, reflections
- *properties*: reversible · editable · deletable · member-owned · non-escaping

**Class B — Released Executors.** Effects leave the member's field.
- *examples*: email, SMS, Slack, Teams, Discord, WhatsApp — and, in time, publishing, commerce, filing, ordering (§15)
- *properties*: externally visible · identity-bearing · partially/fully irreversible · socially consequential

**The class attaches to the crossing, not the noun.** "Calendar" is not Class A — the *proposal calendar executor* is, because it pins `local_only`/`private`. The *same* `calendar_events` table is Release-*capable* through the studio route (syncs as "Busy"). So classification keys on the **write path / crossing**, which is exactly why a channel-keyed taxonomy fails. An executor that *can* cross is Released; one structurally prevented from crossing is Contained.

---

## 2. The crossing is the loss of exclusive authorship

Irreversibility is one *consequence* of the crossing; it is not the crossing. The deeper, exact property is:

> **Before release, the member is the sole audience and sole author. After release, exclusive authorship becomes shared social reality** — the member no longer controls copies, forwarding, screenshots, archives, search, recipients' memories, legal discovery, or downstream AI indexing.

This is the better root because it **stays true where reversibility only partially exists**: a Slack message deletable in thirty seconds is still a released crossing — copies and memory already escaped. Irreversibility is the temporal face of the crossing; loss of exclusive authorship is the relational face, and it never lies. (Adjacent to the project's authorship primitives: *a portrait may be given; a relationship must be chosen* — released words enter other people's authorship-space.)

**Everything heavy in this spec — the Footprint stage, the Release stage, the heavier confirm — exists to honor this single crossing.**

---

## 3. The pathway branches by class

The constitutional pathway is one. Its *shape* depends on the class — and that is the architectural rent the taxonomy pays.

```
Contained Executor (calendar today)
    Proposal → Confirm → Execute

Released Executor (message, and all future external action)
    Proposal → Footprint → Confirmed → Release Authorized → Execute Attempted → Released
```

The Released pathway adds two constitutional stages: **Footprint** (§8 — full disclosure of the crossing before any confirmation) and **Release** (§4 — authorization of the crossing, distinct from technical execution). Contained executors need neither. Reuse the shared pathway already real in code (`lib/maia/proposals/tools.ts`, `executor.ts` sole writer, `app/api/sovereign/proposals/calendar/confirm/route.ts` sole entry); the branch is in the executor, not a second pathway.

---

## 4. The Released state machine — Release authorizes; "Released" is the crossing

For a Released Executor, **authorizing** the crossing and **realizing** it are distinct events. Execute is an *attempt*; **Released** is the constitutional fact that the boundary has actually been crossed. Do not call Execute "the crossing."

```
Proposal → Footprint → Confirmed → Release Authorized → Execute Attempted → Released
```

- **Release Authorized** — the member's authorization of *this* crossing (a fixed footprint, §8). A constitutional act, recorded.
- **Execute Attempted** — the technical act (SMTP, API call). May succeed, fail, or time out.
- **Released** — effects have actually left the field; loss of exclusive authorship (§2) has occurred. The **only** state in which the boundary is crossed.

Why the distinction governs retries and consent:
- **Execute failure ≠ crossing.** If SMTP times out: authorization still exists, the crossing has *not* occurred (state remains "Release Authorized"), retry is permitted, and **no new confirmation is needed because the footprint has not changed.** A failed send has not cost the member their exclusive authorship.
- **Footprint change expires authorization.** If anything in the footprint changes (recipients / content / channel / visibility), "Release Authorized" **expires and the proposal reopens** — a fresh Footprint → Confirm → Release is required. This keeps the split from becoming a standing-consent loophole; consent remains per-crossing (Art. 2; §7 Consent row).
- **Failure-after-Release doctrine** (resolves the prior open question): a "Release Authorized" send that fails to reach "Released" reverts to draft, surfaces the failure, and may re-attempt the *same* crossing under the standing authorization; a *changed* crossing requires a fresh Release. No silent retry of a mutated send.

---

## 5. GATE 0 (messaging) — the draft is a Contained constitutional object

> **Gate 0.** Calendar's Gate 0 asked *can an internal action escape?* Messaging escapes by definition, so the question changes: *is there any Contained mode at all?*

**Yes — the draft.** A draft is a stored, member-owned, editable, deletable artifact: a **Class A (Contained) object**, not a UX convenience. **Sending is the Class B (Released) act.** Draft and send are therefore **different constitutional classes, not different states** — and should be **different executors**:

- **Message Draft Executor** — Class A. Constitutionally identical to the calendar executor; inside validated territory.
- **Message Send Executor** — Class B. The first Released Executor; gated, separately authorized, separately certified.

**Sequencing**: v0 implements the Draft Executor only. The Send Executor is the first crossing and is *not yet authorized*. (Reconciles draft-first with "first crossing": *v0 does not cross.*)

---

## 6. Non-transferable Authority for messaging

> Authorized Action permits execution only within the authority the authorizing member possesses. MAIA cannot acquire authority the member does not possess.

A Released crossing spends the member's **identity and relationships**. The executor may **not**:
- **infer recipients** — the recipient must be named/resolved *by the member this turn* (Art. 3 extended to the addressee); no fuzzy contact-match promoted to a send target without explicit member resolution.
- **escalate channel** — member said "text" → may not silently email instead.
- **widen audience** — 1:1 may not become group; internal may not become external.
- **author relationship** — MAIA sends the member's authored words as scribe; it does not compose, on the member's behalf, into a relationship the member did not author.

**Ambiguity resolves toward the member, never toward a guessed send.**

---

## 7. The six invariants, re-evidenced for a Released Executor

| Invariant | Contained executor's evidence (calendar) | Released executor's required evidence |
|---|---|---|
| **Authorship** | member confirms a proposal | member authors content **and** the crossing (the Release, §4) — confirming the *crossing* is a distinct act from approving the *text* |
| **Consent** | single consent-gated route → sole writer | identical; consent is **per-crossing**, bound to a fixed footprint (§4); never standing or blanket |
| **Faithful Execution** | row matches payload | delivered bytes == Released bytes; **no MAIA mutation between Release and Execute**; channel + recipient == disclosed |
| **No Substitution** | MAIA proposes, never creates | MAIA is scribe, not author-of-record; the member is author and sender |
| **Revocability** | delete the row | **cannot be provided after the crossing** (§2 — exclusive authorship is already lost). Honored *upstream*: draft-first (Class A v0, §5), heavier confirm (§9), the Release stage (§4), and honest disclosure that the crossing is unrecoverable (§8). The invariant moves to a layer that can still honor it. |
| **Legibility** | proposal shows the event | the Footprint stage (§8) — the member sees the full crossing before authorizing it |

The **Revocability** row is the spec's center of gravity: a Released Executor cannot pay it by undo, so the Footprint / Release / heavier-confirm machinery exists to pay it *before* the crossing.

---

## 8. The Footprint — the constitutional object the executor acts on

The executor does not really act on an email, a Slack message, or a calendar entry. **It acts on a *footprint*** — and the transport is implementation. Two transports can share one footprint; one transport can carry several. This is why the doctrine is channel-independent (§1): the footprint, not the channel, is what the member authorizes and what a Release fixes.

A Released proposal must pass an explicit **Footprint** stage that discloses — legibly and completely — and **fixes** (per §4) the crossing:
- **recipient(s)** — fully resolved, exactly as the member will be seen to have addressed them
- **channel** (email / Slack / …)
- **1:1 vs group**
- **internal vs external**
- **persistent / searchable status** — does it live in a searchable archive others can read?
- **attachments**, if any
- **whether the action can be revoked** — and, for a send, the plain statement that it **cannot**
- **whether delivery leaves Soullab / MAIA control** — the escape disclosure

Disclosure is not cosmetic and not a summary; it is the constitutional surface that makes Authorship and Legibility real, and the footprint it fixes is what a Release authorizes. **An undisclosed property is an unauthorized one.**

**One release machine.** Because the executor acts on a footprint, every *contained→released* elective in any domain — export a memory, share a journal entry, publish an identity, send a message — describes a footprint and routes through this same `Footprint → Confirm → Release` machine. The platform needs **one** release gate, not a separate share/export/publish/send flow per domain (see §15; §17 conditional-release).

---

## 9. Confirmation threshold

- A Released crossing requires **heavier** confirmation than a Contained save. The two **must not share one affordance** ("Send/Release" ≠ "Save").
- The member confirms **the crossing, not merely the content.** The act authorized is *"release these words, to these people, on this channel — into shared social reality"* (§2).
- Confirm language must **not** be casual; the gesture's weight must match the crossing's weight (cf. exact-phrase authorization for irreversible deploys). Exact wording — typed confirmation? re-auth? — is open (§17).

---

## 10. Sole-writer invariant

- The Executor remains the **only** writer; the consent-gated confirm/Release route remains the **only** entry that reaches it.
- Absolutely: **no direct-send shortcut · no background sending · no inferred recipients · no auto-send from conversation.** MAIA constructs `propose_message_*`; it never holds a path to the sender.

---

## 11. Revocation semantics

- **draft (Class A)** — fully reversible: edit or delete the member-owned draft.
- **send (Class B)** — the crossing is **not recoverable**; most channels offer no true recall, and §2 holds even where they do (copies/memory have escaped). Revocability is disclosed (§8) and honored upstream (§4, §5, §9), never pretended after the fact.

---

## 12. Audit evidence (per-executor; mirrors email's `provider_message_id`)

- **Release Authorized** — the authorization fact: who authorized, the *fixed footprint* (§8), timestamp. Recorded **independently of delivery** (§4).
- **Released** — the crossing-event, on successful Execute: provider message id + channel + resolved recipient(s) + delivery timestamp.
- **failed Execute** — recorded as authorized-but-not-crossed (state stays "Release Authorized"); reverts to draft (§4). No silent retry of a mutated send.

What Release/Execute evidence must be retained as proof-of-authorization vs. what the member may delete is open (§17).

---

## 13. Channel ladder

- **Email first** — the first executor to abandon the non-escape invariant, with the least platform complexity. The first **Released** implementation.
- **Slack / message channels later** — they add group visibility, persistence, and social-footprint complexity on top of the crossing email already proves.
- The ladder climbs **footprint richness + reversibility**, not merely API difficulty.
- Order (importance-neutral): **Email → Slack → Telegram → SMS → WhatsApp.**

---

## 14. Liveness ladder (target)

```
Contained: Message Draft Executor        Released: Message Send Executor
Spec ✓                                    Spec ✓
  → Draft executor built (Class A)   ✗      → Send executor built (Class B, gated)   ✗
  → Draft certified                  ✗      → Footprint stage certified (§8)         ✗
                                            → Release stage certified (§4)           ✗
                                            → Heavier-confirm certified (§9)         ✗
                                            → first authorized live release          ✗
```

Everything past "Spec" is ✗ today. Contained (draft) and Released (send) certify **separately**.

---

## 15. Candidate general doctrine — HELD (not today)

This spec's spine is not really about messaging. **Contained vs Released is the constitution for *agency*** — for every action MAIA may one day take on a member's behalf in the world. Future executors — publish a Substack, submit a manuscript, send an invoice, file taxes, submit insurance, place an order — are not "message" actions, but they are all **Released Executors**, and the doctrine here applies unchanged:

```
Proposal → Confirm → Executor
                         ├── ContainedExecutor   (Proposal → Confirm → Execute)
                         └── ReleasedExecutor     (Proposal → Footprint → Confirm → Release → Execute)
                                ├── Email   ← first implementation
                                ├── SMS · Slack · Teams · Discord · WhatsApp
                                └── Publishing · Commerce · Filing · …
```

**Held for extraction.** Per earn-before-name and the calendar spec §9 rule (*two instances reveal the abstraction only if the first is validated*), this spec does **not** canonize the general doctrine today. Contained/Released is now understood as **one *family* of crossings** — member-authorized release of a contained object into the external/social world — within a broader candidate: the **Boundary Crossing grammar** (`docs/architecture/BOUNDARY_CROSSING_GRAMMAR_CANDIDATE_2026-06-22.md`), which asks the same question across memory, interpretation, relationship, identity, and agency but routes each to its *own* process (it does not flatten them into Contained/Released). When a second Released instance validates this family, lift §1–§4 + §8 into a canon chapter (Email as first released implementation; this spec demoted to an instance). The content above is written so the lift requires no rewrite.

---

## 16. What this spec does NOT authorize

- No message **draft** executor, no **send** executor, no route, no schema / migration, no `propose_message_*` tool, no channel adapter, no contact / recipient resolver.
- **No canonization of the Contained/Released doctrine** (§15) and **no extraction of a generic Executor interface** until a Contained instance (calendar #1) **and** a Released instance are *each* certified. Message being structurally another `actionType` does **not** license treating it as *merely* another `actionType`.
- No standing or blanket send/Release consent; no MAIA-initiated crossing of any kind.

---

## 17. Open questions / frontiers

- **v0 scope** — Contained Draft Executor only, or draft + a single gated Released send? (Spec leans draft-only first; §5.)
- **Valid Release** — what exact language / gesture authorizes the *crossing*? Typed confirmation? Re-auth for an external release?
- **Recipient resolution** — how are recipients resolved safely from the member's turn without inference crossing into MAIA *picking* a target? (Bounded by §6.)
- **Audit retention vs deletion** — what Release/Execute evidence must be retained as proof-of-authorization, and what may the member delete?
- **Conditional-release boundary cases** — an executor that is Contained by default but member-electable to Release (e.g., a calendar event the member chooses to share externally): does the elective share re-enter the Released pathway (Footprint + Release)? (Likely yes — the crossing, not the noun, governs.)
- **Recipient-side consent** — a member-authored 1:1 message raises none (the member authors; MAIA does not *represent* the recipient). Group / broadcast, and any MAIA-*suggested* recipient, might — bounded by §6 Non-transferable Authority. Flagged, not resolved.
