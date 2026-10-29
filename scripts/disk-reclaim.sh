#!/bin/bash
# disk-reclaim.sh — macOS dev-machine reclamation, encoding the measured
# behaviour of the 2026-10-22 .. 2026-10-29 storage incidents.
#
#   ./scripts/disk-reclaim.sh            # measure + propose (default, read-only)
#   ./scripts/disk-reclaim.sh --apply    # actually reclaim
#
# Safe by default. --apply removes ONLY regenerable build output:
#   * .next directories (Next.js build cache/output)
#   * */.next/cache/webpack on external volumes
# It NEVER removes: anything containing a .git repo, anything inside a .app
# bundle, node_modules, ~/.nvm, editor extension trees, or source.
#
# Every reclamation ends with a snapshot thin, because on APFS a deletion is
# invisible to df until the covering local snapshot is released. Three separate
# cleanups during the incident were judged failures for want of that step.

set -uo pipefail

APPLY=0
[ "${1:-}" = "--apply" ] && APPLY=1

HOME_DIR="${HOME}"
# Protected prefixes: an application's own install tree is part of that
# application. Deleting node_modules inside ~/.vscode broke every extension
# and required reinstalling them (2026-10-13).
PROTECTED=(
  "${HOME_DIR}/.vscode"
  "${HOME_DIR}/.cursor"
  "${HOME_DIR}/.nvm"
  "${HOME_DIR}/Applications"
  "${HOME_DIR}/Library/Application Support/Claude"
)

hr() { printf '%s\n' "------------------------------------------------------------"; }
free_gib() { df -g "$1" 2>/dev/null | awk 'NR==2{print $4}'; }

is_protected() {
  local p="$1" x
  for x in "${PROTECTED[@]}"; do
    case "$p" in "$x"/*|"$x") return 0 ;; esac
  done
  case "$p" in *.app/*) return 0 ;; esac
  return 1
}

hr
echo "DISK RECLAIM  $(date '+%Y-%m-%d %H:%M')  mode: $([ $APPLY -eq 1 ] && echo APPLY || echo 'measure only')"
hr

echo "== capacity =="
df -h /System/Volumes/Data | awk 'NR==2{printf "  internal   free %s  (%s used)\n", $4, $5}'
for v in /Volumes/*; do
  [ -d "$v" ] || continue
  case "$v" in *.timemachine*) continue ;; esac
  df -h "$v" 2>/dev/null | awk -v n="$(basename "$v")" 'NR==2{printf "  %-10s free %s  (%s used)\n", n, $4, $5}'
done

echo
echo "== swap (this is disk) =="
sysctl -n vm.swapusage | sed 's/^/  /'
SWAP_MB=$(sysctl -n vm.swapusage | sed -n 's/.*total = \([0-9]*\).*/\1/p')
if [ "${SWAP_MB:-0}" -gt 8192 ]; then
  echo "  NOTE: ${SWAP_MB}M of swap is occupying disk. It shrinks when memory"
  echo "        pressure drops, and is fully released by a restart."
  echo "  top memory consumers:"
  ps -axo pcpu,rss,comm -r | awk 'NR>1 && NR<=5 {printf "    %5.1f%% CPU  %6.1f GB  %s\n", $1, $2/1048576, $3}'
fi

echo
echo "== local snapshots (pin deleted blocks) =="
tmutil listlocalsnapshots / 2>&1 | sed 's/^/  /' | head -8

echo
echo "== regenerable build output =="
NEXT_LIST=$(mktemp)
find "$HOME_DIR" -maxdepth 6 -type d -name '.next' -prune -print 2>/dev/null > "$NEXT_LIST"
NEXT_KEPT=$(mktemp)
NEXT_CUT=$(mktemp)
while IFS= read -r d; do
  if is_protected "$d"; then printf '%s\n' "$d" >> "$NEXT_KEPT"; else printf '%s\n' "$d" >> "$NEXT_CUT"; fi
done < "$NEXT_LIST"
N_CUT=$(wc -l < "$NEXT_CUT" | tr -d ' ')
echo "  .next directories: $N_CUT reclaimable, $(wc -l < "$NEXT_KEPT" | tr -d ' ') protected"
if [ "$N_CUT" -gt 0 ]; then
  # shellcheck disable=SC2016
  while IFS= read -r d; do du -sk "$d" 2>/dev/null; done < "$NEXT_CUT" \
    | sort -rn | head -5 | awk '{p=$0; sub(/^[0-9]+[ \t]+/,"",p); printf "    %6.1f GB  %s\n", $1/1048576, p}'
fi

echo
echo "== candidate build trees (NOT auto-removed — review these) =="
# Named *_BUILD_* / *SCRATCH* trees under QA + development roots were the
# single largest growth source: 22 GB on 2026-10-23, 10 GB on 2026-10-27,
# each holding several full builds of the same application.
for root in "${HOME_DIR}/Documents/Soullab-QA" "${HOME_DIR}/Soullab-Development"; do
  [ -d "$root" ] || continue
  find "$root" -maxdepth 3 -type d \( -name '*_BUILD_*' -o -name '*SCRATCH*' -o -name '*ISOLATED*' \) -prune 2>/dev/null \
    | while IFS= read -r d; do
        sz=$(du -sk "$d" 2>/dev/null | cut -f1)
        [ "${sz:-0}" -gt 524288 ] || continue   # >512 MB only
        g=$(find "$d" -maxdepth 3 -type d -name .git 2>/dev/null | wc -l | tr -d ' ')
        printf "    %6.1f GB  git=%s  %s\n" "$(echo "$sz" | awk '{print $1/1048576}')" "$g" "$d"
      done
done
echo "    (git=0 means no repository inside — safe to remove once its run is recorded)"

if [ $APPLY -eq 1 ]; then
  echo
  hr
  BEFORE=$(free_gib /System/Volumes/Data)
  echo "reclaiming .next ($N_CUT directories) ..."
  while IFS= read -r d; do [ -n "$d" ] && rm -rf "$d"; done < "$NEXT_CUT"

  for v in /Volumes/*; do
    [ -d "$v" ] || continue
    case "$v" in *.timemachine*|*/LaCie*) continue ;; esac
    find "$v" -maxdepth 5 -type d -path '*/.next/cache/webpack' -prune -print0 2>/dev/null \
      | xargs -0 -r rm -rf 2>/dev/null
  done

  sync
  echo "thinning local snapshots (required: df is masked until this runs) ..."
  sudo tmutil thinlocalsnapshots / 200000000000 4 2>&1 | sed 's/^/  /'
  sync; sleep 12
  AFTER=$(free_gib /System/Volumes/Data)
  hr
  echo "internal free: ${BEFORE} GB -> ${AFTER} GB  (reclaimed $((AFTER - BEFORE)) GB)"
else
  echo
  hr
  echo "Nothing removed. Re-run with --apply to reclaim the .next output above."
  echo "Candidate build trees are never auto-removed; delete those deliberately."
fi

rm -f "$NEXT_LIST" "$NEXT_KEPT" "$NEXT_CUT"
hr
