'use strict';

(function(root, factory) {
  const api = factory(
    typeof module !== 'undefined' && module.exports
      ? require('./canonical-work-unit-v2.js')
      : root.CanonicalWorkUnitV2
  );
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GrokkerDeliberativeWorkUnit = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(CWUV2) {
  function programmeSources(packet, limit = 8) {
    return (packet?.sources || []).filter(s =>
      s.source_type === 'PROGRAMME_RECORD' &&
      s.path && Number.isInteger(s.excerpt_start_line) && Number.isInteger(s.excerpt_end_line)
    ).slice(0, limit);
  }

  function evidenceFocusForPacket(packet) {
    return programmeSources(packet).map(s =>
      s.path + ':' + s.excerpt_start_line + '-' + s.excerpt_end_line
    ).join('\n');
  }

  function specForPacket(packet) {
    return {
      objective: 'Produce a deliberative Grokker candidate synthesis for: ' + String(packet?.query || ''),
      workClass: 'RESEARCH',
      taskShape: 'EVIDENCE_SYNTHESIS',
      capability: '',
      evidenceClass: 'E1_REPOSITORY_LOCAL',
      requestedPosture: 'local_only',
      reviewPressure: 'high_value_uncertain',
      evidenceFocus: evidenceFocusForPacket(packet),      acceptanceCriteria: [
        'Return candidate synthesis only.',
        'Preserve source provenance and epistemic standing.',
        'Do not convert retrieval or co-occurrence into relation standing.',
        'Preserve disagreement and unresolvedness.',
      ].join('\n'),
      falsificationConditions: [
        'Any authorized evidence expands beyond the source packet.',
        'Any source line range is lost.',
        'Any candidate becomes warranted without separate review.',
      ].join('\n'),
      stopConditions: 'Stop before write, merge, deploy, production, or authority expansion.',
      authorityRequest: { networkExternal:false, providerSpend:false, externalDisclosure:'none' },
    };
  }

  function precisionLoss(packet, canonicalInput) {
    const sources = programmeSources(packet);
    const allowed = canonicalInput?.scope?.allowed_paths || [];
    const losses = [];
    for (const source of sources) {
      const expected = source.path + ':' + source.excerpt_start_line + '-' + source.excerpt_end_line;
      if (allowed.includes(source.path) && !allowed.includes(expected)) {
        losses.push({ source_id:source.source_id, expected, actual:source.path, reason:'LINE_RANGE_STRIPPED' });
      } else if (!allowed.includes(expected)) {
        losses.push({ source_id:source.source_id, expected, actual:null, reason:'SOURCE_SCOPE_NOT_PRESERVED' });
      }
    }
    return losses;
  }
  function preview(packet, canonicalSha, workUnitId='v2-grokker-deliberative-preview') {
    const spec = specForPacket(packet);
    const built = CWUV2.canonicalInputFromSpec(spec, { canonicalSha, workUnitId });
    if (!built.ok) return { ok:false, status:'WORK_UNIT_SPEC_REFUSED', blockers:built.blockers, spec };
    const losses = precisionLoss(packet, built.input);
    if (losses.length) {
      return {
        ok:false,
        status:'WORK_UNIT_EVIDENCE_PRECISION_LOSS',
        reason:'Canonical W0.v2 scope widens Grokker line-range evidence to whole-file paths.',
        losses,
        spec,
        canonical_input:built.input,
      };
    }
    return { ok:true, status:'WORK_UNIT_PRECISION_PRESERVED', spec, canonical_input:built.input };
  }

  return { programmeSources, evidenceFocusForPacket, specForPacket, precisionLoss, preview };
});