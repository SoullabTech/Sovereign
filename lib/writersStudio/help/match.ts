import { HELP_TOPICS, helpTopic, type HelpContext, type HelpTopicId } from './catalogue';
export function normalizedHelpQuestion(s: string): string {
  return s.normalize('NFKC').toLowerCase().replace(/[’']/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}
const DIRECT: readonly [HelpTopicId, RegExp][] = [
  ['save-disabled', /\bsav\w*\b.*\b(disabled|grey|gray|greyed|grayed|unavailable|cant|cannot)\b|\b(cant|cannot|disabled)\b.*\bsave\b/],
  ['failure', /\b(nothing happened|not responding|no response|timed out|timeout|502|retry|refresh)\b/],
  ['marks', /\b(crossed out|cross out|strikeout|strikethrough|red word|red line|blue word|markup|preview)\b/],
  ['keep', /\b(keep mine|keep my original|put .{1,40} back|restore .{0,30}original|reject .{0,20}(edit|suggestion))\b/],
  ['return', /\b(find|where|reopen|recover)\b.{0,45}\b(saved|version|draft)\b/],
  ['depth', /\b(craft depth|teach me why|why this works|advanced view)\b/],
  ['layout', /\b(stacked|balanced|maia wide|passage wide|layout|column|columns|divider)\b/],
  ['materials', /\b(material|materials|notes|sources|new insight|attach)\b/],
  ['scope', /\b(whole book|whole chapter|read .{0,25}chapter|reading scope)\b/],
  ['focus', /\b(next passage|previous passage|work here|choose passage|next paragraph|move .{0,25}(passage|section)|selected words)\b/],
  ['actions', /\b(did maia|did you actually|talk only|said .{0,20}(changed|done)|command)\b/],
];
export function matchHelpTopics(question: string, context: HelpContext): { ids: HelpTopicId[]; confident: boolean } {
  const q = normalizedHelpQuestion(question);
  if (!q) return { ids: [], confident: false };
  // Multiple strong meanings stay multiple; selection is not an executed command.
  const direct = [...new Set(DIRECT.filter(([,pattern]) => pattern.test(q)).map(([id]) => id))];
  if (direct.length) return { ids: direct.slice(0, 2), confident: direct.length === 1 };
  const words = new Set(q.split(' ').filter(w => w.length > 2 && !['the','this','that','how','what','can','you','does','with','and','for','have','why','are','its','just','please','want'].includes(w)));
  const scored = HELP_TOPICS.map(t => ({ id:t.id, score:[...words].reduce((n,w) => n + (t.keywords.split(' ').includes(w) ? 2 : 0), 0) }))
    .filter(t => t.score > 0).sort((a,b) => b.score - a.score);
  // One vague word is a search hint, not enough to assert a confident answer.
  const first = scored[0], second = scored[1];
  return { ids:scored.slice(0,3).map(t => t.id), confident:Boolean(first && first.score >= 4 && (!second || first.score > second.score)) };
}
export function validateMatchedTopics(value: unknown): HelpTopicId[] | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const obj = value as Record<string, unknown>;
  if (Object.keys(obj).length !== 1 || !Array.isArray(obj.topicIds) || obj.topicIds.length > 2) return null;
  if (obj.topicIds.some(id => typeof id !== 'string' || !helpTopic(id)) || new Set(obj.topicIds).size !== obj.topicIds.length) return null;
  return obj.topicIds as HelpTopicId[];
}
