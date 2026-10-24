import { load } from 'js-yaml';

/**
 * Read ordinary YAML front matter without bundling gray-matter's vulnerable
 * js-yaml 3 / argparse 1 chain.
 *
 * Only the two fields used by AIN framings and Obsidian notes are returned:
 * the parsed front matter and the exact remainder of the writer's text.
 * A document without a complete header is preserved verbatim. No JavaScript
 * front-matter engine or evaluation path is admitted.
 */
export function readMarkdownFrontMatter(text: string): {
  data: Record<string, any>;
  content: string;
} {
  const original = text;
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const open = /^---(?:yaml|yml)?[ \t]*\r?\n/i.exec(src);
  if (!open) return { data: {}, content: original };

  const afterOpen = src.slice(open[0].length);
  // Closing delimiters must occupy a line of their own. This avoids treating
  // three hyphens inside a sentence or a quoted front-matter value as a close.
  const close = /^---[ \t]*(?:\r?\n|$)/gm.exec(afterOpen);
  if (!close) return { data: {}, content: original };

  const yaml = afterOpen.slice(0, close.index);
  const parsed = yaml.trim().length === 0 ? {} : load(yaml);
  if (parsed != null && (Array.isArray(parsed) || typeof parsed !== 'object')) {
    throw new Error('YAML front matter must be an object');
  }
  return {
    data: (parsed ?? {}) as Record<string, any>,
    content: afterOpen.slice(close.index + close[0].length),
  };
}
