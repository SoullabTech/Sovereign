# legacy wins when both are present — the precedence rule inverted
p='lib/writersStudio/writeStateClient.ts'
s=open(p).read()
old="""  if (focus) return { kind: 'chain_version', chainId: focus.chainId, versionId: focus.versionId };
  if (legacyProposalId) return { kind: 'legacy', proposalId: legacyProposalId };"""
new="""  if (legacyProposalId) return { kind: 'legacy', proposalId: legacyProposalId };
  if (focus) return { kind: 'chain_version', chainId: focus.chainId, versionId: focus.versionId };"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
