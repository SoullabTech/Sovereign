# R6 collapse: proposal work gated on whether an authorization for this chain fits.
# NOTE: the first N1 passed chain.id to readAuthorizationStatus, which expects an
# AUTHORIZATION id — so it always got null, the gate never fired, and the mutant
# SURVIVED by being a no-op in effect. A mutation must actually do the bad thing.
s = s.replace(
    "import { readChain } from './store';",
    "import { query } from '@/lib/db/postgres';\n"
    "import { readAuthorizationStatus } from '@/lib/manuscript/revisionAuthorization/status';\n"
    "import { readChain } from './store';")
s = s.replace(
    "  const ordered = lineage(versions);",
    "  const found = await query<{ id: string }>(\n"
    "    'SELECT id FROM manuscript_revision_authorizations WHERE proposal_chain_id = $1 LIMIT 1',\n"
    "    [chainId]);\n"
    "  if (found.rows[0]) {\n"
    "    const st = await readAuthorizationStatus(memberId, found.rows[0].id);\n"
    "    if (st && st.state !== 'executable') return { ok: false, reason: 'chain_unknown' };\n"
    "  }\n"
    "  const ordered = lineage(versions);")
