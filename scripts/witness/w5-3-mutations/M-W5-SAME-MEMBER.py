# the discourse FK proves only same-member, dropping the Work
p='database/migrations/20260914000005_editorial_ontology.sql'
s=open(p).read()
old="""      FOREIGN KEY (member_id, manuscript_id, proposal_chain_id)
      REFERENCES proposal_chains (member_id, work_id, id)"""
new="""      FOREIGN KEY (member_id, proposal_chain_id)
      REFERENCES proposal_chains (member_id, id)"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
