#!/usr/bin/env python3
"""Build the canonical quotation register for Elemental Alchemy.

Creates one first-class record per quotation OCCURRENCE. Does not change the
manuscript. Display form is recorded as data so rhetorical typography is
preserved rather than normalised away.

Stable identity: EA-Q-<hash8> where hash8 is derived from the normalised
quotation text plus an occurrence ordinal. Line numbers shift; ids do not.
"""
import hashlib, json, re, sys, unicodedata
from pathlib import Path

MS = Path(__file__).resolve().parents[1] / "ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md"
OUT = Path(__file__).resolve().parent / "register.json"

NAME = r"(?:the Buddha|Lao Tzu|Hermes Trismegistus|[A-Z][\w.'’-]+(?:\s+(?:of|de|van|der|von|the)\s+)?(?:\s+[A-Z][\w.'’-]+){0,3})"
VERB = r"(?:said|says|wrote|writes|reminds us|advises|taught|teaches|proclaimed|noted|observed|put it|quoted as saying|articulated|intuited)"

LEAD = re.compile(r"(?:As\s+)?(" + NAME + r")\s+(?:once\s+|is\s+)?" + VERB + r"\b[^\"*]{0,60}$")
TRAIL = re.compile(r"^\s*,?\s*(?:as\s+)?" + VERB + r"\s+(" + NAME + r")")
TRAIL2 = re.compile(r"^\s*,?\s*as\s+(" + NAME + r")\s+" + VERB)
INTERRUPT = re.compile(r"^\s*,?\s*(" + NAME + r")\s+" + VERB)
POSSESSIVE = re.compile(r"(?:In (?:your|his|her|their) words)[,:]?\s*$", re.I)
ANON = re.compile(r"(There is a saying|It is said|As it is said|The\s+\w+\s+admonition)[,:]?\s*$", re.I)


BOUNDARY = {519, 1686}   # unattributed quoted spans awaiting a scope ruling


def norm(t):
    t = unicodedata.normalize("NFKD", t)
    t = re.sub(r"[‘’']", "'", t)
    t = re.sub(r"[“”]", '"', t)
    t = re.sub(r"[—–-]+", "-", t)
    return re.sub(r"[^a-z0-9 ]", "", t.lower()).strip()


def qid(text, ordinal):
    h = hashlib.sha256((norm(text) + f"#{ordinal}").encode()).hexdigest()[:8]
    return f"EA-Q-{h}"


def build():
    lines = MS.read_text().split("\n")
    chapter = section = None
    seen, records = {}, []

    for i, raw in enumerate(lines, start=1):
        line = raw.rstrip()
        if line.startswith("# "):
            chapter, section = line[2:].strip(), None
            continue
        if line.startswith("#"):
            section = line.lstrip("#").strip()
            continue
        if not line.strip() or line.strip().startswith("- "):
            continue

        found = []  # (text, display_form, attributed_raw)

        if line.startswith('*"'):
            m = re.match(r'\*"(.+?)"\s*[—–-]?\s*(.*?)\*+\s*$', line)
            if m:
                found.append((m.group(1), "block_epigraph", m.group(2).strip()))
            else:
                m2 = re.match(r'\*"(.+)"\*\s*$', line)
                if m2:
                    found.append((m2.group(1), "block_epigraph", ""))
        else:
            for m in re.finditer(r'\*"([^"]{10,})"([^*]{0,60})\*', line):
                if m.start() == 0:
                    continue
                attr = m.group(2).strip(" —–-,")
                if not attr:
                    lead = LEAD.search(line[: m.start() + 2])
                    attr = lead.group(1) if lead else ""
                found.append((m.group(1), "inline_emphasised", attr))
            for m in re.finditer(r'(?<!\*)"([^"*\n]{20,})"(?!\*)', line):
                before, after = line[: m.start()], line[m.end():]
                attr, form = "", None
                lead = LEAD.search(before[-160:])
                if lead:
                    attr, form = lead.group(1), "inline_plain_lead"
                if not attr:
                    inter = re.search(r"(" + NAME + r")\s+" + VERB + r"[,:]?\s*$", before[-60:])
                    if inter and '"' in before:
                        attr, form = inter.group(1), "inline_interrupted"
                if not attr:
                    for rx, f in ((TRAIL2, "inline_plain_trailing"),
                                  (TRAIL, "inline_plain_trailing"),
                                  (INTERRUPT, "inline_interrupted")):
                        t = rx.match(after)
                        if t:
                            attr, form = t.group(1), f
                            break
                if not attr and ANON.search(before[-90:]):
                    form = "inline_anonymous_attribution"
                if not attr and form is None and POSSESSIVE.search(before[-40:]):
                    form = "inline_personal_communication"
                if form is None and i in BOUNDARY:
                    form = "inline_unattributed"
                if form is None:
                    continue
                found.append((m.group(1), form, attr))

        for text, form, attr in found:
            key = norm(text)
            seen[key] = seen.get(key, 0) + 1
            records.append({
                "id": qid(text, seen[key]),
                "occurrence": seen[key],
                "text": text,
                "line_at_build": i,
                "chapter": chapter,
                "section": section,
                "display_form": form,
                "attributed_as": attr or None,
                "attribution_state": "attributed" if attr else (
                    "attribution_anonymous" if form == "inline_anonymous_attribution" else "unattributed"),
                "actual_author": None,
                "internal_speaker": None,
                "work": None,
                "translator_or_mediator": None,
                "provenance_status": "not_yet_recorded",
                "rights_status": "not_yet_recorded",
                "bibliography_relationship": "not_yet_recorded",
                "family": None,
                "editorial_status": "unadjudicated",
                "notes": None,
            })
    return records


def reconcile(records):
    """Report quotation-like spans in the manuscript that have no record."""
    recorded = {(r["line_at_build"], norm(r["text"])) for r in records}
    orphans = []
    for i, line in enumerate(MS.read_text().split("\n"), start=1):
        if line.startswith("#") or not line.strip() or line.strip().startswith("- "):
            continue
        for m in re.finditer(r'"([^"\n]{20,})"', line):
            if (i, norm(m.group(1))) not in recorded:
                orphans.append({"line": i, "text": m.group(1)[:90],
                                "context": line[max(0, m.start() - 70):m.start()].strip()[-70:]})
    return orphans


# Records the detector structurally cannot represent. The register is the
# authority; detection is only a bootstrap. An interrupted attribution splits the
# quotation across two spans with the attribution between them, which no
# quote-pairing pass can resolve — so it is asserted here, by hand, on purpose.
MANUAL = [{
    "id": "EA-Q-manual01", "occurrence": 1,
    "text": "And yet, ... at the heart of it all, you know.",
    "line_at_build": 1078, "chapter": None, "section": None,
    "display_form": "inline_interrupted",
    "attributed_as": "Lao Tzu", "attribution_state": "attributed",
    "actual_author": None, "internal_speaker": None, "work": None,
    "translator_or_mediator": None,
    "provenance_status": "not_yet_recorded",
    "rights_status": "not_yet_recorded",
    "bibliography_relationship": "not_yet_recorded",
    "family": None, "editorial_status": "unadjudicated",
    "notes": ("Interrupted attribution: quotation split across two spans with the "
              "attribution between them. Asserted manually - no detector can pair "
              "this. On inspection does not appear to be a Tao Te Ching passage; "
              "provenance check owed."),
}]

# Reconciler false positives: spans produced by quote-mark pairing across scare
# quotes and coinages. Not quotations; recorded so they are not rediscovered.
NOT_QUOTATIONS = {711, 1000, 1014, 1024, 1068, 1752, 1078}


if __name__ == "__main__":
    recs = build() + MANUAL
    orphans = [o for o in reconcile(recs) if o["line"] not in NOT_QUOTATIONS]
    OUT.write_text(json.dumps({"records": recs, "unrecorded_spans": orphans}, indent=2, ensure_ascii=False))
    forms = {}
    for r in recs:
        forms[r["display_form"]] = forms.get(r["display_form"], 0) + 1
    print(f"records: {len(recs)}")
    for k, v in sorted(forms.items()):
        print(f"  {k:32s} {v}")
    print(f"unrecorded quotation-like spans: {len(orphans)}")
