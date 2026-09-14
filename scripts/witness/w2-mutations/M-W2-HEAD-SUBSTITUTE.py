# the store replaces the author's supplied predecessor with the current head.
# ⛔ This is the merge-blocker the founder caught earlier, reinstated: lock
# acquisition invents history and the durable record says B revised A when B
# never saw A.
p='lib/manuscript/proposalChain/store.ts'
s=open(p).read()
old="      supersedes: input.supersedes,"
new="      supersedes: versions.length === 0 ? null\n        : (versions.find((x) => !versions.some((y) => y.supersedes === x.id))?.id ?? null),"
assert old in s; open(p,'w').write(s.replace(old,new,1))
