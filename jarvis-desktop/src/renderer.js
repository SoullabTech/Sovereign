const $main = document.getElementById('main');
let currentView = 'home';
let lastStatus = null;

document.querySelectorAll('nav button').forEach(btn => {
  btn.addEventListener('click', () => setView(btn.dataset.view));
});

function setView(v) {
  currentView = v;
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  render();
}

function stateRow(label, s) {
  return `<div class="row">
    <div>
      <div class="label">${label}</div>
      ${s.detail ? `<div class="detail">${typeof s.detail === 'string' ? s.detail : JSON.stringify(s.detail).slice(0, 200)}</div>` : ''}
    </div>
    <span class="state ${s.state}">${s.state}</span>
  </div>`;
}

async function refreshStatus() {
  lastStatus = await window.jarvis.getStatus();
  return lastStatus;
}

function provenanceRows(p) {
  if (!p) return '';
  // F3: two identities, rendered as two rows that can never be read as one.
  return `
    <div class="card">
      <h3>Which JARVIS is this?</h3>
      <div class="row">
        <div><div class="label">Artifact identity</div><div class="detail">${p.artifact.detail}</div></div>
        <span class="state ${p.artifact.state}">${p.artifact.state}</span>
      </div>
      <div class="row">
        <div><div class="label">Execution substrate</div><div class="detail">${p.substrate.detail}</div></div>
        <span class="state ${p.substrate.state}">${p.substrate.state}</span>
      </div>
      ${p.substrate.conflict ? `<div class="errors"><div>Your saved repository choice (${p.substrate.conflict.overridden_config_root}) is NOT in effect. JARVIS_REPO_ROOT governs by design; clear it with <span class="kv">launchctl unsetenv JARVIS_REPO_ROOT</span> then quit and relaunch.</div></div>` : ''}
      ${p.self_binding_satisfied ? '' : '<div class="hint">These are two independent facts. This Desktop cannot yet name both cleanly — treat readings accordingly.</div>'}
    </div>`;
}

function renderHome() {
  const s = lastStatus;
  if (!s) { $main.innerHTML = '<p class="hint">Loading…</p>'; return; }
  const holds = (s.governance_holds || []);
  $main.innerHTML = `
    <div class="convo-input">
      <input id="convo" type="text" placeholder='Ask: "What&apos;s happening?" · "What&apos;s broken?" · "What needs my decision?"'>
    </div>
    <div id="convo-answer"></div>
    ${provenanceRows(s.provenance)}
    <div class="card">
      <h3>Claims — governed action</h3>
      ${renderSessionActions(s.sessions || [])}
    </div>
    <div class="card">
      <h3>Governance holds ${holds.length ? `(${holds.length})` : ''}</h3>
      ${holds.length ? holds.map(h => `<div class="row"><span>${h.unit}${h.id ? ' — ' + h.id : ''}</span><span class="state HELD">${h.claim_state || 'HELD'}</span></div>`).join('') : '<div class="hint">None observed.</div>'}
    </div>
    <div class="card">
      <h3>System health</h3>
      ${stateRow('Builder OS', s.builder_os)}
      ${stateRow('Route A (deterministic)', s.route_a)}
      ${stateRow('Local worker (Ollama)', s.local_worker)}
      ${stateRow('Claude lane', s.claude_lane)}
      ${stateRow('Builder work-unit mechanism', s.builder_mechanism)}
      ${stateRow('Desktop runtime', s.desktop_runtime)}
    </div>
    <div class="hint">Observed ${s.observed_at}</div>
  `;
  document.getElementById('convo').addEventListener('keydown', onConvoKey);
  wireSessionActions();
}

// F2 — the acts offered come from the GOVERNOR's own liveness flags. Desktop
// never invents availability, and never invites an act it knows is refusable.
function renderSessionActions(sessions) {
  if (!sessions.length) return '<div class="hint">No active claims.</div>';
  return sessions.map((sess, i) => {
    const acts = GOV.availableActionsFor(sess);
    const lv = sess.liveness || {};
    return `<div class="claim" data-i="${i}">
      <div class="row">
        <div>
          <div class="label">${sess.session_id} — ${sess.work_unit}</div>
          <div class="detail">${sess.mode || '?'} · ${sess.branch || '?'} · heartbeat ${lv.heartbeat_age_s ?? '?'}s</div>
        </div>
        <span class="state ${lv.claim_state === 'LIVE' ? 'AVAILABLE' : 'HELD'}">${lv.claim_state || '?'}</span>
      </div>
      <div class="acts">
        ${acts.map(a => `<button class="act" data-act="${a}" data-session="${sess.session_id}">${a}</button>`).join('')}
      </div>
      <div class="act-form" id="act-form-${sess.session_id}"></div>
    </div>`;
  }).join('');
}

function wireSessionActions() {
  document.querySelectorAll('button.act').forEach(btn => {
    btn.addEventListener('click', () => openActForm(btn.dataset.session, btn.dataset.act));
  });
}

function openActForm(sessionId, action) {
  const host = document.getElementById(`act-form-${sessionId}`);
  if (!host) return;
  const spec = GOV.ACTIONS[action];
  host.innerHTML = `
    <div class="act-box">
      <div class="hint">${spec.description}</div>
      ${spec.needs_reason ? `<input id="act-reason" type="text" placeholder="Reason — this act is audited">` : ''}
      ${spec.needs_state ? `<select id="act-state">${GOV.CLOSE_STATES.map(v => `<option value="${v}">${v}</option>`).join('')}</select>` : ''}
      <div><button class="primary" id="act-confirm">Confirm ${action}</button>
      <button class="toggle-adv" id="act-cancel">Cancel</button></div>
      <div id="act-result"></div>
    </div>`;
  document.getElementById('act-cancel').addEventListener('click', () => { host.innerHTML = ''; });
  document.getElementById('act-confirm').addEventListener('click', async () => {
    const req = {
      action, sessionId,
      reason: (document.getElementById('act-reason') || {}).value || '',
      state: (document.getElementById('act-state') || {}).value || '',
    };
    const pre = GOV.buildGovernanceArgv(req);
    const out = document.getElementById('act-result');
    if (!pre.ok) { out.innerHTML = `<div class="errors">${pre.errors.map(e => `<div>${e}</div>`).join('')}</div>`; return; }
    const btn = document.getElementById('act-confirm');
    btn.disabled = true; btn.textContent = 'Asking the governor…';
    const res = await window.jarvis.governanceAction(req);
    btn.disabled = false; btn.textContent = `Confirm ${action}`;
    // The governor's verdict, verbatim. A refusal renders as a refusal.
    out.innerHTML = `
      <div class="row"><span class="label">Governor</span><span class="state ${res.outcome === 'ok' ? 'AVAILABLE' : 'UNAVAILABLE'}">${res.label}</span></div>
      ${res.invoked ? `<div class="detail kv">${res.invoked}</div>` : ''}
      ${res.detail ? `<pre>${res.detail}</pre>` : ''}
      ${res.errors && res.errors.length ? `<div class="errors">${res.errors.map(e => `<div>${e}</div>`).join('')}</div>` : ''}`;
    await refreshStatus();
  });
}

function onConvoKey(e) {
  if (e.key !== 'Enter') return;
  const q = e.target.value.trim().toLowerCase();
  const out = document.getElementById('convo-answer');
  if (!lastStatus) return;
  if (q.includes('broken') || q.includes('happening')) {
    const bad = ['builder_os', 'route_a', 'local_worker'].map(k => [k, lastStatus[k]]).filter(([, v]) => v.state !== 'AVAILABLE');
    out.innerHTML = bad.length
      ? `<div class="card"><h3>Not healthy</h3>${bad.map(([k, v]) => stateRow(k, v)).join('')}</div>`
      : `<div class="card"><h3>Status</h3><div class="hint">Everything observed is AVAILABLE.</div></div>`;
  } else if (q.includes('decision') || q.includes('need')) {
    const holds = lastStatus.governance_holds || [];
    out.innerHTML = `<div class="card"><h3>Needs your decision</h3>${holds.length ? holds.map(h => `<div class="row"><span>${h.unit}</span><span class="state HELD">HELD</span></div>`).join('') : '<div class="hint">Nothing held right now.</div>'}</div>`;
  } else if (q.includes('take this') || q.includes('task')) {
    setView('work'); return;
  } else {
    out.innerHTML = `<div class="hint">Try: "What's happening?" · "What's broken?" · "What needs my decision?" · "Take this bounded task."</div>`;
  }
  e.target.value = '';
}

// ---------------------------------------------------------------------------
// Work view.
//
// The C0 lane used to be two free-text boxes: a capability name and raw JSON.
// Prose typed into the name box became a capability identifier, failed
// deterministic matching, and escalated — the router behaving correctly on a
// bad affordance. Fixed HERE, at the interface boundary: the capability comes
// from the registry, the arguments come from the registry's own schema, and
// input that cannot possibly be valid is refused locally instead of being
// spent on a routing decision. Routing, execution, and authority are untouched.
// ---------------------------------------------------------------------------
const CF = window.JarvisCapabilityForm;
const GOV = window.JarvisGovernance;
const PROV = window.JarvisProvenance;

// Wording is derived from what each lane ACTUALLY does in this build — see
// jarvis:submit-task in main.js. C3 promises nothing it does not perform.
const LANE_HELP = {
  c0: '<strong>Deterministic capability.</strong> Choose a registered operation and provide its arguments. No model runs; the result is produced by the same registry the terminal uses.',
  c1: '<strong>Small local task.</strong> Give JARVIS a bounded read-only reasoning task. It runs on the local worker (qwen2.5:7b) and is capped at 4000 input characters — oversized packets are refused, not escalated. Execution is verified; the answer’s correctness is not.',
  c3: '<strong>Needs real reasoning.</strong> The router will select C3 and explain why, but Desktop Alpha does not invoke Claude — doing so would exercise founder identity without an active founder-driven session. The task is routed and shown to you; execution means opening a Claude Code session.',
};

let capManifest = [];
let capRegistryInfo = null;
let capAdvancedMode = false;

async function loadCapabilities() {
  const info = await window.jarvis.getCapabilities();
  capRegistryInfo = info;
  capManifest = info.capabilities || [];
  return info;
}

function renderWork() {
  $main.innerHTML = `
    <div class="card">
      <h3>Submit a bounded task</h3>
      <label class="hint">Lane</label><br>
      <select id="lane-hint" style="margin:8px 0 8px">
        <option value="c0">C0 — deterministic capability</option>
        <option value="c1">C1 — small local task</option>
        <option value="c3">C3 — needs real reasoning</option>
      </select>
      <div class="lane-help" id="lane-help">${LANE_HELP.c0}</div>
      <div id="c0-fields"></div>
      <div id="c1-fields" style="display:none">
        <textarea id="prompt" rows="3" placeholder="Small, bounded prompt for the local model…"></textarea>
      </div>
      <div id="c3-fields" style="display:none">
        <textarea id="description" rows="3" placeholder="Describe the task — router will select C3."></textarea>
      </div>
      <button class="primary" id="submit">Submit</button>
      <div id="local-errors"></div>
    </div>
    <div id="result"></div>
  `;
  const laneHint = document.getElementById('lane-hint');
  laneHint.addEventListener('change', () => {
    document.getElementById('c0-fields').style.display = laneHint.value === 'c0' ? '' : 'none';
    document.getElementById('c1-fields').style.display = laneHint.value === 'c1' ? '' : 'none';
    document.getElementById('c3-fields').style.display = laneHint.value === 'c3' ? '' : 'none';
    document.getElementById('lane-help').innerHTML = LANE_HELP[laneHint.value];
    document.getElementById('local-errors').innerHTML = '';
  });
  document.getElementById('submit').addEventListener('click', submitTask);
  renderC0Fields();
}

function renderC0Fields() {
  const host = document.getElementById('c0-fields');
  if (!host) return;

  if (!capRegistryInfo) { host.innerHTML = '<div class="hint">Reading the deterministic registry…</div>'; return; }
  if (!capRegistryInfo.available) {
    host.innerHTML = `<div class="errors"><div>Capability registry unavailable — ${capRegistryInfo.reason}</div></div>
      <div class="hint">No capability list is shown rather than a stale one.</div>`;
    return;
  }

  // Built ONCE. Filtering must never re-render this subtree: recreating the
  // filter input mid-keystroke destroys the focused element and the founder
  // walk showed exactly that — only the first character survived. Only the
  // <select>'s options are rewritten as you type.
  host.innerHTML = `
    <input id="cap-filter" type="text" placeholder="Filter capabilities…" style="margin-bottom:8px">
    <select id="capability-select" style="width:100%;margin-bottom:6px"></select>
    <div class="cap-meta" id="cap-meta"></div>
    <div id="cap-args"></div>
    <button class="toggle-adv" id="toggle-adv">Advanced: JSON arguments →</button>
    <div id="cap-advanced" style="display:none">
      <textarea id="cap-args-json" rows="3" placeholder='{"dir":"app/api"}'></textarea>
    </div>
    <div class="hint">${capRegistryInfo.count} capabilities registered · read from ${capRegistryInfo.source}</div>
  `;

  capAdvancedMode = false;
  document.getElementById('cap-filter').addEventListener('input', applyCapabilityFilter);
  document.getElementById('capability-select').addEventListener('change', renderArgFields);
  document.getElementById('toggle-adv').addEventListener('click', toggleAdvanced);
  applyCapabilityFilter();
}

function applyCapabilityFilter() {
  const filterEl = document.getElementById('cap-filter');
  const sel = document.getElementById('capability-select');
  if (!filterEl || !sel) return;
  const q = filterEl.value.trim().toLowerCase();
  const shown = q ? capManifest.filter(c => c.name.toLowerCase().includes(q)) : capManifest;
  const keep = sel.value;
  sel.innerHTML = shown.length
    ? shown.map(c => `<option value="${c.name}">${c.name}</option>`).join('')
    : '<option value="">— no match —</option>';
  if (shown.some(c => c.name === keep)) sel.value = keep;
  renderArgFields();
}

function toggleAdvanced() {
  capAdvancedMode = !capAdvancedMode;
  document.getElementById('toggle-adv').textContent = capAdvancedMode ? '← Structured arguments' : 'Advanced: JSON arguments →';
  document.getElementById('cap-advanced').style.display = capAdvancedMode ? '' : 'none';
  document.getElementById('cap-args').style.display = capAdvancedMode ? 'none' : '';
}

function renderArgFields() {
  const sel = document.getElementById('capability-select');
  const meta = document.getElementById('cap-meta');
  const box = document.getElementById('cap-args');
  if (!sel || !box || !meta) return;
  const entry = CF.findCapability(capManifest, sel.value);
  if (!entry) { meta.textContent = ''; box.innerHTML = ''; return; }

  // The registry declares no descriptions. Say so, rather than inventing one.
  meta.textContent = entry.has_schema
    ? `${entry.args.length} argument(s) declared · registry exposes no description for this capability`
    : 'Registry declares no argument schema for this capability — use Advanced JSON.';

  box.style.display = capAdvancedMode ? 'none' : '';
  if (!entry.has_schema || entry.args.length === 0) {
    box.innerHTML = entry.has_schema ? '<div class="hint">This capability takes no arguments.</div>' : '';
    return;
  }

  box.innerHTML = entry.args.map(a => {
    const id = `arg-${a.name}`;
    const constraints = [];
    if (a.maxLength !== undefined) constraints.push(`max length ${a.maxLength}`);
    if (a.min !== undefined) constraints.push(`min ${a.min}`);
    if (a.max !== undefined) constraints.push(`max ${a.max}`);
    if (!a.required) constraints.push('optional — leave blank to use the capability’s own default');
    const field = a.type === 'enum'
      ? `<select id="${id}" style="width:100%"><option value=""></option>${a.enum.map(v => `<option value="${v}">${v}</option>`).join('')}</select>`
      : `<input id="${id}" type="text" placeholder="${a.type}">`;
    return `<div class="arg-field">
      <label for="${id}">${a.name}${a.required ? '<span class="req">*</span>' : ''} <span style="color:#55555c">(${a.type})</span></label>
      ${field}
      ${constraints.length ? `<div class="constraint">${constraints.join(' · ')}</div>` : ''}
    </div>`;
  }).join('');
}

function showLocalErrors(errors) {
  document.getElementById('local-errors').innerHTML = errors.length
    ? `<div class="errors">${errors.map(e => `<div>${e}</div>`).join('')}</div>`
    : '';
}

async function submitTask() {
  const laneHint = document.getElementById('lane-hint').value;
  showLocalErrors([]);
  let task;

  if (laneHint === 'c0') {
    // PRE-SUBMIT GATE. Invalid C0 input is refused here — it is never sent to
    // the router merely to discover that it is invalid.
    const sel = document.getElementById('capability-select');
    const check = CF.validateSubmission({
      manifest: capManifest,
      capabilityName: sel ? sel.value : '',
      mode: capAdvancedMode ? 'advanced' : 'structured',
      rawValues: readStructuredValues(sel ? sel.value : ''),
      advancedText: (document.getElementById('cap-args-json') || {}).value || '',
    });
    if (!check.ok) { showLocalErrors(check.errors); return; }
    task = check.task; // identical payload shape to what is valid today
  } else if (laneHint === 'c1') {
    const p = document.getElementById('prompt').value;
    task = { bounded_for_local: true, input_chars: p.length, prompt: p };
  } else {
    task = { description: document.getElementById('description').value };
  }

  const btn = document.getElementById('submit');
  btn.disabled = true; btn.textContent = 'Routing…';
  const res = await window.jarvis.submitTask(task);
  btn.disabled = false; btn.textContent = 'Submit';
  renderResult(res);
}

function readStructuredValues(capName) {
  const entry = CF.findCapability(capManifest, capName);
  if (!entry) return {};
  const out = {};
  for (const a of entry.args) {
    const el = document.getElementById(`arg-${a.name}`);
    if (el) out[a.name] = el.value;
  }
  return out;
}

function renderResult(res) {
  const laneClass = res.execution_lane || 'C3';
  const t = res.task || {};
  const invocation = t.capability
    ? `<div class="card">
        <h3>Invocation</h3>
        <div class="row"><span class="label">Capability</span><span class="kv">${t.capability}</span></div>
        <div class="row"><span class="label">Arguments</span><span class="kv">${JSON.stringify(t.args || {})}</span></div>
        <div class="row"><span class="label">Execution status</span><span class="kv">${res.status}</span></div>
        <div class="row"><span class="label">Verification status</span><span class="kv">${CF.describeVerification(res.verification)}</span></div>
      </div>`
    : '';

  document.getElementById('result').innerHTML = `
    ${invocation}
    <div class="card">
      <h3>Result</h3>
      <div class="row"><span class="label">Selected lane</span><span class="lane-badge ${laneClass}">${res.execution_lane || 'REJECTED'}</span></div>
      <div class="row"><span class="label">Cost class</span><span>${res.cost_class || '—'}</span></div>
      <div class="row"><span class="label">Status</span><span>${res.status}</span></div>
      <div class="row"><span class="label">Reason</span><span style="text-align:right;max-width:400px">${res.reason}</span></div>
      ${res.verification ? `<div class="row"><span class="label">${res.verification.label || 'Verification'}</span><span class="state ${res.verification.pass ? 'AVAILABLE' : 'UNAVAILABLE'}">${res.verification.pass ? 'PASS' : 'FAIL'}</span></div>` : ''}
      ${res.verification && res.verification.kind === 'execution' ? `<div class="row"><span class="label">Result correctness</span><span class="state ${res.verification.correctness === 'verified' ? 'AVAILABLE' : res.verification.correctness === 'failed' ? 'UNAVAILABLE' : 'UNKNOWN'}">${res.verification.correctness.toUpperCase()}</span></div>` : ''}
      ${res.verification && res.verification.correctness_reason ? `<div class="row"><span class="label">Correctness basis</span><span style="text-align:right;max-width:400px">${res.verification.correctness_reason}</span></div>` : ''}
      <h3 style="margin-top:14px">Raw result</h3>
      <pre>${JSON.stringify(res.result, null, 2)}</pre>
    </div>
  `;
}

function renderSystem() {
  const s = lastStatus;
  if (!s) { $main.innerHTML = '<p class="hint">Loading…</p>'; return; }
  $main.innerHTML = `
    <div class="card">
      <h3>Truthful system state — no invented green states</h3>
      ${stateRow('Builder OS', s.builder_os)}
      ${stateRow('Route A', s.route_a)}
      ${stateRow('Local worker', s.local_worker)}
      ${stateRow('Claude lane', s.claude_lane)}
      ${stateRow('Builder work-unit mechanism', s.builder_mechanism)}
      ${stateRow('Desktop runtime', s.desktop_runtime)}
      ${stateRow('Memory / Postgres', { state: 'UNKNOWN', detail: 'Not probed by Desktop Alpha — no reachability check wired.' })}
      ${stateRow('Production', { state: 'UNKNOWN', detail: 'Not probed by Desktop Alpha — requires SSH; out of scope for a local console.' })}
    </div>
    ${provenanceRows(s.provenance)}
    <div class="card">
      <h3>Builder OS detail</h3>
      <pre>${JSON.stringify(s.builder_os.detail, null, 2)}</pre>
    </div>
  `;
}

function render() {
  if (currentView === 'home') renderHome();
  else if (currentView === 'work') renderWork();
  else if (currentView === 'system') renderSystem();
}

(async function init() {
  render();
  await Promise.all([refreshStatus(), loadCapabilities()]);
  render();
  setInterval(async () => { await refreshStatus(); if (currentView === 'home' || currentView === 'system') render(); }, 15000);
})();
