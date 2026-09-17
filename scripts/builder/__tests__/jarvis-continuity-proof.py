#!/usr/bin/env python3
import importlib.util
import json
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MOD = ROOT / "scripts/builder/jarvis-continuity.py"
spec = importlib.util.spec_from_file_location("continuity", MOD)
C = importlib.util.module_from_spec(spec)
spec.loader.exec_module(C)


def check(name, cond):
    if not cond:
        raise AssertionError(name)
    print("PASS", name)


with tempfile.TemporaryDirectory(prefix="jarvis-continuity-proof-") as td:
    home = Path(td)
    project = home / "claude-project"
    memory = project / "memory"
    memory.mkdir(parents=True)
    db = home / "continuity.sqlite3"

    (memory / "project_rule.md").write_text(
        "# Founder ruling\n\nTURN-03 begins only after TURN-02 closes.\n"
    )

    session = project / "session-1.jsonl"
    rows = [
        {"type":"custom-title","sessionId":"session-1","customTitle":"Turn work"},
        {"type":"user","sessionId":"session-1","timestamp":"2026-09-16T12:00:00Z",
         "message":{"role":"user","content":"continue TURN-03 acoustic projection"}},
        {"type":"assistant","sessionId":"session-1","timestamp":"2026-09-16T12:00:05Z",
         "message":{"role":"assistant","content":[
             {"type":"text","text":"TURN-03 is open at charter only."},
             {"type":"tool_use","name":"Read","input":{"path":"secret"}}
         ]}},
        {"type":"tool_result","sessionId":"session-1","content":"must not index"},
    ]
    session.write_text("\n".join(json.dumps(x) for x in rows) + "\n")

    cx = C.connect(db)
    changed, n = C.import_memory(cx, memory / "project_rule.md")
    check("curated memory imported", changed and n == 1)
    changed, n = C.import_session(cx, session)
    check("session user+assistant text imported", changed and n == 2)
    cx.commit()

    sources = cx.execute(
        "SELECT sensitivity,external_eligible,COUNT(*) n FROM sources "
        "GROUP BY sensitivity,external_eligible"
    ).fetchall()
    check("all sources LOCAL_ONLY", len(sources) == 1 and
          sources[0]["sensitivity"] == "LOCAL_ONLY" and
          sources[0]["external_eligible"] == 0)

    chunks = cx.execute(
        "SELECT sensitivity,COUNT(*) n FROM chunks GROUP BY sensitivity"
    ).fetchall()
    check("all chunks LOCAL_ONLY", len(chunks) == 1 and
          chunks[0]["sensitivity"] == "LOCAL_ONLY")

    tool_noise = cx.execute(
        "SELECT COUNT(*) FROM chunks WHERE text LIKE '%must not index%' "
        "OR text LIKE '%secret%'"
    ).fetchone()[0]
    check("tool noise excluded", tool_noise == 0)

    hit = cx.execute(
        """SELECT c.line_no,c.role,s.path
           FROM chunks_fts
           JOIN chunks c ON c.chunk_id=chunks_fts.chunk_id
           JOIN sources s ON s.source_id=c.source_id
           WHERE chunks_fts MATCH 'TURN' LIMIT 1"""
    ).fetchone()
    check("search preserves source provenance",
          hit is not None and hit["line_no"] is not None and hit["path"])

    changed, n = C.import_session(cx, session)
    check("unchanged source is incremental no-op", not changed and n == 0)

    local_only = cx.execute(
        "SELECT COUNT(*) FROM sources WHERE external_eligible != 0 "
        "OR sensitivity != 'LOCAL_ONLY'"
    ).fetchone()[0]
    check("no imported source is externally eligible", local_only == 0)
    print("PASS continuity proof complete")
