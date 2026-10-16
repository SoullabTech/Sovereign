#!/usr/bin/env python3
"""R31 metadata-only, fail-closed inventory of literal legacy Writer's Studio SQL writers.

The scanner reads repository source (never a database, file-vault, member file,
secrets, cloud key or model prompt). It reports path/table/operation/line and
known SQL column NAMES only. No source excerpts, literal values, or SQL
parameters are copied. A lexical audit is not an exhaustive data-flow proof:
dynamic SQL, ORM operations, call-graph reachability and old backups need
separate inspection. NO GO code path.
"""
from __future__ import annotations
import argparse, hashlib, json, os, pathlib, re, sys, unittest
from collections import Counter

REPO = pathlib.Path(__file__).resolve().parents[2]
EVIDENCE = pathlib.Path("/Volumes/T7 Shield/ws-beta-release-r9-build-20261015")
RECEIPT = EVIDENCE / "R31_LEGACY_WRITER_WRITE_SITES_20261016.json"
SEARCH_ROOTS = (
    "lib/manuscript",
    "lib/writersStudio",
    "app/api/sovereign/manuscripts",
    "app/api/writers-studio",
)
TABLES = (
    "manuscript_source_arrivals",
    "manuscript_sections",
    "manuscript_working_drafts",
    "manuscript_draft_sections",
    "working_draft_revisions",
    "manuscript_keeps",
    "manuscript_revision_offers",
    "manuscript_revision_authorizations",
    "manuscript_application_recovery",
    "manuscript_structure_proposals",
    "manuscript_structure_units",
    "proposal_chains",
)
SENSITIVE_COLUMNS = frozenset((
    "source_text","original_filename","body","text","content","note",
    "verbatim_text","expected_text","proposed_text","before_body","after_body",
    "reason","based_on","read_state","interpretation","evidence",
    "reader_provenance","heading","title","filename","extraction_method",
))
WRITER = re.compile(
    r"\b(?P<op>INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+"
    r"(?:public\.)?(?P<table>" + "|".join(TABLES) + r")\b",
    re.IGNORECASE,
)
COLUMN = re.compile(r"\b(?:"+"|".join(sorted(SENSITIVE_COLUMNS,key=len,reverse=True))+r")\b",re.I)
MAX_SOURCE = 4_000_000
SCANNER_VERSION = "r31-metadata-write-inventory.v1"

def candidates(source:str,relpath:str)->list[dict]:
    """Conservative token scan; reports lower-bound literal SQL writer candidates."""
    found = []
    for hit in WRITER.finditer(source):
        op = re.sub(r"\s+"," ",hit.group("op").upper())
        tail = source[hit.end():hit.end()+1300]
        # If a SQL string terminates earlier, avoid crossing into unrelated code.
        first_quote_end=min((n for n in
            (tail.find("`"),tail.find("';"),tail.find('";'))
            if n>=0),default=len(tail))
        scope=tail[:first_quote_end]
        columns=sorted(set(x.lower() for x in COLUMN.findall(scope)))
        found.append({
            "file":relpath,
            "line":source.count("\n",0,hit.start())+1,
            "operation":op,
            "table":hit.group("table").lower(),
            "reviewed_column_names":columns,
            "lexical_only":True,
        })
    return found

def run_scan(root:pathlib.Path=REPO)->dict:
    found=[]
    scanned=0
    for prefix in SEARCH_ROOTS:
        loc=(root/prefix)
        if not loc.exists():
            raise RuntimeError("R31_REQUIRED_SOURCE_ROOT_MISSING:"+prefix)
        for file in sorted(loc.rglob("*")):
            if file.suffix not in (".ts",".tsx") or "__tests__" in file.parts:
                continue
            if file.name.endswith((".test.ts",".spec.ts",".d.ts",".test.tsx",".spec.tsx")):
                continue
            if file.stat().st_size>MAX_SOURCE:
                raise RuntimeError("R31_OVERSIZED_SOURCE_REFUSE:"+str(file.relative_to(root)))
            scanned+=1
            src=file.read_text("utf-8")
            found.extend(candidates(src,file.relative_to(root).as_posix()))
    found.sort(key=lambda x:(x["file"],x["line"],x["operation"],x["table"]))
    summary=Counter(x["table"] for x in found)
    by_operation=Counter(x["operation"] for x in found)
    list_fingerprint=hashlib.sha256(json.dumps(found,sort_keys=True,separators=(",",":")).encode()).hexdigest()
    return {
        "protocol":SCANNER_VERSION,
        "status":"HOLD_LEGACY_SQL_WRITE_CANDIDATES" if found else "HOLD_NO_PROOF_FROM_LEXICAL_SCAN",
        "canAdmitRealWriters":False,
        "canCertifyNoPlaintextInSQLOrBackups":False,
        "noProductionModification":True,
        "scope":"repository_source_only;no_real_data",
        "limitedToLiteralSql":True,
        "limitations":[
           "Dynamic SQL, ORMs, stored procedures, indirect writes, logs and object stores not inspected",
           "A named SQL table alone does not prove plaintext persisted or public runtime reachability",
           "No historical rows, JSONB, WAL, replica, backup, provider retention or old-reader assessment",
           "Zero matches must never authorize launch; independent full data-flow and recovery witness required",
        ],
        "scanned_source_files":scanned,
        "candidate_statement_count":len(found),
        "candidate_source_files":len({x["file"] for x in found}),
        "by_table":dict(sorted(summary.items())),
        "by_operation":dict(sorted(by_operation.items())),
        "unobserved_target_tables":sorted(set(TABLES)-set(summary)),
        "fingerprint_sha256":list_fingerprint,
        "sites":found,
    }

class SourceGateTests(unittest.TestCase):
    def test_newline_syntax_and_multiple_writes(self):
        sql="""
const x=`INSERT
INTO manuscript_source_arrivals (source_text, original_filename) VALUES ($1,$2)`;
const y=`UPDATE manuscript_draft_sections SET text=$1 WHERE id=$2`;
const z=`DELETE FROM manuscript_keeps WHERE id=$1`;
"""
        sites=candidates(sql,"app/api/sovereign/manuscripts/testroute/route.ts")
        self.assertEqual([x["operation"] for x in sites],["INSERT INTO","UPDATE","DELETE FROM"])
        self.assertEqual(sites[0]["reviewed_column_names"],["original_filename","source_text"])
        self.assertEqual(sites[1]["table"],"manuscript_draft_sections")
        self.assertEqual([x["line"] for x in sites],[2,4,5])
    def test_does_not_print_literal_prose_or_query_values(self):
        literal="R31_PRIVATE_FICTIONAL_MANUSCRIPT_NEVER_EXPORT"
        sql="const q=`INSERT INTO manuscript_sections(body) VALUES ('"+literal+"')`"
        receipt=json.dumps(candidates(sql,"lib/manuscript/fictional.ts"))
        self.assertNotIn(literal,receipt)
        self.assertIn("manuscript_sections",receipt)
        self.assertIn("body",receipt)
    def test_not_automatically_a_go_on_empty_file(self):
        s="SELECT source_text FROM manuscript_source_arrivals"
        self.assertEqual(candidates(s,"file.ts"),[])
    def test_rejects_untracked_tables_and_db_not_entered(self):
        s="INSERT INTO some_older_table(content) VALUES ('fictional')"
        self.assertEqual(candidates(s,"file.ts"),[])

def main():
    parser=argparse.ArgumentParser(description="Offline lexical beta Writer SQL write-site HOLD")
    parser.add_argument("--self-test",action="store_true")
    parser.add_argument("--scan",action="store_true")
    args=parser.parse_args()
    if args.self_test==args.scan:
        parser.error("choose exactly one of --self-test or --scan")
    if args.self_test:
        suite=unittest.defaultTestLoader.loadTestsFromTestCase(SourceGateTests)
        return 0 if unittest.TextTestRunner(verbosity=2).run(suite).wasSuccessful() else 2
    x=run_scan()
    EVIDENCE.mkdir(parents=True,exist_ok=True)
    # Private receipt: structural filenames only. Never write source code text.
    fd=os.open(RECEIPT,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    with os.fdopen(fd,"w") as f: json.dump(x,f,indent=2);f.write("\n")
    print(json.dumps({key:x[key] for key in [
        "status","canAdmitRealWriters","scanned_source_files",
        "candidate_statement_count","candidate_source_files","by_table",
        "by_operation","fingerprint_sha256"]},indent=2))
    return 0

if __name__=="__main__":
    sys.exit(main())
