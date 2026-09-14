# the quiet unbinding: the relationship can disappear through FK lifecycle.
# ⭐ Column-targeted SET NULL is the form that actually works on a 3-column FK —
# a bare SET NULL would collide with the NOT NULLs, which is why the design
# refused it on MEANING and not on mechanics.
p='database/migrations/20260914000005_editorial_ontology.sql'
s=open(p).read()
old="      ON UPDATE RESTRICT\n      ON DELETE RESTRICT;"
new="      ON UPDATE RESTRICT\n      ON DELETE SET NULL (proposal_chain_id);"
assert old in s; open(p,'w').write(s.replace(old,new,1))
