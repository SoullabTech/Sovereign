# the thread's baseline is forced to equal the chain's
p='lib/manuscript/editorialWorkspace/ontology.ts'
s=open(p).read()
old="  mustBeEqual: false,\n  mayBeCopied: false,"
new="  mustBeEqual: true,\n  mayBeCopied: true,"
assert old in s; open(p,'w').write(s.replace(old,new,1))
