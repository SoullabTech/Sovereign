#!/usr/bin/env bash
# Helpers for run.sh, kept in their own file so each rule can be tested without booting a stack (run-lib.test.mjs).
# SOURCED, never executed; sets no shell options. Needs bash 4+ (as run.sh does).

# jl_report_path <path>
# Prints the absolute path of a report file. Returns 1, printing nothing, if the file's directory does not exist (or the path is a
# directory): a walk does not create directories and does not write anywhere it cannot name. Creates nothing.
jl_report_path() {
  local p="${1:?}" d abs
  [ ! -d "$p" ] || return 1
  d="$(dirname -- "$p")"
  [ -d "$d" ] || return 1
  abs="$(cd -- "$d" 2>/dev/null && pwd)" || return 1
  [ -n "$abs" ] || return 1
  printf '%s/%s\n' "$abs" "$(basename -- "$p")"
}

# jl_combined_exit <ledger_rc> [<wj1_rc>]
# The exit code of a whole run. The ledger's code stands (0 works, 1 does not work, 64-79 the harness could not run). WJ-1 (given only
# if it was run) can only make it worse: if either part failed the run is not 0. A harness failure code (64+) is kept as it is.
jl_combined_exit() {
  local l="${1:?}" w="${2-}"
  if [ -n "$w" ] && [ "$w" != 0 ] && [ "$l" -lt 64 ]; then echo 1; else echo "$l"; fi
}

# jl_subject <repo-root>
# The "Subject" a report names: the short HEAD SHA, plus an explicit marker whenever the code that ran is not the code at that SHA.
#   - any tracked or untracked file under tests/e2e/journey-ledger that differs from HEAD (staged or not): the INSTRUMENT is not at the SHA;
#   - any other tracked file modified: the PRODUCT is not at the SHA.
# Untracked files elsewhere and ignored files are not looked at (the walk's own cache and notes would make every run look dirty).
# Call it BEFORE `next dev` starts: Next rewrites AGENTS.md and next-env.d.ts, which would read as a modified product.
jl_subject() {
  local root="${1:?}" sha branch own other parts=()
  sha="$(git -C "$root" rev-parse --short HEAD)" || return 1
  branch="$(git -C "$root" rev-parse --abbrev-ref HEAD)" || return 1
  own="$(git -C "$root" --no-optional-locks status --porcelain --untracked-files=all -- tests/e2e/journey-ledger | grep -c . || true)"
  other="$(git -C "$root" --no-optional-locks status --porcelain --untracked-files=no -- . ':(exclude)tests/e2e/journey-ledger' | grep -c . || true)"
  [ "$own" -gt 0 ] && parts+=("instrument: $own file(s) under tests/e2e/journey-ledger differ from HEAD, so this SHA does not contain the code that ran")
  [ "$other" -gt 0 ] && parts+=("product: $other other tracked file(s) modified")
  if [ "${#parts[@]}" -eq 0 ]; then printf '%s (%s)\n'  "$sha" "$branch"; return 0; fi
  local joined="${parts[0]}" i
  for i in "${parts[@]:1}"; do joined+="; $i"; done
  printf '%s + uncommitted changes (%s) (%s)\n' "$sha" "$joined" "$branch"
}

# jl_dotenv_names <root>
# The variable names Next would take from the checkout's env files for a development server (.env.development.local, .env.local,
# .env.development, .env), found with Next's own loader (@next/env) from an EMPTY environment, so the answer is what the files add.
# Prints one name per line. Prints nothing if none of the four files exists. Returns non-zero if the loader cannot be run.
jl_dotenv_names() {
  local root="${1:?}" f any=0
  for f in .env.development.local .env.local .env.development .env; do [ -f "$root/$f" ] && any=1; done
  [ "$any" = 1 ] || return 0
  ( cd -- "$root" && env -i PATH="$PATH" node -e '
    let loader;
    try { loader = require(require.resolve("@next/env", { paths: [process.cwd()] })); }
    catch (e) { console.error("cannot load @next/env from " + process.cwd()); process.exit(2); }
    let bad = false;
    const r = loader.loadEnvConfig(process.cwd(), true, { info() {}, error() { bad = true; } }, true);
    if (bad) process.exit(2);
    process.stdout.write(Object.keys(r.parsedEnv || {}).join("\n"));
  ' )
}

# jl_build_app_env
# Fills the global array JL_APP_ENV with the ONLY variables the app server is started with (`env -i "${JL_APP_ENV[@]}" ...`).
# Reads these shell variables: ROOT RUN DATABASE_URL APP_PORT STUB_PORT and the array FLAG_ENV ("K=V" each). Returns non-zero if it
# cannot tell what the checkout's env files would inject.
#  - Nothing is inherited: no proxy variable, no token or key of the caller's, no agent marker, a throwaway HOME and TMPDIR.
#  - Every name Next would load from the checkout's env files is passed as EMPTY, first: Next's loader never overrides a variable that is
#    already defined, so what those files hold cannot reach the app. (Code that reads such a name sees "", not undefined.)
#  - The model SDK is pointed at the loopback stub and given a fictional key; the database is the shadow.
# NOT done here, and not claimed: any network isolation. The app server can still open a connection wherever the machine allows.
jl_build_app_env() {
  JL_APP_ENV=()
  local names name
  mkdir -p "$RUN/home" "$RUN/tmp" || return 1
  names="$(jl_dotenv_names "$ROOT")" || return 1
  while IFS= read -r name; do [ -n "$name" ] && JL_APP_ENV+=("$name="); done <<<"$names"
  # Later entries win (env applies them in order), so the allowlist comes after the blanks.
  JL_APP_ENV+=(
    "PATH=$PATH" "HOME=$RUN/home" "TMPDIR=$RUN/tmp"
    "NODE_ENV=development" "NEXT_TELEMETRY_DISABLED=1" "PORT=$APP_PORT"
    "NODE_OPTIONS=--max-old-space-size=${JL_APP_HEAP_MB:-8192}"
    "DATABASE_URL=$DATABASE_URL" "PGOPTIONS=-c client_min_messages=warning"
    "ANTHROPIC_BASE_URL=http://127.0.0.1:$STUB_PORT" "ANTHROPIC_API_KEY=journey-ledger-fictional-not-a-key"
  )
  JL_APP_ENV+=(${FLAG_ENV[@]+"${FLAG_ENV[@]}"})
}
