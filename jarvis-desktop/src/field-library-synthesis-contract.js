'use strict';

(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GrokkerSynthesisContract = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  const SOURCE_STANDING = 'RETRIEVED_SOURCE';
  const SYNTHESIS_STANDING = 'CANDIDATE_UNESTABLISHED';

  function sourceId(item, index) {
    return item?.path ? `source:${item.path}` : `field:${index}:${item?.title || 'untitled'}`;
  }

  function buildSourcePacket(query, traceRows) {
    const sources = (traceRows || []).map((row, index) => ({
      source_id: sourceId(row.item, index),
      source_type: row.kind === 'record' ? 'PROGRAMME_RECORD' : 'CURATED_FIELD',
      title: String(row.item?.title || ''),
      path: row.item?.path || null,
      excerpt: row.item?.excerpt || null,
      headings: Array.isArray(row.item?.headings) ? [...row.item.headings] : [],
      retrieval_matches: Array.isArray(row.matched) ? [...row.matched] : [],
      retrieval_score: Number(row.score || 0),
      standing: SOURCE_STANDING,
      relation_warrant: null,
      jurisdiction: row.kind === 'record' ? 'PROGRAMME_CORPUS' : 'CURATED_ORIENTATION',
      flags: Array.isArray(row.item?.flags) ? [...row.item.flags] : [],
    }));

    return {
      packet_type: 'GROKKER_SOURCE_PACKET_V1',
      query: String(query || ''),
      sources,
      packet_law: 'RETRIEVAL_DOES_NOT_CREATE_RELATION_STANDING',
    };
  }
  function validateSourcePacket(packet) {
    const errors = [];
    if (!packet || packet.packet_type !== 'GROKKER_SOURCE_PACKET_V1') errors.push('BAD_PACKET_TYPE');
    if (!packet?.query?.trim()) errors.push('MISSING_QUERY');
    if (!Array.isArray(packet?.sources) || !packet.sources.length) errors.push('NO_SOURCES');

    const ids = new Set();
    for (const source of packet?.sources || []) {
      if (!source.source_id) errors.push('SOURCE_ID_MISSING');
      if (ids.has(source.source_id)) errors.push('DUPLICATE_SOURCE_ID');
      ids.add(source.source_id);
      if (!source.title) errors.push('SOURCE_TITLE_MISSING');
      if (source.source_type === 'PROGRAMME_RECORD' && !source.path) errors.push('PROGRAMME_PATH_MISSING');
      if (source.standing !== SOURCE_STANDING) errors.push('SOURCE_STANDING_UPGRADED');
      if (source.relation_warrant !== null) errors.push('RETRIEVAL_WARRANT_INVENTED');
    }

    return { ok: errors.length === 0, errors };
  }

  function makeCandidateProposal(packet, proposition, sourceIds, options = {}) {
    return {
      proposal_type: 'GROKKER_SYNTHESIS_PROPOSAL_V1',
      proposition: String(proposition || ''),
      authorship: 'GROKKER_AUTHORED',
      standing: SYNTHESIS_STANDING,
      jurisdiction: 'KELLYS_WORLD_ORIENTATION',
      relied_on_source_ids: [...(sourceIds || [])],
      relation_warrant: options.relation_warrant || null,
      acknowledged_conflicts: [...(options.acknowledged_conflicts || [])],
      unresolved: options.unresolved !== false,
      source_packet_query: packet?.query || '',
    };
  }
  function validateProposal(packet, proposal) {
    const errors = [];
    const packetCheck = validateSourcePacket(packet);
    if (!packetCheck.ok) errors.push(...packetCheck.errors.map(e => `PACKET_${e}`));

    if (!proposal || proposal.proposal_type !== 'GROKKER_SYNTHESIS_PROPOSAL_V1') errors.push('BAD_PROPOSAL_TYPE');
    if (!proposal?.proposition?.trim()) errors.push('EMPTY_PROPOSITION');
    if (proposal?.authorship !== 'GROKKER_AUTHORED') errors.push('AUTHORSHIP_LAUNDERED');
    if (proposal?.standing !== SYNTHESIS_STANDING) errors.push('SILENT_PROMOTION');

    const validIds = new Set((packet?.sources || []).map(s => s.source_id));
    const relied = new Set(proposal?.relied_on_source_ids || []);
    if (!relied.size) errors.push('NO_RELIED_SOURCES');
    for (const id of relied) if (!validIds.has(id)) errors.push('UNKNOWN_SOURCE_REFERENCE');

    const contested = (packet?.sources || [])
      .filter(s => (s.flags || []).includes('CONTESTED') && relied.has(s.source_id))
      .map(s => s.source_id);
    const acknowledged = new Set(proposal?.acknowledged_conflicts || []);
    for (const id of contested) if (!acknowledged.has(id)) errors.push('CONTESTED_SOURCE_ERASED');

    if (proposal?.relation_warrant && !proposal.relation_warrant.warrant_type) errors.push('MALFORMED_WARRANT');
    if (!proposal?.relation_warrant && proposal?.unresolved === false) errors.push('UNWARRANTED_CLOSURE');

    return { ok: errors.length === 0, errors };
  }

  return {
    SOURCE_STANDING,
    SYNTHESIS_STANDING,
    buildSourcePacket,
    validateSourcePacket,
    makeCandidateProposal,
    validateProposal,
  };
});
