"""Pure fictional source tests for the independently versioned PG16 CI witness."""
import importlib.util
import io
from pathlib import Path
import sys
import tarfile
import tempfile
import unittest

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

if __name__=='__main__': unittest.main()
