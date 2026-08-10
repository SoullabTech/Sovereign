'use strict';
/**
 * JARVIS Unit 12 — renderer (§3, §5–§13)
 *
 * Four surfaces: COMMAND, RUNS, RUN DETAIL / EVIDENCE, SYSTEM STATE. No
 * dashboard sprawl, no settings, no IDE (§3).
 *
 * Every value rendered here came from the runtime. The renderer computes no run
 * state of its own, and it never advances a run's appearance ahead of what the
 * runtime reported (§6). SSE only triggers a re-fetch; REST is the truth (§14).
 */

const P = window.JarvisPresentation;

const el = (id) => document.getElementById(id);
const $strip = el('system-strip');
const $form = el('command-form');
const $template = el('template');
const $templateSummary = el('template-summary');
const $objective = el('objective');
const $submit = el('submit');
const $submitResult = el('submit-result');
const $runList = el('run-list');
const $detail = el('detail');

let boot = null;
let templates = [];
let health = null;
let runs = [];
/** Objective labels for Desktop-submitted runs. Never a source of run state. */
let annotations = {};
let selectedId = null;
let streamStatus = { status: 'CONNECTING', detail: null };

/* ── small DOM helpers (no innerHTML anywhere: runtime text is data) ──────── */
function node(tag, opts = {}, kids = []) {
  const n = document.createElement(tag);
  if (opts.class) n.className = opts.class;
  if (opts.text != null) n.textContent = String(opts.text);
  for (const [k, v] of Object.entries(opts.attrs ?? {})) {
    if (v != null) n.setAttribute(k, String(v));
  }
  for (const kid of kids) if (kid) n.appendChild(kid);
  return n;
}

function kv(pairs) {
  const dl = node('dl', { class: 'kv' });
  for (const [k, v, plain] of pairs) {
    if (v == null || v === '') continue;
    dl.appendChild(node('dt', { text: k }));
    dl.appendChild(node('dd', { class: plain ? 'plain' : '', text: v }));
  }
  return dl;
}

function copyButton(value, label = 'copy') {
  const b = node('button', { class: 'copy', text: label, attrs: { type: 'button', 'aria-label': `Copy ${value}` } });
  b.addEventListener('click', async () => {
    await window.jarvis.copy(value);
    b.textContent = 'copied';
    setTimeout(() => { b.textContent = label; }, 1200);
  });
  return b;
}

const shortTime = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
};

/* ── §12 SYSTEM STATE ────────────────────────────────────────────────────── */
/** Transport code from the last failed health read, for honest offline copy. */
let lastTransportCode = 'RUNTIME_OFFLINE';

function renderSystemStrip() {
  $strip.textContent = '';
  const v = P.healthView(health, boot?.address, lastTransportCode);

  const runtimeTone = !v.reachable ? (v.unresponsive ? 'degraded' : 'offline')
    : v.runtime_state === 'READY' ? 'ready'
      : v.runtime_state === 'DEGRADED' ? 'degraded' : 'pending';
  const runtimeMark = !v.reachable ? (v.unresponsive ? '◔' : '✕')
    : v.runtime_state === 'READY' ? '●' : '▲';

  const pill = (cls, mark, text, title) => node('span',
    { class: `pill pill-${cls}`, attrs: title ? { title } : {} },
    [node('span', { class: 'pill-mark', text: mark, attrs: { 'aria-hidden': 'true' } }),
      node('span', { text })]);

  $strip.appendChild(pill(runtimeTone, runtimeMark, `JARVIS RUNTIME ${v.runtime_state}`));
  $strip.appendChild(pill('pending', '⌂', v.address ?? 'no address',
    v.loopback_only ? 'Loopback only' : 'Address reported by the runtime'));
  $strip.appendChild(pill(v.worker_available ? 'ready' : 'offline', v.worker_available ? '●' : '✕',
    `LOCAL WORKER ${v.worker_available ? 'AVAILABLE' : 'UNAVAILABLE'}`, v.worker_reason ?? undefined));

  // The runtime's /health reports a model COUNT, not a name — the model name is
  // a per-run fact, so it is read off the most recent run that has one (§12).
  const model = runs.map((r) => P.workerView(r).model).find(Boolean);
  $strip.appendChild(pill('pending', '◎', `MODEL ${model ?? 'reported per run'}`));

  $strip.appendChild(pill('pending', '⟳', `ACTIVE ${v.runs.active} · QUEUED ${v.runs.queued} · TOTAL ${v.runs.total}`));

  const sMark = streamStatus.status === 'CONNECTED' ? '≈' : '⌁';
  $strip.appendChild(pill(streamStatus.status === 'CONNECTED' ? 'ready' : 'pending', sMark,
    `EVENTS ${streamStatus.status}`, streamStatus.detail ?? undefined));

  if (v.last_error) {
    $strip.appendChild(pill('degraded', '!', 'RECENT ERROR',
      `${v.last_error.at ?? ''} ${v.last_error.message ?? ''}`.trim()));
  }
}

/* ── §13 RUNTIME OFFLINE ─────────────────────────────────────────────────── */
function renderOffline(errorCode) {
  const off = P.offlineView(boot?.address, errorCode);
  $detail.textContent = '';
  // Runs already listed stay listed when the runtime merely stops answering —
  // they are durable runtime facts, and blanking them would imply they are gone.
  if (!off.unresponsive) $runList.textContent = '';
  const card = node('div', { class: 'offline-card' }, [
    node('h3', { text: errorCode === 'NON_LOOPBACK_RUNTIME_REFUSED' ? 'Runtime Address Refused' : off.headline }),
    node('p', { text: errorCode === 'NON_LOOPBACK_RUNTIME_REFUSED'
      ? boot?.endpointError?.message ?? 'The configured runtime address is not a loopback address.'
      : off.detail }),
  ]);
  if (errorCode !== 'NON_LOOPBACK_RUNTIME_REFUSED' && !off.unresponsive) {
    card.appendChild(node('p', { text: 'Start it from a terminal in the JARVIS runtime checkout:' }));
    card.appendChild(node('code', { text: off.instruction }));
    card.appendChild(node('div', { class: 'row-actions' }, [copyButton(off.instruction, 'copy command')]));
  }
  $detail.appendChild(card);
}

/* ── §7 ACTIVE / RECENT RUNS ─────────────────────────────────────────────── */
function renderRunList() {
  $runList.textContent = '';
  if (!runs.length) {
    $runList.appendChild(node('li', {}, [node('p', { class: 'empty', text: 'No runs in the runtime history yet.' })]));
    return;
  }
  for (const r of runs) {
    const d = P.dispositionView(r);
    const s = P.stateCopy(r.state);
    const w = P.workerView(r);
    const obj = P.objectiveView(r, annotations);
    const btn = node('button', {
      class: `run-item tone-${d.tone}`,
      attrs: { type: 'button', 'aria-current': String(r.run_id === selectedId) },
    }, [
      node('span', { class: 'rid', text: r.run_id }),
      node('span', { class: 'robj', text: obj.text ?? r.work_unit_id ?? '(objective not published by the runtime)' }),
      node('span', { class: 'rmeta' }, [
        node('span', { class: `cite-status tone-${d.tone}`, text: `${d.mark} ${s.terminal ? d.label : r.state}` }),
        w.lane ? node('span', { class: 'stamp', text: w.lane }) : null,
        node('span', { class: 'stamp', text: shortTime(r.created_at) ?? '' }),
      ]),
    ]);
    btn.addEventListener('click', () => selectRun(r.run_id));
    $runList.appendChild(node('li', {}, [btn]));
  }
}

/* ── §8/§9/§10/§11 RUN DETAIL ────────────────────────────────────────────── */
function section(title, ...kids) {
  return node('section', { class: 'section' }, [node('h3', { text: title }), ...kids]);
}

function renderDetail(run) {
  $detail.textContent = '';
  if (!run) {
    $detail.appendChild(node('p', { class: 'empty', text: 'Select a run to inspect its context, worker, evidence and disposition.' }));
    return;
  }

  const d = P.dispositionView(run);
  const s = P.stateCopy(run.state);
  const w = P.workerView(run);
  const ctx = P.contextView(run);
  const ver = P.verificationView(run);
  const fail = P.failureClassView(run);
  const rows = P.evidenceRows(run);

  /* head: disposition + live state */
  const head = node('div', { class: 'detail-head' });
  head.appendChild(node('div', { class: `disposition tone-${d.tone}` }, [
    node('span', { class: 'dmark', text: d.mark, attrs: { 'aria-hidden': 'true' } }),
    node('span', { text: s.terminal ? d.label : `${run.state} — IN FLIGHT` }),
  ]));
  head.appendChild(node('p', { class: 'disposition-meaning', text: s.terminal ? d.meaning : s.human }));

  const obj = P.objectiveView(run, annotations);
  head.appendChild(node('p', { class: 'detail-objective', text: obj.text ?? run.work_unit_id ?? '' }));
  if (obj.provenance !== 'RUNTIME') {
    head.appendChild(node('p', { class: 'hint', text: `Objective source: ${obj.provenance} — ${obj.note}` }));
  }

  const ids = node('div', { class: 'row-actions' }, [
    node('span', { class: 'stamp', text: run.run_id }), copyButton(run.run_id, 'copy run id'),
  ]);
  head.appendChild(ids);
  if (!s.terminal) head.appendChild(node('div', { class: 'activity' }, [node('span')]));
  $detail.appendChild(head);

  /* §10 escalation / failure — never wearing a success tone */
  if (fail) {
    const box = node('div', { class: `failure-box${d.tone === 'escalation' ? ' escalation' : ''}` }, [
      node('div', { class: `failure-class tone-${d.tone}`, text: `${d.mark} ${fail.failure_class}` }),
      node('p', { class: 'disposition-meaning', text: fail.explanation }),
    ]);
    if (fail.detail) box.appendChild(node('p', { class: 'disposition-meaning mono', text: P.redact(fail.detail) }));
    if (w.recommended_next_action) {
      box.appendChild(node('p', { class: 'disposition-meaning', text: `Runtime's recommended next action: ${w.recommended_next_action}` }));
    }
    if (w.unresolved_questions?.length) {
      const ul = node('ul');
      for (const q of w.unresolved_questions) ul.appendChild(node('li', { text: q }));
      box.appendChild(node('p', { class: 'disposition-meaning', text: 'Unresolved questions from the worker:' }));
      box.appendChild(ul);
    }
    $detail.appendChild(section('Disposition detail', box));
  }

  /* §8 authority */
  $detail.appendChild(section('Authority', kv([
    ['Authority', 'READ-ONLY'],
    ['Execution lane', w.lane ?? '—'],
    ['Work unit', run.work_unit_id],
    ['Files changed', String((w.files_changed ?? []).length)],
  ])));

  /* §8 context */
  const ctxSection = section('Context', kv([
    ['Fragments', String(ctx.fragment_count)],
    ['Execution head', ctx.execution_head],
    ['Estimated tokens', ctx.tokens?.estimated != null ? `${ctx.tokens.estimated} / ${ctx.tokens.safe_threshold} safe` : null],
  ]));
  if (ctx.fragments.length) {
    const t = node('table');
    t.appendChild(node('thead', {}, [node('tr', {}, [
      node('th', { text: 'Source file' }), node('th', { text: 'Lines' }),
      node('th', { text: 'SHA' }), node('th', { text: 'Why' }),
    ])]));
    const tb = node('tbody');
    for (const f of ctx.fragments) {
      tb.appendChild(node('tr', {}, [
        node('td', { class: 'mono', text: f.source_file }),
        node('td', { class: 'mono', text: f.line_range }),
        node('td', { class: 'mono', text: f.source_sha ?? '—' }),
        node('td', { text: f.why ?? '—' }),
      ]));
    }
    t.appendChild(tb);
    ctxSection.appendChild(node('div', { class: 'table-scroll' }, [t]));
  }
  $detail.appendChild(ctxSection);

  /* §8 worker + execution */
  $detail.appendChild(section('Worker & execution', kv([
    ['Lane', w.lane], ['Backend', w.backend], ['Model', w.model],
    ['Started', shortTime(w.started_at)],
    ['Duration', w.duration_s != null ? `${w.duration_s}s` : null],
    ['Created', shortTime(run.created_at)],
    ['Finished', shortTime(run.finished_at)],
    ['Tests', w.test_results],
  ])));

  /* §8 result — the worker's own account, marked as such */
  if (w.exit_summary || w.worker_self_reported_escalation != null) {
    $detail.appendChild(section('Result (worker self-report)', kv([
      ['Summary', P.redact(w.exit_summary), true],
      ['Worker asked to escalate', w.worker_self_reported_escalation == null ? null : String(w.worker_self_reported_escalation)],
      ['Recommended next', w.recommended_next_action],
    ])));
  }

  /* §9 verification + evidence — the load-bearing surface */
  const evSection = section('Verification & evidence');
  evSection.appendChild(node('div', { class: 'evidence-note' }, [
    node('strong', { text: 'What JARVIS actually proved: ' }),
    node('span', { text: ver.disclosure }),
  ]));
  evSection.appendChild(kv([
    ['Method', ver.method],
    ['Citation status', ver.citation_status],
    ['Citations', ver.totals ? `${ver.totals.valid} contained / ${ver.totals.total} total (${ver.totals.invalid} outside)` : null],
    ['Fragments offered', ver.totals?.fragments_offered != null ? String(ver.totals.fragments_offered) : null],
    ['Decided by', ver.decided_by, true],
  ]));
  evSection.appendChild(node('div', { class: 'semantic-flag' }, [
    node('span', { text: '⚠', attrs: { 'aria-hidden': 'true' } }),
    node('span', { text: ver.semantic_status }),
  ]));

  if (rows.length) {
    const t = node('table');
    t.appendChild(node('thead', {}, [node('tr', {}, [
      node('th', { text: 'Claim (citation)' }), node('th', { text: 'Source file' }),
      node('th', { text: 'Line / range' }), node('th', { text: 'SHA' }),
      node('th', { text: 'Citation status' }), node('th', { text: '' }),
    ])]));
    const tb = node('tbody');
    for (const r of rows) {
      tb.appendChild(node('tr', {}, [
        node('td', { class: 'mono', text: r.claim }),
        node('td', { class: 'mono', text: r.source_file }),
        node('td', { class: 'mono', text: r.line_range ?? (r.line != null ? String(r.line) : '—') }),
        node('td', { class: 'mono', text: r.source_sha ?? '—' }),
        node('td', {}, [node('span', {
          class: `cite-status ${r.contained ? 'tone-verified' : 'tone-failed'}`,
          attrs: { title: r.disclosure },
          text: `${r.status_mark} ${r.status}`,
        })]),
        node('td', {}, [copyButton(r.claim, 'copy')]),
      ]));
    }
    t.appendChild(tb);
    evSection.appendChild(node('div', { class: 'table-scroll' }, [t]));
  } else {
    evSection.appendChild(node('p', { class: 'empty', text: 'No citations were recorded for this run.' }));
  }
  $detail.appendChild(evSection);

  /* §6 history */
  const hist = node('ul', { class: 'history' });
  for (const h of P.historyView(run)) {
    hist.appendChild(node('li', {}, [
      node('span', { class: 'stamp', text: shortTime(h.at) ?? '' }),
      node('span', { class: 'hstate', text: h.to }),
      node('span', { class: 'hhuman', text: h.human }),
    ]));
  }
  $detail.appendChild(section('State history', hist));

  /* §8 audit */
  $detail.appendChild(section('Audit', kv([
    ['Run id', run.run_id],
    ['Runtime', run.runtime_id],
    ['Packet', run.audit?.packet_path],
    ['Result', run.audit?.result_path],
    ['Log', run.audit?.log_path],
  ])));

  /* §11 cancel — offered only where the runtime can still act */
  if (!s.terminal) {
    const cancelBtn = node('button', { text: 'Request cancellation', attrs: { type: 'button' } });
    const noteEl = node('span', { class: 'cancel-note', attrs: { role: 'status', 'aria-live': 'polite' } });
    cancelBtn.addEventListener('click', async () => {
      cancelBtn.disabled = true;
      noteEl.textContent = 'Asking the runtime…';
      const res = await window.jarvis.cancel(run.run_id);
      if (!res.ok) {
        noteEl.textContent = `${res.error.code}: ${res.error.message}`;
      } else {
        // Never faked: this is what the runtime answered, not what we hoped (§11).
        const out = P.cancelOutcome(res.status, res.body);
        noteEl.textContent = `${out.label} — ${out.detail}`;
      }
      await refresh();
      cancelBtn.disabled = false;
    });
    $detail.appendChild(section('Cancel', node('div', { class: 'row-actions' }, [cancelBtn, noteEl])));
  }
}

/* ── data flow ───────────────────────────────────────────────────────────── */
async function refresh() {
  const h = await window.jarvis.health();
  if (!h.ok) {
    health = null;
    lastTransportCode = h.error?.code ?? 'RUNTIME_OFFLINE';
    renderSystemStrip();
    renderOffline(lastTransportCode);
    // Submission needs a runtime-reported canonical SHA, so it stays disabled
    // whenever /health could not be read — offline or merely not answering.
    $submit.disabled = true;
    return;
  }
  health = h.body;
  lastTransportCode = 'RUNTIME_OFFLINE';
  $submit.disabled = false;

  const list = await window.jarvis.runs({ limit: 25 });
  runs = list.ok && Array.isArray(list.body?.runs) ? list.body.runs : [];

  // The list endpoint carries no objective; the detail endpoint does. Objectives
  // matter in the list (§7), so they are filled in from run detail.
  await Promise.all(runs.map(async (r, i) => {
    const full = await window.jarvis.run(r.run_id);
    if (full.ok && full.body) runs[i] = full.body;
  }));

  renderSystemStrip();
  renderRunList();
  if (selectedId) renderDetail(runs.find((r) => r.run_id === selectedId) ?? null);
  else renderDetail(null);
}

async function selectRun(id) {
  selectedId = id;
  renderRunList();
  const res = await window.jarvis.run(id);
  renderDetail(res.ok ? res.body : null);
  el('detail-panel').scrollTop = 0;
}

/* ── §4/§5 command submission ────────────────────────────────────────────── */
function syncTemplate() {
  const t = templates.find((x) => x.id === $template.value);
  $templateSummary.textContent = t?.summary ?? '';
  $objective.value = t?.objective ?? '';
}

$form.addEventListener('submit', async (e) => {
  e.preventDefault();
  $submit.disabled = true;
  $submitResult.textContent = 'Submitting to the runtime…';

  const res = await window.jarvis.submit({
    templateId: $template.value,
    objective: $objective.value,
    // The canonical SHA is the runtime's own reported version. The Desktop does
    // not inspect the filesystem to find one (§12).
    canonicalSha: health?.version,
  });

  $submitResult.textContent = '';
  if (!res.ok) {
    const isAuthority = res.error?.code === 'LOCAL_WRITE_AUTHORITY_REFUSED';
    $submitResult.appendChild(node('div', { class: `failure-box${isAuthority ? ' escalation' : ''}` }, [
      node('div', { class: 'failure-class tone-failed', text: isAuthority ? '▲ AUTHORITY REQUIRED' : `✕ ${res.error?.code ?? 'SUBMIT_FAILED'}` }),
      node('p', { class: 'disposition-meaning', text: res.error?.message ?? 'The runtime did not accept this command.' }),
    ]));
    $submit.disabled = false;
    return;
  }

  const out = P.submissionOutcome(res.status, res.body);
  if (!out.accepted) {
    const box = node('div', { class: `failure-box${out.label === 'AUTHORITY REQUIRED' ? ' escalation' : ''}` }, [
      node('div', { class: 'failure-class tone-failed', text: `✕ ${out.label} — ${out.failure_class}` }),
      node('p', { class: 'disposition-meaning', text: out.explanation }),
    ]);
    for (const err of out.errors) box.appendChild(node('p', { class: 'disposition-meaning mono', text: P.redact(err) }));
    $submitResult.appendChild(box);
    $submit.disabled = false;
    return;
  }

  // Accepted — show the runtime's own facts immediately, and nothing more (§5).
  $submitResult.appendChild(kv([
    ['Run id', out.run_id],
    ['Created', shortTime(new Date().toISOString())],
    ['Initial state', out.state],
    ['Objective', $objective.value, true],
  ]));
  if (out.detail) $submitResult.appendChild(node('p', { class: 'hint', text: out.detail }));

  selectedId = out.run_id;
  annotations = await window.jarvis.annotations();
  await refresh();
  await selectRun(out.run_id);
  $submit.disabled = false;
});

$template.addEventListener('change', syncTemplate);
el('refresh').addEventListener('click', refresh);

/* ── §14 events: notification only ───────────────────────────────────────── */
window.jarvis.onStreamStatus((s) => {
  streamStatus = s;
  renderSystemStrip();
  // A reconnect means we may have missed transitions while disconnected, so the
  // durable REST state is re-read rather than trusted to the stream (§14).
  if (s.status === 'CONNECTED') refresh();
});

window.jarvis.onEvent(() => { refresh(); });

window.jarvis.onMenu((m) => {
  if (m === 'refresh') refresh();
  if (m === 'command') $objective.focus();
});

/* ── boot ────────────────────────────────────────────────────────────────── */
(async function main() {
  boot = await window.jarvis.bootstrap();
  templates = boot.templates ?? [];
  annotations = boot.annotations ?? {};
  // The stream is subscribed before this window existed, so its current
  // condition is read here rather than waiting for the next transition.
  if (boot.streamStatus) streamStatus = boot.streamStatus;
  for (const t of templates) {
    $template.appendChild(node('option', { text: t.label, attrs: { value: t.id } }));
  }
  syncTemplate();

  if (boot.endpointError) {
    renderSystemStrip();
    renderOffline(boot.endpointError.code);
    $submit.disabled = true;
    return;
  }
  await refresh();
})();
