/**
 * YAML 4-aware front matter parser for Soullab Markdown content.
 *
 * gray-matter 4 was authored against js-yaml 3's safeLoad/safeDump aliases.
 * Those aliases throw in js-yaml 4. The engine option keeps gray-matter's
 * delimiter/content semantics while using the maintained YAML parser.
 *
 * Do not fall back to the vulnerable js-yaml 3 parser for malformed input.
 */
import matter from 'gray-matter';
import { load, dump } from 'js-yaml';

const engines = {
  yaml: {
    parse: (text: string) => load(text),
    stringify: (value: unknown) => dump(value),
  },
};

export function parseMarkdownFrontmatter(source: string) {
  return matter(source, { engines });
}
