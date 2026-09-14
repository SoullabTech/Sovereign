# remove the partial unique index (the schema floor)
p='database/migrations/20260914000004_manuscript_revision_authorizations.sql'
s=open(p).read()
old="""CREATE UNIQUE INDEX IF NOT EXISTS uq_mra_one_unspent_permission
  ON manuscript_revision_authorizations
     (member_id, proposal_chain_id, proposal_version_id, base_version)
  WHERE accepted_at IS NULL;"""
assert old in s; open(p,'w').write(s.replace(old,"-- mutant: no uniqueness floor",1))
