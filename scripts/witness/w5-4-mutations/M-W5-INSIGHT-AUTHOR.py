#!/usr/bin/env python3
"""M-W5-INSIGHT-AUTHOR

The caller acquires an author argument and the insert USES it — the one field a
future HTTP route would faithfully forward, turning POST { author: 'maia' } into
the browser speaking in MAIA's voice.

⚠️ THE FIRST WRITING OF THIS OPERATOR SURVIVED, and the reason is worth keeping:
it only added a DEFAULTED parameter and ignored the value, so the door was open
while the behaviour was unchanged — and `Function.length` is 3 either way,
because a default parameter does not count toward it. An arity check could not
see it and neither could any behavioural probe. ⛔ A mutant that changes no
behaviour is not a weaker mutant; it is a mutant the witness cannot be asked to
kill. It now writes what it was handed, and obligation I2c pushes a fourth
argument at the seam exactly as a route would.
"""
import sys

P = "lib/manuscript/editorialWorkspace/store.ts"
EDITS = [
    ("""async function insertInsight(
  exec: SqlExecutor, memberId: string, chainId: string, observation: string,
): Promise<EditorialInsight> {
  const r = await exec.query<InsightRow>(
    `INSERT INTO proposal_chain_insights
       (member_id, proposal_chain_id, author, observation)
     VALUES ($1, $2, 'maia', $3)
     RETURNING ${INSIGHT_COLUMNS}`,
    [memberId, chainId, observation]);""",
     """async function insertInsight(
  exec: SqlExecutor, memberId: string, chainId: string, observation: string,
  author: string = 'maia',
): Promise<EditorialInsight> {
  const r = await exec.query<InsightRow>(
    `INSERT INTO proposal_chain_insights
       (member_id, proposal_chain_id, author, observation)
     VALUES ($1, $2, $4, $3)
     RETURNING ${INSIGHT_COLUMNS}`,
    [memberId, chainId, observation, author]);"""),
    ("""export async function createInsight(
  memberId: string, chainId: string, observation: string,
): Promise<InsightResult> {
  try {
    return { ok: true, insight: await insertInsight({ query }, memberId, chainId, observation) };""",
     """export async function createInsight(
  memberId: string, chainId: string, observation: string,
  author: string = 'maia',
): Promise<InsightResult> {
  try {
    return { ok: true,
      insight: await insertInsight({ query }, memberId, chainId, observation, author) };"""),
]

s = open(P).read()
for old, new in EDITS:
    if old not in s:
        sys.stderr.write("STALE: anchor not found in %s\n" % P)
        sys.exit(3)
    s = s.replace(old, new, 1)
open(P, "w").write(s)
