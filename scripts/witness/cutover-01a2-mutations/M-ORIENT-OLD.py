# the founder-caught defect: the room takes its bearings from the OLD preview
# object again, so a lawful chain/version target mounts but never orients.
p='app/writers-studio/canvas/page.tsx'
s=open(p).read()
old="  const proposalTarget = roomOrientation(engine?.target);"
new="""  const proposalTarget = proposed.mount.state === 'ready'
    && proposed.mount.preview.state === 'acceptable'
    ? proposed.mount.preview.change : null;"""
assert old in s; open(p,'w').write(s.replace(old,new,1))
