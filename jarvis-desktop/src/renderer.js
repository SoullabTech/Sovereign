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

function renderWork() {
  $main.innerHTML = `
    <div class="card">
      <h3>Submit a bounded task</h3>
      <label class="hint">Lane hint</label><br>
      <select id="lane-hint" style="margin:8px 0 12px">
        <option value="c0">C0 — deterministic capability</option>
        <option value="c1">C1 — small local task</option>
        <option value="c3">C3 — needs real reasoning</option>
      </select>
      <div id="c0-fields">
        <input id="capability" type="text" placeholder="capability name, e.g. inventory.routes" style="margin-bottom:8px">
        <input id="cap-args" type="text" placeholder='args as JSON, e.g. {"dir":"app/api"}'>
      </div>
      <div id="c1-fields" style="display:none">
        <textarea id="prompt" rows="3" placeholder="Small, bounded prompt for the local model…"></textarea>
      </div>
      <div id="c3-fields" style="display:none">
        <textarea id="description" rows="3" placeholder="Describe the task — router will select C3."></textarea>
      </div>
      <button class="primary" id="submit">Submit</button>
    </div>
    <div id="result"></div>
  `;
  const laneHint = document.getElementById('lane-hint');
  laneHint.addEventListener('change', () => {
    document.getElementById('c0-fields').style.display = laneHint.value === 'c0' ? '' : 'none';
    document.getElementById('c1-fields').style.display = laneHint.value === 'c1' ? '' : 'none';
    document.getElementById('c3-fields').style.display = laneHint.value === 'c3' ? '' : 'none';
  });
  document.getElementById('submit').addEventListener('click', submitTask);
}

async function submitTask() {
  const laneHint = document.getElementById('lane-hint').value;
  const btn = document.getElementById('submit');
  btn.disabled = true; btn.textContent = 'Routing…';
  let task;
  if (laneHint === 'c0') {
    let args = {};
    try { args = JSON.parse(document.getElementById('cap-args').value || '{}'); } catch { /* leave empty */ }
    task = { capability: document.getElementById('capability').value.trim(), args };
  } else if (laneHint === 'c1') {
    const p = document.getElementById('prompt').value;
    task = { bounded_for_local: true, input_chars: p.length, prompt: p };
  } else {
    task = { description: document.getElementById('description').value };
  }

  const res = await window.jarvis.submitTask(task);
  btn.disabled = false; btn.textContent = 'Submit';

  const laneClass = res.execution_lane || 'C3';
  document.getElementById('result').innerHTML = `
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
  await refreshStatus();
  render();
  setInterval(async () => { await refreshStatus(); if (currentView === 'home' || currentView === 'system') render(); }, 15000);
})();
