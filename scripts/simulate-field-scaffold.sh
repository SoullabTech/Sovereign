#!/usr/bin/env bash
# Scaffold a JARVIS-SIM-01 field simulation run.
#
#   bash scripts/simulate-field-scaffold.sh relationship-state
#   bash scripts/simulate-field-scaffold.sh relationship-state --verify
#
# Charter: docs/architecture/governance/jarvis-sim-01/JARVIS-SIM-01-FIELD-SIMULATION-LANE-CHARTER.md
# Method:  .claude/skills/simulate-field/SKILL.md
#
# Two things must hold still for a simulation to mean anything, and they are
# separate problems:
#
#   1. THE INSTRUMENT — the charter, the skills, this script. If the method moves
#      mid-run, runs from before and after are not comparable.
#   2. THE BRIEF — the question, metrics, hypotheses and assumptions. These must be
#      fixed BEFORE any run executes. A metric defined after seeing output is not a
#      metric; it is a story with numbers attached. This fingerprint is the only
#      structural detector of that particular self-deception.
#
# Written for bash 3.2 (macOS).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

SLUG="${1:-}"
MODE="${2:-scaffold}"

if [ -z "$SLUG" ]; then
  echo "usage: bash scripts/simulate-field-scaffold.sh <slug> [--verify]" >&2
  echo "  e.g. bash scripts/simulate-field-scaffold.sh relationship-state" >&2
  exit 2
fi

DATE="$(date +%F)"
SIM_DIR="docs/simulations/${SLUG}/${DATE}"
BRIEF="${SIM_DIR}/SIMULATION_BRIEF.md"
WORLD="${SIM_DIR}/WORLD.md"
INTEG="${SIM_DIR}/RUN_INTEGRITY.md"

# The method and its harness. Editing any of these mid-run invalidates the instrument.
INSTRUMENT_FILES="scripts/simulate-field-scaffold.sh
.claude/skills/simulate-field/SKILL.md
.claude/skills/adjudicate-simulation/SKILL.md
docs/architecture/governance/jarvis-sim-01/JARVIS-SIM-01-FIELD-SIMULATION-LANE-CHARTER.md"

# Content hash, not git state — an uncommitted instrument is still a fixed instrument
# for the duration of a run, and must be detectable if it moves.
instrument_fingerprint() {
  printf '%s\n' "$INSTRUMENT_FILES" | while IFS= read -r f; do
    [ -n "$f" ] && shasum "$f" 2>/dev/null || echo "MISSING $f"
  done | shasum | cut -c1-12
}

instrument_rev() {
  local rev
  rev="$(printf '%s\n' "$INSTRUMENT_FILES" | tr '\n' ' ' | xargs git log -1 --format=%h -- 2>/dev/null || true)"
  [ -n "$rev" ] || rev="none"
  if printf '%s\n' "$INSTRUMENT_FILES" | while IFS= read -r f; do
       [ -n "$f" ] && git status --porcelain -- "$f"; done | grep -q .; then
    echo "${rev} (UNCOMMITTED — instrument is not yet fixed by a commit)"
  else
    echo "${rev}"
  fi
}

brief_fingerprint() {
  { shasum "$BRIEF" 2>/dev/null || echo "MISSING $BRIEF"
    shasum "$WORLD" 2>/dev/null || echo "MISSING $WORLD"; } | shasum | cut -c1-12
}

SHA="$(git rev-parse --short HEAD)"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
IFP="$(instrument_fingerprint)"
IREV="$(instrument_rev)"

# ---------------------------------------------------------------------------
# --verify : did the instrument or the brief move under the run?
# ---------------------------------------------------------------------------
if [ "$MODE" = "--verify" ]; then
  if [ ! -f "$INTEG" ]; then
    echo "no run integrity record at ${INTEG} — nothing to verify" >&2
    exit 1
  fi
  DECLARED_INST="$(grep '^- \*\*Instrument fingerprint:\*\*' "$INTEG" | sed 's/^[^`]*`\([^`]*\)`.*/\1/' || true)"
  DECLARED_BRIEF="$(grep '^- \*\*Brief fingerprint:\*\*' "$INTEG" | sed 's/^[^`]*`\([^`]*\)`.*/\1/' || true)"
  CUR_BRIEF="$(brief_fingerprint)"

  INST_OK=1; BRIEF_OK=1
  [ "$DECLARED_INST" = "$IFP" ] || INST_OK=0
  # PENDING means the brief was not sealed before runs began — that is its own finding.
  if [ "$DECLARED_BRIEF" = "PENDING" ]; then BRIEF_OK=2
  elif [ "$DECLARED_BRIEF" != "$CUR_BRIEF" ]; then BRIEF_OK=0; fi

  echo "=== Close report — ${SLUG} ${DATE} =============================="
  echo
  echo "1. INSTRUMENT (charter, skills, harness)"
  echo "   declared : ${DECLARED_INST}"
  echo "   current  : ${IFP}"
  if [ "$INST_OK" = "1" ]; then
    echo "   INTACT — the method did not move under the run."
  else
    echo "   DIVERGED — the method or harness was edited mid-run."
  fi
  echo
  echo "2. BRIEF + WORLD (question, metrics, hypotheses, assumptions)"
  echo "   declared : ${DECLARED_BRIEF}"
  echo "   current  : ${CUR_BRIEF}"
  case "$BRIEF_OK" in
    1) echo "   SEALED — the question and metrics predate the results." ;;
    2) echo "   NEVER SEALED — runs began before the brief was sealed. Results are" ;
       echo "   not protected against post-hoc metric selection." ;;
    0) echo "   DIVERGED — the brief or world changed after sealing. Any metric or" ;
       echo "   assumption edited after results existed is disqualified." ;;
  esac
  echo
  echo "3. EXECUTION AUTHORITY"
  if grep -q '^- \*\*Founder GO:\*\* `NONE RECORDED`' "$INTEG"; then
    GO_OK=0
    echo "   NONE RECORDED — execution was held. Any run that occurred did so"
    echo "   without founder authority. Report this in the verdict; do not treat"
    echo "   the results as authorized."
  else
    GO_OK=1
    echo "   $(grep '^- \*\*Founder GO:\*\*' "$INTEG" | sed 's/^- \*\*Founder GO:\*\* //')"
  fi
  echo
  echo "Seal the brief before running:  bash scripts/simulate-field-scaffold.sh ${SLUG} --seal"
  echo "=================================================================="

  [ "$INST_OK" = "1" ] && [ "$BRIEF_OK" = "1" ] && [ "$GO_OK" = "1" ] && exit 0

  echo
  echo "Divergence is a REPORTABLE CONDITION, not a failure. Record both lines above in"
  echo "the verdict. Runs from before and after a divergence belong to different"
  echo "instruments — or to different questions — and may not be pooled."

  if [ "$GO_OK" = "0" ] && [ "$INST_OK" = "1" ] && [ "$BRIEF_OK" = "1" ]; then exit 6; fi
  if [ "$INST_OK" = "0" ] && [ "$BRIEF_OK" != "1" ]; then exit 5; fi
  if [ "$INST_OK" = "0" ]; then exit 3; fi
  exit 4
fi

# ---------------------------------------------------------------------------
# --seal : fix the brief before the first run
# ---------------------------------------------------------------------------
if [ "$MODE" = "--seal" ]; then
  [ -f "$INTEG" ] || { echo "not scaffolded: ${SIM_DIR}" >&2; exit 1; }
  CUR_BRIEF="$(brief_fingerprint)"
  case "$CUR_BRIEF" in *MISSING*) echo "brief or world missing — complete both before sealing" >&2; exit 1;; esac
  if grep -q '^- \*\*Brief fingerprint:\*\* `PENDING`' "$INTEG"; then
    TMP="${INTEG}.tmp.$$"
    sed "s|^- \*\*Brief fingerprint:\*\* \`PENDING\`.*|- **Brief fingerprint:** \`${CUR_BRIEF}\` (sealed $(date +%FT%T))|" "$INTEG" > "$TMP"
    mv "$TMP" "$INTEG"
    echo "brief sealed: ${CUR_BRIEF}"
    echo "the question, metrics and hypotheses are now fixed. Runs may begin."
    exit 0
  fi
  echo "brief already sealed — a sealed brief is not re-sealed." >&2
  echo "if the question genuinely changed, scaffold a new run; do not edit this one." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# scaffold
# ---------------------------------------------------------------------------
if [ -d "$SIM_DIR" ]; then
  echo "simulation already scaffolded: ${SIM_DIR}" >&2
  echo "(a run is scoped to one brief; use --verify to check it is still intact)" >&2
  exit 1
fi

mkdir -p "${SIM_DIR}/runs"

cat > "$BRIEF" <<EOF
# Simulation Brief — ${SLUG} — ${DATE}

**PROVENANCE: SIMULATED · JARVIS-SIM-01**
Synthetic agents under stated assumptions. Not evidence about real people.
No promotion path to Live / Designed / Vision.

## Step 1 — The refusal gate (answer before anything else)

Simulation is the wrong instrument if the answer is knowable from code, logs or
production; if the question is about what real members did, want or felt; if the
decision is already made; if no observable distinguishes the outcomes; if no
action would change; or if this is a values or founder decision.

- **Is simulation warranted?** <!-- YES / NO -->
- **Why:**
- **If NO, the right instrument instead:**

A refusal is a completed run. Stop here and record it.

## Brief

\`\`\`yaml
question:
decision_context:
actors:
known_relationships:
unknowns:
intervention:
time_horizon:
metrics:
sensitivity_variables:
\`\`\`

## Competing hypotheses (write BEFORE building the world)

At least two rivals predicting **different** observables, including the one the
founder does not expect.

| # | Hypothesis | Predicted observable |
|---|---|---|
| H1 | | |
| H2 | | |

- **What result would count as this idea failing?**
  <!-- if nothing would, return to the refusal gate -->

## Experiment matrix

| Condition | Design | Runs planned |
|---|---|---|
| NULL MODEL | | |
| BASELINE | | |
| SHAM / TOKEN-MATCHED | | |
| TREATMENT / COUNTERFACTUAL | | |
| ADVERSARIAL | | |

A design missing the NULL or the SHAM condition is not run.

SHAM = same quantity and shape of added context as the treatment, drained of the
meaning under test. It is the ONLY control for "the treatment just had more to
read". ADVERSARIAL (mechanism present but corrupted) is NOT that control — it
adds misinformation as a second causal variable. Keep both; they answer different
questions.

## Sovereignty gate

- [ ] No raw member memory used as agent seed
- [ ] Sanctuary content categorically excluded
- [ ] No confidential material (or: founder decision recorded below)
- [ ] Synthetic / anonymized population only; no identifiable real person simulated
- [ ] No production writes; structural reads only
- [ ] \`SIMULATED\` provenance on every emitted artefact

**Founder decision admitting restricted material (if any):**
EOF

cat > "$WORLD" <<EOF
# World — ${SLUG} — ${DATE}

**PROVENANCE: SIMULATED · JARVIS-SIM-01**

Record every assumption **as it is made**. Assumptions recalled afterwards are
reconstructions, and reconstructions favour the result.

## Relational graph

## Synthetic agents

| Agent | Role | Stated properties | Information boundary |
|---|---|---|---|

JARVIS is not among them. The laboratory director does not enter the experiment.

## Environment and constraints

## Assumption log

| # | Assumption | Made at | Why | Result if dropped |
|---|---|---|---|---|
EOF

cat > "$INTEG" <<EOF
# Run Integrity — ${SLUG} — ${DATE}

Two independent declarations. The instrument can move while the brief holds still,
and the brief can move while the instrument holds still.

## Instrument (charter, skills, harness)

- **Instrument fingerprint:** \`${IFP}\`
- **Instrument last commit:** ${IREV}
- **Repo commit:** \`${SHA}\` on \`${BRANCH}\`
- **Instrument files:**
$(printf '%s\n' "$INSTRUMENT_FILES" | sed 's|^|  - `|; s|$|`|')

## Execution authority

\`\`\`text
JARVIS-SIM-01
CHARTERED · INSTRUMENTS BUILT
EXECUTION: HELD — FOUNDER GO REQUIRED
\`\`\`

Design is not execution. Scaffolding, briefing, hypothesis formation and sealing
are permitted under the hold. Running is not — including a toy or smoke run.

- **Founder GO:** \`NONE RECORDED\`

Replace the line above with the founder's verbatim GO and the date, e.g.
\`GO JARVIS-SIM-01 EXPERIMENT 1 (2026-09-04)\`. **This is written by the founder,
never by a worker or an agent** — a worker may identify a missing authority, it
may never supply one. There is deliberately no \`--go\` flag on this script.

## Brief + world

Sealed before the first run. A metric or assumption edited after results exist is
disqualified — this fingerprint is what makes that detectable rather than a matter
of trust.

- **Brief fingerprint:** \`PENDING\` (seal with \`--seal\` before running)

## Commands

\`\`\`bash
bash scripts/simulate-field-scaffold.sh ${SLUG} --seal     # fix the question, then run
bash scripts/simulate-field-scaffold.sh ${SLUG} --verify   # at close
\`\`\`

## Close report

<!-- paste the --verify output here at close -->
EOF

echo "scaffolded: ${SIM_DIR}"
echo
echo "  1. ${BRIEF}"
echo "     answer the REFUSAL GATE first. 'This question does not need simulation'"
echo "     is a valid and often correct outcome."
echo "  2. ${WORLD}"
echo "  3. seal:   bash scripts/simulate-field-scaffold.sh ${SLUG} --seal"
echo "  4. EXECUTION IS HELD — a founder GO must be recorded in"
echo "     ${INTEG} before any run. Design freely; do not execute."
echo "  5. once GO is recorded: run, then /adjudicate-simulation ${SLUG}"
echo "  6. close:  bash scripts/simulate-field-scaffold.sh ${SLUG} --verify"
