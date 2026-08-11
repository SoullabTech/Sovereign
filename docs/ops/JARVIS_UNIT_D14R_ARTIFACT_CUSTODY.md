# JARVIS UNIT (DRAFT) — D-14R Artifact Custody

**Date drafted:** 2026-08-10 · **Status:** ⛔ **DRAFTED — not claimed, not scheduled, NOT URGENT**
**Founder ruling 2026-08-10:** preserve, do nothing tonight; give it a **tiny** custody unit later.

> ⛔ **This unit does NOT reopen the D-14 founder-presence authentication investigation.**
> Its entire scope is: *where should these 13 files live?*

---

## §1 — Why the orphan exists

Claim `s-80845628` (unit `D-14R`) was recovered at 2026-08-11T02:38:16Z after its process died.
Recovery frees the claim; it does not adopt the claim's uncommitted work. The directory below is
therefore **intact and owned by no claim**. Neighbouring `d14l` / `d14p` / `d14q` proof directories
**are tracked**, so the established convention is that this material gets committed — `d14r` simply
never got there.

**Location:** `.claude/worktrees/jarvis-d14r-interactive-presence-proof/`
`scripts/builder/design/jarvis-founder-presence-auth/d14r-interactive-proof/`
**Branch:** `chore/jarvis-desktop-d14r-interactive-presence-proof` (HEAD `d3a9dab2e`)
**Verified intact** 2026-08-10 22:39 — 13 files, digest `02e83499fba8b1ba2b346f0f3fc33e9e`,
byte-identical to the pre-recovery capture.

## §2 — Proposed classification (⛔ provisional — the unit's job is to confirm it)

| File | Size | Proposed class |
|---|---|---|
| `presence-proof-d14r.swift` | 8049 | **PRIMARY EVIDENCE / SOURCE** |
| `presence-proof-baseline-v2.swift` | 8043 | **PRIMARY EVIDENCE / SOURCE** — the discriminating baseline |
| `build-d14r-bundle.sh` | 2041 | **BUILD SUPPORT** — required to reproduce |
| `run-step.sh` | 905 | **BUILD SUPPORT** |
| `d14r-entitlements.plist` | 527 | **BUILD SUPPORT** — entitlement config under test |
| `D14RBaselineProof.app/**` (4 files) | — | **DERIVED BINARY** |
| `D14RKeychainProof.app/**` (4 files) | — | **DERIVED BINARY** |

⭐ The two `.swift` files plus the entitlements plist are the actual experimental variables — they are
what makes the D-14R result reproducible. The `.app` bundles are outputs of the script above them.

## §3 — ⚠️ Security gate before any commit

Each `.app` bundle contains **`embedded.provisionprofile`** (12376 B) and a `_CodeSignature/`.
Provisioning profiles embed team identifiers, certificates, and device UUIDs.

⛔ **Do not commit the `.app` bundles until that content has been inspected.** This is an independent
reason to prefer artifact storage over Git for the derived binaries, separate from repo hygiene.

## §4 — The decision the unit must make

1. Confirm or revise the §2 classification.
2. Commit **primary evidence + source + build support** to the existing tracked convention
   (`scripts/builder/design/jarvis-founder-presence-auth/d14r-interactive-proof/`).
3. Decide **separately** whether built `.app` bundles belong in Git or only in artifact storage —
   gated on §3.
4. Record where the derived binaries went, so the D-14R result stays reproducible either way.

## §5 — Boundaries

⛔ No reopening of the D-14 authentication investigation · ⛔ no rebuild of the bundles · ⛔ no
re-running of the presence proofs · ⛔ no change to `d14l` / `d14p` / `d14q` · ⛔ no claim opened by
this draft.

**Preserve until then. Do not delete, do not casually adopt.**
