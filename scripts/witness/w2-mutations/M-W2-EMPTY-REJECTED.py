# the route truthiness-checks replacementText, so a deletion cannot be authored
p='app/api/writers-studio/proposal-chains/[chainId]/versions/route.ts'
s=open(p).read()
old="  if (typeof b.replacementText !== 'string') {"
new="  if (typeof b.replacementText !== 'string' || !b.replacementText) {"
assert old in s; open(p,'w').write(s.replace(old,new,1))
