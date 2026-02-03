# Demo Script: "Show Why" Pattern Transparency

**Duration:** 60-90 seconds
**Audience:** Team, partners, or advisors
**Setup:** Browser open to localhost:3000/maia (or production URL)

---

## Pre-Demo Setup (do this before the call)

Open browser console and paste:
```javascript
localStorage.setItem('explorerId', 'proof-ritual-user-001');
localStorage.setItem('explorerName', 'Pattern Tester');
location.reload();
```

---

## The Script

### Opening (10 seconds)

> "I want to show you something we shipped this week. Most AI systems either forget everything or remember silently. We built a third path."

### Action 1: Send a message (10 seconds)

Type: `Hi, what have you noticed about me?`

> "Watch what appears under MAIA's response."

*Wait for response to load*

### Action 2: Point to the chips (15 seconds)

> "See these amber chips? Each one is a pattern MAIA has detected over time. Not assertions—hypotheses backed by evidence."

*Hover over a chip*

> "This one says 'recurring somatic: chest'—MAIA noticed this person frequently references chest sensations."

### Action 3: Click the chip (20 seconds)

*Click the chip to open the drawer*

> "When I click it, MAIA shows her receipts. These are the actual memories that support this pattern—timestamped, linked, traceable."

*Scroll through evidence if there's more than one item*

> "The user didn't ask for a diagnosis. MAIA is showing *why* she believes something, not just *that* she believes it."

### Action 4: Show the feedback buttons (15 seconds)

*Point to the three buttons*

> "And here's the key: the user can confirm, reject, or refine this pattern. Memory becomes collaborative, not surveillance."

*Click "Confirm" (or just hover)*

> "That feedback goes back into the system. Truth stays consensual."

### Closing (10 seconds)

> "This is what we mean by sovereign memory. MAIA can hold someone's story over time—without betraying the storyteller."

---

## Key Phrases to Use

If someone asks "how is this different from other AI memory?":

> "Most systems remember facts. We remember patterns—and we can show exactly why we see them."

If someone asks "what prevents this from being creepy?":

> "Three things: the user can see everything, reject anything, and nothing crosses between users. Memory is transparent, consensual, and isolated."

If someone asks "is this real or a mockup?":

> "This is live. The patterns you see came from actual events processed through the system. The database has the provenance graph right now."

---

## Fallback: If Chips Don't Appear

Open DevTools → Network → click the `/api/between/chat` request → show the Response:

```json
"metadata": {
  "patterns": [
    {"key": "recurring_somatic:chest", "seen": 6, "sig": 0.95},
    ...
  ]
}
```

> "The backend is delivering the patterns correctly—we just need to pick them up in the UI render. The architecture is complete."

---

## Post-Demo Questions to Invite

- "What patterns would you want MAIA to notice in your own work?"
- "How might this change the relationship between a person and their AI companion?"
- "What would it take for you to trust a system that remembers you?"

---

*Last updated: December 31, 2024*
