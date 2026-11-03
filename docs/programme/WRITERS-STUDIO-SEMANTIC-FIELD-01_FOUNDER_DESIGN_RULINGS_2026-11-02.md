# WRITERS-STUDIO-SEMANTIC-FIELD-01 — founder design rulings after the first witness

```
STATUS:     FOUNDER RULINGS (in session, 2026-11-02). Design direction for the lane's next builds.
GROUNDS:    WRITERS-STUDIO-SEMANTIC-FIELD-01_MAIA_FIELD_WITNESS_RESULT_2026-11-01.md (first run, #2046)
            WRITERS-STUDIO-SEMANTIC-FIELD-01_MAIA_FIELD_WITNESS_RERUN_2026-11-01.md (Q3–Q5 re-run, #2052)
OWNER:      WRITERS-STUDIO-SEMANTIC-FIELD-01. Teaching wording and the Learning depth stay with the
            implicit-Academy work (#2045 / #2047); Design 3 is coordinated with it, not taken from it.
NOT:        Implementation. Each design is built and reviewed in its own PR, with tests, and deployed
            only by a separate founder act.
```

## Design 1 — MAIA knows the Studio's own tools · **ruled: A now, then B**

**Finding.** No Studio control name ("Craftsman's Table", "Show revision options", Develop's "Read this
chapter", "Edit with MAIA → Start an editorial pass", "Start a new conversation") appears in anything MAIA is
sent. So "how do I…" questions (Q4, Q5) get workarounds such as "paste the sections to me".

- **A (now): a Studio guide in MAIA's context.** A short, plain-language description of each tool (what it
  does, where it lives) is given to MAIA in every Studio conversation. It lives in one module, with a test
  that fails if the guide names a control the Studio does not have, so MAIA cannot be told about an invented
  feature (the protocol's most serious class, WRONG). Acceptance: Q4 and Q5 re-run and point accurately.
- **B (next): "take me there".** MAIA may offer a control in her reply ("Open Craftsman's Table on this
  passage", "Go to *The Fifth Element: Aether*"). The writer clicks; MAIA never acts on her own. Each action
  has its own safeguards. B builds on A's guide and opens only after A's re-run.
- **Not chosen: C, a separate help panel**, against the founder's direction that *an unanswered "how do I"
  is a gap in MAIA, not a reason for another help panel.*

## Design 2 — a fresh start in the Work conversation · **ruled: A**

**Finding.** Every Work-conversation question joins one running conversation, so earlier turns steer later
ones (Q4: "I gave you that answer a moment ago"). The Work conversation already supports several
conversations per Work (the writer picks, none privileged by position) but has no way to start another.

- **A: "Start a new conversation" in the Work conversation**, matching Passage Focus (#2048). The next message
  opens a new conversation beside the old one. Earlier conversations stay saved, listed and reopenable.
- **Not chosen:** automatic fresh starts (the system deciding when a conversation ends), or a per-question
  "ignore history" (confusing; it hides what MAIA saw).

## Design 3 — the free "Ask MAIA" box · **ruled: C**

**Finding.** A typed question goes out with no conversational shape, at the default depth. Q3 in the box
gave 364 words and several observations; "Teach me about this" gave 142 words and one idea.

- **C: conversation by default, the full answer when asked.** Replies lead with the most important thing,
  stay short, and end with a question the writer steers by. When the question itself asks for breadth
  ("give me all of it", "list…"), MAIA gives it in full. MAIA judges what the *question* asks for, never the
  writer's level (L6c).
- **Coordination.** The implicit-Academy work owns teaching wording and the Learning depth. The default
  conversational wording is placed where its teaching module can share it, and that session is told before
  any build, so the two shapes cannot drift apart.
- **Not chosen:** A (leave as is: info dumps stay possible on every typed question); B (one idea for every
  question: rations answers the writer explicitly asked for in full).

## Order

1. Design 1A (Studio guide), then a Q4/Q5 re-run.
2. Design 2A (fresh start in the Work conversation).
3. Design 3C, after telling the implicit-Academy session.
4. Design 1B, after 1A's re-run shows accurate pointing.
