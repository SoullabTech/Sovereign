#!/usr/bin/env python3
"""M-W5-DIRECTION-AUTHOR

The member path writes MAIA's authorship. ⛔ D1 kills it.
"""
import sys
P = 'lib/manuscript/editorialWorkspace/store.ts'
OLD = "export async function createMemberDirection(\n  memberId: string, chainId: string, input: DirectionInput,\n): Promise<DirectionResult> {\n  return insertDirection(memberId, chainId, 'member', input);\n}"
NEW = "export async function createMemberDirection(\n  memberId: string, chainId: string, input: DirectionInput,\n): Promise<DirectionResult> {\n  return insertDirection(memberId, chainId, 'maia', input);\n}"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
