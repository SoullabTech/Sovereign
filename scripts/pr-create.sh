#!/usr/bin/env bash
#
# scripts/pr-create.sh — governed `gh pr create`
#
# WHY THIS EXISTS
#   `gh pr create --body/--body-file/--fill` bypasses .github/pull_request_template.md.
#   GitHub only auto-populates the template in the web UI or an interactive editor.
#   So every CLI/AI-authored PR shipped WITHOUT the Class and Rollback checkboxes that
#   Covenant Gates parses, and opened red on "No change classification found".
#
#   That defect was documented, worked around manually four times, and never fixed —
#   the workaround relieved the pain each time and so removed the pressure to repair
#   the shared path. This script is the upstream repair. Ruled 2026-07-30.
#
# WHAT IT GUARANTEES
#   A PR created through this script carries the same required governance fields as
#   one created through the GitHub template — or it is not created at all.
#
# WHAT IT DELIBERATELY DOES NOT DO
#   It does NOT infer or assign a risk class from touched paths. Classification is an
#   author's declaration, not a derived property. Path-based auto-classification would
#   need its own ruling. (A non-blocking ADVISORY about the gate's own path rails is
#   printed — it never changes or supplies your declared class.)
#
# USAGE
#   scripts/pr-create.sh --class b --rollback revert \
#     --title "fix(x): ..." --body-file body.md --base clean-main-no-secrets
#
#   --class a|b|c|frontier      REQUIRED. a=Sacred Boundaries, b=Structural Risk,
#                               c=Routine Improvement, frontier=Frontier-Dependent.
#   --rollback <opt>            REQUIRED when --class b.
#                               revert | migration | flag | none
#   --verified-by "<text>"      REQUIRED when --class frontier. e.g. "@kelly, 2026-07-30"
#   --dry-run                   Print the composed body and exit. Creates nothing.
#
#   Your --body / --body-file is PRESERVED VERBATIM; the governance block is appended.
#   All other flags (--base, --head, --title, --draft, --reviewer, --label, …) pass
#   straight through to `gh pr create`.
#
# ANTI-DRIFT
#   Before composing, the script asserts that every literal it is about to emit is
#   actually matched by .github/workflows/covenant-gates.yml. If the gate's parser
#   changes, this script fails loudly instead of silently emitting strings the gate
#   no longer reads.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GATE_FILE="$REPO_ROOT/.github/workflows/covenant-gates.yml"

die() { printf '\n\033[31m❌ %s\033[0m\n\n' "$1" >&2; exit 1; }
note() { printf '   %s\n' "$1" >&2; }

# ── parse ────────────────────────────────────────────────────────────────────
CLASS=""
ROLLBACK=""
VERIFIED_BY=""
BODY=""
DRY_RUN=0
PASSTHRU=()

while [ $# -gt 0 ]; do
  case "$1" in
    --class)        CLASS="${2:-}"; shift 2 ;;
    --class=*)      CLASS="${1#*=}"; shift ;;
    --rollback)     ROLLBACK="${2:-}"; shift 2 ;;
    --rollback=*)   ROLLBACK="${1#*=}"; shift ;;
    --verified-by)  VERIFIED_BY="${2:-}"; shift 2 ;;
    --verified-by=*) VERIFIED_BY="${1#*=}"; shift ;;
    --dry-run)      DRY_RUN=1; shift ;;
    --body)         BODY="${2:-}"; shift 2 ;;
    --body=*)       BODY="${1#*=}"; shift ;;
    --body-file)
      [ -f "${2:-}" ] || die "--body-file: no such file: ${2:-<missing>}"
      BODY="$(cat "$2")"; shift 2 ;;
    --body-file=*)
      _f="${1#*=}"; [ -f "$_f" ] || die "--body-file: no such file: $_f"
      BODY="$(cat "$_f")"; shift ;;
    --fill|--fill-first|--fill-verbose)
      die "$1 is not supported — it bypasses governance fields. Pass --body/--body-file, or omit both for a governance-only body." ;;
    -h|--help)
      sed -n '2,45p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *)  PASSTHRU+=("$1"); shift ;;
  esac
done

# ── refuse when required governance fields are absent ────────────────────────
case "$CLASS" in
  a|A) CLASS_KEY="a" ;;
  b|B) CLASS_KEY="b" ;;
  c|C) CLASS_KEY="c" ;;
  frontier|Frontier|frontier-dependent) CLASS_KEY="frontier" ;;
  "")  die "--class is REQUIRED. Declare the change class: a | b | c | frontier.
   a = Sacred Boundaries (privacy/consent/safety/sovereignty)
   b = Structural Risk    (migrations/auth/routing/infra)   [requires --rollback]
   c = Routine Improvement (refactor/copy/UX/prompt tuning)
   frontier = Frontier-Dependent (models/providers/pricing) [requires --verified-by]
   This is your declaration. The script will not guess it for you." ;;
  *)   die "--class '$CLASS' is not valid. Use: a | b | c | frontier" ;;
esac

if [ "$CLASS_KEY" = "b" ] && [ -z "$ROLLBACK" ]; then
  die "--rollback is REQUIRED for Class B (Structural Risk).
   revert    → Revert commit is sufficient
   migration → Migration rollback script provided
   flag      → Feature flag can disable
   none      → No rollback possible
   NOTE: a class-* LABEL cannot satisfy this. Covenant Gates reads the rollback
   acknowledgement from the PR BODY, so labelling alone leaves the gate red."
fi

if [ "$CLASS_KEY" = "frontier" ] && [ -z "$VERIFIED_BY" ]; then
  die "--verified-by is REQUIRED for Frontier-Dependent changes.
   e.g. --verified-by \"@handle, 2026-07-30, valid until 2026-10-30\""
fi

if [ -n "$ROLLBACK" ] && [ "$CLASS_KEY" != "b" ]; then
  die "--rollback is only meaningful for --class b (it is what Class B requires)."
fi

case "${ROLLBACK:-}" in
  ""|revert|migration|flag|none) ;;
  *) die "--rollback '$ROLLBACK' is not valid. Use: revert | migration | flag | none" ;;
esac

# ── literals the gate parses (asserted against the gate below) ───────────────
case "$CLASS_KEY" in
  a)        CLASS_LINE='- [x] **Class A — Sacred Boundaries** (privacy/consent/safety/sovereignty)'
            CLASS_MATCH='[x] **Class A' ;;
  b)        CLASS_LINE='- [x] **Class B — Structural Risk** (migrations/auth/routing/infra)'
            CLASS_MATCH='[x] **Class B' ;;
  c)        CLASS_LINE='- [x] **Class C — Routine Improvement** (refactor/copy/UX/prompt tuning)'
            CLASS_MATCH='[x] **Class C' ;;
  frontier) CLASS_LINE='- [x] **Frontier-Dependent** (models/providers/pricing)'
            CLASS_MATCH='[x] **Frontier-Dependent' ;;
esac

ROLLBACK_LINE=""
ROLLBACK_MATCH=""
case "${ROLLBACK:-}" in
  revert)    ROLLBACK_LINE='- [x] Revert commit is sufficient'
             ROLLBACK_MATCH='[x] Revert commit is sufficient' ;;
  migration) ROLLBACK_LINE='- [x] Migration rollback script provided'
             ROLLBACK_MATCH='[x] Migration rollback script provided' ;;
  flag)      ROLLBACK_LINE='- [x] Feature flag can disable'
             ROLLBACK_MATCH='[x] Feature flag can disable' ;;
  none)      ROLLBACK_LINE='- [x] **No rollback possible**'
             ROLLBACK_MATCH='[x] **No rollback possible**' ;;
esac

FRONTIER_LINE=""
FRONTIER_MATCH=""
if [ "$CLASS_KEY" = "frontier" ]; then
  FRONTIER_LINE="- [x] Verified by Mentor: $VERIFIED_BY"
  FRONTIER_MATCH='[x] Verified by Mentor:'
fi

# ── anti-drift: the gate must actually parse what we emit ────────────────────
[ -f "$GATE_FILE" ] || die "Cannot find $GATE_FILE — refusing to emit governance strings I cannot verify."
assert_gate_reads() {
  grep -qF -- "$1" "$GATE_FILE" \
    || die "DRIFT: covenant-gates.yml no longer matches the literal:
     $1
   This script would emit a string the gate does not read, producing a PR that
   looks compliant and fails anyway. Fix scripts/pr-create.sh to match the gate."
}
assert_gate_reads "$CLASS_MATCH"
[ -n "$ROLLBACK_MATCH" ] && assert_gate_reads "$ROLLBACK_MATCH"
[ -n "$FRONTIER_MATCH" ] && assert_gate_reads "$FRONTIER_MATCH"

# ── advisory only: the gate's own path rails (never assigns your class) ──────
BASE_REF=""
for i in "${!PASSTHRU[@]}"; do
  case "${PASSTHRU[$i]}" in
    --base) BASE_REF="${PASSTHRU[$((i+1))]:-}" ;;
    --base=*) BASE_REF="${PASSTHRU[$i]#*=}" ;;
  esac
done
BASE_REF="${BASE_REF:-clean-main-no-secrets}"
if CHANGED="$(git -C "$REPO_ROOT" diff --name-only "origin/$BASE_REF...HEAD" 2>/dev/null)"; then
  SACRED="$(printf '%s\n' "$CHANGED" | grep -E '^(lib/(safety|memory|consciousness|session)/|app/api/session/)' || true)"
  MIGR="$(printf '%s\n' "$CHANGED" | grep -E '^database/migrations/' || true)"
  if [ -n "$SACRED" ] && [ "$CLASS_KEY" != "a" ]; then
    printf '\n\033[33m⚠️  ADVISORY (not a reclassification)\033[0m\n' >&2
    note "This branch touches Sacred Boundary paths, and the gate requires Class A for them:"
    printf '%s\n' "$SACRED" | sed 's/^/     /' >&2
    note "Your declared class stands as --class $CLASS_KEY. The gate will decide."
  fi
  if [ -n "$MIGR" ] && [ "$CLASS_KEY" = "c" ]; then
    printf '\n\033[33m⚠️  ADVISORY (not a reclassification)\033[0m\n' >&2
    note "This branch touches database/migrations/, which the gate requires be at least Class B."
    note "Your declared class stands as --class $CLASS_KEY. The gate will decide."
  fi
fi

# ── compose: author's body preserved verbatim, governance appended ───────────
TMP_BODY="$(mktemp -t pr-body)"
trap 'rm -f "$TMP_BODY"' EXIT

{
  if [ -n "$BODY" ]; then
    printf '%s\n' "$BODY"
    printf '\n---\n'
  fi
  printf '\n## Change Classification\n\n'
  printf '%s\n' "$CLASS_LINE"
  if [ -n "$ROLLBACK_LINE" ]; then
    printf '\n### Rollback Plan (required for Class B)\n\n%s\n' "$ROLLBACK_LINE"
  fi
  if [ -n "$FRONTIER_LINE" ]; then
    printf '\n### Frontier Verification (required for Frontier-Dependent)\n\n%s\n' "$FRONTIER_LINE"
  fi
  printf '\n<!-- Governance fields emitted by scripts/pr-create.sh. Class is an author\n'
  printf '     declaration, never inferred from touched paths. -->\n'
} > "$TMP_BODY"

if [ "$DRY_RUN" -eq 1 ]; then
  printf '\n\033[32m── composed body (dry run — nothing created) ──\033[0m\n\n'
  cat "$TMP_BODY"
  printf '\n\033[32m── would run ──\033[0m\n'
  printf 'gh pr create --body-file <composed>'
  [ ${#PASSTHRU[@]} -gt 0 ] && printf ' %q' "${PASSTHRU[@]}"
  printf '\n\n'
  exit 0
fi

exec gh pr create --body-file "$TMP_BODY" ${PASSTHRU[@]+"${PASSTHRU[@]}"}
