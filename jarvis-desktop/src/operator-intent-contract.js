// JARVIS Orchestration & Operator — O1 Intent Contract.
// Pure, deterministic, DOM-free. Converts explicit operator language into a
// governed intent record. It never grants authority, routes work, or executes.
'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisOperatorIntentContract = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const VERSION = 'o1.intent.v1';

  const LEVEL = Object.freeze({
    UNDERSTAND: 'UNDERSTAND',
    PREPARE: 'PREPARE',
    CHANGE: 'CHANGE',
    RELEASE: 'RELEASE',
  });

  const STANDING = Object.freeze({
    CLEAR: 'CLEAR',
    AMBIGUOUS: 'AMBIGUOUS',
    INVALID: 'INVALID',
  });

  const CONTINUATION_WORDS = /^(?:continue|proceed|keep going|next\b|take this as far as you safely can\b)/i;
  const COURTESY = /^(?:(?:please|kindly)\s+|(?:can|could|would|will) you\s+|i (?:want|need) you to\s+)/i;

  const LEVEL_PATTERNS = Object.freeze([
    [LEVEL.RELEASE, /^(?:ship|release|deploy|publish|merge)\b/i],
    [LEVEL.CHANGE, /^(?:fix|repair|change|edit|update|implement|build|add|remove|refactor|make)\b/i],
    [LEVEL.PREPARE, /^(?:plan|prepare|design|draft|propose|figure out how|work out how|map out)\b/i],
    [LEVEL.UNDERSTAND, /^(?:find out|investigate|review|inspect|diagnose|explain|analy[sz]e|check|tell me|what\b|why\b|how\b)/i],
  ]);

  const AUTHORITY_PATTERNS = Object.freeze([
    ['network.external', /\b(?:external network|internet|online access)\b/i],
    ['repo.disclose:external', /\b(?:external disclosure|send (?:the )?repo|share (?:the )?repository)\b/i],
    ['provider.spend', /\b(?:paid provider|provider spend|spend money|metered provider)\b/i],
    ['pr.create', /\b(?:open|create) (?:a )?(?:pull request|pr)\b/i],
    ['merge', /\bmerge\b/i],
    ['deploy', /\bdeploy(?:ment)?\b/i],
    ['production.write', /\b(?:production mutation|write (?:to )?production|change production)\b/i],
    ['constraint.waive', /\b(?:ignore|waive|bypass) (?:the )?(?:rule|guard|constraint|gate)\b/i],
  ]);

  const NEGATED_RELEASE = /\b(?:do not|don't|never|without)\s+(?:ship|release|deploy|publish|merge)\b/i;
  const CHAINED_RELEASE = /\b(?:and|then|and then)\s+(?:ship|release|deploy|publish|merge)\b/i;

  const FIXED_CONSTRAINTS = Object.freeze([
    'This intent record grants no authority.',
    'O0 remains the authority boundary for consequential acts.',
    'Routing, execution, integration, deployment, and production are outside O1.',
  ]);

  function normalizeUtterance(value) {
    return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  }

  function operativeText(value) {
    return normalizeUtterance(value).replace(COURTESY, '').trim();
  }

  function explicitLeadingLevel(text) {
    const operative = operativeText(text);
    for (const [level, pattern] of LEVEL_PATTERNS) {
      if (pattern.test(operative)) return level;
    }
    return null;
  }

  function isContinuation(text) {
    return CONTINUATION_WORDS.test(operativeText(text));
  }

  function hasChainedRelease(text) {
    return !NEGATED_RELEASE.test(text) && CHAINED_RELEASE.test(text);
  }

  function authorityMentions(text) {
    const mentions = [];
    for (const [authority, pattern] of AUTHORITY_PATTERNS) {
      if (pattern.test(text) && !mentions.includes(authority)) mentions.push(authority);
    }
    return mentions;
  }

  function emptyAuthority(text) {
    return Object.freeze({
      grants: Object.freeze([]),
      inferred: false,
      mentions: Object.freeze(authorityMentions(text)),
    });
  }

  function invalidRecord(raw, reason) {
    return {
      version: VERSION,
      standing: STANDING.INVALID,
      raw_utterance: raw,
      objective: null,
      requested_level: null,
      level_signals: [],
      continuation: { requested: false, inherited: false },
      authority: emptyAuthority(raw),
      constraints: [...FIXED_CONSTRAINTS],
      ambiguities: [reason],
    };
  }

  function ambiguousRecord(raw, reason, continuationRequested = false) {
    return {
      version: VERSION,
      standing: STANDING.AMBIGUOUS,
      raw_utterance: raw,
      objective: raw || null,
      requested_level: null,
      level_signals: [],
      continuation: { requested: continuationRequested, inherited: false },
      authority: emptyAuthority(raw),
      constraints: [...FIXED_CONSTRAINTS],
      ambiguities: [reason],
    };
  }

  function compileIntent({ utterance, priorIntent = null } = {}) {
    const raw = normalizeUtterance(utterance);
    if (!raw) return invalidRecord(raw, 'Operator intent is empty.');

    const continuationRequested = isContinuation(raw);
    if (continuationRequested) {
      const priorClear = priorIntent
        && priorIntent.standing === STANDING.CLEAR
        && Object.values(LEVEL).includes(priorIntent.requested_level)
        && typeof priorIntent.objective === 'string'
        && priorIntent.objective.trim();

      if (!priorClear) {
        return ambiguousRecord(
          raw,
          'Continuation requires a prior clear governed intent; O1 will not invent one.',
          true,
        );
      }

      const releaseRequested = hasChainedRelease(raw);
      const requestedLevel = releaseRequested ? LEVEL.RELEASE : priorIntent.requested_level;
      const signals = [...new Set([
        priorIntent.requested_level,
        ...(releaseRequested ? [LEVEL.RELEASE] : []),
      ])];

      return {
        version: VERSION,
        standing: STANDING.CLEAR,
        raw_utterance: raw,
        objective: priorIntent.objective,
        requested_level: requestedLevel,
        level_signals: signals,
        continuation: {
          requested: true,
          inherited: true,
          prior_level: priorIntent.requested_level,
        },
        authority: emptyAuthority(raw),
        constraints: [...FIXED_CONSTRAINTS],
        ambiguities: [],
      };
    }

    const leadingLevel = explicitLeadingLevel(raw);
    if (!leadingLevel) {
      return ambiguousRecord(
        raw,
        'No explicit O1 operator level is established by the utterance.',
        false,
      );
    }

    const releaseRequested = leadingLevel === LEVEL.RELEASE || hasChainedRelease(raw);
    const requestedLevel = releaseRequested ? LEVEL.RELEASE : leadingLevel;
    const signals = [...new Set([
      leadingLevel,
      ...(releaseRequested && leadingLevel !== LEVEL.RELEASE ? [LEVEL.RELEASE] : []),
    ])];

    return {
      version: VERSION,
      standing: STANDING.CLEAR,
      raw_utterance: raw,
      objective: raw,
      requested_level: requestedLevel,
      level_signals: signals,
      continuation: { requested: false, inherited: false },
      authority: emptyAuthority(raw),
      constraints: [...FIXED_CONSTRAINTS],
      ambiguities: [],
    };
  }

  return {
    VERSION,
    LEVEL,
    STANDING,
    FIXED_CONSTRAINTS,
    normalizeUtterance,
    operativeText,
    explicitLeadingLevel,
    isContinuation,
    hasChainedRelease,
    authorityMentions,
    compileIntent,
  };
});
