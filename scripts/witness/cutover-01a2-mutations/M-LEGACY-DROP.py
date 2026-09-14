# the exact defect founder-caught in 6fc919f7d: the legacy selector stops travelling
p='lib/writersStudio/writeStateClient.ts'
s=open(p).read()
old="        : `?${CANVAS_PROPOSAL_PARAM}=${encodeURIComponent(selector.proposalId)}`;"
new="        : '';"
assert old in s; open(p,'w').write(s.replace(old,new,1))
