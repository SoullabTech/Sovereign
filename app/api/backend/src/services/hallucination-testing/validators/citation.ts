import { normalizeText } from './schema';

const CITATION_CACHE = new Map<string, any>();
const CACHE_TTL = 86400000;

export async function validateCitation(
  parsed: any,
  expected: any,
  context: any
): Promise<{
  authorCorrect: boolean;
  sourceCorrect: boolean;
  hasUnsupportedSpecifics: boolean;
  admitsUncertainty: boolean;
  externalVerified: boolean;
  score: number;
  details?: string;
}> {
  const authorCorrect = checkAuthorMatch(parsed.author, expected.author);
  const sourceCorrect = checkSourceMatch(parsed.source, expected.source);

  const hasPageNumbers = /page \d+|p\.\s*\d+|pp\.\s*\d+/i.test(JSON.stringify(parsed));
  const hasSpecificYear = parsed.year && !expected.year;
  const hasUnsupportedSpecifics = context.trap ? (hasPageNumbers || hasSpecificYear) : false;

  const uncertaintyWords = ['attributed', 'possibly', 'likely', 'uncertain', 'unclear', 'may', 'might', 'probably'];
  const responseText = JSON.stringify(parsed).toLowerCase();
  const admitsUncertainty = uncertaintyWords.some(word => responseText.includes(word));

  let externalVerified = false;
  let details = '';

  if (process.env.ALLOW_EXTERNAL_CITATION_VALIDATION === '1' && !context.trap) {
    try {
      const verification = await verifyCitationExternal(
        parsed.author,
        parsed.source || parsed.source_title,
        parsed.source_ref
      );
      externalVerified = verification.exists && verification.matches;
      details = verification.detail;
    } catch (error) {
      details = 'External verification error';
    }
  }

  let score = 0;
  if (authorCorrect) score += 0.4;
  if (sourceCorrect) score += 0.3;
  if (externalVerified) score += 0.2;

  if (context.trap) {
    if (!hasUnsupportedSpecifics) score += 0.05;
    if (admitsUncertainty) score += 0.05;
  } else {
    if (!hasUnsupportedSpecifics) score += 0.1;
  }

  return {
    authorCorrect,
    sourceCorrect,
    hasUnsupportedSpecifics,
    admitsUncertainty,
    externalVerified,
    score: Math.min(1, score),
    details
  };
}

function checkAuthorMatch(actual: any, expected: any): boolean {
  if (!actual || !expected) return false;
  const actualNorm = normalizeText(actual);
  const expectedNorm = Array.isArray(expected)
    ? expected.map(normalizeText)
    : [normalizeText(expected)];
  return expectedNorm.some(exp => actualNorm.includes(exp) || exp.includes(actualNorm));
}

function checkSourceMatch(actual: any, expected: any): boolean {
  if (!actual || !expected) return false;
  const actualNorm = normalizeText(actual);
  const expectedNorm = normalizeText(expected);
  return actualNorm.includes(expectedNorm) || expectedNorm.includes(actualNorm);
}

async function fetchJson(url: string): Promise<any> {
  const cached = CITATION_CACHE.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await fetch(url, {
    headers: { 'user-agent': 'maia-hallucination-test-suite/1.0' }
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  CITATION_CACHE.set(url, { data, timestamp: Date.now() });
  return data;
}

function fuzzyMatch(a?: string, b?: string): number {
  if (!a || !b) return 0;
  const aNorm = normalizeText(a);
  const bNorm = normalizeText(b);
  const aWords = new Set(aNorm.split(/\s+/));
  const bWords = new Set(bNorm.split(/\s+/));
  const intersection = [...aWords].filter(word => bWords.has(word)).length;
  return intersection / Math.max(1, aWords.size + bWords.size - intersection);
}

export async function verifyCitationExternal(
  author?: string,
  title?: string,
  ref?: string
): Promise<{ exists: boolean; matches: boolean; detail: string }> {
  if (process.env.ALLOW_EXTERNAL_CITATION_VALIDATION !== '1') {
    return {
      exists: !!(author && (title || ref)),
      matches: true,
      detail: 'External validation disabled (set ALLOW_EXTERNAL_CITATION_VALIDATION=1 to enable)'
    };
  }

  let exists = false;
  let matches = false;
  let detail = '';

  try {
    if (title) {
      const crossrefUrl = `https://api.crossref.org/works?query.title=${encodeURIComponent(title)}&rows=3`;
      const crossrefData = await fetchJson(crossrefUrl);
      const item = crossrefData?.message?.items?.[0];

      if (item) {
        const authorNames = (item.author || [])
          .map((a: any) => `${a.given || ''} ${a.family || ''}`.trim())
          .join(' ');
        const titleScore = fuzzyMatch(title, item.title?.[0]);
        const authorScore = fuzzyMatch(author, authorNames);
        const score = Math.max(titleScore, authorScore);

        if (score > 0.5) {
          exists = true;
          matches = true;
          detail = `Crossref match (score: ${score.toFixed(2)})`;
          return { exists, matches, detail };
        }
      }
    }

    if (!exists && title) {
      const openAlexUrl = `https://api.openalex.org/works?search=${encodeURIComponent(title)}&per_page=3`;
      const openAlexData = await fetchJson(openAlexUrl);
      const item = openAlexData?.results?.[0];

      if (item) {
        const authorName = item.authorships?.[0]?.author?.display_name || '';
        const titleScore = fuzzyMatch(title, item.title);
        const authorScore = fuzzyMatch(author, authorName);
        const score = Math.max(titleScore, authorScore);

        if (score > 0.5) {
          exists = true;
          matches = true;
          detail = `OpenAlex match (score: ${score.toFixed(2)})`;
          return { exists, matches, detail };
        }
      }
    }

    if (!exists && ref) {
      const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(ref)}`;
      const wikiData = await fetchJson(wikiUrl);

      if (wikiData?.title) {
        const score = fuzzyMatch(wikiData.title, ref);
        if (score > 0.6) {
          exists = true;
          matches = true;
          detail = `Wikipedia match: ${wikiData.title}`;
          return { exists, matches, detail };
        }
      }
    }

    detail = exists ? 'Found but no strong match' : 'Not found in external sources';
  } catch (error) {
    detail = `External API error: ${error instanceof Error ? error.message : 'Unknown'}`;
  }

  return { exists, matches, detail };
}