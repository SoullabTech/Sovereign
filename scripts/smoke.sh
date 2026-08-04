#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"

echo "✅ Building…"
npm run build

echo "✅ Starting…"
PORT="$PORT" npm run start >/tmp/maia-start.log 2>&1 &
PID=$!

cleanup() { kill $PID 2>/dev/null || true; }
trap cleanup EXIT

echo "✅ Waiting for server…"
for i in {1..30}; do
  if curl -fsS "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
    echo "✅ Health OK"

    # Sovereign endpoint reachability.
    #
    # This is an UNAUTHENTICATED request, so 401 is the correct answer, not a failure:
    # middleware.ts returns 401 JSON for any unauthenticated /api/* path. The assertion
    # is therefore "the route is mounted AND the auth gate is armed" — an unauthenticated
    # 200 would be the alarming outcome, and 000/5xx means the app booted broken.
    #
    # (Until 2026-08-04 this step used `curl -fsS` and demanded 2xx, so it failed on the
    # gate working correctly. Smoke checks that the app boots and answers; whether MAIA
    # answers WELL is behavior, and belongs to the test suites.)
    STATUS=$(curl -s -o /dev/null -w '%{http_code}' -X POST "http://localhost:$PORT/api/sovereign/app/maia" \
      -H "Content-Type: application/json" \
      -d '{"message":"test","mode":"dialogue"}' || echo "000")

    case "$STATUS" in
      401|403)
        echo "✅ Sovereign endpoint mounted and gated (HTTP $STATUS)"
        exit 0
        ;;
      200)
        echo "⚠️  Sovereign endpoint answered 200 WITHOUT credentials — the auth gate is not armed"
        exit 1
        ;;
      000)
        echo "❌ Sovereign endpoint unreachable (no response)"
        exit 1
        ;;
      *)
        echo "❌ Sovereign endpoint returned unexpected HTTP $STATUS"
        exit 1
        ;;
    esac
  fi
  sleep 1
done

echo "❌ Server did not become healthy. Logs:"
tail -200 /tmp/maia-start.log || true
exit 1
