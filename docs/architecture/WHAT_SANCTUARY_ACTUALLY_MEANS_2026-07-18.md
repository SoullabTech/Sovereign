# What Sanctuary Actually Means — 2026-07-18

**Status**: CANON-CANDIDATE. Second of the four papers commissioned at the closure of
SANC-20260614-01. Companion to `S5_PROVENANCE_CONSTITUTION_2026-07-18.md`. This paper
is about meaning; the engineering lives elsewhere.

---

## 1. The promise, stated exactly

> Sanctuary Mode — This session won't be remembered. Speak freely.

Eight words of UI copy carrying the platform's heaviest promise. Not "remembered
less," not "remembered privately," not "remembered but never used." *Won't be
remembered.* The member is told they can say a thing and the system will let it pass
through without keeping any of it. Everything else in this paper unpacks what keeping
that promise actually requires.

## 2. Why the promise exists

The canon already states it: **real honesty requires safety. People won't speak
freely to a system that might later monetize or weaponize their vulnerability.**

But the incident sharpened this. The member who used Sanctuary on June 14 did so
*mid-conversation* — they were already talking, and then reached a place where they
needed the holding to change. That gesture — *I need this next part to not exist
afterward* — is one of the most intimate acts a person can perform toward a system.
It is the moment they test whether the platform means what it says. On June 14 the
platform failed that test silently, which is the worst way: the member left believing
the promise held.

Sanctuary is therefore not a privacy feature. It is the platform's **proof mechanism**
— the place where "MAIA serves the person, not the data model" is either true in the
storage layer or not true at all.

## 3. What the incident taught: Sanctuary is a posture, not a place

The pre-incident architecture imagined Sanctuary as a *kind of session* — a room you
enter, whose whole record is then handled specially. The member's actual behavior
falsified that model in the first real use: they entered Sanctuary partway through an
ordinary session and (presumably) would have left it the same way. The session was
neither sanctuary nor standard; individual *exchanges* were.

Hence the ratified sentence: *Sanctuary is not a session property. Sanctuary is a
per-turn posture.* — a governing condition attached to each exchange while it is
active. Three consequences:

1. **The unit of promise is the exchange**, not the container. Every turn carries its
   own answer to "what did the member believe was true when they said this?"
2. **Transitions are the hard case and the common case.** Entering mid-session,
   exiting mid-session, and the boundary turns on either side — the design must be
   built *from* the transitions, not have them bolted on.
3. **No retroactivity in either direction.** Entering Sanctuary does not unremember
   what came before; leaving it does not license remembering what happened inside.
   The posture in force when the turn occurred governs that turn forever.

## 4. What Sanctuary protects — a fuller account

- **The member's speech** — obviously: no content persistence, no derivation, no
  embedding, no pattern formation, no theme signal, no telemetry that carries text.
- **The member's self-relation.** Sanctuary lets someone say a thing *in order to
  hear themselves say it*, without that utterance becoming part of who the system
  thinks they are. It protects the right to try on a thought without being updated
  toward it. (This is why even *derived* artifacts — an inferred theme, a shifted
  spiral state — violate the posture: the member didn't consent to becoming
  different in the system's eyes.)
- **The relationship itself.** A companion who might be remembering when they said
  they weren't is worse than a stranger. Sanctuary held is the strongest trust
  signal the platform can emit; Sanctuary broken is close to unrecoverable — which
  is why the notification to the affected member matters as much as the fix.
- **Everyone else's speech.** Every member who *never* uses Sanctuary still benefits:
  its existence, verifiably enforced, is what makes ordinary remembering feel chosen
  rather than inflicted.

## 5. What Sanctuary is not

- **Not deletion-after-the-fact.** Purge-at-finalize was the old backstop, and the
  incident showed its failure modes (race window; session record wrong; crash before
  finalize). The promise is *never written*, not *written then erased*. Suppression
  at the write boundary is the only architecture that matches the words.
- **Not a client feature.** A control the UI hides is a courtesy, not a boundary.
  The ratified rule: *Sanctuary content may not cross its boundary because a client
  failed to hide a control.*
- **Not overridable by the member mid-session.** Invariant 6 is deliberately
  absolute: nothing from a Sanctuary exchange can be converted to memory even by
  request during the session. The member who wants to keep something can say it
  again outside Sanctuary. This protects against the most subtle failure — the
  system (or a moment of the member) bargaining the boundary away from inside it.
- **Not metadata-free.** The system may know *that* a sanctuary exchange occurred
  (timestamp, duration, count) — indeed it must, or the promise is unauditable. The
  incident was found through exactly that metadata. What it may never know is what
  was said.
- **Not a mood or theme.** Sanctuary is binary and structural. There is no
  "semi-sanctuary," no gradient — a gradient would make the promise negotiable and
  therefore worthless.

## 6. The felt test

Engineering tests prove enforcement; this paper adds the relational test the
architecture must ultimately pass:

> A member should be able to end a Sanctuary exchange and feel the same way they
> feel after saying something aloud in an empty room: it happened, it mattered, and
> it is theirs alone.

And its inverse, the violation-shape to design against:

> The subtle violation is not the system quoting Sanctuary content back. It is the
> member noticing, weeks later, that MAIA seems to *know them differently* in a way
> only the Sanctuary conversation explains.

That second shape is why derived artifacts matter as much as transcripts, and why
provenance (the companion paper) is Sanctuary's real enforcement substrate: the only
way to guarantee nothing downstream carries the exchange is for every downstream
object to prove where it came from.

## 7. Questions this paper hands to the Jondi session

The engineering account stops where lived experience begins. Carried into the
hospitality session (frame doc): what does it *feel* like to be remembered
appropriately; what should MAIA never carry even with permission; whether the
Sanctuary toggle's placement and language honor the gravity of the gesture; whether
"this session won't be remembered" is the right sentence now that the truth is
per-exchange rather than per-session. That last one is a live copy question: the UI
words say "session," the constitution now says "posture" — the words may need to
follow.

## 8. Closing

Sanctuary is the smallest feature on the platform and the largest claim it makes.
The incident did not weaken that claim; it located exactly where the claim must
live — at the write boundary, per turn, provable, restore-safe — and the platform
now enforces it there. What remains is the human half: the member who was owed the
promise gets told the truth, and the words in the interface get brought up to the
standard of the architecture underneath them.
