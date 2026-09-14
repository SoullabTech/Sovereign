# the law itself inverted: a chain/version visit yields a legacy panel id
p='lib/writersStudio/writeStateClient.ts'
s=open(p).read()
old="  return selector && selector.kind === 'legacy' ? selector.proposalId : null;"
new="  return selector ? (selector.kind === 'legacy' ? selector.proposalId : 'old-proposal-1') : null;"
assert old in s; open(p,'w').write(s.replace(old,new,1))
