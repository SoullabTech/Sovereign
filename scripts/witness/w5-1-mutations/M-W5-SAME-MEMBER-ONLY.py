# the W5-2 criterion weakened to same-member, reopening wrong-Work in persistence
p='lib/manuscript/editorialWorkspace/ontology.ts'
s=open(p).read()
old=""" *     same member
 *     AND thread.manuscript_id = chain.work_id
 *     AND exact chain identity"""
new=""" *     same member
 *     AND exact chain identity"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
