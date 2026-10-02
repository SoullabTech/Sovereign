// @ts-check
/**
 * B7R1 — pure evidenced graph join for Kelly's Founder Workspace.
 *
 * No filesystem, no process, no network, no model call.
 * Inputs are already-read governed rows. Every emitted edge carries the exact
 * source object that asserts it. No evidence → no edge.
 */

const ACRONYMS = new Set(['AI','AIN','API','B7','JARVIS','JEV','MAIA','NAS','RGR','SVE','UI','UX','WS']);

/** @param {unknown} v */
const text = (v) => typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim();
/** @param {unknown} v */
const rows = (v) => Array.isArray(v) ? v : [];

/** @param {string} value */
export function normalizeIdentity(value) {
  return text(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/** @param {string} raw */
export function humanGraphLabel(raw) {
  const s=text(raw);
  if (!s) return 'Untitled';
  if (/^WRITERS?-STUDIO$/i.test(s)) return "Writer's Studio";
  return s
    .replace(/\.(md|jsonl?|txt|mjs|cjs|js|tsx?|html|ya?ml)$/i,'')
    .replace(/_?20\d{2}-\d{2}-\d{2}.*$/,'')
    .replace(/[-_]+/g,' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      const upper=part.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;
      if (/^[A-Z0-9]{2,4}$/.test(part)) return upper;
      return part.charAt(0).toUpperCase()+part.slice(1).toLowerCase();
    })
    .join(' ')
    .replace(/^Writers Studio\b/,"Writer's Studio");
}

/** @param {string} id */
const programmeNodeId=(id)=>`programme:${id}`;
/** @param {string} ref */
const recordNodeId=(ref)=>`record:${ref}`;
/** @param {string} id */
const workNodeId=(id)=>`work:${id}`;
/** @param {string} id */
const sessionNodeId=(id)=>`session:${id}`;
/** @param {string} branch */
const branchNodeId=(branch)=>`branch:${branch}`;
/** @param {string} id */
const resultNodeId=(id)=>`result:${id}`;
/** @param {string} id */
const grantNodeId=(id)=>`grant:${id}`;
/** @param {string} id */
const partnerNodeId=(id)=>`partner:${id}`;

/**
 * Strict explicit-relation parser. Co-mention is not a relation.
 * V1 admits only a literal backticked "<ID> supersedes <ID>" statement.
 * @param {{ path:string, line:number, text:string }} source
 * @param {Set<string>} knownProgrammeIds
 */
export function parseExplicitProgrammeRelation(source, knownProgrammeIds) {
  const line=text(source?.text);
  if (!/\bsupersedes\b/i.test(line)) return null;
  const ids=[...line.matchAll(/\x60([A-Z][A-Z0-9-]{2,})\x60/g)].map((m)=>m[1]).filter((id)=>knownProgrammeIds.has(id));
  const unique=[...new Set(ids)];
  if (unique.length !== 2) return null;
  const lower=line.toLowerCase();
  const aPos=lower.indexOf(unique[0].toLowerCase());
  const verbPos=lower.indexOf('supersedes');
  const bPos=lower.indexOf(unique[1].toLowerCase(),verbPos+1);
  if (!(aPos >= 0 && verbPos > aPos && bPos > verbPos)) return null;
  return {
    from: programmeNodeId(unique[0]),
    to: programmeNodeId(unique[1]),
    rel: 'supersedes',
    evidence: { kind:'canonical-programme-relation', ref:`${source.path}:${source.line}` },
  };
}

/**
 * @param {{
 *   programme_state:any,
 *   work?:{units?:any[],handoffs?:any[],results?:any[]},
 *   partner_handoffs?:any[],
 *   explicit_relations?:Array<{from:string,to:string,rel:string,evidence:{kind:string,ref:string}}>
 * }} input
 */
export function buildEvidenceGraph(input) {
  /** @type {Map<string,any>} */
  const nodes=new Map();
  /** @type {Map<string,any>} */
  const edges=new Map();
  const addNode=(/** @type {any} */ n)=>{
    if (!n?.id || !n?.label || nodes.has(n.id)) return;
    nodes.set(n.id,n);
  };
  const addEdge=(/** @type {any} */ e)=>{
    if (!e?.from || !e?.to || !e?.rel || !e?.evidence?.kind || !e?.evidence?.ref) return;
    if (!nodes.has(e.from) || !nodes.has(e.to)) return;
    const key=`${e.from}|${e.rel}|${e.to}|${e.evidence.kind}|${e.evidence.ref}`;
    if (!edges.has(key)) edges.set(key,e);
  };

  const programmes=rows(input?.programme_state?.programmes);
  const programmeIds=new Set(programmes.map((p)=>text(p?.id)).filter(Boolean));

  for (const p of programmes) {
    const id=text(p?.id); if (!id) continue;
    addNode({
      id:programmeNodeId(id), kind:'programme', label:humanGraphLabel(p?.name||id),
      sub:id, evidence_state:text(p?.evidence_state)||'UNVERIFIED',
    });
    for (const a of rows(p?.association)) {
      const ref=text(a?.path); if (!ref) continue;
      addNode({
        id:recordNodeId(ref), kind:'record', label:humanGraphLabel(ref.split('/').pop()||ref),
        sub:ref, evidence_state:text(p?.evidence_state)||'UNVERIFIED',
      });
    }
  }

  for (const p of programmes) {
    const pid=text(p?.id); if (!pid) continue;
    for (const a of rows(p?.association)) {
      const ref=text(a?.path); if (!ref) continue;
      addEdge({
        from:programmeNodeId(pid), to:recordNodeId(ref), rel:a?.role==='supporting'?'supported by record':'has record',
        evidence:{kind:'programme-association',ref},
      });
    }
    const founderSource=text(p?.last_change?.source);
    if (p?.last_change?.authority==='founder record' && founderSource && nodes.has(recordNodeId(founderSource))) {
      addEdge({
        from:programmeNodeId(pid), to:recordNodeId(founderSource), rel:'governed by founder decision',
        evidence:{kind:'founder-record',ref:founderSource},
      });
    }
  }

  const units=rows(input?.work?.units);
  const unitIds=new Set(units.map((u)=>text(u?.id)).filter(Boolean));
  for (const u of units) {
    const id=text(u?.id); if (!id) continue;
    addNode({
      id:workNodeId(id), kind:'work', label:text(u?.title)||'Work Unit',
      sub:id, evidence_state:text(u?.evidence_state)||'UNVERIFIED',
    });
  }
  for (const u of units) {
    const id=text(u?.id); if (!id) continue;
    const evidenceRef=text(u?.file); if (!evidenceRef) continue;
    const programme=text(u?.programme);
    if (programme && programmeIds.has(programme)) {
      addEdge({
        from:workNodeId(id), to:programmeNodeId(programme), rel:'belongs to programme',
        evidence:{kind:'work-unit-record',ref:evidenceRef},
      });
    }
    const parent=text(u?.parent_work_unit);
    if (parent && unitIds.has(parent)) {
      addEdge({
        from:workNodeId(id), to:workNodeId(parent), rel:'child of',
        evidence:{kind:'work-unit-record',ref:evidenceRef},
      });
    }
  }

  for (const u of units) {
    const workId=text(u?.id); if (!workId || !unitIds.has(workId)) continue;
    for (const row of rows(u?.execution_grants)) {
      const grant=row?.grant||{};
      const gid=text(grant?.grant_id); const ledgerRef=text(row?.ledger_ref);
      if (!gid || !ledgerRef) continue;
      const participant=humanGraphLabel(grant?.route_participant_id||'execution');
      addNode({
        id:grantNodeId(gid), kind:'grant',
        label:`Execution grant · ${participant}`,
        sub:`${text(row?.standing)||'UNKNOWN'} · ${gid}`, evidence_state:'OBSERVED',
      });
      addEdge({
        from:workNodeId(workId), to:grantNodeId(gid), rel:'has execution grant',
        evidence:{kind:'grant-ledger',ref:ledgerRef},
      });
    }
  }

  const handoffs=rows(input?.work?.handoffs);
  const sessionIds=new Set(handoffs.map((s)=>text(s?.id)).filter(Boolean));
  for (const s of handoffs) {
    const sid=text(s?.id); if (!sid) continue;
    addNode({
      id:sessionNodeId(sid), kind:'session', label:text(s?.title)||'Session',
      sub:`${text(s?.state)||'unknown'} · ${sid}`, evidence_state:text(s?.evidence_state)||'OBSERVED',
    });
    const branch=text(s?.branch);
    if (branch) addNode({
      id:branchNodeId(branch), kind:'branch', label:humanGraphLabel(branch),
      sub:branch, evidence_state:'RECORDED',
    });
  }
  for (const s of handoffs) {
    const sid=text(s?.id); const ref=text(s?.file); if (!sid || !ref || !sessionIds.has(sid)) continue;
    const branch=text(s?.branch);
    if (branch && nodes.has(branchNodeId(branch))) {
      addEdge({
        from:sessionNodeId(sid), to:branchNodeId(branch), rel:'recorded branch',
        evidence:{kind:'session-record',ref},
      });
    }
    const wid=text(s?.work_unit);
    if (wid && unitIds.has(wid)) {
      addEdge({
        from:sessionNodeId(sid), to:workNodeId(wid), rel:'for work unit',
        evidence:{kind:'session-record',ref},
      });
    }
  }

  for (const r of rows(input?.work?.results)) {
    const rid=text(r?.id); const ref=text(r?.file); if (!rid || !ref) continue;
    addNode({
      id:resultNodeId(rid), kind:'result', label:text(r?.title)||'Result',
      sub:rid, evidence_state:text(r?.evidence_state)||'OBSERVED',
    });
    if (unitIds.has(rid)) {
      addEdge({
        from:resultNodeId(rid), to:workNodeId(rid), rel:'for work unit',
        evidence:{kind:'result-record',ref},
      });
    }
  }

  const normalizedProgrammes=new Map();
  for (const p of programmes) {
    const pid=text(p?.id); if (!pid) continue;
    for (const candidate of [pid,text(p?.name),humanGraphLabel(p?.name||pid)]) {
      const n=normalizeIdentity(candidate); if (!n) continue;
      const list=normalizedProgrammes.get(n)||[]; list.push(pid); normalizedProgrammes.set(n,list);
    }
  }
  for (const h of rows(input?.partner_handoffs)) {
    const hid=text(h?.handoff_id); const field=text(h?.field); const file=text(h?.file);
    if (!hid || !field || !file || h?.authority!=='orientation_only') continue;
    const sourceLabel=h?.source==='chatgpt'?'ChatGPT':h?.source==='claude-code'?'Claude Code':h?.source==='maia'?'MAIA':humanGraphLabel(h?.source||'AI');
    addNode({
      id:partnerNodeId(hid), kind:'partner',
      label:`${sourceLabel} handoff`,
      sub:`${field} · orientation only`, evidence_state:'ORIENTATION_ONLY',
    });
    const matches=[...new Set(normalizedProgrammes.get(normalizeIdentity(field))||[])];
    if (matches.length===1) {
      addEdge({
        from:partnerNodeId(hid), to:programmeNodeId(matches[0]), rel:'orients',
        evidence:{kind:'partner-handoff',ref:`partner-handoff:${file}`},
      });
    }
  }

  for (const e of rows(input?.explicit_relations)) addEdge(e);

  return {
    nodes:[...nodes.values()].sort((a,b)=>String(a.id).localeCompare(String(b.id))),
    edges:[...edges.values()].sort((a,b)=>{
      const ak=`${a.from}|${a.rel}|${a.to}|${a.evidence.ref}`;
      const bk=`${b.from}|${b.rel}|${b.to}|${b.evidence.ref}`;
      return ak.localeCompare(bk);
    }),
  };
}
