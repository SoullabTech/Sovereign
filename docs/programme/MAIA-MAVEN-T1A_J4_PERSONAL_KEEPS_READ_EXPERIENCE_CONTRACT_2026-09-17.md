# MAIA-MAVEN-T1A — J4 PERSONAL KEEPS READ EXPERIENCE CONTRACT

**Status:** J4 EXPERIENCE CONTRACT CANDIDATE COMPLETE · **FOUNDER WITNESS PENDING** · **J5 NOT OPENED** · ⛔ **NO IMPLEMENTATION AUTHORIZATION**  
**Date:** 2026-09-17  
**Evidence base:** `84a739f9138f50e19f3ad716720b398856689262`  
**Authority:** `MAIA-MAVEN-T1A_FOUNDER_ADJUDICATION_2026-09-17.md`  
**Substrate:** `MAIA-MAVEN-T1A_J3_PERSONAL_KEEPS_READ_SUBSTRATE_2026-09-17.md`

---

## 0. Purpose

J3 established that the Personal Keep selector already exists but the explicit invocation and governed Keep→MAIA disclosure crossing do not.

J4 defines the member experience that any later implementation must preserve.

The question is not “what UI should we add?” It is:

> **When a member asks MAIA about their Personal Keeps, what act have they performed, what exactly may cross for that response, and what must remain outside the act?**

No source, schema, route, prompt, test, migration, capability registry or member-facing surface is authorized by this record.

---

# 1. Experience principle

A Personal Keep is something the member deliberately chose to hold.

Reading Keeps should therefore feel like **the member opening their own drawer**, not MAIA searching the member behind their back.

The experience is:

```text
member asks
    ↓
MAIA looks only because asked
    ↓
MAIA returns only what the request authorized
    ↓
the authority ends with that response
```

Not:

```text
member mentions a theme
    ↓
MAIA silently searches Keeps
    ↓
MAIA decides which old material matters now
```

The first preserves authorship. The second converts a member-owned archive into ambient system initiative.

---

# 2. Three acts that must never collapse

## A. NAVIGATE

Examples:

```text
“Open Keeps.”
“Take me to Keeps.”
“Show me the Keeps room.”
```

Meaning:

> **Operate the House. Take me to the room.**

Authorized consequence:

```text
navigation only
```

Not authorized:

- reading Keep rows into cognition;
- summarizing Keeps;
- selecting a Keep;
- changing return preferences;
- treating navigation as memory consent.

**Law:** opening the room is not opening the contents to cognition.

---

## B. INVENTORY READ

Examples:

```text
“What have I kept?”
“Show me my Keeps.”
“Which of my Keeps mention grief?”
“What did I keep about the move?”
```

Meaning:

> **For this response, read my Personal Field / Portfolio Keeps and show me what is there.**

Authorized consequence:

```text
one bounded Personal Keeps READ
```

The request authorizes MAIA to receive a truthful Keep projection for this answer only.

It does **not** grant standing permission for later turns.

---

## C. WORK WITH A KEEP

Examples:

```text
“Let’s look at the second one.”
“Bring that Keep into this conversation.”
“Reflect with me on that Keep.”
“What was behind that one?”
```

Meaning:

> **Take one identified Keep deeper than inventory.**

This is a distinct act from inventory retrieval.

**First-cut ruling candidate:** T1-A v1 does **not** implement this deeper act. It remains deferred until source-native detail resolution and its crossing scope are separately governed.

The first cut may show that a Keep exists without claiming it can lawfully reconstruct everything behind it.

---

# 3. The first-cut scope

The first T1-A capability should be **inventory-level Personal Keeps READ only**.

It may return fields proved by the qualifying Keep row itself:

```text
member-facing title
source type / plain-language source label
kept date
status, where useful
stored spontaneous body/snippet, when the Keep itself owns that body
```

Internal identity may travel for continuity of the response but need not be exposed as UI copy.

For sourced Keeps whose body remains in another domain table, the first cut must **not** dereference that source merely because an atom points to it.

The truthful experience is:

> “Here is what you kept.”

not:

> “Here is everything behind each thing you kept.”

---

# 4. Ordering is chronology, not judgment

Default ordering follows the member's own Keep act:

```text
most recently kept → earlier kept
```

No:

- relevance score;
- significance score;
- emotional intensity score;
- “best” Keep;
- system-curated priority;
- inferred importance.

For a filtered request such as:

```text
“Which of my Keeps mention grief?”
```

filtering may narrow by text available inside the lawful Keep projection, but the surviving rows remain ordered by member Keep chronology rather than system relevance.

---

# 5. Boundedness and continuation

The conversational answer should remain small enough to feel like orientation, not a data dump.

**Candidate first-cut experience ceiling:** show at most **five** matching Keeps in one response.

If more exist, MAIA may truthfully say there are more and offer:

```text
“Show me more.”
```

That second request is another explicit member act and another bounded read.

The exact numerical ceiling is part of the J4 founder witness; it is not implementation authority merely because it appears here.

---

# 6. Empty and partial truth

The first cut must distinguish **no Personal Keeps found** from **no Keep-family objects exist anywhere**.

If no Personal Field / Portfolio Keeps match, MAIA may say the narrow truth, for example:

```text
“I don’t find any Personal Keeps matching that.”
```

It must not say:

```text
“You’ve never kept anything.”
```

because Press Keeps, Marked Moments or Reflection Capsules may exist outside T1-A.

Likewise, when a sourced Keep has no body available to this capability, MAIA must not invent or reconstruct the missing source detail.

---

# 7. Invocation grammar

## Clear INVENTORY READ

The following are direct enough to authorize one read:

```text
“What have I kept?”
“Show me my Keeps.”
“List my Keeps.”
“Which Keeps mention X?”
“Do I have a Keep about X?”
```

## Clear NAVIGATION

The following authorize room operation but no disclosure:

```text
“Open Keeps.”
“Go to Keeps.”
“Take me to my Keeps.”
```

## Mention, not invocation

The following do **not** authorize a Personal Keeps read:

```text
“This reminds me of something.”
“Something from before feels relevant.”
“I’ve been thinking about grief again.”
“I know I saved things about this.”
```

MAIA may respond conversationally or ask whether the member wants her to look in Keeps.

She must not search first and ask later.

## Ambiguous Keep-reference

Example:

```text
“Something in my Keeps might be relevant.”
```

The member has named the domain but not clearly asked MAIA to search it.

The lawful response is an offer such as:

```text
“Want me to look through your Keeps?”
```

Only the member's subsequent yes / explicit request authorizes the read.

---

# 8. One-shot authority

An inventory read grants **response-scoped authority** only.

After the response:

```text
Keep remains stored
return_preference remains unchanged
ambient eligibility remains unchanged
future MAIA initiative remains unchanged
```

The read does not silently promote:

```text
member_pulled → contextual_doorway
```

and does not create standing authorization to keep mentioning the result.

If the member wants to continue with a Keep, they act again.

---

# 9. MAIA’s role in the first cut

MAIA is a **reader and witness**, not curator.

She may:

- faithfully list qualifying Keeps;
- name their member-facing titles;
- state when they were kept in ordinary human time;
- state the source kind in simple language where useful;
- show a stored spontaneous snippet when that content is part of the Keep itself;
- answer a direct inventory/filter question from the returned projection;
- say when nothing matches;
- offer to show more when the bounded response omitted additional matches.

She may not:

- choose which Keep is “most important”;
- infer why the member kept it;
- interpret patterns across Keeps;
- rank Keeps by present relevance;
- use Keep content not returned by the governed crossing;
- dereference arbitrary source material;
- merge Press Keeps, Marked Moments or Capsules into the result;
- claim a broader memory permission from this one read.

---

# 10. Conversational tone

The interaction should be ordinary and quiet.

Not:

```text
“I accessed your memory archive and found five highly relevant records.”
```

Not:

```text
“I remember what mattered most to you.”
```

Closer to:

```text
“You’ve kept a few things here. The most recent are…”
```

or for a filter:

```text
“I found two of your Keeps that mention grief…”
```

The language names the member's prior acts without turning them into MAIA's judgment.

---

# 11. The sacred `/maia` surface

T1-A must not redesign `/maia`.

The intended first-cut experience is conversational:

```text
member asks MAIA
        ↓
MAIA answers in the existing conversation
```

No new dashboard, permanent panel, rail redesign, card system, modal, badge, memory score or persistent chrome is required by this contract.

The existing Keeps room remains available for explicit navigation and member-managed interaction.

A later implementation may add only the minimum contextual affordance needed for truthfulness or continuation; J4 grants no visual redesign authority.

---

# 12. Failure experience

If the Keep disclosure boundary cannot be established, Keep material does not cross.

Ordinary conversation should remain available.

The member-facing response must not imply that MAIA looked and found nothing when the real event was a boundary failure.

The eventual implementation must distinguish at least:

```text
legitimate empty      → no matching Personal Keeps
boundary unavailable  → the governed read could not be established
```

Exact failure copy belongs to J5 implementation/witness, but the distinction is mandatory.

---

# 13. Sanctuary experience

Inside Sanctuary:

```text
Personal Keeps READ is unavailable
```

even though the Keeps themselves may exist outside the Sanctuary session.

Why: allowing prior durable memory into Sanctuary would violate the member's expectation that this encounter is held outside continuity.

J4 does not create an exception merely because the member explicitly asks inside Sanctuary.

The response should name the boundary plainly rather than perform amnesia or imply the Keeps do not exist.

---

# 14. First-cut state machine

```text
IDLE
 │
 ├── “Open Keeps” ───────────────→ NAVIGATE_ONLY → END
 │
 ├── ambient mention ────────────→ NO_KEEP_READ → ordinary conversation
 │
 ├── ambiguous Keep-domain ask ─→ OFFER_READ
 │                                  │
 │                                  ├── no → END
 │                                  └── yes
 │
 └── explicit inventory ask ───────────────┐
                                           ▼
                                  READ_REQUESTED
                                           │
                                  authority established?
                                    │             │
                                   no            yes
                                    │             │
                             NO_CROSSING       SELECT
                                                  │
                                          bounded projection
                                                  │
                                               CROSS
                                                  │
                                             ANSWER ≤ 5
                                                  │
                                  ┌───────────────┴───────────────┐
                                  │                               │
                             member ends                    “show more”
                                  │                               │
                                 END                       NEW READ ACT
```

There is deliberately no automatic transition from inventory answer to `WORK_WITH_KEEP` in T1-A v1.

---

# 15. Candidate founder witness

The J4 contract is successful if these feel like the same MAIA and the member remains unmistakably in control:

### Witness 1 — inventory

Member:

> “What have I kept?”

Desired experience:

> MAIA quietly returns a short chronological list of proven Personal Keeps, with no interpretation and no room transition.

### Witness 2 — filtered inventory

Member:

> “Do I have anything in my Keeps about grief?”

Desired experience:

> MAIA returns only matching Personal Keeps from the lawful projection, chronologically, and does not infer thematic similarity beyond the available text.

### Witness 3 — navigation

Member:

> “Open Keeps.”

Desired experience:

> The existing Keeps room opens. No Keep content was sent into cognition merely to navigate.

### Witness 4 — ambiguous mention

Member:

> “Something in my Keeps might be relevant.”

Desired experience:

> MAIA asks whether the member wants her to look. She does not search before permission.

### Witness 5 — depth boundary

After MAIA lists several Keeps, member says:

> “Let’s work with the second one.”

Desired v1 behavior:

> T1-A does not pretend it has full source depth. The future deeper capability remains visibly separate rather than smuggled into the first read.

---

# 16. J4 candidate verdict

The smallest coherent first experience is:

```text
PERSONAL KEEPS READ v1

explicit member inventory request
        ↓
response-scoped authority
        ↓
truthful Personal Keep projection
        ↓
chronological, bounded, non-interpretive answer
        ↓
authority ends
```

The first cut deliberately does **not** include:

- ambient Keep retrieval;
- automatic relevance selection;
- source-wide dereferencing;
- reflection across a selected Keep;
- patterning across Keeps;
- family-wide union with Press / Moments / Capsules;
- `/maia` redesign.

This is enough to make MAIA truthfully aware of what the member explicitly asks her to see without turning Keeps into another ambient memory channel.

---

# 17. Standing

```text
J0  Authority                     ✓
J1  Repository census             ✓
J2  Constitutional reconciliation ✓
    Founder adjudication          ✓
J3  Substrate audit               ✓
J4  Experience contract           CANDIDATE COMPLETE
    Founder experience witness    OWED
J5  Implementation                ⛔ NOT OPEN
```

**STOP for founder witness.**
