# remove the draft lock: the concurrent pair no longer serializes
p='lib/manuscript/revisionAuthorization/store.ts'
s=open(p).read()
old="""      WHERE id = $1 AND manuscript_id = $2 AND member_id = $3 FOR UPDATE`,"""
new="""      WHERE id = $1 AND manuscript_id = $2 AND member_id = $3`,"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
