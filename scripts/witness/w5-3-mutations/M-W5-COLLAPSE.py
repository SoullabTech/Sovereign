# candidate formulation arrives on an authored non-wording table
p='database/migrations/20260914000005_editorial_ontology.sql'
s=open(p).read()
old="  observation text NOT NULL CHECK (length(btrim(observation)) > 0),"
new="  observation text NOT NULL CHECK (length(btrim(observation)) > 0),\n  formulation text,"
assert old in s; open(p,'w').write(s.replace(old,new,1))
