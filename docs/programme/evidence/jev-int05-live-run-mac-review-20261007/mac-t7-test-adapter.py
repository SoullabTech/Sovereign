#!/usr/bin/env python3
"""Test-only adapter of Linux /dev/shm fixture to an actual mounted Mac second volume.
Does not modify repository runtime, committed proofs, or governance controls.
Use: python3 mac-t7-test-adapter.py <repo-path> <second-volume-root> <output-dir>
Then execute node <output-dir>/mac-t7-proof-adapted.mjs and matrix similarly.
"""
import sys, json, hashlib
from pathlib import Path
assert len(sys.argv)==4, 'need repo, physical volume, and outdir'
repo=Path(sys.argv[1]).resolve()
vol=Path(sys.argv[2]).resolve()
out=Path(sys.argv[3]).resolve()
assert repo.is_dir() and vol.is_dir() and out.is_dir()
assert repo.stat().st_dev != vol.stat().st_dev, 'not distinct physical device IDs'
def replace_one(s,a,b):
 n=s.count(a)
 assert n==1, ('substitution changed',a,n)
 return s.replace(a,b)
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
testdir=repo/'scripts/builder/__tests__'
proof_src=testdir/'jev-wire-live-run-v1-proof.mjs'
s=proof_src.read_text()
s=replace_one(s,"const HERE = dirname(fileURLToPath(import.meta.url));",
              "const HERE = "+json.dumps(str(testdir))+";")
s=replace_one(s,"from './jev-wire-variant-lib.mjs';",
              "from "+repr((testdir/'jev-wire-variant-lib.mjs').as_uri())+";")
s=replace_one(s,"function pathUrl(name) { return new URL('../' + name, import.meta.url).href; }",
              "function pathUrl(name) { return new URL('../' + name, "+repr((testdir/'review.mjs').as_uri())+").href; }")
s=replace_one(s,"'/dev/shm/jev-lr-'",repr(str(vol/'jev-lr-')))
s=s.replace("'/dev/shm'",repr(str(vol)))
s=replace_one(s,"checkpointMountPoint: "+repr(str(vol))+", __root: l.root }, 'CHECKPOINT_MOUNTED');",
              "checkpointMountPoint: '/Volumes/JEV_FAKE_MISSING_VOLUME_62FAF', __root: l.root }, 'CHECKPOINT_MOUNTED');")
proof_out=out/'mac-t7-proof-adapted.mjs'
proof_out.write_text(s)
matrix_src=testdir/'jev-wire-live-run-v1-matrix.mjs'
t=matrix_src.read_text()
t=replace_one(t,"const PROOF = join(dirname(fileURLToPath(import.meta.url)), 'jev-wire-live-run-v1-proof.mjs');",
              "const PROOF = "+repr(str(proof_out))+";")
matrix_out=out/'mac-t7-matrix-adapted.mjs'
matrix_out.write_text(t)
for kind,p in [('original-proof',proof_src),('adapted-proof',proof_out),
               ('original-matrix',matrix_src),('adapted-matrix',matrix_out)]:
 print(kind,digest(p),str(p))
print('TEST_ONLY_ADAPTATION_READY; SOURCE_UNMODIFIED')
