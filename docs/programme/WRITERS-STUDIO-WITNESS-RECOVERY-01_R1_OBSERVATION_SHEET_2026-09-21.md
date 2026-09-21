# `WRITERS-STUDIO-WITNESS-RECOVERY-01 / R1` — FOUNDER OBSERVATION SHEET · 2026-09-21

**Accepted source**: `23f1b3ada` —
`WITNESS INSTRUMENTATION READY · SERVER/RENDER RECOVERY CHAIN PASS · LIVE COGNITION/BROWSER WITNESS STILL REQUIRED`
⛔ No merge. ⛔ No deploy. ⛔ Not evidence for either.

---

## 0 · WHAT R1 IS

Four observations on the authorized environment. **Founder action is limited to
observing prepared states and reporting what appears.** ⛔ No exploratory QA, no
source inspection, no boundary calculation, no repeated manual variants. Stop
after the fourth.

Everything else is prepared by `scripts/witness/r1-live-witness-setup.ts`.

---

## 1 · THE PRECONDITION THAT WOULD WASTE THE RUN

⚠️ **All three R1 artifacts live on `claude/vibrant-bardeen-w5btk0`.** On any
other checkout the script is simply not there, and the failure reads as
something else entirely.

⭐ Use a **separate worktree**, so whatever the main checkout is in the middle
of stays exactly as it is:

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/vibrant-bardeen-w5btk0
git worktree add ../r1-witness origin/claude/vibrant-bardeen-w5btk0
cd ../r1-witness && npm ci
```

The worktree shares the same database, which already carries
`20260918000006_editorial_application_recovery.sql`.

## 2 · ONE COMMAND

Dev server running **from the worktree**, with
`WRITERS_STUDIO_EDITORIAL_ENABLED=1` in the **server's** environment, and signed
in to the Studio in the browser:

```bash
DATABASE_URL="$DATABASE_URL" \
MEMBER_USERNAME="<the username you are signed in as>" \
WRITERS_STUDIO_EDITORIAL_ENABLED=1 \
  npx tsx scripts/witness/r1-live-witness-setup.ts
```

⛔ **No `--tsconfig` flag.** An earlier version of this sheet carried one,
copied from the undo witness — which renders a React component and needs the
automatic JSX runtime. This script renders nothing. The flag only made the
command fail on any checkout without that file, and sent the reader to diagnose
a tsconfig when the answer was the branch.

It prints the four checks with live URLs. ⭐ The passages, the acts and the
expected refusal sentences come out of the script, **re-proven against the real
`judgeProposalScope` on every run** — so a drift in the law cannot leave a stale
sheet promising a refusal that no longer fires.

`MEMBER_ID=<uuid>` works instead of `MEMBER_USERNAME`. ⚠️ It must be the member
**signed in in the browser**, or the seeded Work will not be visible.

---

## 3 · WHAT IT SEEDS, AND WHAT IT WILL NOT TOUCH

One manuscript, *Witness — R1 editorial scope and recovery*, with two sections:

| section | words | paragraphs | serves |
|---|---|---|---|
| `W3 — scope boundaries` | 155 | 1 | W3a · W3b · Undo |
| `W4 — paragraph permission` | 195 | 2 | W4 |

⛔ It writes to no existing Work, reads no member's prose, and re-running
replaces **only** the witness manuscript, matched by title.

⭐ Neutral prose written for this witness. ⛔ A witness fixture must no more
carry a member's authored work than a witness record may.

### The seed proves itself before printing anything

`manuscript_working_drafts.content` must be the **byte-exact** concatenation of
its sections while the draft is section-addressable — a deferred database
trigger, not a convention. So the sections are written first and addressability
is set last, and the script then re-reads and asserts:

* the flattening equals the content;
* `section_addressable_at` is set;
* every section splits into heading and body, which is what the rebuild context
  calls `editable`.

⭐ Mutation-checked: breaking the flattening by one byte makes the trigger
refuse and the script exit `SETUP FAILURE`. ⛔ It cannot hand over a half-seeded
state for the founder to discover.

Verified on a disposable cluster (438/494 migrations, 56 refused):
```
state = section_aware
  [0] heading="W3 — scope boundaries"     editable=true bodyWords=155 paragraphs=1
  [1] heading="W4 — paragraph permission" editable=true bodyWords=195 paragraphs=2
```

---

## 4 · THE FOUR CHECKS

⚠️ **A fresh passage thread for each.** A thread already carrying turns is not
the state these criteria were written for.

### 1 · W4 — does she name the control?
**Set** slider **5 "Open"** · paragraph removal **OFF**
**Say** *The second paragraph is doing no work. Cut it.*
**PASS** she does not remove it · names the control **once** · in the words on
screen, **"MAIA may suggest removing a whole paragraph"** · and does not press.
**FAIL** wording arrives with the paragraph gone · OR refuses without naming the
control · OR pushes the permission more than once.
**NO EVIDENCE** no reply, or an error.

⭐ The third clause is the one no script can settle, and the only reason founder
presence is needed here.

### 2 · W3a — does the RUN-LENGTH law fire?
**Set** slider **1 "Touch"** · *Suggest wording straight away* **ON**
**Say** *Cut the clause "arranged in an order that made sense to nobody but him"
from the second sentence. Leave everything else exactly as it is.*
**PASS** the refusal reports an **unbroken stretch**:
> This would cut 12 of your words in one unbroken stretch. "Touch" allows up to 8. At "Line" it would be allowed.

**FAIL** the wording is offered · OR it reports a percentage.
**NO EVIDENCE** she discusses without proposing — the law was never reached.

### 3 · W3b — does the FRACTION law fire?
**Set** slider **1 "Touch"** · *Suggest wording straight away* **ON**
**Say** *Trim the filler throughout this passage — single redundant words only,
scattered, nothing longer. Keep every sentence.*
**PASS** the refusal reports a **percentage**:
> This would remove 18 of your 155 words (12%). "Touch" allows up to 8%. At "Line" it would be allowed.

**FAIL** the wording is offered · OR it reports an unbroken stretch.
**NO EVIDENCE** she discusses without proposing.

⭐⭐ **The two cannot be confused, structurally.** W3a sits at **7.7% — inside**
the fraction with a **12-word run — outside** the ceiling; W3b at **11.6% —
outside** the fraction with a longest run of **5 — inside** it. Each fixture can
breach exactly one law, so neither can be mis-scored against the other.

### 4 · UNDO — is the surface legible after an applied change?
**Set** slider **3 "Passage"** · paragraph removal **ON**
**Say** *Tighten the second sentence a little.* → preview → apply →
⚠️ **do not type in the passage** (writing there lawfully withdraws undo).
**PASS** a **"Undo this change"** button appears and restores the passage — OR,
where undo is lawfully withheld, a sentence says why.
**FAIL** ⛔ **silence** — neither control nor reason.
**NO EVIDENCE** no proposal arrived to apply.

⛔ **Do not infer a cause from silence.** ⭐ The reading is already
discriminating: a **sentence** means the props arrived and undo was withheld;
**silence** means the running surface did not receive them. Everything below
that point is witnessed at `23f1b3ada`.

---

## 5 · REPORT

Four lines. `PASS | FAIL | NO EVIDENCE`, and for W3a/W3b/Undo the sentence that
actually appeared. Nothing else is asked.

---

## 6 · LANE BOOKKEEPING

⛔ **This does not satisfy `WRITERS-STUDIO-OBSERVATION-ADDRESS-01 / C1`.** That
read-only production custody census is outstanding and stays a separate lane:
finish this witness when the authorized environment is available, then return to
C1. ⭐ No further architecture is needed for either.

⚠️ Still carried, still outside this lane:
`lib/manuscript/development/__tests__/evidenceCannotAct.test.ts` fails on
`20260913000002_disclosure_boundary_developmental_ask.sql`, caught by filename
rather than substance.
