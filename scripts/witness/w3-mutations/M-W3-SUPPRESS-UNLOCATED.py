# an unavailable locus suppresses the workspace — the conversation dies with the mark
p='lib/writersStudio/editorialWorkspace.ts'
s=open(p).read()
old="""  return {
    kind: 'chain',
    chainId: target.chainId,
    versionId: target.versionId,
    located: target.location.located,
  };"""
new="""  if (!target.location.located) return null;
  return {
    kind: 'chain',
    chainId: target.chainId,
    versionId: target.versionId,
    located: target.location.located,
  };"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
