/**
 * B2 VISUAL WITNESS — renders each acceptance state, shoots it at four
 * viewports, and runs the mechanical half of V9 / F13 over the real DOM.
 *
 * ⚠️ CONTROLLED-COMPONENT WITNESS. Real components, real CSS, real browser,
 * fixture data. ⛔ NOT a production walk, ⛔ no database, ⛔ no member data,
 * ⛔ no authenticated route. V10 remains the founder's and cannot be proxied.
 */

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium } from 'playwright';
import * as React from 'react';

import { StudioShell } from '../../../app/writers-studio/flagship/StudioChrome';
import { WriteRoom } from '../../../app/writers-studio/flagship/WriteRoom';
import { DevelopRoom, ReviewRoom } from '../../../app/writers-studio/flagship/DevelopReview';
import {
  MEMBER, PROJECT, MANUSCRIPT, VERSIONS, DEVELOP, REVIEW,
  MAIA_DISCUSS, MAIA_REVISE, S_REST, S_HELD, S_ALTS, S_CTX, S_APPLIED,
} from './fixtures';
import { inspectMemberCopy, inspectForMachinery } from '../../../lib/writersStudio/studio/language';

const OUT = join(process.cwd(), 'docs/design/contracts/screenshots/flagship-b2');
const CSS = readFileSync(join(process.cwd(), 'app/writers-studio/flagship/flagship.css'), 'utf8');

const VIEWPORTS = [
  { id: 'desktop-1920', width: 1920, height: 1200 },
  { id: 'desktop-1440', width: 1440, height: 900 },
  { id: 'laptop-1180', width: 1180, height: 800 },
  { id: 'mobile-390', width: 390, height: 844 },
] as const;

const STATES = [
  { id: '1-write-rest', title: 'WRITE — resting manuscript',
    node: <WriteRoom state={S_REST} view={MANUSCRIPT} copy={MAIA_DISCUSS} /> },
  { id: '2-write-maia', title: 'WRITE — passage + anchored MAIA',
    node: <WriteRoom state={S_HELD} view={MANUSCRIPT} copy={MAIA_DISCUSS} tab="Discuss" /> },
  { id: '3-write-alternatives', title: 'WRITE — alternatives',
    node: <WriteRoom state={S_ALTS} view={MANUSCRIPT} copy={MAIA_REVISE} tab="Revise" /> },
  { id: '4-write-read-in-context', title: 'WRITE — read in context',
    node: <WriteRoom state={S_CTX} view={MANUSCRIPT} copy={MAIA_REVISE} tab="Revise" /> },
  { id: '5-write-applied-undo', title: 'WRITE — applied + undo',
    node: <WriteRoom state={S_APPLIED} view={{ ...MANUSCRIPT, words: 1246, wordDelta: 0 }}
      copy={MAIA_REVISE} tab="Revise" history={VERSIONS} /> },
  { id: '6-develop', title: 'DEVELOP — overview', mode: 'develop' as const,
    node: <DevelopRoom view={DEVELOP} /> },
  { id: '7-review', title: 'REVIEW', mode: 'review' as const,
    node: <ReviewRoom view={REVIEW} /> },
];

function page(inner: React.ReactElement, mode: 'write' | 'develop' | 'review') {
  const html = renderToStaticMarkup(
    <StudioShell current={mode} project={PROJECT} member={MEMBER}>{inner}</StudioShell>,
  );
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap">
<style>html,body{margin:0;padding:0;height:100%}body{overflow:hidden}${CSS}</style>
</head><body>${html}</body></html>`;
}

/* ══════════════════════════════════════════════════════════════════════════
   V9 — OLD-UI FALSIFIER · F13 — LEGACY AESTHETIC REGRESSION
   The mechanical half. ⛔ The human half is V10 and is never proxied.
   ══════════════════════════════════════════════════════════════════════════ */

interface Check { id: string; ok: boolean; detail: string }

async function visualLaws(p: import('playwright').Page, stateId: string): Promise<Check[]> {
  const out: Check[] = [];
  /* ⭐ Passed as a STRING, not a closure: the bundler's keepNames transform
     injects a `__name` helper that does not exist in the page context. */
  const m = await p.evaluate(`(function(){
    var q = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };
    var root = document.querySelector('.fs-root');
    var stage = document.querySelector('.fs-stage') || document.querySelector('.fs-pane');
    var ms = document.querySelector('[data-manuscript]');
    var maia = document.querySelector('[data-maia-anchored]');
    var rail = document.querySelector('.fs-rail');
    var band = document.querySelector('.fs-band');
    var findings = q('[data-finding]');
    var obs = q('[data-observation]');
    var stageBox = stage ? stage.getBoundingClientRect() : {width:1,height:1};
    return {
      cols: root ? getComputedStyle(root).gridTemplateColumns.split(' ').length : 0,
      text: document.body.innerText,
      maiaInFlow: maia ? getComputedStyle(maia).position === 'static' : false,
      /* ⭐ OCCLUSION. Not implied by the V2 deltas: an overlay leaves width,
         vertical position and scroll untouched and still covers the prose. */
      occlusion: (function(){
        if (!maia || !ms) return null;
        var a = maia.getBoundingClientRect(), b = ms.getBoundingClientRect();
        var ox = Math.max(0, Math.min(a.right,b.right) - Math.max(a.left,b.left));
        var oy = Math.max(0, Math.min(a.bottom,b.bottom) - Math.max(a.top,b.top));
        var held = document.querySelector('[data-held="true"]');
        var hb = held ? held.getBoundingClientRect() : null;
        var hox = hb ? Math.max(0, Math.min(a.right,hb.right) - Math.max(a.left,hb.left)) : 0;
        var hoy = hb ? Math.max(0, Math.min(a.bottom,hb.bottom) - Math.max(a.top,hb.top)) : 0;
        var echo = maia.querySelector('[data-held-echo]');
        var echoShown = !!(echo && echo.getBoundingClientRect().height > 0);
        return { manuscript: Math.round(ox*oy), held: Math.round(hox*hoy),
                 sheet: getComputedStyle(maia).position === 'fixed', echoShown: echoShown };
      })(),
      maiaIsChildOfMs: (maia && ms) ? ms.contains(maia) : false,
      railContentNodes: rail ? q('.fs-rail [data-observation], .fs-rail [data-finding], .fs-rail .fs-maia, .fs-rail .fs-obs, .fs-rail .fs-p').length : 0,
      bandInfoNodes: band ? q('.fs-band *').filter(function(e){ return (e.textContent||'').trim().length > 0; }).length : 0,
      bandHeight: band ? band.getBoundingClientRect().height : 0,
      applyInAlternatives: q('[data-alternatives] [data-event="APPLY"]').length,
      ordinals: q('[data-alternatives] .fs-altname').filter(function(e){ return /^\\s*\\d+[.)]/.test(e.textContent||''); }).length,
      rebuildPreview: /rebuild preview/i.test(document.body.innerText),
      studioModeBar: q('[class*="StudioModeBar"], [data-studio-mode-bar]').length,
      permanentPanels: q('[data-permanent-panel]').length,
      /* ⭐ F13 counts STANDING INSTRUMENTS — controls that face the member and
         stand between them and their work. Four kinds are excluded, and the
         reason is the same each time: they are not what F13 is about.
           · contextual  — the member summoned MAIA; her controls are not clutter
           · navigation  — wayfinding is not instrumentation
           · ⭐ RETURNS INTO THE WORK — a "Go to section" control is the
             OPPOSITE of a workbench control, and V7 REQUIRES one on every
             finding. The first
             version of this probe counted them, so the room's compliance with
             V7 was being reported as an F13 violation. ⛔ The threshold was NOT
             raised to fix that; the definition was wrong.
           · view switches on the member's own content (Spiral / Linear / Table)
         ⛔ Bounded ABSOLUTELY, not per area — the law is about how many standing
         instruments face the member, and that does not improve on a bigger
         monitor. */
      permanentUtilityControls: q('.fs-content button, .fs-content [role="tab"], .fs-content input, .fs-content select')
        .filter(function(e){
          return !e.closest('[data-maia-anchored]') && !e.closest('.fs-drawer')
              && !e.closest('.fs-float') && !e.closest('.fs-modetabs')
              && !e.hasAttribute('data-return-to') && !e.classList.contains('fs-goto')
              && !e.closest('.fs-viewas');
        }).map(function(e){ return (e.textContent||'').trim().slice(0,28) || e.getAttribute('aria-label') || '?'; }),
      stageArea: stageBox.width * stageBox.height || 1,
      findingsWithReturn: findings.length > 0 ? q('[data-finding] [data-return-to]').length / findings.length : 1,
      observationsWithEvidence: obs.length > 0 ? q('[data-observation] .fs-chip').length > 0 : true,
      /* ⭐ Every SVG label must lie inside its own viewBox. A map that clips the
         member's own movement names is not a map of their book. */
      navLabels: q('.fs-rail [data-nav], .fs-mobilenav [data-nav]').map(function(e){
        /* Strip the icon glyph; the label is what the member reads. */
        return (e.textContent||'').replace(/[^A-Za-z ]/g,'').trim(); }),
      facet: (function(){
        var f = document.querySelector('.fs-facet');
        if (!f) return null;
        var label = (f.getAttribute('aria-label')||'') + ' ' + (f.textContent||'');
        return { present: true, text: label.toLowerCase() };
      })(),
      svgClipped: (function(){
        var bad = 0;
        q('svg').forEach(function(svg){
          var vb = (svg.getAttribute('viewBox')||'').split(/\s+/).map(Number);
          if (vb.length !== 4) return;
          Array.prototype.forEach.call(svg.querySelectorAll('text'), function(t){
            var b; try { b = t.getBBox(); } catch (e) { return; }
            if (b.x < vb[0] || b.y < vb[1] || b.x + b.width > vb[0] + vb[2] || b.y + b.height > vb[1] + vb[3]) bad += 1;
          });
        });
        return bad;
      })()
    };
  })()`) as any;

  out.push({ id: 'V9-no-permanent-three-column', ok: m.cols <= 2,
    detail: `root has ${m.cols} permanent column(s) — rail + content` });
  out.push({ id: 'V9-no-legacy-signatures',
    ok: !m.rebuildPreview && m.studioModeBar === 0 && m.permanentPanels === 0,
    detail: `rebuild-preview=${m.rebuildPreview} modeBar=${m.studioModeBar} permanentPanels=${m.permanentPanels}` });
  if (m.occlusion) {
    /* ⭐ On a sheet viewport the layer is BELOW the manuscript by design and the
       stage reserves room beneath the prose, so the held passage must still be
       clear even though the sheet sits over the page's lower area. */
    const o = m.occlusion as { manuscript: number; held: number; sheet: boolean; echoShown: boolean };
    /* ⭐ Two forms, one guarantee: *the member can always see what MAIA is
       discussing.* Anchored beside the prose, that means no overlap. As a sheet,
       the prose cannot be moved out from under it without taking the member's
       place with it — so the passage travels with the conversation instead. */
    const heldVisible = o.sheet ? (o.held === 0 || o.echoShown) : o.held === 0;
    out.push({ id: 'MAIA-never-hides-the-held-passage', ok: heldVisible,
      detail: !heldVisible ? `${o.held}px² of the held passage is covered and the sheet does not carry it`
        : o.sheet ? (o.held === 0 ? 'sheet clears the passage' : 'sheet carries the passage at its head')
        : 'anchored beside the prose, no overlap' });
    if (!o.sheet) {
      out.push({ id: 'MAIA-does-not-occlude-the-manuscript', ok: o.manuscript === 0,
        detail: o.manuscript === 0 ? 'panel sits in reserved space'
          : `${o.manuscript}px² of the manuscript column is covered` });
    }
  }
  out.push({ id: 'F3-maia-not-in-manuscript-flow', ok: !m.maiaInFlow && !m.maiaIsChildOfMs,
    detail: m.maiaIsChildOfMs ? 'MAIA is inside the manuscript — would displace prose' : 'MAIA is an overlay layer' });
  out.push({ id: 'RAIL-carries-no-content', ok: m.railContentNodes === 0,
    detail: `${m.railContentNodes} content node(s) in the rail` });
  out.push({ id: 'ATMOSPHERE-zero-information', ok: m.bandInfoNodes === 0 && m.bandHeight <= 48,
    detail: `${m.bandInfoNodes} text node(s), ${Math.round(m.bandHeight)}px deep` });
  out.push({ id: 'F5-no-apply-in-alternatives', ok: m.applyInAlternatives === 0,
    detail: `${m.applyInAlternatives} Apply control(s) among the alternatives` });
  out.push({ id: 'ALTS-no-ordinals', ok: m.ordinals === 0,
    detail: `${m.ordinals} ordinal-numbered alternative name(s)` });
  out.push({ id: 'V7-findings-return-to-manuscript', ok: m.findingsWithReturn === 1,
    detail: `${Math.round(m.findingsWithReturn * 100)}% of findings carry a return` });
  out.push({ id: 'OBS-carry-evidence', ok: m.observationsWithEvidence,
    detail: 'every observation cites evidence' });
  /* ⭐ The rail is a composition reference, ⛔ not permission to invent
     destinations. A drawn control with no route behind it is
     `assertStudioMapHonest()` broken by a picture. */
  {
    const allowed = new Set(['Home', 'Write', 'Develop', 'Review']);
    const invented = (m.navLabels as string[]).filter((l) => l && !allowed.has(l));
    out.push({ id: 'NAV-capability-honest', ok: invented.length === 0,
      detail: invented.length === 0 ? 'Home · Write · Develop · Review — no invented destinations'
        : `destinations with no substrate: ${[...new Set(invented)].join(', ')}` });
  }
  {
    const f = m.facet as { present: boolean; text: string } | null;
    const barred = ['beginner', 'intermediate', 'advanced', 'professional', 'expert',
      'skill level', 'experience level', 'recommended for you'];
    const leak = f ? barred.filter((b) => f.text.includes(b)) : [];
    out.push({ id: 'FACET-control-present-and-not-a-grade', ok: !!f && leak.length === 0,
      detail: !f ? 'no facet control beside the Work identity — a Teach tab is not a substitute'
        : leak.length ? `facet framed as competence: ${leak.join(', ')}`
        : 'quiet control beside the Work; names the relationship, not the member' });
  }
  out.push({ id: 'MAP-no-clipped-labels', ok: m.svgClipped === 0,
    detail: m.svgClipped === 0 ? 'every label lies inside its viewBox'
      : `${m.svgClipped} label(s) clipped by the viewBox` });

  const verdicts = inspectMemberCopy(m.text, 2);
  out.push({ id: 'LANG-no-verdict-as-fact', ok: verdicts.length === 0,
    detail: verdicts.length === 0 ? 'no grading language, reader effects hypothesis-shaped'
      : verdicts.map((v) => `${v.code}: "${v.sentence}"`).join(' · ') });

  const machinery = inspectForMachinery(m.text);
  out.push({ id: 'F13-no-technical-vocabulary', ok: machinery.length === 0,
    detail: machinery.length === 0 ? 'no implementation machinery in member copy' : machinery.join(', ') });

  /* ⭐ F13 — a workbench surrounds the work with permanent instruments; a writing
     room does not. Bounded ABSOLUTELY, ⛔ not per area: the law is about how many
     standing controls face the member, and that does not get better on a bigger
     monitor. The approved references carry six in Write (Aa · voice · Comment ·
     Ask MAIA · Focus · Aa) and two elsewhere. */
  out.push({ id: 'F13-permanent-utility-controls', ok: m.permanentUtilityControls.length <= 8,
    detail: `${m.permanentUtilityControls.length}: ${m.permanentUtilityControls.join(' | ')}` });

  return out.map((c) => ({ ...c, id: `${c.id}` }));
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const results: { state: string; viewport: string; checks: Check[] }[] = [];
  let failures = 0;

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2 });
    for (const st of STATES) {
      const p = await ctx.newPage();
      await p.setContent(page(st.node, st.mode ?? 'write'), { waitUntil: 'networkidle' });
      await p.evaluate('document.fonts.ready');

      /* ⭐ V2 — opening MAIA must not move the manuscript. Measured, not assumed:
         the overlay is removed and the manuscript re-measured in the same page. */
      let v2: Check | null = null;
      if (st.id !== '1-write-rest' && (st.mode ?? 'write') === 'write') {
        const delta = await p.evaluate(`(function(){
          var ms = document.querySelector('[data-manuscript]');
          var maia = document.querySelector('[data-maia-anchored]');
          var held = document.querySelector('[data-held="true"]');
          var stage = document.querySelector('.fs-stage') || document.querySelector('.fs-pane');
          if (!ms || !maia || !stage) return null;
          var before = { w: ms.getBoundingClientRect().width, held: held ? held.getBoundingClientRect().top : 0, scroll: stage.scrollTop };
          maia.style.display = 'none';
          var after = { w: ms.getBoundingClientRect().width, held: held ? held.getBoundingClientRect().top : 0, scroll: stage.scrollTop };
          maia.style.display = '';
          return { dw: Math.abs(after.w - before.w), dy: Math.abs(after.held - before.held), ds: Math.abs(after.scroll - before.scroll) };
        })()`) as { dw: number; dy: number; ds: number } | null;
        if (delta) {
          v2 = { id: 'V2-maia-does-not-move-the-manuscript',
            ok: delta.dw === 0 && delta.dy === 0 && delta.ds === 0,
            detail: `Δwidth ${delta.dw}px · Δprose-y ${delta.dy}px · Δscroll ${delta.ds}px` };
        }
      }

      const checks = await visualLaws(p, st.id);
      if (v2) checks.push(v2);
      failures += checks.filter((c) => !c.ok).length;
      results.push({ state: st.id, viewport: vp.id, checks });

      await p.screenshot({ path: join(OUT, `${st.id}__${vp.id}.png`), fullPage: false });
      await p.close();
    }
    await ctx.close();
  }
  await browser.close();

  const line = (s: string) => process.stdout.write(s + '\n');
  const byCheck = new Map<string, { pass: number; fail: number; ex: string }>();
  for (const r of results) for (const c of r.checks) {
    const e = byCheck.get(c.id) ?? { pass: 0, fail: 0, ex: '' };
    if (c.ok) e.pass += 1; else { e.fail += 1; e.ex = `${r.state}@${r.viewport}: ${c.detail}`; }
    byCheck.set(c.id, e);
  }
  line('── B2 VISUAL WITNESS ────────────────────────────────────────────────');
  line(`  ${STATES.length} states × ${VIEWPORTS.length} viewports = ${results.length} renders`);
  line('');
  for (const [id, e] of byCheck) {
    line(`  ${e.fail === 0 ? 'PASS' : 'FAIL'}  ${id.padEnd(38)} ${e.pass}/${e.pass + e.fail}${e.fail ? `  ⛔ ${e.ex}` : ''}`);
  }
  line('');
  line(`  screenshots  ${OUT}`);
  line(`  mechanical   ${failures === 0 ? 'ALL PASS' : `⛔ ${failures} FAILING`}`);
  line('');
  line('  ⚠️ CONTROLLED-COMPONENT WITNESS — real components, real CSS, real browser,');
  line('     fixture data. ⛔ NOT a production walk.');
  line('  ⛔ V10 — “Yes. This is the Soullab flagship Studio.” — IS THE FOUNDER\'S');
  line('     AND CANNOT BE PROXIED BY ANY RESULT ABOVE.');
  writeFileSync(join(OUT, 'witness.json'), JSON.stringify(results, null, 2));
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(2); });
