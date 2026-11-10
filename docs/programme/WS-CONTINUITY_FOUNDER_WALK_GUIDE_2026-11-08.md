# Founder walk — returning to your Work (guide)

Candidate: branch `feature/ws-work-continuity-part-a-suite` at its pushed tip. **CORRECTION (verified 2026-11-08):** PR #2188 was MERGED to canonical at 18:15Z and carried only the
first two commits (the history-grounding prompt fix, `532ad427b`, and the Part B test suite, `9b99cd83b`). Everything else on this branch — the standing reading scope, the decision record,
the quote gates, the two migrations, the freeze guard, this harness — is **23 commits beyond canonical with NO open PR**. Earlier notes calling #2188 a draft were wrong. Nothing here touches production, your real database, or your real manuscripts.
This is **your** evidence: how it feels, and whether MAIA is actually right. Everything Claude Code ran was a test double, a throwaway database, or a stand-in model.

## 0 · Start it (one command)
From the worktree `/Users/soullab/worktrees/ws-work-continuity-part-a`:

```bash
scripts/witness/ws-continuity-walk.sh up
```
That makes a throwaway local database, loads a fictional writer and a four-chapter fictional book (*The Long Harbour*), and starts a local copy of the app. It prints a sign-in URL.
Sign in with the **real sign-in page**: `bwriter` / `walkpass` (fictional, local only). Then open the Develop URL it prints.

**Which MAIA do you want?**
- Default: a **stand-in** model. It answers with one line saying which chapters it was handed, and offers a scripted edit. Use this to check the *plumbing* (what she is given, what is recorded). It cannot tell you whether MAIA is good.
- To meet **real MAIA** on the fictional book: `REAL_MODEL=1 ANTHROPIC_API_KEY=… scripts/witness/ws-continuity-walk.sh up`. The fictional text goes to the model provider using the key you typed in that command. Nothing real is involved.

Stop and erase everything: `scripts/witness/ws-continuity-walk.sh down`.

## 1 · The walk (about 25 minutes)
Do these in order. After each, note what you *felt*, not only what happened.

| # | Do | You should see | If not, report |
|---|---|---|---|
| 1 | Develop → **Talk with MAIA about this** | the conversation opens; a line "MAIA reads only the passage you are in." with two buttons; a "Note something you have settled" button | anything missing or confusing |
| 2 | Ask: *"How does the Return chapter land?"* with **no** permission given | she only has The Harbour (stand-in: lists "The Harbour"). Real MAIA should say she can't see Return, not guess | she claims to have read Return |
| 3 | Press **Let MAIA read my saved work** | the line changes. **First time on this machine** it also says your Sanctuary setting could not be read. That is expected (see §3) | the line promises a read that does not happen |
| 4 | Make the Sanctuary setting known (§3), reload, ask the same question | she now has Return (stand-in lists chapters). Real MAIA answers about Return *without* you opening Write | you still have to open the chapter first |
| 5 | **Leave and return**: close the tab, reopen the Develop URL, choose the conversation, ask: *"What holds across the whole book?"* | she has all four chapters; the earlier thread is there | she forgets, or says she invented something she quoted before |
| 6 | Edit a chapter in Write (change a sentence), come back, ask about it | she tells you that passage has changed since she last saw it. (This is the moved-text note on her READS; it is route-tested. It is **not** the version-binding of *decisions*, which is still unbuilt — a decision is not yet flagged stale when its passage changes.) | she quotes the old wording as current |
| 7 | Press **Stop**, ask again | she is back to one passage, immediately | she still reads the book |
| 8 | Ask her to quote a line that is not in the book | she should not invent it. The stand-in cannot test this; real MAIA can | an invented quotation |
| 9 | Write room → select a passage → **Talk with MAIA** → **Show me an edit** → **Start with MAIA** | one proposed change with **Use it · Change it · Talk about it · Keep mine** | missing button, a dead end, lost text |
| 10 | Press **Keep mine** | nothing is recorded yet; a small card asks "Note that you have decided this?" with a sentence you can change | the card is hidden, covers text, or cannot be used by keyboard |
| 11 | Rewrite the sentence in your own words → **Note it** | the card closes. Back in Develop, **What you have settled (1)** shows your words and a Withdraw button | your words changed, or nothing shown |
| 12 | Ask MAIA about that passage again (either room) | she knows you settled it and does **not** re-offer it unprompted. If you say "let's revisit the opening verb" she discusses it freely | she repeats the refused edit, or refuses to discuss it |
| 13 | **Withdraw** the decision, ask again | she treats it as open again | it still seems to bind her |
| 14 | In Develop, dismiss an observation (if a reading exists) | later conversations know you set it aside, as her own wording, without saying it is false | she says it is false, or ignores it |

## 2 · What the harness will NOT show you
- Production behaviour, your real manuscripts, the real database, real timing at scale.
- The long wait on **Read this chapter** and the "reading takes minutes" problem. Not exercised here.
- Mobile/narrow layouts, screen readers, multi-device.
- Whether you would trust this, which is the whole point of your walk.

## 3 · The first-run Sanctuary note
The app only reads your saved text when it knows your Sanctuary setting on this device. A fresh browser profile has none stored, so the control says so (that is the designed, honest behaviour).
To store it the way opening MAIA does, run this once in the browser console on the walk's page, then reload:
```js
localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false }))
```
To test Sanctuary on, set `{ sanctuary: true }`, reload: MAIA should read only the passage, and nothing should be recorded as a decision.

## 4 · What to tell me
For each row that surprised you: the row number, what you expected, what happened, and one word for how it felt (e.g. *trusting, nagging, cold, confusing*).
Also: did you ever feel MAIA was **deciding for you**? That is the failure this whole branch exists to prevent.

## 4b · What this harness is not
It builds its throwaway database by applying every historical migration and tolerating the ones that fail on a bare cluster (about 50). That is a bounded UI rehearsal, **not** evidence the two new migrations are safe to apply in production, and not a recovery, security or erasure acceptance. Those stay held (see the independent review record).

## 5 · What this walk does and does not authorize
A good walk is evidence, not an act. It authorizes **no** merge, no applying the two migrations (`20261108000001`, `20261108000002`), and no deploy. Those remain your named acts.
Open known items: version-binding is unset; the passage desk's quote check may refuse a reply that quotes MAIA's own sample wording (your tradeoff); member erasure for the new tables is listed in the delete-account preflight but the route is in refuse posture.
