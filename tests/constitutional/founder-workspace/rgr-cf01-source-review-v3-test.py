"""REV-03 independent replay and structurally grounded model-judgment falsifiers."""
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[3]
spec=importlib.util.spec_from_file_location("rgr_cf03",ROOT/"scripts/builder/rgr-cf01-source-review-v3.py")
rev=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=rev
spec.loader.exec_module(rev)
base=rev.base

class Review03Test(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.inventory=base.read_git_blobs()
    def receipts(self):
        result={}
        for i,(f,a,b) in enumerate(base.REQUIRED,1):
            blob=self.inventory[f];rows=base.make_rows(blob,a,b)
            result["R"+str(i).zfill(4)]={"receipt_id":"R"+str(i).zfill(4),
                "file_id":f,"path":blob["path"],"commit":base.COMMIT,
                "file_sha256":blob["sha256"],"start":a,"end":b,"rows":rows,
                "content_sha256":base.sha(base.canonical(rows))}
        return result
    def judgment(self):
        return {"verdict":"PASS",
            "summary":"The synthetic reviewer fixture has source excerpts for all six changed files and four independent critical-source checks. This statement is test data, not an actual model or human acceptance.",
            "checks":{k:{"status":"PASS",
                          "assessment":"This synthetic evidence-backed check passes for the exact pinned source in the test.",
                          "defeat_test":"Alter the bound committed file or documentary standing and the reviewer must find an error."} for k in rev.KEYS},
            "findings":[],
            "limitations":["This fixture is generated locally and has no independently reviewed semantic correctness."]
        }
    def test_read_groups_cannot_be_guessed(self):
        x=self.receipts()
        self.assertTrue(rev.validate_judgment(self.judgment(),x,self.inventory)["ok"])
        x.pop("R0007")
        self.assertFalse(rev.validate_judgment(self.judgment(),x,self.inventory)["ok"])
    def test_model_pass_contradicted_by_concern_fails(self):
        x=self.judgment()
        x["checks"]["CF01-C2"]["status"]="CONCERN"
        self.assertFalse(rev.validate_judgment(x,self.receipts(),self.inventory)["ok"])
    def test_model_pass_contradicted_by_material_finding_fails(self):
        x=self.judgment()
        x["findings"]=[{"severity":"high","check":"CF01-C1",
                        "issue":"Candidate documentary standing can be promoted without independent evidence.",
                        "falsifier":"Modify source labels and observe if the frozen record is still accepted.",
                        "remedy":"Refuse the altered claim with a checked source revision."}]
        self.assertFalse(rev.validate_judgment(x,self.receipts(),self.inventory)["ok"])
    def test_source_evidence_map_is_exact_immutable_git_source(self):
        m=rev.evidence_map(self.receipts(),self.inventory)
        self.assertEqual(set(m),set(rev.KEYS))
        for key,parts in m.items():
            self.assertTrue(parts)
            for part in parts:
                self.assertEqual(part["commit"],rev.COMMIT)
                self.assertTrue(part["exact_committed_lines"])
                self.assertTrue(all(isinstance(x["line"],int) and isinstance(x["text"],str) for x in part["exact_committed_lines"]))
    def make_artifact(self,root,break_model_origin=False):
        reviewer=root/"primary";reviewer.mkdir()
        ledger=base.Ledger(reviewer);source=self.receipts();stored=[]
        for i,(rid,chunk) in enumerate(source.items(),1):
            call_id="model-read-"+rid
            args={"file_id":chunk["file_id"],"start":chunk["start"],"end":chunk["end"]}
            ledger.add({"type":"model_response","role":"primary","turn":i,
                        "message_sha256":"f"*64,
                        "tool_calls":[{"id":call_id,"function":{"name":"read_source","arguments":args}}],
                        "content":"","eval_count":15})
            ev=ledger.add({"type":"committed_source_read","role":"primary","receipt":chunk,
                           "model_tool_call_id":call_id})
            stored.append({**chunk,"ledger_event_sha256":ev})
        judged=self.judgment()
        text=json.dumps(judged)
        final_sha=ledger.add({"type":"model_response","role":"primary","turn":11,
                              "message_sha256":"a"*64,"tool_calls":[],"content":text if not break_model_origin else "{}",
                              "eval_count":120})
        ledger.add({"type":"review_validated","role":"primary",
                    "model_response_event_sha256":final_sha,"verdict":judged})
        (reviewer/"source-read-receipts.json").write_text(json.dumps(stored))
        proof=rev.evidence_map({r["receipt_id"]:r for r in stored},self.inventory)
        (reviewer/"validated-review.json").write_text(json.dumps({"model_judgment":judged,
            "validation":rev.validate_judgment(judged,{r["receipt_id"]:r for r in stored},self.inventory),
            "verified_evidence":proof}))
        (reviewer/"reviewer-summary.json").write_text(json.dumps({"role":"primary",
            "model":rev.MODELS["primary"]["name"],"accepted_review":True,
            "final_event_sha256":ledger.previous}))
    def test_auditor_replays_exact_git_evidence(self):
        with tempfile.TemporaryDirectory(prefix="rgr-cf03-") as temp:
            path=Path(temp);self.make_artifact(path)
            audit=rev.audit_one("primary",path,self.inventory)
            self.assertTrue(audit["ok"],audit["problems"])
    def test_auditor_refuses_fabricated_model_final(self):
        with tempfile.TemporaryDirectory(prefix="rgr-cf03-") as temp:
            path=Path(temp);self.make_artifact(path,break_model_origin=True)
            audit=rev.audit_one("primary",path,self.inventory)
            self.assertFalse(audit["ok"])
            self.assertIn("model's generated JSON",str(audit["problems"]))
    def test_auditor_refuses_missing_model_read_event(self):
        with tempfile.TemporaryDirectory(prefix="rgr-cf03-") as temp:
            path=Path(temp);self.make_artifact(path)
            p=path/"primary/read-events.jsonl"
            x=p.read_text()
            p.write_text(x.replace('"name": "read_source"','"name": "forged_read"'))
            audit=rev.audit_one("primary",path,self.inventory)
            self.assertFalse(audit["ok"])
    def test_review_target_remains_clean_and_draft(self):
        self.assertEqual(base.exact_target()["state"],"DRAFT")

if __name__=="__main__":
    unittest.main(verbosity=2)
