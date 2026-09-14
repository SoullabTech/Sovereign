# an unknown field is silently ignored: the caller believes it authored a
# rationale or a Direction and the server discarded it
p='app/api/writers-studio/proposal-chains/[chainId]/versions/route.ts'
s=open(p).read()
old="""  const unknown = Object.keys(b).filter((k) => !AUTHORING_FIELDS.has(k));
  if (unknown.length > 0) {
    return NextResponse.json({ error: 'unknown_field', fields: unknown }, { status: 400 });
  }"""
new="  /* mutant: unknown fields silently ignored */"
assert old in s; open(p,'w').write(s.replace(old,new,1))
