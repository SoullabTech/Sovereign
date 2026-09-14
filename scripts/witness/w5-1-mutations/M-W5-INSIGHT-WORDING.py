# Insight acquires candidate wording — a Suggestion wearing another name
p='lib/manuscript/editorialWorkspace/ontology.ts'
s=open(p).read()
old="  readonly observation: string;"
new="  readonly observation: string;\n  readonly replacementText?: string;"
assert old in s; s=s.replace(old,new,1)
old2="""const insight: EditorialInsight = {"""
open(p,'w').write(s)
# and make the test fixture carry it, so the ban is actually exercised
t='lib/manuscript/editorialWorkspace/__tests__/ontology.test.ts'
ts=open(t).read()
assert old2 in ts
ts=ts.replace("  observation: 'The paragraph above already carries the developmental movement.',",
  "  observation: 'The paragraph above already carries the developmental movement.',\n  replacementText: ', held',",1)
open(t,'w').write(ts)
