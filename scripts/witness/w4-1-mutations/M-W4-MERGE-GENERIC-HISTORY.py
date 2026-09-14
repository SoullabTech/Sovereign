#!/usr/bin/env python3
"""M-W4-MERGE-GENERIC-HISTORY

Generic conversation persistence is merged into the editorial history, so
Studio-chat and Focus turns become MAIA's memory of an exchange the writer
reads as one thread. ⛔ W4-C4.

⚠️ RE-AIMED AT W4-1.1: the mapping now carries `turnIndex` and `body`.
"""
import sys
P = 'lib/manuscript/editorialDiscourse/contract.ts'
OLD = "  void genericConversation;\n  return askTurns.map((t) => ({\n    kind: 'turn' as const,"
NEW = "  return [\n    ...genericConversation.map((c, i) => ({\n      kind: 'turn' as const,\n      turnIndex: -1000 + i,\n      author: (c.role === 'user' ? 'member' : 'maia') as 'member' | 'maia',\n      body: c.content,\n    })),\n    ...askTurns.map((t) => ({\n    kind: 'turn' as const,"
TAIL_OLD = """    author: t.speaker === 'author' ? ('member' as const) : ('maia' as const),
    body: t.body,
  }));
}"""
TAIL_NEW = """    author: t.speaker === 'author' ? ('member' as const) : ('maia' as const),
    body: t.body,
  }))];
}"""
s = open(P).read()
if OLD not in s or TAIL_OLD not in s:
    sys.stderr.write("STALE: anchor not found in %s\n" % P)
    sys.exit(3)
s = s.replace(OLD, NEW, 1).replace(TAIL_OLD, TAIL_NEW, 1)
open(P, "w").write(s)
