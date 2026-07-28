#!/usr/bin/env python3
"""Read-only integrity audit for the session-memory system.

Roles (see scripts/memory/README.md):
  MEMORY.md      — live index: what must be visible now
  topic files    — canonical record: what must remain knowable
  repo history   — what actually happened

This instrument REPORTS ONLY. It never modifies the memory corpus. Its only
writes are the timestamped report/findings files in --out-dir and, when
explicitly requested, the parked-lane baseline file (--write-baseline).

Severity model (ruling 2026-07-28):
  ERROR — structural defects that must not enter: broken index/sub-index links,
          duplicate permanent IDs, ambiguous wikilinks, index over hard ceiling,
          NEW or MODIFIED parked entries without a reopening observation.
  WARN  — inherited parked entries (migration backlog via baseline), closed-plain
          entries in the live index, size/complexity drift, link-convention drift.
  INFO  — leads for future triage (no-hook files, shared fact tokens).

Exit codes: 0 = no errors (warnings allowed) · 1 = structural errors · 2 = usage.

Usage:
  python3 scripts/memory/audit-memory.py                 # audit the live corpus
  python3 scripts/memory/audit-memory.py --selftest      # run against fixtures
  python3 scripts/memory/audit-memory.py --write-baseline scripts/memory/parked-baseline.json
"""
import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
from collections import defaultdict
from datetime import datetime

DEFAULT_MEMORY_DIR = (
    "/Users/soullab/.claude/projects/-Users-soullab-MAIA-SOVEREIGN/memory"
)
INDEX = "MEMORY.md"
ARCHIVE_PREFIX = "_archive"
PREFIXES = ("project_", "feedback_", "reference_", "user_")

MD_LINK = re.compile(r"\[([^\]]*)\]\(([^)#\s]+\.md)\)")
WIKILINK = re.compile(r"\[\[([^\]|#]+)\]\]")
TERMINAL = re.compile(r"\b(CLOSED|SUPERSEDED|RETIRED)\b")
OPEN_STATUS = re.compile(
    r"\b(OPEN|HELD|PAUSED|FROZEN|SEALED|BLOCKED|CAND|PROP|UNCOMMITTED|pending|"
    r"awaits?|DRAFT|STOPPED)\b", re.I)
NEXT_ACTION = re.compile(
    r"(▶️|await|gate|lift|reopen|walk|ruling|acceptance|NEXT=|starts \d|until|before)",
    re.I)
CAUTION = re.compile(r"(⚠️|⛔|never|NOT )")
PR_TOKEN = re.compile(r"#\d{3,4}\b")
SHA_TOKEN = re.compile(r"\b[0-9a-f]{9,10}\b")

ERROR_CLASSES = {
    "broken_index_links", "broken_subindex_links", "duplicate_ids",
    "ambiguous_wikilinks", "index_over_hard_ceiling",
    "parked_new", "parked_modified",
}
WARN_CLASSES = {
    "parked_inherited", "baseline_stale", "closed_plain",
    "index_over_target", "overlong_index_lines", "large_topic_files",
    "unresolved_wikilinks", "wikilink_md_suffix", "prefix_omitted_wikilinks",
    "missing_frontmatter", "missing_description",
}
INFO_CLASSES = {
    "closed_with_remainder", "no_index_hook", "shared_fact_tokens",
}


def severity(cls):
    if cls in ERROR_CLASSES:
        return "ERROR"
    if cls in WARN_CLASSES:
        return "WARN"
    return "INFO"


def norm(slug):
    return slug.strip().lower().replace("-", "_")


def frontmatter(text):
    fm = {}
    if text and text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            for line in text[3:end].splitlines():
                m = re.match(r"^\s*(name|description|type)\s*:\s*(.*)$", line)
                if m:
                    fm[m.group(1)] = m.group(2).strip().strip('"')
    return fm


def line_key(line):
    """Stable identity for a parked index line: its sorted link targets."""
    return "|".join(sorted(m.group(2) for m in MD_LINK.finditer(line)))


def line_hash(line):
    return hashlib.sha1(line.strip().encode("utf-8")).hexdigest()[:12]


def audit(memory_dir, baseline, thresholds):
    t = thresholds
    files = sorted(
        f for f in os.listdir(memory_dir)
        if f.endswith(".md") and os.path.isfile(os.path.join(memory_dir, f)))
    topic_files = [f for f in files
                   if f != INDEX and not f.startswith(ARCHIVE_PREFIX)]
    archive_files = [f for f in files if f.startswith(ARCHIVE_PREFIX)]

    content, sizes = {}, {}
    for f in files:
        p = os.path.join(memory_dir, f)
        try:
            with open(p, encoding="utf-8") as fh:
                content[f] = fh.read()
        except OSError:
            content[f] = ""
        sizes[f] = os.path.getsize(p)
    fms = {f: frontmatter(content[f]) for f in files}

    slug_map = defaultdict(set)
    for f in topic_files:
        slug_map[norm(f[:-3])].add(f)
        n = fms[f].get("name")
        if n:
            slug_map[norm(n)].add(f)

    def resolve(slug):
        s = norm(slug)
        hits = set(slug_map.get(s, set()))
        if hits:
            return hits, "exact"
        pref_hits = set()
        for p in PREFIXES:
            pref_hits |= slug_map.get(p + s, set())
        return pref_hits, "prefix"

    F = defaultdict(list)

    # ---- 1. pointers -------------------------------------------------------
    def broken_md_links(fname):
        for m in MD_LINK.finditer(content.get(fname, "")):
            target = m.group(2)
            if "/" in target or target.startswith("http"):
                continue
            if target not in content:
                yield {"file": fname, "text": m.group(1), "target": target}

    F["broken_index_links"] = list(broken_md_links(INDEX))

    hook_reachable, frontier = set(), [INDEX]
    while frontier:
        cur = frontier.pop()
        for m in MD_LINK.finditer(content.get(cur, "")):
            tgt = m.group(2)
            if tgt in content and tgt not in hook_reachable and tgt != INDEX:
                hook_reachable.add(tgt)
                frontier.append(tgt)

    for f in sorted(hook_reachable):
        F["broken_subindex_links"].extend(broken_md_links(f))

    for f in topic_files:
        for m in WIKILINK.finditer(content[f]):
            raw = m.group(1)
            if raw.strip().endswith(".md"):
                F["wikilink_md_suffix"].append({"file": f, "link": raw})
                continue
            hits, how = resolve(raw)
            if not hits:
                F["unresolved_wikilinks"].append({"file": f, "link": raw})
            elif len(hits) > 1:
                F["ambiguous_wikilinks"].append(
                    {"file": f, "link": raw, "matches": sorted(hits)})
            elif how == "prefix":
                F["prefix_omitted_wikilinks"].append(
                    {"file": f, "link": raw, "canonical": sorted(hits)[0]})

    # ---- 2. identity -------------------------------------------------------
    name_owners = defaultdict(list)
    for f in topic_files:
        n = fms[f].get("name")
        if n:
            name_owners[norm(n)].append(f)
    for n, owners in sorted(name_owners.items()):
        if len(owners) > 1:
            F["duplicate_ids"].append({"name": n, "files": owners})

    tok_files = defaultdict(set)
    for f in topic_files:
        for tok in PR_TOKEN.findall(content[f]):
            tok_files[tok].add(f)
        for tok in SHA_TOKEN.findall(content[f]):
            tok_files["sha:" + tok].add(f)
    for tok, fs in sorted(tok_files.items(), key=lambda kv: -len(kv[1])):
        thresh = 3 if tok.startswith("sha:") else 4
        if len(fs) >= thresh:
            F["shared_fact_tokens"].append(
                {"token": tok, "count": len(fs), "sample": sorted(fs)[:6]})

    # ---- 3/4/6. index-line analysis ---------------------------------------
    parked_current = {}
    for i, line in enumerate(content[INDEX].split("\n"), 1):
        plain = line.strip()
        if not plain.startswith("- "):
            continue
        if TERMINAL.search(plain):
            has_open = OPEN_STATUS.search(plain) or "▶️" in plain
            has_caution = CAUTION.search(plain)
            if has_open or has_caution:
                F["closed_with_remainder"].append(
                    {"line": i, "kind": "open-remainder" if has_open
                     else "standing-caution", "text": plain[:160]})
            else:
                F["closed_plain"].append({"line": i, "text": plain[:160]})
        elif OPEN_STATUS.search(plain) and not NEXT_ACTION.search(plain):
            parked_current[line_key(plain)] = {
                "line": i, "hash": line_hash(plain), "text": plain[:160]}
        if len(plain) > t["line_long"]:
            F["overlong_index_lines"].append(
                {"line": i, "chars": len(plain), "text": plain[:110]})

    # parked baseline reconciliation (two-phase ratification, ruling 07-28)
    base = baseline.get("entries", {})
    for key, cur in sorted(parked_current.items()):
        if key in base:
            if base[key].get("hash") == cur["hash"]:
                F["parked_inherited"].append(cur)
            else:
                F["parked_modified"].append(dict(
                    cur, note="modified without adding a reopening observation"))
        else:
            F["parked_new"].append(cur)
    for key in sorted(set(base) - set(parked_current)):
        F["baseline_stale"].append(
            {"key": key, "note": "no longer flagged — remove from baseline"})

    # ---- 5. discoverability -----------------------------------------------
    wikilink_targets = set()
    for f in files:
        for m in WIKILINK.finditer(content[f]):
            hits, _ = resolve(m.group(1))
            wikilink_targets |= hits
    archive_linked = set()
    for af in archive_files:
        for m in MD_LINK.finditer(content[af]):
            if m.group(2) in content:
                archive_linked.add(m.group(2))

    for f in topic_files:
        if f in hook_reachable:
            continue
        in_arc, in_wiki = f in archive_linked, f in wikilink_targets
        cls = ("archive+wikilink only" if in_arc and in_wiki else
               "archive-hook only" if in_arc else
               "wikilink only" if in_wiki else "ORPHANED")
        F["no_index_hook"].append({"file": f, "class": cls, "bytes": sizes[f]})

    # ---- 7. size thresholds ------------------------------------------------
    idx = sizes[INDEX]
    if idx > t["index_hard"]:
        F["index_over_hard_ceiling"].append({"bytes": idx, "ceiling": t["index_hard"]})
    elif idx > t["index_target"]:
        F["index_over_target"].append({"bytes": idx, "target": t["index_target"]})
    for f in sorted(topic_files, key=lambda f: -sizes[f]):
        if sizes[f] >= t["topic_warn"]:
            F["large_topic_files"].append(
                {"file": f, "bytes": sizes[f],
                 "level": "FLAG" if sizes[f] >= t["topic_flag"] else "warn"})

    # ---- 8. frontmatter hygiene -------------------------------------------
    for f in topic_files:
        if not fms[f]:
            F["missing_frontmatter"].append({"file": f})
        elif not fms[f].get("description"):
            F["missing_description"].append({"file": f})

    manifest = hashlib.sha256()
    for f in files:
        manifest.update(f"{f}:{sizes[f]}\n".encode())
        manifest.update(hashlib.sha256(content[f].encode()).digest())
    meta = {
        "memory_dir": memory_dir,
        "topic_files": len(topic_files),
        "archive_files": len(archive_files),
        "index_bytes": idx,
        "index_sha256": hashlib.sha256(content[INDEX].encode()).hexdigest(),
        "corpus_manifest_sha256": manifest.hexdigest(),
    }
    return F, meta, parked_current


def render_report(F, meta, thresholds, generated_at):
    kb = lambda n: f"{n/1024:.1f}KB"
    L = []
    A = L.append
    A("# Memory integrity audit — read-only report")
    A("")
    A(f"Generated: {generated_at}  ·  corpus: {meta['topic_files']} topic files, "
      f"index {kb(meta['index_bytes'])}")
    A(f"Index sha256: `{meta['index_sha256'][:16]}…`  ·  "
      f"corpus manifest: `{meta['corpus_manifest_sha256'][:16]}…`")
    A("")
    A("Compaction rule: relocate detail only after verifying its canonical home "
      "(repo > records > topic file > hook) — never delete knowledge. "
      "This audit reports; it changes nothing.")
    A("")
    sections = [
        ("broken_index_links", "Broken links in MEMORY.md",
         lambda r: f"- `{r['file']}`: [{r['text']}] → **{r['target']}** (missing)"),
        ("broken_subindex_links", "Broken links in hook-reachable files",
         lambda r: f"- `{r['file']}`: [{r['text']}] → **{r['target']}** (missing)"),
        ("duplicate_ids", "Duplicate permanent IDs (frontmatter name collisions)",
         lambda r: f"- `{r['name']}` owned by: {', '.join(r['files'])}"),
        ("ambiguous_wikilinks", "Ambiguous [[wikilinks]] (slug → >1 file)",
         lambda r: f"- `{r['file']}` → [[{r['link']}]] matches {r['matches']}"),
        ("index_over_hard_ceiling", "Index over HARD ceiling",
         lambda r: f"- MEMORY.md {kb(r['bytes'])} > ceiling {kb(r['ceiling'])}"),
        ("parked_new", "NEW parked entries without a reopening observation",
         lambda r: f"- L{r['line']}: {r['text']}"),
        ("parked_modified", "MODIFIED parked entries still without a reopening observation",
         lambda r: f"- L{r['line']}: {r['text']}"),
        ("parked_inherited", "Inherited parked entries (migration backlog — triage, then shrink baseline)",
         lambda r: f"- L{r['line']}: {r['text']}"),
        ("baseline_stale", "Baseline entries no longer flagged (regenerate baseline)",
         lambda r: f"- {r['key']} — {r['note']}"),
        ("closed_plain", "Closed-plain entries in the live index (archive candidates)",
         lambda r: f"- L{r['line']}: {r['text']}"),
        ("closed_with_remainder", "Closed entries legitimately retained (open remainder / standing caution)",
         lambda r: f"- L{r['line']} ({r['kind']}): {r['text']}"),
        ("index_over_target", "Index over compaction target",
         lambda r: f"- MEMORY.md {kb(r['bytes'])} > target {kb(r['target'])}"),
        ("overlong_index_lines", f"Index lines > {thresholds['line_long']} chars (detail belongs in topic file)",
         lambda r: f"- L{r['line']} ({r['chars']} chars): {r['text']}…"),
        ("large_topic_files", "Large topic files",
         lambda r: f"- `{r['file']}`: {kb(r['bytes'])} [{r['level']}]"),
        ("unresolved_wikilinks", "Unresolved [[wikilinks]] (write-me-later markers — distinct from broken links)",
         lambda r: f"- `{r['file']}` → [[{r['link']}]]"),
        ("wikilink_md_suffix", "Wikilinks containing .md (normalization backlog)",
         lambda r: f"- `{r['file']}` → [[{r['link']}]]"),
        ("prefix_omitted_wikilinks", "Prefix-omitted wikilinks (resolve via fallback; propose normalization, do not rewrite)",
         lambda r: f"- `{r['file']}` → [[{r['link']}]] = `{r['canonical']}`"),
        ("missing_frontmatter", "Topic files missing frontmatter",
         lambda r: f"- `{r['file']}`"),
        ("missing_description", "Topic files missing description",
         lambda r: f"- `{r['file']}`"),
        ("no_index_hook", "Topic files with no discoverable index hook (classification triage, not mass-linking)",
         lambda r: f"- `{r['file']}` — {r['class']} ({kb(r['bytes'])})"),
        ("shared_fact_tokens", "Shared fact tokens (duplicate-fact lead list)",
         lambda r: f"- **{r['token']}** in {r['count']} files, e.g. {', '.join(r['sample'])}"),
    ]
    for cls, title, fmt in sections:
        rows = F.get(cls, [])
        A(f"## [{severity(cls)}] {title}")
        A(f"_{len(rows)} finding(s)_")
        A("")
        for r in rows:
            A(fmt(r))
        A("")
    return "\n".join(L)


def summarize(F):
    errors = sum(len(F[c]) for c in F if severity(c) == "ERROR")
    warns = sum(len(F[c]) for c in F if severity(c) == "WARN")
    infos = sum(len(F[c]) for c in F if severity(c) == "INFO")
    return errors, warns, infos


def run_selftest(script_dir):
    fixtures = os.path.join(script_dir, "fixtures", "memory")
    thresholds = dict(index_target=17_100, index_hard=24_400,
                      topic_warn=10_000, topic_flag=16_000, line_long=300)

    # pass 1: empty baseline → both parked entries are NEW
    F1, _meta, parked = audit(fixtures, {"entries": {}}, thresholds)
    # pass 2: baseline holds only the inherited entry
    inherited_key = next(k for k, v in parked.items()
                         if "topic_parked_old.md" in k)
    baseline = {"entries": {inherited_key: {"hash": parked[inherited_key]["hash"]}}}
    F2, _meta2, _ = audit(fixtures, baseline, thresholds)

    checks = [
        ("broken index link", len(F1["broken_index_links"]) == 1),
        ("broken sub-index link", len(F1["broken_subindex_links"]) == 1),
        ("duplicate id", len(F1["duplicate_ids"]) == 1),
        ("unresolved wikilink", len(F1["unresolved_wikilinks"]) == 1),
        ("prefix-omitted wikilink", len(F1["prefix_omitted_wikilinks"]) == 1),
        ("wikilink .md suffix", len(F1["wikilink_md_suffix"]) == 1),
        ("closed-plain", len(F1["closed_plain"]) == 1),
        ("two parked when baseline empty", len(F1["parked_new"]) == 2),
        ("inherited parked → warn", len(F2["parked_inherited"]) == 1),
        ("new parked → error", len(F2["parked_new"]) == 1),
        ("orphan detected", any(r["file"] == "topic_orphan.md"
                                and r["class"] == "ORPHANED"
                                for r in F1["no_index_hook"])),
        ("overlong line", len(F1["overlong_index_lines"]) >= 1),
        ("missing frontmatter", len(F1["missing_frontmatter"]) == 1),
    ]
    ok = True
    for name, passed in checks:
        print(f"  {'PASS' if passed else 'FAIL'}  {name}")
        ok = ok and passed
    print(f"selftest: {'OK' if ok else 'FAILED'} "
          f"({sum(1 for _, p in checks if p)}/{len(checks)})")
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--memory-dir", default=DEFAULT_MEMORY_DIR)
    ap.add_argument("--out-dir", default=None,
                    help="report output dir (default: <memory-dir>/../memory-audit-reports)")
    ap.add_argument("--baseline", default=None,
                    help="parked-lane baseline JSON (default: parked-baseline.json beside this script)")
    ap.add_argument("--write-baseline", metavar="PATH",
                    help="write current parked findings as the new baseline, then exit")
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--index-target", type=int, default=17_100)
    ap.add_argument("--index-hard", type=int, default=24_400)
    ap.add_argument("--topic-warn", type=int, default=10_000)
    ap.add_argument("--topic-flag", type=int, default=16_000)
    ap.add_argument("--line-long", type=int, default=300)
    args = ap.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    if args.selftest:
        sys.exit(run_selftest(script_dir))

    if not os.path.isfile(os.path.join(args.memory_dir, INDEX)):
        print(f"error: no {INDEX} in {args.memory_dir}", file=sys.stderr)
        sys.exit(2)

    thresholds = dict(index_target=args.index_target, index_hard=args.index_hard,
                      topic_warn=args.topic_warn, topic_flag=args.topic_flag,
                      line_long=args.line_long)

    baseline_path = args.baseline or os.path.join(script_dir, "parked-baseline.json")
    baseline = {"entries": {}}
    if os.path.isfile(baseline_path):
        with open(baseline_path, encoding="utf-8") as fh:
            baseline = json.load(fh)

    F, meta, parked_current = audit(args.memory_dir, baseline, thresholds)

    if args.write_baseline:
        out = {"generated_at": datetime.now().isoformat(timespec="seconds"),
               "note": "Inherited parked-lane entries (warnings). Triage each, "
                       "then remove it; new entries are errors. Ruling 2026-07-28.",
               "entries": {k: {"hash": v["hash"], "text": v["text"]}
                           for k, v in sorted(parked_current.items())}}
        with open(args.write_baseline, "w", encoding="utf-8") as fh:
            json.dump(out, fh, indent=2, ensure_ascii=False)
            fh.write("\n")
        print(f"baseline written: {args.write_baseline} "
              f"({len(out['entries'])} inherited entries)")
        sys.exit(0)

    generated_at = datetime.now().isoformat(timespec="seconds")
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    out_dir = args.out_dir or os.path.join(
        os.path.dirname(args.memory_dir.rstrip("/")), "memory-audit-reports")
    os.makedirs(out_dir, exist_ok=True)

    report_path = os.path.join(out_dir, f"audit-{ts}.md")
    with open(report_path, "w", encoding="utf-8") as fh:
        fh.write(render_report(F, meta, thresholds, generated_at))

    errors, warns, infos = summarize(F)
    findings_path = os.path.join(out_dir, f"audit-{ts}.json")
    with open(findings_path, "w", encoding="utf-8") as fh:
        json.dump({"generated_at": generated_at, "meta": meta,
                   "thresholds": thresholds, "baseline": baseline_path,
                   "severity": {c: severity(c) for c in sorted(F)},
                   "counts": {c: len(F[c]) for c in sorted(F)},
                   "errors": errors, "warnings": warns, "infos": infos,
                   "findings": {c: F[c] for c in sorted(F)}},
                  fh, indent=1, ensure_ascii=False)
        fh.write("\n")

    print(f"memory:audit — {meta['topic_files']} topic files, "
          f"index {meta['index_bytes']/1024:.1f}KB")
    print(f"  ERRORS {errors} · WARNINGS {warns} · INFO {infos}")
    for c in sorted(F, key=lambda c: ("ERROR WARN INFO".split().index(severity(c)), c)):
        if F[c]:
            print(f"  [{severity(c):5s}] {c:26s} {len(F[c])}")
    print(f"  report:   {report_path}")
    print(f"  findings: {findings_path}")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
