#!/usr/bin/env bash
# A1-LS1R1 · extraction-attribution audit (separate evidentiary instrument).
#
# Proves each driver-extracted statement log IS the intended slice of the raw
# PostgreSQL log — identity, not similarity of size:
#   raw log → exact marker positions → canonical sed slice [begin … end]
#          → SHA-256 equality with the driver-produced extracted log.
# Both marker lines are retained (the drivers' awk is inclusive), so the
# expected physical-line count is end_line − begin_line + 1.
#
# Runs BEFORE teardown: the raw log and the extracted logs hold statement text
# and are deliberately destroyed at teardown. The raw log's SHA-256 recorded
# here is custody identity, not preserved content.
#
# A failure means: configuration attribution unproven; that configuration's
# counts unattributable; its migration-sufficiency evidence obligation not
# satisfied. It does not reclassify any observed runtime result.
#
# Usage: ls1r1-extraction-audit.sh <raw_log> <out_file> <begin_marker>:<end_marker>:<extracted_log> ...
set -euo pipefail
RAW="$1"; OUT="$2"; shift 2
{
  echo "audit_instrument=ls1r1-extraction-audit.sh"
  echo "audited_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "raw_log_path=$RAW"
  echo "raw_log_sha256=$(sha256sum "$RAW" | cut -d' ' -f1)"
  echo "raw_log_bytes=$(stat -c %s "$RAW")"
  echo "raw_log_lines=$(wc -l < "$RAW")"
  fails=0
  for spec in "$@"; do
    IFS=':' read -r BM EM EX <<< "$spec"
    echo
    echo "begin_marker=$BM"
    echo "end_marker=$EM"
    echo "extracted_path=$EX"
    nb=$(grep -cF -- "$BM" "$RAW" || true); ne=$(grep -cF -- "$EM" "$RAW" || true)
    echo "begin_marker_occurrences=$nb"
    echo "end_marker_occurrences=$ne"
    v=PASS; why=""
    if [ "$nb" != 1 ] || [ "$ne" != 1 ]; then v=FAIL; why="marker not unique"; fi
    b=$(grep -nF -- "$BM" "$RAW" | head -1 | cut -d: -f1 || true)
    e=$(grep -nF -- "$EM" "$RAW" | head -1 | cut -d: -f1 || true)
    echo "begin_line=${b:-none}"
    echo "end_line=${e:-none}"
    if [ "$v" = PASS ] && [ "$b" -ge "$e" ]; then v=FAIL; why="begin not before end"; fi
    if [ "$v" = PASS ]; then
      inner=$(sed -n "$((b+1)),$((e-1))p" "$RAW" | grep -cE "_RUN_(BEGIN|END)_" || true)
      echo "foreign_markers_inside_slice=$inner"
      [ "$inner" = 0 ] || { v=FAIL; why="another run marker inside slice"; }
      expected=$((e - b + 1))
      ref_sha=$(sed -n "${b},${e}p" "$RAW" | sha256sum | cut -d' ' -f1)
      ref_bytes=$(sed -n "${b},${e}p" "$RAW" | wc -c)
      ref_lines=$(sed -n "${b},${e}p" "$RAW" | wc -l)
      if [ -f "$EX" ]; then
        ex_sha=$(sha256sum "$EX" | cut -d' ' -f1); ex_bytes=$(stat -c %s "$EX"); ex_lines=$(wc -l < "$EX")
      else
        ex_sha=missing; ex_bytes=missing; ex_lines=missing
      fi
      echo "expected_lines=$expected"
      echo "reference_lines=$ref_lines"
      echo "extracted_lines=$ex_lines"
      echo "reference_bytes=$ref_bytes"
      echo "extracted_bytes=$ex_bytes"
      echo "reference_sha256=$ref_sha"
      echo "extracted_sha256=$ex_sha"
      if [ "$v" = PASS ]; then
        [ "$ref_sha" = "$ex_sha" ] || { v=FAIL; why="extracted log is not the reference slice"; }
        [ "$ref_lines" = "$expected" ] || { v=FAIL; why="reference slice length differs from end-begin+1"; }
      fi
    fi
    echo "verdict=$v${why:+ ($why)}"
    [ "$v" = PASS ] || fails=$((fails+1))
  done
  echo
  echo "configurations_audited=$#"
  echo "configurations_failed=$fails"
} > "$OUT"
tail -2 "$OUT"
