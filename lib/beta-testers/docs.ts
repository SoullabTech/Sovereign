import 'server-only';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { ElementKey } from './constants';

/**
 * Server-side loader for the Beta Learning Field doctrine markdown.
 *
 * Reads content/beta-testers/*.md. With output: 'standalone', these files are
 * included via next.config outputFileTracingIncludes. Every read is fail-safe:
 * a missing file degrades to empty content rather than throwing a 500, so a
 * tracing/config slip never takes down a doctrine page.
 */

const DIR = path.join(process.cwd(), 'content', 'beta-testers');

export interface Doc {
  title: string;
  content: string;
  data: Record<string, unknown>;
}

export function getDoc(slug: string): Doc {
  try {
    const raw = fs.readFileSync(path.join(DIR, `${slug}.md`), 'utf8');
    const { data, content } = matter(raw);
    return { title: (data.title as string) ?? '', content, data };
  } catch {
    return { title: '', content: '', data: {} };
  }
}

export interface PerspectiveLens {
  element: ElementKey;
  question: string;
  facets: string[];
}

export interface Perspectives {
  title: string;
  intro: string[];
  closing: string[];
  lenses: PerspectiveLens[];
}

export function getPerspectives(): Perspectives {
  const { data, title } = getDoc('elemental-perspectives');
  const toLines = (v: unknown): string[] =>
    Array.isArray(v) ? v.map(String) : typeof v === 'string' ? [v] : [];
  const lenses = Array.isArray(data.lenses)
    ? (data.lenses as any[]).map((l) => ({
        element: l.element as ElementKey,
        question: String(l.question ?? ''),
        facets: Array.isArray(l.facets) ? l.facets.map(String) : [],
      }))
    : [];
  return {
    title: title || 'The Elemental Perspectives',
    intro: toLines(data.intro),
    closing: toLines(data.closing),
    lenses,
  };
}
