# the withdrawn claim returns to the Direction prose, above the function that
# forbids it — the paragraph a schema designer would read first
p='lib/manuscript/editorialWorkspace/ontology.ts'
s=open(p).read()
old=""" * reference is NOT a succession: a later candidate carries THE PREDECESSOR THE
 * AUTHOR ACTED AGAINST, and persistence judges whether that predecessor is
 * still lawful."""
new=""" * reference is NOT a succession: a later candidate still supersedes the head."""
assert old in s; open(p,'w').write(s.replace(old,new,1))
