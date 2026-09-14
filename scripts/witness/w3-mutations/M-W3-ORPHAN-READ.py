# the W3.1 defect exactly: a successful append launches its own write-state read
# with the OLD captured selector, racing the governed read for the new subject.
p='lib/writersStudio/editorialWorkspace.ts'
s=open(p).read()
old="""      rereadWriteState: false,
      rereadLineage: false,"""
new="""      rereadWriteState: true,
      rereadLineage: true,"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
