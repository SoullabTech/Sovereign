# Draft note for owner issue #1974 — lane naming and findings record · DRAFT, NOT POSTED

**Status: POSTED 2026-10-30T16:46:16Z** (founder: "Post it for me"; posted by Claude Code as the founder's account; verified byte-identical from GitHub; `https://github.com/SoullabTech/Sovereign/issues/1974#issuecomment-6528216238`). *Original status line, kept: "DRAFT. Nothing has been posted."* It would appear on a **public** repository as the founder's GitHub account, so it is written to be public-safe: no local paths, no host names, no ledger or session identifiers, no credentials. The founder reads it first and either pastes it or says "post it for me". Confers no authority; a note on an issue is a **record**, not a grant.

Why it exists: a 30 Oct entry on #1982 treats the other lanes, including this one, as *orient-and-hold until the founder names the lane or its owner posts a handback ACK*. The work done on this lane today was directed by the founder step by step in chat, but **nothing in #1974 records that**, so a session that restores state only from records would conclude the lane is un-named. Today's findings are also absent from the record.

## The note (copy from the next line to the end marker; nothing else)

<!-- NOTE-START -->
## Founder named this lane for read-only orientation work — and findings from that work (30 Oct 2026) — record only: NO grant, NO release, NO hold lifted

**Source of this record:** the founder's own step-by-step instructions in an interactive Claude Code session on 30 Oct 2026, posted at the founder's direction. It records what was done and found. It issues no grant and lifts no hold.

### What the founder directed on this lane today
1. Treat JARVIS as the first project under a new project protocol; `jarvis-desktop` owns the first slice (state recovery), with the continuity registry as the single state record.
2. Read-only censuses: compare the installed app's source files, by hash, against git trees; trace commit lineage; search git history for `REPO_ROOT`; read the app's stored repo-root setting (the path only).
3. A dev-mode launch of canonical's `jarvis-desktop` and `maia-desktop` from a separate, isolated git worktree at canonical's tip, with a stated dependency download. The founder ran MAIA Desktop personally.
4. One marker comment on this issue, posted at the founder's instruction, as a freshness test of the continuity record. It is to be edited to "withdrawn: test only".
5. A ruling that **canonical is the source line of record for JARVIS Desktop**. The desktop investigation was then **parked, not closed**.

### Not done and not authorized
No source edits. No build, packaging, signing or install. No change to the installed app or its settings. No grant, lease or release. No hold lifted. Nothing else posted anywhere.

### Findings, with evidence class — none independently reviewed
- **The installed app is commit `65fbf9c72f4`.** Its 28 source files are byte-identical to that commit's `jarvis-desktop/src`. That commit is **not** an ancestor of `clean-main-no-secrets`; it is on three feature branches. Its base `c6102a347` is on canonical. *(hash comparison)*
- **`REPO_ROOT` is used but never declared** in `jarvis-desktop/src/main.js` at `65fbf9c72f4`, lines 1220, 1221 and 1232 (the C1 execution lane). This matches the recorded `REPO_ROOT is not defined` failure. Canonical's `main.js` has no use of `REPO_ROOT` and reads `currentRoot()` with a fail-closed guard. *(code-read; not reproduced)*
- **Standalone launch of canonical's `jarvis-desktop` is inert under Electron 28.3.3.** `require.main === module` is false there, so the `STANDALONE` gate skips window creation, lock and ready handling. *(witnessed with a control app)*
- **The unified host `maia-desktop` (Electron 44.4.1) starts.** The founder reports `Go → JARVIS · Work` is listed but opening it showed no window; the cause is **not established**. *(founder-reported)*
- **A platform splash link is blocked by the desktop shell.** "Go to Soullab" points to `/home`, which the desktop House allowlist rejects. *(policy function evaluated)*

### Open items for the owner
- Does this note suffice as the founder naming the lane, or is a handback ACK still required?
- The independent macOS/Electron reviewer (#1983) is unassigned. All findings above are by Claude Code alone and are therefore **unreviewed**.
- Whether the dev-mode launch above should have been preceded by a JARVIS Desktop grant is for the founder and owner to judge; none was requested or issued.
<!-- NOTE-END -->

## Public-safety check (mechanical)

**Result (2026-10-30, run on the exact note text; 506 words; SHA-256 `37f9e789f33d3f412dfa3f8770af4c6397a0c6926ef69c964213c71f6ebb2fa8`):** **no hits in any of the 10 pattern groups** (local paths, host names, e-mail, secret-like tokens, long opaque strings, ledger/session ids, claim ids, process ids, member-data words, external case ids). The checker was **validated on a deliberately dirty sample: all 10 groups fired.** A text-only copy, `JARVIS-1974_LANE_NAMING_NOTE_TEXT_2026-10-30.txt`, is **byte-identical** to the scanned text.

**Scope of that claim:** absence of those patterns only. It does **not** prove the note is wise to publish, accurate, or free of anything sensitive the patterns do not name. The founder's read is the real control. The note does contain **commit hashes, file names, line numbers and software versions**, which are public-repo-appropriate by design. Re-run the scan before any edit is posted.
