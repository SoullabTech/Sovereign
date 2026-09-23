#!/usr/bin/env bash
# =============================================================================
# Worktree census — READ ONLY classification of every git worktree
#
#   scripts/ops/worktree-census.sh                       # main repo = ~/MAIA-SOVEREIGN
#   REPO=~/MAIA-SOVEREIGN CANON=clean-main-no-secrets scripts/ops/worktree-census.sh
#   CENSUS_OUT=~/MAIA-SOVEREIGN/logs/worktrees-$(date +%F).tsv scripts/ops/worktree-census.sh
#
# For each registered worktree it reports: path, volume, branch, HEAD,
# total GB, regenerable GB (node_modules/.next/.turbo/coverage/dist),
# source GB (everything else), tracked-modified count, untracked count,
# commits not on any remote ref, whether HEAD is an ancestor of the
# canonical branch, and a classification:
#
#   HOLD        detached HEAD, unreadable, or not a registered worktree
#   INSPECT     tracked files modified or untracked files present (a person looks first)
#   PRESERVE    clean tree but commits exist on no remote -> bundle before anything
#   RETAIN      clean, pushed, NOT merged into canonical -> keep source, regenerable bytes reclaimable
#   REMOVABLE   clean, pushed, merged into canonical -> whole worktree reclaimable
#
# "Reclaimable" is a classification, never an act. This script deletes,
# moves, prunes and fetches nothing. Set CENSUS_FETCH=1 to allow one
# `git fetch origin <canon>` first (updates remote-tracking refs only) so
# the merged column is current; default is to use whatever origin/<canon>
# the repo already holds and to say so.
#
# Runs under macOS bash 3.2 and Linux bash.
# =============================================================================
set -u

REPO="${REPO:-$HOME/MAIA-SOVEREIGN}"
CANON="${CANON:-clean-main-no-secrets}"
CENSUS_OUT="${CENSUS_OUT:-}"
# FD-4 (P0 adjudication, 2026-09-23): OPTIONAL machine-readable output. CENSUS_JSON=/path/census.json writes the same
# rows as the TSV as a JSON array. Output only; default behaviour unchanged.
CENSUS_JSON="${CENSUS_JSON:-}"
CENSUS_FETCH="${CENSUS_FETCH:-0}"
REGEN_NAMES="node_modules .next .turbo coverage dist"

if ! git -C "$REPO" rev-parse --git-dir >/dev/null 2>&1; then
  echo "not a git repository: $REPO (set REPO=...)" >&2; exit 2
fi

if [[ "$CENSUS_FETCH" == "1" ]]; then
  git -C "$REPO" fetch origin "$CANON" >/dev/null 2>&1 && FETCHED="fetched now" || FETCHED="FETCH FAILED, using stored ref"
else
  FETCHED="not fetched (CENSUS_FETCH=1 to refresh)"
fi
CANON_REF="origin/$CANON"
git -C "$REPO" rev-parse --verify -q "$CANON_REF" >/dev/null || CANON_REF="$CANON"
CANON_SHA=$(git -C "$REPO" rev-parse --short "$CANON_REF" 2>/dev/null || echo "?")

kb_of() { du -sk "$1" 2>/dev/null | awk '{print $1}'; }
to_gb() { awk -v k="${1:-0}" 'BEGIN{printf "%.2f", k/1048576}'; }
vol_of() {
  case "$1" in
    /Volumes/*) echo "$1" | cut -d/ -f3 ;;
    "$HOME"*|/Users/*|/home/*|/private/*|/tmp/*) echo "internal" ;;
    *) echo "other" ;;
  esac
}

TSV="$(mktemp -t worktree-census.XXXXXX)"
RAW="$(mktemp -t worktree-census-raw.XXXXXX)"
printf 'path\tvolume\tbranch\thead\ttotal_gb\tregen_gb\tsource_gb\tmodified\tuntracked\tunpushed\tmerged\tclass\tnested_excluded_gb\n' > "$TSV"

# ---- walk registered worktrees (porcelain is stable across git versions) ----
wt_path=""; wt_head=""; wt_branch=""; wt_detached=0
WT_TOTAL=$(git -C "$REPO" worktree list --porcelain 2>/dev/null | grep -c "^worktree ")
WT_N=0
emit() {
  [[ -n "$wt_path" ]] || return
  WT_N=$((WT_N + 1)); printf '[worktree-census] %d/%d %s%s\n' "$WT_N" "$WT_TOTAL" "$wt_path" "$([[ $WT_N -eq $WT_TOTAL ]] && echo ' (main checkout: walks its nested worktrees too, slowest)')" >&2
  local vol total regen source modified untracked unpushed merged cls n k
  vol=$(vol_of "$wt_path")
  if [[ ! -d "$wt_path" ]]; then
    printf '%s\t%s\t%s\t%s\t-\t-\t-\t-\t-\t-\t-\tHOLD(missing dir)\n' "$wt_path" "$vol" "$wt_branch" "$wt_head" >> "$RAW"; return
  fi
  total=$(kb_of "$wt_path"); total=${total:-0}
  regen=0
  while IFS= read -r d; do
    [[ -n "$d" ]] || continue
    k=$(kb_of "$d"); regen=$((regen + ${k:-0}))
  done < <(find "$wt_path" -maxdepth 4 -type d \( -name node_modules -o -name .next -o -name .turbo -o -name coverage -o -name dist \) -prune -print 2>/dev/null)
  source=$((total - regen)); [[ $source -lt 0 ]] && source=0
  if git -C "$wt_path" rev-parse --git-dir >/dev/null 2>&1; then
    modified=$(git -C "$wt_path" status --porcelain --untracked-files=no 2>/dev/null | wc -l | tr -d ' ')
    untracked=$(git -C "$wt_path" status --porcelain --untracked-files=all 2>/dev/null | grep -c '^??' | tr -d ' ')
    unpushed=$(git -C "$wt_path" rev-list --count HEAD --not --remotes 2>/dev/null || echo "?")
    if git -C "$wt_path" merge-base --is-ancestor HEAD "$CANON_REF" 2>/dev/null; then merged=yes; else merged=no; fi
  else
    modified="?"; untracked="?"; unpushed="?"; merged="?"
  fi
  if [[ "$wt_detached" == "1" || "$merged" == "?" ]]; then cls="HOLD"
  elif [[ "$modified" != "0" ]]; then cls="INSPECT"
  elif [[ "$untracked" != "0" ]]; then cls="INSPECT"
  elif [[ "$unpushed" != "0" ]]; then cls="PRESERVE"
  elif [[ "$merged" == "yes" ]]; then cls="REMOVABLE"
  else cls="RETAIN"; fi
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
    "$wt_path" "$vol" "$wt_branch" "$wt_head" "$total" "$regen" "$source" \
    "$modified" "$untracked" "$unpushed" "$merged" "$cls" >> "$RAW"
}
while IFS= read -r line; do
  case "$line" in
    "worktree "*) emit; wt_path="${line#worktree }"; wt_head=""; wt_branch=""; wt_detached=0 ;;
    "HEAD "*)     wt_head="$(echo "${line#HEAD }" | cut -c1-9)" ;;
    "branch "*)   wt_branch="${line#branch refs/heads/}" ;;
    "detached")   wt_detached=1; wt_branch="(detached)" ;;
    "")           ;;
  esac
done < <(git -C "$REPO" worktree list --porcelain 2>/dev/null | awk -v RS= -v ORS='\n\n' 'NR==1{main=$0;next}{print}END{print main}'; echo)
emit

# ---- directories under ~/.claude/worktrees that git does not know about ----
if [[ -d "$HOME/.claude/worktrees" ]]; then
  for d in "$HOME"/.claude/worktrees/*/; do
    [[ -d "$d" ]] || continue
    d="${d%/}"
    if ! grep -q "^$d	" "$RAW"; then
      k=$(kb_of "$d")
      printf '%s\t%s\t(unregistered)\t-\t%s\t-\t-\t-\t-\t-\t-\tHOLD(unregistered)\n' "$d" "$(vol_of "$d")" "${k:-0}" >> "$RAW"
    fi
  done
fi

# ---- nested-worktree subtraction + GB formatting ----------------------------
# A worktree can physically contain other registered worktrees (the main
# checkout holds ~60 under .claude/worktrees and .worktrees). Their bytes are
# subtracted from the nearest enclosing worktree so every byte is counted once.
awk -F'\t' -v OFS='\t' '
  { n++; path[n]=$1; for(i=1;i<=12;i++) f[n,i]=$i }
  END {
    for(c=1;c<=n;c++){
      if(f[c,5]=="-") continue
      best=0; bl=0
      for(p=1;p<=n;p++){
        if(p==c || f[p,5]=="-") continue
        pp=path[p] "/"
        if(substr(path[c],1,length(pp))==pp && length(pp)>bl){ best=p; bl=length(pp) }
      }
      if(best){ sub_t[best]+=f[c,5]; sub_r[best]+=(f[c,6]=="-"?0:f[c,6]) }
    }
    for(r=1;r<=n;r++){
      if(f[r,5]!="-"){
        t=f[r,5]-sub_t[r]; if(t<0)t=0
        if(f[r,6]!="-"){ g=f[r,6]-sub_r[r]; if(g<0)g=0; f[r,6]=sprintf("%.2f",g/1048576); s=t-g; if(s<0)s=0; f[r,7]=sprintf("%.2f",s/1048576) }
        f[r,5]=sprintf("%.2f",t/1048576)
      }
      nest=(sub_t[r]>0)?sprintf("%.2f",sub_t[r]/1048576):"0"
      line=f[r,1]; for(i=2;i<=12;i++) line=line OFS f[r,i]; print line OFS nest
    }
  }' "$RAW" >> "$TSV"
rm -f "$RAW"

# ---- report -------------------------------------------------------------
{
  echo "Worktree census — READ ONLY   repo=$REPO   canon=$CANON_REF@$CANON_SHA ($FETCHED)   at=$(date -u +%FT%TZ)"
  echo
  awk -F'\t' 'NR==1{next}
    { n++; if($5!="-"){t+=$5; r+=$6; s+=$7}
      c[$12]++; v[$2]+=($5=="-"?0:$5); rv[$2]+=($6=="-"?0:$6)
      if($12=="HOLD" && $3=="(detached)" && $8=="0" && $9=="0" && $10=="0" && $11=="yes") dcm++ }
    END{
      printf "worktrees: %d   total %.1f GB   regenerable %.1f GB   source %.1f GB\n", n, t, r, s
      printf "by class: "; for(k in c) printf "%s=%d  ", k, c[k]; printf "\n"
      printf "HOLD rows that are detached, clean, pushed and merged (removal candidates once a person confirms): %d\n", dcm
      printf "by volume: "; for(k in v) printf "%s=%.1fGB(regen %.1f)  ", k, v[k], rv[k]; printf "\n"
    }' "$TSV"
  echo
  printf '%-10s %7s %7s %7s %4s %4s %4s %-6s %-34s %s\n' CLASS TOTAL REGEN SRC MOD UNT UNP MERGED BRANCH PATH
  awk -F'\t' 'NR>1' "$TSV" | sort -t$'\t' -k5,5nr | while IFS=$'\t' read -r p v b h t r s m u up mg cls nest; do
    printf '%-10s %7s %7s %7s %4s %4s %4s %-6s %-34s %s\n' "$cls" "$t" "$r" "$s" "$m" "$u" "$up" "$mg" "$(echo "$b" | cut -c1-34)" "$p"
  done
  awk -F'\t' 'NR>1 && $13!="0"{printf "  %s physically contains other registered worktrees: %s GB excluded from its row\n",$1,$13}' "$TSV"
  echo
  echo "Reading the table: REGEN bytes are reclaimable in every class without loss (rebuild with npm ci / next build)."
  echo "PRESERVE rows have commits on no remote: bundle them (git bundle create <file> --all) before any removal."
  echo "INSPECT rows have modified tracked files: a person decides. HOLD rows: do not touch."
  echo "Nothing was modified by this run."
} | { if [[ -n "$CENSUS_OUT" ]]; then mkdir -p "$(dirname "$CENSUS_OUT")"; tee "${CENSUS_OUT%.tsv}.txt"; else cat; fi; }
if [[ -n "$CENSUS_OUT" ]]; then cp "$TSV" "$CENSUS_OUT"; echo "tsv: $CENSUS_OUT  report: ${CENSUS_OUT%.tsv}.txt"; fi
if [[ -n "$CENSUS_JSON" ]]; then
  mkdir -p "$(dirname "$CENSUS_JSON")"
  awk -F'\t' -v canon="$CANON_REF@$CANON_SHA" -v fetched="$FETCHED" -v at="$(date -u +%FT%TZ)" '
    function esc(s){ gsub(/\\/,"\\\\",s); gsub(/"/,"\\\"",s); return s }
    NR==1{ for(i=1;i<=NF;i++) h[i]=$i; printf "{\"instrument\":\"scripts/ops/worktree-census.sh\",\"observed_at\":\"%s\",\"canon\":\"%s\",\"fetched\":\"%s\",\"read_only\":true,\"rows\":[", at, esc(canon), esc(fetched); next }
    { printf "%s{", (NR>2?",":""); for(i=1;i<=NF;i++) printf "%s\"%s\":\"%s\"", (i>1?",":""), h[i], esc($i); printf "}" }
    END{ printf "]}\n" }' "$TSV" > "$CENSUS_JSON"
  echo "json: $CENSUS_JSON"
fi
rm -f "$TSV"
