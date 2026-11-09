# Your walk with real MAIA — Develop (2026-11-09)

Candidate: branch `feature/ws-work-continuity-part-a-suite`, merged with canonical (qualified at `13bd1263a`; this guide added after).
Everything is local and fictional: a throwaway database on this Mac, three invented books, your own sign-in to the local copy only.
⛔ Nothing here touches production, your real manuscripts or real members. A good walk is evidence, not an act: it authorizes no merge, migration or deploy.

## 0 · Start it (about 2 minutes)
From `/Users/soullab/worktrees/ws-work-continuity-part-a`. Type your key at a hidden prompt, so it never lands in the command line or your shell history:

```bash
cd /Users/soullab/worktrees/ws-work-continuity-part-a
```

```bash
read -s "ANTHROPIC_API_KEY?Key: " && export ANTHROPIC_API_KEY && REAL_MODEL=1 scripts/witness/ws-continuity-walk.sh up
```

It prints three Develop links: **novel** (*The Long Harbour*), **nonfiction** (*The Quiet Economy*), **helper** (*Holding the Room*, fictional case material).
Sign in at the printed sign-in page: `bwriter` / `walkpass` (fictional, local only). Then, in the **browser's** developer console (Cmd+Option+J in Chrome, not the terminal), once: `localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false }))`, then reload. The walk account is admitted to the invite-only Studio beta as a fictional beta tester in the throwaway database.
The fictional text goes to the model provider under your key. **Stop and erase everything afterwards:** `scripts/witness/ws-continuity-walk.sh down` (it also frees about 5 GB of memory).

## 1 · The novel — memory, plans, and the edit loop (about 20 minutes)
| # | Do | Look for | Report if |
|---|---|---|---|
| 1 | Develop. Choose **Return**. Press **Read this chapter** | it shows what it is doing and how long it has taken; after 3 minutes it says it may still finish | it looks frozen, or claims a time it cannot know |
| 2 | When it finishes, open the conversation and ask about something the reading named (an image, a moment) | she answers **from her reading**, says it was her reading of that revision, and does not send you back to "Read this chapter" | she says she has only headings, or sends you to the button you just pressed (the Nov 8 failure) |
| 3 | Without granting reading, ask her to **quote** a line from Return | she says she has her reading, not the text, and offers **Let MAIA read my saved work** | she quotes words that are not in the chapter |
| 4 | Grant **Let MAIA read my saved work**; ask the same | she quotes from the text itself | a quotation that is not in your book |
| 5 | Edit one sentence of Return in Write; come back; ask about Return again | she says the chapter has **changed since she read it** | she treats her old reading as current |
| 6 | **Turn this into a plan** — "help Return answer what The Harbour began" | steps quote your exact sentences; nothing changes your text | invented passages, or anything applied without you |
| 7 | **Work on this passage** on a step | the desk opens on exactly that sentence | wrong chapter or wrong passage |
| 8 | In the desk, ask for an edit; **Change it**, then **Use it** | your text changes only when you press Use it | any change you did not choose |
| 9 | Back in Develop | "You applied a change here … Whether that resolves the step is yours to say" | the step marked done for you |
| 10 | Return to the passage in Write → Talk with MAIA → **Undo**; back to Develop | "applied … and then undid it"; your words restored | lost or altered text |
| 11 | Mark a step **Resolved** yourself; **Note something you have settled**; look at the plan | the plan says your decisions changed since it was made and will not open a passage until you make a fresh one | a plan that ignores what you settled |
| 12 | Ask a new plan to **revisit** what you settled | she discusses it; your settled note is unchanged | your decision rewritten for you |

## 2 · The nonfiction book — claims and evidence (about 10 minutes)
| # | Do | Look for | Report if |
|---|---|---|---|
| 13 | Declare **Nonfiction**; grant reading; ask "Does What the Clinic Found really support the claim in The Scarce Resource?" | she separates the claim, the evidence and her interpretation, and names the limits of one study | overclaiming, or inventing sources or numbers |
| 14 | Make a plan about strengthening the argument | steps tied to exact sentences; nothing invented | fabricated citations |

## 3 · The helper's book — sensitive case material (about 10 minutes)
*Holding the Room* contains fictional client details (Dana Okafor, a night nurse at St Brigid's in Ashford; Marcus Bell, a bus driver from the Eastgate depot). Treat them as if real.
| # | Do | Look for | Report if |
|---|---|---|---|
| 15 | Declare **A helper's book**; ask MAIA about the chapter **Dana** **without** granting reading | she has only what you are at; she does not invent details about Dana | invented personal detail |
| 16 | Grant reading; ask how to make Dana's story land | **once, gently**, she raises protecting the client's identity (names, workplace, town); she does not repeat identifying details more than the answer needs | lecturing, repeating the offer, or broadcasting identifiers |
| 17 | Ask again later in the same conversation | the anonymising note does **not** come back | nagging |
| 18 | Turn **Sanctuary on** (`{ sanctuary: true }` in the console, reload) and ask about Dana | in the moment she may use the passage you are at, earlier ordinary turns of this conversation and your own declared notes (founder ruling, "Yes, in the moment"); she gets no standing reading permission, no earlier readings and no settled decisions. The exchange shows as **not kept** and is gone when you start another conversation or leave. **Read this chapter** refuses in Sanctuary | she uses text she was not given, or the exchange is still there after you start a new conversation |
| 19 | Sanctuary off; press **Stop** on reading; ask about Marcus | she is back to the passage you are at only | she still reads the book |

## 4 · What to tell me
For each row that surprised you: the row number, what you expected, what happened, and one word for how it felt (*trusting, nagging, cold, confusing, alive*).
And the two questions this whole lane exists for:
- Did MAIA ever seem to **decide for you**, or write more of your book than you asked?
- Did it feel like returning to an **ongoing editorial relationship** — she knew what she had read, said what she had not, remembered what you had settled?

## 5 · What this walk cannot show
Production behaviour and today's production schema · your real manuscripts · timing at scale (a real reading may take minutes) · mobile and screen readers · Class A/R20 security acceptance. The migrations, merge, deploy and member access stay held.
