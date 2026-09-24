/* JARVIS Founder Workspace B5 renderer.
 * Presentation only. This file intentionally calls no execution IPC.
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

function setContext(ctx, goWork = true) {
  state.context = ctx; saveContext();
  if (goWork) setView('work'); else render();
}
function clearContext() { state.context = null; saveContext(); render(); }
function setView(view) {
  if (!['today','work','graph','monitor','system'].includes(view)) view = 'today';
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
    const need=arr(u.needs_founder)[0];
    fields.push({kind:'work',id:u.id,label:u.title,source:u.file,what:u.plain,moving:u.state_plain||u.state,needs:need?.what||null,changed:u.last_event||null,level:need?'warn':'neutral',type:'Live work'});
  }
  for (const pr of arr(vm.programme_state?.programmes)) {
    if (pr.evidence_state!=='UNVERIFIED / CONFLICT') continue;
    fields.push({kind:'programme',id:pr.id,label:pr.name||pr.id,source:arr(pr.sources)[0]||pr.last_change?.source||'',what:'Programme standing is conflicted.',moving:pr.standing||'UNVERIFIED / CONFLICT',needs:'Do not guess through the conflict; enter the field to inspect its evidence and current work.',changed:pr.last_change?.date||null,level:'warn',type:'Programme uncertainty'});
  }
  for (const m of arr(vm.monitor)) {
    if (!['warn','failed'].includes(m.level)) continue;
    fields.push({kind:'monitor',id:monitorKey(m),label:m.subject,source:'',what:m.plain,moving:m.value,needs:m.level==='failed'?'An observed failure needs investigation.':'An observed condition needs attention.',changed:m.observed_at||null,level:m.level,type:m.level==='failed'?'Observed failure':'Observed condition'});
  }
  return fields;
}

function activeFieldRow(f, origin='Today') {
  return `<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(f.label)}</div><div class="rowMeta">${esc(f.type)}</div><div class="rowPlain" style="margin-top:6px"><b>What this is:</b> ${esc(f.what||'Observed field')}</div><div class="rowPlain"><b>What is moving:</b> ${esc(f.moving||'No movement observed')}</div>${f.needs?`<div class="rowPlain"><b>Needs you:</b> ${esc(f.needs)}</div>`:''}${f.changed?`<div class="rowPlain"><b>What changed:</b> ${esc(f.changed)}</div>`:''}<div class="actions">${contextButton(f.kind,f.id,f.label,origin,f.source,'Enter field')}${f.source?evidenceButton(f.source):''}</div></div>${pill(f.type,f.level)}</div></div>`;
}

function renderToday() {
  const vm=state.vm, units=arr(vm.work?.units), programmes=arr(vm.programme_state?.programmes), events=arr(vm.events);
  const needs=units.filter(u=>arr(u.needs_founder).length);
  const conflicts=programmes.filter(p=>p.evidence_state==='UNVERIFIED / CONFLICT');
  const fields=deriveActiveFields();
  const pop=vm.programme_state?.population || {};
  const unreadable=arr(pop.unreadable).length, unclassified=arr(pop.unclassified).length;
  const headline = fields.length
    ? `${fields.length} active field${fields.length===1?' is':'s are'} alive in your world right now.`
    : 'No active field is currently evidenced strongly enough to place here.';
  const needsHtml = needs.length ? needs.map(u=>{
    const action=arr(u.needs_founder)[0];
    return `<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(u.title)}</div><div class="rowPlain">${esc(action?.what || u.plain)}</div><div class="rowMeta">${esc(u.state_plain || u.state)} · ${esc(u.evidence_state)}</div><div class="actions">${contextButton('work',u.id,u.title,'Today',u.file,'Enter field')}${evidenceButton(u.file)}</div></div>${pill('Needs you','warn')}</div></div>`;
  }).join('') : `<div class="empty">Nothing in the live Work Unit store is asking for a Founder action. This does not claim there are no programme-level decisions elsewhere.</div>`;
  return `<div class="eyebrow">Today · active fields</div><h1>${headline}</h1>
    <p class="lede">Today answers <b>what is alive, what needs you, and where to enter.</b> Fields are derived only from observed Work Units, programme conflicts, and Monitor conditions that need attention—never from invented strategic or psychological insight. ${conflicts.length} programme conflict${conflicts.length===1?'':'s'} remain visible; ${unclassified} source subject${unclassified===1?'':'s'} are unclassified${unreadable?`; ${unreadable} are unreadable`:''}.</p>
    <section class="section"><h2>Active fields <span class="muted">your working world, from observed evidence</span></h2><div class="list">${fields.length?fields.slice(0,18).map(f=>activeFieldRow(f)).join(''):'<div class="empty">No evidence-backed active fields are projected right now.</div>'}</div></section>
    <section class="section"><h2>Needs a Founder decision</h2><div class="list">${needsHtml}</div></section>
    <section class="section"><h2>Changed recently</h2>${events.length?`<div class="card"><div class="timeline">${events.slice(0,14).map(e=>`<div class="date">${esc(String(e.at||'').slice(0,16)||'—')}</div><div>${esc(e.text||e.kind)} <span class="muted mono">· ${esc(e.source||'')}</span>${e.source?` ${evidenceButton(e.source,'Open')}`:''}</div>`).join('')}</div></div>`:`<div class="empty">No events were recorded in the live local event organ.</div>`}</section>
    ${workspaceCard()}`;
}

function workspaceCard() {
  const w=state.vm.meta?.workspace || {};
  return `<section class="section"><h2>Where you are</h2><div class="card"><div class="grid2"><div><h3>Bound workspace</h3><p><b>${esc(w.repo||'Unknown')}</b></p><p class="mono muted">${esc(w.path||'path not exposed')}</p></div><div><h3>Git</h3><p>${esc(w.branch||'branch unobserved')} · <span class="mono">${esc(String(w.head||'').slice(0,12)||'head unobserved')}</span></p><p class="muted">${w.clean===true?'clean':w.clean===false?'working copy has changes':'cleanliness unobserved'}</p></div></div><div class="actions"><button class="btn" data-action="reveal-workspace">Reveal bound workspace</button><button class="btn subtle" data-action="refresh">Refresh live state</button></div></div></section>`;
}

function programmeRow(p, origin) {
  const source=arr(p.sources)[0] || p.last_change?.source || '';
  const level=p.evidence_state==='UNVERIFIED / CONFLICT'?'warn':p.evidence_state==='OBSERVED'?'good':'unobserved';
  return `<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(p.name||p.id)}</div><div class="rowPlain">${esc(p.standing || 'No formal standing line is projected.')}</div><div class="rowMeta">${esc(p.id)} · ${esc(p.evidence_state)}${p.last_change?.date?` · ${esc(p.last_change.date)}`:''}</div><div class="actions">${contextButton('programme',p.id,p.name||p.id,origin,source)}${source?evidenceButton(source):''}<button class="btn subtle" data-action="context-view" data-kind="programme" data-id="${attr(enc(p.id))}" data-label="${attr(enc(p.name||p.id))}" data-origin="${attr(enc(origin))}" data-source="${attr(enc(source))}" data-target="system">System</button></div></div>${pill(p.evidence_state,level)}</div></div>`;
}

function renderWork() {
  const vm=state.vm, ctx=currentContextObject(), units=arr(vm.work?.units), programmes=arr(vm.programme_state?.programmes);
  let conversation;
  if (!state.context) {
    conversation=`<div class="callout slate"><b>Start by choosing real context.</b><br>Use Today or Monitor, or choose a live Work Unit below. B5 does not repeat the old generic “show me what JARVIS would propose” form.</div>`;
  } else if (!ctx) {
    conversation=`<div class="callout bad"><b>${esc(state.context.label)}</b> is no longer present in the live read model. Clear the context or refresh from its source.</div>`;
  } else {
    conversation=workConversation(ctx);
  }
  return `<div class="eyebrow">Work · Kelly + partners</div><h1>Stay inside the work. Let the machinery come to you.</h1><p class="lede">Work is the center of Kelly's operating world. JARVIS carries the governed context now; MAIA, ChatGPT and Claude Code are named partner contexts, but B5 does not pretend a live handoff exists until a governed connection is actually wired.</p>
    <section class="section"><h2>Current conversation</h2>${conversation}</section>
    <section class="section"><h2>Your AI partners</h2><div class="grid2"><div class="card"><h3>JARVIS</h3><p>Connected here: local work, evidence, programme state and system observations.</p></div><div class="card"><h3>MAIA · ChatGPT · Claude Code</h3><p>Context-rich partners in Kelly's wider work. Cross-system context handoff is not wired in B5, so this workspace will not claim they are connected when they are not.</p></div></div></section>
    <section class="section"><h2>Working partners</h2><div class="card"><p>JARVIS is carrying this governed local context. No MAIA, ChatGPT, or Claude Code handoff is connected in B5; those partnerships require their own governed context-handoff act rather than a decorative “connected” badge.</p></div></section>
    <section class="section"><h2>Free-form intent</h2><div class="card"><h3>Held for B6</h3><p>The live O1 intent seam is not connected in B5. When B6 opens, typed—and later spoken—intent enters this same contextual session instead of a separate command system.</p><div class="actions"><button class="btn" disabled>Plan with JARVIS — B6</button></div></div></section>
    <section class="section"><h2>Live Work Units</h2><div class="list">${units.length?units.map(u=>workUnitRow(u)).join(''):'<div class="empty">No readable canonical Work Units are present in the local store.</div>'}</div></section>
    <section class="section"><h2>Choose a programme as context</h2><div class="list">${programmes.slice(0,18).map(p=>programmeRow(p,'Work')).join('')}</div></section>`;
}

function workConversation(ctx) {
  const c=state.context;
  if (c.kind==='programme') {
    const sources=arr(ctx.sources);
    return `<div class="contextCard"><b>You opened ${esc(ctx.name||ctx.id)} from ${esc(c.origin)}.</b><div class="why">JARVIS is carrying the programme identity and its projected standing across every surface. It is not inventing a next act in B5.</div><div class="rowPlain" style="margin-top:9px">${esc(ctx.standing || 'No formal standing is currently projected.')}</div><div class="rowMeta">${esc(ctx.evidence_state)} · ${sources.length} source${sources.length===1?'':'s'}</div><div class="actions">${sources.slice(0,4).map(s=>evidenceButton(s)).join('')}<button class="btn" data-view-jump="graph">Graph</button><button class="btn" data-view-jump="monitor">Monitor</button><button class="btn" data-view-jump="system">System</button></div></div>`;
  }
  if (c.kind==='work') {
    const action=arr(ctx.needs_founder)[0];
    return `<div class="contextCard"><b>You opened the live Work Unit “${esc(ctx.title)}” from ${esc(c.origin)}.</b><div class="why">${esc(ctx.plain)}</div><div class="rowPlain" style="margin-top:9px">State: <b>${esc(ctx.state_plain||ctx.state)}</b>${action?` · Founder action: ${esc(action.what)}`:''}</div><div class="rowMeta">route ${esc(ctx.route||'not routed')} · evidence ${esc(ctx.evidence_state)}</div><div class="actions">${evidenceButton(ctx.file)}<button class="btn" data-view-jump="graph">Graph</button><button class="btn" data-view-jump="monitor">Monitor</button><button class="btn" data-view-jump="system">System</button></div></div>`;
  }
  if (c.kind==='monitor') {
    return `<div class="contextCard"><b>You opened “${esc(ctx.subject)}” from Monitor.</b><div class="why">The observation remains attached as the reason this investigation context exists.</div><div class="rowPlain" style="margin-top:9px">${esc(ctx.plain)}</div><div class="rowMeta">${esc(ctx.value)} · ${esc(ctx.freshness)} · ${esc(ctx.evidence_state)}</div><div class="actions"><button class="btn" data-view-jump="monitor">Back to observation</button><button class="btn" data-action="refresh-monitor">Refresh observation</button><button class="btn" disabled>Plan investigation — B6</button></div></div>`;
  }
  return `<div class="empty">Context is present but its kind is not recognized by B5.</div>`;
}

function workUnitRow(u) {
  const level=arr(u.needs_founder).length?'warn':u.state==='CLOSED'?'good':'neutral';
  return `<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(u.title)}</div><div class="rowPlain">${esc(u.plain)}</div><div class="rowMeta">${esc(u.state_plain||u.state)} · ${esc(u.route||'')} · ${esc(u.evidence_state)}</div><div class="actions">${contextButton('work',u.id,u.title,'Work',u.file)}${evidenceButton(u.file)}</div></div>${pill(u.state_plain||u.state,level)}</div></div>`;
}

function renderGraph() {
  const g=state.vm.graph||{nodes:[],edges:[]}, ctx=currentContextObject();
  let live;
  if (!arr(g.edges).length) {
    live=`<div class="empty"><b>No live relationship join is projected yet.</b><br>B7 owns the evidence-backed relationship join. B5 keeps Graph as a real shared-context surface but refuses to invent edges from names or filenames.</div>`;
  } else {
    live=`<div class="list">${arr(g.edges).map(e=>`<div class="row"><div class="rowTitle">${esc(nodeLabel(g,e.from))} → ${esc(e.rel)} → ${esc(nodeLabel(g,e.to))}</div><div class="rowMeta">${esc(e.evidence?.kind||'evidence')} · ${esc(e.evidence?.ref||'')}</div><div class="actions">${e.evidence?.ref?evidenceButton(e.evidence.ref):''}</div></div>`).join('')}</div>`;
  }
  const contextEvidence=ctx?.sources ? arr(ctx.sources) : state.context?.source ? [state.context.source] : ctx?.file ? [ctx.file] : [];
  return `<div class="eyebrow">Graph · how your world connects</div><h1>See the current field in relation to the rest of your world.</h1><p class="lede">Graph is not a decorative network. Every visible relationship must be evidenced. It carries the same active field as Today and Work, so Kelly can move from a relationship to its source and back without reconstructing what “this” means. The live relation join remains held for B7; B5 will not invent edges.</p>
    <section class="section"><h2>Current active field · center</h2>${state.context?`<div class="contextCard"><b>${esc(state.context.label)}</b><div class="why">from ${esc(state.context.origin)}</div><div class="actions">${contextEvidence.slice(0,6).map(s=>evidenceButton(s)).join('')}<button class="btn" data-view-jump="work">Back to Work</button></div></div>`:'<div class="empty">Choose a programme, Work Unit, or Monitor observation first. Graph will keep that subject in focus.</div>'}</section>
    <section class="section"><h2>Evidence-backed relationships</h2>${live}</section>
    <section class="section"><h2>Choose a programme focus</h2><div class="focusList">${arr(state.vm.programme_state?.programmes).slice(0,30).map(p=>`<button class="focusChip ${state.context?.kind==='programme'&&state.context.id===p.id?'active':''}" data-action="context-only" data-kind="programme" data-id="${attr(enc(p.id))}" data-label="${attr(enc(p.name||p.id))}" data-origin="${attr(enc('Graph'))}" data-source="${attr(enc(arr(p.sources)[0]||''))}">${esc(p.name||p.id)}</button>`).join('')}</div></section>`;
}
function nodeLabel(g,id){return arr(g.nodes).find(n=>n.id===id)?.label||id;}

function renderMonitor() {
  const rows=arr(state.vm.monitor), groups=[...new Set(rows.map(r=>r.group))];
  const counts={}; rows.forEach(r=>counts[r.level]=(counts[r.level]||0)+1);
  const units=arr(state.vm.work?.units).filter(u=>arr(u.needs_founder).length);
  const conflicts=arr(state.vm.programme_state?.programmes).filter(p=>p.evidence_state==='UNVERIFIED / CONFLICT');
  const observedAttention=rows.filter(m=>['warn','failed'].includes(m.level));
  const attentionCount=units.length+conflicts.length+observedAttention.length;
  const founderAttention=[
    ...units.map(u=>`<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(u.title)}</div><div class="rowMeta">Founder decision · live Work Unit</div><div class="rowPlain">${esc(arr(u.needs_founder)[0]?.what||u.plain)}</div><div class="actions">${contextButton('work',u.id,u.title,'Monitor',u.file,'Enter field')}${evidenceButton(u.file)}</div></div>${pill('Decision','warn')}</div></div>`),
    ...conflicts.map(p=>`<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(p.name||p.id)}</div><div class="rowMeta">Programme uncertainty</div><div class="rowPlain">${esc(p.standing||'UNVERIFIED / CONFLICT')}</div><div class="actions">${contextButton('programme',p.id,p.name||p.id,'Monitor',arr(p.sources)[0]||p.last_change?.source||'','Enter field')}</div></div>${pill('Conflict','warn')}</div></div>`),
    ...observedAttention.map(m=>monitorAttentionRow(m)),
  ];
  return `<div class="eyebrow">Monitor · founder attention</div><h1>${attentionCount} thing${attentionCount===1?'':'s'} need attention. ${counts.failed||0} ${counts.failed===1?'is an observed machine failure':'are observed machine failures'}.</h1><p class="lede"><b>Needs attention is not the same as broken.</b> A Founder decision, programme conflict, stale or missing observation, product defect, and machine failure keep their own meanings. Monitor brings them into one attention field without flattening them.</p>
    <section class="section"><h2>Founder attention <span class="muted">decisions · uncertainty · observed conditions</span></h2><div class="list">${founderAttention.length?founderAttention.join(''):'<div class="empty">No current decision, programme conflict, or observed warning/failure is asking for attention.</div>'}</div></section>
    <section class="section"><h2>System observations <span class="muted">technical truth underneath the attention field</span></h2><div class="actions"><button class="btn primary" data-action="refresh-monitor">Refresh observations</button></div></section>
    ${groups.map(g=>`<section class="section"><h2>${esc(g)}</h2><div class="list">${rows.filter(r=>r.group===g).map(m=>monitorRow(m)).join('')}</div></section>`).join('')}`;
}
function monitorAttentionRow(m) {
  const id=monitorKey(m);
  const type=m.level==='failed'?'Observed failure':'Observed condition';
  return `<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(m.subject)}</div><div class="rowMeta">${esc(type)}</div><div class="rowPlain">${esc(m.plain)}</div><div class="rowMeta">${esc(m.value)} · ${esc(m.freshness)}</div><div class="actions">${contextButton('monitor',id,m.subject,'Monitor','', 'Investigate')}${m.level==='failed'?'<button class="btn" data-action="refresh-monitor">Refresh observation</button>':''}</div></div>${pill(type,m.level)}</div></div>`;
}

function monitorRow(m) {
  const id=monitorKey(m); const label=m.subject;
  return `<div class="row"><div class="rowTop"><div class="rowBody"><div class="rowTitle">${esc(m.subject)}</div><div class="rowPlain">${esc(m.plain)}</div><div class="rowMeta">${esc(m.value)} · ${esc(m.freshness)}${m.observed_at?` · ${esc(m.observed_at)}`:''}<br><span class="mono">${esc(m.instrument)}</span></div><div class="actions">${contextButton('monitor',id,label,'Monitor','')}<button class="btn" data-action="refresh-monitor">Refresh observations</button></div></div>${pill(levelLabel(m.level),m.level)}</div></div>`;
}

function renderSystem() {
  const p=state.vm.provenance||{}, programmes=arr(state.vm.programme_state?.programmes), ctx=currentContextObject();
  const sourceRefs=ctx?.sources?arr(ctx.sources):ctx?.file?[ctx.file]:state.context?.source?[state.context.source]:[];
  return `<div class="eyebrow">System · accountability</div><h1>Why JARVIS believes what it is showing you.</h1><p class="lede"><b>Human world first. Technical truth one layer down.</b> System is where you descend when you want artifact/substrate identity, projected standing, population limits, authority, and exact local evidence.</p>
    <section class="section"><h2>Which JARVIS is this?</h2><div class="grid2"><div class="card"><h3>Running artifact</h3><p>${esc(p.artifact?.app_build_sha||'Build stamp not observed')}</p><p class="muted">${esc(p.artifact?.evidence_state||'UNOBSERVED')}</p></div><div class="card"><h3>Bound substrate</h3><p>${esc(p.substrate?.branch||'branch unobserved')} · <span class="mono">${esc(String(p.substrate?.head||'').slice(0,12)||'head unobserved')}</span></p><p class="muted">${esc(p.substrate?.evidence_state||'UNOBSERVED')}</p></div></div><p class="muted" style="margin-top:8px">${esc(p.rule||'')}</p></section>
    <section class="section"><h2>Current context provenance</h2>${state.context?`<div class="contextCard"><b>${esc(state.context.label)}</b><div class="why">${esc(state.context.kind)} · from ${esc(state.context.origin)}</div><div class="actions">${sourceRefs.slice(0,8).map(s=>evidenceButton(s)).join('')}<button class="btn" data-view-jump="work">Back to Work</button></div></div>`:'<div class="empty">No subject is selected. Choose one from Today, Work, Graph or Monitor.</div>'}</section>
    <section class="section"><h2>Programme state</h2><div class="tableWrap"><table><thead><tr><th>Programme</th><th>Evidence state</th><th>Standing</th><th>Source</th></tr></thead><tbody>${programmes.slice(0,100).map(pr=>{const src=arr(pr.sources)[0]||pr.last_change?.source||'';return `<tr><td><b>${esc(pr.name||pr.id)}</b><br><span class="mono muted">${esc(pr.id)}</span></td><td>${esc(pr.evidence_state)}</td><td>${esc(pr.standing||'—')}</td><td>${src?evidenceButton(src,'Open'):'<span class="muted">none projected</span>'}</td></tr>`}).join('')}</tbody></table></div></section>
    <section class="section"><h2>Population honesty</h2><div class="card"><p>${esc(state.vm.programme_state?.population?.why_not_complete || 'Population reports complete under its deterministic projector.')}</p><div class="rowMeta">projector ${esc(state.vm.programme_state?.projector||'unknown')} · observed against <span class="mono">${esc(String(state.vm.meta?.observed_against||'').slice(0,12))}</span></div><div class="actions"><button class="btn" data-action="reveal-workspace">Reveal bound workspace</button></div></div></section>
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
  if(action==='clear-context'){ clearContext(); return; }
  if(action==='close-evidence'){ state.evidence=null; renderEvidence(); return; }
  if(action==='reveal-workspace'){ try{await window.jarvis.revealWorkspace();}catch{} return; }
  if(action==='evidence'){ state.evidence=null; renderEvidence(); await refresh({evidenceRef:dec(el.dataset.ref)}); return; }
  if(action==='context'||action==='context-only'||action==='context-view'){
    const ctx={kind:el.dataset.kind,id:dec(el.dataset.id),label:dec(el.dataset.label),origin:dec(el.dataset.origin),source:dec(el.dataset.source),stale:false};
    state.context=ctx; saveContext();
    if(action==='context') setView('work'); else if(action==='context-view') setView(el.dataset.target||'system'); else render();
  }
}

document.addEventListener('click',handleClick);
window.addEventListener('DOMContentLoaded',()=>refresh());
