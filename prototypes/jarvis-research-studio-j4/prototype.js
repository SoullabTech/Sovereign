(function () {
  "use strict";

  var app = document.getElementById("app");
  var witnessMenu = document.getElementById("witness-menu");
  var witnessList = document.getElementById("witness-state-list");
  var witnessButton = document.getElementById("witness-menu-button");
  var witnessClose = document.getElementById("witness-close");
  var toast = document.getElementById("toast");

  var PROJECT = {
    id: "research-relational-geometry",
    title: "Relational Geometry Research",
    purpose: "Investigate whether relational structure, transformation and geometry add explanatory value beyond simpler representations without confusing mathematical structure with human meaning.",
    studio: "Research Studio"
  };

  var THREADS = {
    geometry: {
      id: "geometry",
      short: "Geometry vs baseline",
      title: "Does geometry add explanatory value beyond simpler relation-first baselines?",
      meta: "Active · 4 Sources"
    },
    invariants: {
      id: "invariants",
      short: "Invariants",
      title: "Which apparent invariants survive changes in vocabulary, domain or representation?",
      meta: "Open · 3 Sources"
    },
    trajectory: {
      id: "trajectory",
      short: "Trajectory",
      title: "When does trajectory add explanatory value beyond current-state structure?",
      meta: "Open · 2 Sources"
    }
  };

  var SOURCES = {
    s1: {
      id: "s1",
      label: "RGR-00 · Research Constitution",
      short: "RGR-00 Constitution",
      path: "docs/programme/RGR-00_RELATIONAL_GEOMETRY_RESEARCH_CONSTITUTION_2026-09-18.md",
      standing: "Local repository · observed",
      excerpt: "Relation is the object of inquiry; geometry is a candidate language, not a predetermined answer.",
      excerpt2: "Every geometric claim requires a simpler competitor.",
      usedBy: ["c1"]
    },
    s2: {
      id: "s2",
      label: "RGR-01 · Literature Landscape",
      short: "RGR-01 Landscape",
      path: "docs/programme/RGR-01_LITERATURE_MATHEMATICAL_LANDSCAPE_2026-09-18.md",
      standing: "Local repository · observed",
      excerpt: "Substantial justification exists for a Relational Geometry Reasoning research programme, but not for a unified theory of relational meaning.",
      excerpt2: "Graph and vector baselines remain legitimate competitors.",
      usedBy: ["c2", "c3"]
    },
    s3: {
      id: "s3",
      label: "RGR-01 · Claim Ledger",
      short: "RGR-01 Claim Ledger",
      path: "docs/programme/RGR-01_CLAIM_LEDGER_2026-09-18.md",
      standing: "Local repository · observed",
      excerpt: "No current RGR-01 claim establishes that meaning is geometry, consciousness is geometry, or positive geometry explains human meaning.",
      excerpt2: "Claim standing remains bounded by source scope and stated limits.",
      usedBy: ["c2", "c3"]
    },
    s4: {
      id: "s4",
      label: "RGR-02 · Formal Vocabulary",
      short: "RGR-02 Formal Vocabulary",
      path: "docs/programme/RGR-02_FORMAL_VOCABULARY_CANDIDATE_STRUCTURES_2026-09-18.md",
      standing: "Local repository · observed",
      excerpt: "The minimal common structure of Relational Geometry Reasoning is not itself required to be a geometry.",
      excerpt2: "Geometry enters only through separately justified enrichment.",
      usedBy: ["c4"]
    }
  };

  var CLAIMS = {
    c1: {
      id: "c1",
      label: "Relation-first inquiry",
      title: "Relation is the primary object of inquiry; geometry remains a candidate language.",
      standing: "Research constitutional proposition",
      sourceIds: ["s1"],
      challenge: "What does a geometric enrichment explain that a relation-first baseline cannot?",
      unknown: "No necessity claim is established.",
      authorship: "Research programme authored"
    },
    c2: {
      id: "c2",
      label: "Bounded explanatory value",
      title: "Geometry can provide explanatory value for some bounded relational-reasoning problems.",
      standing: "Supported in bounded research contexts",
      sourceIds: ["s2", "s3"],
      challenge: "Graph/structural baselines may explain the same target phenomena.",
      unknown: "Cross-domain necessity remains unestablished.",
      authorship: "Source-derived project claim"
    },
    c3: {
      id: "c3",
      label: "Boundary",
      title: "Existing evidence does not establish a unique or universal geometry of human meaning.",
      standing: "Supported negative boundary",
      sourceIds: ["s2", "s3"],
      challenge: "A later theory could narrow the claim with explicit bridge conditions.",
      unknown: "No universal bridge is present in the Project.",
      authorship: "Source-derived project claim"
    },
    c4: {
      id: "c4",
      label: "Pre-geometric scaffold",
      title: "RGR's common scaffold can be typed relationally without requiring geometry.",
      standing: "RGR-02 formal standing",
      sourceIds: ["s4"],
      challenge: "A later experiment could show that a geometric enrichment explains or predicts more.",
      unknown: "No experimental comparison has yet established necessity.",
      authorship: "Source-derived / human-accepted project claim"
    }
  };

  var UNKNOWNS = {
    u1: "Where, if anywhere, does a geometric enrichment outperform a graph/relational baseline?",
    u2: "Which apparent invariants survive changes in vocabulary, domain or representation?",
    u3: "What would justify moving from formal regularity to a claim about meaning-related structure?",
    u4: "Does trajectory contribute explanatory value beyond current-state structure?"
  };

  var state = {
    screen: "arrival",
    activeThread: "geometry",
    mainSurface: "canvas",
    jarvisOpen: true,
    jarvisMode: "idle",
    activeClaim: "c4",
    activeSource: "s4",
    proposal: null,
    proposalStatus: "none",
    provenanceOpen: false,
    overlay: null,
    sourceUnavailable: false,
    sourceChanged: false,
    returnReprise: false,
    lastSurfaceBeforeSystem: "canvas"
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () {
      toast.classList.remove("show");
    }, 1800);
  }

  function resetTo(screen) {
    state.screen = screen;
    state.activeThread = "geometry";
    state.mainSurface = "canvas";
    state.jarvisOpen = true;
    state.jarvisMode = "idle";
    state.activeClaim = "c4";
    state.activeSource = "s4";
    state.proposal = null;
    state.proposalStatus = "none";
    state.provenanceOpen = false;
    state.overlay = null;
    state.sourceUnavailable = false;
    state.sourceChanged = false;
    state.returnReprise = false;
    render();
  }

  function projectBar(studio, thread) {
    var h = "";
    h += '<div class="project-bar">';
    h += '<div class="project-identity">';
    h += '<button class="ghost" data-action="project-home"><strong>' + esc(PROJECT.title) + '</strong></button>';
    h += '<span class="studio-label">' + esc(studio || PROJECT.studio) + '</span>';
    if (thread) h += '<span class="studio-label">' + esc(thread) + '</span>';
    h += '</div>';
    h += '<div class="project-bar-actions">';
    h += '<button class="nav-action" data-action="arrival">Projects</button>';
    h += '<button class="nav-action" data-action="system">System</button>';
    h += '</div></div>';
    return h;
  }

  function renderArrival() {
    var h = "";
    h += '<section class="arrival">';
    h += '<div class="arrival-top"><div class="jarvis-wordmark">JARVIS</div><button class="arrival-system ghost" data-action="system">System</button></div>';
    h += '<div class="arrival-center">';
    h += '<h1>What are you working on?</h1>';
    h += '<p class="arrival-sub">Open a living context and return to the questions, materials and decisions already in motion.</p>';
    h += '<div class="arrival-actions"><button class="primary" data-action="new-project">Start something new</button></div>';
    h += '<div class="recent-title">Recent</div><div class="recent-grid">';
    h += '<button class="project-card" data-action="open-rgr"><div class="project-title">Relational Geometry Research</div><div class="project-thread">' + esc(THREADS.geometry.title) + '</div><div class="project-meta">Last active · Research Studio</div></button>';
    h += '<button class="project-card" data-action="prototype-boundary"><div class="project-title">Elemental Alchemy</div><div class="project-thread">Chapter work</div><div class="project-meta">Documentary fixture only in this prototype</div></button>';
    h += '</div></div></section>';
    return h;
  }

  function renderReturn() {
    var title = state.returnReprise ? "You can pick this up without rebuilding the context." : "You were here.";
    var h = '<section class="return-screen">';
    h += projectBar(PROJECT.studio, "");
    h += '<div class="return-center"><div class="return-kicker">' + (state.returnReprise ? "Return after absence" : "Project continuity") + '</div>';
    h += '<h1>' + esc(title) + '</h1><div class="return-grid"><div>';
    h += '<div class="return-card"><div class="return-label">Active Thread</div><div class="return-value">' + esc(THREADS.geometry.title) + '</div></div>';
    h += '<div class="return-card"><div class="return-label">Working surface</div><div class="return-value">Evidence Canvas</div></div>';
    h += '<div class="return-card"><div class="return-label">Last human decision</div><div class="return-value">Keep geometry as an enrichment candidate, not the common core.</div></div>';
    h += '</div><div>';
    h += '<div class="return-card"><div class="return-label">In view</div><div class="return-value">4 Sources · 4 Claims · 4 Unknowns</div></div>';
    h += '<div class="return-card"><div class="return-label">Unresolved</div><ul class="return-list"><li>geometric enrichment has not yet earned necessity</li><li>semantic bridge remains open</li></ul></div>';
    h += '<div class="return-card"><div class="return-label">Next intended act</div><div class="caption">Define a fair graph-vs-geometry comparison.</div></div>';
    h += '</div></div><div class="return-actions"><button class="primary" data-action="resume-research">Resume Research</button><button class="secondary" data-action="project-home">Orient me first</button></div></div></section>';
    return h;
  }

  function renderHome() {
    var threadRows = Object.keys(THREADS).map(function (id) {
      var t = THREADS[id];
      return '<button class="list-row" data-thread="' + id + '"><div class="row-title">' + esc(t.title) + '</div><div class="row-meta">' + esc(t.meta) + '</div></button>';
    }).join("");

    var h = '<section class="project-home">' + projectBar("Project Home", "");
    h += '<div class="home-body"><div class="home-inner"><h1 class="home-title">' + esc(PROJECT.title) + '</h1><p class="home-purpose">' + esc(PROJECT.purpose) + '</p>';
    h += '<div class="home-grid"><div>';
    h += '<div class="section-block"><h3>Continue</h3><div class="continue-card"><div class="eyebrow dark">Research Studio · Evidence Canvas</div><div class="big">' + esc(THREADS.geometry.title) + '</div><div class="caption">4 Sources · 1 unresolved conflict · last active today</div><div style="margin-top:13px"><button class="primary" data-action="resume-research">Open Research Studio</button></div></div></div>';
    h += '<div class="section-block"><h3>Active Threads</h3><div class="thread-list">' + threadRows + '</div></div></div>';
    h += '<div><div class="section-block"><h3>Materials</h3><div class="caption">4 Sources<br>1 working synthesis Artifact<br>4 open Unknowns</div></div>';
    h += '<div class="section-block"><h3>Recent human decision</h3><div class="caption">Keep the common scaffold pre-geometric.</div></div>';
    h += '<div class="jarvis-suggestion"><div class="eyebrow">JARVIS</div><p>Possible next act: compare the graph/structural and subspace/Grassmann candidates on what each explains that the other does not.</p></div></div>';
    h += '</div></div></div></section>';
    return h;
  }

  function renderContextRail() {
    var threadRows = Object.keys(THREADS).map(function (id) {
      var t = THREADS[id];
      return '<button class="context-button ' + (state.activeThread === id ? "active" : "") + '" data-thread="' + id + '">' + esc(t.short) + '<span class="ctx-meta">' + esc(t.meta) + '</span></button>';
    }).join("");

    var sourceRows = Object.keys(SOURCES).map(function (id) {
      var s = SOURCES[id];
      var meta = "Local · observed";
      if (id === "s2" && state.sourceUnavailable) meta = "Unavailable · prior state kept";
      if (id === "s4" && state.sourceChanged) meta = "Changed since observation";
      return '<button class="context-button" data-source="' + id + '">' + esc(s.short) + '<span class="ctx-meta">' + esc(meta) + '</span></button>';
    }).join("");

    var unknownRows = Object.keys(UNKNOWNS).map(function (id) {
      return '<button class="context-button" data-action="unknown" data-unknown="' + id + '">' + esc(UNKNOWNS[id]) + '</button>';
    }).join("");

    var h = '<aside class="context-rail">';
    h += '<div class="context-section"><div class="context-section-title">Threads</div>' + threadRows + '</div>';
    h += '<div class="context-section"><div class="context-section-title">Sources</div>' + sourceRows + '</div>';
    h += '<div class="context-section"><div class="context-section-title">Artifacts</div><button class="context-button" data-action="open-artifact">Geometry as enrichment, not common core<span class="ctx-meta">Working synthesis</span></button></div>';
    h += '<div class="context-section"><div class="context-section-title">Unknowns</div>' + unknownRows + '</div>';
    h += '</aside>';
    return h;
  }

  function renderCanvas() {
    var h = '<div class="canvas-wrap"><div class="canvas-label">Evidence Canvas · Research prototype</div>';
    h += '<svg class="canvas-svg" viewBox="0 0 800 530" preserveAspectRatio="none">';
    h += '<path class="edge" d="M170 180 C270 120 330 110 420 110"></path><text class="edge-label" x="280" y="126">supports relation-first boundary</text>';
    h += '<path class="edge challenge" d="M515 115 C590 115 625 145 650 180"></path><text class="edge-label" x="558" y="128">pressure</text>';
    h += '<path class="edge unknown" d="M440 170 C445 265 430 330 420 405"></path><text class="edge-label" x="452" y="292">not yet tested</text>';
    h += '<path class="edge" d="M225 210 C300 300 340 365 390 410"></path><text class="edge-label" x="282" y="315">requires competitor</text></svg>';
    h += '<button class="canvas-node node-c1" data-claim="c1"><span class="type-label claim">Claim</span><div class="node-title">Relation-first inquiry</div><div class="node-meta">RGR-00 · constitutional proposition</div></button>';
    h += '<button class="canvas-node node-c3" data-claim="c3"><span class="type-label claim">Claim</span><div class="node-title">No unified geometry of meaning</div><div class="node-meta">2 Sources · supported boundary</div></button>';
    h += '<button class="canvas-node node-c4" data-claim="c4"><span class="type-label claim">Claim</span><div class="node-title">Common scaffold is pre-geometric</div><div class="node-meta">RGR-02 · active focus</div></button>';
    h += '<button class="canvas-node node-u1" data-action="unknown" data-unknown="u1"><span class="type-label unknown">Unknown</span><div class="node-title">Where does geometry add explanatory increment?</div><div class="node-meta">Open · experiment pressure</div></button>';
    h += '</div>';
    return h;
  }

  function renderClaim() {
    var claim = CLAIMS[state.activeClaim];
    var evidence = claim.sourceIds.map(function (id) {
      var s = SOURCES[id];
      return '<button class="source-card list-row" data-source="' + id + '"><div class="row-title">' + esc(s.label) + '</div><div class="row-meta">' + esc(s.standing) + '</div></button>';
    }).join("");

    var h = '<div class="detail-view">';
    h += '<button class="quiet" data-action="canvas">← Back to Canvas</button>';
    h += '<div class="detail-header"><span class="type-label claim">Claim</span><h1>' + esc(claim.title) + '</h1>';
    h += '<div class="detail-meta"><span class="meta-pill">' + esc(claim.standing) + '</span><span class="meta-pill">' + claim.sourceIds.length + ' Source' + (claim.sourceIds.length === 1 ? '' : 's') + '</span><span class="meta-pill">' + esc(claim.authorship) + '</span></div></div>';
    h += '<div class="detail-section"><h3>Evidence</h3>' + evidence + '</div>';
    h += '<div class="detail-section"><h3>Challenges / pressure</h3><p>' + esc(claim.challenge) + '</p></div>';
    h += '<div class="detail-section"><h3>Unknown</h3><p>' + esc(claim.unknown) + '</p></div>';
    h += '<div class="detail-actions"><button class="secondary" data-action="open-claim-source">Open Source</button><button class="secondary" data-action="toggle-provenance">Show provenance</button><button class="secondary" data-action="ask-claim">Ask JARVIS</button><button class="secondary" data-action="challenge-claim">Challenge Claim</button></div>';
    h += '<div class="provenance-box ' + (state.provenanceOpen ? 'open' : '') + '">';
    h += '<div class="provenance-row"><strong>Authorship</strong><span>' + esc(claim.authorship) + '</span></div>';
    h += '<div class="provenance-row"><strong>Source basis</strong><span>' + claim.sourceIds.map(function (id) { return esc(SOURCES[id].label); }).join(' · ') + '</span></div>';
    h += '<div class="provenance-row"><strong>Project standing</strong><span>' + esc(claim.standing) + '</span></div>';
    h += '<div class="provenance-row"><strong>JARVIS edits</strong><span>None to this durable Claim</span></div></div></div>';
    return h;
  }

  function renderSource() {
    var source = SOURCES[state.activeSource];
    var used = source.usedBy.length ? source.usedBy.map(function (cid) {
      return '<button class="list-row" data-claim="' + cid + '"><div class="row-title">' + esc(CLAIMS[cid].title) + '</div><div class="row-meta">' + esc(CLAIMS[cid].standing) + '</div></button>';
    }).join("") : '<div class="caption">No durable Project Claim currently cites this Source.</div>';

    var h = '<div class="source-reader">';
    h += '<button class="quiet" data-action="canvas">← Back to Canvas</button>';
    h += '<div class="source-head"><span class="type-label source">Source</span><h1>' + esc(source.label) + '</h1><div class="caption">' + esc(source.standing) + '</div><div class="path">' + esc(source.path) + '</div></div>';
    h += '<div class="source-body"><div class="eyebrow dark">Selected research standing</div><h2>' + esc(source.short) + '</h2><p>' + esc(source.excerpt) + '</p><div class="source-quote">' + esc(source.excerpt2) + '</div><p>This prototype shows only fixture excerpts required for the experience witness. The full repository Source remains the authoritative document.</p></div>';
    h += '<div class="detail-section"><h3>Used by</h3>' + used + '</div>';
    h += '<div class="detail-actions"><button class="secondary" data-action="canvas">Back to Canvas</button><button class="secondary" data-action="toggle-source-provenance">Show full provenance</button></div>';
    h += '<div class="provenance-box ' + (state.provenanceOpen ? 'open' : '') + '"><div class="provenance-row"><strong>Source class</strong><span>Repository Source reference · fixture only</span></div><div class="provenance-row"><strong>Custody</strong><span>Local Project</span></div><div class="provenance-row"><strong>Runtime access</strong><span>None — static J4 fixture</span></div><div class="provenance-row"><strong>External disclosure</strong><span>None</span></div></div></div>';
    return h;
  }

  function renderCompare() {
    var h = '<div class="detail-view">';
    h += '<button class="quiet" data-action="canvas">← Return to Canvas</button>';
    h += '<div class="detail-header"><span class="type-label question">Working comparison</span><h1>Does geometry add explanatory value beyond a relation-first baseline?</h1><div class="caption">Temporary working view · not yet a Project Artifact or durable Claim</div></div>';
    h += '<table class="compare-table"><thead><tr><th></th><th>RGR-00</th><th>RGR-01</th><th>RGR-02</th></tr></thead><tbody>';
    h += '<tr><td>Purpose</td><td>Constitution</td><td>Literature / evidence</td><td>Formal scaffold</td></tr>';
    h += '<tr><td>Geometry</td><td>Candidate language</td><td>Useful in bounded domains</td><td>Competing enrichment</td></tr>';
    h += '<tr><td>Baseline law</td><td>Required</td><td>Graph / vector remain competitors</td><td>Formalism neutrality</td></tr>';
    h += '<tr><td>Meaning claim</td><td>Not reduced</td><td>No universal geometry</td><td>Not defined by formalism</td></tr>';
    h += '<tr><td>Open pressure</td><td>Falsify necessity</td><td>Compare families</td><td>Experiment later</td></tr>';
    h += '</tbody></table>';
    h += '<div class="detail-actions"><button class="secondary" data-action="save-comparison">Save as Artifact</button><button class="secondary" data-action="ask-comparison">Ask about this comparison</button><button class="secondary" data-action="canvas">Return to Canvas</button></div></div>';
    return h;
  }

  function renderArtifact() {
    var h = '<div class="artifact-view">';
    h += '<button class="quiet" data-action="canvas">← Back to Research</button>';
    h += '<div class="artifact-paper"><div class="eyebrow dark">Working synthesis Artifact</div><h1>Geometry as enrichment, not common core</h1><div class="caption">Research Studio · human-owned working note · fixture state</div>';
    h += '<h2>Current thesis</h2><p>Relational Geometry Reasoning can investigate whether specific geometric enrichments explain relational phenomena better than simpler baselines without defining the common relational scaffold as geometric by default.</p>';
    h += '<h2>Evidence</h2><ul><li>RGR-00 requires a simpler competitor for every geometric claim.</li><li>RGR-01 supports bounded explanatory uses of geometry while preserving graph/vector competitors.</li><li>RGR-02 formalizes a common scaffold that does not itself require geometry.</li></ul>';
    h += '<h2>Challenge</h2><p>The programme has not yet shown where geometric enrichment yields explanatory or predictive gain beyond matched-complexity relation-first baselines.</p>';
    h += '<h2>Unknowns</h2><p>Representation dependence, cross-domain invariance, semantic bridge, and trajectory remain open.</p>';
    h += '<h2>Next experiment pressure</h2><p>Define a fair graph-versus-geometry comparison on the same target phenomenon with matched complexity and an explicit criterion for explanatory increment.</p></div>';
    h += '<div class="detail-actions"><button class="secondary" data-action="artifact-provenance">Show provenance</button><button class="secondary" data-action="canvas">Return to Canvas</button><button class="secondary future-button" data-action="prototype-boundary">Open in Writing Studio · future</button></div></div>';
    return h;
  }

  function renderSourceState() {
    var unavailable = state.sourceUnavailable;
    var h = '<div class="state-panel">';
    h += '<span class="type-label ' + (unavailable ? 'unknown' : 'source') + '">' + (unavailable ? 'Unavailable Source' : 'Changed Source') + '</span>';
    h += '<h2>' + (unavailable ? 'One Source is unavailable.' : 'This Source changed after the evidence state shown in the Canvas.') + '</h2>';
    h += '<p>' + (unavailable ? 'Your Canvas, Claims and prior provenance are intact. JARVIS will not treat the missing Source as currently readable.' : 'The Project can preserve the prior observed evidence state while you decide whether to review the new version.') + '</p>';
    h += '<div class="source-status-card"><strong>' + esc(unavailable ? SOURCES.s2.label : SOURCES.s4.label) + '</strong><div class="caption">' + (unavailable ? 'Unavailable · last observed state preserved' : 'Changed since observation · prior evidence state retained') + '</div></div>';
    h += '<div class="detail-actions">';
    if (unavailable) {
      h += '<button class="primary" data-action="continue-without-source">Continue without it</button><button class="secondary" data-action="show-affected">Show affected Claims</button>';
    } else {
      h += '<button class="primary" data-action="prototype-boundary">Review new version · prototype boundary</button><button class="secondary" data-action="keep-prior">Keep prior observed version</button>';
    }
    h += '<button class="quiet" data-action="canvas">Back to Canvas</button></div></div>';
    return h;
  }

  function renderMainSurface() {
    if (state.mainSurface === "claim") return renderClaim();
    if (state.mainSurface === "source") return renderSource();
    if (state.mainSurface === "compare") return renderCompare();
    if (state.mainSurface === "artifact") return renderArtifact();
    if (state.mainSurface === "source-state") return renderSourceState();

    var thread = THREADS[state.activeThread];
    var h = '<div class="thread-heading"><div><div class="eyebrow dark">Active Thread</div><h1>' + esc(thread.title) + '</h1></div>';
    h += '<div class="surface-switcher"><button class="mode-button active" data-action="canvas">Canvas</button><button class="mode-button" data-source="' + state.activeSource + '">Source</button><button class="mode-button" data-action="open-artifact">Synthesis</button></div></div>';
    h += renderCanvas();
    return h;
  }

  function jarvisIdle() {
    var h = '<div class="jarvis-card"><div class="eyebrow">Current context</div><p>' + esc(THREADS[state.activeThread].title) + '</p><div class="basis">4 Project Sources · no automatic reading beyond fixture state</div></div>';
    h += '<div class="jarvis-card"><div class="eyebrow">Working posture</div><p>Ask about the inquiry, compare selected Sources, challenge a Claim, or synthesize a working note. Durable Project structure changes only by explicit acceptance.</p></div>';
    return h;
  }

  function jarvisAsk() {
    var h = '<div class="jarvis-card"><div class="eyebrow">Your question</div><p>What would falsify this Claim?</p></div>';
    h += '<div class="jarvis-card"><div class="eyebrow">JARVIS</div><p>Within this Project, the Claim would be pressured if a later experiment showed that a specifically geometric representation consistently explains or predicts relational phenomena that graph/relational baselines do not.</p><p>RGR-00 requires a simpler competitor for every geometric claim, while RGR-02 currently treats vector, graph, Grassmann and sheaf approaches as competing enrichments rather than one preselected answer.</p><div class="basis">Project basis · RGR-00 · RGR-02<br>Inference · yes<br>Unknowns retained · 1</div></div>';
    if (state.proposalStatus === "proposed") {
      h += '<div class="proposal-card"><span class="type-label proposed">Proposed Unknown</span><h4>' + esc(state.proposal) + '</h4><div class="caption">Not part of the durable Project until you act.</div><div class="proposal-actions"><button class="primary" data-action="accept-proposal">Accept</button><button class="secondary" data-action="edit-proposal">Edit</button><button class="quiet" data-action="dismiss-proposal">Dismiss</button></div></div>';
    } else if (state.proposalStatus === "accepted") {
      h += '<div class="proposal-card"><span class="type-label unknown">Accepted Unknown</span><h4>' + esc(state.proposal) + '</h4><div class="caption">Prototype state only · simulates explicit human acceptance.</div></div>';
    }
    return h;
  }

  function jarvisChallenge() {
    var h = '<div class="jarvis-card"><div class="eyebrow">Challenge</div><p>The Project supports bounded cases where geometry is explanatory. It does not yet support one geometry across domains, necessity of geometry over graph/structural baselines, or transfer from representation geometry to lived meaning.</p><p>A stronger falsifier would compare the same target phenomenon under a graph/relational baseline, a geometric enrichment, and matched complexity.</p><div class="basis">Project basis · RGR-00 · RGR-01 · RGR-02<br>Standing · challenge, not Project decision</div><div class="proposal-actions"><button class="secondary" data-action="propose-falsifier">Add falsifier proposal</button><button class="quiet" data-action="show-supporting">Show supporting Sources</button></div></div>';
    return h;
  }

  function jarvisExplain() {
    return '<div class="jarvis-card"><div class="eyebrow">Explain</div><p>An invariant is a property declared to remain stable under a specified transformation family. RGR-02 explicitly refuses to treat invariant and equivalent as synonyms: two states can share an invariant without being equivalent.</p><div class="basis">Project basis · RGR-02<br>Inference · no additional Project Claim created</div></div>';
  }

  function jarvisCompare() {
    return '<div class="jarvis-card"><div class="eyebrow">Comparison context</div><p>The center is showing a temporary working comparison. Nothing in that view becomes a durable Claim or Artifact until you explicitly save it.</p></div>';
  }

  function jarvisSynthesize() {
    return '<div class="jarvis-card"><div class="eyebrow">Synthesis</div><p>The current working note keeps geometry as an enrichment candidate, preserves relation-first baselines, and carries the unresolved experimental question forward.</p><div class="basis">Artifact status · fixture / human-owned working note</div></div>';
  }

  function renderJarvisPane() {
    var body = jarvisIdle();
    if (state.jarvisMode === "ask") body = jarvisAsk();
    if (state.jarvisMode === "challenge") body = jarvisChallenge();
    if (state.jarvisMode === "explain") body = jarvisExplain();
    if (state.jarvisMode === "compare") body = jarvisCompare();
    if (state.jarvisMode === "synthesize") body = jarvisSynthesize();

    var h = '<aside class="jarvis-pane ' + (state.jarvisOpen ? '' : 'collapsed') + '">';
    h += '<div class="jarvis-head"><div class="jarvis-mark"></div><div class="jarvis-title">JARVIS</div><div class="jarvis-context">' + (state.jarvisOpen ? 'Project context' : '') + '</div><button class="icon-button jarvis-toggle" data-action="toggle-jarvis" aria-label="' + (state.jarvisOpen ? 'Collapse JARVIS' : 'Open JARVIS') + '">' + (state.jarvisOpen ? '›' : '‹') + '</button></div>';
    h += '<div class="jarvis-body"><div class="jarvis-actions"><button class="action-chip" data-action="jarvis-ask">Ask</button><button class="action-chip" data-action="jarvis-explain">Explain</button><button class="action-chip" data-action="jarvis-compare">Compare</button><button class="action-chip" data-action="jarvis-challenge">Challenge</button><button class="action-chip" data-action="jarvis-synthesize">Synthesize</button></div>' + body + '</div>';
    h += '</aside>';
    return h;
  }

  function renderCustodyStrip() {
    var h = '<div class="custody-strip">';
    h += '<span class="strip-item local"><span class="state-dot"></span>Local Project</span>';
    h += '<span class="strip-item">4 Sources</span>';
    h += '<span class="strip-item unknown"><span class="state-dot"></span>1 unresolved conflict</span>';
    if (state.sourceUnavailable) h += '<span class="strip-item warn"><span class="state-dot"></span>1 Source unavailable</span>';
    if (state.sourceChanged) h += '<span class="strip-item warn"><span class="state-dot"></span>1 Source changed</span>';
    h += '<span class="strip-item">Provenance available</span>';
    h += '<span class="strip-item grow">No background activity</span></div>';
    return h;
  }

  function renderCustodyOverlay() {
    if (state.overlay !== "custody") return "";
    var h = '<div class="authority-sheet-backdrop"><div class="authority-sheet">';
    h += '<div class="eyebrow dark">Custody hold</div><h2>External comparison held</h2><p class="nothing-sent">Nothing has been sent.</p>';
    h += '<p>The selected Project material is currently Local. An independent external challenge would require a separate authority review.</p>';
    h += '<div class="section-block"><h3>Requested material</h3><ul><li>RGR-00 Research Constitution</li><li>RGR-01 Literature Landscape</li><li>RGR-02 Formal Vocabulary</li></ul></div>';
    h += '<div class="section-block"><h3>Purpose</h3><p>Independent challenge of the bounded geometry-value Claim.</p></div>';
    h += '<p>Only these three Sources would be included. No other Project notes, Threads or Artifacts are part of the request.</p>';
    h += '<div class="detail-actions"><button class="quiet" data-action="cancel-overlay">Cancel</button><button class="primary" data-action="review-crossing">Review crossing</button></div></div></div>';
    return h;
  }

  function renderResearch() {
    var thread = THREADS[state.activeThread];
    var h = '<section class="research-shell">';
    h += projectBar(PROJECT.studio, thread.short);
    h += '<div class="research-grid ' + (state.jarvisOpen ? '' : 'jarvis-collapsed') + '">';
    h += renderContextRail();
    h += '<section class="main-surface"><div class="main-surface-inner">' + renderMainSurface() + '</div>' + renderCustodyOverlay() + '</section>';
    h += renderJarvisPane();
    h += '</div>';
    h += renderCustodyStrip();
    h += '</section>';
    return h;
  }

  function renderSystem() {
    var h = '<section class="system-screen">';
    h += projectBar('System · prototype escape hatch', '');
    h += '<div class="system-body"><div class="eyebrow dark">Secondary instrument</div><h1>System</h1>';
    h += '<p class="home-purpose">Operational truth remains reachable without being the identity of the Project experience. This is a deliberately simplified J4 representation, not a redesign of the existing cockpit.</p>';
    h += '<div class="system-grid"><div class="system-card"><strong>Desktop / Builder</strong><span>Available</span></div><div class="system-card"><strong>Continuity</strong><span>Available</span></div><div class="system-card"><strong>Canonical Work Unit substrate</strong><span>Available · beneath Project actions</span></div><div class="system-card"><strong>Provider execution</strong><span>Compatibility / advanced · not part of this prototype</span></div></div>';
    h += '<div class="detail-actions"><button class="primary" data-action="back-project">Return to Project</button><button class="secondary" data-action="prototype-boundary">Open advanced operational console · prototype boundary</button></div></div></section>';
    return h;
  }

  function render() {
    if (state.screen === "arrival") app.innerHTML = renderArrival();
    else if (state.screen === "return") app.innerHTML = renderReturn();
    else if (state.screen === "home") app.innerHTML = renderHome();
    else if (state.screen === "research") app.innerHTML = renderResearch();
    else if (state.screen === "system") app.innerHTML = renderSystem();
    else app.innerHTML = renderArrival();

    bindInteractions();
  }

  function bindInteractions() {
    var actions = app.querySelectorAll("[data-action]");
    actions.forEach(function (el) {
      el.addEventListener("click", function () {
        handleAction(el.getAttribute("data-action"), el);
      });
    });

    var threads = app.querySelectorAll("[data-thread]");
    threads.forEach(function (el) {
      el.addEventListener("click", function () {
        state.activeThread = el.getAttribute("data-thread");
        state.screen = "research";
        state.mainSurface = "canvas";
        state.jarvisMode = "idle";
        render();
      });
    });

    var claims = app.querySelectorAll("[data-claim]");
    claims.forEach(function (el) {
      el.addEventListener("click", function () {
        state.activeClaim = el.getAttribute("data-claim");
        state.mainSurface = "claim";
        state.provenanceOpen = false;
        state.jarvisMode = "idle";
        render();
      });
    });

    var sources = app.querySelectorAll("[data-source]");
    sources.forEach(function (el) {
      el.addEventListener("click", function () {
        state.activeSource = el.getAttribute("data-source");
        state.mainSurface = "source";
        state.provenanceOpen = false;
        render();
      });
    });
  }

  function handleAction(action, el) {
    if (action === "arrival") state.screen = "arrival";
    else if (action === "open-rgr") { state.screen = "return"; state.returnReprise = false; }
    else if (action === "project-home") state.screen = "home";
    else if (action === "resume-research") { state.screen = "research"; state.mainSurface = "canvas"; }
    else if (action === "system") { state.lastSurfaceBeforeSystem = state.mainSurface; state.screen = "system"; }
    else if (action === "back-project") { state.screen = "research"; state.mainSurface = state.lastSurfaceBeforeSystem || "canvas"; }
    else if (action === "canvas") { state.screen = "research"; state.mainSurface = "canvas"; state.jarvisMode = "idle"; state.provenanceOpen = false; }
    else if (action === "toggle-jarvis") state.jarvisOpen = !state.jarvisOpen;
    else if (action === "toggle-provenance" || action === "toggle-source-provenance") state.provenanceOpen = !state.provenanceOpen;
    else if (action === "open-claim-source") {
      var claim = CLAIMS[state.activeClaim];
      state.activeSource = claim.sourceIds[0];
      state.mainSurface = "source";
      state.provenanceOpen = false;
    }
    else if (action === "ask-claim" || action === "jarvis-ask") {
      state.jarvisOpen = true;
      state.jarvisMode = "ask";
      state.proposal = UNKNOWNS.u1;
      state.proposalStatus = "proposed";
    }
    else if (action === "challenge-claim" || action === "jarvis-challenge") {
      state.jarvisOpen = true;
      state.jarvisMode = "challenge";
    }
    else if (action === "jarvis-explain") {
      state.jarvisOpen = true;
      state.jarvisMode = "explain";
    }
    else if (action === "jarvis-compare") {
      state.jarvisOpen = true;
      state.jarvisMode = "compare";
      state.mainSurface = "compare";
    }
    else if (action === "jarvis-synthesize") {
      state.jarvisOpen = true;
      state.jarvisMode = "synthesize";
      state.mainSurface = "artifact";
    }
    else if (action === "open-artifact") {
      state.mainSurface = "artifact";
      state.jarvisMode = "synthesize";
    }
    else if (action === "accept-proposal") {
      state.proposalStatus = "accepted";
      showToast("Accepted into synthetic Project state.");
    }
    else if (action === "edit-proposal") {
      var edited = window.prompt("Edit proposed Unknown", state.proposal || "");
      if (edited && edited.trim()) state.proposal = edited.trim();
    }
    else if (action === "dismiss-proposal") {
      state.proposalStatus = "dismissed";
      showToast("Proposal dismissed. Project structure unchanged.");
    }
    else if (action === "save-comparison") {
      state.mainSurface = "artifact";
      state.jarvisMode = "synthesize";
      showToast("Saved as synthetic Artifact for witness.");
    }
    else if (action === "ask-comparison") {
      state.jarvisOpen = true;
      state.jarvisMode = "compare";
    }
    else if (action === "propose-falsifier") {
      state.jarvisMode = "ask";
      state.proposal = "Would geometry still add explanatory value under a matched-complexity graph baseline?";
      state.proposalStatus = "proposed";
    }
    else if (action === "show-supporting") {
      state.mainSurface = "compare";
      state.jarvisMode = "compare";
    }
    else if (action === "unknown") {
      var uid = el ? el.getAttribute("data-unknown") : "";
      if (uid && UNKNOWNS[uid]) showToast("Unknown in focus: " + UNKNOWNS[uid]);
    }
    else if (action === "cancel-overlay") state.overlay = null;
    else if (action === "review-crossing") {
      state.overlay = null;
      showToast("Prototype boundary: canonical external execution is intentionally unavailable.");
    }
    else if (action === "continue-without-source") {
      state.sourceUnavailable = true;
      state.mainSurface = "canvas";
      showToast("Continuing with prior Project context intact.");
    }
    else if (action === "show-affected") {
      state.activeClaim = "c2";
      state.mainSurface = "claim";
    }
    else if (action === "keep-prior") {
      state.sourceChanged = true;
      state.mainSurface = "canvas";
      showToast("Prior observed evidence state retained in prototype.");
    }
    else if (action === "artifact-provenance") {
      showToast("Fixture Artifact: human-owned working note · source-grounded synthetic state.");
    }
    else if (action === "new-project") showToast("Prototype boundary: new Project creation is not implemented in J4.");
    else if (action === "prototype-boundary") showToast("Prototype boundary: intentionally nonfunctional in J4.");

    render();
  }

  var WITNESS_STATES = [
    ["W0", "Native arrival", function () { resetTo("arrival"); }],
    ["W1", "Return to Project", function () { resetTo("return"); }],
    ["W2", "Project Home", function () { resetTo("home"); }],
    ["W3", "Research Studio", function () { resetTo("research"); }],
    ["W3A", "JARVIS collapsed", function () { resetTo("research"); state.jarvisOpen = false; render(); }],
    ["W4", "Claim focus", function () { resetTo("research"); state.mainSurface = "claim"; state.activeClaim = "c4"; render(); }],
    ["W5", "Source Reader", function () { resetTo("research"); state.mainSurface = "source"; state.activeSource = "s4"; render(); }],
    ["W6", "Ask JARVIS / proposal", function () { resetTo("research"); state.mainSurface = "claim"; state.activeClaim = "c4"; state.jarvisMode = "ask"; state.proposal = UNKNOWNS.u1; state.proposalStatus = "proposed"; render(); }],
    ["W7", "Compare Sources", function () { resetTo("research"); state.mainSurface = "compare"; render(); }],
    ["W8", "Challenge Claim", function () { resetTo("research"); state.activeClaim = "c2"; state.mainSurface = "claim"; state.jarvisMode = "challenge"; render(); }],
    ["W9", "Custody hold", function () { resetTo("research"); state.overlay = "custody"; render(); }],
    ["F1", "Source unavailable", function () { resetTo("research"); state.sourceUnavailable = true; state.mainSurface = "source-state"; render(); }],
    ["F2", "Source changed", function () { resetTo("research"); state.sourceChanged = true; state.mainSurface = "source-state"; render(); }],
    ["A1", "Synthesis Artifact", function () { resetTo("research"); state.mainSurface = "artifact"; render(); }],
    ["SYS", "System escape", function () { resetTo("system"); }],
    ["RET", "Return-after-absence reprise", function () { resetTo("return"); state.returnReprise = true; render(); }]
  ];

  function buildWitnessMenu() {
    witnessList.innerHTML = WITNESS_STATES.map(function (entry, index) {
      return '<button class="witness-state" data-witness="' + index + '"><strong>' + esc(entry[0]) + ' · ' + esc(entry[1]) + '</strong><span>Jump to synthetic witness state</span></button>';
    }).join("");

    witnessList.querySelectorAll("[data-witness]").forEach(function (el) {
      el.addEventListener("click", function () {
        var entry = WITNESS_STATES[Number(el.getAttribute("data-witness"))];
        closeWitnessMenu();
        entry[2]();
      });
    });
  }

  function openWitnessMenu() {
    witnessMenu.classList.add("open");
    witnessMenu.setAttribute("aria-hidden", "false");
  }

  function closeWitnessMenu() {
    witnessMenu.classList.remove("open");
    witnessMenu.setAttribute("aria-hidden", "true");
  }

  witnessButton.addEventListener("click", openWitnessMenu);
  witnessClose.addEventListener("click", closeWitnessMenu);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (witnessMenu.classList.contains("open")) closeWitnessMenu();
      else if (state.overlay) {
        state.overlay = null;
        render();
      }
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.altKey && event.key.toLowerCase() === "h" && state.screen === "research") {
      state.overlay = "custody";
      render();
    }
  });

  buildWitnessMenu();
  render();
})();
