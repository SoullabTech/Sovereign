#!/usr/bin/env python3
"""M-W5-CONVERT-DIRECTION

An instruction is turned into a formulation AND its conversational reference
into a succession — both halves of the collapse at once. ⛔ D6 kills it.
"""
import sys
P = 'lib/manuscript/editorialWorkspace/store.ts'
OLD = '      [memberId, chainId, author, input.instruction, input.refersTo]);\n    return { ok: true, direction: hydrateDirection(r.rows[0]) };'
NEW = '      [memberId, chainId, author, input.instruction, input.refersTo]);\n    await query(\n      `INSERT INTO proposal_versions (chain_id, author, formulation, supersedes)\n       VALUES ($1, $2, $3, $4)`,\n      [chainId, author, input.instruction, input.refersTo]);\n    return { ok: true, direction: hydrateDirection(r.rows[0]) };'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
