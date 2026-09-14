import sys
p='lib/manuscript/proposalChain/proposalWorkTarget.ts'
s=open(p).read()
old="""  return { ok: true, target: projectProposalWork(r.work, focused, sections) };"""
new="""  const t = projectProposalWork(r.work, focused, sections);
  if (!t.location.located) return { ok: false, reason: 'chain_unknown' };
  return { ok: true, target: t };"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
