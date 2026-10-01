# Sanctuary branch verification: 2026-10-01

**Question:** do the Sanctuary and safety protections built on unmerged branches exist on canonical today?
**Method (founder-directed):** run each branch's **own tests** against **current canonical** (`origin/clean-main-no-secrets` @ `8f8ba73b8`), in a detached worktree, copying in only the branch's test files. If the tests fail on canonical, the protection is missing and the branch is ported. If they pass, canonical covers the protection another way and the branch closes.
**Caveat, applied per row:** a test can fail because canonical lacks the branch's specific *function name*, even where canonical fixed the defect differently. Each failure below was therefore read for its cause, not just counted.

| Branch | Tests on canonical | Failure cause | Verdict |
|---|---|---|---|
| `determined-bell-olsuy7` (episode-mark guard, capture refusal) | **20/20 PASS** | n/a | **Covered on canonical → close** |
| `admiring-einstein-8p0itg` | n/a: it *deletes* `lib/sanctuary/sanctuaryGuards.ts` and its test | The module has **zero live callers**; `TurnPosture` is the canonical instrument (that branch's own F2 docs) | **Not a protection.** Dead-code retirement; small optional PR or close |
| `magical-volta-yh4njo` (RE-009 possession guard) | **5/9 FAIL** | **Behavioral**: canonical `lib/consciousness/relationalObserver.ts` writes `pattern_hint` (a system attribution about the member) and `relationship_entry_patterns`. It runs on the live MAIA routes (`sovereign/app/maia/list`, `sovereign/app/maia`, `oracle/conversation`) | ⛔ **MISSING ON A LIVE PATH → port.** Invariant: no attachment capture / no system attribution about the member |
| `sanctuary-button-state-issue-872q0a` (shared-device default ownership) | **30/30 FAIL** | Partly by name (`loadMemberDefaultMemoryMode` absent), and **partly behavioral**: an unstamped legacy cache is treated as proof of ownership (`Expected continuity, Received sanctuary`) | ⛔ **MISSING → port.** On a shared device, member A's cached memory mode can govern member B |
| `sanctuary-settings-write-safety-01` | suite cannot load | `lib/settings/settingsWriteSafety` does not exist on canonical | ⛔ **MISSING → port.** Its witnessed hazard: editing an unrelated setting (display name) persists a synthetic `continuity` and revokes Sanctuary without the member choosing it |
| `sanctuary-settings-disconnect-01-memory-lane` | **12/13 FAIL** | `seedLiveSanctuaryForNewSession` absent: a new session does not consume the member's Sanctuary default | ⛔ **MISSING → port** (shares files with the two above; port as one unit) |
| `sacred-instance-2-repair` | **6/7 FAIL** | **Behavioral**: canonical `MaiaBeadsPlugin` manufactures a task-level `bypassRisk` classification from the member's element (`bypassRisk \|\| 'none'`) | ⛔ **MISSING → port.** The element must not classify the member |

## Consequences

- **Four protections are absent from production:** possession (live), settings provenance and shared-device ownership (one Sanctuary settings unit), and element-as-classification. Sanctuary is declared absolute (CLAUDE.md, Sanctuary invariant 6), so these are defects against ratified law, not backlog.
- **Port order (proposed):**
  1. `magical-volta`: live write path, smallest diff.
  2. The three settings branches as **one** Sanctuary-settings unit (they touch the same files: `accountSettings.ts`, `app/maia/page.tsx`, `AccountSettings.tsx`).
  3. `sacred-instance-2`.
  Each port re-runs its branch's tests on the ported candidate. Its done-condition is those tests passing on canonical-plus-port with the full suite unchanged.
- **Not done by this session:** the ports themselves. Each touches live member-facing paths and earns its own PR and review.

Instrument record: the worktree, the tests copied verbatim from each branch tip, and jest from the project config. Dependencies were resolved from a scratch toolchain because the container has no project `node_modules`.
