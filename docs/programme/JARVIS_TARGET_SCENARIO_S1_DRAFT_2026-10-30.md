# JARVIS Target Scenario S1 — "Continue" · DRAFT

**Status: PROPOSAL. Confers no authority.** It opens no lane, authorizes no build, no provider use, no change to `jarvis-desktop/` or `scripts/builder/`, and does not lift the 2026-09-20 dev-lane provider hold. Companion to `JARVIS_PROJECT_PROTOCOL_MULTI_MODEL_SHIP_LANE_v0.1` (PR #1997).

**Why it exists.** The founder reports (2026-10-30) that JARVIS has "responded in tests" but has never worked as a whole, integrated system. A read-only look found three separate pieces — the desktop console, the session governor, the delegation ledger — and nothing specifying what the *whole* must do. Tests that pass on parts cannot show that. This scenario is the one whole-system claim to test the parts against.

## 1 · What "independent" means (pick the target level)

| Level | JARVIS can… | Needs a founder trigger? |
|---|---|---|
| L0 | answer when asked | yes |
| **L1** | recover a project's state, prepare hand-offs for other models/sessions, record results, report back | **yes — founder says "continue"** |
| **L2** | additionally *start* a contact with the founder on a schedule (e.g. "X is waiting on you") | no, but only to *message*, never to act |
| L3 | dispatch and chain work across models without the founder | ⛔ not proposed |

**Proposed target for S1: L1 + one L2 behaviour (a scheduled check-in that only messages).** L3 is out of scope; it would need its own founder ruling, because it moves decisions off the founder.

## 2 · The scenario

**Setup.** One real Tier S project with a real Brief file (protocol §5). Not a fixture.

1. **Trigger.** The founder says "continue X" in the chosen front door.
2. **State recovery.** JARVIS reads the Brief and restates, in one sentence, `STATE` and `NEXT ACT` (manual §25).
3. **Divergence hand-off (if STATE = DIVERGE).** JARVIS prepares a Class 1 packet (Brief only, protocol Amendment A.3), **shows it to the founder**, and the founder sends it to ChatGPT. The reply is pasted back; JARVIS files it under `PROPOSALS`, tagged CANDIDATE. *(Manual relay in S1 — see §4.)*
4. **Build hand-off (if STATE = BRIEFED/RECONCILED).** JARVIS opens a Claude Code session through the session governor, in an isolated worktree, with the Brief's smallest slice and acceptance test as the whole instruction.
5. **Return.** The Claude Code session reports with evidence (test output, diff, SHA). JARVIS records it in the Brief and advances `STATE` only as far as the evidence supports.
6. **Report.** JARVIS tells the founder, in about three lines: what happened, what is proved, and the one decision that is theirs.
7. **L2 check-in.** If the Brief sits with a founder-owned `NEXT ACT` for 3 days, a scheduled task sends one message naming it. It does nothing else.

## 3 · Pass criteria — observable, each with a way to fail

| # | Must be observably true | Defeat candidate (a wrong system that must fail it) |
|---|---|---|
| P1 | The restated STATE/NEXT ACT matches the Brief, including after the Brief was edited by hand | a JARVIS that restates from memory or a cached copy |
| P2 | The packet to ChatGPT contains the Brief and **nothing from Class 3** (source, canon text, member data) | a JARVIS that attaches "helpful context" from the repo |
| P3 | The Claude Code session runs on the real machine in its own worktree and its result is read back from its actual output | a JARVIS that reports a session result it did not read |
| P4 | `STATE` advances only with named evidence; a claimed result with no evidence leaves it unchanged | a JARVIS that advances on a worker's self-report |
| P5 | The founder-owned decision is surfaced, not taken | a JARVIS that picks the option for the founder |
| P6 | The L2 message fires once, to the founder only, and acts on nothing | a scheduled job that also starts work |
| P7 | The whole run works **from a cold start** the next day with no one re-explaining the project | a system that works only inside the session that built it |

A run that fails any criterion is a **finding about the system**, not a reason to loosen the criterion. A stop condition yields *no evidence*, never a partial pass.

## 4 · Deliberately out of scope for S1

Automatic sending to ChatGPT/Gemini/Perplexity (manual relay first; automation would raise the §3 provider question) · more than one project · deploy or any production write · self-started work (L3) · member data · changing the console's UI.

## 5 · Founder decisions needed before any build

**Decision 1 — TAKEN 2026-10-30 (founder chat reply "Claude Code session"): the S1 front door is a Claude Code session.** The JARVIS.app console is not the front door for S1. Decisions 2–5 remain open.

1. **Front door.** *(taken, see above; original text kept)* Where do you talk to JARVIS? Candidates: a Claude Code session (exists, reliable, but not "always on"), the JARVIS.app console (installed; launch state unverified), or a phone message channel (nothing verified). *Recommended for S1: a Claude Code session, because the hand-offs to Claude already work there; the console can become a display later.*
2. **Target level.** Confirm L1 + the single L2 check-in.
3. **First real project.** Which small Tier S project becomes the Brief for S1? It should be something you actually want shipped.
4. **Manual relay to ChatGPT is acceptable for S1.** Yes / no.
5. **Who owns the build.** One owner per deliverable (protocol §6.3): which lane will carry the S1 work?

## 6 · Not verified

Whether JARVIS.app launches · what the router and provider code in `scripts/builder/` and `jarvis-desktop/src/` already do · whether scheduled tasks can message you the way P6 needs · the contents of `~/.claude/ain-delegation/`. A census of these is the natural first act **after** decisions 1–3, and not before — it should be aimed at this scenario, not run broadly.
