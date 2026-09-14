# omit base_version from the lookup: a stale permission defeats a lawful new one
p='lib/manuscript/revisionAuthorization/store.ts'
s=open(p).read()
old="""          AND proposal_version_id = $3 AND base_version = $4
          AND accepted_at IS NULL`,"""
new="""          AND proposal_version_id = $3 AND $4 IS NOT NULL
          AND accepted_at IS NULL`,"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
