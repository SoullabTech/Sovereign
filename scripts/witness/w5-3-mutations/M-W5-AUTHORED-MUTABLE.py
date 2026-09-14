# the immutability triggers are removed from ONE authored table
p='database/migrations/20260914000005_editorial_ontology.sql'
s=open(p).read()
old="""DROP TRIGGER IF EXISTS proposal_chain_directions_no_update ON proposal_chain_directions;
CREATE TRIGGER proposal_chain_directions_no_update
  BEFORE UPDATE ON proposal_chain_directions
  FOR EACH ROW EXECUTE FUNCTION authored_editorial_record_immutable();"""
assert old in s; open(p,'w').write(s.replace(old,"-- mutant: Direction is rewritable",1))
