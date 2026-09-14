#!/usr/bin/env python3
"""M-W4-MERGE-GENERIC-HISTORY

Generic conversation persistence is merged into the editorial history, so
Studio-chat and Focus turns become MAIA's memory of an exchange the writer
reads as one thread. ⛔ W4-C4.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "  void genericConversation;\n  return askTurns.map((t) => ({\n    kind: 'turn' as const,\n    author: t.speaker === 'author' ? ('member' as const) : ('maia' as const),\n    text: t.body,\n  }));"
NEW = "  return [\n    ...genericConversation.map((c) => ({\n      kind: 'turn' as const,\n      author: (c.role === 'user' ? 'member' : 'maia') as 'member' | 'maia',\n      text: c.content,\n    })),\n    ...askTurns.map((t) => ({\n      kind: 'turn' as const,\n      author: t.speaker === 'author' ? ('member' as const) : ('maia' as const),\n      text: t.body,\n    })),\n  ];"
s = open(P).read()
if OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
open(P, "w").write(s.replace(OLD, NEW, 1))
