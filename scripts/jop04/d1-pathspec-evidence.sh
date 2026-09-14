#!/usr/bin/env bash
# JOP-04 · D1 evidence — read-only. Run from any repository root.
#
# ⭐ Compare RELATIONSHIPS, not absolute counts. Counts differ per tree; the
#    three relationships are the architectural property D1 rests on.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1
n() { git "$@" 2>/dev/null | wc -l | tr -d ' '; }

plain_dir=$(n ls-files app)
lit_dir=$(n --literal-pathspecs ls-files app)
plain_glob=$(n ls-files 'app/*.ts')
lit_glob=$(n --literal-pathspecs ls-files 'app/*.ts')
plain_magic=$(n ls-files ':(exclude)app/api' app)
lit_magic=$(n --literal-pathspecs ls-files ':(exclude)app/api' app)

printf 'repo %s @ %s\n\n' "$(basename "$PWD")" "$(git rev-parse --short HEAD)"
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
