#!/usr/bin/env bash
# JARVIS-KP-01 / I5-P0R2R2 — falsifiers for the DRY-RUN BOUNDARY.
#
# §VI authorizes Phases 1–4 and forbids crossing into configuration mutation;
# §VII lists what the act may not do. Those clauses are only as strong as the
# script's no-mutation boundary, and that boundary had never been exercised
# END TO END — every prior run stopped in Phase 1 before reaching it.
#
# This drives a complete dry run against stubbed docker/psql and asserts that
# nothing crossed. READ ONLY with respect to the project; all fixtures live in a
# throwaway directory and are removed.
set -uo pipefail

REPO="$(pwd)"
PASS=0; FAIL=0; UNEST=0
ok() { printf 'PASS  %-4s %s\n        %s\n' "$1" "$2" "${3:-}"; PASS=$((PASS+1)); }
no() { printf 'FAIL  %-4s %s\n        %s\n' "$1" "$2" "${3:-}"; FAIL=$((FAIL+1)); }
# ⭐ Three-valued, for the same reason ancestry is: a proposition the run never
# reached because a LEGITIMATE refusal fired earlier is NOT_ESTABLISHED, ⛔ never
# a failure. Scoring it as a failure would pressure the next author to weaken the
# refusal in order to turn the matrix green.
un() { printf 'UNEST %-4s %s\n        %s\n' "$1" "$2" "${3:-}"; UNEST=$((UNEST+1)); }
BLOCKED=0

W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT
mkdir -p "$W/bin"
LOG="$W/calls.log"
: > "$LOG"

# A founder id that must NEVER reach stdout.
FIXTURE_FOUNDER_ID="ffffffff-1111-2222-3333-444444444444"
# A DIFFERENT id currently configured, so B1 (match=NO) is exercised.
FIXTURE_CURRENT_ID="aaaaaaaa-9999-8888-7777-666666666666"

cat > "$W/bin/docker" <<STUB
#!/usr/bin/env bash
printf '%s\n' "docker \$*" >> "$LOG"
case "\$1 \$2" in
  "inspect "*) echo "sha256:0ced1e8065dae613f2f7ea4e74f15b50461333f54964dd009c33c672271f3fc2"; exit 0 ;;
esac
if [ "\$1" = "compose" ]; then echo "COMPOSE INVOKED" >&2; exit 0; fi
if [ "\$1" = "exec" ]; then
  shift
  if [ "\$1" = "-i" ]; then
    shift; shift   # drop -i and the container name
    [ "\$1" = "node" ] && shift   # ...and the interpreter the script names
    # Run the real streamed witness against the repo, proving the plumbing.
    exec node "\$@" --root "$REPO"
  fi
  CONTAINER="\$1"; shift
  if [ "\$1" = "printenv" ]; then
    case "\$2" in
      # FIXTURE ONLY. The stub claims production runs canonical's tip so the
      # binding is satisfiable and Phases 1-5 become reachable. This matrix tests
      # the NO-MUTATION BOUNDARY, not the binding — the binding has its own
      # falsifiers and still executes for real against real git objects here.
      GIT_COMMIT) echo "4ef9a1988f44394375526a78ca4db3694f5b51a5" ;;
      MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS) echo "$FIXTURE_CURRENT_ID" ;;
      *) : ;;   # every flag and the model set are unset -> OFF / empty
    esac
    exit 0
  fi
  if [ "\$1" = "psql" ]; then
    SQL="\${@: -1}"
    case "\$SQL" in
      *maia_relational_field_shadow_runs*) echo 3 ;;
      *maia_epistemic_join_integration_shadow_runs*) echo 0 ;;
      *"count(*) FROM members"*) echo 1 ;;
      *"id::text FROM members"*) echo "$FIXTURE_FOUNDER_ID" ;;
      *) echo "" ;;
    esac
    exit 0
  fi
fi
exit 0
STUB
chmod +x "$W/bin/docker"

# Instrument set + an issued fixture record + a sentinel env file.
cp scripts/witness/i5-p0r2-remediation.sh scripts/witness/seam-identity.mjs \
   scripts/witness/seam-identity-container.mjs "$W/"
chmod +x "$W/i5-p0r2-remediation.sh"
printf 'STATUS: ISSUED\nfixture record\n' > "$W/issued.md"
ENVF="$W/env.production"
printf 'EXISTING_KEY=keep\nMAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS=%s\n' "$FIXTURE_CURRENT_ID" > "$ENVF"
BEFORE="$(sha256sum "$ENVF" | cut -d' ' -f1)"

OUT="$(cd "$REPO" && PATH="$W/bin:$PATH" I5_ENV_FILE="$ENVF" \
  timeout 120 "$W/i5-p0r2-remediation.sh" --authorization "$W/issued.md" 2>&1)"
RC=$?
AFTER="$(sha256sum "$ENVF" | cut -d' ' -f1)"

printf '%s\n' "$OUT" > "$W/out.txt"
# Did a lawful binding refusal stop the run before the boundary was reachable?
if printf '%s' "$OUT" | grep -qE 'REFUSED (SEAM_MOVED_AT_(CANONICAL|PRODUCTION)|ANCESTRY_UNVERIFIABLE|NOT_ANCESTOR)'; then
  BLOCKED=1
  printf 'NOTE  the run was stopped by a LAWFUL binding refusal:\n      %s\n\n' \
    "$(printf '%s' "$OUT" | grep -E '^REFUSED ' | head -1)"
fi
gate() { [ "$BLOCKED" = "1" ] && { un "$1" "$2" "not reached: binding refused upstream"; return 1; }; return 0; }

# ── D1 · the dry run completes and stops at its own boundary ────────────────
if gate D1 "dry run reaches its no-mutation boundary and exits 0"; then
if [ "$RC" = "0" ] && printf '%s' "$OUT" | grep -q 'DRY RUN — no file written'; then
  ok D1 "dry run reaches its no-mutation boundary and exits 0" "exit=$RC"
else
  no D1 "dry run reaches its no-mutation boundary and exits 0" "exit=$RC; tail: $(printf '%s' "$OUT" | tail -2 | tr '\n' ' ')"
fi
fi

# ── D2 · Phases 1–4 all ran ─────────────────────────────────────────────────
if gate D2 "Phases 1-4 executed and Phase 5 was entered in dry-run form"; then
MISSING=""
for p in "PHASE 1" "PHASE 2" "PHASE 3" "PHASE 4" "PHASE 5"; do
  printf '%s' "$OUT" | grep -q "$p" || MISSING="$MISSING $p"
done
[ -z "$MISSING" ] && ok D2 "Phases 1-4 executed and Phase 5 was entered in dry-run form" "all phase headers present" \
  || no D2 "Phases 1-4 executed" "missing:$MISSING"
fi

# ── D3 · the configuration file is BYTE-IDENTICAL ───────────────────────────
[ "$BEFORE" = "$AFTER" ] && ok D3 "the configuration file was not modified" "sha256 unchanged: ${BEFORE:0:16}…" \
  || no D3 "the configuration file was not modified" "$BEFORE -> $AFTER"

# ── D4 · no backup was created (backups belong to the mutation path) ────────
BAK="$(find "$W" -name '*.i5-p0r2.*.bak' | wc -l | tr -d ' ')"
[ "$BAK" = "0" ] && ok D4 "no backup file was created" "backups found: 0" \
  || no D4 "no backup file was created" "found $BAK"

# ── D5 · no compose invocation, i.e. no recreation ──────────────────────────
C="$(grep -c 'docker compose' "$LOG" || true)"
[ "$C" = "0" ] && ok D5 "no compose invocation (no recreation)" "compose calls: 0" \
  || no D5 "no compose invocation" "$C calls"

# ── D6 · no write SQL reached the database stub ─────────────────────────────
WSQL="$(grep -icE '\b(insert|update|delete|alter|truncate|drop|create)\b' "$LOG" || true)"
[ "$WSQL" = "0" ] && ok D6 "no write SQL was issued" "read-only: only count/select observed" \
  || no D6 "no write SQL was issued" "$WSQL write statements"

# ── D7 ⭐ the raw Founder identifier never reaches stdout ────────────────────
if gate D7 "the raw Founder identifier never reaches output"; then
FP="$(grep -o 'founder_fingerprint=[0-9a-f]*' "$W/out.txt" | head -1)"
if grep -q "$FIXTURE_FOUNDER_ID" "$W/out.txt"; then
  no D7 "the raw Founder identifier never reaches output" "LEAKED"
elif [ -z "$FP" ]; then
  # ⭐ Absence of the identifier is only evidence if the phase that HANDLES it ran.
  # Without this, a run that dies in Phase 1 scores D7 green while proving nothing.
  un D7 "the raw Founder identifier never reaches output" "VACUOUS: Phase 4 never emitted a fingerprint, so non-appearance proves nothing"
else
  ok D7 "the raw Founder identifier never reaches output" "fingerprint only: $FP"
fi
fi

# ── D8 · B1 is correctly detected rather than silently accepted ─────────────
if gate D8 "a non-Founder allowlist is reported as B1, not accepted"; then
if printf '%s' "$OUT" | grep -q 'match=NO (B1 present'; then
  ok D8 "a non-Founder allowlist is reported as B1, not accepted" "match=NO reported"
else
  no D8 "a non-Founder allowlist is reported as B1" "$(printf '%s' "$OUT" | grep -i 'match=' | tr '\n' ' ')"
fi
fi

# ── D9 ⭐ the streamed container witness actually ran and agreed ─────────────
if gate D9 "the streamed container witness executed and matched"; then
if printf '%s' "$OUT" | grep -q 'SEAM INTACT IN RUNNING IMAGE'; then
  ok D9 "the streamed container witness executed and matched" "docker exec -i + stdin plumbing works"
else
  no D9 "the streamed container witness executed and matched" "$(printf '%s' "$OUT" | grep -iA1 'container-side' | tr '\n' ' ')"
fi
fi

printf '\n%s passed · %s failed · %s not established (blocked by a lawful refusal)\n' \
  "$PASS" "$FAIL" "$UNEST"
# Exit 0 only when nothing FAILED. Unestablished propositions are reported, not
# converted into failure, and not silently counted as success either.
[ "$FAIL" = "0" ]
