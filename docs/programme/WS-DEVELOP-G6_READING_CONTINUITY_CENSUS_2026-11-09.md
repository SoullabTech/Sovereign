# G6 — a reading MAIA made does not reach the next conversation: census and proposed design (2026-11-09)

Status: **read-only census + design proposal.** No source changed for G6. Lane: Writer's Studio (#1800). Founder decision needed (§4).

## 1 · The defect, as witnessed (production, 2026-11-08, #1800 comment 6722897723)
Develop → "Read this chapter" on Chapter 10 completed (201, after several minutes) and the reading named the hiker-with-a-map image.
Immediately after, in the Work conversation, MAIA said the only Chapter 10 text she had was the epigraph and headings, "I won't guess", and told the
writer to press "Read this chapter" — the button pressed a minute earlier. Also seen: an unbounded reading wait; Send silently disabled until a
conversation was chosen.

## 2 · Three causes (code-read on `8a7b83659`)
1. **No chapter text in the conversation.** The Work conversation could see one passage at most. → **Repaired on this branch only when the writer grants the standing reading permission** (Part B). Without the grant the defect remains exactly as witnessed.
2. **MAIA is instructed into the loop.** `lib/writersStudio/studioGuide.ts:66` tells MAIA, whenever reading more would help, to *point them to "Read this chapter"*; `studioActions.ts:31` offers a "Go to Read this chapter" control in the Work conversation. Nothing tells her a reading was just made, so she sends the writer back to it.
3. **Her own completed reading is never given to the conversation.** `developmental_readings` stores her observations, the `revision_number` she read, and per-section `(revisionNumber, codePointRange, digest)` in `read_state` — but the Work conversation is deliberately built without a frozen reading (`ask/route.ts` ~401: *"a Work conversation HAS no frozen reading"*). Only an observation-anchored conversation (BUILD-07E) loads one.

## 3 · Proposed design
- **(a) Carry her account, labelled by revision.** When the writer has commissioned a reading that covers the chapter in focus (or the chapters a question names), the conversation receives MAIA's own observations from the **latest** such reading, labelled with the revision it was made on and, per chapter, whether the saved text has changed since (her stored digest vs now). Her account is her words under the writer's commission; it is presented as *her earlier reading, which may be wrong*, never as fact, and never as the writer's view.
- **(b) Text stays under the standing permission.** A reading commission does **not** become permission to supply chapter text to the conversation. If the writer has not granted standing reading, MAIA says exactly what she has (her reading of Chapter 10, from revision N) and offers **"Let MAIA read my saved work"** — not the reading button.
- **(c) End the loop.** The guide stops sending the writer to "Read this chapter" when a current reading of that chapter already exists; it names the permission instead, or nothing.
- **(d) Honest revision record.** Each turn records which reading (id, revision) and which chapter texts (digests) it was given — extending the per-turn read record that already exists (`ask_turn_reads`) — so "what did MAIA have when she said this" is answerable afterwards.

## 4 · The one decision needed
**May MAIA's completed reading (her observations, labelled by the revision she read) be carried into later Work conversations about that Work, on the consent the writer gave when commissioning it — while chapter text itself still needs the standing permission?**
Recommended: **yes, on those terms.** It is her own account, made under the writer's commission, and it is exactly what the founder walk expected her to remember. Sanctuary excludes it, as with everything else.

## 5 · Acceptance (each refuses or degrades honestly, never guesses)
Read Chapter 10 → ask about its image in the conversation → she answers from her reading (and from the text if permitted), naming the revision ·
edit Chapter 10 → she says the chapter has changed since her reading · no permission → she offers the permission, not the button ·
Sanctuary → nothing carried · another Work's reading never appears · revoked permission → text stops, her account remains labelled ·
a newer reading supersedes an older one · per-turn record names the reading and the digests.
Separately tracked tester-facing defects from the same witness: the unbounded reading wait, and silent disabled Send.
