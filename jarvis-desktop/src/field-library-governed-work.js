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
      return { group:'watching', reason:'This work record could not be read and needs checking.' };
    }
    const snapshot = item.snapshot;
    const state = snapshot.lifecycle?.state || 'UNKNOWN';
    if (state === 'CLOSED') {
      return { group:'historical', reason:'This work is closed and kept for history.' };
    }
    if ((snapshot.next_actions || []).some(a => a.action === 'canonical-adjudicate')) {
      return { group:'needs_kelly', reason:'The evidence is ready for your review and decision.' };
    }
    const failed = (snapshot.provenance?.attempts || []).some(a => a.status === 'failed');
    const challenged = (snapshot.provenance?.verifier_results || []).some(v =>
      ['challenges','disagrees','insufficient'].includes(v.disposition));
    const routeBlocked = (snapshot.routing?.blockers || []).length > 0
      || snapshot.routing?.execution_disposition === 'refused';
    if (failed || challenged || routeBlocked) {
      return { group:'watching', reason: failed
        ? 'One attempt failed and this work needs watching.'
        : challenged
          ? 'A review challenged the result or found the evidence insufficient.'
          : 'This work is blocked before it can continue.' };
    }
    return { group:'in_motion', reason:'This work is still open and moving.' };
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
