p='lib/manuscript/proposalChain/proposalWorkTarget.ts'
s=open(p).read()
old="  if (r.work.chain.locus.workId !== expectedWorkId) return { ok: false, reason: 'wrong_work' };"
new="  /* mutant: member owns the chain, so that is treated as enough */"
assert old in s; open(p,'w').write(s.replace(old,new,1))
