"""Deterministic falsification for the separately governed RGR-CF01 source-review lane.
This file makes no model calls, writes only disposable tmp fixtures and never edits
the source repository or research Work Unit.
"""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[3]
spec=importlib.util.spec_from_file_location("rgr_source_review",ROOT/"scripts/builder/rgr-cf01-source-review-v2.py")
import sys
mod=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=mod
spec.loader.exec_module(mod)

class ReviewProof(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.attestation=mod.exact_target()
        cls.blobs=mod.read_git_blobs()
    def make_receipts(self):
        receipts={}
        for i,(f,start,end) in enumerate(mod.REQUIRED,1):
            rows=mod.make_rows(self.blobs[f],start,end)
            rid="R"+str(i).zfill(4)
            receipts[rid]={"receipt_id":rid,"file_id":f,"start":start,"end":end,
                           "path":self.blobs[f]["path"],"commit":mod.COMMIT,
                           "file_sha256":self.blobs[f]["sha256"],
                           "rows":rows,"content_sha256":mod.sha(mod.canonical(rows))}
        return receipts
    def valid_review(self,receipts):
        citations=[]
        for rid,r in receipts.items():
            row=next((x for x in r["rows"] if len(x["text"].strip())>=9),r["rows"][0])
            citations.append({"receipt_id":rid,"line":row["line"],"line_token":row["line_token"],
                              "claim":"This excerpt is necessary to evaluate documentary custody and review standing."})
        return {
            "verdict":"PASS",
            "summary":"All cited source readings are bounded, and the original document is tied to compiled source hashes. "
                      "The synthetic review asserts no authorization for research experiments, merge, installation, MAIA, "
                      "or production. This is a mechanical validator fixture, not a real model opinion.",
            "citations":citations,
            "checks":{k:"pass — bounded synthetic evidence was provided, not a genuine reviewer conclusion" for k in
                      ["CF01-C1","CF01-C2","graph_ui","test_scope","authority"]},
            "findings":[],
            "limitations":["This is a constructed syntax falsifier and cannot certify scientific or semantic correctness."]
        }
    def test_frozen_commit_and_six_file_allowlist(self):
        self.assertEqual(self.attestation["commit"],mod.COMMIT)
        self.assertEqual(len(self.blobs),6)
        self.assertTrue(all(len(item["sha256"])==64 for item in self.blobs.values()))
    def test_tool_rejects_file_path_and_invalid_bounds(self):
        with self.assertRaises(ValueError):mod.check_read_args({"file_id":"../secret","start":1,"end":10},self.blobs)
        with self.assertRaises(ValueError):mod.check_read_args({"file_id":"reader","start":0,"end":10},self.blobs)
        with self.assertRaises(ValueError):mod.check_read_args({"file_id":"reader","start":10,"end":34},self.blobs)
        with self.assertRaises(ValueError):mod.check_read_args({"file_id":"reader","start":True,"end":2},self.blobs)
        with self.assertRaises(ValueError):mod.check_read_args({"file_id":"reader","start":1,"end":2,"path":"/etc/passwd"},self.blobs)
    def test_missing_read_does_not_pass(self):
        r=self.make_receipts()
        del r["R0003"]
        result=mod.validate_review(self.valid_review(r),r,self.blobs)
        self.assertFalse(result["ok"])
        self.assertIn("missing",str(result["problems"]).lower())
    def test_complete_genuine_source_receipts_validate(self):
        r=self.make_receipts()
        result=mod.validate_review(self.valid_review(r),r,self.blobs)
        self.assertTrue(result["ok"],result["problems"])
        self.assertEqual(result["grounded_citations"],len(mod.REQUIRED))
        self.assertEqual(set(result["verified_source_ids"]),set(mod.SOURCE))
    def test_invented_receipt_refused(self):
        r=self.make_receipts(); v=self.valid_review(r)
        v["citations"][0]["receipt_id"]="R9999"
        self.assertFalse(mod.validate_review(v,r,self.blobs)["ok"])
    def test_invented_line_refused(self):
        r=self.make_receipts(); v=self.valid_review(r)
        v["citations"][0]["line"]=20000
        self.assertFalse(mod.validate_review(v,r,self.blobs)["ok"])
    def test_invented_line_token_refused(self):
        r=self.make_receipts(); v=self.valid_review(r)
        v["citations"][0]["line_token"]="0000000000000000"
        self.assertFalse(mod.validate_review(v,r,self.blobs)["ok"])
    def test_cross_receipt_line_token_swap_refused(self):
        r=self.make_receipts();v=self.valid_review(r)
        v["citations"][0]["line_token"]=v["citations"][1]["line_token"]
        self.assertFalse(mod.validate_review(v,r,self.blobs)["ok"])
    def test_missing_reader_c2_falsifier_is_refused(self):
        r=self.make_receipts(); v=self.valid_review(r)
        v["citations"]=[c for c in v["citations"] if c["receipt_id"]!="R0007"]
        self.assertFalse(mod.validate_review(v,r,self.blobs)["ok"])
    def test_pass_with_medium_finding_cannot_pass(self):
        r=self.make_receipts();v=self.valid_review(r)
        v["findings"]=[{"severity":"medium","citation_index":0,
                       "issue":"This synthetic fabricated finding purports to be a real security defect.",
                       "falsifier":"A minimally concrete reproduction requires contradictory source truth.",
                       "remedy":"Repair the hypothetical source representation without authority increase."}]
        self.assertFalse(mod.validate_review(v,r,self.blobs)["ok"])
    def test_pass_with_uncertain_check_cannot_pass(self):
        r=self.make_receipts();v=self.valid_review(r)
        v["checks"]["CF01-C2"]="uncertain because the model cannot independently check the source"
        self.assertFalse(mod.validate_review(v,r,self.blobs)["ok"])
    def test_hash_chained_receipt_detects_tampering(self):
        with tempfile.TemporaryDirectory(prefix="rgr-review-lane-") as tmp:
            l=mod.Ledger(Path(tmp))
            l.add({"type":"committed_source_read","role":"synthetic","receipt":{"path":"foo","text":"bar"}})
            l.add({"type":"review_validated","role":"synthetic","verdict":{"verdict":"HOLD"}})
            self.assertTrue(mod.verify_ledger(l.path)["ok"])
            t=l.path.read_text()
            l.path.write_text(t.replace('"foo"','"foo-mutated"'))
            self.assertFalse(mod.verify_ledger(l.path)["ok"])
    def make_auditable_artifact(self, folder, include_tool_calls=True):
        reviewer=folder/"primary"
        reviewer.mkdir()
        ledger=mod.Ledger(reviewer)
        raw_receipts=self.make_receipts()
        authenticated={}
        for rid,receipt in raw_receipts.items():
            call_id="synthetic-"+rid
            args={"file_id":receipt["file_id"],"start":receipt["start"],"end":receipt["end"]}
            if include_tool_calls:
                ledger.add({"type":"model_response","role":"primary","turn":int(rid[1:]),
                            "message_sha256":"f"*64,"call_count":1,
                            "tool_calls":[{"id":call_id,"function":{"name":"read_source","arguments":args}}],
                            "done_reason":"stop","eval_count":10})
            digest=ledger.add({"type":"committed_source_read","role":"primary","receipt":receipt,
                              "model_tool_call_id":call_id})
            authenticated[rid]={**receipt,"ledger_event_sha256":digest}
        verdict=self.valid_review(authenticated)
        verdict_call={"id":"synthetic-final","function":{"name":"submit_review","arguments":verdict}}
        ledger.add({"type":"model_response","role":"primary","turn":15,"message_sha256":"a"*64,
                    "call_count":1,"tool_calls":[verdict_call],"done_reason":"stop","eval_count":300})
        ledger.add({"type":"review_validated","role":"primary","verdict":verdict,"model_tool_call_id":"synthetic-final"})
        (reviewer/"source-read-receipts.json").write_text(json.dumps(list(authenticated.values()))+chr(10))
        (reviewer/"validated-review.json").write_text(json.dumps({
           "model_review":verdict,"validator_result":mod.validate_review(verdict,authenticated,self.blobs)})+chr(10))
        (reviewer/"reviewer-summary.json").write_text(json.dumps({
          "role":"primary","model":mod.MODELS["primary"]["name"],"receipt_count":len(authenticated),
          "final_event_sha256":ledger.previous,"accepted_review":True,
          "model_verdict":"PASS"})+chr(10))
        return reviewer
    def test_independent_replay_accepts_matching_model_read_trace(self):
        with tempfile.TemporaryDirectory(prefix="rgr-review-audit-") as tmp:
            f=Path(tmp)
            self.make_auditable_artifact(f)
            result=mod.audit_role("primary",f,self.blobs)
            self.assertTrue(result["ok"],result["problems"])
            self.assertEqual(result["model_verdict"],"PASS")
    def test_independent_replay_refuses_fake_model_source_reads(self):
        with tempfile.TemporaryDirectory(prefix="rgr-review-audit-") as tmp:
            f=Path(tmp)
            self.make_auditable_artifact(f,include_tool_calls=False)
            result=mod.audit_role("primary",f,self.blobs)
            self.assertFalse(result["ok"])
            self.assertIn("model read_source",str(result["problems"]))
    def test_independent_replay_refuses_forged_receipt_after_read(self):
        with tempfile.TemporaryDirectory(prefix="rgr-review-audit-") as tmp:
            f=Path(tmp)
            folder=self.make_auditable_artifact(f)
            p=folder/"source-read-receipts.json"
            v=json.loads(p.read_text())
            v[0]["rows"][0]["text"]="THIS WAS NOT READ FROM THE COMMITTED SOURCE"
            p.write_text(json.dumps(v))
            result=mod.audit_role("primary",f,self.blobs)
            self.assertFalse(result["ok"])
            self.assertIn("exact Git blob",str(result["problems"]))
    def test_original_repo_remains_clean(self):
        # Source checkout is never changed by any synthetic review check.
        self.assertFalse(mod.git("status","--porcelain").strip())

if __name__=="__main__":
    unittest.main(verbosity=2)
