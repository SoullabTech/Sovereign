'use strict';

const SCHEMA = 'jarvis.grounded-response.v1';
const MAX_SUPPORTED = 8;
const MAX_UNSUPPORTED = 8;
const MAX_CLAIM_CHARS = 900;
const MAX_QUOTE_CHARS = 700;
const MIN_QUOTE_CHARS = 12;

function plain(value, max = MAX_CLAIM_CHARS) {
  const s = typeof value === 'string' ? value.trim() : '';
  return s && s.length <= max ? s : null;
}

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeEvidenceText(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function humanFieldLabel(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'Current field';
  if (/^WRITERS?-STUDIO$/i.test(raw)) return "Writer's Studio";
  return raw
    .replace(/[-_]+/g, ' ')
    .toLowerCase()
    .replace(/\b[a-z]/g, (m) => m.toUpperCase())
    .replace(/\bMaia\b/g, 'MAIA')
    .replace(/\bJarvis\b/g, 'JARVIS')
    .replace(/\bAi\b/g, 'AI');
}

function evidenceReferenceMap(fragments) {
  return (Array.isArray(fragments) ? fragments : []).map((f, i) => ({
    fragment: i + 1,
    source_file: f.source_file,
    source_sha: f.source_sha,
    start_line: f.start_line,
    end_line: f.end_line,
  }));
}

function workerInstruction(fragments) {
  const refs = evidenceReferenceMap(fragments)
    .map((r) => `fragment ${r.fragment}: ${r.source_file} lines ${r.start_line}-${r.end_line}`)
    .join('\n');
  return [
    'GROUNDED RESPONSE CONTRACT — RETURN JSON ONLY.',
    `schema must be "${SCHEMA}".`,
    'Do not emit markdown, prose outside JSON, file paths, or citations.',
    'A supported claim MUST point to materialized canonical evidence using the 1-based fragment number and a verbatim source excerpt. Do NOT choose a line number or file path; JARVIS will locate the quote deterministically inside that fragment and derive the final citation. Markdown markers or warning icons may be omitted, but source words may not be changed.',
    `The quote must contain at least ${MIN_QUOTE_CHARS} meaningful source characters. Punctuation-only or markdown-marker-only quotes are invalid.`,
    'Keep each supported claim atomic. If a sentence contains more than one factual component, attach evidence for each component or split it into separate claims.',
    'If a claim is not established by the canonical evidence, put it in unsupported_claims instead. Do not make up a citation.',
    "Partner orientation may help you understand Kelly's intent, but it is NOT canonical evidence and must never support a supported_claim.",
    'Prefer fewer strong claims over many weak ones.',
    '',
    'EVIDENCE REFERENCE MAP:',
    refs || '(no canonical fragments)',
    '',
    'JSON shape:',
    JSON.stringify({
      schema: SCHEMA,
      supported_claims: [
        {
          claim: 'plain-language factual claim',
          evidence: [{ fragment: 1, quote: 'verbatim source words copied from that fragment' }],
        },
      ],
      unsupported_claims: ['important thing Kelly asked about that the supplied evidence does not establish'],
    }, null, 2),
  ].join('\n');
}

function stripJsonFence(raw) {
  let text = String(raw || '').trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  return text;
}

function fragmentLine(fragment, line) {
  const n = Number(line);
  if (!Number.isInteger(n) || n < fragment.start_line || n > fragment.end_line) return null;
  const rows = String(fragment.content || '').split('\n');
  const idx = n - fragment.start_line;
  return rows[idx] === undefined ? null : rows[idx];
}

function sourceExcerpt(fragment, startLine, endLine) {
  const rows = String(fragment.content || '').split('\n');
  const start = Math.max(0, Number(startLine) - fragment.start_line);
  const end = Math.min(rows.length - 1, Number(endLine) - fragment.start_line);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start) return null;
  const raw = rows.slice(start, end + 1).join(' ');
  return normalizeWhitespace(raw
    .replace(/[⛔⭐⚠️☀]/g, '')
    .replace(/[*_`#]+/g, '')
    .replace(/^\s*(?:[-+]|\d+\.)\s*/, '')) || null;
}

function findQuoteRange(fragment, quote) {
  const normalizedQuote = normalizeEvidenceText(quote);
  const meaningfulChars = (normalizedQuote.match(/[a-z0-9]/g) || []).length;
  const quoteTokens = normalizedQuote.split(' ').filter(Boolean);
  if (normalizedQuote.length < MIN_QUOTE_CHARS || meaningfulChars < 8 || quoteTokens.length < 3) {
    return { ok: false, reason: 'quote_too_weak' };
  }

  const flat = [];
  const rows = String(fragment.content || '').split('\n');
  rows.forEach((row, idx) => {
    const line = fragment.start_line + idx;
    for (const token of normalizeEvidenceText(row).split(' ').filter(Boolean)) flat.push({ token, line });
  });

  const hits = [];
  for (let i = 0; i <= flat.length - quoteTokens.length; i++) {
    let same = true;
    for (let j = 0; j < quoteTokens.length; j++) {
      if (flat[i + j].token !== quoteTokens[j]) { same = false; break; }
    }
    if (same) {
      hits.push({
        start_line: flat[i].line,
        end_line: flat[i + quoteTokens.length - 1].line,
      });
    }
  }
  const unique = [...new Map(hits.map((h) => [`${h.start_line}:${h.end_line}`, h])).values()];
  if (!unique.length) return { ok: false, reason: 'quote_not_in_fragment' };
  if (unique.length > 1) return { ok: false, reason: 'quote_ambiguous_in_fragment' };
  return { ok: true, ...unique[0] };
}

function validateEvidenceRef(ref, fragments) {
  const fragmentNumber = Number(ref?.fragment);
  const quote = plain(ref?.quote, MAX_QUOTE_CHARS);
  if (!Number.isInteger(fragmentNumber) || fragmentNumber < 1 || fragmentNumber > fragments.length) {
    return { ok: false, reason: 'fragment_out_of_range' };
  }
  if (!quote) return { ok: false, reason: 'quote_missing_or_too_long' };
  const fragment = fragments[fragmentNumber - 1];
  const located = findQuoteRange(fragment, quote);
  if (!located.ok) return located;
  const citation = located.start_line === located.end_line
    ? `${fragment.source_file}:${located.start_line}`
    : `${fragment.source_file}:${located.start_line}-${located.end_line}`;
  return {
    ok: true,
    fragment: fragmentNumber,
    start_line: located.start_line,
    end_line: located.end_line,
    quote,
    source_excerpt: sourceExcerpt(fragment, located.start_line, located.end_line),
    source_file: fragment.source_file,
    source_sha: fragment.source_sha,
    citation,
  };
}

function compileGroundedResponse(raw, fragments) {
  const offered = Array.isArray(fragments) ? fragments : [];
  let parsed;
  try {
    parsed = JSON.parse(stripJsonFence(raw));
  } catch {
    return {
      status: 'STRUCTURE_REFUSED',
      supported: [],
      unsupported: [{ claim: 'JARVIS could not produce a citation-safe structured answer for this turn.', reason: 'json_parse_failed' }],
      rejected: [],
      raw: String(raw || ''),
    };
  }

  if (!parsed || typeof parsed !== 'object' || parsed.schema !== SCHEMA) {
    return {
      status: 'STRUCTURE_REFUSED',
      supported: [],
      unsupported: [{ claim: 'JARVIS returned an answer outside the grounded-response contract.', reason: 'schema_mismatch' }],
      rejected: [],
      raw : String(raw || ''),
    };
  }

  const supported = [];
  const unsupported = [];
  const rejected = [];

  for (const row of (Array.isArray(parsed.supported_claims) ? parsed.supported_claims : []).slice(0, MAX_SUPPORTED)) {
    const claim = plain(row?.claim);
    const refs = Array.isArray(row?.evidence) ? row.evidence.slice(0, 4) : [];
    if (!claim || refs.length === 0) {
      const fallback = claim || 'A model claim was witheld because it did not satisfy the evidence contract.';
      unsupported.push({ claim: fallback, reason: !claim ? 'claim_invalid' : 'evidence_missing' });
      rejected.push({ claim: fallback, reason: !claim ? 'claim_invalid' : 'evidence_missing' });
      continue;
    }
    const checked = refs.map((ref) => validateEvidenceRef(ref, offered));
    const invalid = checked.find((r) => !r.ok);
    if (invalid) {
      unsupported.push({ claim, reason: invalid.reason });
      rejected.push({ claim, reason: invalid.reason });
      continue;
    }
    const validRefs = checked.filter((r) => r.ok);
    supported.push({
      claim,
      evidence: validRefs,
      citations: [...new Set(validRefs.map((r) => r.citation))],
    });
  }

  for (const value of (Array.isArray(parsed.unsupported_claims) ? parsed.unsupported_claims : []).slice(0, MAX_UNSUPPORTED)) {
    const claim = plain(value);
    if (claim && !unsupported.some((u) => u.claim === claim)) unsupported.push({ claim, reason: 'model_marked_unsupported' });
  }

  return {
    status: 'COMPILED',
    supported,
    unsupported: unsupported.slice(0, MAX_UNSUPPORTED),
    rejected,
    raw: String(raw || ''),
  };
}

function renderGroundedResponse(compiled, {
  fieldLabel = null,
  canonicalSha = null,
  fragmentCount = 0,
  partnerSources = [],
} = {}) {
  const label = humanFieldLabel(fieldLabel);
  const partners = [...new Set((Array.isArray(partnerSources) ? partnerSources : []).map((x) =>
    x === 'claude-code' ? 'Claude Code' : x === 'chatgpt' ? 'ChatGPT' : x === 'maia' ? 'MAIA' : String(x)
  ))];

  const lines = [
    `Turn context: ${label}`,
    `Canonical evidence: ${fragmentCount} fragment${fragmentCount === 1 ? '' : 's'}${canonicalSha ? ` @${String(canonicalSha).slice(0, 10)}` : ''}`,
  ];
  if (partners.length) lines.push(`Partner context: ${partners.join(' + ')} (orientation only)`);
  lines.push('', 'What the evidence establishes:');

  if (compiled.supported.length) {
    const shown = new Set();
    for (const row of compiled.supported) {
      for (const ref of row.evidence) {
        const excerpt = ref.source_excerpt || ref.quote;
        const key = `${excerpt}::${ref.citation}`;
        if (shown.has(key)) continue;
        shown.add(key);
        lines.push(`• ${excerpt}`);
        lines.push(`  ${ref.citation}`);
      }
    }
  } else {
    lines.push('• Nothing citation-safe was established by this turn.');
  }

  lines.push('', 'What I cannot establish from this evidence:');
  if (compiled.unsupported.length) {
    for (const row of compiled.unsupported) lines.push(`• ${row.claim}`);
  } else {
    lines.push('• No additional unsupported claim was returned.');
  }

  return lines.join('\n');
}

module.exports = {
  SCHEMA, MAX_SUPPORTED, MAX_UNSUPPORTED, MAX_CLAIM_CHARS, MAX_QUOTE_CHARS, MIN_QUOTE_CHARS,
  normalizeWhitespace, normalizeEvidenceText, humanFieldLabel, evidenceReferenceMap, workerInstruction,
  stripJsonFence, fragmentLine, findQuoteRange, validateEvidenceRef, compileGroundedResponse, renderGroundedResponse,
};
