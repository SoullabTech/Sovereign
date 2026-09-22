#!/usr/bin/env bash
# =============================================================================
# Workstation storage / RAM census — READ ONLY
#
# Answers, in GB, "what is actually consuming the machine" before anything is
# moved to the external SSD, the NAS, or the minisforum worker.
#
#   ./scripts/ops/workstation-storage-census.sh            # human report
#   CENSUS_OUT=/path/report.txt ./scripts/ops/...          # also write to file
#   CENSUS_ROOTS="$HOME/MAIA-SOVEREIGN $HOME/.claude/worktrees" ./scripts/ops/...
#   CENSUS_SKIP_DOCKER=1 ./scripts/ops/...                # daemon calls skipped
#
# Progress lines go to stderr as each section starts, so a long du is
# visibly alive. The report is written incrementally.
#
# Runs on macOS (Mac Studio) and Linux (minisforum). Every call into a
# daemon (docker, ollama) is wall-clock bounded (CENSUS_PROBE_SECS, default
# 10) and reports UNKNOWN on no answer; the census never stalls on one source. It never deletes, prunes,
# moves, or writes anything except the optional CENSUS_OUT report. It does not
# need sudo; directories it cannot read are reported as "unreadable", never
# guessed. Network mounts are listed but never walked with find.
#
# Distinct from scripts/storage-health-monitor.sh, which performs cleanup.
# =============================================================================
set -u

OS="$(uname -s)"
HOSTN="$(hostname)"
NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
CENSUS_OUT="${CENSUS_OUT:-}"
DEFAULT_ROOTS="$HOME/MAIA-SOVEREIGN $HOME/.claude/worktrees $HOME/Sovereign $HOME/Projects $HOME/Developer"
CENSUS_ROOTS="${CENSUS_ROOTS:-$DEFAULT_ROOTS}"
FIND_DEPTH="${CENSUS_FIND_DEPTH:-6}"

if [[ -n "$CENSUS_OUT" ]]; then
  mkdir -p "$(dirname "$CENSUS_OUT")"
  exec > >(tee "$CENSUS_OUT") 2>&1
fi

# ---------------------------------------------------------------- helpers ---
# du in 1 KiB blocks -> GB with two decimals. Missing path -> "-". Unreadable
# (du errors but returns something) is flagged separately.
gb_of() {
  local p="$1"
  [[ -e "$p" ]] || { echo "-"; return; }
  local kb
  kb=$(du -sk "$p" 2>/dev/null | awk '{print $1}')
  [[ -n "$kb" ]] || { echo "unreadable"; return; }
  awk -v k="$kb" 'BEGIN{printf "%.2f", k/1048576}'
}
# Sum of du -sk over many paths (stdin, one per line) -> GB and count.
gb_sum_stdin() {
  local total=0 n=0 kb
  while IFS= read -r p; do
    [[ -n "$p" ]] || continue
    kb=$(du -sk "$p" 2>/dev/null | awk '{print $1}')
    [[ -n "$kb" ]] || continue
    total=$((total + kb)); n=$((n + 1))
  done
  awk -v k="$total" -v n="$n" 'BEGIN{printf "%.2f\t%d", k/1048576, n}'
}
# Bounded external probe: runs a command with a wall-clock limit so that a
# hung daemon (Docker Desktop answering nothing to `docker info`, seen
# 2026-09-22) cannot stall the whole census. Returns 124 on timeout.
# No `timeout` binary on stock macOS, so this is done with a killer subshell;
# `exec` makes the background pid the probe itself, not a wrapper shell.
BOUND_SECS="${CENSUS_PROBE_SECS:-10}"
bounded() {
  local secs="$1"; shift
  local out rc pid killer
  out=$(mktemp -t census-bounded.XXXXXX)
  ( exec "$@" >"$out" 2>/dev/null ) & pid=$!
  ( sleep "$secs"; kill "$pid" 2>/dev/null ) 2>/dev/null & killer=$!
  wait "$pid" 2>/dev/null; rc=$?
  kill "$killer" 2>/dev/null; wait "$killer" 2>/dev/null
  cat "$out"; rm -f "$out"
  if [[ $rc -eq 143 || $rc -eq 137 ]]; then return 124; fi
  return $rc
}
progress() { printf '[census] %s\n' "$1" >&2; }
row() { printf '%-46s %10s  %s\n' "$1" "$2" "${3:-}"; }
hdr() { printf '\n== %s ==\n' "$1"; progress "$1"; }
is_network_mount() {
  # true if the mount for path $1 is a network filesystem
  local fs
  if [[ "$OS" == "Darwin" ]]; then
    fs=$(df -T 2>/dev/null "$1" | awk 'NR==2{print $2}')
    [[ -z "$fs" ]] && fs=$(mount | grep " on $1 " | sed -E 's/.*\((.*)\).*/\1/' | cut -d, -f1)
  else
    fs=$(df -T "$1" 2>/dev/null | awk 'NR==2{print $2}')
  fi
  case "$fs" in smbfs|afpfs|nfs|nfs4|cifs|webdav|fuse.sshfs) return 0 ;; *) return 1 ;; esac
}

echo "Workstation storage/RAM census — READ ONLY"
echo "host=$HOSTN os=$OS at=$NOW user=$(id -un)"
echo "roots=$CENSUS_ROOTS"

# --------------------------------------------------------------- memory ------
hdr "MEMORY (this is the resource no disk can add)"
if [[ "$OS" == "Darwin" ]]; then
  total_b=$(sysctl -n hw.memsize 2>/dev/null || echo 0)
  row "unified memory total" "$(awk -v b="$total_b" 'BEGIN{printf "%.0f GB", b/1073741824}')"
  row "swap" "$(sysctl -n vm.swapusage 2>/dev/null | sed 's/  */ /g')"
  if command -v memory_pressure >/dev/null 2>&1; then
    row "memory pressure" "$(memory_pressure 2>/dev/null | grep -i 'free percentage' | head -1 | sed 's/^ *//')"
  fi
  pagesz=$(sysctl -n hw.pagesize 2>/dev/null || echo 16384)
  vm_stat 2>/dev/null | awk -v ps="$pagesz" '
    /Pages active/      {a=$3} /Pages wired/ {w=$4} /Pages occupied by compressor/ {c=$5}
    /Pages free/        {f=$3} /Pages inactive/ {i=$3}
    END{gsub(/\./,"",a);gsub(/\./,"",w);gsub(/\./,"",c);gsub(/\./,"",f);gsub(/\./,"",i);
        printf "%-46s %10s  %s\n","  active/wired/compressed (GB)",
          sprintf("%.1f/%.1f/%.1f", a*ps/1073741824, w*ps/1073741824, c*ps/1073741824),
          sprintf("free %.1f  inactive %.1f", f*ps/1073741824, i*ps/1073741824)}'
  echo "  top resident processes:"
  ps -Aceo rss,comm 2>/dev/null | sort -nr | head -12 \
    | awk '{printf "    %6.2f GB  %s\n", $1/1048576, $2}'
else
  free -g 2>/dev/null | sed 's/^/  /'
  echo "  top resident processes:"
  ps -eo rss,comm --sort=-rss 2>/dev/null | head -12 | tail -n +2 \
    | awk '{printf "    %6.2f GB  %s\n", $1/1048576, $2}'
fi

# -------------------------------------------------------------- volumes -----
hdr "VOLUMES (internal vs external vs network)"
if [[ "$OS" == "Darwin" ]]; then
  df -H /System/Volumes/Data 2>/dev/null | awk 'NR==2{printf "%-46s %10s  used %s of %s (%s)\n","internal (Data volume)",$4" free",$3,$2,$5}'
  for v in /Volumes/*; do
    [[ -d "$v" ]] || continue
    [[ "$v" == "/Volumes/Macintosh HD" ]] && continue
    kind="external"; is_network_mount "$v" && kind="NETWORK (not walked)"
    df -H "$v" 2>/dev/null | awk -v n="$v" -v k="$kind" 'NR==2{printf "%-46s %10s  used %s of %s  [%s]\n",n,$4" free",$3,$2,k}'
  done
else
  df -H -x tmpfs -x devtmpfs -x overlay 2>/dev/null | awk 'NR>1{printf "%-46s %10s  used %s of %s (%s)\n",$6,$4" free",$3,$2,$5}'
fi

# --------------------------------------------------------------- docker -----
hdr "DOCKER"
if [[ "$OS" == "Darwin" ]]; then
  row "Docker Desktop data dir" "$(gb_of "$HOME/Library/Containers/com.docker.docker/Data") GB" "$HOME/Library/Containers/com.docker.docker/Data"
  row "Docker Desktop vms dir" "$(gb_of "$HOME/Library/Containers/com.docker.docker/Data/vms") GB"
  [[ -d "$HOME/.docker/desktop" ]] && row "~/.docker/desktop" "$(gb_of "$HOME/.docker/desktop") GB"
  # If the disk image was relocated, Docker Desktop records it here.
  if [[ -f "$HOME/Library/Group Containers/group.com.docker/settings-store.json" ]]; then
    loc=$(grep -o '"DataFolder"[^,}]*' "$HOME/Library/Group Containers/group.com.docker/settings-store.json" 2>/dev/null | head -1)
    [[ -n "$loc" ]] && row "settings DataFolder" "" "$loc"
  fi
else
  row "/var/lib/docker" "$(gb_of /var/lib/docker) GB" "(unreadable without root is normal)"
fi
if [[ "${CENSUS_SKIP_DOCKER:-0}" == "1" ]]; then
  echo "  docker daemon calls skipped (CENSUS_SKIP_DOCKER=1)"
elif ! command -v docker >/dev/null 2>&1; then
  echo "  docker CLI not installed"
elif ! bounded "$BOUND_SECS" docker info >/dev/null; then
  echo "  DOCKER = UNKNOWN: daemon gave no answer within ${BOUND_SECS}s (image/volume breakdown not asserted)"
else
  echo "  docker system df:"
  bounded "$((BOUND_SECS * 2))" docker system df | sed 's/^/    /' || echo "    UNKNOWN (no answer within $((BOUND_SECS * 2))s)"
  echo "  largest images:"
  bounded "$BOUND_SECS" docker images --format '{{.Size}}\t{{.Repository}}:{{.Tag}}' | sort -hr | head -10 | sed 's/^/    /'
  if [[ "${CENSUS_DOCKER_VERBOSE:-0}" == "1" ]]; then
    echo "  volumes:"
    bounded "$((BOUND_SECS * 6))" docker system df -v | awk '/^VOLUME NAME/{f=1;next} f&&NF{print}' | sort -k3 -hr | head -10 | sed 's/^/    /'
  else
    echo "  volumes: skipped (slow on Docker Desktop; CENSUS_DOCKER_VERBOSE=1 to include)"
  fi
fi

# --------------------------------------------------------------- models -----
hdr "MODELS (Ollama / Whisper / HF caches)"
om="$HOME/.ollama/models"
if [[ -L "$om" ]]; then
  row "~/.ollama/models -> symlink" "$(gb_of "$om") GB" "-> $(readlink "$om")"
else
  row "~/.ollama/models" "$(gb_of "$om") GB" "(on internal disk)"
fi
[[ -n "${OLLAMA_MODELS:-}" ]] && row "\$OLLAMA_MODELS" "$(gb_of "$OLLAMA_MODELS") GB" "$OLLAMA_MODELS"
for cand in /Volumes/*/ollama-models /Volumes/*/models "$HOME/models" /usr/share/ollama/.ollama/models; do
  [[ -d "$cand" ]] && row "$cand" "$(gb_of "$cand") GB"
done
if command -v ollama >/dev/null 2>&1; then
  echo "  ollama list:"; bounded "$BOUND_SECS" ollama list | sed 's/^/    /' | head -30 || echo "    OLLAMA = UNKNOWN (no answer within ${BOUND_SECS}s)"
fi
for c in "$HOME/.cache/whisper" "$HOME/.cache/huggingface" "$HOME/.cache/torch" "$HOME/.cache/lm-studio" "$HOME/.lmstudio"; do
  [[ -e "$c" ]] && row "$c" "$(gb_of "$c") GB"
done

# ---------------------------------------------------------- git + worktrees --
hdr "GIT REPOSITORIES AND WORKTREES"
wt_root="$HOME/.claude/worktrees"
if [[ -d "$wt_root" ]]; then
  n=$(find "$wt_root" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
  row "~/.claude/worktrees ($n dirs)" "$(gb_of "$wt_root") GB"
  echo "  ten largest worktrees:"
  du -sk "$wt_root"/*/ 2>/dev/null | sort -nr | head -10 \
    | awk '{printf "    %7.2f GB  %s\n", $1/1048576, $2}'
  echo "  worktrees by last modification (oldest first, candidates for NAS/archive):"
  for d in "$wt_root"/*/; do
    [[ -d "$d" ]] || continue
    if [[ "$OS" == "Darwin" ]]; then m=$(stat -f '%Sm' -t '%Y-%m-%d' "$d"); else m=$(stat -c '%y' "$d" | cut -d' ' -f1); fi
    echo "$m $d"
  done | sort | head -10 | sed 's/^/    /'
fi
for r in $CENSUS_ROOTS; do
  [[ -d "$r/.git" ]] || continue
  row "$r/.git (object db)" "$(gb_of "$r/.git") GB"
  if command -v git >/dev/null 2>&1; then
    wc_n=$(git -C "$r" worktree list 2>/dev/null | wc -l | tr -d ' ')
    row "  registered worktrees" "$wc_n" "git -C $r worktree list"
  fi
done

# ------------------------------------------------------- build artefacts ----
hdr "BUILD ARTEFACTS AND CACHES (search roots, depth $FIND_DEPTH)"
for name in node_modules .next .turbo dist build coverage; do
  res=$(for r in $CENSUS_ROOTS; do
          [[ -d "$r" ]] || continue
          is_network_mount "$r" && continue
          find "$r" -maxdepth "$FIND_DEPTH" -type d -name "$name" -prune 2>/dev/null
        done | gb_sum_stdin)
  row "$name (all copies)" "$(echo "$res" | cut -f1) GB" "$(echo "$res" | cut -f2) copies"
done
echo "  five largest node_modules:"
for r in $CENSUS_ROOTS; do
  [[ -d "$r" ]] || continue; is_network_mount "$r" && continue
  find "$r" -maxdepth "$FIND_DEPTH" -type d -name node_modules -prune 2>/dev/null
done | xargs -I{} du -sk {} 2>/dev/null | sort -nr | head -5 | awk '{printf "    %7.2f GB  %s\n",$1/1048576,$2}'

for c in "$HOME/.npm" "$HOME/.pnpm-store" "$HOME/Library/pnpm" "$HOME/.local/share/pnpm" \
         "$HOME/.yarn" "$HOME/Library/Caches/Yarn" "$HOME/.cache/yarn" "$HOME/.bun" \
         "$HOME/.cargo" "$HOME/.rustup" "$HOME/go/pkg" "$HOME/.gradle" "$HOME/.m2" \
         "$HOME/.cache/pip" "$HOME/Library/Caches/pip" "$HOME/.cache/ms-playwright" \
         "$HOME/Library/Caches/ms-playwright" "$HOME/.cache" "$HOME/Library/Caches"; do
  [[ -e "$c" ]] && row "$c" "$(gb_of "$c") GB"
done

# ---------------------------------------------------------------- xcode -----
if [[ "$OS" == "Darwin" ]]; then
  hdr "XCODE / iOS"
  for c in "$HOME/Library/Developer/Xcode/DerivedData" "$HOME/Library/Developer/Xcode/Archives" \
           "$HOME/Library/Developer/Xcode/iOS DeviceSupport" "$HOME/Library/Developer/CoreSimulator" \
           "$HOME/Library/Developer/Xcode/UserData/Previews" "$HOME/Library/Caches/com.apple.dt.Xcode" \
           "$HOME/Library/Caches/CocoaPods"; do
    [[ -e "$c" ]] && row "$c" "$(gb_of "$c") GB"
  done
fi

# --------------------------------------------------------------- library ----
# ~/Library was 107 GB on 2026-09-22 with only ~14 GB itemized by the sections
# above, so it is broken down one level, plus the three subtrees that hide
# application data (Application Support, Containers, Group Containers).
if [[ "$OS" == "Darwin" && -d "$HOME/Library" ]]; then
  hdr "LIBRARY BREAKDOWN (largest first)"
  du -sk "$HOME"/Library/* 2>/dev/null | sort -nr | head -12 | awk '{printf "  %7.2f GB  %s\n",$1/1048576,$2}'
  for sub in "Application Support" "Containers" "Group Containers" "Mobile Documents" "CloudStorage"; do
    [[ -d "$HOME/Library/$sub" ]] || continue
    echo "  $sub/ (top 8):"
    du -sk "$HOME/Library/$sub"/* 2>/dev/null | sort -nr | head -8 | awk '{printf "    %7.2f GB  %s\n",$1/1048576,$2}'
  done
fi

# ------------------------------------------------------------ logs & misc ---
hdr "LOGS, TRASH, DOWNLOADS"
for c in "$HOME/MAIA-SOVEREIGN/logs" "$HOME/Library/Logs" /var/log "$HOME/.Trash" "$HOME/Downloads" "$HOME/Desktop" \
         "$HOME/.claude" "$HOME/.claude/projects" "$HOME/Library/Application Support/Claude" "$HOME/Library/Application Support/Code"; do
  [[ -e "$c" ]] && row "$c" "$(gb_of "$c") GB"
done

# --------------------------------------------------------------- summary ----
hdr "TOP-LEVEL HOME BREAKDOWN (largest first)"
du -sk "$HOME"/* "$HOME"/.[!.]* 2>/dev/null | sort -nr | head -15 \
  | awk '{printf "  %7.2f GB  %s\n",$1/1048576,$2}'

echo
echo "Census complete. Nothing was modified. Re-run with CENSUS_OUT=<file> to keep a dated record."
echo "Migration map (Mac internal -> XSSD -> NAS -> minisforum) is decided from this record, not before it."
