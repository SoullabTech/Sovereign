const $main = document.getElementById('main');
let currentView = 'home';
let lastStatus = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

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
  // JOP-01: both now go through the same derivation as every other row, so an
  // unstamped dev build reads as "no stamp, normal from source" rather than a
  // bare UNKNOWN that contradicts the headline.
  return `
    <div class="card">
      <h3>Which JARVIS is this?</h3>
      ${organRow(JarvisLegibility.describeProvenanceRow('Artifact identity', p.artifact))}
      ${organRow(JarvisLegibility.describeProvenanceRow('Execution substrate', p.substrate))}
      ${p.substrate.conflict ? `<div class="precedence">
        <b>Two answers exist, and the environment is winning — by design.</b>
        JARVIS is operating on <span class="kv">${p.substrate.conflict.governing}</span> because
        <span class="kv">JARVIS_REPO_ROOT</span> takes precedence. Your saved choice
        (<span class="kv">${p.substrate.conflict.overridden_config_root}</span>) is not in effect.
        Nothing is broken — this is flagged so the substrate is never silently substituted.
        To use your saved choice instead: <span class="kv">launchctl unsetenv JARVIS_REPO_ROOT</span>, then quit and relaunch.
      </div>` : ''}
      ${p.self_binding_satisfied ? '' : '<div class="hint">Which build this is, and which checkout it is operating on, are two separate facts — and right now they do not both have a confirmed answer. Nothing is wrong; it means you cannot yet say "this build was made from this checkout".</div>'}
    </div>`;
}

// JOP-01 — every non-ready organ renders STATE · REASON · REMEDIATION · SOURCE.
// A state badge with no reason is not an acceptable founder-facing fact; that
// is the whole defect this unit exists to remove.
function organRow(o) {
  // Order matters: WHAT IT IS, then what's wrong, then what to do. A row must
  // never bottom out at an internal identifier — that is a legible-looking
  // screen rather than a legible one.
  return `<div class="row">
    <div>
      <div class="label">${o.name}</div>
      ${o.describes ? `<div class="why">${o.describes}</div>` : ''}
      ${o.note ? `<div class="why">${o.note}</div>` : ''}
      ${o.reason ? `<div class="why">${o.reason}</div>` : ''}
      ${o.remediation ? `<div class="fix">→ ${o.remediation}</div>`
        : (o.state !== 'READY' && o.by_design ? '<div class="fix">→ No operator action grants this. It is absent by design.</div>' : '')}
    </div>
    <span class="state ${o.state}">${o.state.replace('_', ' ')}</span>
  </div>`;
}

/**
 * ACTIVE WORKSPACE — the first thing Home answers, because it is the first
 * thing every other panel depends on.
 *
 * JOP-04. The founder walk of 2026-08-17 ended at Work with "repo root not
 * found — cannot route", which is the LAST place that fact should surface: by
 * then a task has been composed and submitted, and the failure reads as a
 * routing malfunction rather than as an unbound workspace. Home now states the
 * binding before any work is composed, so the first useful error arrives
 * before the founder has spent anything on it.
 *
 * `ws` is the SAME resolution the router uses, carried on the status payload —
 * not an independent read. A panel that re-derived the binding could agree with
 * the screen and disagree with the router, which is the exact class of drift
 * this console exists to make impossible.
 */
function renderActiveWorkspace(ws, b) {
  // Older status shapes have no `workspace`. Fall back to the binding view
  // rather than rendering an empty card that reads as "no workspace".
  if (!ws) {
    return `<div class="card"><h3>Active workspace</h3>
      <div class="row"><div><div class="label">${b.bound ? b.root : 'No repository connected'}</div>
      <div class="src">source: live status · workspace detail unavailable from this build</div></div>
      <span class="state ${b.state}">${b.state.replace('_', ' ')}</span></div></div>`;
  }

  const actions = `
    <div class="ws-actions">
      <button id="ws-change">Change Workspace…</button>
      <button id="ws-refresh">Refresh</button>
      ${ws.bound ? '<button id="ws-reveal">Reveal in Finder</button>' : ''}
    </div>`;

  if (!ws.bound) {
    // Named, not vague. The resolver already knows WHICH condition this is —
    // never configured, configured-but-moved, or launched from a checkout
    // without the markers — and that sentence is worth more than a red dot.
    return `<div class="card">
      <h3>Active workspace</h3>
      <div class="row">
        <div>
          <div class="label">No workspace bound</div>
          <div class="why">${ws.problem || 'no repository is bound'}</div>
          <div class="fix">→ Choose a repository to bind. It must be a git worktree carrying the canonical Builder OS markers.</div>
          <div class="src">source: live status · resolution ${ws.resolution}</div>
        </div>
        <span class="state NEEDS_SETUP">NEEDS SETUP</span>
      </div>
      ${actions}
    </div>`;
  }

  // Bound, but not a git worktree. Rare and worth its own sentence: the markers
  // can all be present in a plain directory copy, and that is a real hazard —
  // it is how a non-checkout ends up looking like a checkout.
  const gitLine = ws.git_connected
    ? `<span class="kv">${ws.branch || '?'}</span> · <span class="kv">${ws.head || '?'}</span> · ${ws.dirty === null ? 'worktree unread' : ws.dirty ? 'dirty' : 'clean'}`
    : '<span class="why">not a git worktree — JARVIS can read the markers here but cannot read a branch or HEAD</span>';

  return `<div class="card">
    <h3>Active workspace</h3>
    <div class="row">
      <div>
        <div class="label">${ws.name}</div>
        <div class="path">${ws.root}</div>
        <div class="ws-git">Git: ${ws.git_connected ? 'connected' : 'not connected'} · ${gitLine}</div>
        <div class="src">source: live status · resolution ${ws.resolution}</div>
      </div>
      <span class="state ${ws.git_connected ? 'READY' : 'DEGRADED'}">${ws.git_connected ? 'READY' : 'DEGRADED'}</span>
    </div>
    ${actions}
  </div>`;
}

function wireWorkspaceActions() {
  const change = document.getElementById('ws-change');
  const refresh = document.getElementById('ws-refresh');
  const reveal = document.getElementById('ws-reveal');
  // Rebinding re-resolves in main and broadcasts; refresh() then redraws from
  // the new status rather than from anything this function remembers.
  if (change) change.onclick = async () => { await window.jarvis.chooseRepo(); await refreshStatus(); };
  if (refresh) refresh.onclick = () => refreshStatus();
  if (reveal) reveal.onclick = () => window.jarvis.revealWorkspace();
}

function renderHome() {
  const s = lastStatus;
  if (!s) { $main.innerHTML = '<p class="hint">Loading…</p>'; return; }
  const v = JarvisLegibility.deriveOperatorView(s);
  const b = v.binding;
  const group = (title, list) => list.length
    ? `<div class="card"><h3>${title}</h3>${list.map(organRow).join('')}</div>` : '';

  $main.innerHTML = `
    <div class="convo-input">
      <input id="convo" type="text" placeholder="What do you want to happen?">
    </div>
    <div id="convo-answer"></div>

    <div class="card">
      <p class="headline">${v.headline}</p>
      <p class="sentence">${v.sentence}</p>
    </div>

    ${renderActiveWorkspace(s.workspace, b)}

    <div class="card">
      <h3>Needs you ${v.needs_founder.items.length ? `(${v.needs_founder.items.length})` : ''}</h3>
      ${v.needs_founder.items.length
        ? v.needs_founder.items.map(h => `<div class="row">
            <div>
              <div class="label">${h.unit}${h.id ? ` — ${h.id}` : ''}</div>
              <div class="why">${h.means}</div>
              <div class="fix">→ ${h.remediation}</div>
            </div>
            <span class="state HELD">${h.claim_state || 'HELD'}</span>
          </div>`).join('')
        : `<div class="hint">${v.needs_founder.summary}</div>`}
    </div>

    <div class="card">
      <h3>Active work</h3>
      <div class="hint">${v.active_work.summary}</div>
      ${v.active_work.sessions.length ? renderSessionActions(v.active_work.sessions) : ''}
    </div>

    ${group('Can do now', v.capabilities.available)}
    ${group('Not working / not verified', v.capabilities.unverified)}
    ${group('Not authorized', v.capabilities.not_authorized)}

    ${provenanceRows(s.provenance)}
    <div class="hint">Observed ${v.observed_at || 'unknown'}</div>
  `;
  document.getElementById('convo').addEventListener('keydown', onConvoKey);
  wireWorkspaceActions();
  if (v.active_work.sessions.length) wireSessionActions();
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
    const draft = e.target.value.trim();
    if (draft && !/^take this( bounded)? task[.!]?$/i.test(draft)) sessionStorage.setItem('jarvis:draft-intent', draft);
    setView('work'); return;
  } else {
    // Ordinary founder prose is an intent, not an error message. Carry it into
    // Work rather than forcing the founder to learn command phrases first.
    sessionStorage.setItem('jarvis:draft-intent', e.target.value.trim());
    setView('work'); return;
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
const OF = window.JarvisOperatorFlow;
const OWU = window.JarvisOperatorWorkUnit;
let providerCatalog = [];
let activeWorkUnitId = sessionStorage.getItem('jarvis:active-work-unit') || null;
let activeWorkUnitStrategy = [];
let workUnitPollTimer = null;

// Wording is derived from what each lane ACTUALLY does in this build — see
// jarvis:submit-task in main.js. C3 promises nothing it does not perform.
const LANE_HELP = {
  c0: '<strong>Deterministic capability.</strong> Choose a registered operation and provide its arguments. No model runs; the result is produced by the same registry the terminal uses.',
  c1: '<strong>Small local task.</strong> Give JARVIS a bounded read-only reasoning task. It runs on the local worker (qwen2.5:7b) and is capped at 4000 input characters — oversized packets are refused, not escalated. Execution is verified; the answer’s correctness is not.',
  c3: '<strong>Needs frontier reasoning.</strong> Routing still does not execute C3. After routing, you may explicitly send only the approved task text to Nemotron 3 Ultra. The free endpoint is external/trial-scoped: do not include member data, private transcripts, secrets, credentials, or confidential material.',
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

function renderOperatorPlan(plan) {
  return `<div class="run-plan">
    <div class="plan-title">${escapeHtml(plan.title)}</div>
    <div class="plan-line"><b>Execution:</b> ${escapeHtml(plan.execution)}</div>
    <div class="plan-line"><b>Privacy:</b> ${escapeHtml(plan.privacy)}</div>
    <div class="plan-line"><b>Intelligence:</b> ${escapeHtml(plan.model)}</div>
  </div>`;
}

function providerById(id) {
  return providerCatalog.find(p => p.id === id) || null;
}

function providerStateClass(state) {
  if (state === 'AVAILABLE') return 'AVAILABLE';
  if (state === 'NEEDS_SETUP') return 'NEEDS_SETUP';
  if (state === 'FAILED') return 'UNAVAILABLE';
  return 'UNKNOWN';
}

function renderProviderState(id, targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const p = providerById(id);
  if (!p) {
    el.className = 'state UNKNOWN';
    el.textContent = 'UNVERIFIED';
    return;
  }
  el.className = `state ${providerStateClass(p.state)}`;
  el.textContent = p.state.replace('_', ' ');
  el.title = p.detail || '';
}

async function loadProviderCatalog() {
  const out = await window.jarvis.workUnitAction({ action: 'providers' });
  providerCatalog = out?.ok ? (out.providers || []) : [];
  renderProviderState('qwen-local', 'wu-qwen-status');
  renderProviderState('gpt-oss-local', 'wu-gpt-oss-status');
  renderProviderState('nemotron-zen', 'wu-nemotron-status');
  renderProviderState('inkling-tinker', 'wu-inkling-status');
  const err = document.getElementById('wu-provider-error');
  if (err) err.textContent = out?.ok ? '' : (out?.reason || 'Provider status unavailable.');
}

function currentWorkUnitProviders() {
  const out = [];
  if (document.getElementById('wu-qwen')?.checked) out.push('qwen-local');
  if (document.getElementById('wu-gpt-oss')?.checked) out.push('gpt-oss-local');
  if (document.getElementById('wu-nemotron')?.checked) out.push('nemotron-zen');
  if (document.getElementById('wu-inkling')?.checked) out.push('inkling-tinker');
  return out;
}

function syncWorkUnitComposer() {
  const providers = currentWorkUnitProviders();
  const inkling = providers.includes('inkling-tinker');
  const external = providers.includes('nemotron-zen') || inkling;
  const local = providers.includes('qwen-local') || providers.includes('gpt-oss-local');
  const repoWrap = document.getElementById('wu-repo-wrap');
  const spendWrap = document.getElementById('wu-spend-wrap');
  if (repoWrap) repoWrap.style.display = external ? 'block' : 'none';
  if (spendWrap) spendWrap.style.display = inkling ? 'block' : 'none';
  const authority = document.getElementById('wu-authority-preview');
  if (authority) {
    const repoOk = !!document.getElementById('wu-repo-ok')?.checked;
    const spendOk = !!document.getElementById('wu-spend-ok')?.checked;
    authority.innerHTML = `<div class="authority-box">
      <div class="a-title">Authority preview</div>
      <div class="a-line">Local review: <b>${local ? 'read-only; stays on this Mac' : 'not selected'}</b></div>
      <div class="a-line">External repository disclosure: <b>${external ? (repoOk ? 'authorized' : 'held') : 'not requested'}</b></div>
      <div class="a-line">Provider spend: <b>${inkling ? (spendOk ? 'authorized for Inkling' : 'held') : 'not requested'}</b></div>
      <div class="a-line">Write / production / deploy / authority change: <b>denied</b></div>
      <div class="a-line">Integration actor: <b>Kelly / founder</b></div>
    </div>`;
  }
}

function workUnitSpecFromForm() {
  return {
    objective: document.getElementById('wu-objective')?.value || '',
    acceptanceCriteria: document.getElementById('wu-acceptance')?.value || '',
    evidenceFocus: document.getElementById('wu-evidence')?.value || '',
    providers: currentWorkUnitProviders(),
    externalRepoOk: !!document.getElementById('wu-repo-ok')?.checked,
    providerSpendOk: !!document.getElementById('wu-spend-ok')?.checked,
  };
}

function showWorkUnitErrors(errors) {
  const host = document.getElementById('wu-errors');
  if (!host) return;
  host.innerHTML = errors?.length
    ? `<div class="errors">${errors.map(e => `<div>${escapeHtml(e)}</div>`).join('')}</div>`
    : '';
}

function stageClass(done, running, held = false) {
  return held ? 'held' : running ? 'running' : done ? 'done' : '';
}

function attemptMatchesProvider(attempt, providerId) {
  const model = String(attempt?.model || '');
  if (providerId === 'qwen-local') return model === 'ollama/qwen3-coder:30b';
  if (providerId === 'gpt-oss-local') return model === 'ollama/gpt-oss:20b';
  if (providerId === 'nemotron-zen') return model === 'opencode/nemotron-3-ultra-free' || model === 'opencode/nemotron-3.5-lightning-free';
  if (providerId === 'inkling-tinker') return model === 'tinker/thinkingmachines/Inkling-Small' || model === 'tinker/thinkingmachines/Inkling';
  return false;
}

function nextActionForReconciliation(r) {
  switch (r?.standing) {
    case 'REPAIR_BEFORE_WITNESS': return 'Repair the failed/rejected attempt before a founder witness.';
    case 'NEEDS_KELLY': return 'A founder ruling is required before this Work Unit can continue.';
    case 'REVIEW_DISAGREEMENT': return 'Read both provider outputs. JARVIS will not choose between conflicting recommendations automatically.';
    case 'EVIDENCE_PRESENTED': return 'Evidence is presented. Kelly may adjudicate the next gate or proceed to a human witness if the programme requires one.';
    case 'SECOND_REVIEW_OWED': return 'Run the independent second provider review.';
    default: return 'Run the first provider attempt.';
  }
}

function renderWorkUnitSnapshot(snapshot, { runningProvider = null, transientError = null } = {}) {
  const host = document.getElementById('work-unit-live');
  if (!host) return;
  if (!snapshot?.ok || !snapshot.work_unit) {
    host.innerHTML = transientError ? `<div class="errors"><div>${escapeHtml(transientError)}</div></div>` : '';
    return;
  }
  const wu = snapshot.work_unit;
  const strategy = snapshot.provider_strategy || activeWorkUnitStrategy || [];
  activeWorkUnitStrategy = strategy;
  const attempts = snapshot.reconciliation?.attempts || [];
  const rec = snapshot.reconciliation || { standing: 'NOT_RUN', summary: 'No attempts yet.', attempts: [] };
  const qwenDone = attempts.some(a => attemptMatchesProvider(a, 'qwen-local'));
  const ossDone = attempts.some(a => attemptMatchesProvider(a, 'gpt-oss-local'));
  const nemDone = attempts.some(a => attemptMatchesProvider(a, 'nemotron-zen'));
  const inkDone = attempts.some(a => attemptMatchesProvider(a, 'inkling-tinker'));
  const allSelectedDone = strategy.every(p => attempts.some(a => attemptMatchesProvider(a, p)));
  const active = wu.active_execution;

  const attemptHtml = attempts.length ? attempts.map(a => `<div class="attempt-card">
    <div class="attempt-head"><span>#${escapeHtml(a.attempt_number || '?')} · ${escapeHtml(a.model || a.lane || 'unknown worker')}</span><span>${escapeHtml(a.test_results || 'not_run')}</span></div>
    <div class="why">exit ${a.exit_code ?? '?'} · next ${escapeHtml(a.recommended_next_action || 'unreported')} · ${escapeHtml(String(a.duration_s ?? '?'))}s</div>
    ${a.unresolved_questions?.length ? `<div class="why">Unresolved: ${a.unresolved_questions.map(escapeHtml).join(' · ')}</div>` : ''}
    ${a.output_excerpt ? `<details><summary class="toggle-adv">Review output</summary><pre>${escapeHtml(a.output_excerpt)}</pre></details>` : ''}
  </div>`).join('') : '<div class="hint">No provider attempt has run yet.</div>';

  const disagreements = rec.disagreements?.length
    ? `<div class="errors">${rec.disagreements.map(d => `<div>${escapeHtml(d)}</div>`).join('')}</div>` : '';
  const needsKelly = rec.needs_kelly
    ? `<div class="needs-kelly"><b>Needs Kelly</b><div class="why">${escapeHtml(rec.summary)}</div><div class="fix">→ ${escapeHtml(nextActionForReconciliation(rec))}</div></div>`
    : `<div class="run-plan"><div class="plan-title">Reconciliation · ${escapeHtml(rec.standing)}</div><div class="plan-line">${escapeHtml(rec.summary)}</div><div class="plan-line">Next: ${escapeHtml(nextActionForReconciliation(rec))}</div></div>`;

  host.innerHTML = `<div class="card">
    <h3>JARVIS Run</h3>
    <div class="row"><div><div class="label">${escapeHtml(wu.identity?.title || activeWorkUnitId)}</div><div class="src">${escapeHtml(activeWorkUnitId)} · @${escapeHtml(String(wu.workspace?.canonical_sha || '').slice(0, 12))}</div></div><span class="state AVAILABLE">${escapeHtml(wu.lifecycle_state || 'ready')}</span></div>
    <div class="stage-list">
      <span class="stage-pill done">Authority bound</span>
      <span class="stage-pill done">Work Unit created</span>
      ${strategy.includes('qwen-local') ? `<span class="stage-pill ${stageClass(qwenDone, runningProvider === 'qwen-local')}">Qwen coding review</span>` : ''}
      ${strategy.includes('gpt-oss-local') ? `<span class="stage-pill ${stageClass(ossDone, runningProvider === 'gpt-oss-local')}">GPT-OSS reasoning review</span>` : ''}
      ${strategy.includes('nemotron-zen') ? `<span class="stage-pill ${stageClass(nemDone, runningProvider === 'nemotron-zen')}">Nemotron external review</span>` : ''}
      ${strategy.includes('inkling-tinker') ? `<span class="stage-pill ${stageClass(inkDone, runningProvider === 'inkling-tinker', providerById('inkling-tinker')?.state === 'NEEDS_SETUP' && !inkDone)}">Inkling external review</span>` : ''}
      <span class="stage-pill ${stageClass(allSelectedDone, false, !allSelectedDone && attempts.length > 0)}">Reconciliation</span>
      <span class="stage-pill ${rec.needs_kelly || rec.standing === 'EVIDENCE_PRESENTED' ? 'held' : ''}">Founder gate</span>
    </div>
    <div class="authority-box">
      <div class="a-title">Authority actually held</div>
      <div class="a-line">Allowed: ${escapeHtml((wu.authority?.authorized_acts || []).join(' · '))}</div>
      <div class="a-line">Denied: ${escapeHtml((wu.authority?.not_authorized_acts || []).join(' · '))}</div>
      <div class="a-line">Integration actor: ${escapeHtml(wu.authority?.integration_actor || 'founder')}</div>
    </div>
    ${active ? `<div class="why">Active Builder claim: ${escapeHtml(active.session_id)} · ${escapeHtml(active.model || '')}</div>` : ''}
    ${transientError ? `<div class="errors"><div>${escapeHtml(transientError)}</div></div>` : ''}
    <div style="margin-top:10px">
      <button class="primary" id="wu-run-strategy" ${runningProvider ? 'disabled' : ''}>${runningProvider ? `Running ${escapeHtml(runningProvider)}…` : 'Run remaining strategy'}</button>
      <button class="act" id="wu-refresh">Refresh evidence</button>
      ${active ? '<button class="act" id="wu-release">Release execution claim</button>' : ''}
    </div>
    <h3 style="margin-top:16px">Provider attempts</h3>
    ${attemptHtml}
    ${disagreements}
    ${needsKelly}
  </div>`;

  document.getElementById('wu-refresh')?.addEventListener('click', refreshActiveWorkUnit);
  document.getElementById('wu-run-strategy')?.addEventListener('click', runRemainingStrategy);
  document.getElementById('wu-release')?.addEventListener('click', releaseActiveWorkUnitClaim);
}

async function refreshActiveWorkUnit() {
  if (!activeWorkUnitId) return;
  const snapshot = await window.jarvis.workUnitAction({ action: 'status', work_unit_id: activeWorkUnitId });
  if (snapshot?.ok) {
    activeWorkUnitStrategy = snapshot.provider_strategy || activeWorkUnitStrategy;
    renderWorkUnitSnapshot(snapshot);
  } else {
    renderWorkUnitSnapshot(null, { transientError: snapshot?.reason || 'Could not read Work Unit state.' });
  }
}

function startWorkUnitPolling(providerId) {
  stopWorkUnitPolling();
  workUnitPollTimer = setInterval(async () => {
    if (!activeWorkUnitId || currentView !== 'work') return;
    const snap = await window.jarvis.workUnitAction({ action: 'status', work_unit_id: activeWorkUnitId });
    if (snap?.ok) renderWorkUnitSnapshot(snap, { runningProvider: providerId });
  }, 2000);
}

function stopWorkUnitPolling() {
  if (workUnitPollTimer) clearInterval(workUnitPollTimer);
  workUnitPollTimer = null;
}

async function runProviderAttempt(providerId) {
  startWorkUnitPolling(providerId);
  const result = await window.jarvis.workUnitAction({
    action: 'run-provider', work_unit_id: activeWorkUnitId, provider_id: providerId,
  });
  stopWorkUnitPolling();
  if (result?.work_unit) {
    renderWorkUnitSnapshot(result, { transientError: result.ok ? null : (result.reason || result.run?.stderr || `${providerId} failed`) });
    return result;
  }
  await refreshActiveWorkUnit();
  const host = document.getElementById('work-unit-live');
  if (!result?.ok && host) host.insertAdjacentHTML('afterbegin', `<div class="errors"><div>${escapeHtml(result?.reason || `${providerId} failed`)}</div></div>`);
  return result;
}

async function runRemainingStrategy() {
  if (!activeWorkUnitId) return;
  let snapshot = await window.jarvis.workUnitAction({ action: 'status', work_unit_id: activeWorkUnitId });
  const attempts = snapshot?.reconciliation?.attempts || [];
  const strategy = snapshot?.provider_strategy || activeWorkUnitStrategy;
  for (const providerId of strategy) {
    if (attempts.some(a => attemptMatchesProvider(a, providerId))) continue;
    const p = providerById(providerId);
    if (p?.state === 'NEEDS_SETUP') {
      renderWorkUnitSnapshot(snapshot, { transientError: `${providerId}: ${p.detail}` });
      return;
    }
    const result = await runProviderAttempt(providerId);
    if (!result?.ok) return; // fail closed — do not cascade into the next provider
    snapshot = await window.jarvis.workUnitAction({ action: 'status', work_unit_id: activeWorkUnitId });
  }
  renderWorkUnitSnapshot(snapshot);
}

async function releaseActiveWorkUnitClaim() {
  if (!activeWorkUnitId) return;
  const snapshot = await window.jarvis.workUnitAction({ action: 'status', work_unit_id: activeWorkUnitId });
  const sid = snapshot?.work_unit?.active_execution?.session_id;
  if (!sid) return;
  const res = await window.jarvis.governanceAction({ action: 'close', sessionId: sid, state: 'completed', reason: '' });
  if (!res?.ok) {
    renderWorkUnitSnapshot(snapshot, { transientError: res?.detail || res?.label || 'Governor refused claim release.' });
    return;
  }
  await refreshStatus();
  await refreshActiveWorkUnit();
}

async function createGovernedWorkUnit() {
  const spec = workUnitSpecFromForm();
  const pre = OWU.validateSpec(spec);
  if (!pre.ok) { showWorkUnitErrors(pre.errors); return; }
  showWorkUnitErrors([]);
  const btn = document.getElementById('wu-create');
  btn.disabled = true; btn.textContent = 'Binding Work Unit…';
  const result = await window.jarvis.workUnitAction({ action: 'create', spec });
  btn.disabled = false; btn.textContent = 'Create governed Work Unit';
  if (!result?.ok) {
    showWorkUnitErrors(result?.errors || [result?.reason || 'Work Unit creation failed.']);
    return;
  }
  activeWorkUnitId = result.work_unit_id;
  activeWorkUnitStrategy = result.provider_strategy || spec.providers;
  sessionStorage.setItem('jarvis:active-work-unit', activeWorkUnitId);
  renderWorkUnitSnapshot(result.snapshot);
}

function renderWork() {
  const localPlan = OF.plan({ posture: OF.LOCAL });
  const draftIntent = sessionStorage.getItem('jarvis:draft-intent') || '';
  $main.innerHTML = `
    <div class="card">
      <h3>Run through JARVIS</h3>
      <div class="hint" style="margin:0 0 10px">Tell JARVIS the outcome you want. You only choose the consequential posture; lane names and model plumbing stay underneath.</div>
      <textarea id="operator-intent" class="operator-intent" rows="4" placeholder="What do you want to happen?">${escapeHtml(draftIntent)}</textarea>
      <div class="posture-grid">
        <label class="posture-choice">
          <div><input type="radio" name="operator-posture" value="local" checked><b>Keep this local</b></div>
          <span>Bounded reasoning on this Mac. No external model call.</span>
        </label>
        <label class="posture-choice">
          <div><input type="radio" name="operator-posture" value="frontier"><b>Frontier reasoning</b></div>
          <span>Route for Nemotron. External execution remains a separate explicit act.</span>
        </label>
      </div>
      <label id="operator-external-wrap" class="hint" style="display:none;margin:4px 0 8px">
        <input id="operator-external-ok" type="checkbox">
        This task text contains no personal/confidential data and may be sent to the external Nemotron trial endpoint if I later press Run with Nemotron.
      </label>
      <div id="operator-plan">${renderOperatorPlan(localPlan)}</div>
      <button class="primary" id="operator-run">Run locally with JARVIS</button>
      <div id="operator-errors"></div>
    </div>
    <div id="result"></div>

    <div class="card">
      <h3>Governed Work Unit</h3>
      <div class="hint" style="margin:0 0 10px">Use this for repository-grounded work that should survive model changes, retries, and transcript loss. One Work Unit; multiple governed review attempts.</div>
      <textarea id="wu-objective" rows="3" placeholder="Outcome this Work Unit should produce…">${escapeHtml(draftIntent)}</textarea>
      <div class="work-unit-grid" style="margin-top:8px">
        <div>
          <label class="hint">What counts as done? One criterion per line.</label>
          <textarea id="wu-acceptance" rows="4" placeholder="Evidence is complete\nRisks are named\nNext act is bounded"></textarea>
        </div>
        <div>
          <label class="hint">Evidence focus — optional paths, one per line. Use path:10-40 for a SHA-bound range.</label>
          <textarea id="wu-evidence" rows="4" placeholder="components/voice/ContinuousConversation.tsx\nlib/voice/safariSilentDeathRecovery.ts"></textarea>
        </div>
      </div>
      <h3 style="margin-top:14px">Intelligence strategy</h3>
      <div class="hint" style="margin:0 0 8px">Local open-weight review is the default. External providers are optional escalation lanes and require separate authority.</div>
      <label class="provider-row">
        <div><input id="wu-qwen" type="checkbox" checked> <span class="provider-name">Qwen3 Coder 30B · local coding review</span><div class="provider-detail">Open-weight model via Ollama. Repository review stays on this Mac.</div></div>
        <span id="wu-qwen-status" class="state UNKNOWN">CHECKING</span>
      </label>
      <label class="provider-row">
        <div><input id="wu-gpt-oss" type="checkbox" checked> <span class="provider-name">GPT-OSS 20B · local reasoning review</span><div class="provider-detail">Open-weight reasoning model via Ollama. Independent second local read.</div></div>
        <span id="wu-gpt-oss-status" class="state UNKNOWN">CHECKING</span>
      </label>
      <div class="hint" style="margin:10px 0 5px">Optional external escalation</div>
      <label class="provider-row">
        <div><input id="wu-nemotron" type="checkbox"> <span class="provider-name">Nemotron · external review</span><div class="provider-detail">External provider lane. Explicit network and repository-disclosure authority required.</div></div>
        <span id="wu-nemotron-status" class="state UNKNOWN">CHECKING</span>
      </label>
      <label class="provider-row">
        <div><input id="wu-inkling" type="checkbox"> <span class="provider-name">Inkling · external adversarial review</span><div class="provider-detail">Thinking Machines Tinker. Explicit network, repository disclosure, and spend authority required.</div></div>
        <span id="wu-inkling-status" class="state UNKNOWN">CHECKING</span>
      </label>
      <div id="wu-provider-error" class="hint"></div>
      <label id="wu-repo-wrap" class="inline-check" style="display:none"><input id="wu-repo-ok" type="checkbox">I authorize the selected external provider(s) to inspect this isolated repository worktree read-only. This is broader than the Evidence focus list.</label>
      <label id="wu-spend-wrap" class="inline-check" style="display:none"><input id="wu-spend-ok" type="checkbox">I authorize provider spend for the Inkling review. No amount is inferred or approved beyond this provider attempt.</label>
      <div id="wu-authority-preview"></div>
      <button class="primary" id="wu-create">Create governed Work Unit</button>
      <div id="wu-errors"></div>
    </div>
    <div id="work-unit-live"></div>

    <div class="card">
      <h3>Recall prior work</h3>
      <div class="hint" style="margin:0 0 8px">
        Searches the local JARVIS continuity index built from your Claude project archive.
        Results stay on this Mac and are not sent to a model by this search.
      </div>
      <div class="convo-input">
        <input id="continuity-query" type="text" placeholder="e.g. TURN-03 acoustic projection, Writer's Studio succession…">
        <button class="primary" id="continuity-search" style="margin-top:0">Recall</button>
      </div>
      <div id="continuity-results"></div>
    </div>

    <details class="advanced-tools">
      <summary>Advanced tools and lane controls</summary>
      <div class="card">
        <h3>Submit a bounded task manually</h3>
        <div class="hint" style="margin-bottom:8px">Use this only when you intentionally want direct access to the underlying C0 / C1 / C3 router.</div>
        <label class="hint">Lane</label><br>
        <select id="lane-hint" style="margin:8px 0 8px">
          <option value="c0">C0 — deterministic capability</option>
          <option value="c1">C1 — small local task</option>
          <option value="c3">C3 — needs frontier reasoning</option>
        </select>
        <div class="lane-help" id="lane-help">${LANE_HELP.c0}</div>
        <div id="c0-fields"></div>
        <div id="c1-fields" style="display:none">
          <textarea id="prompt" rows="3" placeholder="Small, bounded prompt for the local model…"></textarea>
        </div>
        <div id="c3-fields" style="display:none">
          <textarea id="description" rows="3" placeholder="Describe the task — router will select C3."></textarea>
          <label class="hint" style="display:block;margin-top:8px">
            <input id="external-ok" type="checkbox">
            This task text contains no personal/confidential data and may be sent to the external Nemotron trial endpoint.
          </label>
        </div>
        <button class="primary" id="submit">Submit manually</button>
        <div id="local-errors"></div>
      </div>
    </details>
  `;

  document.querySelectorAll('input[name="operator-posture"]').forEach(el => el.addEventListener('change', syncOperatorPosture));
  document.getElementById('operator-external-ok').addEventListener('change', syncOperatorPosture);
  document.getElementById('operator-run').addEventListener('click', submitOperatorIntent);
  for (const id of ['wu-qwen', 'wu-gpt-oss', 'wu-nemotron', 'wu-inkling', 'wu-repo-ok', 'wu-spend-ok']) document.getElementById(id)?.addEventListener('change', syncWorkUnitComposer);
  document.getElementById('wu-create').addEventListener('click', createGovernedWorkUnit);

  const laneHint = document.getElementById('lane-hint');
  laneHint.addEventListener('change', () => {
    document.getElementById('c0-fields').style.display = laneHint.value === 'c0' ? '' : 'none';
    document.getElementById('c1-fields').style.display = laneHint.value === 'c1' ? '' : 'none';
    document.getElementById('c3-fields').style.display = laneHint.value === 'c3' ? '' : 'none';
    document.getElementById('lane-help').innerHTML = LANE_HELP[laneHint.value];
    document.getElementById('local-errors').innerHTML = '';
  });
  document.getElementById('submit').addEventListener('click', submitTask);
  document.getElementById('continuity-search').addEventListener('click', searchContinuity);
  document.getElementById('continuity-query').addEventListener('keydown', (e) => { if (e.key === 'Enter') searchContinuity(); });
  renderC0Fields();
  syncOperatorPosture();
  syncWorkUnitComposer();
  void loadProviderCatalog();
  if (activeWorkUnitId) void refreshActiveWorkUnit();
}

function currentOperatorPosture() {
  return document.querySelector('input[name="operator-posture"]:checked')?.value || OF.LOCAL;
}

function syncOperatorPosture() {
  const posture = currentOperatorPosture();
  const externalOk = !!document.getElementById('operator-external-ok')?.checked;
  const wrap = document.getElementById('operator-external-wrap');
  if (wrap) wrap.style.display = posture === OF.FRONTIER ? 'block' : 'none';
  const planHost = document.getElementById('operator-plan');
  if (planHost) planHost.innerHTML = renderOperatorPlan(OF.plan({ posture, externalOk }));
  const button = document.getElementById('operator-run');
  if (button) button.textContent = posture === OF.FRONTIER ? 'Prepare frontier run' : 'Run locally with JARVIS';
}

function showOperatorErrors(errors) {
  const host = document.getElementById('operator-errors');
  if (!host) return;
  host.innerHTML = errors.length
    ? `<div class="errors">${errors.map(e => `<div>${escapeHtml(e)}</div>`).join('')}</div>`
    : '';
}

async function submitOperatorIntent() {
  const posture = currentOperatorPosture();
  const externalOk = !!document.getElementById('operator-external-ok')?.checked;
  const intent = document.getElementById('operator-intent')?.value || '';
  const built = OF.buildTask({ intent, posture, externalOk });
  if (!built.ok) { showOperatorErrors(built.errors); return; }
  showOperatorErrors([]);

  const button = document.getElementById('operator-run');
  button.disabled = true;
  button.textContent = posture === OF.FRONTIER ? 'Routing…' : 'Working locally…';
  const res = await window.jarvis.submitTask(built.task);
  button.disabled = false;
  syncOperatorPosture();
  renderResult(res);
}

async function searchContinuity() {
  const input = document.getElementById('continuity-query');
  const out = document.getElementById('continuity-results');
  const button = document.getElementById('continuity-search');
  const query = input ? input.value.trim() : '';
  if (!query) {
    out.innerHTML = '<div class="hint">Enter a specific lane, decision, feature, or phrase to recall.</div>';
    return;
  }
  button.disabled = true;
  button.textContent = 'Recalling…';
  const res = await window.jarvis.searchContinuity(query, 8);
  button.disabled = false;
  button.textContent = 'Recall';
  if (!res.ok) {
    out.innerHTML = `<div class="errors">${(res.errors || ['Recall failed']).map(e => `<div>${escapeHtml(e)}</div>`).join('')}</div>`;
    return;
  }
  const summary = res.summary
    ? `<div class="precedence">
        <b>Branch standing — noncanonical</b>
        Highest retrieved stage: <span class="kv">${escapeHtml(res.summary.highest_stage || 'not established')}</span><br>
        ${(res.summary.highest_stage_states || []).map(s => `<span class="kv">${escapeHtml(s)}</span>`).join('<br>')}
        ${res.summary.charter_state ? `<br>Charter state: <span class="kv">${escapeHtml(res.summary.charter_state)}</span>` : ''}
        ${res.summary.ref ? `<br>Source branch: <span class="kv">${escapeHtml(res.summary.ref)}@${escapeHtml(String(res.summary.git_sha || '').slice(0, 12))}</span>` : ''}
      </div>`
    : '';
  out.innerHTML = summary + (res.results.length
    ? res.results.map(item => `<div class="claim">
        <div class="label">${escapeHtml(item.title || item.session_id || item.path || item.kind)}</div>
        <div class="src">
          ${escapeHtml(item.authority || 'HISTORICAL_ORIENTATION')} ·
          ${item.stage ? escapeHtml(item.stage) + ' · ' : ''}
          ${item.declared_state ? escapeHtml(item.declared_state) + ' · ' : ''}
          ${item.ref ? escapeHtml(item.ref + '@' + String(item.git_sha || '').slice(0, 12)) + ' · ' : ''}
          ${escapeHtml(item.path)}:${escapeHtml(item.line_no || 1)} ·
          ${escapeHtml(item.timestamp || 'undated')} · ${escapeHtml(item.sensitivity)}
        </div>
        <div class="why" style="white-space:pre-wrap">${escapeHtml(item.text)}</div>
      </div>`).join('')
    : '<div class="hint">No matching continuity found. Absence from this search is not proof the work never happened.</div>');
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
    task = {
      description: document.getElementById('description').value,
      external_ok: !!document.getElementById('external-ok')?.checked,
    };
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

  const reasoner = res.result && res.result.frontier_reasoner;
  const c3Action = res.execution_lane === 'C3' && res.status === 'routed_not_executed'
    ? `<div class="card">
        <h3>Explicit frontier act</h3>
        <div class="row"><span class="label">Nemotron 3 Ultra</span><span class="state ${reasoner?.ready ? 'AVAILABLE' : 'NEEDS_SETUP'}">${escapeHtml(reasoner?.state || 'UNVERIFIED')}</span></div>
        <div class="hint">
          Routing did not send anything externally.
          ${t.external_ok
            ? 'You marked this task text external-safe. No repository or continuity context will be attached.'
            : 'External execution is held because this task was not marked external-safe.'}
        </div>
        ${t.external_ok && reasoner?.ready ? '<button class="primary" id="run-frontier">Run with Nemotron 3 Ultra</button>' : ''}
        ${t.external_ok && !reasoner?.ready ? `<div class="why">${escapeHtml(reasoner?.detail || 'Nemotron provider setup is incomplete.')}</div>` : ''}
        <div id="frontier-result"></div>
      </div>`
    : '';

  document.getElementById('result').innerHTML = `
    ${invocation}
    ${c3Action}
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

  const runFrontier = document.getElementById('run-frontier');
  if (runFrontier) {
    runFrontier.addEventListener('click', async () => {
      const out = document.getElementById('frontier-result');
      runFrontier.disabled = true;
      runFrontier.textContent = 'Running…';
      out.innerHTML = '<div class="hint">External reasoning in progress…</div>';
      const result = await window.jarvis.runExternalReasoning({
        prompt: t.description || '',
        external_ok: true,
      });
      runFrontier.disabled = false;
      runFrontier.textContent = 'Run with Nemotron 3 Ultra';
      out.innerHTML = `<pre>${escapeHtml(JSON.stringify(result, null, 2))}</pre>`;
    });
  }
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
      ${stateRow('Frontier reasoning lane', s.claude_lane)}
      ${stateRow('Nemotron external reasoner', s.frontier_reasoner || { state: 'UNVERIFIED', detail: 'frontier reasoner status not reported by this build' })}
      ${stateRow('JARVIS continuity', s.continuity || { state: 'UNVERIFIED', detail: 'continuity status not reported by this build' })}
      ${stateRow('Builder work-unit mechanism', s.builder_mechanism)}
      ${stateRow('Desktop runtime', s.desktop_runtime)}
      ${/* These two used to be literals written into the view, which is why
            they kept saying UNKNOWN after the status layer learned to say
            UNCONFIGURED and NOT PROBED: a hardcoded row cannot go stale
            loudly, it just quietly disagrees with the payload. They now read
            the same fields Home reads. The fallbacks preserve the old text
            for a status shape that predates them. */ ''}
      ${stateRow('Memory / Postgres', s.memory_postgres || { state: 'UNCONFIGURED', detail: 'Desktop holds no database configuration and does not connect to one.' })}
      ${stateRow('Production', s.production || { state: 'NOT PROBED', detail: 'Requires explicit production/SSH authority, which Desktop does not hold. Not probed by design.' })}
    </div>
    ${provenanceRows(s.provenance)}
    <div class="card">
      <h3>Builder OS detail</h3>
      <pre>${JSON.stringify(s.builder_os.detail, null, 2)}</pre>
    </div>
  `;
}

// ── JOP-02 Living Spiral ─────────────────────────────────────────────────────
// A PROJECTION of the same governed derivation Home renders. It reads
// `lastStatus` through legibility -> spiral and nothing else: no IPC of its own,
// no endpoint, no store, no verifier. If the projection could not establish
// something, this draws the aperture rather than filling it in.
//
// Rings are named by STANDING CLASS, deliberately. A ring must never be
// readable as "further out = more canonical" — custody position is not in this
// evidence chain at all, and is shown as written text, never as geometry.
const SP_RINGS = [
  { key: 'OBSERVED OPERATIONAL', match: s => s === 'READY' || s === 'WORKING' },
  { key: 'NOT AUTHORIZED',       match: s => s === 'NEEDS_AUTHORITY' },
  { key: 'IMPEDED',              match: s => s === 'NEEDS_SETUP' || s === 'DEGRADED' || s === 'BLOCKED' || s === 'FAILED' },
  { key: 'NOT OBSERVED',         match: s => s === 'UNVERIFIED' },
];
// Canonical operational_element values (semantic contract §2, ACCEPTED).
const SP_PHEN = ['transformation', 'conveyance', 'consolidation', 'discrimination', 'composition'];

function spRingIndex(standing) {
  const i = SP_RINGS.findIndex(r => r.match(standing));
  return i === -1 ? SP_RINGS.length - 1 : i;   // unrecognised sits at NOT OBSERVED
}

function renderSpiral() {
  const st = lastStatus;
  if (!st) { $main.innerHTML = '<p class="hint">Loading…</p>'; return; }
  const sp = JarvisSpiral.projectSpiral(JarvisLegibility.deriveOperatorView(st));

  const C = 250, R0 = 76, STEP = 44;
  const rOf = i => R0 + i * STEP;
  const byId = {};
  const placed = sp.nodes.map((n, idx) => {
    const ring = spRingIndex(n.standing);
    const sector = Math.max(0, SP_PHEN.indexOf(n.phenomenon));
    const peers = sp.nodes.filter(m => m.phenomenon === n.phenomenon && spRingIndex(m.standing) === ring);
    const within = peers.indexOf(n);
    // Arc-length spread: a fixed angle collapses to nothing at small radii, which
    // is what overprinted the labels on the all-READY plate. ~74px of arc per
    // peer, capped so a crowded sector cannot bleed into its neighbour.
    const rr = rOf(ring);
    const perPeer = Math.min(30, (74 / (2 * Math.PI * rr)) * 360);
    const spread = peers.length > 1 ? (within - (peers.length - 1) / 2) * perPeer : 0;
    const ang = (sector * 72 - 90 + spread) * Math.PI / 180;
    // Labels sit RADIALLY OUTWARD of their mark and anchor by angle. Centred
    // labels collided across adjacent sectors: 72 degrees at the inner radius is
    // ~78px of arc against ~120px of text. Radial placement makes neighbouring
    // sectors diverge instead of converge.
    const cos = Math.cos(ang), sin = Math.sin(ang);
    const anchor = cos > 0.35 ? 'start' : (cos < -0.35 ? 'end' : 'middle');
    const pad = anchor === 'middle' ? 0 : 11;
    const pt = { ...n, x: C + cos * rr, y: C + sin * rr, ring, idx,
                 lx: C + cos * (rr + 4) + (anchor === 'start' ? pad : anchor === 'end' ? -pad : 0),
                 // Radial anchoring separates ADJACENT SECTORS. Peers inside one
                 // sector at the top/bottom both anchor 'middle' and land on the
                 // same baseline, so they still need a vertical stagger.
                 ly: C + sin * (rr + 4) + (anchor === 'middle'
                       ? (sin < 0 ? -12 - (within % 2) * 14 : 17 + (within % 2) * 14)
                       : 4 + (within % 2) * 13),
                 anchor };
    byId[n.id] = pt;
    return pt;
  });

  // Colour carries ONE meaning each. Aperture is a dashed void, never a fill:
  // "we did not look" must not occupy the same visual channel as "it is bad".
  const dotFor = (n) => {
    if (n.disturbance && n.disturbance.kind === 'UNOBSERVED') return { cls: 'sp-aperture', r: 6 };
    if (n.disturbance && n.disturbance.needs_attention) return { cls: 'sp-dot sp-attention', r: 6.5 };
    return { cls: 'sp-dot sp-observed', r: 6 };
  };

  const rings = SP_RINGS.map((r, i) => `
    <circle class="sp-ring" cx="${C}" cy="${C}" r="${rOf(i)}"></circle>
    <text class="sp-ring-lab" x="${C}" y="${C - rOf(i) + 10}" text-anchor="middle">${r.key}</text>`).join('');
  const spokes = SP_PHEN.map((ph, i) => {
    const a = (i * 72 - 90 + 36) * Math.PI / 180;
    const la = (i * 72 - 90) * Math.PI / 180, lr = rOf(SP_RINGS.length - 1) + 22;
    return `<line class="sp-spoke" x1="${C}" y1="${C}" x2="${C + Math.cos(a) * rOf(SP_RINGS.length - 1)}" y2="${C + Math.sin(a) * rOf(SP_RINGS.length - 1)}"></line>
      <text class="sp-phen" x="${C + Math.cos(la) * lr}" y="${C + Math.sin(la) * lr}" text-anchor="middle">${ph}</text>`;
  }).join('');
  const edges = sp.edges.map(e => {
    const a = byId[e.from], b = byId[e.to];
    if (!a || !b) return '';
    return `<line class="sp-edge" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"><title>${e.kind} — ${e.evidence}</title></line>`;
  }).join('');
  const nodes = placed.map(n => {
    const d = dotFor(n);
    return `<g class="sp-node" data-id="${n.id}" tabindex="0">
      <circle class="${d.cls}" cx="${n.x}" cy="${n.y}" r="${d.r}"></circle>
      <text x="${n.lx}" y="${n.ly}" text-anchor="${n.anchor}">${n.label.length > 24 ? n.label.slice(0, 22) + '…' : n.label}</text>
      <title>${n.id} — ${n.standing}${n.reason ? '\n' + n.reason : ''}\nmotion: ${n.motion.state} (${n.motion.reason})</title>
    </g>`;
  }).join('');

  $main.innerHTML = `
    <div class="spiral-wrap">
      <div>
        <div class="spiral-plate">
          <svg viewBox="-40 0 580 510" role="img" aria-label="Operational field. ${sp.nodes.length} nodes; ${sp.edges.length} evidenced edges.">
            ${rings}${spokes}${edges}${nodes}
          </svg>
        </div>
        <p class="sp-axis-note">
          <b>Ring = state</b>, each one labelled with what it asserts. Not
          progress, not importance, not health — an outer ring is not "further
          along". <b>Direction = activity</b>, a grouping name only; rename all
          five and nothing else moves.
        </p>
        <p class="sp-axis-note">
          <b>Pipeline position (local &rarr; canonical): no source yet.</b>
          Written here rather than drawn — geometry would look like an answer.
        </p>
      </div>
      <div>
        <div class="card">
          <h3>Needs attention ${sp.attention.length ? `(${sp.attention.length})` : ''}</h3>
          ${sp.attention.length
            ? sp.attention.map(a => `<div class="row"><div><div class="label">${a.id}</div><div class="why">${a.reason || ''}</div></div></div>`).join('')
            : '<div class="hint">Nothing needs you. Not a claim everything is fine — only that nothing checked is blocked.</div>'}
        </div>
        <div class="card">
          <h3>Not knowable yet</h3>
          <div class="hint" style="margin:0 0 8px">Listed even when nothing is wrong. A screen that goes quiet here is hiding what it does not know.</div>
          ${sp.apertures.map(a => {
            // The projection keeps precise wording because it is the evidence
            // record. The screen says the same thing in ordinary English, and
            // keeps the exact wording underneath rather than replacing it.
            const plain = {
              'motion': { t: 'Whether things are getting better or worse',
                          w: 'JARVIS now keeps project continuity, but this operational view does not yet compare repeated state observations. Trend is therefore still unestablished.' },
              'custody layer (radial axis)': { t: 'How far along something is (local &rarr; canonical)',
                          w: 'JARVIS can see how each thing is doing, but not where it sits in the pipeline. So that is written in words, never drawn as distance.' },
              'active work': { t: 'What work is running right now',
                          w: 'The part that tracks running work could not be read, so nothing here means "no work" — only "not seen".' },
            }[a.subject] || { t: a.subject, w: a.limit };
            return `<div class="sp-aperture-card">
              <div class="s">${plain.t}</div>
              <div class="l">${plain.w}</div>
              <div class="c">${a.consequence}</div></div>`;
          }).join('')}
        </div>
        <div class="card">
          <h3>Evidenced links</h3>
          ${sp.edges.length
            ? sp.edges.map(e => `<div class="row sp-edge-row" data-from="${e.from}" data-to="${e.to}" style="cursor:pointer"><div><div class="label">${e.from} → ${e.to}</div><div class="why">${e.kind}</div><div class="src">${e.evidence}</div></div></div>`).join('')
            : '<div class="hint">No links drawn. Two things both working is not evidence they are connected.</div>'}
        </div>
        <div id="sp-inspector"></div>
        <div class="card">
          <h3>Marks</h3>
          <div class="sp-legend">
            <b>solid</b> — checked, working. Not a claim the system is healthy.<br>
            <b>amber</b> — something observable is in the way.<br>
            <b>hollow dashed</b> — not checked. Not missing, not broken: unlooked-at.<br>
            <b>dashed line</b> — a link with evidence behind it. Click for the exact words.<br>
            <b>no movement shown</b> — project continuity exists, but repeated operational-state evidence is not yet wired into this projection.<br>
            <b>click anything</b> — what it is, how JARVIS knows, how current, whether it needs you.
          </div>
        </div>
      </div>
    </div>
    <div class="hint">Read at ${sp.observed_at || 'unknown'} · same information as Home, drawn differently</div>`;

  document.querySelectorAll('.sp-node').forEach(g => {
    const open = () => spInspect(sp, g.dataset.id);
    g.addEventListener('click', open);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  document.querySelectorAll('.sp-edge-row').forEach(r => {
    r.addEventListener('click', () => spInspectEdge(sp, r.dataset.from, r.dataset.to));
  });
}

// The inspector answers in ORDINARY LANGUAGE first, with the evidentiary chain
// immediately beneath it. Readability must not hide provenance, and provenance
// must not make the surface unusable without developer vocabulary.
function spField(k, v, cls) {
  if (v === null || v === undefined || v === '') return '';
  return `<div class="row"><div><div class="label">${k}</div><div class="${cls || 'why'}">${v}</div></div></div>`;
}

function spPlainState(v) {
  // Machine tokens get an ordinary-English gloss. The token stays visible so
  // provenance is not hidden, but it is never the only thing on the row.
  const gloss = {
    READY: 'working', WORKING: 'working right now',
    UNVERIFIED: 'not checked', NEEDS_SETUP: 'needs setting up',
    NEEDS_AUTHORITY: 'not allowed, on purpose', DEGRADED: 'partly working',
    BLOCKED: 'stopped by a rule', FAILED: 'tried and failed',
    UNOBSERVED: 'not measured', PERMITTED: 'allowed', IMPEDED: 'something is in the way',
    BY_DESIGN: 'deliberately switched off', ESTABLISHED: 'firmly evidenced',
  }[v];
  return gloss ? `${gloss} <span class="src" style="display:inline">(${v})</span>` : v;
}

function spInspect(sp, id) {
  const i = JarvisSpiral.inspectNode(sp, id);
  const host = document.getElementById('sp-inspector');
  if (!i || !host) return;
  const T = i.temporal;
  host.innerHTML = `
    <div class="card">
      <p class="headline" style="font-size:17px;margin-top:0">${i.plain.says}</p>
      <p class="sentence">${i.plain.caveat}</p>

      <h3 style="margin-top:18px">What it is</h3>
      ${spField('Does', i.assertion.describes)}
      ${spField('Activity', `${(i.phenomenon.means || i.phenomenon.value)} <span class="src" style="display:inline">${i.phenomenon.value}</span>`)}

      <h3 style="margin-top:18px">State</h3>
      ${spField('Now', spPlainState(i.assertion.standing))}
      ${spField('Because', i.assertion.reason)}

      <h3 style="margin-top:18px">How JARVIS knows</h3>
      ${spField('Read from', i.evidence.source, 'src')}
      ${spField('Read nothing', i.evidence.absent)}
      ${spField('', 'Re-displayed from what the build system reported. This screen checks nothing itself.', 'src')}

      <h3 style="margin-top:18px">How current</h3>
      ${spField('Screen refreshed', T.snapshot_observed_at, 'src')}
      ${spField('This item last checked', spPlainState(T.node_freshness))}
      ${spField('', 'The refresh time is the screen&rsquo;s, not this item&rsquo;s.', 'src')}
      ${spField('Trend', spPlainState(T.motion))}
      ${spField('', 'No history kept yet &mdash; better or worse is not answerable.', 'src')}

      <h3 style="margin-top:18px">Authority</h3>
      ${spField('Disposition', spPlainState(i.authority.disposition))}
      ${spField('Because', i.authority.governing_reason)}
      ${spField('Fix', JarvisSpiral.remediationCell(i.authority), 'fix')}
      ${spField('Needs you', (i.authority.attention && i.authority.attention.needs_attention)
          ? 'Yes &mdash; something observable is in the way.' : 'No.')}

      <h3 style="margin-top:18px">Pipeline position</h3>
      ${spField('local &rarr; canonical', spPlainState(i.custody.state))}
      ${spField('', `${i.custody.reason}. Written, never drawn &mdash; distance from centre means something else.`, 'src')}
    </div>`;
  host.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function spInspectEdge(sp, from, to) {
  const i = JarvisSpiral.inspectEdge(sp, from, to);
  const host = document.getElementById('sp-inspector');
  if (!host) return;
  if (!i) { host.innerHTML = '<div class="card"><div class="hint">No evidence for this link, so there is nothing to show. JARVIS does not draw a line it cannot justify.</div></div>'; return; }
  host.innerHTML = `
    <div class="card">
      <p class="headline" style="font-size:17px;margin-top:0">${i.plain.says}</p>
      <p class="sentence">${i.plain.caveat}</p>
      ${spField('Link', `${i.relation === 'BLOCKS_OBSERVATION' ? 'one is stopping the other being checked' : i.relation} <span class="src" style="display:inline">${i.relation}</span>`)}
      ${spField('Justified by', i.licence, 'src')}
      ${spField('Between', i.source_assertions.map(a => `${a.id} <span class="src" style="display:inline">${a.standing}</span>`).join(' &nbsp;&middot;&nbsp; '))}
      ${spField('Strength', spPlainState(i.causal_standing))}
    </div>`;
  host.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function render() {
  if (currentView === 'home') renderHome();
  else if (currentView === 'work') renderWork();
  else if (currentView === 'system') renderSystem();
  else if (currentView === 'spiral') renderSpiral();
}

(async function init() {
  render();
  await Promise.all([refreshStatus(), loadCapabilities()]);
  render();
  setInterval(async () => { await refreshStatus(); if (currentView !== 'work') render(); }, 15000);
})();
