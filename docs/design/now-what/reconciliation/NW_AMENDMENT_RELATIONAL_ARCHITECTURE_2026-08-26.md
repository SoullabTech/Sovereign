# PROPOSED PROGRAMME AMENDMENT — Relational Architecture

**Status**: **PROPOSED. Not adopted.** Recorded per master programme §II.1 — this changes the
sequence and the product definition, both upstream questions. Awaiting founder ruling.

## What is proposed (founder, 2026-08-26)

**Center of gravity moves.** *"Now What? is not primarily a self-reflection product. It is a
relational platform between Larry and the people he works with."* Candidate formulation:

> *Now What? is Larry's living coaching environment: a place to teach, communicate, accompany,
> and help people make sense of what is next — while giving each member a private space to think
> and grow.*

**Five member surfaces**: Home (what matters now) · **From Larry** (lessons, notes, resources,
audience-scoped) · **Coaching** (the relational center — messages, notes, prep, follow-up) ·
**My Space** (Question/Work/Story collapsed into one evolving personal space) · **The Room**
(kept special, deliberately not a content tab).

**A Larry-side workspace**: Larry Home · People · Publish · Messages · Sessions · Library.

**A new doctrine unit** — Larry ↔ Member relational architecture — inserted **before** IA/Figma,
covering publishing rights, private vs. shared notes, direct communication, member→Larry sharing,
cohort/general publishing, lesson objects, notifications, read/unread, replies, the boundary
between coaching record and casual communication, **what MAIA can and cannot see**, what enters
member memory, and what stays Larry-authored source material.

## Consistency with existing rulings

**Consistent, and deliberately so.** The proposal explicitly preserves **D-A** — *"That preserves
the recovered ontology's important insight: the AI conversation should not become the organizing
center of the entire platform."* It is a re-centering, not a supersession. It also aligns with
**NW-R01-F5** (flourishing as perspective, not destination), **NW-D00-F1** (Question/Work/Story
are already one table filtered), and **NW-R02-F6** (the human coach is the product's greatest
unbuilt asset).

**One tension for D03, not for now**: "My Space" collapses three destinations, which is an IA
decision. Recording the *intent* is upstream; deciding the *destinations* stays at D03 behind the
founder IA gate.

## Substrate findings — the record understates what exists

Prompted by this proposal, the practitioner-side substrate was traced. **The Now What? design
record is materially out of date**, in the direction of under-reporting:

| Capability | Now What? design record says | Actually in the repo |
|---|---|---|
| Encrypted lane (`phiAccessors`) | *"waits on the encrypted lane"* (door map rows 3 & 9; census F9) | **BUILT.** `lib/security/phiAccessors/` with `clientMessages`, `practitionerClientNotes`, `sessionNotes`, `sharedOfferings`, `emergencyInfo`, `maiaConsultations`, `encounterTranscripts` — plus CI gates (`check-member-owned-boundary.ts`, `check-no-phi-enc-in-responses.ts`) |
| Practitioner↔client messaging | gated, not built | **BUILT** — `lib/practitioner/messages.ts`, `20260121_between_session_container.sql`. Design posture already close to the proposal: *"bounded async, NOT live chat — intentional latency, digest over drip, boundaries first-class,"* practitioner check windows, response-window display |
| Coach→member publishing ("From Larry") | not addressed | **GENUINELY UNBUILT** — no lesson/resource/publication migration exists. `phiAccessors/sharedOfferings.ts` is the nearest relative and needs assessment |
| Safety routing | R02: no substrate on the Now What? path | **Platform-level substrate exists** — `20260121_safety_concern_logs.sql`, and messages.ts states *"safety concerns route with immediate notification"* |

**Consequence for the roadmap**: the relational architecture is **substantially closer than the
Now What? design record implies.** Three of its four major capabilities have real substrate; only
publishing is greenfield. This is the project's documented *inverse drift* — live infrastructure
staying invisible until measured — and it means the proposed unit should begin as a **census of
the practitioner lane**, not a design exercise.

**Consequence for NW-R02**: finding **R02-F7** (no safety substrate) is **accurate for the traced
Now What? conversational path and now narrower than it read.** The platform has safety-concern
logging and a notification route in the practitioner lane. NW-I01 may have more to build on than
R02 assumed.

**And it raises a consent conflict R02 did not see**: practitioner messaging routes safety
concerns with *immediate notification*, while R02's proposed four properties require that a safety
response reach **no one** without an explicit member act. Two lanes of the same platform would
then hold opposite rules. **This must be reconciled — it is now the most consequential open safety
question in the programme**, and it is a founder ruling, not an implementation detail.

## Recommended disposition

1. **Adopt the re-centering as the product definition** — it is consistent with every ruling in
   force and sharpens all of them.
2. **Insert the new unit as NW-D01.5 — Larry ↔ Member Relational Architecture**, after D01 (it
   needs Larry doctrine: what he actually publishes and how he communicates) and before D02/D03.
3. **Begin it with a practitioner-lane census**, given the findings above. Its first question is
   *what already exists*, not *what should exist*.
4. **Rule the safety-notification conflict** at the same time as R02's decision #2 — they are the
   same question asked from two lanes.

Sequence if adopted:
```
NW-R02 ✅ → NW-D01 → NW-D01.5 (relational) → NW-D02 → NW-D03 → [IA GATE] → D04 → D05 → D06 → [APPROVAL] → D07 → D08+
```
