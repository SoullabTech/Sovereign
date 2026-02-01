/**
 * Dream Symbol Extraction
 * Zero-dependency baseline for immediate dream intelligence
 */

const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'from', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'i', 'you', 'we', 'they', 'he', 'she', 'it',
  'my', 'your', 'our', 'their', 'his', 'her', 'me', 'him', 'them', 'this', 'that', 'these', 'those',
  'had', 'have', 'has', 'do', 'did', 'does', 'would', 'could', 'should', 'will', 'can', 'may',
  'just', 'then', 'there', 'here', 'when', 'where', 'what', 'who', 'how', 'why', 'which',
  'all', 'some', 'any', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'such',
  'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now',
  'into', 'about', 'over', 'after', 'before', 'between', 'under', 'again', 'further', 'once',
  'during', 'through', 'while', 'because', 'although', 'though', 'until', 'unless', 'since',
  'felt', 'like', 'seemed', 'knew', 'saw', 'went', 'came', 'got', 'made', 'said', 'told',
  'something', 'someone', 'everything', 'nothing', 'anything', 'somewhere', 'anywhere',
  'dream', 'dreamed', 'dreaming', 'woke', 'awoke', 'asleep', 'sleep', 'sleeping',
]);

function normalizeToken(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9'-]/g, '').trim();
}

export interface SymbolResult {
  term: string;
  count: number;
}

export interface ExtractionResult {
  top: SymbolResult[];
  motifs: string[];
  archetypes: string[];
}

/**
 * Extract symbols and motifs from dream text
 */
export function extractDreamSymbols(text: string, max = 12): ExtractionResult {
  const tokens = text
    .split(/\s+/g)
    .map(normalizeToken)
    .filter(Boolean)
    .filter(t => t.length >= 3 && !STOP.has(t));

  // Simple frequency count
  const counts = new Map<string, number>();
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);

  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([term, count]) => ({ term, count }));

  // Detect high-signal motifs
  const motifs: string[] = [];
  const lower = text.toLowerCase();

  // Movement/pursuit motifs
  if (/(chase|chased|chasing|running|ran|pursue|pursued|escape|escaped|fleeing)/.test(lower)) {
    motifs.push('pursuit');
  }
  if (/(fall|falling|fell|dropped|cliff|plummet|descend)/.test(lower)) {
    motifs.push('falling');
  }
  if (/(fly|flying|flew|soar|float|floating|levitat)/.test(lower)) {
    motifs.push('flight');
  }

  // Elemental motifs
  if (/(water|ocean|sea|river|lake|flood|drown|swim|wave|rain|pool)/.test(lower)) {
    motifs.push('water');
  }
  if (/(fire|burn|burning|flame|smoke|blaze|inferno)/.test(lower)) {
    motifs.push('fire');
  }
  if (/(earth|ground|dirt|soil|mountain|cave|tunnel|bury|buried)/.test(lower)) {
    motifs.push('earth');
  }
  if (/(sky|air|wind|storm|cloud|thunder|lightning|breath)/.test(lower)) {
    motifs.push('air');
  }

  // Space/structure motifs
  if (/(house|home|room|door|hallway|corridor|window|stair|basement|attic)/.test(lower)) {
    motifs.push('house');
  }
  if (/(school|class|test|exam|late|teacher|student)/.test(lower)) {
    motifs.push('evaluation');
  }
  if (/(forest|tree|wood|jungle|garden|plant|flower)/.test(lower)) {
    motifs.push('nature');
  }
  if (/(road|path|journey|travel|car|drive|lost|map)/.test(lower)) {
    motifs.push('journey');
  }

  // Relational motifs
  if (/(baby|child|children|mother|father|parent|family|son|daughter)/.test(lower)) {
    motifs.push('family');
  }
  if (/(friend|stranger|crowd|people|group|party)/.test(lower)) {
    motifs.push('social');
  }
  if (/(love|lover|partner|kiss|embrace|marry|wedding)/.test(lower)) {
    motifs.push('romantic');
  }

  // Creature motifs
  if (/(snake|spider|wolf|bear|cat|dog|bird|fish|horse|lion|tiger)/.test(lower)) {
    motifs.push('animal');
  }
  if (/(monster|creature|demon|ghost|spirit|shadow|dark figure)/.test(lower)) {
    motifs.push('shadow-creature');
  }

  // Threshold motifs
  if (/(death|dead|die|dying|grave|funeral|corpse|kill)/.test(lower)) {
    motifs.push('death-rebirth');
  }
  if (/(birth|born|baby|pregnant|new|begin|start)/.test(lower)) {
    motifs.push('birth');
  }
  if (/(transform|change|becoming|morph|shift)/.test(lower)) {
    motifs.push('transformation');
  }

  // Detect Jungian archetypes
  const archetypes: string[] = [];

  if (/(hero|battle|fight|victory|defeat|sword|armor|quest|enemy)/.test(lower)) {
    archetypes.push('The Hero');
  }
  if (/(shadow|dark|hidden|monster|fear|chase|pursue|enemy)/.test(lower)) {
    archetypes.push('The Shadow');
  }
  if (/(woman|man|beautiful|handsome|love|attract|desire|anima|animus)/.test(lower)) {
    archetypes.push('The Anima/Animus');
  }
  if (/(old man|wise|elder|sage|mentor|guide|teacher|advice)/.test(lower)) {
    archetypes.push('The Wise Old Man');
  }
  if (/(old woman|grandmother|crone|witch|healer)/.test(lower)) {
    archetypes.push('The Wise Old Woman');
  }
  if (/(mother|nurture|protect|birth|care|feed|comfort)/.test(lower)) {
    archetypes.push('The Great Mother');
  }
  if (/(child|innocent|wonder|play|pure|new|beginning)/.test(lower)) {
    archetypes.push('The Divine Child');
  }
  if (/(trick|joke|chaos|change|unexpected|fool|clown|surprise)/.test(lower)) {
    archetypes.push('The Trickster');
  }

  return { top, motifs, archetypes };
}
