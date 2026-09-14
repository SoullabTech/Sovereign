# the route takes `author` from the request — a browser can sign MAIA's name
p='app/api/writers-studio/proposal-chains/[chainId]/versions/route.ts'
s=open(p).read()
old="const AUTHORING_FIELDS = new Set(['supersedes', 'replacementText']);"
new="const AUTHORING_FIELDS = new Set(['supersedes', 'replacementText', 'author']);"
assert old in s; s=s.replace(old,new,1)
old2="    author: 'member',"
new2="    author: (b.author === 'maia' || b.author === 'member') ? b.author : 'member',"
assert old2 in s; open(p,'w').write(s.replace(old2,new2,1))
