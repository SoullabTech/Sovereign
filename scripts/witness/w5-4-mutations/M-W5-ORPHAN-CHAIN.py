#!/usr/bin/env python3
"""M-W5-ORPHAN-CHAIN

The transaction is dropped and the chain is inserted first. The Insight then
fails and the chain survives — a durable editorial relationship for which
nobody authored any editorial act. ⛔ Z2 kills it.
"""
import sys
P = 'lib/manuscript/editorialWorkspace/store.ts'
OLD = '  return transaction(async (tx) => {\n    const chain = await openChainWithExecutor(tx, memberId, input);\n    const insight = await insertInsight(tx, memberId, chain.id, observation);\n    return { chain, insight };\n  });'
NEW = '  const chain = await openChainWithExecutor({ query }, memberId, input);\n  const insight = await insertInsight({ query }, memberId, chain.id, observation);\n  return { chain, insight };'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
