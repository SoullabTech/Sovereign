#!/usr/bin/env python3
"""M-Z0-VERSION-WITHOUT-CHAIN

A version with no chain is repaired into a subject instead of refused.
"""
import sys
P = 'app/writers-studio/canvasIdentity.ts'
OLD = '  const chainId = params.get(CANVAS_PROPOSAL_CHAIN_PARAM);\n  /* ⛔ No chain, no subject — whatever else the address bar carries. */\n  if (!chainId) return null;\n  const versionId = params.get(CANVAS_PROPOSAL_VERSION_PARAM);'
NEW = '  const versionId = params.get(CANVAS_PROPOSAL_VERSION_PARAM);\n  const chainId = params.get(CANVAS_PROPOSAL_CHAIN_PARAM) ?? versionId;\n  if (!chainId) return null;'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
