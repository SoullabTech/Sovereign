#!/usr/bin/env python3
"""JARVIS local continuity index.

Imports Claude Code project memory and conversation text into a local SQLite FTS
store. Source material remains authoritative; this index is a rebuildable
projection and therefore carries no authority of its own.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sqlite3
import time
from pathlib import Path

DEFAULT_PROJECT = Path.home() / ".claude/projects/-Users-soullab-MAIA-SOVEREIGN"
DEFAULT_DB = Path.home() / ".jarvis/continuity/continuity.sqlite3"
SENSITIVITY = "LOCAL_ONLY"


def digest_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def digest_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for block in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def source_id(path: Path) -> str:
    return digest_bytes(str(path.resolve()).encode())[:32]


def connect(db: Path) -> sqlite3.Connection:
    db.parent.mkdir(parents=True, exist_ok=True)
    cx = sqlite3.connect(db)
    cx.row_factory = sqlite3.Row
    cx.execute("PRAGMA journal_mode=WAL")
    cx.execute("PRAGMA synchronous=NORMAL")
    cx.executescript("""
      CREATE TABLE IF NOT EXISTS sources (
        source_id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        path TEXT NOT NULL UNIQUE,
        sha256 TEXT NOT NULL,
        bytes INTEGER NOT NULL,
        session_id TEXT,
        title TEXT,
        first_ts TEXT,
        last_ts TEXT,
        sensitivity TEXT NOT NULL,
        external_eligible INTEGER NOT NULL DEFAULT 0,
        imported_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS chunks (
        chunk_id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        line_no INTEGER,
        ordinal INTEGER NOT NULL,
        role TEXT,
        timestamp TEXT,
        text TEXT NOT NULL,
        text_sha256 TEXT NOT NULL,
        sensitivity TEXT NOT NULL,
        FOREIGN KEY(source_id) REFERENCES sources(source_id)
      );
    """)
    cx.execute("""CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts
                  USING fts5(chunk_id UNINDEXED, source_id UNINDEXED, text,
                  tokenize='unicode61')""")
    return cx


def extract_message_text(obj: dict) -> tuple[str | None, str | None]:
    if obj.get("type") not in {"user", "assistant"}:
        return None, None
    msg = obj.get("message")
    if not isinstance(msg, dict):
        return None, None
    role = msg.get("role") or obj.get("type")
    content = msg.get("content")
    if isinstance(content, str):
        return role, content.strip()
    if not isinstance(content, list):
        return role, None
    parts = []
    for item in content:
        if isinstance(item, dict) and item.get("type") == "text":
            text = item.get("text")
            if isinstance(text, str) and text.strip():
                parts.append(text.strip())
    return role, "\n\n".join(parts).strip() or None


def split_text(text: str, limit: int = 7000):
    text = text.strip()
    if not text:
        return []
    if len(text) <= limit:
        return [text]
    paras = re.split(r"\n\s*\n", text)
    out, buf = [], ""
    for para in paras:
        para = para.strip()
        if not para:
            continue
        if buf and len(buf) + len(para) + 2 > limit:
            out.append(buf)
            buf = ""
        if len(para) > limit:
            if buf:
                out.append(buf)
                buf = ""
            out.extend(para[i:i + limit] for i in range(0, len(para), limit))
        else:
            buf = para if not buf else buf + "\n\n" + para
    if buf:
        out.append(buf)
    return out


def replace_source(cx, path: Path, kind: str, sha: str, chunks: list[dict],
                   session_id=None, title=None, first_ts=None, last_ts=None):
    sid = source_id(path)
    prior = cx.execute("SELECT sha256 FROM sources WHERE source_id=?", (sid,)).fetchone()
    if prior and prior["sha256"] == sha:
        return False, 0
    cx.execute("DELETE FROM chunks_fts WHERE source_id=?", (sid,))
    cx.execute("DELETE FROM chunks WHERE source_id=?", (sid,))
    cx.execute("DELETE FROM sources WHERE source_id=?", (sid,))
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    cx.execute("""INSERT INTO sources
      (source_id,kind,path,sha256,bytes,session_id,title,first_ts,last_ts,
       sensitivity,external_eligible,imported_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,0,?)""",
      (sid, kind, str(path), sha, path.stat().st_size, session_id, title,
       first_ts, last_ts, SENSITIVITY, now))
    for ordinal, item in enumerate(chunks):
        txt = item["text"]
        cid = digest_bytes(f"{sid}:{ordinal}:{item.get('line_no')}:{txt}".encode())
        cx.execute("""INSERT INTO chunks
          (chunk_id,source_id,line_no,ordinal,role,timestamp,text,text_sha256,sensitivity)
          VALUES (?,?,?,?,?,?,?,?,?)""",
          (cid, sid, item.get("line_no"), ordinal, item.get("role"),
           item.get("timestamp"), txt, digest_bytes(txt.encode()), SENSITIVITY))
        cx.execute("INSERT INTO chunks_fts(chunk_id,source_id,text) VALUES (?,?,?)",
                   (cid, sid, txt))
    return True, len(chunks)


def import_memory(cx, path: Path):
    data = path.read_bytes()
    text = data.decode("utf-8", errors="replace")
    chunks = [{"line_no": 1, "role": "project_memory", "timestamp": None, "text": t}
              for t in split_text(text)]
    return replace_source(cx, path, "claude_project_memory",
                          digest_bytes(data), chunks, title=path.stem)


def import_session(cx, path: Path):
    sha = digest_file(path)
    sid = source_id(path)
    prior = cx.execute("SELECT sha256 FROM sources WHERE source_id=?", (sid,)).fetchone()
    if prior and prior["sha256"] == sha:
        return False, 0
    chunks, session_id, title = [], None, None
    first_ts = last_ts = None
    with path.open("r", encoding="utf-8", errors="replace") as fh:
        for line_no, raw in enumerate(fh, 1):
            try:
                obj = json.loads(raw)
            except json.JSONDecodeError:
                continue
            session_id = session_id or obj.get("sessionId")
            if obj.get("type") == "custom-title" and isinstance(obj.get("customTitle"), str):
                title = obj["customTitle"].strip() or title
            ts = obj.get("timestamp")
            if ts:
                first_ts = first_ts or ts
                last_ts = ts
            role, text = extract_message_text(obj)
            if not text:
                continue
            for part in split_text(text):
                chunks.append({"line_no": line_no, "role": role,
                               "timestamp": ts, "text": part})
    return replace_source(cx, path, "claude_session", sha, chunks,
                          session_id=session_id or path.stem, title=title,
                          first_ts=first_ts, last_ts=last_ts)


def do_import(args):
    root = Path(args.project).expanduser()
    db = Path(args.db).expanduser()
    cx = connect(db)
    changed = skipped = chunks = 0
    memories = sorted((root / "memory").glob("*.md")) if (root / "memory").exists() else []
    sessions = sorted(root.glob("*.jsonl"))
    targets = [(p, "memory") for p in memories]
    if not args.memories_only:
        targets += [(p, "session") for p in sessions]
    for idx, (path, kind) in enumerate(targets, 1):
        did_change, n = import_memory(cx, path) if kind == "memory" else import_session(cx, path)
        changed += int(did_change)
        skipped += int(not did_change)
        chunks += n
        if idx % 25 == 0:
            cx.commit()
    cx.commit()
    print(json.dumps({"db": str(db), "sources_seen": len(targets),
                      "sources_changed": changed, "sources_unchanged": skipped,
                      "chunks_written": chunks, "sensitivity": SENSITIVITY,
                      "external_eligible": 0}, indent=2))


def fts_query(text: str) -> str:
    # Match the FTS unicode tokenizer rather than preserving punctuation.
    # Programme names such as TURN-03 must become TURN AND 03, otherwise the
    # query asks for a token the index never created.
    terms = re.findall(r"\w+", text, flags=re.UNICODE)
    return " AND ".join(f'"{t.replace(chr(34), chr(34)*2)}"' for t in terms if t) or '""'


def do_search(args):
    cx = connect(Path(args.db).expanduser())
    rows = cx.execute("""SELECT c.chunk_id,c.role,c.timestamp,c.line_no,c.text,
         s.path,s.kind,s.session_id,s.title,s.sensitivity,s.external_eligible,
         bm25(chunks_fts) AS rank
       FROM chunks_fts
       JOIN chunks c ON c.chunk_id=chunks_fts.chunk_id
       JOIN sources s ON s.source_id=c.source_id
       WHERE chunks_fts MATCH ?
       ORDER BY rank LIMIT ?""", (fts_query(args.query), args.limit)).fetchall()
    out = []
    for r in rows:
        text = r["text"]
        if len(text) > args.max_chars:
            text = text[:args.max_chars] + "…"
        out.append({k: r[k] for k in ("kind","path","session_id","title","role",
                                      "timestamp","line_no","sensitivity","external_eligible")})
        out[-1]["text"] = text
        out[-1]["rank"] = r["rank"]
    print(json.dumps({"query": args.query, "count": len(out), "results": out}, indent=2))


def do_status(args):
    cx = connect(Path(args.db).expanduser())
    sources = cx.execute("""SELECT kind,sensitivity,external_eligible,COUNT(*) n,
                         SUM(bytes) bytes FROM sources
                         GROUP BY kind,sensitivity,external_eligible""").fetchall()
    chunks = cx.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
    print(json.dumps({"db": str(Path(args.db).expanduser()), "sources": [dict(r) for r in sources],
                      "chunks": chunks}, indent=2))


def do_bundle(args):
    cx = connect(Path(args.db).expanduser())
    rows = cx.execute("""SELECT c.role,c.timestamp,c.line_no,c.text,
         s.path,s.kind,s.session_id,s.title,s.sensitivity,s.external_eligible,
         bm25(chunks_fts) AS rank
       FROM chunks_fts
       JOIN chunks c ON c.chunk_id=chunks_fts.chunk_id
       JOIN sources s ON s.source_id=c.source_id
       WHERE chunks_fts MATCH ?
       ORDER BY rank LIMIT ?""", (fts_query(args.query), args.limit)).fetchall()
    if args.audience == "external" and any(not r["external_eligible"] for r in rows):
        raise SystemExit("REFUSED: retrieved continuity contains material not explicitly EXTERNAL_SAFE")
    budget = args.max_chars
    bundle = []
    for r in rows:
        header = f"[{r['kind']} | {r['path']}:{r['line_no'] or 1} | {r['timestamp'] or 'undated'}]"
        item = header + "\n" + r["text"].strip()
        if len(item) > budget:
            item = item[:budget]
        if not item or budget <= 0:
            break
        bundle.append(item)
        budget -= len(item)
    print("\n\n---\n\n".join(bundle))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=str(DEFAULT_DB))
    sub = ap.add_subparsers(dest="cmd", required=True)

    imp = sub.add_parser("import-claude")
    imp.add_argument("--project", default=str(DEFAULT_PROJECT))
    imp.add_argument("--memories-only", action="store_true")
    imp.set_defaults(fn=do_import)

    sea = sub.add_parser("search")
    sea.add_argument("query")
    sea.add_argument("--limit", type=int, default=8)
    sea.add_argument("--max-chars", type=int, default=1200)
    sea.set_defaults(fn=do_search)

    bun = sub.add_parser("bundle")
    bun.add_argument("query")
    bun.add_argument("--limit", type=int, default=8)
    bun.add_argument("--max-chars", type=int, default=12000)
    bun.add_argument("--audience", choices=("local", "external"), default="local")
    bun.set_defaults(fn=do_bundle)

    sta = sub.add_parser("status")
    sta.set_defaults(fn=do_status)

    args = ap.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
