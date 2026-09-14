p='lib/manuscript/proposalChain/proposalWork.ts'
s=open(p).read()
old="  if (focusVersionId && !focused) return { ok: false, reason: 'version_unknown' };"
new="  const safe = focused ?? ordered[ordered.length - 1] ?? null;\n  return { ok: true, work: { chain, versions: ordered, focused: safe } };"
assert old in s; open(p,'w').write(s.replace(old,new,1))
