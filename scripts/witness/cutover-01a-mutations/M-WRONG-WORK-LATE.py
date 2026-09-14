# The subtler mutant: bind the Work, but only AFTER projecting - so the other
# Work's wording is assembled first and the refusal is decided downstream of it.
p='lib/manuscript/proposalChain/proposalWorkTarget.ts'
s=open(p).read()
old="  if (r.work.chain.locus.workId !== expectedWorkId) return { ok: false, reason: 'wrong_work' };"
new="""  const early = projectProposalWork(r.work, r.work.focused!, sections);
  if (r.work.chain.locus.workId !== expectedWorkId) {
    return { ok: true, target: early };
  }"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
