#!/usr/bin/env bash
# WRITERS-STUDIO-OBSERVATION-IDENTITY-01 / I1B — §II–§IV falsifier harness.
# Disposable shadow. shadow_a = OLD validator · shadow_b = NEW validator.
# The ONLY difference between the two databases is the validator function.
SP=/tmp/wsoi-shadow
FP=$(printf 'a%.0s' {1..64})
mk(){ # mk <name> <observations-json>
  cat > "$SP/case_$1.sql" <<SQL
INSERT INTO developmental_readings
 (manuscript_id, member_id, draft_id, revision_number, commissioned_lens,
  scope, read_state, coverage, input_fingerprint, outcome, observations,
  reader_provenance, classifier_provenance)
VALUES ((SELECT id FROM member_manuscripts LIMIT 1), gen_random_uuid(), gen_random_uuid(), 1,
 'structure', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 'fp', 'reading',
 '$2'::jsonb, '{}'::jsonb, '{}'::jsonb);
SQL
  chown postgres:postgres "$SP/case_$1.sql"
}
run(){ # run <db> <name> -> ACCEPT | REFUSE:<reason>
  local o; o="$(su postgres -c "psql -h $SP -p 5433 -U postgres -d $1 -q -f $SP/case_$2.sql" 2>&1)"
  if printf '%s' "$o" | grep -qi 'ERROR'; then
    printf 'REFUSE:%s' "$(printf '%s' "$o" | grep -oiE 'ERROR:.*' | head -1 | cut -c8-70)"
  else printf 'ACCEPT:'; fi
}
CORE='"key":"o1","lens":"structure","observation":"t","evidenceRefs":["e1"],"doesNotEstablish":["x"],"structureDependency":{"kind":"independent"}'
IDG="\"observationId\":\"dobs_abc\",\"admissionIndex\":0,\"basisFingerprint\":\"$FP\""
mk legacy   "[{$CORE}]"
mk canon    "[{$CORE,$IDG,\"position\":{\"sectionPosition\":1,\"codePointStart\":0}}]"
mk nullpos  "[{$CORE,$IDG,\"position\":null}]"
mk partial  "[{$CORE,\"observationId\":\"dobs_abc\",\"admissionIndex\":0}]"
mk unknown  "[{$CORE,\"smuggled\":1}]"
mk badfp    "[{$CORE,\"observationId\":\"dobs_abc\",\"admissionIndex\":0,\"basisFingerprint\":\"nothex\",\"position\":null}]"
mk badidx   "[{$CORE,\"observationId\":\"dobs_abc\",\"admissionIndex\":7,\"basisFingerprint\":\"$FP\",\"position\":null}]"

FAIL=0
row(){ # row <id> <case> <expect_old> <expect_new> <desc>
  local ra rb a b s=PASS
  if [ "$3" = "-" ]; then a="n/a"; else ra="$(run shadow_a "$2")"; a="${ra%%:*}"; if [ "$a" != "$3" ]; then s=FAIL; FAIL=$((FAIL+1)); fi; fi
  if [ "$4" = "-" ]; then b="n/a"; else rb="$(run shadow_b "$2")"; b="${rb%%:*}"; if [ "$b" != "$4" ]; then s=FAIL; FAIL=$((FAIL+1)); fi; fi
  printf '%-4s %-6s OLD=%-7s NEW=%-7s %s\n' "$s" "$1" "$a" "$b" "$5"
  case "$rb" in REFUSE:*) printf '                                     ↳ %s\n' "${rb#REFUSE:}";; esac
}
echo "══ §II PRIMARY FALSIFIER · the old reader against the new validation ══"
row II-A legacy ACCEPT -      "legacy old-reader write vs OLD validator (baseline: fixture is lawful today)"
row II-B legacy -      ACCEPT "the SAME write vs NEW validator — required ACCEPT"
echo
echo "══ §III TARGET READER ══"
row III  canon  -      ACCEPT "canonical identity-bearing write vs NEW validator"
echo
echo "══ §IV VALIDATOR INVARIANTS ══"
row F1   partial -     REFUSE "partial identity group (2 of 4) — identity is all-or-none"
row F2   unknown REFUSE REFUSE "undeclared key — shape must stay closed, before AND after"
row F3   nullpos -     ACCEPT "complete identity, position=null (structural-only, no invented position)"
row F5a  badfp  -      REFUSE "malformed basisFingerprint"
row F5b  badidx -      REFUSE "admissionIndex not equal to ordinal-1"
echo
[ "$FAIL" = 0 ] && echo "ALL EXPECTATIONS MET" || echo "$FAIL EXPECTATION(S) VIOLATED"
exit $([ "$FAIL" = 0 ] && echo 0 || echo 1)
