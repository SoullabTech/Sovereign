# Contact Signal Typology

A working classifier. Four categories of practitioner / tester contact, plus an "unclear" catch-all. Used during intake (see `contact-intake-template.md`) to determine response posture before routing.

Not every contact maps cleanly. When in doubt, mark as "unclear" and observe further — the typology serves discernment, not labeling.

---

## 1. Coherence violation

**Definition:** The system contradicted one of its own conditions.

**Recognition signs:**
- The user's experience matches a failure mode the architecture explicitly tries to prevent.
- The friction is structural, not preferential — present regardless of user taste.
- The contradiction would still hold if no one had reported it.

**Common phrasings:**
- "It just disappeared / forgot / pulled the plug."
- "It said it would [X] but [Y] happened."
- "I felt watched / extracted / interpreted."

**Response posture:** High attention. Structural fix likely warranted. Confirm by checking against existing canon before implementation.

---

## 2. Phenomenological signal

**Definition:** Reveals lived experiential truth — how the system actually lands for someone in real conditions. May or may not point at architecture.

**Recognition signs:**
- Specific, embodied, situated language.
- Names something the architecture didn't anticipate but doesn't necessarily contradict.
- Often delivered as feeling-report rather than fix-request.

**Common phrasings:**
- "It felt like…"
- "Something shifted when…"
- "I noticed I was…"

**Response posture:** Observe longitudinally. Single phenomenological reports are signal; patterns across multiple reports are architecture. Don't act on one.

---

## 3. Preference / workflow suggestion

**Definition:** "It would be nice if…" — a feature wish, often importing convention from other tools.

**Recognition signs:**
- Frame is functional rather than relational.
- The suggestion describes a *solution* rather than a *condition*.
- Could be ignored without contradicting MAIA's coherence.

**Common phrasings:**
- "Could you add…"
- "What about a [feature]…"
- "Like how [other app] does it."

**Response posture:** Low-weight consideration. Acknowledge sincerely. Do not implement reflexively.

---

## 4. Imported expectation

**Definition:** The user is importing assumptions from other systems and experiencing dissonance when MAIA refuses those assumptions.

**Recognition signs:**
- The friction reduces to "MAIA isn't doing what [other system] does."
- The "fix" would require MAIA to violate its own conditions.
- Often phenomenologically indistinguishable from a coherence violation.

**Common phrasings:**
- "Why doesn't it [extractive / engagement-pattern behavior]…"
- "It should remember / track / optimize / notify…"
- "Other AI does X."

**Response posture:** Usually not architectural. May warrant orientation — not implementation. Worth tracking longitudinally to see whether MAIA's refusal is landing legibly over time.

---

## 5. Unclear — observe further

When you can't confidently place a contact in one of the four. Keep it in observation. Don't force categorization for the sake of completing the form.

---

## Hard discriminator

The most important and most difficult call is **coherence violation vs imported expectation**. Both feel like coherence violations to the person reporting them.

The discriminating question:

> Is the system violating its own conditions, or is the user importing conditions from elsewhere?

When uncertain, hold the contact in observation. Don't route to implementation until the call is clear.
