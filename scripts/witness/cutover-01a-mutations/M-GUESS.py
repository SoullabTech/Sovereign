p='lib/manuscript/proposalChain/proposalWorkTarget.ts'
s=open(p).read()
old="  if (n > 1) return { located: false, reason: 'expected_text_ambiguous' };"
new="  /* mutant: pick the first of several */"
assert old in s; open(p,'w').write(s.replace(old,new,1))
