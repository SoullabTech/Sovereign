# WRITERS-STUDIO-SEMANTIC-FIELD-01 — Design 1B "take me there": proposed shape

```
STATUS:     PROPOSAL for founder ruling. Implements Design 1, option B, ruled 2026-11-02 ("A now, then B";
            record: …_FOUNDER_DESIGN_RULINGS_2026-11-02.md, PR #2056).
PRECONDITION MET: 1A's re-run pointed accurately (Q4, Q5 DOES on Passage Focus and the Work conversation;
            witness records #2060, #2074).
NOT:        Implementation. Nothing here is built until the founder rules on §5.
```

## 1. What the ruling fixed

MAIA may **offer** a control in her reply; **the writer clicks**; MAIA never acts on her own; **each action has
its own safeguards**. B builds on A's Studio guide (`lib/writersStudio/studioGuide.ts`).

## 2. Mechanism (recommended)

- MAIA may end a reply with at most one **closed marker**, e.g. `[[studio:develop-overview]]`. She's told the
  action ids alongside the Studio guide.
- The Studio **parses replies against a closed allowlist**. A known marker becomes a button under the reply,
  labelled with the real control's name. **Every** marker, known or unknown, is stripped from the text shown.
  An unknown or malformed marker never appears as text and never becomes a button.
- The button **only takes the writer somewhere**. It never sends a message, starts a reading or pass, grants
  read permission, applies or saves text, or chooses a posture.
- **Stale guard:** a button belongs to the reply and the Work (and passage) it was made in. If the writer has
  since moved to another Work or passage, it's shown disabled with "This was about another place."
- No new server authority: the marker is text MAIA wrote; meaning comes only from the client allowlist.

## 3. First actions (navigation only)

| Marker | Button | Where it takes the writer | Never does |
|---|---|---|---|
| `develop-overview` | Go to "Read this chapter" | Develop → Overview for this Work | press Read this chapter |
| `editorial-pass` | Go to "Start an editorial pass" | Develop → Edit with MAIA for this Work | start the pass |
| `craftsmans-table` | Open Craftsman's Table here | Craftsman's Table on the passage already in Focus (Passage Focus only) | send, revise or apply |
| `new-conversation` | Start a new conversation | same as the header control (sets the conversation aside; it stays saved) | delete anything |

**Where buttons appear (v1):** Passage Focus replies and the Work conversation. The Develop dialogue and Review
are left for later, so no other surface shows a raw marker. MAIA is told about markers **only** on those two
paths.

## 4. Deliberately not in v1

- **"Go to section *X*".** MAIA names sections by heading, and headings aren't unique. In ELEMENTAL_ALCHEMY,
  "Integrating the Elements" appears twice (witness #2060), so a heading match could take the writer to the
  wrong place. It needs section ids that MAIA is given and cannot invent. That's a separate step.
- Any action that runs something (a reading, a pass, a revision) instead of opening the place to run it.

## 5. Founder question

Approve the v1 action set in §3, with "go to section" deferred as in §4?

**Recommended: yes.** Every v1 action is reversible navigation with no new authority, and the one action that
can land somewhere wrong is held back until it can be made exact.

## 6. Tests owed with the build

- Allowlist: each known marker renders its button; an invented marker (e.g. `[[studio:delete-work]]`) renders
  nothing and is stripped.
- No raw `[[studio:` ever reaches the screen in Focus or the Work conversation, including stored history.
- Each button's handler only navigates (no send, no read, no apply), tested on the rendered component.
- Stale guard: a button from another Work or passage is disabled.
- The guide's marker list and the client allowlist are the same set (one module).
