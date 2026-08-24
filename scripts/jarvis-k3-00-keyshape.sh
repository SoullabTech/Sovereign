#!/usr/bin/env bash
# JARVIS-K3-00 — key SHAPE diagnostic. Reveals no key material.
# Reports length, whitespace damage, and charset only. Run after exporting the key.
set -uo pipefail
K="${TOKENROUTER_API_KEY:-}"
[ -z "$K" ] && { echo "ABSENT — export TOKENROUTER_API_KEY first"; exit 1; }
python3 - <<'PY'
import os,re
k=os.environ["TOKENROUTER_API_KEY"]
print("length                :", len(k))
print("leading whitespace    :", k[:1].isspace() if k else None)
print("trailing whitespace   :", k[-1:].isspace() if k else None)
print("contains newline/tab  :", any(c in k for c in "\n\r\t"))
print("contains space        :", " " in k.strip())
print("all printable ASCII   :", all(32<=ord(c)<127 for c in k))
print("charset               :", "".join(sorted({
    'a-z' if c.islower() else 'A-Z' if c.isupper() else '0-9' if c.isdigit() else repr(c)
    for c in k})))
for p in ("sk-","tr-","tk-","key-","tokenrouter","Bearer"):
    if k.startswith(p): print("starts with marker    :", p)
print("looks truncated (<32) :", len(k)<32)
PY
echo
echo "Compare 'length' against the key shown in the TokenRouter dashboard."
echo "If they differ, the paste was partial — re-copy with the dashboard copy button."
