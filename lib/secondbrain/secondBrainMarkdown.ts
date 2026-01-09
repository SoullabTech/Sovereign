/**
 * Second Brain Markdown Utilities
 *
 * Helpers for generating Obsidian-compatible markdown with YAML frontmatter.
 * Follows the "Form" (schema) pattern from Nate's second brain architecture.
 */

/**
 * Generate a URL-safe slug from a title
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Escape a string for YAML (handles special characters)
 */
function yamlEscapeString(s: string): string {
  if (s === '') return '""';

  // Check if the string needs quoting
  const needsQuotes =
    /[:\n\r\t\-#\[\]{}&,*!|>'"%@`]/.test(s) ||
    /^\s|\s$/.test(s) ||
    /^(true|false|null|yes|no)$/i.test(s) ||
    /^\d/.test(s);

  if (!needsQuotes) return s;

  // Use double quotes and escape internal quotes/backslashes
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * Convert a JavaScript object to YAML frontmatter string
 */
export function toYamlFrontmatter(obj: Record<string, unknown>): string {
  const lines: string[] = ['---'];

  const writeKey = (k: string, v: unknown, indent = '') => {
    if (v === null || v === undefined) return;

    // Arrays
    if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push(`${indent}${k}: []`);
        return;
      }
      lines.push(`${indent}${k}:`);
      for (const item of v) {
        if (typeof item === 'string') {
          lines.push(`${indent}  - ${yamlEscapeString(item)}`);
        } else if (typeof item === 'object' && item !== null) {
          // Nested object in array - simplified handling
          lines.push(`${indent}  - ${JSON.stringify(item)}`);
        } else {
          lines.push(`${indent}  - ${String(item)}`);
        }
      }
      return;
    }

    // Nested objects
    if (typeof v === 'object') {
      const entries = Object.entries(v as Record<string, unknown>);
      if (entries.length === 0) {
        lines.push(`${indent}${k}: {}`);
        return;
      }
      lines.push(`${indent}${k}:`);
      for (const [kk, vv] of entries) {
        writeKey(kk, vv, `${indent}  `);
      }
      return;
    }

    // Strings
    if (typeof v === 'string') {
      lines.push(`${indent}${k}: ${yamlEscapeString(v)}`);
      return;
    }

    // Numbers, booleans
    lines.push(`${indent}${k}: ${String(v)}`);
  };

  for (const [k, v] of Object.entries(obj)) {
    writeKey(k, v);
  }

  lines.push('---');
  return lines.join('\n');
}

/**
 * Build a complete Obsidian note with frontmatter, title, and body
 */
export function buildNoteMarkdown(opts: {
  frontmatter: Record<string, unknown>;
  title: string;
  body: string;
}): string {
  const fm = toYamlFrontmatter(opts.frontmatter);
  const h1 = `# ${opts.title}`;
  const body = opts.body.trim() ? `\n\n${opts.body.trim()}\n` : '\n';
  return `${fm}\n\n${h1}${body}`;
}

/**
 * Parse frontmatter from a markdown string (simple extraction)
 */
export function parseFrontmatter(markdown: string): {
  frontmatter: Record<string, unknown> | null;
  content: string;
} {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: null, content: markdown };
  }

  try {
    // Simple YAML parsing for common cases
    // For production, consider using a proper YAML parser
    const yamlContent = match[1];
    const content = match[2];

    const frontmatter: Record<string, unknown> = {};
    const lines = yamlContent.split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        let value: unknown = line.slice(colonIndex + 1).trim();

        // Basic type coercion
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (value === 'null') value = null;
        else if (/^\d+$/.test(value as string)) value = parseInt(value as string, 10);
        else if (/^\d+\.\d+$/.test(value as string)) value = parseFloat(value as string);
        else if ((value as string).startsWith('"') && (value as string).endsWith('"')) {
          value = (value as string).slice(1, -1);
        }

        frontmatter[key] = value;
      }
    }

    return { frontmatter, content };
  } catch {
    return { frontmatter: null, content: markdown };
  }
}

/**
 * Generate a timestamp string for filenames
 */
export function timestampSlug(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}
