# Soul Portrait Pilot — Encounter Verification Protocol

**Layer 3: Experience**

| | |
|---|---|
| **Version** | 1.0 (Draft) |
| **Status** | Ready for first production run |
| **Date** | 2026-07-07 |
| **Feature under test** | Session Room / Living Encounter — the *threshold* into a shared relational space |
| **Audience** | Engineers · designers · practitioners (internal) |
| **Companion docs** | `docs/ops/COLAB_RELEASE_GATE.md` · `SOUL_PORTRAIT_PILOT_ONE_PRACTITIONER_JOURNEY.md` |

---

## 0. What this is — and is not

This is **not** a feature demo, **not** QA in the conventional sense, and **not** usability testing alone. Infrastructure and deployment have already been verified (Layers 1–2, below). This is an **observational study of one constitutional design decision under real conditions**.

It is **not**:
- a marketing demonstration
- a product launch
- a claim that the architecture is already validated
- proof of psychological effectiveness

The purpose is **to learn**. Only repeated observation — not expectation — should determine future design decisions.

---

## 1. Purpose

This protocol defines the purpose, method, and evaluation criteria for the first production verification of the Soul Portrait Encounter.

The objective is not simply to determine whether the software functions. It asks a different question:

> **Can a deliberately designed relational threshold create a qualitatively different experience of entering a shared conversation?**

This is the first investigation of that question in production.

---

## 2. What is being investigated — three layers

| Layer | Question | Status |
|---|---|---|
| **1 — Infrastructure** | Does the system work technically? (consent records created; threshold links function; participants enter; audio connects; TURN/relay works; Session Room reliable) | Largely verified |
| **2 — Capability** | Does the designed workflow perform as intended? (individual links; independent consent; entry requires threshold completion; no participant bypasses the constitutional sequence; the room opens only after the threshold is crossed) | Substantially verified |
| **3 — Experience** | **Does the experience itself change because of the threshold?** | **The focus of this pilot** |

Layer 3 is **not** whether participants "liked" the software. It is whether the threshold **meaningfully changes the quality of entering a shared relational space**. Possible observations include greater presence, increased intentionality, reduced awkwardness, a stronger sense of entering together, increased psychological safety, deeper attention — **or no observable difference. Every outcome is valuable.** The goal is observation rather than confirmation.

---

## 3. Constitutional principle under test

The platform is built on a simple constitutional idea:

> **A meaningful relational space should not begin accidentally.**

Participants intentionally cross a threshold before entering the conversation. The threshold is therefore **not merely authentication — it is part of the encounter itself.** This pilot investigates whether that architectural decision produces observable human consequences.

---

## 4. Hypotheses

State the hypotheses before the run; record observations before interpreting them against these.

- **H1 (primary).** Crossing a deliberately designed threshold changes the *lived quality* of entering a shared conversation — in presence, intentionality, or the felt sense of entering *together* — relative to a conventional "click a link and you're in" video call.
- **H0 (null).** The threshold produces **no observable difference** in the lived experience of entering. *This is a fully valid, informative outcome and must be recorded as such — not treated as failure.*
- **H-alt (alternative / unexpected).** The threshold produces an effect **other than the ones anticipated** — including a *negative* one (e.g., friction, self-consciousness, delay that dissipates presence). Unexpected effects are first-class findings.

**Falsification stance.** A single session neither confirms H1 nor establishes H0. The protocol is exploratory; hypotheses are adjudicated only by **patterns across repeated encounters**.

---

## 5. Method — test procedure

### 5.1 Preparation
- One practitioner
- One guest
- Two independent devices
- Stable internet connection
- Guest **preferably on cellular** if relay (TURN) behavior is being verified

### 5.2 Encounter creation
An encounter is created in production. The system generates **one practitioner link** and **one guest link**. Each participant receives **only their own link**.

### 5.3 Threshold
Each participant **independently**: opens their link → reviews the threshold → provides consent → enters the Session Room. **No participant may bypass the threshold.**

### 5.4 Conversation
Conduct a **natural, unscripted** conversation of approximately **10–15 minutes**. The purpose is to let the technology become background while observing the experience of entering *through the threshold*.

---

## 6. Participant instructions

Give these to both participants **before** the session. Keep them minimal — over-instruction contaminates the observation.

**Both participants:**
1. Open **only** the link addressed to you. Do not share or swap links.
2. Move through the threshold at your own pace. Read it; don't rush it.
3. Have the conversation you would naturally have. There is no script and nothing to perform.
4. Afterward, you will be asked to write down a few observations **on your own, before discussing** them with the other participant. Please honor the "write first, talk second" order — it protects the honesty of the data.
5. If nothing felt different, **say so plainly.** "No difference" is a valuable and welcome answer.

**Practitioner, additionally:** do not facilitate or coach the guest through the threshold. Let their crossing be their own; the point is to observe an unaided entry.

---

## 7. Facilitator instructions

The facilitator sets up the encounter and stewards the record — **not** the experience.

1. **Before:** create the encounter in production; confirm each participant has received only their own link; confirm both devices/network meet §5.1.
2. **During:** observe unobtrusively. Do **not** narrate, reassure, or prompt reactions. Note the timeline (see log): when each participant crossed the threshold, when the room opened, when conversation began, any technical events.
3. **Immediately after:** hand each participant the observation prompts (§8) and enforce **independent recording before discussion**.
4. **Interpretation comes last.** Record raw observations first; only then synthesize. Never edit a participant's words toward the hypothesis.
5. **One session proves nothing.** Log it, file it, and let patterns accumulate across encounters.

---

## 8. Data collection

Immediately afterward, **both participants independently record observations before discussing them together.** Prompts (answer only those that apply; brevity is fine):

**Technical**
- Did everything function? Any connection problems? Did audio remain stable? Was relay functioning when expected?

**Experiential**
- Did entering feel intentional? Did the threshold affect your state of mind? Did the conversation begin *differently* than a normal video call? Did the technology disappear into the background? When did the conversation begin to feel "real"?

**Relational**
- Did you feel more present? More connected? More attentive? No different? Something unexpected?

---

## 9. Observation log (per session)

Complete one log per encounter. Keep raw entries verbatim.

```
ENCOUNTER LOG — Soul Portrait Encounter Verification
────────────────────────────────────────────────────
Session ID:              ____________________
Date / time:             ____________________
Facilitator:             ____________________
Practitioner:            ____________________   Device / network: ____________
Guest:                   ____________________   Device / network: ____________ (cellular? Y/N)

TIMELINE (facilitator)
  Practitioner crossed threshold at:  ____
  Guest crossed threshold at:         ____
  Room opened at:                     ____
  Conversation began at:              ____
  Technical events (drops, relay, audio): ______________________________

TECHNICAL RESULT
  Everything functioned?  Y / N   Notes: ______________________________
  Relay behaved as expected?  Y / N / N/A

PARTICIPANT OBSERVATIONS  (recorded independently, BEFORE discussion)
  Practitioner — experiential: ______________________________________
  Practitioner — relational:   ______________________________________
  Guest — experiential:        ______________________________________
  Guest — relational:          ______________________________________
  "When did it feel real?" — practitioner: ______  guest: ______

UNEXPECTED / NEGATIVE OBSERVATIONS
  ______________________________________________________________

SHARED DISCUSSION (after independent recording)
  ______________________________________________________________

FACILITATOR NOTE (interpretation LAST, kept separate from raw data)
  ______________________________________________________________
```

---

## 10. Evidence standard

This pilot is exploratory.
- **No single session proves the hypothesis.** One unsuccessful session disproves nothing.
- The purpose is disciplined observation. **Patterns may emerge only after multiple encounters.**
- **Record evidence before interpretation** whenever possible.

---

## 11. Success criteria — evaluated independently per layer

**Technical success**
- System operates reliably; threshold functions correctly; Session Room performs as designed.

**Constitutional success**
- The intended sequence **cannot be bypassed**; participants experience a genuine transition into shared space.

**Experiential success** — the central research question:
> **Did the threshold measurably influence the lived experience of entering the conversation?**

If participants consistently report that entering feels different in meaningful ways, that is evidence the constitutional design is **affecting lived experience** rather than merely enforcing workflow. If no meaningful difference is observed, **that finding is equally valuable** and should inform future design.

---

## 12. Expected outcome

At the conclusion of the pilot, the team should have enough evidence to answer three questions:

1. Does the system work reliably? *(Layer 1)*
2. Does the constitutional workflow operate as designed? *(Layer 2)*
3. Is there evidence that intentionally crossing a relational threshold changes the lived experience of entering an encounter? *(Layer 3)*

Only **repeated observation — not expectation** — should determine future design decisions.

---

*Protocol v1.0 · revise as encounters accumulate · a change of method or prompts increments the version and is noted here.*
