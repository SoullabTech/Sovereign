'use strict';
/**
 * JARVIS O-1 — Observer renderer.
 *
 * Renders Readings. It never computes a fact, never fills a gap, and never
 * substitutes a previous value for a current one. If a Reading is UNAVAILABLE
 * or UNKNOWN, that is what appears — smoothing it would defeat the surface.
 */

const MARK = { OBSERVED: '●', DERIVED: '◈', INFERRED: '▲', UNAVAILABLE: '✕', UNKNOWN: '?' };
const el = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function ago(iso) {
  if (!iso) return 'never';
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.round(s / 60) + 'm ago';
  return (s / 3600).toFixed(1) + 'h ago';
}

/** A Reading carries a displayable value only when OBSERVED, DERIVED, or INFERRED. */
const shows = (r) => r && (r.klass === 'OBSERVED' || r.klass === 'DERIVED' || r.klass === 'INFERRED');

function row(label, reading, fmt) {
  const k = (reading && reading.klass) || 'UNKNOWN';
  const mark = MARK[k] || '?';
  let body;
  let why = '';

  if (shows(reading)) {
    body = fmt ? fmt(reading.value) : esc(String(reading.value));
  } else {
    body = k;
    if (reading && reading.error) why = esc(reading.error);
    if (reading && reading.last_known) {
      // Explicitly non-authoritative, and labelled as such at the point of display.
      why += (why ? ' — ' : '') + 'last known ' + ago(reading.last_known.observed_at) + ', NOT current';
    }
  }

  return '<div class="row ' + k + '"><span class="m">' + mark + '</span>'
       + '<span class="k">' + esc(label) + '</span><span class="v">' + body + '</span></div>'
       + (why ? '<div class="why">' + why + '</div>' : '');
}

function render(view) {
  const f = view.families;
  el('composed').textContent = 'composed ' + view.composed_at;

  el('claims').innerHTML =
      row('active / limit', f.claims.claims, (v) => esc(v.active + ' / ' + v.limit)
          + ' <span class="sub">(' + esc(String(v.limit_source)) + ')</span>')
    + row('queued', f.claims.claims, (v) => esc(String(v.queued)))
    + row('collisions', f.claims.claims, (v) => esc(String(v.collisions.length)))
    + row('stale / recoverable', f.claims.claims, (v) => esc(String(v.recoverable.length)))
    + (shows(f.claims.claims)
        ? f.claims.claims.value.sessions.map((s) =>
            '<div class="why">· ' + esc(s.work_unit || '(no unit)') + ' — ' + esc(s.owner || '')
            + ' ' + esc(s.branch || '') + (s.age_s != null ? ' ' + Math.round(s.age_s / 60) + 'm' : '') + '</div>').join('')
        : '');

  el('rate').innerHTML =
      row('band', f.claims.rate, (v) => esc(v.overall_band) + ' <span class="sub">' + esc(v.units) + '</span>')
    + row('pressure', f.claims.rate_pressure, (v) => (v.elevated ? 'ELEVATED' : 'normal'))
    + row('ungoverned lanes', f.claims.ungoverned_lanes,
        (v) => esc(String(v.ungoverned)) + ' of ' + esc(String(v.observed_sessions)) + ' observed');

  el('runtime').innerHTML =
      row('runtime', f.runtime.health, () => 'reachable')
    + row('runs', f.runtime.runs, (v) => esc(String(v.length)))
    + row('gates', f.governance.gates, (v) => esc(String(v.length)))
    + row('waiting for founder', f.governance.waiting_for_founder, (v) => esc(String(v.length)));

  el('git').innerHTML =
      row('branch', f.git.branch)
    + row('HEAD', f.git.head, (v) => esc(v.slice(0, 9)))
    + row('uncommitted paths', f.git.dirty)
    + row('trunk (remote)', f.git.trunk_remote, (v) => esc(v.slice(0, 9)))
    + row('on remote', f.git.branch_on_remote,
        (v) => (v.present ? (v.in_sync ? 'yes, in sync' : 'diverged') : 'NO — local only'))
    + row('behind trunk', f.git.trunk_delta, (v) => esc(String(v.behind_trunk)) + ' commits')
    + row('pull request', f.github.pr,
        (v) => (v ? '#' + esc(String(v.number)) + ' ' + esc(v.state) + ' ' + esc(String(v.merge_state)) : 'none for this branch'));

  el('production').innerHTML =
      row('GIT_COMMIT', f.production.sha,
        (v) => (v.sha ? esc(v.sha) : 'unknown — provenance BYPASSED'))
    + row('reachable', f.production.reach, () => 'container responded')
    + row('vs trunk', f.production.vs_trunk,
        (v) => esc(v.production.slice(0, 9)) + ' vs ' + esc(v.trunk.slice(0, 9)));

  el('attention').innerHTML = view.attention.length
    ? view.attention.map((a) =>
        '<div class="row ' + a.klass + '"><span class="m">' + (MARK[a.klass] || '?') + '</span>'
        + '<span class="v">' + esc(a.text) + '</span></div>'
        + (a.detail ? '<div class="why">' + esc(a.detail) + '</div>' : '')).join('')
    : '<div class="why">nothing requires you</div>';

  el('freshness').innerHTML = Object.entries(view.freshness).map(([fam, fr]) =>
    '<div class="fresh"><span class="k">' + esc(fam) + '</span>'
    + '<span class="' + esc(fr.state) + '">' + esc(fr.state) + '</span>'
    + '<span class="sub">' + ago(fr.observed_at) + '</span></div>').join('');
}

async function refresh() {
  el('refresh').disabled = true;
  el('composed').textContent = 'observing…';
  try {
    const res = await window.observer.read({});
    if (res.ok) render(res.view);
    else el('attention').innerHTML = '<div class="row UNAVAILABLE"><span class="m">✕</span>'
      + '<span class="v">Observer could not complete a reading: ' + esc(res.error) + '</span></div>';
  } finally {
    el('refresh').disabled = false;
  }
}

el('refresh').addEventListener('click', refresh);
refresh();
// Periodic re-read. Freshness is still rendered per family — this does not make
// anything current that a source failed to supply.
setInterval(refresh, 30000);
