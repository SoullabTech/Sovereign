# the predicate claims `v is ProposalVersion` while checking only three fields
p='lib/manuscript/editorialWorkspace/ontology.ts'
s=open(p).read()
old="""  if (typeof r.id !== 'string' || typeof r.chainId !== 'string') return false;
  if (!(r.supersedes === null || typeof r.supersedes === 'string')) return false;
  if (typeof r.replacementText !== 'string') return false;
  if (r.author !== 'maia' && r.author !== 'member') return false;
  if (typeof r.authoredAt !== 'string') return false;"""
new="""  if (typeof r.id !== 'string' || typeof r.chainId !== 'string') return false;
  if (typeof r.replacementText !== 'string') return false;"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
