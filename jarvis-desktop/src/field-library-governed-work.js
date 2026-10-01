'use strict';

(function(root, factory) {
  const api = factory(
    typeof module !== 'undefined' && module.exports
      ? require('./field-library-work-unit-origin.js')
      : root.GrokkerWorkUnitOrigin
  );
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GrokkerGovernedWork = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(Origin) {
  function classification(item) {
    if (!item?.readable || !item?.snapshot?.ok) {
      return { group:'watching', reason:'Work Unit could not be read from canonical custody.' };
    }
    const snapshot = item.snapshot;
    const state = snapshot.lifecycle?.state || 'UNKNOWN';
    if (state === 'CLOSED') {
      return { group:'historical', reason:'Closed canonical Work Unit.' };
    }
    if ((snapshot.next_actions || []).some(a => a.action === 'canonical-adjudicate')) {
      return { group:'needs_kelly', reason:'Evidence is ready for explicit human adjudication.' };
    }
    const failed = (snapshot.provenance?.attempts || []).some(a => a.status === 'failed');
    const challenged = (snapshot.provenance?.verifier_results || []).some(v =>
      ['challenges','disagrees','insufficient'].includes(v.disposition));
    const routeBlocked = (snapshot.routing?.blockers || []).length > 0
      || snapshot.routing?.execution_disposition === 'refused';
    if (failed || challenged || routeBlocked) {
      return { group:'watching', reason: failed
        ? 'A durable execution attempt failed.'
        : challenged
          ? 'Verifier evidence contains challenge, disagreement, or insufficiency.'
          : 'Canonical routing reports a blocker or refusal.' };
    }
    return { group:'in_motion', reason:'Canonical Work Unit remains open without a current adjudication hold.' };
  }

  function row(item) {
    const cls = classification(item);
    const snapshot = item?.snapshot || {};
    const wu = snapshot.work_unit || {};
    return {
      work_unit_id: item?.work_unit_id || '',
      observed_mtime_ms: item?.observed_mtime_ms || 0,
      readable: item?.readable === true,
      group: cls.group,
      reason: cls.reason,
      lifecycle: snapshot.lifecycle?.state || 'UNREADABLE',
      objective: wu.identity?.objective || item?.work_unit_id || 'Unreadable Work Unit',
      task_shape: wu.identity?.task_shape || null,
      next_actions: (snapshot.next_actions || []).map(a => ({...a})),
      grokker_origin: Origin?.project ? Origin.project(wu) : null,
    };
  }

  function project(listResponse) {
    const items = (listResponse?.items || []).map(row);
    return {
      population: listResponse?.population || { total:0, returned:0, truncated:false, unreadable:0 },
      needs_kelly: items.filter(i => i.group === 'needs_kelly'),
      in_motion: items.filter(i => i.group === 'in_motion'),
      watching: items.filter(i => i.group === 'watching'),
      historical: items.filter(i => i.group === 'historical'),
    };
  }

  return { classification, row, project };
});
