p='app/api/sovereign/manuscripts/[id]/write-state/route.ts'
s=open(p).read()
old="        target = r.ok ? r.target : null;"
new="        target = r.ok && r.target.location.located ? r.target : null;"
assert old in s; open(p,'w').write(s.replace(old,new,1))
