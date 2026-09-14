#!/usr/bin/env python3
"""M-W5-FOREIGN-READ

Member ownership leaves one read's predicate — knowing a chain UUID becomes
enough to read another member's editorial record. ⛔ R1 kills it.
"""
import sys
P = 'lib/manuscript/editorialWorkspace/store.ts'
OLD = '    `SELECT ${INSIGHT_COLUMNS} FROM proposal_chain_insights\n      WHERE proposal_chain_id = $1 AND member_id = $2\n      ORDER BY id`, [chainId, memberId]);'
NEW = '    `SELECT ${INSIGHT_COLUMNS} FROM proposal_chain_insights\n      WHERE proposal_chain_id = $1\n      ORDER BY id`, [chainId]);'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
