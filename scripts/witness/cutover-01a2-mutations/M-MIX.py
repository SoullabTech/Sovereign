# send both forms in one request — ask the server to choose
p='lib/writersStudio/writeStateClient.ts'
s=open(p).read()
old="""      : selector.kind === 'chain_version'
        ? `?${CANVAS_PROPOSAL_CHAIN_PARAM}=${encodeURIComponent(selector.chainId)}`
          + `&${CANVAS_PROPOSAL_VERSION_PARAM}=${encodeURIComponent(selector.versionId)}`"""
new="""      : selector.kind === 'chain_version'
        ? `?${CANVAS_PROPOSAL_CHAIN_PARAM}=${encodeURIComponent(selector.chainId)}`
          + `&${CANVAS_PROPOSAL_VERSION_PARAM}=${encodeURIComponent(selector.versionId)}`
          + `&${CANVAS_PROPOSAL_PARAM}=old-proposal-1`"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
