# Adding visual references to the repository

⭐ **Why this file exists.** Several reference boards have been issued in chat and are **not in the
repository**. The founder's own priority is *make the images impossible to lose*; a chat image and a
`sandbox:` link are both lost the moment the conversation scrolls.

⚠️ **What does not work, stated so nobody retries it:**

| Attempt | Why it fails |
|---|---|
| `/mnt/data/…` links | that is the chat analysis sandbox — a **different machine** from this session |
| `~/Downloads` on the founder's Mac | this session is an isolated cloud VM (`hostname: vm`, `$HOME=/root`) |
| Attaching images to a message | ⚠️ **works, but unreliably** — three of roughly six boards reached the filesystem |
| A `.zip` | ⛔ does not extract into the session |

## ⭐ The reliable path — from the founder's Mac

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/trusting-fermat-ju3quz
git checkout claude/trusting-fermat-ju3quz
git pull origin claude/trusting-fermat-ju3quz

mkdir -p docs/design/writers-studio/flagship
cp ~/Downloads/<each-board>.png docs/design/writers-studio/flagship/

git add docs/design/writers-studio/flagship/
git commit -m "docs(ws-flagship): add visual canon reference frames"
git push origin claude/trusting-fermat-ju3quz
```

⭐ They are then in git, versioned, diffable and reviewable — ⛔ not in a chat.

## Naming

```text
00-visual-canon-board.png            the master board
01-write-resting.png
02-write-contextual-maia.png
03-write-alternatives.png
04-write-read-in-context.png
05-write-applied-history-undo.png
06-develop-overview.png
07-develop-themes.png
08-develop-voice.png
09-review-findings.png
10-mobile-write.png
```

⚠️ Also owed: **`FLAGSHIP_INTERACTION_AND_ACCEPTANCE_CONTRACT_v1.md`**, which is referenced as
binding and is **not in the repository at all**.

## Already archived

| File | Source |
|---|---|
| `00-visual-canon-board.png` | six-panel board, 2026-09-22 |
| `01`–`06` frame crops | cut from it, boundaries detected and verified by eye |
| `ref-a-write-develop-mockup.png` | the first Write/Develop mockup |
| `ref-c-develop-themes-revised.png` | ⭐ the revised Themes frame — the first to carry addresses on every row |

⛔ **Not archived**: the corrected eight-panel board · the Flagship Visual Canon v2 board ·
Develop Overview (*The River Between*) · Develop Voice · the manuscript-with-themes frame.
Their content is transcribed in `FLAGSHIP_VISUAL_CANON.md` §1.1 and
`DEVELOP_EXPERIENCE_SPEC.md` §9–§13 — ⭐ a record of the laws, ⛔ never a substitute for the
composition.
