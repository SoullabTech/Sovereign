# OPS-DT / USC evidence records

Durable proof output. A terminal paste is transient and unbound to any commit;
a file here is evidence that can be cited months later.

**Every record must carry, before its report body:** capture time (UTC), the
OPS-DT script SHA that produced it, the canonical SHA the stack was built from,
the SHA the running container actually reports, the hostname, and the test
database identity.

Without those, a green report cannot be bound to a commit — the same failure
mode that made a `check_suite.completed` on a stale `head_sha` look like proof
for a newer head during PR #1093.

Naming: `OPS-DT-01-isolation-<UTC timestamp>.txt`
