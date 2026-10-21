'use strict';

(function(root, factory) {
  const api = factory(
    typeof module !== 'undefined' && module.exports
      ? require('./field-library-pins.js')
      : root.GrokkerFieldPins
  );
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GrokkerOrientation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(Pins) {
  function pinRow(pin) {
    return {
      kind: pin.kind,
      key: pin.key,
      label: pin.label,
      resolved: pin.resolved === true,
      why: pin.resolved
        ? 'Kept in sight by Kelly.'
        : 'Pinned reference is not currently resolved.',
    };
  }

  function workRow(item, groupLabel) {
    return {
      work_unit_id: item.work_unit_id,
      label: item.grokker_origin?.query || item.objective,
      lifecycle: item.lifecycle,
      group: groupLabel,
      why: item.reason,
      grokker_origin: item.grokker_origin || null,
    };
  }

  function recoveryRow(item) {
    return {
      programme_key: item.programme_key,
      label: item.title,
      standing: item.standing,
      signal: item.signal,
      evidence: item.evidence,
      path: item.path,
      evidence_line: item.evidence_line,
      why: 'Explicit unfinished evidence in an older programme lineage.',
    };
  }

  function recentRow(item) {
    return {
      label: item.title,
      path: item.path || null,
      why: 'Recently touched programme record. Recency does not imply importance.',
    };
  }

  function compose({ library, pins, governedWork } = {}) {
    const resolvedPins = Pins.resolve(pins || [], library || {}, governedWork || null);
    const needsKelly = governedWork?.needs_kelly || [];
    const inMotion = governedWork?.in_motion || [];
    const watching = governedWork?.watching || [];
    const recovery = library?.recoveryCandidates || [];
    const recent = (library?.recentItems || []).slice(0, 12);

    const sections = [
      {
        id:'keep_in_sight',
        label:'Keep in sight',
        meaning:'Items Kelly explicitly chose to hold nearby.',
        items:resolvedPins.map(pinRow),
      },
      {
        id:'needs_kelly',
        label:'Needs Kelly',
        meaning:'Canonical governed work currently awaiting an explicit human adjudication gesture.',
        items:needsKelly.map(item => workRow(item,'Needs Kelly')),
      },
      {
        id:'in_motion',
        label:'In motion',
        meaning:'Open canonical Work Units without a current adjudication hold or observed failure/challenge.',
        items:inMotion.map(item => workRow(item,'In motion')),
      },
      {
        id:'watching',
        label:'Watching',
        meaning:'Canonical work carrying unreadable custody, failure, challenge, or route blocker evidence.',
        items:watching.map(item => workRow(item,'Watching')),
      },
      {
        id:'unfinished',
        label:'Unfinished threads',
        meaning:'Older programme lineages with structural unfinished evidence. Candidate status only.',
        items:recovery.map(recoveryRow),
      },
      {
        id:'recent',
        label:'Recently touched',
        meaning:'Recent Git activity for re-entry only. Recency does not imply priority.',
        items:recent.map(recentRow),
      },
    ];

    return {
      orientation_type:'KELLYS_WORLD_ORIENTATION_V1',
      law:'ORIENTATION_DOES_NOT_CREATE_PRIORITY_OR_AUTHORITY',
      sections,
      counts:Object.fromEntries(sections.map(section => [section.id, section.items.length])),
      total_visible:sections.reduce((sum, section) => sum + section.items.length, 0),
    };
  }

  return { compose, pinRow, workRow, recoveryRow, recentRow };
});
