# remove the existing-unspent lookup: every act mints a new permission
p='lib/manuscript/revisionAuthorization/store.ts'
s=open(p).read()
old="    if (existing.rows.length > 0) {"
new="    if (false && existing.rows.length > 0) {"
assert old in s; open(p,'w').write(s.replace(old,new,1))
