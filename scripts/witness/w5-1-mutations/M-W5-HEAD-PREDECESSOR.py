# the W5-1.1 defect: the contract consults a head instead of returning the
# predecessor the author acted against — machine timing authors the relationship
p='lib/manuscript/editorialWorkspace/ontology.ts'
s=open(p).read()
old="""export function successionPredecessor(
  authoredAgainstVersionId: string | null,
  _conversationalReference: string | null,
): string | null {"""
new="""export function successionPredecessor(
  authoredAgainstVersionId: string | null,
  _conversationalReference: string | null,
  currentHeadVersionId?: string | null,
): string | null {
  if (arguments.length >= 0) return currentHeadVersionId ?? null;"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
