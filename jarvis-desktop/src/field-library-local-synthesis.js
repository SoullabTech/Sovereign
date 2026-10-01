'use strict';

(function(root, factory) {
  const api = factory(
    typeof module !== 'undefined' && module.exports
      ? require('./field-library-synthesis-contract.js')
      : root.GrokkerSynthesisContract
  );
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GrokkerLocalSynthesis = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(Contract) {
  const MAX_SOURCES = 8;

  function programmeSources(packet) {
    return (packet?.sources || []).filter(s =>
      s.source_type === 'PROGRAMME_RECORD' &&
      s.path &&
      Number.isInteger(s.excerpt_start_line) &&
      Number.isInteger(s.excerpt_end_line)
    ).slice(0, MAX_SOURCES);
  }

  function buildC1Task(packet) {
    const check = Contract.validateSourcePacket(packet);
    if (!check.ok) return { ok: false, errors: check.errors, task: null };

    const sources = programmeSources(packet);
    if (sources.length < 2) {
      return { ok: false, errors: ['NEED_AT_LEAST_TWO_PROGRAMME_SOURCES'], task: null };
    }
    const prompt = [
      'GROKKER ORIENTATION SYNTHESIS — CANDIDATE ONLY.',
      'Use ONLY the supplied source fragments.',
      'Do not treat co-occurrence, retrieval rank, lexical similarity, repetition, or fluency as a relation warrant.',
      'Preserve disagreement and unresolvedness.',
      'Call something a contradiction only when two cited statements cannot both be true in the same scope and time.',
      'Silence, omission, different scope, or different level of detail is NOT a contradiction.',
      'Separate: (1) convergences actually visible in the sources, (2) tensions/contradictions, (3) candidate cross-source patterns, (4) unanswered questions.',
      'Every factual statement about a source must carry a literal inline path:LINE citation.',
      'Use the exact token docs/.../file.ext:NN. Never write file.ext (NN), line NN, or a filename without :NN.',
      'If you cannot cite a statement in that exact form, omit the statement.',
      'Never say a candidate pattern is established, proved, confirmed, or ratified.',
      'Founder question: ' + packet.query,
    ].join('\n');

    const context_selectors = sources.map(s => ({
      ref: s.path,
      selector: { type: 'lines', start: s.excerpt_start_line, end: s.excerpt_end_line },
      why: 'Grokker source packet for: ' + packet.query,
    }));

    return {
      ok: true,
      errors: [],
      task: {
        bounded_for_local: true,
        input_chars: prompt.length,
        prompt,
        context_selectors,
      },
      offered_source_ids: sources.map(s => s.source_id),
    };
  }
  function citedPaths(text) {
    const hits = new Set();
    const re = /(?:^|[\s(])((?:docs|scripts|lib|app|components)\/[A-Za-z0-9_./-]+\.[A-Za-z0-9]+):\d+\b/g;
    let m;
    while ((m = re.exec(String(text || '')))) hits.add(m[1]);
    return [...hits];
  }

  function verifiedEvidencePaths(response) {
    const citations = response?.verification?.evidence?.citations || [];
    const paths = [];
    for (const c of citations) {
      if (!c?.in_context || !c.fragment) continue;
      const m = String(c.fragment).match(/^(.*):\d+-\d+$/);
      if (m && !paths.includes(m[1])) paths.push(m[1]);
    }
    return paths;
  }

  function wrapC1Result(packet, response) {
    const text = String(response?.result?.response || '');
    const verifiedPaths = verifiedEvidencePaths(response);
    const paths = verifiedPaths.length ? verifiedPaths : citedPaths(text);
    const byPath = new Map((packet?.sources || []).filter(s => s.path).map(s => [s.path, s.source_id]));
    const relied = paths.map(p => byPath.get(p)).filter(Boolean);

    const proposal = Contract.makeCandidateProposal(packet, text, relied, {
      unresolved: true,
      acknowledged_conflicts: (packet?.sources || [])
        .filter(s => (s.flags || []).includes('CONTESTED') && relied.includes(s.source_id))
        .map(s => s.source_id),
    });
    const proposalCheck = Contract.validateProposal(packet, proposal);
    const evidence = response?.verification || null;
    const localExecutionVerified = !!evidence?.pass;
    const citationCorrectness = evidence?.correctness || 'UNVERIFIED';

    return {
      ok: response?.status === 'completed' && localExecutionVerified && proposalCheck.ok,
      standing: Contract.SYNTHESIS_STANDING,
      proposal,
      proposal_check: proposalCheck,
      local_execution_verified: localExecutionVerified,
      citation_containment: citationCorrectness,
      semantic_review: 'UNREVIEWED',
      cited_paths: paths,
      model: response?.result?.model || null,
      raw_response: text,
    };
  }

  return { MAX_SOURCES, programmeSources, buildC1Task, citedPaths, verifiedEvidencePaths, wrapC1Result };
});