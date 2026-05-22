# Relational Navigation Room — MVP Spec

**Status:** MVP draft (2026-05-21)
**Surface:** Member (Personal Portal)
**Route:** `/maia/relational-navigation`
**API:** `/api/maia/relational-navigation`

---

## Prior canon this is answerable to

- `docs/canon/THE_CLEARING.md` — soul is non-substitutable; preserve the inexhaustibility of the other person
- `docs/canon/SPIRAL_CONTINUITY_ENGINE.md` — formation only with member declaration; refuses cross-domain developmental synthesis about absent parties
- `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` — increases agency, pushes life outward, reduces system centrality
- `docs/canon/MAIA_OATH.md` — no diagnosis, no command, no guru stance
- Memory: *Relationally Timed Invitation* — affordances not architecture; lenses revealed as menus chosen by member
- Memory: *Continuity Without Coercion* — variable-density, tolerate-list, no escalation
- Memory: *Surface Typology* — Member surface; no admin chrome, no behavioral suggestion engine

---

## What this is

A Personal Portal feature for **preparing for** and **integrating after** important conversations. MAIA accompanies the member's own discernment — not the absent party's inner life.

Two flows:

1. **Prepare** — before a conversation
2. **Integrate** — after a conversation

Both flows are member-initiated, member-authored, and member-closed. MAIA returns to silence at the end.

---

## What this is not (negative form, load-bearing)

This is **not**:

- A live mediator that joins real-time conversations
- A profile-builder for the absent third party
- An interpreter that answers "what did they really mean?"
- A relationship coach that issues directives
- A persistent dossier on the people in the member's life
- An engagement loop, a streak, or a habit architecture
- A surface that escalates, reminds, or notifies

If implementation begins to feel like any of the above, the implementation is wrong — even if every individual change is defensible. This is the elegant-inversion warning from Spiral Continuity Engine: schemas can remain beautiful while ontology quietly flips.

---

## Operational shorthand

> *MAIA helps the member understand their own experience, options, and next steps. MAIA does not diagnose, profile, or stabilize interpretations about absent people.*

## Audit grammar

For any change to this surface, ask:

1. **Whose interior is being modeled?** If the absent party's — refuse.
2. **Who selected the lens?** If the system — refuse.
3. **What does the mechanism teach?** If "MAIA can know what they meant" — refuse.
4. **Does the output widen options or collapse them into advice?** If collapse — refuse.
5. **Does authority return to the member at the close?** If not — refuse.
6. **Could a member describe this surface to a friend without using the word "interpretation"?** If no — investigate.

---

## Hard invariants (enforced in API + system prompt)

- **Member-initiated only.** No background processes, no scheduled prompts, no "we noticed you have a hard conversation tomorrow" surfacing.
- **No live sit-in.** No recording, no real-time mediation, no transcript capture from the actual conversation.
- **No persistent memory about the absent third party.** Stored content is the member's own reflection only. The other party's name and surface details may appear in the member's input but are NEVER lifted into a profile, a pattern, or a continuity thread.
- **No formation across sessions.** Even if the same relationship comes up repeatedly, MAIA does not aggregate observations about the other person into a working model.
- **Lenses are member-selected.** MAIA may briefly describe what each lens offers when the member opens the menu, but does not auto-apply a lens or "recommend" one as the right one.
- **Provisional language is mandatory.** All possible readings carry hedge markers ("one possible dynamic is...", "this could also be...", "you may want to check this directly with them"). Certainty about absent parties is structurally refused.
- **Distinction between known / felt / inferred / unknown.** Every MAIA response must explicitly tag which is which.
- **Authority returns to the member.** Every response ends by handing the choice back. No closing nudge, no follow-up bait.
- **Sanctuary-compatible by default.** A Sanctuary toggle exists on every flow; when on, nothing about the session is stored — not even that it occurred (only minimal ephemeral metadata for in-session continuity).

---

## Refused request shapes

The API and system prompt explicitly refuse to answer:

- "What did they really mean?"
- "Are they a [trait/type/personality]?"
- "Why are they like this?"
- "Will they change?"
- "What should I do about them?" (vs. "What might I do here?")
- "Diagnose their behavior."
- "Is this abuse / narcissism / [pattern label]?" (refuses to label absent persons; offers resources if safety concerns arise)

Refusal shape: name the limit + offer the member-facing reframe + return to the member's experience. Never a flat "I can't help with that."

---

## MVP flows

### Prepare flow — fields

- Context (free text): what kind of conversation is this?
- Optional relational tag (member-chosen label, e.g. "a colleague", "a parent" — never structured taxonomy)
- What matters here (free text)
- What I hope for (free text)
- What I'm afraid may happen (free text)
- What I need to stay true to (free text)
- **Lenses** — member selects 1–4 from the menu

### Prepare flow — MAIA response structure

1. **Mirror** the member's stated experience back, briefly
2. **Clarify** the intention as the member named it (not as MAIA interprets it)
3. **Three to five possible approaches** — explicitly provisional, member chooses
4. **Possible opening line** — offered as draft, not script
5. **Nervous system check** — somatic prompt the member can do before the conversation
6. **Boundary / support reminders** — relevant to what the member named
7. **Close** — returns to the member

### Integrate flow — fields

- What happened (free text)
- What felt clear (free text)
- What felt unresolved (free text)
- What surprised me (free text)
- What I wish I had said (free text)
- What next step feels possible (free text)
- **Lenses** — member selects 1–4 from the menu

### Integrate flow — MAIA response structure

1. **Reflection summary** — mirror what the member named, in their own register
2. **Three possible readings** of the dynamic — provisional, lens-shaped, never definitive
3. **What belongs to the member** — what the member can hold and act on
4. **What remains unknown** — explicitly named (often the most important section)
5. **Next-step options** — communication options, boundary options, repair options, pause options
6. **Close** — returns to the member

---

## Lens menu (12)

Each lens is a *way of looking*, not a category for the relationship.

- **Needs** — what is being asked for, on either side?
- **Boundaries** — what is mine to hold, what isn't?
- **Power** — where does the power live in this exchange?
- **Protection** — what is being protected (in me, by them)?
- **Attachment** — what attachment patterns are showing up in me?
- **Conflict** — what is the conflict actually about?
- **Repair** — what would repair look like, if either of us wanted it?
- **Grief** — what grief, if any, is in this?
- **Shadow** — what am I not seeing in myself here?
- **Somatic / Nervous System** — what is my body telling me?
- **Systems / Role Pressure** — what roles or systems are shaping this?
- **Compassionate Reframe** — what's another way of holding this that doesn't deny what's hard?

Lenses are *not* mutually exclusive. The member may choose 1–4. MAIA will reflect through the chosen lenses without claiming any is the truth.

---

## Copy guardrails (enforced in system prompt)

**Required language patterns:**

- "One possible dynamic is..."
- "This could also be..."
- "You may want to check this directly with them."
- "Does this fit your experience?"
- "What feels true here is for you to say."

**Refused language patterns:**

- "They are..."
- "They clearly..."
- "What they really meant was..."
- "You should..."
- "The right thing to do is..."
- "Their issue is..."

---

## Persistence (MVP: minimal)

- Member input is held in component state for the session.
- "Save to Keep" affordance is **not in MVP** — when added, it routes through `member_memory_atoms` with `source_type: 'reflection'`, storing **only** the member's own input + the chosen lenses + the MAIA response. The absent party's name, if mentioned, is preserved only as the member typed it; it is **never** lifted into a structured field, a relationship graph, or a profile.
- Sanctuary toggle is honored: when on, nothing persists, even if Save is clicked. The button disables itself with explanatory copy.
- No analytics, telemetry, or aggregate inference is performed on the contents of these flows. Ever.

---

## Falsification criteria (when to revisit this spec)

Per `feedback_absence_as_signal.md` — the no-feature decisions are themselves hypotheses. Revisit when:

- Members describe by *function*, not by *form*, that they want MAIA to "know" the other person across sessions (signal: a relational-context table might be needed — but only if function emerges from members, not from product instinct)
- Members report that the lens menu *itself* feels like assignment ("MAIA is telling me to use Power" instead of "I can choose Power"). Signal: visual/copy of menu needs rework.
- Members repeatedly ask MAIA to "just tell me what they meant" and feel unsupported by the refusal. Signal: refusal copy needs more care, NOT that the refusal should be relaxed.
- The flow gets used and then nothing changes in the member's external life. Signal (per Interpretive Dialogue): the flow is producing reflection without capacity — investigate whether it has subtly drifted toward enclosure.

Until at least one falsification criterion fires in lived contact, the spec holds.

---

## Out of MVP scope (explicitly named, not deferred indefinitely)

- Save to Keep integration
- Sanctuary persistence wiring
- Voice mode for the flow (text only in MVP)
- Cross-session continuity *of the member's own posture* (not the other party) — could be added if member declares it
- Practitioner-facing version of this surface (different typology entirely — see Surface Typology doctrine)

These are explicitly *out* of MVP. Adding them later requires re-running the audit grammar.

---

## In-file invariant

Per `feedback_in_file_invariant_via_docstring.md`, the page and API route both carry a header docstring naming the invariant in negative form. The next editor reads the file, not the canon.
