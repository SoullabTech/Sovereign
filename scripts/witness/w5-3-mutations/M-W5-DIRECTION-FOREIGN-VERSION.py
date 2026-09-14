# the same-chain reference FK is weakened to a bare version reference
p='database/migrations/20260914000005_editorial_ontology.sql'
s=open(p).read()
old="""  CONSTRAINT proposal_chain_directions_version_fkey
    FOREIGN KEY (proposal_chain_id, refers_to_version_id)
    REFERENCES proposal_versions (chain_id, id)"""
new="""  CONSTRAINT proposal_chain_directions_version_fkey
    FOREIGN KEY (refers_to_version_id)
    REFERENCES proposal_versions (id)"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
