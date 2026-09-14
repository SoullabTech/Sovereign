p='lib/manuscript/proposalChain/proposalWorkTarget.ts'
s=open(p).read()
old="  if (!r.ok) return { ok: false, reason: r.reason };"
new="  if (!r.ok) return { ok: false, reason: r.reason === 'chain_unknown' && chainId.length === 36 ? 'version_unknown' : r.reason };"
assert old in s; open(p,'w').write(s.replace(old,new,1))
