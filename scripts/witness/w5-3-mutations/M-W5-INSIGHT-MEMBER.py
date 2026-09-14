# the Insight author check admits a member
p='database/migrations/20260914000005_editorial_ontology.sql'
s=open(p).read()
old="  author text NOT NULL CHECK (author = 'maia'),"
new="  author text NOT NULL CHECK (author IN ('maia', 'member')),"
assert old in s; open(p,'w').write(s.replace(old,new,1))
