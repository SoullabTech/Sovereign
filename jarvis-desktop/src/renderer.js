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

function renderHome() {
  const s = lastStatus;
  if (!s) { $main.innerHTML = '<p class="hint">Loading…</p>'; return; }
  const holds = (s.governance_holds || []);
  $main.innerHTML = `
    <div class="convo-input">
      <input id="convo" type="text" placeholder='Ask: "What&apos;s happening?" · "What&apos;s broken?" · "What needs my decision?"'>
    </div>
    <div id="convo-answer"></div>
    <div class="card">
      <h3>System health</h3>
      ${stateRow('Builder OS', s.builder_os)}
      ${stateRow('Route A (deterministic)', s.route_a)}
      ${stateRow('Local worker (Ollama)', s.local_worker)}
      ${stateRow('Claude lane', s.claude_lane)}
      ${stateRow('Desktop runtime', s.desktop_runtime)}
    </div>
    <div class="card">
      <h3>Governance holds ${holds.length ? `(${holds.length})` : ''}</h3>
      ${holds.length ? holds.map(h => `<div class="row"><span>${h.unit}${h.id ? ' — ' + h.id : ''}</span><span class="state HELD">${h.claim_state || 'HELD'}</span></div>`).join('') : '<div class="hint">None observed.</div>'}
    </div>
    <div class="hint">Observed ${s.observed_at} · repo ${s.repo_root}</div>
  `;
  document.getElementById('convo').addEventListener('keydown', onConvoKey);
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

  const filter = (document.getElementById('cap-filter') || {}).value || '';
  const q = filter.trim().toLowerCase();
  const shown = q ? capManifest.filter(c => c.name.toLowerCase().includes(q)) : capManifest;
  const selected = (document.getElementById('capability-select') || {}).value || (shown[0] && shown[0].name) || '';

  host.innerHTML = `
    <input id="cap-filter" type="text" placeholder="Filter capabilities…" value="${filter}" style="margin-bottom:8px">
    <select id="capability-select" style="width:100%;margin-bottom:6px">
      ${shown.map(c => `<option value="${c.name}"${c.name === selected ? ' selected' : ''}>${c.name}</option>`).join('') || '<option value="">— no match —</option>'}
    </select>
    <div class="cap-meta" id="cap-meta"></div>
    <div id="cap-args"></div>
    <button class="toggle-adv" id="toggle-adv">${capAdvancedMode ? '← Structured arguments' : 'Advanced: JSON arguments →'}</button>
    <div id="cap-advanced" style="display:${capAdvancedMode ? '' : 'none'}">
      <textarea id="cap-args-json" rows="3" placeholder='{"dir":"app/api"}'></textarea>
    </div>
    <div class="hint">${capRegistryInfo.count} capabilities registered · read from ${capRegistryInfo.source}</div>
  `;

  document.getElementById('cap-filter').addEventListener('input', renderC0Fields);
  document.getElementById('capability-select').addEventListener('change', renderArgFields);
  document.getElementById('toggle-adv').addEventListener('click', () => {
    capAdvancedMode = !capAdvancedMode;
    renderC0Fields();
  });
  renderArgFields();
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
      ${res.verification && res.verification.kind === 'execution' ? `<div class="row"><span class="label">Result correctness</span><span class="state UNKNOWN">${res.verification.correctness.toUpperCase()}</span></div>` : ''}
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
      ${stateRow('Desktop runtime', s.desktop_runtime)}
      ${stateRow('Memory / Postgres', { state: 'UNKNOWN', detail: 'Not probed by Desktop Alpha — no reachability check wired.' })}
      ${stateRow('Production', { state: 'UNKNOWN', detail: 'Not probed by Desktop Alpha — requires SSH; out of scope for a local console.' })}
    </div>
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
