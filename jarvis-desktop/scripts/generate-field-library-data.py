from pathlib import Path
import json, re, subprocess

root = Path(__file__).resolve().parents[2]
prog = root / "docs/programme"

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

def record_item(path: Path):
    text = path.read_text(errors="ignore")
    lines = text.splitlines()
    headings = [re.sub(r"^#+\\s*", "", line).strip() for line in lines if re.match(r"^#{1,4}\\s+", line)]
    excerpt_lines = []
    in_fence = False
    for line in lines:
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
        excerpt_lines.append(re.sub(r"[\`*_]", "", s))
        if len(" ".join(excerpt_lines)) >= 320:
            break
    rel = path.relative_to(root).as_posix()
    return {
        "title": headings[0] if headings else path.stem.replace("_", " · "),
        "path": rel,
        "excerpt": " ".join(excerpt_lines)[:420],
        "headings": headings[1:7],
    }

families = [
("Writer's Studio", re.compile(r"^(WRITERS-STUDIO|WRITERS_STUDIO|WS2-|WS-|WRITING-|EDITORIAL-|FLAGSHIP-|REVIEW-CUSTODY|OBSERVATION-|FOCUS-WITNESS|SANCTUARY-)")),
("JARVIS", re.compile(r"^(SOULLAB-JARVIS|JARVIS|JOP-|J10|J11|CANONICAL-ADMISSION|DEPLOYMENT-SAFETY|CMT-|ADOPTION-)")),
("MAIA / Soul Service", re.compile(r"^(MAIA|AIN-|EARLY-FIELD|H1-)")),
("Living Field / Grokker", re.compile(r"^(JARVIS-LIVING-FIELD-GROKKER|LIVING-FIELD|LIVING_|LF-|JARVIS-VISUAL-FIELD)")),
("RGR / Research", re.compile(r"^(RGR|SPM-FC|SOURCE-CUSTODY|TEMPORAL-MEMORY)")),
("Soullab Desktop / House", re.compile(r"^(SOULLAB-DESKTOP|HOUSE|SOULLAB-HOUSE|S3-|S3_)")),
]
all_records = sorted([f for f in prog.glob("*") if f.is_file()], key=lambda p: p.name)
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

recent_items = [
    record_item(root / path)
    for path in recent_paths if (root / path).is_file()
]

lane_groups = {name: [] for name, _ in families}
lane_groups["Other programme work"] = []

for f in all_records:
    target = next((name for name, pat in families if pat.search(f.name)), "Other programme work")
    lane_groups[target].append(record_item(f))

data = {
    "generatedAt": "2026-09-30",
    "scope": "Curated field map plus the full canonical programme corpus; recent activity is derived from Git history since 2026-09-27",
    "recentItems": recent_items,
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
    },
}
out = "window.KELLY_FIELD_LIBRARY = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
(root / "jarvis-desktop/src/field-library-data.js").write_text(out)
print(data["counts"])
for group in data["laneGroups"]:
    print(group["title"], len(group["items"]))
