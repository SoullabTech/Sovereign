/* JARVIS Founder Workspace B6 renderer.
 * B5 surfaces remain read-first. B6 adds one explicit local-reasoning gesture
 * through the already-ratified submitTask/C1 path; intent never auto-executes.
 */
'use strict';

const $main = document.getElementById('main');
const $contextBar = document.getElementById('contextBar');
const $railFoot = document.getElementById('railFoot');
const $evidenceRoot = document.getElementById('evidenceRoot');

const state = {
  vm: null,
  view: loadSession('jfw:b5:view') || 'today',
  context: loadJsonSession('jfw:b5:context'),
  evidence: null,
  error: null,
  loading: false,
  graphFocus: loadSession('jfw:b7:graph-focus') || null,
  workRoom: {
    input: '',
    intent: null,
    plan: null,
    turns: loadJsonSession('jfw:b6:turns') || [],
    lastClearIntent: loadJsonSession('jfw:b6:last-clear-intent'),
    running: false,
    error: null,
    result: null,
  },
};

function esc(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function attr(v) { return esc(v).replace(/`/g, '&#96;'); }
function enc(v) { return encodeURIComponent(String(v ?? '')); }
function dec(v) { try { return decodeURIComponent(v || ''); } catch { return ''; } }
function arr(v) { return Array.isArray(v) ? v : []; }
function loadSession(k) { try { return sessionStorage.getItem(k); } catch { return null; } }
function loadJsonSession(k) { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } }
function saveSession(k,v) { try { sessionStorage.setItem(k,v); } catch { /* presentation memory only */ } }
function saveContext() { try { state.context ? sessionStorage.setItem('jfw:b5:context', JSON.stringify(state.context)) : sessionStorage.removeItem('jfw:b5:context'); } catch {} }
function saveWorkRoom() {
  try {
    sessionStorage.setItem('jfw:b6:turns', JSON.stringify(state.workRoom.turns.slice(-20)));
    if (state.workRoom.lastClearIntent) sessionStorage.setItem('jfw:b6:last-clear-intent', JSON.stringify(state.workRoom.lastClearIntent));
  } catch { /* session-only conversation memory */ }
}

function levelClass(level) { return ['good','warn','failed','unobserved','unauthorized'].includes(level) ? level : 'neutral'; }
function evidenceButton(ref, label='Open evidence') {
  if (!ref || typeof ref !== 'string') return '';
  return `<button class="btn subtle" data-action="evidence" data-ref="${attr(enc(ref))}">${esc(label)}</button>`;
}
function contextButton(kind,id,label,origin,source='',actionLabel='Work on this') {
  return `<button class="btn primary" data-action="context" data-kind="${attr(kind)}" data-id="${attr(enc(id))}" data-label="${attr(enc(label))}" data-origin="${attr(enc(origin))}" data-source="${attr(enc(source))}">${esc(actionLabel)}</button>`;
}
function inspectButton(kind,id,label,origin,source='') {
  return `<button class="btn" data-action="context-only" data-kind="${attr(kind)}" data-id="${attr(enc(id))}" data-label="${attr(enc(label))}" data-origin="${attr(enc(origin))}" data-source="${attr(enc(source))}">Inspect in context</button>`;
}
function pill(text, level='neutral') { return `<span class="pill ${levelClass(level)}">${esc(text)}</span>`; }

function humanWorkSubject(u) {
  const t=String(u?.title||'').toLowerCase();
  if (t.includes("writer's studio") || t.includes('writers studio') || t.includes('writer studio')) return "Writer's Studio";
  if (t.includes('model mode') || (t.includes('qwen') && t.includes('gpt-oss'))) return 'JARVIS model routing';
  if (t.includes('canonical-confirm-execute') || t.includes('one-shot e1') || t.includes('execution grant')) return 'JARVIS execution safety';
  if (t.includes('provider-execution') || t.includes('ollama-direct')) return 'Local AI execution';
  if (t.includes('voice') || t.includes('whisper') || t.includes('kokoro')) return 'JARVIS voice';
  if (t.includes('storage') || t.includes('disk')) return 'Mac Studio storage';
  if (t.includes('backup') || t.includes('restore')) return 'Backup and recovery';
  return 'JARVIS governed work';
}

function humanWorkStatus(u) {
  const state=String(u?.state||'').toUpperCase();
  if (state==='EVIDENCE_READY') return 'A completed JARVIS check is ready for your review.';
  if (state==='EXECUTING') return 'JARVIS is checking this now under an authority already granted.';
  if (state==='ROUTED') return 'JARVIS has prepared this work. Nothing has run yet.';
  if (state==='AUTHORIZED') return 'This work is authorized but has not run yet.';
  if (state==='BOUNDED') return 'The scope is fixed. Execution is not yet authorized.';
  if (state==='DRAFT') return 'This work has been captured but not started.';
  if (state==='CLOSED' || state==='ADJUDICATED') return 'This work is closed.';
  return u?.state_plain || u?.plain || 'JARVIS has recorded this work.';
}

function humanFounderAsk(u) {
  const need=arr(u?.needs_founder)[0];
  if (!need) return null;
  if (need.action==='canonical-adjudicate') return 'Review the evidence and decide whether this work passes.';
  return `A decision is waiting for you: ${need.what || need.action || 'review this work'}.`;
}

function founderAttentionGate(u) {
  const need=arr(u?.needs_founder)[0];
  if (!need) return null;
  const adjudication=need.action==='canonical-adjudicate';
  return {
    whyKelly: adjudication
      ? 'Only founder adjudication can advance this governed work.'
      : 'This work has reached an explicit founder-authority boundary.',
    whyNow: adjudication
      ? 'The evidence is ready for a pass, revise, or hold decision.'
      : `JARVIS is waiting on: ${need.what || need.action || 'your decision'}.`,
    ifNothing: 'The work stays held. JARVIS does not advance it without your authority.',
  };
}

function attentionGateDetails(gate) {
  if (!gate) return '';
  return `<div class="attentionGate"><div><b>Why you</b> · ${esc(gate.whyKelly)}</div><div><b>Why now</b> · ${esc(gate.whyNow)}</div><div><b>If you do nothing today</b> · ${esc(gate.ifNothing)}</div></div>`;
}

function friendlyProgrammeName(p) {
  const id=String(p?.name||p?.id||'Programme');
  if (id==='JOP-04') return 'JARVIS Desktop rules';
  const acronyms=new Set(['MAIA','JARVIS','AIN','JEV','SVE','RGR','UI','UX','API','NAS','AI']);
  const parts=id.replace(/[-_]0?\d+$/,'').split(/[-_]+/).filter(Boolean);
  return parts.map(x=>acronyms.has(x)?x:(x.length<=3&&/^[A-Z0-9]+$/.test(x)?x:x.charAt(0).toUpperCase()+x.slice(1).toLowerCase())).join(' ') || id;
}

function technicalDetails(lines) {
  const safe=arr(lines).filter(Boolean);
  if (!safe.length) return '';
  return `<details class="technicalDetails"><summary>Technical details</summary><div>${safe.map(x=>`<div>${esc(x)}</div>`).join('')}</div></details>`;
}

function b6LevelLabel(level) {
  return ({UNDERSTAND:'understand',PREPARE:'prepare',CHANGE:'change',RELEASE:'prepare for release'})[level] || 'work on';
}

function currentFieldOrientation() {
  const ctx=currentContextObject();
  if (!state.context || !ctx) return { label:'No field selected', summary:'Kelly is starting from the Work room without a selected field.' };
  if (state.context.kind==='work') return { label:humanWorkSubject(ctx), summary:humanWorkStatus(ctx) };
  if (state.context.kind==='programme') return { label:friendlyProgrammeName(ctx), summary:ctx.evidence_state==='UNVERIFIED / CONFLICT'?'Programme records conflict; JARVIS must not guess the current standing.':'Programme context is selected.' };
  if (state.context.kind==='monitor') return { label:ctx.subject||state.context.label, summary:ctx.plain||'A Monitor observation is selected.' };
  return { label:state.context.label||'Current field', summary:'A Founder Workspace field is selected.' };
}

function b6CompileIntent() {
  const O1=window.JarvisOperatorIntentContract;
  const O2=window.JarvisOperatorWorkGraph;
  state.workRoom.error=null; state.workRoom.result=null;
  if (!O1 || !O2) {
    state.workRoom.intent=null; state.workRoom.plan=null;
    state.workRoom.error='The governed O1/O2 planning contracts are not available in this build.';
    return;
  }
  const intent=O1.compileIntent({ utterance:state.workRoom.input, priorIntent:state.workRoom.lastClearIntent });
  state.workRoom.intent=intent;
  state.workRoom.plan=intent.standing==='CLEAR' ? O2.compileWorkGraph(intent) : null;
  if (intent.standing==='CLEAR') {
    state.workRoom.lastClearIntent=intent;
    saveWorkRoom();
  }
}

function b6LocalPrompt() {
  const intent=state.workRoom.intent;
  const plan=state.workRoom.plan?.graph;
  const field=currentFieldOrientation();
  const steps=arr(plan?.work_units).map(u=>`${u.ordinal}. ${u.objective} → ${u.produces}`).join('\n');
  return [
    'You are JARVIS working with Kelly inside Kelly\'s World.',
    'This is a local reasoning turn only. Do not claim that repository changes, provider execution, merge, deployment, or production actions occurred.',
    `CURRENT FIELD: ${field.label}`,
    `FIELD ORIENTATION: ${field.summary}`,
    `KELLY\'S EXACT REQUEST: ${intent?.raw_utterance || state.workRoom.input}`,
    `REQUESTED OUTCOME: ${b6LevelLabel(intent?.requested_level)}`,
    steps ? `BOUNDED PLAN:\n${steps}` : 'BOUNDED PLAN: unavailable',
    'Respond in plain language. Help Kelly think and decide. If repository evidence is required but not supplied in this turn, say what should be inspected next instead of inventing facts.',
  ].join('\n\n');
}

async function b6RunLocal() {
  if (state.workRoom.running) return;
  const intent=state.workRoom.intent;
  const plan=state.workRoom.plan;
  if (!intent || intent.standing!=='CLEAR' || !plan?.ok) {
    state.workRoom.error='JARVIS needs a clear governed intent and bounded plan before local reasoning can run.';
    render(); return;
  }
  if (!window.jarvis || typeof window.jarvis.submitTask!=='function') {
    state.workRoom.error='This build does not expose the existing local JARVIS reasoning seam.';
    render(); return;
  }
  const prompt=b6LocalPrompt();
  state.workRoom.running=true; state.workRoom.error=null; state.workRoom.result=null;
  render();
  try {
    const response=await window.jarvis.submitTask({
      bounded_for_local:true,
      input_chars:prompt.length,
      prompt,
      operator_posture:'local',
      founder_workspace_context_request:true,
      founder_workspace_objective:intent.raw_utterance,
      founder_workspace_context:state.context ? { kind:state.context.kind, id:state.context.id, label:state.context.label } : null,
    });
    state.workRoom.result=response;
    state.workRoom.turns.push({ role:'kelly', text:intent.raw_utterance, at:new Date().toISOString() });
    const answer=response?.result?.response || response?.result?.error || response?.reason || 'JARVIS returned no readable response.';
    state.workRoom.turns.push({ role:'jarvis', text:String(answer), at:new Date().toISOString(), verification:response?.verification || null, context:response?.context || null, grounding:response?.result?.grounding || null, status:response?.status || null });
    saveWorkRoom();
  } catch (e) {
    state.workRoom.error=String(e?.message||e);
  } finally {
    state.workRoom.running=false; render();
  }
}

async function refresh(opts = {}) {
  const o = typeof opts === 'string' ? { evidenceRef: opts } : (opts || {});
  const evidenceRef = typeof o.evidenceRef === 'string' ? o.evidenceRef : null;
  if (!window.jarvis || typeof window.jarvis.getWorkspaceViewModel !== 'function') {
    state.error = 'This build does not expose the B5 Founder Workspace read seam.'; render(); return;
  }
  state.loading = true; state.error = null; render();
  try {
    const vm = await window.jarvis.getWorkspaceViewModel({ evidence_ref: evidenceRef || undefined, force_refresh: o.force === true, refresh_instruments: o.full === true });
    if (!vm || vm.schema !== 'founder-workspace-viewmodel.v1') {
      state.error = vm?.reason || `Founder Workspace refused (${vm?.status || 'invalid response'}).`;
      state.vm = null; state.evidence = null;
    } else {
      state.vm = vm;
      state.evidence = evidenceRef ? (vm.evidence_preview || { ok:false, reason:'No evidence preview returned.' }) : state.evidence;
      validateContext();
    }
  } catch (e) {
    state.error = String(e?.message || e); state.vm = null;
  } finally { state.loading = false; render(); }
}

function validateContext() {
  if (!state.context || !state.vm) return;
  const {kind,id} = state.context;
  let exists = true;
  if (kind === 'programme') exists = !!findProgramme(id);
  if (kind === 'work') exists = !!findWork(id);
  if (kind === 'monitor') exists = !!findMonitor(id);
  if (!exists) state.context = { ...state.context, stale: true };
}
function findProgramme(id) { return arr(state.vm?.programme_state?.programmes).find(p => p.id === id); }
function findWork(id) { return arr(state.vm?.work?.units).find(u => u.id === id); }
function monitorKey(m) { return `${m.subject}::${m.instrument}`; }
function findMonitor(id) { return arr(state.vm?.monitor).find(m => monitorKey(m) === id); }
function currentContextObject() {
  if (!state.context) return null;
  if (state.context.kind === 'programme') return findProgramme(state.context.id);
  if (state.context.kind === 'work') return findWork(state.context.id);
  if (state.context.kind === 'monitor') return findMonitor(state.context.id);
  return null;
}

function resetGraphFocus() {
  state.graphFocus=null;
  try { sessionStorage.removeItem('jfw:b7:graph-focus'); } catch {}
}
function setContext(ctx, goWork = true) {
  state.context = ctx; saveContext(); resetGraphFocus();
  if (goWork) setView('work'); else render();
}
function clearContext() { state.context = null; saveContext(); resetGraphFocus(); render(); }
function setView(view) {
  if (!['today','work','graph','monitor','system'].includes(view)) view = 'today';
  if (view==='graph' && state.view!=='graph') resetGraphFocus();
  state.view = view; saveSession('jfw:b5:view', view); render();
}

function render() {
  document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === state.view));
  renderContextBar();
  renderRail();
  if (state.loading && !state.vm) { $main.innerHTML = '<div class="loading">Reading live governed state…</div>'; renderEvidence(); return; }
  if (state.error) { $main.innerHTML = `<div class="errorBox"><b>Founder Workspace unavailable</b><p>${esc(state.error)}</p><div class="actions"><button class="btn" data-action="refresh">Try again</button></div></div>`; renderEvidence(); return; }
  if (!state.vm) { $main.innerHTML = '<div class="loading">Reading live governed state…</div>'; renderEvidence(); return; }
  const views = { today: renderToday, work: renderWork, graph: renderGraph, monitor: renderMonitor, system: renderSystem };
  $main.innerHTML = `<div class="wrap">${views[state.view]()}</div>`;
  renderEvidence();
}

function renderRail() {
  if (!state.vm) return;
  const needs = arr(state.vm.work?.units).filter(u => arr(u.needs_founder).length).length;
  const active = arr(state.vm.work?.units).filter(u => !['CLOSED','ADJUDICATED'].includes(u.state)).length;
  const attention = arr(state.vm.monitor).filter(m => ['warn','failed'].includes(m.level)).length;
  setBadge('today', needs || ''); setBadge('work', active || ''); setBadge('monitor', attention || '');
  const w = state.vm.meta?.workspace || {};
  $railFoot.innerHTML = `${esc(w.repo || 'Bound workspace')}<br><span class="mono">${esc(w.branch || 'branch unobserved')}<br>${esc(String(w.head || state.vm.meta.observed_against || '').slice(0,12))}</span>`;
}
function setBadge(k,v) { const el=document.querySelector(`[data-badge="${k}"]`); if(el){el.textContent=v;el.style.visibility=v?'visible':'hidden';} }

function renderContextBar() {
  if (!state.context) {
    $contextBar.innerHTML = `<span class="label">Context</span><span class="muted">Nothing selected yet. Choose something from Today or Monitor, or open a live Work Unit.</span><span class="spacer"></span><button class="btn subtle" data-action="refresh">Refresh</button>`;
    return;
  }
  const stale = state.context.stale ? ' · no longer present in live state' : '';
  $contextBar.innerHTML = `<span class="label">Context</span><span class="ctx">${esc(state.context.label)}</span><span class="origin">from ${esc(state.context.origin || 'workspace')}${esc(stale)}</span><span class="spacer"></span><button class="btn subtle" data-view-jump="today">Today</button><button class="btn subtle" data-view-jump="work">Work</button><button class="btn subtle" data-view-jump="graph">Graph</button><button class="btn subtle" data-view-jump="monitor">Monitor</button><button class="btn subtle" data-view-jump="system">System</button><button class="btn subtle" data-action="clear-context">Clear</button>`;
}

function row(html, level='neutral') { return `<div class="row"><div class="rowTop"><div class="rowBody">${html}</div>${level ? pill(levelLabel(level),level) : ''}</div></div>`; }
function levelLabel(level) { return ({good:'Observed',warn:'Needs care',failed:'Failed',unobserved:'Not observed',unauthorized:'Not permitted',neutral:''})[level] || String(level); }

function deriveActiveFields() {
  const vm=state.vm;
  const fields=[];
  for (const u of arr(vm.work?.units)) {
    if (['CLOSED','ADJUDICATED'].includes(u.state)) continue;
    const ask=humanFounderAsk(u);
    fields.push({
      bucket: ask?'needs':'motion', kind:'work', id:u.id, label:humanWorkSubject(u), source:u.file,
      what:humanWorkStatus(u), moving:u.state_plain||u.state, needs:ask, gate:founderAttentionGate(u), changed:u.last_event||null,
      level:ask?'warn':'neutral', type:ask?'Needs Kelly':'In motion',
      technical:[`Work Unit: ${u.title}`, `State: ${u.state}`, u.route?`Route: ${u.route}`:null, `Evidence: ${u.evidence_state}`, u.file?`Source: ${u.file}`:null],
    });
  }
  for (const pr of arr(vm.programme_state?.programmes)) {
    if (pr.evidence_state!=='UNVERIFIED / CONFLICT') continue;
    const source=arr(pr.sources)[0]||pr.last_change?.source||'';
    fields.push({
      bucket:'watching', kind:'programme', id:pr.id, label:friendlyProgrammeName(pr), source,
      what:'JARVIS has conflicting records for this programme. It will not guess which standing is current.',
      moving:'The conflict is still unresolved.', needs:null, changed:pr.last_change?.date||null, level:'warn', type:'Watching',
      technical:[`Programme: ${pr.id}`, `Standing: ${pr.standing||'UNVERIFIED / CONFLICT'}`, `Evidence: ${pr.evidence_state}`, source?`Source: ${source}`:null],
    });
  }
  for (const m of arr(vm.monitor)) {
    if (!['warn','failed'].includes(m.level)) continue;
    fields.push({
      bucket:'watching', kind:'monitor', id:monitorKey(m), label:m.subject, source:'', what:m.plain,
      moving:m.level==='failed'?'An observed failure is present.':'An observed condition needs watching.', needs:null,
      changed:m.observed_at||null, level:m.level, type:'Watching',
      technical:[`Value: ${m.value}`, `Freshness: ${m.freshness}`, `Instrument: ${m.instrument}`, `Evidence: ${m.evidence_state}`],
    });
  }
  return fields;
}

function activeFieldRow(f, origin='Today') {
  return `<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(f.label)}</div><div class="rowPlain">${esc(f.what||'Observed field')}</div>${f.needs?`<div class="rowPlain"><b>Needs Kelly:</b> ${esc(f.needs)}</div>`:''}${attentionGateDetails(f.gate)}${f.changed?`<div class="rowMeta">Changed: ${esc(f.changed)}</div>`:''}${technicalDetails(f.technical)}<div class="actions">${contextButton(f.kind,f.id,f.label,origin,f.source,'Enter field')}${f.source?evidenceButton(f.source):''}</div></div>${pill(f.type,f.level)}</div></div>`;
}

function deriveAttentionDomains(fields) {
  const vm=state.vm;
  const work=arr(vm.work?.units);
  const programmes=arr(vm.programme_state?.programmes);
  const monitor=arr(vm.monitor);
  const teamObserved=work.length>0;
  const platformObserved=work.length>0 || programmes.length>0 || monitor.length>0;
  return [
    {
      id:'members', label:'Members', visibility:'not-connected',
      plain:'Member relationship signals are not connected to this Founder Workspace yet. JARVIS will not interpret silence as nobody needing you.',
      source:'No admitted member-attention organ in founder-workspace-viewmodel.v1.',
    },
    {
      id:'team', label:'Team', visibility:teamObserved?'partial':'not-connected',
      plain:teamObserved
        ? 'Governed JARVIS work is visible here. Human-team requests and other partner channels are not yet joined.'
        : 'No governed team-work signal is visible in this snapshot.',
      source:teamObserved?'work.units · governed Work Unit records':'No observed Work Unit rows.',
    },
    {
      id:'platform', label:'Platform', visibility:platformObserved?'observed':'not-connected',
      plain:platformObserved
        ? 'Platform work, programme standing, and admitted observations can contribute to Today.'
        : 'Platform state has not been observed in this snapshot.',
      source:platformObserved?'work.units · programme_state · monitor':'No observed platform rows.',
    },
    {
      id:'world', label:'World', visibility:'not-connected',
      plain:'Outreach, partnerships, publishing, GTM, and outside-world signals are not connected to this Founder Workspace yet.',
      source:'No admitted world-attention organ in founder-workspace-viewmodel.v1.',
    },
    {
      id:'your-work', label:'Your Work', visibility:'not-connected',
      plain:'Protected creative work is not yet connected as a governed attention source. Today will not guess what your deepest work should be.',
      source:'No admitted founder-creative-work organ in founder-workspace-viewmodel.v1.',
    },
  ];
}

function attentionDomainCard(d) {
  const label=d.visibility==='observed'?'Observed':d.visibility==='partial'?'Partial':'Not connected';
  const level=d.visibility==='observed'?'good':d.visibility==='partial'?'warn':'unobserved';
  return `<div class="attentionDomain"><div class="attentionDomainTop"><b>${esc(d.label)}</b>${pill(label,level)}</div><div class="rowPlain">${esc(d.plain)}</div>${technicalDetails([`Visibility: ${label}`,`Source: ${d.source}`])}</div>`;
}

function renderAttentionDomains(fields) {
  const domains=deriveAttentionDomains(fields);
  return `<section class="section attentionDomains"><h2>Your field <span class="muted">what JARVIS can and cannot see today</span></h2><div class="attentionDomainGrid">${domains.map(attentionDomainCard).join('')}</div></section>`;
}

function renderToday() {
  const vm=state.vm, events=arr(vm.events), fields=deriveActiveFields();
  const pop=vm.programme_state?.population || {};
  const unreadable=arr(pop.unreadable).length, unclassified=arr(pop.unclassified).length;
  const needs=fields.filter(f=>f.bucket==='needs');
  const motion=fields.filter(f=>f.bucket==='motion');
  const watching=fields.filter(f=>f.bucket==='watching');
  const headline = needs.length
    ? `${needs.length} thing${needs.length===1?' needs':'s need'} you. ${motion.length} ${motion.length===1?'is':'are'} moving.`
    : motion.length
      ? `Nothing needs a decision from you right now. ${motion.length} field${motion.length===1?' is':'s are'} moving.`
      : 'Nothing is asking for your attention right now.';
  const listOrEmpty=(xs,msg)=>xs.length?xs.map(f=>activeFieldRow(f)).join(''):`<div class="empty">${esc(msg)}</div>`;
  const recent=events.length?`<div class="card"><div class="timeline">${events.slice(0,14).map(e=>`<div class="date">${esc(String(e.at||'').slice(0,16)||'—')}</div><div>${esc(e.text||e.kind)} <span class="muted mono">· ${esc(e.source||'')}</span>${e.source?` ${evidenceButton(e.source,'Open')}`:''}</div>`).join('')}</div></div>`:`<div class="empty">No recent events are recorded in the local event organ.</div>`;
  return `<div class="eyebrow">Today · Daily check-in</div><h1>${headline}</h1>
    <p class="lede">JARVIS filters for your attention before showing you the machinery. Start with what only you can decide, then what is already being carried, then what merely needs watching. Technical truth remains one layer down. ${unclassified} source subject${unclassified===1?' is':'s are'} unclassified${unreadable?`; ${unreadable} are unreadable`:''}.</p>
    <div class="card attentionLaw"><b>Attention law</b><p>Nothing belongs in Needs Kelly merely because it exists. It must require your presence, judgment, authorship, care, or authority. If JARVIS can lawfully carry it, it stays out of your way.</p></div>
    ${renderAttentionDomains(fields)}
    <section class="section"><h2>Needs Kelly <span class="muted">only work that cannot lawfully move without you</span></h2><div class="list">${listOrEmpty(needs,'Nothing is waiting for a decision from you.')}</div></section>
    <section class="section"><h2>In motion <span class="muted">already being carried — no action from you</span></h2><div class="list">${listOrEmpty(motion,'No governed work is currently moving.')}</div></section>
    <section class="section"><h2>Watching <span class="muted">stay aware; do not act unless this changes</span></h2><div class="list">${listOrEmpty(watching,'Nothing currently needs watching.')}</div></section>
    <details class="secondaryDetails"><summary>Everything else</summary><div class="detailsBody"><h2>Changed recently</h2>${recent}${workspaceCard()}</div></details>`;
}

function workspaceCard() {
  const w=state.vm.meta?.workspace || {};
  return `<section class="section"><h2>Where you are</h2><div class="card"><div class="grid2"><div><h3>Bound workspace</h3><p><b>${esc(w.repo||'Unknown')}</b></p><p class="mono muted">${esc(w.path||'path not exposed')}</p></div><div><h3>Git</h3><p>${esc(w.branch||'branch unobserved')} · <span class="mono">${esc(String(w.head||'').slice(0,12)||'head unobserved')}</span></p><p class="muted">${w.clean===true?'clean':w.clean===false?'working copy has changes':'cleanliness unobserved'}</p></div></div><div class="actions"><button class="btn" data-action="reveal-workspace">Reveal bound workspace</button><button class="btn subtle" data-action="refresh">Refresh live state</button></div></div></section>`;
}

function programmeRow(p, origin) {
  const source=arr(p.sources)[0] || p.last_change?.source || '';
  const level=p.evidence_state==='UNVERIFIED / CONFLICT'?'warn':p.evidence_state==='OBSERVED'?'good':'unobserved';
  const label=friendlyProgrammeName(p);
  const summary=p.evidence_state==='UNVERIFIED / CONFLICT'
    ? 'JARVIS has conflicting records here and will not guess which standing is current.'
    : p.evidence_state==='OBSERVED'
      ? 'JARVIS has an observed programme record for this field.'
      : 'This programme is present, but its current standing is not fully observed.';
  return `<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(label)}</div><div class="rowPlain">${esc(summary)}</div>${technicalDetails([`Programme: ${p.id}`,`Standing: ${p.standing||'not formally projected'}`,`Evidence: ${p.evidence_state}`,source?`Source: ${source}`:null])}<div class="actions">${contextButton('programme',p.id,label,origin,source)}${source?evidenceButton(source):''}<button class="btn subtle" data-action="context-view" data-kind="programme" data-id="${attr(enc(p.id))}" data-label="${attr(enc(label))}" data-origin="${attr(enc(origin))}" data-source="${attr(enc(source))}" data-target="system">System</button></div></div>${pill(level==='warn'?'Watching':level==='good'?'Observed':'Not observed',level)}</div></div>`;
}

function renderTurnContext(t) {
  if (t.role!=='jarvis' || !t.context || t.grounding) return '';
  const p=t.context.precision||{};
  const partners=t.context.partners||{};
  const bits=[];
  if (p.fragment_count>0) bits.push(`Canonical context: ${p.field?.label||'current field'} · ${p.fragment_count} evidence fragment${p.fragment_count===1?'':'s'} · @${String(p.canonical_sha||'').slice(0,10)}`);
  else if (p.status && p.status!=='NOT_REQUESTED') bits.push(`Canonical context: ${String(p.status).toLowerCase().replaceAll('_',' ')}`);
  if (arr(partners.sources).length) bits.push(`Partner orientation: ${[...new Set(partners.sources)].map(x=>x==='claude-code'?'Claude Code':x==='chatgpt'?'ChatGPT':'MAIA').join(' + ')}`);
  return bits.length?`<div class="turnContext">${bits.map(x=>`<div>${esc(x)}</div>`).join('')}</div>`:'';
}

function renderB6Turns() {
  const turns=arr(state.workRoom.turns);
  if (!turns.length) return `<div class="empty">This working room is ready. Your local JARVIS conversation will stay here for this app session.</div>`;
  return `<div class="workTurns">${turns.map(t=>{
    const who=t.role==='kelly'?'Kelly':'JARVIS';
    const cls=t.role==='kelly'?'kelly':'jarvis';
    const correctnessLabel=t.grounding?'evidence grounding':'answer correctness';
    const verification=t.role==='jarvis'&&t.verification
      ? `<div class="turnVerification">${t.verification.pass===true?'Local execution verified':'Local execution not verified'}${t.verification.correctness?` · ${correctnessLabel}: ${esc(String(t.verification.correctness).toLowerCase())}`:''}${t.verification.correctness_reason?` · ${esc(t.verification.correctness_reason)}`:''}</div>`:'';
    return `<div class="turn ${cls}"><div class="turnWho">${who}</div><div class="turnText">${esc(t.text).replace(/\n/g,'<br>')}</div>${renderTurnContext(t)}${verification}</div>`;
  }).join('')}</div>`;
}

function renderB6Plan() {
  const intent=state.workRoom.intent;
  if (!intent) return '';
  if (intent.standing==='INVALID') return `<div class="callout bad"><b>I need something to work on.</b><br>${esc(arr(intent.ambiguities)[0]||'The request is empty.')}</div>`;
  if (intent.standing==='AMBIGUOUS') {
    return `<div class="callout slate"><b>I need one clearer starting word.</b><br>${esc(arr(intent.ambiguities)[0]||'JARVIS will not guess a stronger intention.')}<div class="actions"><button class="btn" data-action="b6-prefix" data-prefix="Investigate ">Investigate</button><button class="btn" data-action="b6-prefix" data-prefix="Plan ">Plan</button><button class="btn" data-action="b6-prefix" data-prefix="Change ">Change</button><button class="btn" data-action="b6-prefix" data-prefix="Release ">Prepare for release</button></div></div>`;
  }
  const plan=state.workRoom.plan;
  if (!plan?.ok) return `<div class="callout bad"><b>JARVIS could not form a bounded plan.</b><br>${esc(arr(plan?.blockers)[0]?.detail||'The planning contract refused this request.')}</div>`;
  const steps=arr(plan.graph?.work_units);
  return `<div class="planCard"><div class="planHead"><b>I understand this as: ${esc(b6LevelLabel(intent.requested_level))}</b><span class="pill neutral">intent only · no authority</span></div><div class="planObjective">${esc(intent.objective)}</div><ol>${steps.map(s=>`<li><b>${esc(s.kind.toLowerCase())}</b> — ${esc(s.objective)} <span class="muted">→ ${esc(s.produces)}</span></li>`).join('')}</ol><div class="actions"><button class="btn primary" data-action="b6-run-local" ${state.workRoom.running?'disabled':''}>${state.workRoom.running?'JARVIS is thinking…':'Work with local JARVIS'}</button></div><div class="rowMeta">Local reasoning only. This does not edit files, create a Work Unit, call an external model, merge, deploy, or touch production.</div></div>`;
}

function lastResolvedTurnContext() {
  if (state.context) return null;
  const last=[...arr(state.workRoom.turns)].reverse().find(t=>t.role==='jarvis' && t.context?.precision?.resolved_label && t.context?.precision?.fragment_count>0);
  if (!last) return null;
  return {
    kind:'programme',
    id:last.context.precision.field?.id || null,
    label:last.context.precision.resolved_label,
    summary:'Resolved safely from your request for the last JARVIS turn. This is not a persistent field selection.',
  };
}

function renderB6Room() {
  const resolved=lastResolvedTurnContext();
  const field=resolved || currentFieldOrientation();
  const fieldKind=resolved ? 'Turn context' : 'Current field';
  const error=state.workRoom.error?`<div class="callout bad"><b>Working room stopped.</b><br>${esc(state.workRoom.error)}</div>`:'';
  return `<section class="section"><h2>Work with JARVIS</h2><div class="workField"><span class="label">${fieldKind}</span><b>${esc(field.label)}</b><span>${esc(field.summary)}</span></div>${renderB6Turns()}<div class="workComposer card"><label for="b6IntentInput"><b>What do you want to do?</b></label><textarea id="b6IntentInput" maxlength="1200" rows="4" placeholder="Try: Investigate what is blocking Writer's Studio. Plan the next clean step. Change the way Today groups this work.">${esc(state.workRoom.input)}</textarea><div class="rowMeta">JARVIS preserves your words. If your intent is ambiguous, it asks instead of guessing.</div><div class="actions"><button class="btn primary" data-action="b6-interpret">Plan this with JARVIS</button><button class="btn subtle" data-action="b6-clear-room">Clear working room</button></div></div>${error}${renderB6Plan()}</section>`;
}

function renderWork() {
  const vm=state.vm, ctx=currentContextObject(), units=arr(vm.work?.units), programmes=arr(vm.programme_state?.programmes);
  let conversation;
  if (!state.context) {
    const resolved=lastResolvedTurnContext();
    conversation=resolved
      ? `<div class="callout slate"><b>${esc(resolved.label)} was resolved for the last turn.</b><br>JARVIS inferred that context safely from your request. It has not silently turned that inference into a persistent field selection.</div>`
      : `<div class="callout slate"><b>No persistent field selected.</b><br>You can start working anyway, or choose something from Today or Monitor and its context will follow you here.</div>`;
  } else if (!ctx) {
    conversation=`<div class="callout bad"><b>${esc(state.context.label)}</b> is no longer present in the live read model. Clear the context or refresh from its source.</div>`;
  } else {
    conversation=workConversation(ctx);
  }
  return `<div class="eyebrow">Work · Kelly + partners</div><h1>This is where we work.</h1><p class="lede">Tell JARVIS what you want to investigate, prepare, change, or prepare for release. Your words become governed intent and a bounded plan before anything runs. Local reasoning requires a separate explicit gesture.</p>
    ${renderB6Room()}
    <section class="section"><h2>Current field context</h2>${conversation}</section>
    <section class="section"><h2>Your AI partners</h2><div class="grid2"><div class="card"><h3>JARVIS · local</h3><p>Live here now: governed intent, bounded planning, local reasoning, evidence and programme context.</p></div><div class="card"><h3>MAIA · ChatGPT · Claude Code</h3><p>B6R1 can now accept bounded local handoff receipts from these partners when one exists for the current field. A handoff is orientation only: it does not become repository evidence and grants no authority.</p></div></div></section>
    <details class="secondaryDetails"><summary>Existing Work Units and programmes</summary><div class="detailsBody"><section class="section"><h2>Live Work Units</h2><div class="list">${units.length?units.map(u=>workUnitRow(u)).join(''):'<div class="empty">No readable canonical Work Units are present in the local store.</div>'}</div></section><section class="section"><h2>Choose a programme as context</h2><div class="list">${programmes.slice(0,18).map(p=>programmeRow(p,'Work')).join('')}</div></section></div></details>`;
}

function workConversation(ctx) {
  const c=state.context;
  if (c.kind==='programme') {
    const sources=arr(ctx.sources), label=friendlyProgrammeName(ctx);
    return `<div class="contextCard"><b>${esc(label)}</b><div class="why">JARVIS is carrying this programme context across every surface. Use the working room above to decide what you want to do with it.</div><div class="rowPlain" style="margin-top:9px">${ctx.evidence_state==='UNVERIFIED / CONFLICT'?'The current programme record is conflicted; JARVIS will not guess through it.':'The programme context is available for inspection.'}</div>${technicalDetails([`Programme: ${ctx.id}`,`Standing: ${ctx.standing||'not formally projected'}`,`Evidence: ${ctx.evidence_state}`])}<div class="actions">${sources.slice(0,4).map(s=>evidenceButton(s)).join('')}<button class="btn" data-view-jump="graph">Graph</button><button class="btn" data-view-jump="monitor">Monitor</button><button class="btn" data-view-jump="system">System</button></div></div>`;
  }
  if (c.kind==='work') {
    const label=humanWorkSubject(ctx), ask=humanFounderAsk(ctx);
    return `<div class="contextCard"><b>${esc(label)}</b><div class="why">${esc(humanWorkStatus(ctx))}</div>${ask?`<div class="rowPlain" style="margin-top:9px"><b>Needs Kelly:</b> ${esc(ask)}</div>`:''}${technicalDetails([`Work Unit: ${ctx.title}`,`State: ${ctx.state}`,ctx.route?`Route: ${ctx.route}`:null,`Evidence: ${ctx.evidence_state}`,ctx.file?`Source: ${ctx.file}`:null])}<div class="actions">${evidenceButton(ctx.file)}<button class="btn" data-view-jump="graph">Graph</button><button class="btn" data-view-jump="monitor">Monitor</button><button class="btn" data-view-jump="system">System</button></div></div>`;
  }
  if (c.kind==='monitor') {
    return `<div class="contextCard"><b>You opened “${esc(ctx.subject)}” from Monitor.</b><div class="why">The observation remains attached as the reason this working context exists. Use the working room above to investigate it.</div><div class="rowPlain" style="margin-top:9px">${esc(ctx.plain)}</div><div class="rowMeta">${esc(ctx.value)} · ${esc(ctx.freshness)} · ${esc(ctx.evidence_state)}</div><div class="actions"><button class="btn" data-view-jump="monitor">Back to observation</button><button class="btn" data-action="refresh-monitor">Refresh observation</button></div></div>`;
  }
  return `<div class="empty">Context is present but its kind is not recognized by this working room.</div>`;
}

function workUnitRow(u) {
  const ask=humanFounderAsk(u), level=ask?'warn':u.state==='CLOSED'?'good':'neutral';
  const label=humanWorkSubject(u);
  return `<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(label)}</div><div class="rowPlain">${esc(humanWorkStatus(u))}</div>${ask?`<div class="rowPlain"><b>Needs Kelly:</b> ${esc(ask)}</div>`:''}${technicalDetails([`Work Unit: ${u.title}`,`State: ${u.state}`,u.route?`Route: ${u.route}`:null,`Evidence: ${u.evidence_state}`,u.file?`Source: ${u.file}`:null])}<div class="actions">${contextButton('work',u.id,label,'Work',u.file)}${evidenceButton(u.file)}</div></div>${pill(ask?'Needs Kelly':u.state_plain||u.state,level)}</div></div>`;
}

function graphNode(g,id){return arr(g.nodes).find(n=>n.id===id)||null;}
function graphNodeIdForContext() {
  if (state.context?.kind==='programme') return `programme:${state.context.id}`;
  if (state.context?.kind==='work') return `work:${state.context.id}`;
  const resolved=lastResolvedTurnContext();
  if (!state.context && resolved?.id) return `programme:${resolved.id}`;
  return null;
}
function graphCategory(node,edge) {
  if (edge?.rel==='governed by founder decision') return 'Decisions';
  return ({work:'Work',programme:'Programmes',record:'Records',session:'Sessions',branch:'Sessions',result:'Results',partner:'Partner context',grant:'System evidence',run:'System evidence'})[node?.kind]||'Related';
}
function renderGraphRelation(g,centerId,edge) {
  const outbound=edge.from===centerId;
  const otherId=outbound?edge.to:edge.from;
  const other=graphNode(g,otherId);
  if (!other) return '';
  const phrase=outbound?`${edge.rel} →`:`← ${edge.rel}`;
  return `<div class="graphRelation"><div class="graphRelationTop"><div><div class="graphRel">${esc(phrase)}</div><div class="graphNodeLabel">${esc(other.label)}</div><div class="graphNodeSub">${esc(other.sub||other.kind)}</div></div><span class="pill neutral">${esc(other.kind)}</span></div><div class="actions"><button class="btn" data-action="graph-focus" data-node="${attr(enc(other.id))}">Explore</button>${edge.evidence?.ref?evidenceButton(edge.evidence.ref,'Open evidence'):''}</div></div>`;
}
function renderGraph() {
  const g=state.vm.graph||{nodes:[],edges:[]};
  const preferred=state.graphFocus || graphNodeIdForContext();
  const center=preferred?graphNode(g,preferred):null;
  if (state.graphFocus && !center) { state.graphFocus=null; try{sessionStorage.removeItem('jfw:b7:graph-focus')}catch{} }
  const centerId=center?.id||null;
  const direct=centerId?arr(g.edges).filter(e=>e.from===centerId||e.to===centerId):[];
  const groups=new Map();
  for (const edge of direct) {
    const other=graphNode(g,edge.from===centerId?edge.to:edge.from); if(!other) continue;
    const cat=graphCategory(other,edge); const list=groups.get(cat)||[]; list.push(edge); groups.set(cat,list);
  }
  const order=['Work','Programmes','Decisions','Records','Sessions','Results','Partner context','System evidence','Related'];
  const grouped=order.filter(k=>groups.has(k)).map(k=>`<section class="graphGroup"><h3>${esc(k)}</h3><div class="graphGroupGrid">${groups.get(k).map(e=>renderGraphRelation(g,centerId,e)).join('')}</div></section>`).join('');
  const resolved=lastResolvedTurnContext();
  const centerNote=state.graphFocus
    ? 'Exploring one evidenced neighborhood. Your working field has not changed.'
    : state.context
      ? `Current field from ${state.context.origin}.`
      : resolved?.id ? 'Resolved safely from your last Work turn; not promoted into a persistent selection.' : '';
  const centreHtml=center
    ? `<div class="graphCenter"><div class="eyebrow">Center</div><h2>${esc(center.label)}</h2><div class="graphNodeSub">${esc(center.sub||center.kind)}</div><p>${esc(centerNote)}</p><div class="actions">${state.graphFocus?'<button class="btn" data-action="graph-reset-focus">Back to field</button>':''}<button class="btn" data-view-jump="work">Work</button></div></div>`
    : `<div class="empty"><b>No graph field is selected.</b><br>Enter a field from Today or Work, or choose a programme below. Graph will show only its directly evidenced neighborhood.</div>`;
  const relationHtml=center
    ? (direct.length?grouped:`<div class="empty"><b>No evidenced one-hop relationships are available for this node.</b><br>Graph does not fill empty space with inferred links.</div>`)
    : '';
  return `<div class="eyebrow">Graph · how your world connects</div><h1>${center?`What ${esc(center.label)} is connected to.`:'See your work through evidenced relationships.'}</h1><p class="lede">The real Graph is now live. It opens on the current field and shows one evidenced neighborhood at a time. <b>No evidence → no relationship.</b> Similar names, shared prefixes, co-mentions and AI guesses do not create edges.</p>
    <section class="section">${centreHtml}</section>
    ${center?`<section class="section"><div class="graphScope"><b>${direct.length} direct relationship${direct.length===1?'':'s'}</b><span> · one hop only · technical identity underneath · evidence opens in place</span></div>${relationHtml}</section>`:''}
    <details class="secondaryDetails" ${center?'':'open'}><summary>Choose a programme focus</summary><div class="detailsBody"><div class="focusList">${arr(state.vm.programme_state?.programmes).slice(0,60).map(p=>{const label=friendlyProgrammeName(p);return `<button class="focusChip ${centerId===`programme:${p.id}`?'active':''}" data-action="context-only" data-kind="programme" data-id="${attr(enc(p.id))}" data-label="${attr(enc(label))}" data-origin="${attr(enc('Graph'))}" data-source="${attr(enc(arr(p.sources)[0]||''))}">${esc(label)}</button>`}).join('')}</div></div></details>`;
}
function nodeLabel(g,id){return graphNode(g,id)?.label||id;}

function renderMonitor() {
  const rows=arr(state.vm.monitor), groups=[...new Set(rows.map(r=>r.group))];
  const founderNeeds=arr(state.vm.work?.units).filter(u=>arr(u.needs_founder).length);
  const conflicts=arr(state.vm.programme_state?.programmes).filter(p=>p.evidence_state==='UNVERIFIED / CONFLICT');
  const observedAttention=rows.filter(m=>['warn','failed'].includes(m.level));
  const needsHtml=founderNeeds.length?founderNeeds.map(u=>{
    const label=humanWorkSubject(u), ask=humanFounderAsk(u);
    return `<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(label)}</div><div class="rowPlain">${esc(humanWorkStatus(u))}</div><div class="rowPlain"><b>Needs Kelly:</b> ${esc(ask)}</div>${technicalDetails([`Work Unit: ${u.title}`,`State: ${u.state}`,u.route?`Route: ${u.route}`:null,`Evidence: ${u.evidence_state}`])}<div class="actions">${contextButton('work',u.id,label,'Monitor',u.file,'Enter field')}${evidenceButton(u.file)}</div></div>${pill('Needs Kelly','warn')}</div></div>`;
  }).join(''):'<div class="empty">Nothing is waiting for a decision from you.</div>';
  const watching=[...conflicts.map(p=>programmeRow(p,'Monitor')),...observedAttention.map(m=>monitorAttentionRow(m))];
  const systemHtml=groups.map(g=>`<section class="section"><h2>${esc(g)}</h2><div class="list">${rows.filter(r=>r.group===g).map(m=>monitorRow(m)).join('')}</div></section>`).join('');
  return `<div class="eyebrow">Monitor · what needs watching</div><h1>${founderNeeds.length} need${founderNeeds.length===1?'s':''} you · ${watching.length} ${watching.length===1?'thing needs':'things need'} watching.</h1><p class="lede"><b>Needs attention is not the same as broken.</b> Decisions come first. Uncertainty and observed conditions come next. The full technical observation field stays available underneath.</p>
    <section class="section"><h2>Needs Kelly <span class="muted">explicit decisions</span></h2><div class="list">${needsHtml}</div></section>
    <section class="section"><h2>Watching <span class="muted">uncertainty and observed conditions</span></h2><div class="list">${watching.length?watching.join(''):'<div class="empty">Nothing currently needs watching.</div>'}</div></section>
    <details class="secondaryDetails"><summary>System observations</summary><div class="detailsBody"><div class="actions"><button class="btn primary" data-action="refresh-monitor">Refresh observations</button></div>${systemHtml}</div></details>`;
}
function monitorAttentionRow(m) {
  const id=monitorKey(m);
  const type=m.level==='failed'?'Observed failure':'Observed condition';
  return `<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(m.subject)}</div><div class="rowPlain">${esc(m.plain)}</div>${technicalDetails([`Value: ${m.value}`,`Freshness: ${m.freshness}`,m.observed_at?`Observed: ${m.observed_at}`:null,`Instrument: ${m.instrument}`,`Evidence: ${m.evidence_state}`])}<div class="actions">${contextButton('monitor',id,m.subject,'Monitor','', 'Investigate')}${m.level==='failed'?'<button class="btn" data-action="refresh-monitor">Refresh observation</button>':''}</div></div>${pill(type,m.level)}</div></div>`;
}

function monitorRow(m) {
  const id=monitorKey(m); const label=m.subject;
  return `<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(m.subject)}</div><div class="rowPlain">${esc(m.plain)}</div>${technicalDetails([`Value: ${m.value}`,`Freshness: ${m.freshness}`,m.observed_at?`Observed: ${m.observed_at}`:null,`Instrument: ${m.instrument}`,`Evidence: ${m.evidence_state}`])}<div class="actions">${contextButton('monitor',id,label,'Monitor','')}<button class="btn" data-action="refresh-monitor">Refresh observations</button></div></div>${pill(levelLabel(m.level),m.level)}</div></div>`;
}

function renderSystem() {
  const p=state.vm.provenance||{}, programmes=arr(state.vm.programme_state?.programmes), ctx=currentContextObject();
  const sourceRefs=ctx?.sources?arr(ctx.sources):ctx?.file?[ctx.file]:state.context?.source?[state.context.source]:[];
  return `<div class="eyebrow">System · accountability</div><h1>Why JARVIS believes what it is showing you.</h1><p class="lede"><b>Human world first. Technical truth one layer down.</b> System is where you descend when you want artifact/substrate identity, projected standing, population limits, authority, and exact local evidence.</p>
    <section class="section"><h2>Which JARVIS is this?</h2><div class="grid2"><div class="card"><h3>Running artifact</h3><p>${esc(p.artifact?.app_build_sha||'Build stamp not observed')}</p><p class="muted">${esc(p.artifact?.evidence_state||'UNOBSERVED')}</p></div><div class="card"><h3>Bound substrate</h3><p>${esc(p.substrate?.branch||'branch unobserved')} · <span class="mono">${esc(String(p.substrate?.head||'').slice(0,12)||'head unobserved')}</span></p><p class="muted">${esc(p.substrate?.evidence_state||'UNOBSERVED')}</p></div></div><p class="muted" style="margin-top:8px">${esc(p.rule||'')}</p></section>
    <section class="section"><h2>Current context provenance</h2>${state.context?`<div class="contextCard"><b>${esc(state.context.label)}</b><div class="why">${esc(state.context.kind)} · from ${esc(state.context.origin)}</div><div class="actions">${sourceRefs.slice(0,8).map(s=>evidenceButton(s)).join('')}<button class="btn" data-view-jump="work">Back to Work</button></div></div>`:'<div class="empty">No subject is selected. Choose one from Today, Work, Graph or Monitor.</div>'}</section>
    <section class="section"><h2>Programme state</h2><div class="tableWrap"><table><thead><tr><th>Programme</th><th>Evidence state</th><th>Standing</th><th>Source</th></tr></thead><tbody>${programmes.slice(0,100).map(pr=>{const src=arr(pr.sources)[0]||pr.last_change?.source||'';return `<tr><td><b>${esc(pr.name||pr.id)}</b><br><span class="mono muted">${esc(pr.id)}</span></td><td>${esc(pr.evidence_state)}</td><td>${esc(pr.standing||'—')}</td><td>${src?evidenceButton(src,'Open'):'<span class="muted">none projected</span>'}</td></tr>`}).join('')}</tbody></table></div></section>
    <section class="section"><h2>Population honesty</h2><div class="card"><p>${esc(state.vm.programme_state?.population?.why_not_complete || 'Population reports complete under its deterministic projector.')}</p><div class="rowMeta">projector ${esc(state.vm.programme_state?.projector||'unknown')} · observed against <span class="mono">${esc(String(state.vm.meta?.observed_against||'').slice(0,12))}</span></div><div class="actions"><button class="btn" data-action="reveal-workspace">Reveal bound workspace</button></div></div></section>
    <section class="section"><h2>Operator Console</h2><div class="card"><p>The full governed JARVIS operator surface remains available underneath Kelly’s World. Opening it changes presentation only; it grants no new authority.</p><div class="actions"><button class="btn" data-action="open-operator-console">Open Operator Console</button></div></div></section>
    <section class="section"><h2>Vocabulary</h2>${arr(state.vm.vocabularies).length?`<div class="list">${arr(state.vm.vocabularies).map(v=>row(`<div class="rowTitle">${esc(v.name||v.term)}</div><div class="rowPlain">${esc(v.plain||'')}</div>`,'neutral')).join('')}</div>`:'<div class="empty">No live vocabulary projection is wired into B5. The UI does not copy the prototype glossary and call it live.</div>'}</section>`;
}

function renderEvidence() {
  if (!state.evidence) { $evidenceRoot.innerHTML=''; return; }
  const e=state.evidence;
  $evidenceRoot.innerHTML=`<aside class="evidencePane" aria-label="Evidence preview"><div class="evidenceHead"><div><b>Evidence</b><div class="evidencePath">${esc(e.display_path||e.ref||'')}</div></div><span class="spacer"></span><button class="btn" data-action="close-evidence">Back to context</button></div><div class="evidenceBody">${e.ok?`<div class="muted">Lines ${esc(e.line_start)}–${esc(e.line_end)}${e.truncated?' · preview bounded':''}</div><pre>${esc(e.text)}</pre>`:`<div class="callout bad"><b>Evidence preview refused.</b><br>${esc(e.reason||'Unknown reason')}</div>`}</div></aside>`;
}

async function handleClick(e) {
  const el=e.target.closest('button'); if(!el) return;
  if (el.dataset.view) { setView(el.dataset.view); return; }
  if (el.dataset.viewJump) { setView(el.dataset.viewJump); return; }
  const action=el.dataset.action;
  if(action==='refresh'){ await refresh({force:true}); return; }
  if(action==='refresh-monitor'){ await refresh({force:true,full:true}); return; }
  if(action==='b6-interpret'){
    const input=document.getElementById('b6IntentInput');
    if(input) state.workRoom.input=String(input.value||'');
    b6CompileIntent(); render(); return;
  }
  if(action==='b6-run-local'){ await b6RunLocal(); return; }
  if(action==='b6-prefix'){
    const prefix=String(el.dataset.prefix||'');
    state.workRoom.input=`${prefix}${state.workRoom.input}`.trim();
    b6CompileIntent(); render(); return;
  }
  if(action==='b6-clear-room'){
    state.workRoom={input:'',intent:null,plan:null,turns:[],lastClearIntent:null,running:false,error:null,result:null};
    try { sessionStorage.removeItem('jfw:b6:turns'); sessionStorage.removeItem('jfw:b6:last-clear-intent'); } catch {}
    render(); return;
  }
  if(action==='graph-focus'){
    const id=dec(el.dataset.node);
    if (graphNode(state.vm?.graph||{nodes:[]},id)) { state.graphFocus=id; saveSession('jfw:b7:graph-focus',id); render(); }
    return;
  }
  if(action==='graph-reset-focus'){ resetGraphFocus(); render(); return; }
  if(action==='clear-context'){ clearContext(); return; }
  if(action==='close-evidence'){ state.evidence=null; renderEvidence(); return; }
  if(action==='reveal-workspace'){ try{await window.jarvis.revealWorkspace();}catch{} return; }
  if(action==='open-operator-console'){ window.location.href='index.html'; return; }
  if(action==='evidence'){ state.evidence=null; renderEvidence(); await refresh({evidenceRef:dec(el.dataset.ref)}); return; }
  if(action==='context'||action==='context-only'||action==='context-view'){
    const ctx={kind:el.dataset.kind,id:dec(el.dataset.id),label:dec(el.dataset.label),origin:dec(el.dataset.origin),source:dec(el.dataset.source),stale:false};
    state.context=ctx; saveContext(); resetGraphFocus();
    if(action==='context') setView('work'); else if(action==='context-view') setView(el.dataset.target||'system'); else render();
  }
}

document.addEventListener('click',handleClick);
document.addEventListener('input',(e)=>{
  if (e.target && e.target.id==='b6IntentInput') state.workRoom.input=String(e.target.value||'');
});
window.addEventListener('DOMContentLoaded',()=>refresh());
