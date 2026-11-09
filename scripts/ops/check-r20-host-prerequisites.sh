#!/usr/bin/env bash
# =============================================================================
# R20 host prerequisites preflight (WS-DELETE-01 independent deletion ledger)
#
# An operator runs this ON THE HOST, before the R20 compose wiring is deployed,
# to learn whether the host directory and key file that will back
#   R20_LEDGER_FILE  R20_HIGH_WATER_FILE  R20_LEDGER_KEY_FILE
# can satisfy lib/recovery/r20DeletionLedger.ts. Register line C1 in
# docs/ops/NON_DELIVERY_REGISTER.md; lane record
# docs/programme/WS-DELETE-01_R-SHARED_WORK_CARD_EXIT_AND_CUSTODY_NOTICE_LANE_RECORD_2026-11-05.md
# sections 6.9, 6.10, 6.11.
#
#   check-r20-host-prerequisites.sh --ledger <abs> --high-water <abs> \
#       --key-file <abs> [--expect-uid N]
#
# Exit codes
#   0  every required check is true                 result=PASS
#   1  at least one required check is false         result=FAIL
#   3  none is false, but at least one is UNKNOWN   result=UNKNOWN
#   2  misuse (the message names no path and echoes no value)
# An UNKNOWN is never a pass. An internal error is reported as UNKNOWN (exit 3).
#
# Discipline (same family as scripts/ops/ws-backup-exact-shell-preflight-oci.sh
# and scripts/ops/workstation-storage-census.sh): names and counts only.
#   * It never prints a path, a directory name, a file name, key bytes, a key
#     length (other than through the key_form class) or any command's error
#     text. After argument validation stderr is closed to /dev/null.
#   * It reads at most 4096 bytes of the key file, uses them only to classify
#     the form, and keeps no copy. It never writes, renames, chmods or deletes
#     anything except ONE probe file '.r20-preflight-probe.<pid>' that it
#     creates (O_EXCL) and removes inside the authority directory, and only when
#     the invoking uid equals --expect-uid (see dir_probe_write).
#   * GNU coreutils only (stat -c, realpath, dirname, od, tr, id, rm); no eval,
#     no set -x; every expansion is quoted; LC_ALL=C; umask 077.
#   * Each requirement is one line of the form 'check <id> <probe...>' so a
#     test can neutralise exactly one check (scripts/ops/check-r20-host-
#     prerequisites.test.mjs builds that mutant for every required check).
#
# Output vocabulary (every stdout line is '<name> <value>', then the result line)
#   <check_id>          true | false | UNKNOWN
#   ledger_pair_state   both_absent | both_present | one_present | wrong_kind | UNKNOWN
#   key_form            hex64 | base64_43 | raw32 | invalid | UNKNOWN
#   advisory lines      true | false   (authority_dir_under_docker_data_root,
#                                       key_under_docker_data_root)
#   ledger_pair_state: existence is existsSync()'s, so a symlink that leads
#   nowhere is absent (and reads one_present when the other member exists).
#   wrong_kind means at least one member that DOES exist is not a non-symlink
#   regular file (a directory, a symlink to anything that exists, a FIFO, a
#   socket). It takes precedence over one_present, and ledger_pair_state_ok is
#   then false. Only the KIND and the owner of an existing member are examined,
#   never its content.
#
# What this script does and does NOT establish
#   * It establishes the host-side preconditions the module enforces or needs:
#     one directory holding both authority files, rwx for the app's uid on that
#     DIRECTORY (the module writes a temp file in the same directory and renames
#     it over the target, then fsyncs the directory, so a single-file bind
#     mount cannot work), a key file the module will accept, and a consistent
#     ledger/high-water pair state (both absent, or both present as non-symlink
#     regular files owned by the app's uid).
#   * It does NOT establish that the container will see that directory, which
#     uid the container really runs as, that the files' contents verify (no
#     HMAC is computed; the key is never used; an existing ledger or high-water
#     file is checked for kind and owner only, never read), or that the ledger
#     is INDEPENDENT. The module is a working seal but not an independent one while
#     the app container holds both the key and the authority directory (R104,
#     R105, lane record 6.10(e)). key_not_inside_authority_dir and the advisory
#     lines only surface the cheap ways of getting that wrong.
#
# Where the module's behaviour is mirrored (lib/recovery/r20DeletionLedger.ts)
#   keyBytes():  raw = readFileSync(file); text = raw.toString('utf8').trim();
#       /^[a-f0-9]{64}$/i            -> Buffer.from(text,'hex')    (32 bytes)
#       /^[A-Za-z0-9+/]{43}=$/       -> Buffer.from(text,'base64') (32 bytes)
#       /^[A-Za-z0-9+/]{44}$/        -> Buffer.from(text,'base64') (33 bytes: invalid)
#       otherwise                    -> key = raw (the UNtrimmed bytes)
#       key.length !== 32            -> R20_LEDGER_KEY_INVALID
#   so 'raw 32 bytes' is valid, 'raw 32 + trailing newline' (33) is not, and the
#   unpadded 44-character base64 form can never succeed. The classification below
#   is done on the hex dump of the first 4096 bytes so it is exact for NUL and
#   non-UTF-8 content.
#   EMULATION DIFFERENCES (both fail closed: the script may say 'invalid' where
#   the module would accept; it never says valid where the module throws):
#     (1) JS trim() also strips Unicode whitespace (BOM U+FEFF, NBSP U+00A0,
#         U+2028 ...). This script trims only ASCII space, \t \n \v \f \r.
#     (2) A key file larger than 4096 bytes is reported invalid; the module would
#         accept a valid key padded with more than 4096 bytes of whitespace.
#   sealR20DeletionLedger(): existsSync() of both files; exactly one present
#       throws; neither present needs R20_LEDGER_ALLOW_INITIALIZE === 'true'
#       (that environment value is deploy wiring, not a host fact: not checked).
#   atomicWrite(): mkdir recursive 0700, temp file in the same directory
#       (flags 'wx', 0600), fsync, rename over the target, fsync the directory.
#
# Deviations, stated: key_mode_ok also requires the owner read bit (mode & 0400),
# because the module reads the key as the app uid and a mode such as 0200 would
# otherwise pass '(mode & 077) == 0' when this script runs as root. Only the final
# path component is tested for being a symlink. The two path arguments naming the
# same file, or ending in '/', are refused as misuse.
# =============================================================================
set -Eeuo pipefail
umask 077
export LC_ALL=C
shopt -s extglob

readonly DOCKER_DATA_ROOT_PREFIX=/var/lib/docker/
readonly HEX_PAIR='(3[0-9]|4[1-6]|6[1-6])'
readonly B64_PAIR='(2b|2f|3[0-9]|4[1-9a-f]|5[0-9a]|6[1-9a-f]|7[0-9a])'
readonly WS_PAIR='20|09|0a|0b|0c|0d'

usage() {
  cat <<'EOF'
Usage: check-r20-host-prerequisites.sh --ledger <abs-path-to-ledger-file> \
         --high-water <abs-path-to-high-water-file> \
         --key-file <abs-path-to-key-file> [--expect-uid N]

Host preflight for the R20 deletion ledger. It changes nothing that persists:
its one write is a probe file that it creates and removes. Run it on the host
that will hold the authority directory, before the compose wiring is deployed.

  --ledger      absolute path that R20_LEDGER_FILE will name
  --high-water  absolute path that R20_HIGH_WATER_FILE will name
  --key-file    absolute path that R20_LEDGER_KEY_FILE will name
  --expect-uid  uid the application runs as (default 1000)
  -h, --help    this text (exit 0)

There is no default for the three paths. Each flag may be given once.

Output: 'ledger_pair_state' and 'key_form' first, then one
'<check_id> <true|false|UNKNOWN>' line per check, two advisory lines
(authority_dir_under_docker_data_root, key_under_docker_data_root: they never
change the result), and a final 'r20_host_preflight result=PASS|FAIL|UNKNOWN'.
Paths, file names, key bytes and command errors are never printed.

Values of the two state lines:
  ledger_pair_state   both_absent | both_present | one_present | wrong_kind | UNKNOWN
  key_form            hex64 | base64_43 | raw32 | invalid | UNKNOWN
wrong_kind: a ledger or high-water path that exists is not a non-symlink regular
file (a directory, a symlink, a FIFO, a socket); ledger_pair_state_ok is false.

Exit: 0 PASS, 1 FAIL, 3 UNKNOWN (no check false, some not determinable),
2 misuse. dir_probe_write creates and removes one probe file in the directory and
is only evaluated when the invoking uid equals --expect-uid, otherwise UNKNOWN.
EOF
}

refuse() { printf 'r20_host_preflight: refused: %s\n' "$1" >&2; exit 2; }

# ------------------------------------------------------------ arguments -----
LEDGER="" HW="" KEY="" EXPECT_RAW="1000"
SEEN_LEDGER=0 SEEN_HW=0 SEEN_KEY=0 SEEN_UID=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --ledger|--high-water|--key-file|--expect-uid)
      flag="$1"
      [ "$#" -ge 2 ] || refuse "a flag has no value"
      case "$flag" in
        --ledger)      [ "$SEEN_LEDGER" -eq 0 ] || refuse "a flag was given more than once"; SEEN_LEDGER=1; LEDGER="$2" ;;
        --high-water)  [ "$SEEN_HW" -eq 0 ]     || refuse "a flag was given more than once"; SEEN_HW=1; HW="$2" ;;
        --key-file)    [ "$SEEN_KEY" -eq 0 ]    || refuse "a flag was given more than once"; SEEN_KEY=1; KEY="$2" ;;
        --expect-uid)  [ "$SEEN_UID" -eq 0 ]    || refuse "a flag was given more than once"; SEEN_UID=1; EXPECT_RAW="$2" ;;
      esac
      shift 2 ;;
    *) refuse "unknown argument" ;;
  esac
done

[ "$SEEN_LEDGER" -eq 1 ] && [ "$SEEN_HW" -eq 1 ] && [ "$SEEN_KEY" -eq 1 ] || refuse "a required flag is missing"

validate_path() {
  local v="$1"
  [ -n "$v" ] || refuse "a path value is empty"
  case "$v" in *$'\n'*) refuse "a path value contains a newline" ;; esac
  case "$v" in /*) ;; *) refuse "a path value is not absolute" ;; esac
  case "$v" in */) refuse "a path value ends with a slash" ;; esac
}
validate_path "$LEDGER"
validate_path "$HW"
validate_path "$KEY"
case "$EXPECT_RAW" in ''|*[!0-9]*) refuse "the expected uid is not a non-negative integer" ;; esac
[ "${#EXPECT_RAW}" -le 10 ] || refuse "the expected uid is not a non-negative integer"
EXPECT_UID=$((10#$EXPECT_RAW))
[ "$LEDGER" != "$HW" ] || refuse "ledger and high-water name the same file"

[ "${BASH_VERSINFO[0]}" -ge 4 ] || refuse "bash 4 or newer is required"
for tool in stat dirname realpath od tr id rm head; do
  command -v "$tool" >/dev/null 2>&1 || refuse "a required tool is missing"
done
STAT_VERSION="$(stat --version 2>/dev/null | head -n 1 || true)"
case "$STAT_VERSION" in *"GNU coreutils"*) ;; *) refuse "GNU coreutils is required" ;; esac
unset STAT_VERSION
REAL_L="$(realpath -m -- "$LEDGER" 2>/dev/null || true)"
REAL_H="$(realpath -m -- "$HW" 2>/dev/null || true)"
if [ -n "$REAL_L" ] && [ "$REAL_L" = "$REAL_H" ]; then refuse "ledger and high-water name the same file"; fi
unset REAL_L REAL_H

# From here on nothing the shell or a command says may reach the operator.
RUNNING=1
DONE=0
PROBES=()
exec 2>/dev/null

cleanup_probes() {
  local f
  for f in ${PROBES[@]+"${PROBES[@]}"}; do rm -f -- "$f" || true; done
}
on_exit() {
  cleanup_probes
  if [ "$RUNNING" -eq 1 ] && [ "$DONE" -eq 0 ]; then
    printf 'r20_host_preflight result=UNKNOWN\n'
    exit 3
  fi
}
trap on_exit EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

# ---------------------------------------------------------------- helpers ---
SAW_FALSE=0
SAW_UNKNOWN=0
NUM=""

# check <id> <probe...>: probe exit 0 = true, 1 = false, anything else = UNKNOWN.
check() {
  local id="$1" rc=0 state
  shift
  "$@" >/dev/null 2>&1 || rc=$?
  case "$rc" in
    0) state=true ;;
    1) state=false; SAW_FALSE=1 ;;
    *) state=UNKNOWN; SAW_UNKNOWN=1 ;;
  esac
  printf '%s %s\n' "$id" "$state"
}

# stat_num <format> <path>: numeric stat field, symlinks followed. NUM, or rc 3.
stat_num() {
  local out
  out="$(stat -L -c "$1" -- "$2" 2>/dev/null)" || return 3
  case "$out" in ''|*[!0-9]*) return 3 ;; esac
  NUM="$out"
}

# path_under <path> <dir>: 0 when <path> is <dir> or lies below it, textually or
# after symlink resolution; 1 when not; 3 when resolution is unavailable.
path_under() {
  local p="$1" d="${2%/}" rp rd
  # d is empty for the filesystem root, so "$d"/* then matches every absolute path.
  case "$p" in "$d"/*|"$d") return 0 ;; esac
  rp="$(realpath -m -- "$p" 2>/dev/null)" || return 3
  rd="$(realpath -m -- "$2" 2>/dev/null)" || return 3
  rd="${rd%/}"
  case "$rp" in "$rd"/*|"$rd") return 0 ;; esac
  return 1
}

under_docker_root() {
  local p="$1" rp
  case "${p%/}/" in "$DOCKER_DATA_ROOT_PREFIX"*) return 0 ;; esac
  rp="$(realpath -m -- "$p" 2>/dev/null)" || return 1
  case "${rp%/}/" in "$DOCKER_DATA_ROOT_PREFIX"*) return 0 ;; esac
  return 1
}

INVOKER_UID="$(id -u 2>/dev/null || true)"
case "$INVOKER_UID" in ''|*[!0-9]*) INVOKER_UID="" ;; *) INVOKER_UID=$((10#$INVOKER_UID)) ;; esac

DIR_L="$(dirname -- "$LEDGER")"
DIR_H="$(dirname -- "$HW")"
DIRS=("$DIR_L")
if [ "$DIR_H" != "$DIR_L" ]; then DIRS+=("$DIR_H"); fi

# each_dir <per-dir probe>: every distinct authority directory must satisfy it.
# 0 when all do, 1 when any is false, otherwise 3.
each_dir() {
  local d rc worst=0
  for d in "${DIRS[@]}"; do
    rc=0
    "$1" "$d" || rc=$?
    case "$rc" in
      0) ;;
      1) worst=1 ;;
      *) [ "$worst" -eq 1 ] || worst=3 ;;
    esac
  done
  return "$worst"
}

# ----------------------------------------------- derived, non-check facts ---
PAIR=UNKNOWN
compute_pair_state() {
  local p d le=0 he=0 bad=0
  for p in "$LEDGER" "$HW"; do
    d="$(dirname -- "$p")"
    # A directory the invoker cannot search would make every file look absent.
    if [ -d "$d" ] && [ ! -x "$d" ]; then return 0; fi
  done
  if [ -e "$LEDGER" ]; then le=1; fi
  if [ -e "$HW" ]; then he=1; fi
  # Existence is existsSync()'s: a symlink that leads nowhere is absent. A member
  # that does exist must be a non-symlink regular file: a directory, FIFO or
  # socket cannot be the ledger, and the module's temp-file-and-rename write
  # replaces a symlink instead of writing through it.
  for p in "$LEDGER" "$HW"; do
    if [ -e "$p" ] && { [ -L "$p" ] || [ ! -f "$p" ]; }; then bad=1; fi
  done
  if [ "$bad" -eq 1 ]; then PAIR=wrong_kind
  elif [ "$le" -eq 0 ] && [ "$he" -eq 0 ]; then PAIR=both_absent
  elif [ "$le" -eq 1 ] && [ "$he" -eq 1 ]; then PAIR=both_present
  else PAIR=one_present
  fi
}

KEY_FORM=UNKNOWN
classify_key() {
  local size hexs t n re
  if [ ! -f "$KEY" ] || [ ! -r "$KEY" ]; then return 0; fi
  size="$(stat -L -c %s -- "$KEY" 2>/dev/null)" || return 0
  case "$size" in ''|*[!0-9]*) return 0 ;; esac
  if [ "$size" -gt 4096 ]; then KEY_FORM=invalid; return 0; fi
  hexs="$(od -An -v -tx1 -N 4096 -- "$KEY" 2>/dev/null | tr -d ' \n')" || return 0
  [ "${#hexs}" -eq $((size * 2)) ] || return 0
  # JS trim() on ASCII whitespace only, done on byte pairs so alignment holds.
  t="${hexs##+($WS_PAIR)}"
  t="${t%%+($WS_PAIR)}"
  n=$(( ${#t} / 2 ))
  if [ "$n" -eq 64 ]; then
    re="^${HEX_PAIR}{64}\$"
    if [[ $t =~ $re ]]; then KEY_FORM=hex64; return 0; fi
  elif [ "$n" -eq 44 ]; then
    re="^${B64_PAIR}{43}3d\$"
    if [[ $t =~ $re ]]; then KEY_FORM=base64_43; return 0; fi
    re="^${B64_PAIR}{44}\$"
    # Unpadded 44 characters take the module's base64 branch and decode to 33.
    if [[ $t =~ $re ]]; then KEY_FORM=invalid; return 0; fi
  fi
  # Anything else is used as the raw, untrimmed file bytes: valid iff exactly 32.
  if [ "$size" -eq 32 ]; then KEY_FORM=raw32; else KEY_FORM=invalid; fi
}

# ------------------------------------------------------------- probes -------
p_same_dir() { [ "$DIR_L" = "$DIR_H" ]; }

d_exists() { [ -e "$1" ]; }
d_not_symlink() {
  if [ -L "$1" ]; then return 1; fi
  [ -e "$1" ] || return 3
  return 0
}
d_is_directory() { [ -e "$1" ] || return 3; [ -d "$1" ]; }
d_owner_uid_ok() {
  [ -e "$1" ] || return 3
  stat_num %u "$1" || return 3
  [ "$NUM" -eq "$EXPECT_UID" ]
}
d_mode_ok() {
  local m
  [ -e "$1" ] || return 3
  stat_num %a "$1" || return 3
  m=$((8#$NUM))
  [ $((m & 0700)) -eq $((0700)) ] && [ $((m & 022)) -eq 0 ]
}
d_probe_write() {
  local f="$1/.r20-preflight-probe.$$"
  [ -n "$INVOKER_UID" ] && [ "$INVOKER_UID" -eq "$EXPECT_UID" ] || return 3
  [ -d "$1" ] || return 3
  if ( set -C; : > "$f" ) 2>/dev/null; then
    PROBES+=("$f")
  else
    # A leftover of this exact name (a recycled pid) is ambiguous, not unwritable.
    if [ -e "$f" ] || [ -L "$f" ]; then return 3; fi
    return 1
  fi
  rm -f -- "$f" 2>/dev/null || return 1
  [ ! -e "$f" ]
}

p_pair_state_ok() {
  case "$PAIR" in
    both_absent|both_present) return 0 ;;
    one_present|wrong_kind) return 1 ;;
    *) return 3 ;;
  esac
}
p_ledger_files_owner_ok() {
  local f
  [ "$PAIR" != UNKNOWN ] || return 3
  for f in "$LEDGER" "$HW"; do
    if [ -e "$f" ]; then
      stat_num %u "$f" || return 3
      [ "$NUM" -eq "$EXPECT_UID" ] || return 1
    fi
  done
  return 0
}

p_key_exists() { [ -e "$KEY" ]; }
p_key_not_symlink() {
  if [ -L "$KEY" ]; then return 1; fi
  [ -e "$KEY" ] || return 3
  return 0
}
p_key_is_regular() { [ -e "$KEY" ] || return 3; [ -f "$KEY" ]; }
p_key_owner_uid_ok() {
  [ -e "$KEY" ] || return 3
  stat_num %u "$KEY" || return 3
  [ "$NUM" -eq "$EXPECT_UID" ]
}
p_key_mode_ok() {
  local m
  [ -e "$KEY" ] || return 3
  stat_num %a "$KEY" || return 3
  m=$((8#$NUM))
  [ $((m & 077)) -eq 0 ] && [ $((m & 0400)) -ne 0 ]
}
p_key_form_ok() {
  case "$KEY_FORM" in
    hex64|base64_43|raw32) return 0 ;;
    invalid) return 1 ;;
    *) return 3 ;;
  esac
}
p_key_not_inside_authority_dir() {
  local d rc unknown=0
  for d in "${DIRS[@]}"; do
    rc=0
    path_under "$KEY" "$d" || rc=$?
    case "$rc" in
      0) return 1 ;;
      1) ;;
      *) unknown=1 ;;
    esac
  done
  [ "$unknown" -eq 0 ] || return 3
  return 0
}
# The key must not be the ledger file or the high-water file (the module writes
# both): same spelling, same resolved path, or the same device and inode.
p_key_not_ledger_file() {
  local f rk rf
  for f in "$LEDGER" "$HW"; do
    if [ "$KEY" = "$f" ]; then return 1; fi
    rk="$(realpath -m -- "$KEY" 2>/dev/null)" || return 3
    rf="$(realpath -m -- "$f" 2>/dev/null)" || return 3
    if [ "$rk" = "$rf" ]; then return 1; fi
    if [ -e "$KEY" ] && [ -e "$f" ] && [ "$KEY" -ef "$f" ]; then return 1; fi
  done
  return 0
}

compute_pair_state
classify_key

printf 'ledger_pair_state %s\n' "$PAIR"
printf 'key_form %s\n' "$KEY_FORM"

# ------------------------------------------------------------ the checks ----
# One line per requirement, in this exact shape (the test mutates these lines).
check ledger_dir_same_as_high_water_dir p_same_dir
check dir_exists each_dir d_exists
check dir_not_symlink each_dir d_not_symlink
check dir_is_directory each_dir d_is_directory
check dir_owner_uid_ok each_dir d_owner_uid_ok
check dir_mode_ok each_dir d_mode_ok
check dir_probe_write each_dir d_probe_write
check ledger_pair_state_ok p_pair_state_ok
check ledger_files_owner_ok p_ledger_files_owner_ok
check key_exists p_key_exists
check key_not_symlink p_key_not_symlink
check key_is_regular p_key_is_regular
check key_owner_uid_ok p_key_owner_uid_ok
check key_mode_ok p_key_mode_ok
check key_form_ok p_key_form_ok
check key_not_inside_authority_dir p_key_not_inside_authority_dir
check key_not_ledger_file p_key_not_ledger_file

# ---------------------------------------------------------- advisory lines ---
# Never part of the result. A directory under the Docker data root is the shape
# of a named volume, which is part of the app's own storage and not independent.
ADV_DIR=false
for d in "${DIRS[@]}"; do
  if under_docker_root "$d"; then ADV_DIR=true; fi
done
ADV_KEY=false
if under_docker_root "$KEY"; then ADV_KEY=true; fi
printf 'authority_dir_under_docker_data_root %s\n' "$ADV_DIR"
printf 'key_under_docker_data_root %s\n' "$ADV_KEY"

if [ "$SAW_FALSE" -eq 1 ]; then RESULT=FAIL; RC=1
elif [ "$SAW_UNKNOWN" -eq 1 ]; then RESULT=UNKNOWN; RC=3
else RESULT=PASS; RC=0
fi
printf 'r20_host_preflight result=%s\n' "$RESULT"
DONE=1
exit "$RC"
