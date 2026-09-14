# splice the POST response into the visible thread instead of rereading
p='app/writers-studio/EditorialWorkspace.tsx'
s=open(p).read()
old="        const { id } = (await res.json()) as { id: string };"
new="""        const v = (await res.json()) as { id: string; author: 'maia' | 'member';
          supersedes: string | null; replacementText: string; authoredAt: string };
        setChain((c) => (c ? { ...c, versions: c.versions.concat(v) } : c));
        const id = v.id;"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
