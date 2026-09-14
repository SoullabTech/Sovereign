# the editorial parent is omitted from the thread freeze
p='database/migrations/20260914000005_editorial_ontology.sql'
s=open(p).read()
old="""     OR NEW.initiated_by IS DISTINCT FROM OLD.initiated_by
     OR NEW.proposal_chain_id IS DISTINCT FROM OLD.proposal_chain_id THEN"""
new="""     OR NEW.initiated_by IS DISTINCT FROM OLD.initiated_by THEN"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
