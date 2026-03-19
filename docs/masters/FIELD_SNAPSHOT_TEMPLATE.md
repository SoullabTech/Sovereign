# Field Snapshot Template

**Post-session artifact. Produced after first interview run + corrections.**
**Send to master. Keep Synthesis Gaps and Prompt Tweaks internal.**

---

## [Master Name] — Field Snapshot

*[Date of session]*

---

### Opening Line

> [One sentence that opens their field — in their voice, grounded in their exact words]

This should be usable as threshold copy. If it sounds like a tagline, rewrite it.

---

### Verbatim Phrases

3–5 lines pulled directly from their answers. No paraphrase.

- "[exact phrase from presence or paradox module]"
- "[exact phrase]"
- "[exact phrase]"
- "[exact phrase — especially anything that surprised you]"

These are seed phrases for MAIA, presence copy, and threshold language.

---

### The Paradox

> [Quality A] + [Quality B]

*Why both must be present:*
[Their words. Not a synthesis. What they said.]

*What gets lost without both:*
[What they said collapses into when only one shows.]

If this box sounds flat, the paradox wasn't captured. Do not send until this sounds like them.

---

### This Field Is For

[1–2 sentences. Their words. Who this is for, precisely.]

---

### This Field Is Not For

[1–2 sentences. Said plainly. Who it isn't for — as they said it.]

---

### One Thing That Surprised Me

[Something they said that you didn't expect. Not a compliment — an observation.]

This is for the master. It shows you were listening, not just extracting.

---

*This is a draft. Refine it. Correct it. It belongs to your field.*

---

---

# Internal: Synthesis Gaps List

**Do not send to master.**

After reviewing corrections and acceptance signals, document:

### Where She Corrected
- Module: [module name]
- Original synthesis: "[exact text]"
- Correction: "[what she wrote]"
- Edit type (if tagged): [tone / precision / boundary / paradox / misread]
- Note: [what this reveals about the synthesis failure]

### Where Language Drifted Generic
- Module: [module name]
- Phrase: "[the generic phrase]"
- Why it's generic: [could fit 50 people / no verbs / abstraction without behavior]

### Where Paradox Flattened
- What was written: [synthesis text]
- What was lost: [which pole disappeared or softened]

---

---

# Internal: Prompt Tweaks

**Do not send to master. Apply to `getSynthesisSystemPrompt` in route.ts.**

3–5 concrete changes based on her session:

1. **[module]**: Add instruction — "[specific negative example from her corrections]"
2. **[module]**: Strengthen — "[what the prompt missed]"
3. **base**: Add to constraints — "[pattern observed across multiple modules]"
4. **paradox**: [if paradox collapsed] Add explicit instruction: "[how to hold this tension better]"
5. **general**: [if compression was wrong] Adjust density instruction: "[match her pace better by...]"

Each tweak should be grounded in a specific correction, not a general hunch.
