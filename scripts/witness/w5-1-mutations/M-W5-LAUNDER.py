# the convenience adapter: the brand stops disqualifying an object, so an
# Insight with a replacementText bolted on becomes authorizable content
p='lib/manuscript/editorialWorkspace/ontology.ts'
s=open(p).read()
old="  if ('__notAuthorizable' in r) return false;"
new="  /* mutant: the brand no longer disqualifies */"
assert old in s; open(p,'w').write(s.replace(old,new,1))
