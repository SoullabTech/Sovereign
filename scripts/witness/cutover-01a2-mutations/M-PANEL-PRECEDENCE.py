# the exact 45cb0ec33 regression: the room reads the raw legacy parameter again,
# so a chain/version visit still mounts the old panel and its Accept Changes.
p='app/writers-studio/canvas/page.tsx'
s=open(p).read()
old="  const proposed = useProposedChange(legacyProposalFor(selector));"
new="  const proposed = useProposedChange(rawLegacyProposalId);"
assert old in s; open(p,'w').write(s.replace(old,new,1))
