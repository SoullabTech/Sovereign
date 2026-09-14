# a refusal moves the writer to the new head — machine timing authors the relationship
p='lib/writersStudio/editorialWorkspace.ts'
s=open(p).read()
old="""  return {
    refocusTo: null,
    rereadWriteState: false,
    rereadLineage: true,
    keepComposerTarget: true,
  };"""
new="""  return {
    refocusTo: outcome.reason === 'not_successor_of_head' ? 'HEAD' : null,
    rereadWriteState: true,
    rereadLineage: true,
    keepComposerTarget: false,
  };"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
