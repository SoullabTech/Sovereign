# Memory Size Warning — Authority Conflict

**Date:** 2026-08-04 · **Class:** governance defect (⛔ *not* a memory defect, ⛔ *not* a tooling defect)

```
STATUS
  authority hierarchy          RULED (founder, 2026-08-04)
  principle applied to tooling RULED (founder, 2026-08-04)
  emitter location             MEASURED — harness-native, not locally configurable
  disposition of the warning    OPEN — NOT RULED
```

⭐⭐⭐ **The classification is the finding.** Two independent sources of instruction now address the
same object (the root memory index) and disagree about what must be done to it. That is a conflict of
**authority**, not a wrong number and not a broken script. Fixing the number would not fix the defect.

⛔ This record does **not** rule the disposition. §6 states the options and stops.

---

## 1. The conflict

| | Governed memory record | Automated warning |
|---|---|---|
| **Says** | ceiling is **24,986 characters**; a further split requires renewed founder authorization; size pressure alone is never sufficient authority | *"approaching the 24.4KB read limit. Compact it to under 17.1KB now."* |
| **Form** | a constraint, with an authority condition attached | an **imperative**, with no authority condition attached |
| **Fires** | when a human reads the index | on **every write** to the index |
| **Standing** | **AUTHORITATIVE** | **ADVISORY** |

The warning's target (≈17.1 KB) sits **below the state the founder accepted on 2026-08-04**. So the
tool is not warning that the accepted state is near a limit — it is instructing that the accepted
state be undone. Complying would perform, unauthorized, exactly the act the memory root prohibits
without authorization.

⚠️ **The two instructions cannot both be followed.** Before this record, which one prevailed depended
on who was reading and how carefully — i.e. the hierarchy was **tacit**. Making it explicit is the
entire purpose of this file.

---

## 2. Founder ruling — the hierarchy

> **The warning is advisory. The memory record is authoritative.**

⭐⭐⭐ Generalized: **an automated measurement has standing to report; it does not have standing to
authorize.** A measuring instrument may establish *what is true of the artifact*. It cannot establish
*what is permitted to be done to the artifact* — that is a governance question, and governance
questions are answered by the governed record and its authorization conditions.

⛔⛔ A tool's confidence, urgency, or repetition creates no authority. The warning fires on **every**
write; frequency is not standing. An instruction repeated a hundred times is the same instruction.

⛔ This does **not** license ignoring the measurement. The number is real and the trend is a governing
fact (see §4). What is refused is the **imperative**, not the **observation**.

---

## 3. Founder principle applied to tooling — *observation precedes recommendation*

The project's standing principle is that observation precedes recommendation. The warning violates it
in a specific, nameable way:

> It observes size, and **immediately** issues an imperative — without checking whether the
> recommended action is constitutionally permitted.

⭐⭐⭐ The defect is the **missing middle step**. The sequence a governed instrument owes is:

```
  observe          →   check permission      →   recommend (or decline to)
  "23,044 chars"       "splitting requires        "…and further splitting is
                        authorization"             currently prohibited"
```

The warning collapses step 1 directly into step 3, and in doing so it recommends an act it has not
established anyone is allowed to perform.

### Founder's stated preferred shape

> *"Root size: 20,662 / 24,986 characters (17% headroom). Memory policy currently prohibits further
> splitting without explicit authorization."*

⭐ Note what that shape does: it reports the fact, then reports the **constraint on acting on the
fact**, and issues **no command at all**. The reader retains the decision. This is the same structure
the project requires of MAIA toward a member — *remember ⊥ reflect ⊥ suggest ⊥ act must not collapse*
— applied to an instrument reporting on the project's own memory. The isomorphism is not decorative:
a tool that collapses observation into command is committing, at the tooling layer, the same failure
the product constitution forbids at the member layer.

---

## 4. The measured numbers

Measured at authorship of this record via the canonical instrument
(`memory/measure-index.sh` — ⛔ the built-in `KB` figure is `characters ÷ 1024` and governs nothing):

| | characters | headroom |
|---|---:|---:|
| governed ceiling | **24,986** | — |
| root at the 2026-08-04 acceptance (per the instrument's own reference line) | 19,984 | ~20% |
| **root at authorship of this record** | **23,044** | **7.8%** |
| warning's demanded target (17.1 KB ≈ 17,510 chars) | ~17,510 | — |

⚠️⚠️ **The brief that opened this lane cited 20,662 chars / ~17% headroom. That figure did not
reproduce.** The measured value at authorship is 23,044 chars / 7.8%. The root has grown since the
accepted state. This divergence is recorded rather than silently corrected, because it is itself an
instance of the thing under governance: **a size figure quoted from recollection is not a
measurement.** Any future citation must re-run the instrument.

⭐⭐⭐ **Falling headroom is a governing FACT to report — ⛔ never an authorization to compact.** The
instrument's own output says exactly this. The correct response to 7.8% headroom is to *report 7.8%*,
not to act. If the ceiling is genuinely reached, the constraint does not dissolve — it escalates to
the founder, who alone may authorize a further split.

⛔⛔ Nothing in this record changes any threshold, anywhere.

---

## 5. Where the warning comes from — MEASURED

The lane opened on the assumption that the emitter could be revised locally. **It cannot.** Verified
2026-08-04 by direct search:

| Searched | Result |
|---|---|
| `~/.claude/settings.json`, `~/.claude/settings.local.json` | no memory/size/compact hook entry |
| `MAIA-SOVEREIGN/.claude/settings.json`, `.claude/settings.local.json` | no memory/size/compact hook entry |
| every script under `~/.claude/hooks` and `.claude/hooks` | no reference to `MEMORY.md`, `17.1`, or `24.4` |

**Finding: the warning is emitted by Claude Code's own memory feature — it is harness-native.**

Consequences that follow directly:

- ⛔ There is **no local file to change**. A change attempt would be a search for a file that has been
  measured not to exist.
- ⛔ **No code change should be attempted**, including any hook written to suppress or filter the
  warning. Suppression would trade a visible advisory conflict for an invisible one, and would leave
  a future reader with no record of why the harness disagrees with the memory root.
- ⭐ The conflict is therefore **not remediable at the layer where it appears**. Whatever the
  disposition, the warning keeps firing until the harness changes. Any handling must assume its
  continued presence.

---

## 6. ⛔ OPEN — disposition NOT RULED

**The question:** given the emitter cannot be changed locally, what is the correct handling of a
recurring advisory that instructs an unauthorized act?

Both directions below are compatible with §2 — under either, the memory record stays authoritative and
the warning is never obeyed. They differ in what is *done about the conflict itself*.

### Option A — file it as product feedback to Claude Code

Report the shape defect upstream: the warning issues an imperative without establishing that the act
is permitted, and its target can sit below a state the user has deliberately chosen.

- **For:** attacks the defect at its actual layer; the fix (report facts, not commands) benefits any
  user with a governed memory file; costs one filing.
- **Against:** outcome and timing are outside the project's control; a filed report is not a control,
  so the warning must be handled locally anyway in the meantime — meaning A does not remove the need
  for B's protection, only the need for B's permanence.
- **Note:** filing is outward-facing and needs founder sign-off on wording before it is sent.

### Option B — accept it permanently as advisory noise

Take no action toward the emitter. Rely on the constitutional line already in the memory root
(*"A further split requires renewed founder authorization — it may NOT be inferred from ordinary size
pressure"*) plus this record to hold the line each time the warning fires.

- **For:** zero moving parts; the counter-instruction already exists, is already in the first thing
  every session reads, and has already worked — the accepted state survived the warning.
- **Against:** the protection is **entirely reader-side**. It holds only as long as a reader reaches
  the memory root's header before acting on the warning. A hurried session, or an agent that sees the
  imperative and not the constraint, is the live failure mode. Permanent acceptance also means
  permanently carrying a standing instruction to violate the project's own governance.

### ⭐ They are not exclusive

A and B can both be true: file upstream **and** rely on the constitutional line until (or unless) the
harness changes. The real decision may be less *A or B* than **whether the conflict is treated as a
defect worth reporting, or as an environmental constant to be absorbed.**

⛔⛔ **Claude may not rule this.** The options are stated; the ruling is the founder's.

---

## 7. What this record does and does not settle

| Settled | Not settled |
|---|---|
| memory record > automated measurement, explicitly | what to do about the warning (§6) |
| tooling owes observation → permission-check → recommendation | whether other advisories carry the same defect |
| the emitter is harness-native; no local fix exists | whether the hierarchy in §2 should be promoted to canon |

⚠️ **Scope guard.** This record governs the *authority relationship* between the memory record and an
automated size warning. It does **not** re-open the 2026-08-04 compaction, does **not** evaluate
whether the current 7.8% headroom warrants any action, and does **not** touch any memory file.
