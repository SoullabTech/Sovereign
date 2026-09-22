# JARVIS-KP-01 / I5-P0 — INSTRUMENT FREEZE

**Founder act, 2026-09-22.** *"The successfully production-tested instrument should now be frozen by exact blob hash as previously required."*

Branch `fix/jarvis-kp-01-i5-p0-freeze-20260922`, from the production-tested candidate `00714383dc95fc56b72c237f00263665a6e379ac`. The candidate's own identity is unchanged by this act.

## What is frozen

| Path | Blob |
|---|---|
| `scripts/witness/i5-p0r2-remediation.sh` | `bcdda9b550611daa57f830a3017967bcdd346d3e` |
| `scripts/witness/seam-identity.mjs` | `dbd6e2257dca508502956ca8072f40f0deb9b704` |
| `scripts/witness/seam-identity-container.mjs` | `85bdba16753cceb4d5991ca4c8c69b57f79f1585` |

Manifest `tests/constitutional/jarvis-kp-01/I5_P0_FREEZE.json`; guard `npm run verify:i5-p0-freeze`.

All three hashes were recomputed in-session from the candidate tree rather than copied from the report, and the branch tip was confirmed to be the candidate itself (0 commits after it).

## Why these three, and what the freeze closes

The remediation script already hard-codes and verifies its two siblings' blob hashes before use, so the instrument was **self-binding downward**. Nothing bound the remediation script's own bytes. This manifest closes that, at the instrument's own address.

> **These are the exact bytes that ran against production on 2026-09-22 and produced `I5-P0 READY`. Changing any of them changes what was tested. A repair, a convenience, a refactor or a rerun against a different substrate requires a NEW instrument at a NEW address with its own authorization — never an edit to these.**

## The guard

`scripts/verify-i5-p0-freeze.mjs` computes each file's git blob hash **natively** — `sha1("blob <bytelength>\0" + contents)`, which is git's object identity by definition — so it runs on a host with no git, no network and no `node_modules`. `git hash-object` was confirmed to agree on all three. Exit 0 intact · 1 drift · 2 instrument error.

Blob hashes, not a commit diff: blob identity survives history rewriting and names exactly which bytes are law. Additive law is permitted — a new instrument lives at its own address; what the guard refuses is an **edit** to a frozen file.

### Lethality, proved both ways on the real tree

| Case | Exit |
|---|---|
| intact | 0 |
| one appended comment line | **1** |
| restored | 0 |
| frozen file deleted | **1** (ABSENT — a frozen instrument may not be deleted) |
| empty `frozen` set | **2** (an empty freeze is not a freeze) |
| unusable hash value | **2** (a freeze that pins nothing passes everything) |
| manifest absent | **2** |
| restored after all tampering | 0 |

## Not frozen by this act

Founder ruling, same day: freeze the three named files now so the I5/P1 path can proceed, and adjudicate the falsifier scripts as a **separate explicit act**. An implementer does not widen a founder-defined freeze set, and the question is not left implicit either.

- `scripts/witness/i5-p0r2-ceiling-falsifiers.sh` — **DEFERRED to its own named act.** By the S3 Class-B law it is a falsifier of a now-frozen instrument, and an unfrozen falsifier is the surface on which an inconvenient test gets domesticated.
- `scripts/witness/i5-p0r2-dryrun-boundary-falsifiers.sh` — same grounds.
- `scripts/witness/i5-host-plane-probe.sh` — a diagnostic, not part of the act.

## Two findings recorded alongside

**1. The frozen instruments are not at canonical.** They exist only on this lane; the candidate `00714383d` is not an ancestor of canonical. Until the lane merges, the guard is runnable only here, and a freeze manifest placed on any branch lacking these paths would exit 1 on every run.

**2. Canonical advanced again, and the seam did not move.** Canonical went `578e5ee10` → `c085f2d96` after the I5-P0 report was written. The frozen `seam-identity.mjs` was run read-only against both:

```
578e5ee10  paths=37  seam_id=b828400c7aaceafbbfcc66144018a6b0fe538dab1c806bbe3de635b2fc6ff6b4
c085f2d96  paths=37  seam_id=b828400c7aaceafbbfcc66144018a6b0fe538dab1c806bbe3de635b2fc6ff6b4
verify c085f2d96 --expect b828400c7…  →  SEAM INTACT
```

The canonical side of the property binding still holds at today's canonical, and the report's canonical digest is independently corroborated. This establishes nothing else about P1.

## Standing

```
I5-P0 INSTRUMENT FREEZE TAKEN
  3 instruments bound by blob hash
  guard proved lethal both ways
  candidate 00714383d unchanged

falsifier freeze          DEFERRED to its own act
P1                        NOT OPENED
I6 / I7                   NOT OPENED
shadow                    NOT EXECUTED
all five flags            OFF
runtime-effective admission  NOT WITNESSED
```

This act binds **bytes**. It establishes nothing about P1, nothing about runtime-effective admission, nothing about whether the shadow path is correct, and it authorizes no rerun. The separate P1 founder act must still fix its turn count, observation window and abort thresholds before any shadow flag is enabled or any model is executed.
