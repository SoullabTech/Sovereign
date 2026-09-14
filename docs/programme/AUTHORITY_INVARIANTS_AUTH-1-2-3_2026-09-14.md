# AUTH-1 · AUTH-2 · AUTH-3 — execution authority is an input

**Founder, 2026-09-14**, arising from `claude/voice-2026-census-01` `09c1bd251f`.

⚠️ **THIS FILE IS A RECORD, NOT THE AUTHORITY.** It was written by Claude, on a
non-canonical branch, and committing it ratifies nothing — which is AUTH-1 applied to
itself. Placing these in `docs/canon/` or CLAUDE.md is a founder act. **A commit asserting
a rule is not the rule.**

## The house rule

> **Attribution may explain a constraint; it may never authorize an act.**
>
> Execution authority must originate **outside the instrument and outside the change set
> that consumes it.** A repository change may reference authority. It may not create,
> infer, or satisfy the permission required for its own execution.

**AUTH-1 · Attribution ≠ authority.** `founder ruling`, a date, a comment, a test
description, a prose record — each may explain why a gate exists. None becomes execution
permission by being committed.

**AUTH-2 · No self-ratification.** One change set may not:

```
invent/alter a criterion → declare it authorized
                         → satisfy it from repository state
                         → permit the protected act
```

**AUTH-3 · Authority is an input, never a discovery.** An instrument may *validate*
externally supplied authority. It may not **search its own repository to learn whether it
is allowed to act.** The repo keeps history and rationale; it is never the permission
oracle.

## ⛔ Scope — an invariant, NOT a cleanup

~200 founder-attributions exist across ~40 files (46 in tests/gates, 44 in scripts; 137
carry a date or record path — **sampled, not audited**). Most preserve rationale and are
untouched.

⛔ **A blanket ban on founder comments in gates would fix nothing**: the comments were never
the mechanism. The mechanism was that **authorization was derived from the same commit that
invented it.**

## ⚠️ The implementation trap — what "supplied independently" must exclude

Correction 4 says calibration must require authority *supplied independently of repository
state*, and that a test may verify the input is required but cannot manufacture it.

⛔ **Implemented as an environment variable, this reproduces the defect in one line**:

```bash
K00_AUTHORIZED=1 ./scripts/witness/k00-log-calibrate.sh    # any repo script can export this
```

An env var, a dotfile, a sentinel file, a path outside the repo — **a script in the
repository can set every one of them.** "Outside the repository" is not the test.
**Unmintable-by-the-repository** is.

⭐ Only two shapes satisfy AUTH-3 as stated:

```
(a) an interactive human act at the terminal, at the moment of execution,
    that no script in the change set can supply on the human's behalf
(b) a credential or signature the repository cannot mint and cannot forge
```

⛔ Anything else is AUTH-2 wearing a flag.

## Two questions that cannot answer each other

```
EVIDENCE    Is this a valid post-amendment witness?
AUTHORITY   Has someone with jurisdiction authorized the next act?
```

Capture-time provenance — manifest written during the probe's own execution, binding
criterion revision, execution HEAD, tool identity, timestamp and file hashes, sealed before
calibration — establishes **only** the first. ⛔ It authorizes nothing.

⚠️ And the same trap applies one layer down: a manifest a consumer can author afterward is
a witness certifying its own freshness. The binding must be written **at capture time by
the capturing process**, never by the thing that reads it.

## Standing (Voice lane, recorded not adjudicated here)

```
mechanical CLI repairs              VALID
§7.5 self-authorization             INVALID
pre-amendment probe as new witness  INVALID
12:17 calibration attempt           SPENT
valid physiological LOG-CAL         NONE
physiological entitlement           UNSPENT
R1 contact                          OCCURRED
root/sudo authority                 NOT GRANTED
lane                                FROZEN
```

> *Evidence may license a decision. It must never manufacture the authority that makes the
> decision executable.*

---

# REVISION — founder, same day

## AUTH-3, sharpened

> **Authority is an unmintable capability.** A repository may **validate** execution
> authority but may not **create, derive, infer, broaden, replay, or satisfy** it from
> repository-controlled state. The authority artifact must be impossible for the change set
> that consumes it to mint or forge.

⛔ None of these is authority — the thing asking permission can manufacture every one:

```
K00_AUTHORIZED=1 · .authorized · /tmp/k00-authorized · git tag authorized
a JSON/YAML approval file · a DB row writable by repo code · a commit message
a test passing · a record saying "founder approved"
```

## ⚠️ My "interactive human act" was too weak — corrected

A terminal prompt (`Type YES to continue:`) is answerable by `expect`, a pipe, or a PTY.
So:

- **Procedural human authority** — valid as *ceremony*, but the repo **cannot prove** a
  human rather than automation supplied stdin.
- **Machine-verifiable authority** — a signature through a boundary the repo cannot forge
  (hardware key, Secure Enclave, independent authority service). **Preferred.**

## The two closing rules

**Authority:** the protected act requires a capability the consuming repository cannot mint,
forge, derive, broaden, or replay. Repository code may validate only.

**Witness provenance:** written and sealed **by the capture operation at capture time**. A
downstream consumer may verify it and may never create, repair, or retrospectively certify
it.

## ⛔ THREE RESIDUAL HOLES — named, not solved

**H1 · The trust root must not be repo-controlled.** If the verifying public key lives in
the repository, a change set need not forge a signature — it **redefines who may sign**,
swapping in a key whose private half it holds. That is AUTH-2 one level up. ⛔ Pinning the
key in a test does not help: the same change set edits the test.

**H2 · Single-use needs unmintable STATE, not just an unmintable capability.** `nonce` and
`expires` require a record of what has already been spent. If that ledger is repo-controlled,
a change set deletes the entry and replays a valid capability. **Non-replay is a stateful
property, and the state inherits the same requirement as the capability.**

**H3 · ⭐⭐ The verifier is the code being constrained.** `repo_commit: <calibration SHA>`
binds the capability to an exact SHA — but the thing checking that field **is that code**.
Nothing forces the running instrument to *be* the SHA the capability names, and a change set
that edits the verifier can simply not verify. This is the deploy-provenance shape already
recorded in CLAUDE.md: *the image was stamped while the container was not.*

⭐ **The limit this implies:** an in-process check can raise the cost of self-authorization
but cannot eliminate it, because the enforcement point sits inside the constrained thing.
The strongest available form is **the authority holder performing or proxying the act**
rather than licensing code to perform it — permission that is exercised, not held.

⛔ Recorded as an acknowledged limit, not a reason to reject the architecture: signed
capabilities plus capture-time provenance plus human review are a large improvement over
`tail -1` and a commit that declares itself authorized. **The residue should be named in the
record rather than designed away in prose.**

## Root is a separate authority class

```
authorized: LOG-CAL   ≠   authorized: LOG-CAL + whatever privilege turns out to be necessary
```

⛔ A capability for one non-root sample must never imply `sudo log collect`. Elevation binds
the exact command or privilege class, explicitly and narrowly.
