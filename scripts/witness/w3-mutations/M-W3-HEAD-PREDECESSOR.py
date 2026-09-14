# the composer's predecessor becomes the head rather than the focused version
p='app/writers-studio/EditorialWorkspace.tsx'
s=open(p).read()
old="  const idx = chain.versions.findIndex((v) => v.id === chain.focusedVersionId);"
new="  const idx = chain.versions.length - 1;"
assert old in s; open(p,'w').write(s.replace(old,new,1))
