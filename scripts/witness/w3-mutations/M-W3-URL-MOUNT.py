# mount from the raw URL identity, above the server's Work-namespace binding
p='app/writers-studio/canvas/page.tsx'
s=open(p).read()
old="  const subject = workspaceSubject(engine?.target);"
new="""  const subject = proposalFocus
    ? { kind: 'chain' as const, chainId: proposalFocus.chainId,
        versionId: proposalFocus.versionId, located: true }
    : workspaceSubject(engine?.target);"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
