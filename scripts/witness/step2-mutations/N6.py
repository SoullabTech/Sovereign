# The status read distinguishes foreign from unknown.
s = s.replace(
    "    if (a.rows.length === 0) return null;",
    "    if (a.rows.length === 0) {\n"
    "      const any = await tx.query('SELECT 1 FROM manuscript_revision_authorizations WHERE id = $1', [authorizationId]);\n"
    "      return any.rows.length > 0 ? ({ state: 'work_unreadable' } as never) : null;\n"
    "    }")
