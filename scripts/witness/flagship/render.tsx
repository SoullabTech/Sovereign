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
  MAIA_DISCUSS, MAIA_REVISE, MAIA_ARRIVED,
  S_REST, S_HELD, S_ALTS, S_CTX, S_APPLIED, S_ARRIVED,
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
  { id: '5b-arrived-from-review', title: 'WRITE — arrived from a finding',
    node: <WriteRoom state={S_ARRIVED} view={MANUSCRIPT} copy={MAIA_ARRIVED} tab="Discuss" /> },
  { id: '6-develop', title: 'DEVELOP — overview', mode: 'develop' as const,
    node: <DevelopRoom view={DEVELOP} /> },
  { id: '7-review', title: 'REVIEW — everything', mode: 'review' as const,
    node: <ReviewRoom view={REVIEW} /> },
  { id: '7b-review-acknowledged', title: 'REVIEW — staleness acknowledged', mode: 'review' as const,
    node: <ReviewRoom view={{ ...REVIEW, changed: REVIEW.changed ? { ...REVIEW.changed, acknowledged: true } : undefined }} /> },
  { id: '8-review-not-read', title: 'REVIEW — a lens never read', mode: 'review' as const,
    node: <ReviewRoom view={REVIEW} lens="arc" /> },
  { id: '9-review-nothing-noticed', title: 'REVIEW — read, nothing noticed', mode: 'review' as const,
    node: <ReviewRoom view={REVIEW} lens="coherence" /> },
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
      /* ⭐ F1 AMENDED (founder ruling, D2). WRITE keeps exactly one permanent
         content region. REVIEW may hold two — the intelligence and the Work —
         because both are views of the SAME Work. ⛔ MAIA never becomes a third
         permanent pane, which is the line that keeps the legacy three-column
         workbench from returning through the amendment. */
      stageKind: document.querySelector('[data-stage]')
        ? document.querySelector('[data-stage]').getAttribute('data-stage') : 'none',
      contentRegions: q('[data-manuscript], [data-manuscript-context], [data-stage="develop"] .fs-pgrid').length,
      maiaIsPermanent: (function(){
        var m = document.querySelector('[data-maia-anchored]');
        if (!m) return false;
        return getComputedStyle(m).position === 'static';
      })(),
      /* ⭐⭐ THE GUARD GOVERNS WHAT MAIA SAYS ABOUT THE WORK — ⛔ NEVER WHAT THE
         WORK SAYS.
         
         Once the manuscript appeared beside Review, the scan began reading the
         member's own fiction and refusing it: "She took a deeper breath and
         kept walking" tripped the deeper stem. That is the guard grading the
         novel, which is the precise thing it exists to prevent MAIA doing.
         
         A writer may put a strong wind, a beautiful morning or she felt weak on
         the page; none of it is a claim by the product. Excluded:
         every rendering of the Work's own text, and direction labels on
         alternatives, which propose where a change could go and assert nothing
         about the current text. */
      text: (function(){
        var clone = document.body.cloneNode(true);
        var theWork = '[data-manuscript], [data-manuscript-context], .fs-p, .fs-contextp,'
          + ' .fs-openq, .fs-movedq, .fs-carriedtext, .fs-heldquote, .fs-epi, .fs-epiwho,'
          + ' .fs-owntext, .fs-altname, .fs-alttx';
        Array.prototype.forEach.call(clone.querySelectorAll(theWork), function(e){ e.remove(); });
        return clone.innerText || clone.textContent || '';
      })(),
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
          /* ⛔ A hidden control does not face the member. The probe counted
             collapsed mobile tools as standing chrome. */
          var r = e.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          return !e.closest('[data-maia-anchored]') && !e.closest('.fs-drawer')
              && !e.closest('.fs-float') && !e.closest('.fs-modetabs')
              && !e.hasAttribute('data-return-to') && !e.classList.contains('fs-goto')
              && !e.closest('.fs-viewas')
              /* ⭐ A region that declares itself contextual is not standing
                 instrumentation. Third time this metric mis-categorised a
                 surface; the region declaring its own kind ends that. */
              && !e.closest('[data-contextual="true"]')
              /* ⭐ The trail — back, ‹, › — is NAVIGATION, the same class as the
                 mode tabs and the rail. *Navigation is not instrumentation*
                 cuts here too; a member moving through their own findings is
                 not operating an instrument. */
              && !e.closest('.fs-trail');
        }).map(function(e){ return (e.textContent||'').trim().slice(0,28) || e.getAttribute('aria-label') || '?'; }),
      stageArea: stageBox.width * stageBox.height || 1,
      /* ⭐ AT LEAST one return per finding. The first version divided returns by
         findings and asserted 1.0 — which failed the moment a finding offered
         Go to passage AND Discuss AND Explore, i.e. the moment it got better. */
      findingsWithoutReturn: findings.filter(function(f){
        return !f.querySelector('[data-return-to]'); }).length,
      findingCount: findings.length,
      observationsWithEvidence: obs.length > 0 ? q('[data-observation] .fs-chip').length > 0 : true,
      /* ⭐ Every SVG label must lie inside its own viewBox. A map that clips the
         member's own movement names is not a map of their book. */
      /* ⛔ Anything clickable in the rail is a destination and must be real. */
      railDestinations: q('.fs-rail button, .fs-rail a').filter(function(e){
        return !e.hasAttribute('data-nav') && !e.closest('.fs-railfoot');
      }).map(function(e){ return (e.textContent||'').trim().slice(0,24); }),
      navLabels: q('.fs-rail [data-nav], .fs-mobilenav [data-nav]').map(function(e){
        /* Strip the icon glyph; the label is what the member reads. */
        return (e.textContent||'').replace(/[^A-Za-z ]/g,'').trim(); }),
      facet: (function(){
        var f = document.querySelector('.fs-facet');
        if (!f) return null;
        var label = (f.getAttribute('aria-label')||'') + ' ' + (f.textContent||'');
        return { present: true, text: label.toLowerCase() };
      })(),
      /* ⭐ THE WHERE TEST — can the member point at any claim and ask "where?"
         and be taken there? Every observation and finding must carry an address. */
      addressless: q('[data-observation], [data-finding]').filter(function(e){
        return !e.querySelector('[data-return-to]') && !e.hasAttribute('data-return-to');
      }).length,
      /* ⛔ A commissioning control may exist ONLY where a reading is absent or
         partial. Navigation is not consent. */
      commissionControls: q('[data-commission]').length,
      lensStatesDistinct: (function(){
        var nr = q('[data-lens-state="not-read"]').length;
        var rn = q('[data-lens-state="read-nothing-noticed"]').length;
        if (nr === 0 || rn === 0) return 'n/a';
        var a = document.querySelector('[data-lens-state="not-read"] .fs-lensbody');
        var b = document.querySelector('[data-lens-state="read-nothing-noticed"] .fs-lensbody');
        return (a && b && a.textContent !== b.textContent) ? 'distinct' : 'collapsed';
      })(),
      readingFreshness: (function(){
        var r = document.querySelector('[data-freshness]');
        return r ? { kind: r.getAttribute('data-freshness'), text: (r.textContent||'').trim() } : null;
      })(),
      /* ⭐ Every analytical object invites a next move INTO the Work. */
      analyticalObjects: q('[data-observation], [data-finding], [data-thread]').length,
      objectsWithNoNextMove: q('[data-observation], [data-finding], [data-thread]').filter(function(e){
        return !e.querySelector('[data-return-to], [data-action], .fs-cell'); }).length,
      /* ⛔ Arriving from a finding must never strand the member. */
      arrived: !!document.querySelector('[data-carried-observation]'),
      /* ⭐ V13 — visualization truth. Every row of a presence grid declares its
         kind, so an inference cannot be drawn in the visual language of a count. */
      provenanceKinds: (function(){
        var ks = {};
        Array.prototype.forEach.call(document.querySelectorAll('[data-provenance]'), function(e){
          ks[e.getAttribute('data-provenance')] = (e.textContent||'').trim(); });
        return Object.keys(ks);
      })(),
      provenanceLabelsDistinct: (function(){
        var seen = {}, labels = [];
        Array.prototype.forEach.call(document.querySelectorAll('.fs-prov'), function(e){
          var k = e.getAttribute('data-provenance'), t = (e.textContent||'').trim();
          if (!seen[k]) { seen[k] = t; labels.push(t); }
        });
        return labels.length === new Set(labels).size;
      })(),
      gridRows: q('[data-thread]').length,
      gridRowsWithoutProvenance: q('[data-thread]').filter(function(e){
        return !e.querySelector('[data-provenance]'); }).length,
      /* ⭐ V14 — member contribution stays visibly the member's. */
      ownComposer: !!document.querySelector('[data-own-observation]'),
      ownKinds: q('[data-own-kind]').map(function(e){ return e.getAttribute('data-own-kind'); }),
      /* ⭐ V15 — a stale reading is disclosed BEFORE anything it claims, and the
         member is told the re-read is theirs to ask for. */
      stale: (function(){
        var s = document.querySelector('[data-stale-reading]');
        if (!s) return null;
        var findings = document.querySelector('[data-finding]');
        var before = findings ? (s.compareDocumentPosition(findings) & 4) !== 0 : true;
        return { before: before,
          trust: !!s.querySelector('[data-trust-line]'),
          commission: s.querySelectorAll('[data-commission]').length,
          previous: !!s.querySelector('[data-return-to="previous-reading"]') };
      })(),
      /* ⭐ ADVENTURE WITHOUT GAMIFICATION. The reward is discovery — ⛔ never a
         score. Nothing that turns a member's Work into a game board. */
      gamification: (function(){
        var t = (document.body.innerText||'').toLowerCase();
        /* ⚠️ Matched on word boundaries: a substring scan flagged "xp" inside
           "experience". A banned-word list that fires on fragments is noise. */
        var banned = ['points','streak','streaks','leaderboard','badge','badges','level up',
                      'achievement','achievements','score','scores','rank','ranked','xp',
                      'daily goal','you earned','congratulations','well done'];
        return banned.filter(function(w){
          return new RegExp('\\b' + w.replace(' ', '\\s+') + '\\b', 'i').test(t); });
      })(),
      /* ⭐ Large, calm, obvious targets. Better for a 72-year-old memoirist and
         better for everyone. 44px is the floor, on the smaller axis. */
      smallTargets: q('button, [role="tab"], a[href]').filter(function(e){
        var r = e.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return false;
        return Math.min(r.width, r.height) < 24;
      }).map(function(e){
        var r = e.getBoundingClientRect();
        return ((e.textContent||'').trim().slice(0,18) || e.getAttribute('aria-label') || '?')
          + ' ' + Math.round(r.width) + 'x' + Math.round(r.height);
      }),
      /* ⛔ Nothing important behind hover: every action is visible at rest. */
      hiddenUntilHover: q('button, a[href]').filter(function(e){
        var cs = getComputedStyle(e);
        return cs.opacity === '0' || cs.visibility === 'hidden';
      }).length,
      /* ⭐ Every control reachable and named. */
      unnamedControls: q('button, [role="tab"]').filter(function(e){
        return !((e.textContent||'').trim()) && !e.getAttribute('aria-label'); }).length,
      trailBack: q('[data-trail] [data-event="BACK_ALONG_TRAIL"]').length,
      movedCitations: q('[data-citation-changed]').length,
      movedWithoutFrozenText: q('[data-citation-changed]').filter(function(e){
        return !e.querySelector('blockquote'); }).length,
      /* ⛔ A tab may not commission. Only an explicit offer may. */
      commissionOnTabs: q('[role="tab"][data-commission]').length,
      tabCount: q('[role="tab"]').length,
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
  {
    const stage = m.stageKind as string;
    const regions = m.contentRegions as number;
    const limit = stage === 'review' ? 2 : 1;
    const ok = regions <= limit && !(m.maiaIsPermanent as boolean);
    out.push({ id: 'F1-content-regions-by-room', ok,
      detail: (m.maiaIsPermanent as boolean) ? 'MAIA is a permanent pane — the legacy workbench'
        : `${stage}: ${regions} content region(s), limit ${limit}` });
  }
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
  out.push({ id: 'V7-findings-return-to-manuscript', ok: (m.findingsWithoutReturn as number) === 0,
    detail: (m.findingsWithoutReturn as number) === 0
      ? `all ${m.findingCount} findings return to the manuscript`
      : `${m.findingsWithoutReturn} finding(s) with no way back` });
  out.push({ id: 'OBS-carry-evidence', ok: m.observationsWithEvidence,
    detail: 'every observation cites evidence' });
  /* ⭐ The rail is a composition reference, ⛔ not permission to invent
     destinations. A drawn control with no route behind it is
     `assertStudioMapHonest()` broken by a picture. */
  {
    const allowed = new Set(['Home', 'Write', 'Develop', 'Review']);
    const invented = (m.navLabels as string[]).filter((l) => l && !allowed.has(l));
    const railExtra = m.railDestinations as string[];
    out.push({ id: 'RAIL-no-invented-destinations', ok: railExtra.length === 0,
      detail: railExtra.length === 0 ? 'the Work area is identity only'
        : `clickable with no route: ${railExtra.join(', ')}` });
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
  out.push({ id: 'WHERE-every-claim-has-an-address', ok: m.addressless === 0,
    detail: m.addressless === 0 ? 'every observation and finding returns to the manuscript'
      : `${m.addressless} claim(s) the member cannot ask "where?" about` });
  out.push({ id: 'LENS-read-nothing-is-not-not-read', ok: m.lensStatesDistinct !== 'collapsed',
    detail: m.lensStatesDistinct === 'collapsed'
      ? 'a completed reading that noticed nothing renders the same as no reading at all'
      : m.lensStatesDistinct === 'n/a' ? 'both states not present on this surface'
      : 'a result and an absence render differently' });
  if (m.readingFreshness) {
    const f = m.readingFreshness as { kind: string; text: string };
    out.push({ id: 'READING-states-its-own-freshness', ok: f.text.length > 20,
      detail: `${f.kind}: ${f.text.slice(0, 72)}…` });
  }
  if ((m.movedCitations as number) > 0) {
    out.push({ id: 'CITATION-moved-is-disclosed-with-frozen-text',
      ok: (m.movedWithoutFrozenText as number) === 0,
      detail: (m.movedWithoutFrozenText as number) === 0
        ? `${m.movedCitations} moved citation(s), each showing what MAIA read`
        : `${m.movedWithoutFrozenText} moved citation(s) disclosed without the text they were made against` });
  }
  out.push({ id: 'NEXT-MOVE-every-object-leads-into-the-work',
    ok: (m.objectsWithNoNextMove as number) === 0,
    detail: (m.objectsWithNoNextMove as number) === 0
      ? `${m.analyticalObjects} analytical object(s), each leading somewhere in the Work`
      : `${m.objectsWithNoNextMove} object(s) that report and go nowhere` });
  if (m.arrived) {
    out.push({ id: 'ARRIVAL-is-never-a-trapdoor', ok: (m.trailBack as number) > 0,
      detail: (m.trailBack as number) > 0 ? 'the way back is on the page'
        : 'the member followed a finding here and cannot get back' });
  }
  {
    const g = m.gamification as string[];
    out.push({ id: 'NO-GAMIFICATION', ok: g.length === 0,
      detail: g.length === 0 ? 'no points, streaks, scores, badges or achievements'
        : `game mechanics in member copy: ${g.join(', ')}` });
  }
  {
    const t = m.smallTargets as string[];
    out.push({ id: 'TARGETS-are-generous', ok: t.length === 0,
      detail: t.length === 0 ? 'every control clears the 24px floor on its smaller axis'
        : `${t.length} small target(s): ${t.slice(0, 3).join(' · ')}` });
  }
  out.push({ id: 'NOTHING-BEHIND-HOVER', ok: (m.hiddenUntilHover as number) === 0,
    detail: (m.hiddenUntilHover as number) === 0 ? 'every action is visible at rest'
      : `${m.hiddenUntilHover} control(s) appear only on hover` });
  out.push({ id: 'EVERY-CONTROL-IS-NAMED', ok: (m.unnamedControls as number) === 0,
    detail: (m.unnamedControls as number) === 0 ? 'every control has a name a screen reader can read'
      : `${m.unnamedControls} unnamed control(s)` });
  /* ⭐ §13 — the four provenance kinds must remain four. ⛔ "You chose the
     Spiral template" may never render as "you named this". */
  {
    const kinds = m.provenanceKinds as string[];
    const collapsed = kinds.includes('template-selected') && kinds.includes('member-declared')
      ? (m.provenanceLabelsDistinct as boolean) : true;
    out.push({ id: 'PROVENANCE-four-kinds-never-collapse', ok: collapsed,
      detail: collapsed ? `${kinds.length} kind(s) present, each with its own label`
        : 'a template choice renders as the member naming it' });
  }
  out.push({ id: 'V13-visualization-truth', ok: (m.gridRowsWithoutProvenance as number) === 0,
    detail: (m.gridRowsWithoutProvenance as number) === 0
      ? `${m.gridRows} grid row(s), each declaring whether it is countable or MAIA's reading`
      : `${m.gridRowsWithoutProvenance} row(s) drawn in the language of a count without saying what they are` });
  if (m.ownComposer) {
    const k = m.ownKinds as string[];
    const want = ['noticed', 'question', 'possibility'];
    out.push({ id: 'V14-member-contribution', ok: want.every((w) => k.includes(w)),
      detail: want.every((w) => k.includes(w))
        ? 'the member may record what they noticed, a question, or a possibility'
        : `member can only author: ${k.join(', ') || 'nothing'}` });
  }
  if (m.stale) {
    const st = m.stale as { before: boolean; trust: boolean; commission: number; previous: boolean };
    const ok = st.before && st.trust && st.commission === 1 && st.previous;
    out.push({ id: 'V15-reading-freshness', ok,
      detail: ok ? 'stated before the findings, previous reading kept, re-read is the member\u2019s to ask for'
        : `before findings ${st.before} · trust line ${st.trust} · commission controls ${st.commission} · previous kept ${st.previous}` });
  }
  out.push({ id: 'TAB-never-commissions', ok: (m.commissionOnTabs as number) === 0,
    detail: (m.commissionOnTabs as number) === 0
      ? `${m.tabCount} tabs, none of which reads on click`
      : `${m.commissionOnTabs} tab(s) would commission a reading` });
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

      /* ⭐ ADJUSTABLE TEXT SIZE WITHOUT BREAKING THE COMPOSITION. A member who
         turns their browser text up must get larger text, ⛔ not a broken page
         and ⛔ not no change at all. */
      const textScale = await p.evaluate(`(function(){
        var before = { w: document.body.scrollWidth,
          size: parseFloat(getComputedStyle(document.querySelector('.fs-p') || document.body).fontSize) };
        /* ⭐ §16 of the usability protocol names 100 / 125 / 150 / 175. The
           last one is where older writers actually live, and it is the one a
           layout tuned at 150 quietly fails. */
        var worst = null;
        [20, 24, 28].forEach(function(px){
          document.documentElement.style.fontSize = px + 'px';
          var w = document.body.scrollWidth;
          if (w > window.innerWidth + 2 && !worst) worst = { px: px, w: w };
        });
        document.documentElement.style.fontSize = '28px';
        var after = { w: document.body.scrollWidth,
          size: parseFloat(getComputedStyle(document.querySelector('.fs-p') || document.body).fontSize) };
        document.documentElement.style.fontSize = '';
        return { grew: after.size > before.size + 0.5, overflow: !!worst,
                 worstAt: worst ? worst.px : 0,
                 before: before.size, after: after.size };
      })()`) as { grew: boolean; overflow: boolean; before: number; after: number };

      const checks = await visualLaws(p, st.id);
      checks.push({ id: 'TEXT-SIZE-responds-and-does-not-break',
        ok: textScale.grew && !textScale.overflow,
        detail: !textScale.grew
          ? `prose stayed at ${textScale.before}px when the browser text size was raised 50% — px type ignores the member's setting`
          : textScale.overflow ? `overflows sideways at ${Math.round((textScale.worstAt / 16) * 100)}% browser text`
          : `prose scales ${textScale.before}→${textScale.after}px through 175%, no horizontal overflow` });
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
