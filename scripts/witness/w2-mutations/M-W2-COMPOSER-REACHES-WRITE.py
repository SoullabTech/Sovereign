# the composer acquires an authorization/execute path of its own
p='app/writers-studio/VersionComposer.tsx'
s=open(p).read()
old="    if (!r.ok) setRefusal(r.reason);"
new="""    if (!r.ok) setRefusal(r.reason);
    else await fetch(`/api/writers-studio/revision-authorizations/${target.versionId}/execute`,
      { method: 'POST' });"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
