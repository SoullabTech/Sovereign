#!/usr/bin/env python3
"""PHASE-1-WHOLE-ORGANISM-CENSUS-01 · P1-04 regeneration instrument.

READ-ONLY. Parses the P1-03 register (221 normalized rows across three slices, in three
different renderings of one identical schema) and prints the counts and edge sets the four
sparse graphs are assembled from.

It exists so the P1-04 stop condition is checkable: the graphs must be regenerable from the
preserved records. It writes nothing, and it deliberately does NOT normalize the renderings —
rendering difference is not semantic difference, and P1-03's rows are preserved as authored.

Declared filter (see G2 §4): the token pattern `F-nn` matches domain-F row labels, not
cognition families, and is excluded from the family tally. An undeclared filter would be an
undeclared inference.

Usage:  python3 scripts/census/p1_04_read_register.py
"""
import os, re, sys, collections

REG = "docs/programme/PHASE-1-WHOLE-ORGANISM-CENSUS-01_P1-03"
FIELDS = ['DOMAIN', 'NAMED OBJECT', 'ARTIFACT', 'STATUS', 'ALTITUDE', 'COVERAGE', 'LADDER',
          'GOVERNANCE GATE', 'GOVERNING SOURCE', 'SOURCE RECORD']
ROW = re.compile(r'(?m)^(?:ROW ID\s+|### )(P3-[A-I]-\d+)')
RUNGS = ['HAS AUTHORITY', 'DECIDES', 'CONTRIBUTES', 'CONSIDERS', 'KNOWS', 'PARTICIPATES', 'EXISTS']
STATUSES = ['LIVE', 'PARTIAL', 'OBSERVATION-ONLY', 'WIRED-BUT-UNOBSERVED', 'DORMANT',
            'ORPHANED', 'BLOCKED', 'SUPERSEDED', 'DOCUMENTATION-ONLY', 'UNKNOWN']
FAMILY = re.compile(r'\bF-[A-Z0-9]+(?:-[A-Z0-9]+)*\b')
ROWLABEL = re.compile(r'^F-\d{2}$')
QUALIFIED = re.compile(r'no implementing|unimplemented|does not contain|'
                       r'declares it has no runtime authority|NOT located|carry no status|'
                       r'exists only as|not read by', re.I)


def lead(v):
    return re.sub(r'^[^A-Za-z]+', '', v).upper()


def parse():
    rows = []
    for fn in sorted(os.listdir(REG)):
        if not fn.endswith('.md'):
            continue
        txt = open(os.path.join(REG, fn), encoding='utf-8').read()
        marks = list(ROW.finditer(txt))
        for i, m in enumerate(marks):
            end = marks[i + 1].start() if i + 1 < len(marks) else len(txt)
            blk = txt[m.start():end].replace('**', '')
            blk = re.sub(r'(?m)^```.*$', '', blk)
            blk = re.sub(r'(?m)^-\s+', '', blk)
            stream = re.sub(r'\s*·\s*(?=[A-Z][A-Z ,/]{2,}\s)', ' \n', blk)
            rec = {'row': m.group(1), 'slice': fn, 'domain': m.group(1).split('-')[1]}
            for f in FIELDS:
                pat = (r'(?m)^\s*' + re.escape(f) + r'\s{1,}(.+?)(?=\n\s*(?:'
                       + '|'.join(re.escape(x) for x in FIELDS) + r')\s|\n\s*\n|\Z)')
                mm = re.search(pat, stream, re.S)
                if mm:
                    rec[f.lower().replace(' ', '_')] = ' '.join(mm.group(1).split())
            rows.append(rec)
    return rows


def ladder(r):
    core = re.sub(r'\[[^\]]*\]|\([^)]*\)', '', r.get('ladder', ''))
    core = lead(re.sub(r'—.*$', '', core))
    if core.startswith('NOT DETERMINED') or core.startswith('NOT APPLICABLE'):
        return None
    return next((g for g in RUNGS if core.startswith(g)), None)


def gate(r):
    u = lead(r.get('governance_gate', ''))
    for key, pat in [('NONE FOUND', r'NONE FOUND'), ('PRESENT', r'PRESENT'),
                     ('PARTIAL', r'(PARTIAL|QUALIFIED|DEFEATED)'),
                     ('NOT APPLICABLE', r'NOT APPLICABLE'), ('CI-GATED ONLY', r'CI-GATED'),
                     ('NOT DETERMINED', r'NOT DETERMINED')]:
        if re.match(r'\s*' + pat, u):
            return key
    for key in ('NONE FOUND', 'NOT APPLICABLE', 'NOT DETERMINED'):
        if key in u:
            return key
    return 'NAMED-QUALIFIED'


def gsrc(r):
    u = lead(r.get('governing_source', ''))
    if 'NONE LOCATED' in u or re.match(r'\s*NOT LOCATED', u):
        return 'NONE LOCATED'
    if re.match(r'\s*NOT DETERMINED', u):
        return 'NOT DETERMINED'
    return 'LOCATED'


def main():
    rows = parse()
    print(f"rows parsed: {len(rows)}  (expected 221)")
    print("per domain:", dict(sorted(collections.Counter(r['domain'] for r in rows).items())))
    missing = {f.lower().replace(' ', '_'): sum(1 for r in rows if not r.get(f.lower().replace(' ', '_')))
               for f in FIELDS[1:]}
    print("rows missing a schema field:", missing, "  (INF-5 zero-blank COVERAGE is part of this)")

    st = collections.Counter()
    for r in rows:
        hits = [k for k in STATUSES if k in lead(r.get('status', ''))]
        for k in hits:
            st[k] += 1
        if not hits:
            st['NO STATUS WORD'] += 1
    print("\nG1 STATUS tokens:", st.most_common())
    alt = collections.Counter()
    for r in rows:
        for t in ['EXISTS', 'WIRED', 'RUNTIME-GATED', 'CI-GATED', 'CONFIG-SELECTED', 'OBSERVED', 'GOVERNED']:
            if re.search(r'\b' + t + r'\b', r.get('altitude', '').upper()):
                alt[t] += 1
    print("G1 ALTITUDE tokens:", alt.most_common())

    rungs = [(r['row'], ladder(r)) for r in rows if ladder(r)]
    print(f"\nG2 rung edges: {len(rungs)}  ", collections.Counter(v for _, v in rungs).most_common())
    unlocated = [rid for rid, _ in rungs if gsrc(next(r for r in rows if r['row'] == rid)) == 'NONE LOCATED']
    print(f"G2 E2 finding — rung-bearing rows whose GOVERNING SOURCE is NONE LOCATED: "
          f"{len(unlocated)} of {len(rungs)}")
    fam = collections.Counter()
    for r in rows:
        for t in set(FAMILY.findall(r.get('coverage', ''))):
            if not ROWLABEL.match(t):
                fam[t] += 1
    print(f"G2 COVERS — families named: {len(fam)}", fam.most_common(6), "...")

    print("\nG3 GATE:", collections.Counter(gate(r) for r in rows).most_common())
    print("G3 GOVERNING SOURCE:", collections.Counter(gsrc(r) for r in rows).most_common())
    nq = sum(1 for r in rows if gsrc(r) == 'LOCATED' and QUALIFIED.search(r.get('governing_source', '')))
    print(f"G3 NAMES-WITHOUT-IMPLEMENTING: {nq}   GOVERNS (unqualified): "
          f"{sum(1 for r in rows if gsrc(r) == 'LOCATED') - nq}")

    files = collections.defaultdict(set)
    for r in rows:
        for f in set(re.findall(r'[\w./\[\]@-]+\.(?:ts|tsx|sql|json|md|sh)', r.get('artifact', ''))):
            files[f].add(r['row'])
    multi = {f: rs for f, rs in files.items() if len(rs) > 1}
    cross = {f: rs for f, rs in multi.items() if len({x.split('-')[1] for x in rs}) > 1}
    print(f"\nG1 co-location: {len(files)} distinct artifact files · {len(multi)} named by >1 row "
          f"· {len(cross)} named across >1 domain (the edge set)")
    return 0


if __name__ == '__main__':
    sys.exit(main())
