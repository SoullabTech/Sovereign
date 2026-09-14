#!/usr/bin/env python3
"""M-W5-EMPTY-ON-DB-FAIL

An outage is answered with []. The room would then say MAIA noticed nothing,
when the truth is that we could not ask — the shape of the open S3
`unreachable` finding. ⛔ R3 kills it.
"""
import sys
P = 'lib/manuscript/editorialWorkspace/store.ts'
OLD = 'export async function readInsights(\n  memberId: string, chainId: string,\n): Promise<readonly EditorialInsight[]> {'
NEW = 'export async function readInsights(\n  memberId: string, chainId: string,\n): Promise<readonly EditorialInsight[]> {\n  try {\n    return await readInsightsInner(memberId, chainId);\n  } catch { return []; }\n}\n\nasync function readInsightsInner(\n  memberId: string, chainId: string,\n): Promise<readonly EditorialInsight[]> {'
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
