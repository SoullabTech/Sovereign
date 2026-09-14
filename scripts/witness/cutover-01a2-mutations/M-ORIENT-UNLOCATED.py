# orient on a target whose place we could not find — motion without evidence.
# ⭐ It mutates the LAW's one home, which is the point: the witness imports that
# function instead of carrying a private copy, so the mutant is now reachable.
p='lib/writersStudio/writeStateClient.ts'
s=open(p).read()
old="""  const range = markableRange(target);
  return range ? { sectionId: target.sectionId, range } : null;"""
new="""  const range = markableRange(target);
  return { sectionId: target.sectionId,
    range: range ?? { space: 'projected_section_body' as const, start: 0, end: 1 } };"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
