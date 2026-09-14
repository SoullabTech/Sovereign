# the store auto-retries a stale predecessor against the newer head
p='lib/manuscript/proposalChain/store.ts'
s=open(p).read()
old="    const lawful = appendVersion(chain, versions, provisional);\n    if (!lawful.ok) return refuse(lawful.reason);"
new="""    let lawful = appendVersion(chain, versions, provisional);
    if (!lawful.ok && lawful.reason === 'not_successor_of_head') {
      const head = versions.find((x) => !versions.some((y) => y.supersedes === x.id));
      lawful = appendVersion(chain, versions, { ...provisional, supersedes: head?.id ?? null });
    }
    if (!lawful.ok) return refuse(lawful.reason);"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
