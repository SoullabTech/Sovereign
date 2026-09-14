# the legacy panel coexists with the new workspace for the same visit
p='app/writers-studio/canvas/page.tsx'
s=open(p).read()
old = "subject?.kind === 'chain' ? ("
new = "subject?.kind === 'never' ? ("
assert s.count(old) == 2
open(p,'w').write(s.replace(old,new))
