p='lib/manuscript/proposalChain/proposalWorkTarget.ts'
s=open(p).read()
old="  readonly location: ProposalWorkLocation;\n}"
new="  readonly location: ProposalWorkLocation;\n  readonly mayAccept?: boolean;\n}"
assert old in s
s=s.replace(old,new,1)
old2="    location: locateInWork(work, sections),"
new2="    location: locateInWork(work, sections),\n    mayAccept: true,"
assert old2 in s; open(p,'w').write(s.replace(old2,new2,1))
