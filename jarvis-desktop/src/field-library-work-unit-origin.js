'use strict';

(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GrokkerWorkUnitOrigin = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  const PREFIX = 'Produce a deliberative Grokker candidate synthesis for: ';

  function selectorRef(entry) {
    const ref = String(entry?.ref || '');
    const selector = entry?.selector || {};
    if (!ref || selector.type !== 'lines') return null;
    const start = Number(selector.start);
    const end = Number(selector.end);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) return null;
    return ref + ':' + start + '-' + end;
  }

  function project(workUnit) {
    const objective = String(workUnit?.identity?.objective || '');
    if (workUnit?.identity?.task_shape !== 'EVIDENCE_SYNTHESIS') return null;
    if (!objective.startsWith(PREFIX)) return null;
    const query = objective.slice(PREFIX.length).trim();
    if (!query) return null;
    const sourceRanges = (workUnit?.scope?.evidence_selectors || [])
      .map(selectorRef).filter(Boolean);
    return {
      origin_type: 'GROKKER_FIELD_LIBRARY',
      query,
      source_ranges: sourceRanges,
      projection_law: 'CANONICAL_WORK_UNIT_FACTS_ARE_THE_RETURN_ADDRESS',
    };
  }

  return { PREFIX, selectorRef, project };
});
