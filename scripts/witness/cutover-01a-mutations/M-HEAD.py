p='lib/manuscript/proposalChain/proposalWorkTarget.ts'
s=open(p).read()
old="    replacementText: focused.replacementText,"
new="    replacementText: work.versions[work.versions.length - 1].replacementText,"
assert old in s; open(p,'w').write(s.replace(old,new,1))
