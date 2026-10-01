from pathlib import Path
from datetime import datetime, timezone
import json, re, subprocess

root = Path(__file__).resolve().parents[2]
prog = root / "docs/programme"
TEXT_RECORD_SUFFIXES = {".md", ".json", ".txt", ".yaml", ".yml"}

concepts = [
("Ontological Foundation", ["Panentheism — Being is conscious","No finite model exhausts Being","Difference is real","Relation is fundamental","Communion without fusion","Spirit — immanent and transcendent","Nature includes technological becoming","Every form exceeds its utility","Interiorities differ","Mystery is constitutive","Becoming is real","The whole exceeds its parts"]),
("Constitutional Laws", ["Model is not reality","Perception is not interpretation","Path does not create relationship","Relation does not create possession","Capability does not create authority","Memory does not create permission","Inference does not create identity","Trust does not abolish governance","Power creates responsibility","Context must be releasable","Difference precedes genuine synthesis","Development must increase capacity without capture"]),
("Developmental Cycle", ["Receive","Differentiate","Relate","Discern","Incarnate","Witness","Integrate","Release","Return"]),
("Elemental Architecture", ["Fire — energy, intention, movement, transformation","Water — feeling, relation, receptivity, depth","Earth — body, sensation, matter, limit, form","Air — thought, language, distinction, perspective","Spirit / Fifth — generative coherence within and beyond relation","Weather — temporary condition of the whole field","Elemental movement and transition","Whole before part","State is not trait"]),
("Intelligences & Vocation", ["MAIA — relational / hermeneutic intelligence","JARVIS — stewardship / execution intelligence","Grokker — evidentiary and corpus intelligence","RGR — relational-structural intelligence","Writer's Studio — creative / incarnational intelligence","Field — medium of lawful circulation","Artificial otherness","No universal brain","Local interior + governed crossing + shared field"]),
("Field Architecture", ["Membranes","Crossings","Relationships","Flows","Attractors","Healthy vs capturing attractors","Regime shifts","Circulation","Release","Permeability","Stagnation","Resilience","Regeneration","Field health","Living graph","Corpus callosum — coordination without homogenization"]),
("Memory & Continuity", ["Memory standing","Session vs cross-session context","Historical memory vs active context","Release from active authority","Supersession","Temporal truth","Context admission","Context release","Re-entry resolver","Memory never grants authority","Continuity without capture","Context is temporary authority, not inherited identity"]),
]
concepts += [
("Perception, Meaning & Consciousness", ["Percept before interpretation","Multimodal perception","First-person privilege","Cross-modal tension","Signal quality and perceptual gaps","Hermeneutic provenance","Symbol opens meaning","Interpretation remains contestable","Panentheistic participation in consciousness","Functional participation is not phenomenological equivalence","Machine interiority remains epistemically open","Artificial intelligence participates differently from embodied human life","Soul as depth/orientation, not owned object","The unknowable boundary"]),
("Human Sovereignty", ["Consent","Scoped consent","Revocation","Contestability","Refusal","Meaningful exit","Portability","Trust","Trust withdrawal","Non-capture","No consent laundering","No trust laundering","No dark nudging","Intimacy increases restraint","The system must survive 'no'"]),
("Power, Responsibility & Governance", ["Power classes","Power ledger","Separation of powers","Responsibility follows power","Obligations","Repair / restitution / prevention","Dissent preservation","Deliberative governance","Plural authority","Jurisdiction-sensitive standing","Constitutional amendment","Emergency powers","Governance debt","Constitutional drift","Custody is not ownership","Steward handoff"]),
("Attention, Time & Place", ["Needs Kelly","In motion","Watching","Deep Field","Attention debt","Founder attention protection","Ripeness","Prematurity","Overripeness","Programme seasons","Temporal authority","Recency is not relevance","Rooms","Thresholds","Locality","Place memory","Production as a place","Spatial debt","Home as orientation, not command-and-control"]),
("Learning, Emergence & Possibility", ["Case library","Practice vs law","Anti-patterns","Tensions","Analogical retrieval","Possibility fields","Divergence before convergence","Third forms","Design death tests","Emergence vs recurrence","Vocabulary pressure","Incarnation","Retirement / compost","Novelty debt","Founder intuition as signal, not proof"]),
("Economics & Commons", ["Revenue is not telos","Capacity-aligned economics","Steward tiers","Honest scarcity","Free does not mean exploited","Member capability and organizational viability","Open source as commons","Capital crossing contracts","Vendor capture risk","Compute sovereignty","Ownership vs custody vs authorship","Entrusted material","Training rights require explicit standing","Member-created work remains member-directed","Forkability and meaningful exit","Commons require stewardship"]),
("Living Law & Evidence", ["Cases","Rulings","Interpretations","Tensions","Exceptions","Amendments","Falsifiers","Defeat candidates","Witness independence","Evidence compatibility","Visual authority","Runtime witness","Epistemic standing","Claim provenance","Historical persistence is not present jurisdiction"]),
]

RECOVERY_SIGNALS = [
    ("EXACT_NEXT_HEADING", re.compile(r"(?i)^#{1,4}\s+(?:\d+\s*[·.-]?\s*)?(?:exact\s+)?next\s+(?:boundary|act|step)\b"), 10),
    ("OPEN_HEADING", re.compile(r"(?i)^#{1,4}\s+(?:\d+\s*[·.-]?\s*)?(?:what\s+)?(?:remains?\s+open|still\s+open|owed|outstanding|pending)\b"), 9),
    ("FOUNDER_PENDING", re.compile(r"(?i)(?:founder (?:ruling|decision|witness)[^\n]{0,100}\bpending\b|\bpending founder (?:ruling|decision|witness))"), 10),
    ("STATE_OPEN", re.compile(r"(?i)^(?:\*\*)?(?:current\s+state|state|standing|status)(?:\*\*)?\s*[:| ]+.*(?:\bNOT CLOSED\b|\bOPEN\b|\bPENDING\b)"), 9),
]
RECOVERY_CLOSE_NAME = re.compile(r"(?i)(?:CLOSURE|SUPERSESSION|_CLOSED_|CANONICALIZATION_CLOSURE)")
RECOVERY_CLOSE_LINE = re.compile(r"(?i)(^#{1,4}\s+.*(?:closure|supersession)|\bstatus:\s*(?:closed|superseded)\b|\bprogramme (?:is )?closed\b|\bsuperseded by\b|\bclosed on\b)")

def programme_key(path: Path):
    stem = path.stem
    match = re.match(r"^(.+?-\d{2})(?=[_-]|$)", stem)
    return match.group(1) if match else stem.split("_")[0]

def git_touch_map():
    raw = subprocess.check_output([
        "git", "-C", str(root), "log", "--format=@@%ct",
        "--name-only", "--", "docs/programme"
    ], text=True)
    touch = {}
    stamp = None
    for line in raw.splitlines():
        if line.startswith("@@"):
            stamp = int(line[2:] or 0)
            continue
        rel = line.strip()
        if rel and rel not in touch and stamp:
            touch[rel] = stamp
    head_stamp = int(subprocess.check_output(
        ["git", "-C", str(root), "log", "-1", "--format=%ct"], text=True
    ).strip())
    return touch, head_stamp

def record_item(path: Path):
    text = path.read_text(errors="ignore")
    lines = text.splitlines()
    headings = [re.sub(r"^#+\s*", "", line).strip() for line in lines if re.match(r"^#{1,4}\s+", line)]
    excerpt_lines = []
    excerpt_start = None
    excerpt_end = None
    in_fence = False
    for line_no, line in enumerate(lines, start=1):
        s = line.strip()
        if s.startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence or not s or s.startswith(("#", "|", ">", "---")):
            if excerpt_lines:
                break
            continue
        if s.startswith(("- ", "* ")) and not excerpt_lines:
            continue
        if excerpt_start is None:
            excerpt_start = line_no
        excerpt_end = line_no
        excerpt_lines.append(re.sub(r"[\`*_]", "", s))
        if len(" ".join(excerpt_lines)) >= 320:
            break
    rel = path.relative_to(root).as_posix()
    return {
        "title": headings[0] if headings else path.stem.replace("_", " · "),
        "path": rel,
        "excerpt": " ".join(excerpt_lines)[:420],
        "excerpt_start_line": excerpt_start,
        "excerpt_end_line": excerpt_end,
        "headings": headings[1:7],
    }

def recovery_candidates(paths, touch_map, head_stamp, dormant_hours=36):
    records = []
    for path in paths:
        rel = path.relative_to(root).as_posix()
        touched = touch_map.get(rel)
        if not touched:
            continue
        lines = path.read_text(errors="ignore").splitlines()
        closed = bool(RECOVERY_CLOSE_NAME.search(path.name)) or any(
            RECOVERY_CLOSE_LINE.search(line.strip()) for line in lines
        )
        hits = []
        for line_no, line in enumerate(lines, start=1):
            stripped = line.strip()
            for kind, pattern, weight in RECOVERY_SIGNALS:
                if pattern.search(stripped):
                    hits.append((weight, kind, line_no, stripped[:320]))
        records.append({
            "key": programme_key(path),
            "path": path,
            "touched": touched,
            "closed": closed,
            "hits": hits,
        })

    by_lineage = {}
    for record in records:
        by_lineage.setdefault(record["key"], []).append(record)

    candidates = []
    for key, lineage in by_lineage.items():
        latest_close = max(
            (record["touched"] for record in lineage if record["closed"]),
            default=0,
        )
        eligible = []
        for record in lineage:
            if record["closed"] or not record["hits"] or record["touched"] <= latest_close:
                continue
            hours = (head_stamp - record["touched"]) / 3600
            if hours < dormant_hours:
                continue
            weight, kind, line_no, evidence = max(
                record["hits"], key=lambda hit: (hit[0], hit[2])
            )
            eligible.append((record["touched"], weight, kind, line_no, evidence, hours, record["path"]))
        if not eligible:
            continue
        touched, weight, kind, line_no, evidence, hours, path = max(
            eligible, key=lambda item: item[0]
        )
        item = record_item(path)
        candidates.append({
            "programme_key": key,
            "title": item["title"],
            "path": item["path"],
            "signal": kind,
            "evidence_line": line_no,
            "evidence": evidence,
            "last_touched_epoch": touched,
            "hours_dormant": round(hours),
            "standing": "RECOVERY_CANDIDATE_UNREVIEWED",
            "candidate_law": "DORMANCY_DOES_NOT_CREATE_IMPORTANCE",
        })

    candidates.sort(key=lambda item: (
        -next(weight for kind, _, weight in RECOVERY_SIGNALS if kind == item["signal"]),
        -item["hours_dormant"],
        item["programme_key"],
    ))
    return candidates

families = [
("Writer's Studio", re.compile(r"^(WRITERS-STUDIO|WRITERS_STUDIO|WS2-|WS-|WRITING-|EDITORIAL-|FLAGSHIP-|REVIEW-CUSTODY|OBSERVATION-|FOCUS-WITNESS|SANCTUARY-)")),
("JARVIS", re.compile(r"^(SOULLAB-JARVIS|JARVIS|JOP-|J10|J11|CANONICAL-ADMISSION|DEPLOYMENT-SAFETY|CMT-|ADOPTION-)")),
("MAIA / Soul Service", re.compile(r"^(MAIA|AIN-|EARLY-FIELD|H1-)")),
("Living Field / Grokker", re.compile(r"^(JARVIS-LIVING-FIELD-GROKKER|LIVING-FIELD|LIVING_|LF-|JARVIS-VISUAL-FIELD)")),
("RGR / Research", re.compile(r"^(RGR|SPM-FC|SOURCE-CUSTODY|TEMPORAL-MEMORY)")),
("Soullab Desktop / House", re.compile(r"^(SOULLAB-DESKTOP|HOUSE|SOULLAB-HOUSE|S3-|S3_)")),
]
def access_authority_projection(paths):
    candidates = [p for p in paths if p.name.startswith("KELLYS-WORLD-ACCESS-AUTHORITY-")]
    for path in reversed(candidates):
        text = path.read_text(errors="ignore")
        for block in re.findall(r"```json\s*(\{.*?\})\s*```", text, flags=re.S):
            try:
                payload = json.loads(block)
            except json.JSONDecodeError:
                continue
            if payload.get("kind") == "kellys_world_access_authority_v1":
                payload["record_path"] = path.relative_to(root).as_posix()
                return payload
    return None

all_records = sorted([f for f in prog.glob("*") if f.is_file()], key=lambda p: p.name)
touch_map, head_stamp = git_touch_map()
recovery_items = recovery_candidates(all_records, touch_map, head_stamp)

recent_text = subprocess.check_output([
    "git", "-C", str(root), "log", "--since=2026-09-27 00:00",
    "--name-only", "--pretty=format:", "--", "docs/programme"
], text=True)
recent_paths = []
seen_recent = set()
for line in recent_text.splitlines():
    path = line.strip()
    if path and path not in seen_recent:
        seen_recent.add(path)
        recent_paths.append(path)

recent_items = []
for rel in recent_paths:
    path = root / rel
    if not path.is_file():
        continue
    if path.parent != prog:
        continue
    if path.suffix.lower() not in TEXT_RECORD_SUFFIXES:
        continue
    recent_items.append(record_item(path))

lane_groups = {name: [] for name, _ in families}
lane_groups["Other programme work"] = []

for f in all_records:
    target = next((name for name, pat in families if pat.search(f.name)), "Other programme work")
    lane_groups[target].append(record_item(f))

data = {
    "generatedAt": datetime.now(timezone.utc).date().isoformat(),
    "scope": "Curated field map plus the full canonical programme corpus; recent activity and recovery candidates are derived from Git history and explicit programme evidence",
    "recentItems": recent_items,
    "recoveryCandidates": recovery_items,
    "accessAuthority": access_authority_projection(all_records),
    "conceptGroups": [
        {"title": title, "items": [{"title": item} for item in items]}
        for title, items in concepts
    ],
    "laneGroups": [
        {"title": title, "items": items}
        for title, items in lane_groups.items() if items
    ],
    "counts": {
        "concepts": sum(len(items) for _, items in concepts),
        "lanes": len(all_records),
        "recent": len(recent_items),
        "recovery": len(recovery_items),
    },
}
out = "window.KELLY_FIELD_LIBRARY = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
(root / "jarvis-desktop/src/field-library-data.js").write_text(out)
print(data["counts"])
for group in data["laneGroups"]:
    print(group["title"], len(group["items"]))
