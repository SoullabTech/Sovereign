#!/usr/bin/env python3
"""M-W5-CONVERT-INSIGHT

⭐ THE COLLAPSE THE WHOLE ONTOLOGY EXISTS TO REFUSE: the observation is also
written as candidate wording, so noticing becomes proposing. ⛔ I4 and Z1
kill it.
"""
import sys
P = 'lib/manuscript/editorialWorkspace/store.ts'
OLD = "  const r = await exec.query<InsightRow>(\n    `INSERT INTO proposal_chain_insights\n       (member_id, proposal_chain_id, author, observation)\n     VALUES ($1, $2, 'maia', $3)\n     RETURNING ${INSIGHT_COLUMNS}`,\n    [memberId, chainId, observation]);\n  return hydrateInsight(r.rows[0]);"
NEW = "  const r = await exec.query<InsightRow>(\n    `INSERT INTO proposal_chain_insights\n       (member_id, proposal_chain_id, author, observation)\n     VALUES ($1, $2, 'maia', $3)\n     RETURNING ${INSIGHT_COLUMNS}`,\n    [memberId, chainId, observation]);\n  await exec.query(\n    `INSERT INTO proposal_versions (chain_id, author, formulation, supersedes)\n     SELECT $1, 'maia', $2, NULL\n      WHERE NOT EXISTS (SELECT 1 FROM proposal_versions WHERE chain_id = $1)`,\n    [chainId, observation]);\n  return hydrateInsight(r.rows[0]);"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
