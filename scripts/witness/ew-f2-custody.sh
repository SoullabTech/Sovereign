#!/usr/bin/env bash
# EW-F2 · RUNTIME CUSTODY FOR THE WITNESS SERVER.
#
# ⭐⭐ WHY THIS EXISTS. Step 2's browser observations were made against a dev
# server whose custody was never captured, so they could not be labelled with a
# commit afterwards — and a witness that cannot say what it was witnessing is
# hygiene, not evidence. Custody was assembled by hand once; that is exactly the
# kind of step that gets skipped when it is tiring, so it is a command now.
#
# ⛔ WHAT THIS ESTABLISHES, AND WHAT IT DOES NOT.
# `next dev` does not stamp itself with a commit, so this cannot ask the server
# what it is running. It captures the four facts that BOUND the claim:
#
#     HEAD                 what the checkout is at
#     tracked diff         whether the relevant source differs from HEAD
#     server cwd           whether the server is serving THAT checkout
#     server start time    whether it started after the checkout moved
#
# Custody is then an INFERENCE from those four, not a report from the process.
# ⚠️ A stronger form would be a build-stamped runtime identity, as production
# has via GIT_COMMIT. Dev has no equivalent. Recorded as a known limit, not
# papered over.
#
# ⛔ READ-ONLY. No git write, no server signal, no database access.

set -u
PORT="${1:-3100}"

echo "── runtime custody · port ${PORT} ──────────────────────────"
echo "captured        $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "HEAD            $(git rev-parse HEAD 2>/dev/null || echo UNKNOWN)"
echo "HEAD short      $(git rev-parse --short HEAD 2>/dev/null || echo UNKNOWN)"
echo "checkout        $(pwd -P)"

# ⭐ TRACKED AND UNTRACKED ARE DIFFERENT FACTS AND ARE REPORTED SEPARATELY.
# The S3 Step-7 walk failed its cleanliness check on untracked scratch while
# every tracked file matched the named commit — the check was right to fail and
# wrong to be read as "the application is not that commit". Do not merge them.
PATHS="app/writers-studio lib/writersStudio lib/manuscript/revisionProposal lib/manuscript/sections app/api/sovereign/manuscripts"

TRACKED=$(git status --porcelain --untracked-files=no -- $PATHS 2>/dev/null)
UNTRACKED=$(git status --porcelain --untracked-files=normal -- $PATHS 2>/dev/null | grep '^??' || true)

echo
echo "relevant paths  $PATHS"
if [ -z "$TRACKED" ]; then
  echo "tracked diff    NONE  ← the relevant source IS this commit"
else
  echo "tracked diff    PRESENT  ⛔ the relevant source is NOT this commit:"
  echo "$TRACKED" | sed 's/^/                  /'
fi
if [ -n "$UNTRACKED" ]; then
  echo "untracked       present (hygiene only, not a source difference):"
  echo "$UNTRACKED" | sed 's/^/                  /'
fi

echo
PID=$(lsof -ti:"${PORT}" -sTCP:LISTEN 2>/dev/null | head -1)
if [ -z "$PID" ]; then
  echo "server          NOT LISTENING on ${PORT}"
  echo
  echo "CUSTODY: UNKNOWN — no server to attribute."
  exit 1
fi

CWD=$(lsof -a -p "$PID" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -1)
STARTED=$(ps -o lstart= -p "$PID" 2>/dev/null | sed 's/^ *//')
CMD=$(ps -o command= -p "$PID" 2>/dev/null | cut -c1-100)

echo "server pid      $PID"
echo "server cwd      ${CWD:-UNKNOWN}"
echo "server started  ${STARTED:-UNKNOWN}"
echo "server command  ${CMD:-UNKNOWN}"

echo
if [ -z "$TRACKED" ] && [ "$CWD" = "$(pwd -P)" ]; then
  echo "CUSTODY: BOUNDED to $(git rev-parse --short HEAD)"
  echo "  ⚠️ Bounded, not proven. The server does not report its own commit."
  echo "  This says: the checkout is at that SHA, the relevant tracked source"
  echo "  matches it, and the listening server is serving THIS checkout."
  echo "  ⛔ It does NOT establish that the server started after the checkout"
  echo "     moved. Compare 'server started' against when you fast-forwarded;"
  echo "     a server older than the checkout may be serving replaced modules."
  exit 0
fi

echo "CUSTODY: UNKNOWN"
[ -n "$TRACKED" ] && echo "  reason: relevant tracked files differ from HEAD"
[ "$CWD" != "$(pwd -P)" ] && echo "  reason: server cwd ${CWD:-UNKNOWN} is not this checkout"
exit 1
