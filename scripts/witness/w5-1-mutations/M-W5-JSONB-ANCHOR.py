# the refused disposition: chain identity carried as a JSONB anchor member
p='lib/manuscript/editorialWorkspace/ontology.ts'
s=open(p).read()
old="export interface DiscourseBinding {"
new="""export type ChainAnchor = { on: 'proposal_chain'; chainId: string };

export interface DiscourseBinding {"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
