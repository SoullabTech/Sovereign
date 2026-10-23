"""Pure fictional source tests for the independently versioned PG16 CI witness."""
import importlib.util
import io
from pathlib import Path
import sys
import tarfile
import tempfile
import unittest
from unittest import mock
from types import SimpleNamespace

SOURCE=Path(__file__).resolve().parents[1]/'scripts'/'witness'/'r20_pg16_ci_standalone_20261022.py'
spec=importlib.util.spec_from_file_location('r20_fictional_pg16_reference',SOURCE)
r=importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)

class StandaloneFixture(unittest.TestCase):
    def test_generated_archive_can_be_staged_without_postgres(self):
        with tempfile.TemporaryDirectory() as base:
            p=Path(base)
            archive,expected=r.archive_fixture(p)
            stage=p/'stage';stage.mkdir()
            vault=r.staged_vault(archive,stage)
            self.assertEqual((vault/'writer/keep.txt').read_bytes(),expected['writer/keep.txt'])
            self.assertEqual((vault/'writer/dead.txt').read_bytes(),expected['writer/dead.txt'])

    def test_unexpected_tar_member_refused(self):
        with tempfile.TemporaryDirectory() as base:
            p=Path(base);bad=p/'bad.tar.gz'
            with tarfile.open(bad,'w:gz') as tar:
                info=tarfile.TarInfo('unexpected.txt');data=b'FICTIONAL';info.size=len(data)
                tar.addfile(info,io.BytesIO(data))
            dest=p/'stage';dest.mkdir()
            with self.assertRaisesRegex(RuntimeError,'ENTRY_SET_UNEXPECTED'):
                r.staged_vault(bad,dest)

    def test_nonfictional_sql_values_refused(self):
        for val in ['../../other',"a' OR 1=1--",'spaces are unsafe','']:
            with self.subTest(val=val), self.assertRaisesRegex(RuntimeError,'FICTIONAL_ID_INVALID'):
                r.sqlq(val)

    def test_ledger_signature_refuses_tamper(self):
        key=b'fictional-fixed-test-key-key-12345'
        envelope=r.sig({'generation':2},key)
        self.assertEqual(r.check(envelope,key)['generation'],2)
        envelope['data']['generation']=0
        with self.assertRaisesRegex(RuntimeError,'FICTIONAL_SIGNATURE_INVALID'):
            r.check(envelope,key)

    def test_pg_denial_requires_the_expected_guard_marker(self):
        synthetic=SimpleNamespace(returncode=3,stderr=b"ERROR: fictional_erasure_refusal",stdout=b"")
        with mock.patch.object(r.subprocess,"run",return_value=synthetic):
            r.pg_denies("fictionaldb","SELECT 1;","fictional_erasure_refusal")
            with self.assertRaisesRegex(RuntimeError,"FICTIONAL_POLICY_DENIAL_NOT_PROVEN"):
                r.pg_denies("fictionaldb","SELECT 1;","fictional_scope_refusal")

    def test_pg_denial_refuses_success_and_unrelated_database_errors(self):
        cases=[
            SimpleNamespace(returncode=0,stderr=b"",stdout=b""),
            SimpleNamespace(returncode=3,stderr=b"ERROR: fictional_unrelated_failure",stdout=b"")
        ]
        for synthetic in cases:
            with self.subTest(code=synthetic.returncode),mock.patch.object(r.subprocess,"run",return_value=synthetic):
                with self.assertRaisesRegex(RuntimeError,"FICTIONAL_POLICY_DENIAL_NOT_PROVEN"):
                    r.pg_denies("fictionaldb","SELECT 1;","fictional_erasure_refusal")
        with self.assertRaisesRegex(RuntimeError,"FICTIONAL_EXPECTED_POLICY_MARKER_INVALID"):
            r.pg_denies("fictionaldb","SELECT 1;","wrong-marker")

    def test_newer_caller_pin_refuses_old_signer_and_co_rollback(self):
        current_key=b'new-fictional-signer-32-byte-key!!'
        old_key=b'old-fictional-signer-32-byte-key!!'
        self.assertEqual(len(current_key),32)
        self.assertEqual(len(old_key),32)
        new_ledger=r.sig({"generation":2,"deleted":["fictional-revoked"]},current_key)
        new_digest=r.hashlib.sha256(r.packed(new_ledger)).hexdigest()
        new_checkpoint=r.sig({"min_generation":2,"ledger_sha256":new_digest},current_key)
        current_pin={"generation":2,"ledger_sha256":new_digest,
                     "signer_key_sha256":r.hashlib.sha256(current_key).hexdigest()}
        self.assertEqual(r.check_caller_pinned_head(new_ledger,new_checkpoint,current_key,current_pin)["generation"],2)

        old_ledger=r.sig({"generation":1,"deleted":[]},old_key)
        old_digest=r.hashlib.sha256(r.packed(old_ledger)).hexdigest()
        old_checkpoint=r.sig({"min_generation":1,"ledger_sha256":old_digest},old_key)
        old_pin={"generation":1,"ledger_sha256":old_digest,
                 "signer_key_sha256":r.hashlib.sha256(old_key).hexdigest()}
        # Deliberate unsafe result: replacing EVERY local trust anchor accepts old.
        self.assertEqual(r.check_caller_pinned_head(old_ledger,old_checkpoint,old_key,old_pin)["generation"],1)
        # A caller that actually retains the newer pin refuses the complete old bundle.
        with self.assertRaisesRegex(RuntimeError,"FICTIONAL_CURRENT_SIGNER_MISMATCH"):
            r.check_caller_pinned_head(old_ledger,old_checkpoint,old_key,current_pin)

    def test_anchor_absence_conflict_and_stale_generation_refuse(self):
        key=b'x'*32
        ledger=r.sig({"generation":2},key)
        digest=r.hashlib.sha256(r.packed(ledger)).hexdigest()
        checkpoint=r.sig({"min_generation":2,"ledger_sha256":digest},key)
        pin={"generation":2,"ledger_sha256":digest,"signer_key_sha256":r.hashlib.sha256(key).hexdigest()}
        with self.assertRaisesRegex(RuntimeError,"FICTIONAL_CURRENT_ANCHOR_MISSING_OR_INVALID"):
            r.check_caller_pinned_head(ledger,checkpoint,key,None)
        for invalid in [dict(pin,generation=1),dict(pin,ledger_sha256="0"*64)]:
            with self.subTest(pin=invalid),self.assertRaisesRegex(RuntimeError,"FICTIONAL_OLD_OR_CONFLICTING_AUTHORITY"):
                r.check_caller_pinned_head(ledger,checkpoint,key,invalid)
        for invalid in [{},dict(pin,signer_key_sha256="not-a-hash"),dict(pin,generation=True)]:
            with self.subTest(pin=invalid),self.assertRaisesRegex(RuntimeError,"FICTIONAL_CURRENT_ANCHOR_MISSING_OR_INVALID"):
                r.check_caller_pinned_head(ledger,checkpoint,key,invalid)

if __name__=='__main__': unittest.main()
