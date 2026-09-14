# a conversational reference becomes the succession predecessor
p='lib/manuscript/editorialWorkspace/ontology.ts'
s=open(p).read()
old="  return headVersionId;\n}"
new="  return _conversationalReference ?? headVersionId;\n}"
assert old in s; open(p,'w').write(s.replace(old,new,1))
