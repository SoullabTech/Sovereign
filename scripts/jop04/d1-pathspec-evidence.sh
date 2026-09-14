#!/usr/bin/env bash
# JOP-04 · D1 evidence — read-only.
#
# ⭐ Compare RELATIONSHIPS, not absolute counts. Counts differ per tree; the
#    three relationships are the architectural property D1 rests on.
#
# ⭐ CUSTODY (founder correction 2026-09-14): every probe names the bound root
#    EXPLICITLY via `git -C "$ROOT"` rather than depending on shell location. A
#    transcript that shows git invoked from the wrong directory is not a witness,
#    however correct its conclusion — it reports `fatal: not a git repository`.
#    This is a custody correction; D1's semantics are unchanged.
#
# Usage: scripts/jop04/d1-pathspec-evidence.sh [root]
set -u
ROOT="${1:-$(git rev-parse --show-toplevel)}"
n() { git -C "$ROOT" "$@" 2>/dev/null | wc -l | tr -d ' '; }

plain_dir=$(n ls-files app)
lit_dir=$(n --literal-pathspecs ls-files app)
plain_glob=$(n ls-files 'app/*.ts')
lit_glob=$(n --literal-pathspecs ls-files 'app/*.ts')
plain_magic=$(n ls-files ':(exclude)app/api' app)
lit_magic=$(n --literal-pathspecs ls-files ':(exclude)app/api' app)

printf 'root %s @ %s\n\n' "$ROOT" "$(git -C "$ROOT" rev-parse --short HEAD)"
printf 'directory prefix   plain=%-6s literal=%-6s\n' "$plain_dir"   "$lit_dir"
printf 'glob               plain=%-6s literal=%-6s\n' "$plain_glob"  "$lit_glob"
printf 'magic :(exclude)   plain=%-6s literal=%-6s\n\n' "$plain_magic" "$lit_magic"

ok=0
[ "$plain_dir" = "$lit_dir" ] && [ "$plain_dir" != "0" ] \
  && echo "PASS  directory-prefix survives literal — no capability loses behaviour" || { echo "FAIL  directory-prefix"; ok=1; }
[ "$plain_glob" -gt 0 ] && [ "$lit_glob" = "0" ] \
  && echo "PASS  glob IS selection — removed by literal (D1-F5 live today)"        || { echo "FAIL  glob"; ok=1; }
[ "$plain_magic" -lt "$plain_dir" ] && [ "$lit_magic" = "$plain_dir" ] \
  && echo "PASS  magic neutralized, NOT rejected — D1.3 by construction"           || { echo "FAIL  magic"; ok=1; }
exit $ok
