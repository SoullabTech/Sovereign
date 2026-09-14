# MATCH FULL rejects a partially-NULL key, so every unbound thread dies
p='database/migrations/20260914000005_editorial_ontology.sql'
s=open(p).read()
old="""      REFERENCES proposal_chains (member_id, work_id, id)
      MATCH SIMPLE"""
new="""      REFERENCES proposal_chains (member_id, work_id, id)
      MATCH FULL"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
