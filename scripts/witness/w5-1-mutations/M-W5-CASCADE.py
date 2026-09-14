# deleting the conversation erases the authored lineage
p='lib/manuscript/editorialWorkspace/ontology.ts'
s=open(p).read()
old="  threadDeletionTouchesChain: false,\n  threadDeletionTouchesVersions: false,"
new="  threadDeletionTouchesChain: true,\n  threadDeletionTouchesVersions: true,"
assert old in s; open(p,'w').write(s.replace(old,new,1))
