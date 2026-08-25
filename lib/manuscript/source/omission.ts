import type { SectionInput } from '../ingest/segment';

/**
 * WS-01 — omission detection.
 *
 * P0 requires that **no arriving text may be silently discarded before the member
 * begins working.** This module is the control that makes that claim evidence
 * rather than assertion.
 *
 * What it compares, and why that is the honest comparison:
 *
 * Byte-exact round-tripping through `manuscript_sections` is impossible by
 * construction — `segment()` stores a heading as its trimmed text with any
 * `#` prefix removed, so the original line ("  ## Chapter One  ") cannot be
 * rebuilt from the row. Demanding byte equality would therefore report
 * *formatting* as *loss* and be ignored within a week.
 *
 * So the comparison is at the level P0 actually cares about: **every arriving
 * line of content must be accounted for, in order.** A line that vanishes is
 * loss. A line that lost two leading spaces is not.
 */

/** The declared normalization, applied to BOTH sides so it can hide nothing. */
function normalizeLine(line: string): string {
  return line.replace(/^\s*#{1,3}\s+/, '').trim();
}

/** Content lines of a text, in order, with blank lines dropped. */
function contentLines(text: string): string[] {
  return text.split('\n').map(normalizeLine).filter((l) => l.length > 0);
}

/** Content lines a set of sections accounts for, in order. */
function sectionLines(sections: SectionInput[]): string[] {
  const out: string[] = [];
  for (const s of sections) {
    if (s.heading) {
      const h = normalizeLine(s.heading);
      if (h.length > 0) out.push(h);
    }
    out.push(...contentLines(s.body));
  }
  return out;
}

export interface OmissionReport {
  /** True when every arriving content line is accounted for, in order. */
  lossless: boolean;
  /** Arriving lines that no section accounts for, in arrival order. */
  missing: string[];
  arrivedLineCount: number;
  accountedLineCount: number;
}

/**
 * Compare what arrived against what the interpretation produced.
 *
 * The walk is order-preserving and forward-only: a section list may add lines
 * (a member-authored heading, say) without that hiding a loss elsewhere, but it
 * may not silently drop one. Reordering counts as loss, deliberately — text that
 * moved is text this control cannot vouch for.
 */
export function detectOmission(sourceText: string, sections: SectionInput[]): OmissionReport {
  const arrived = contentLines(sourceText);
  const accounted = sectionLines(sections);

  const missing: string[] = [];
  let cursor = 0;
  for (const line of arrived) {
    const at = accounted.indexOf(line, cursor);
    if (at === -1) {
      missing.push(line);
    } else {
      cursor = at + 1;
    }
  }

  return {
    lossless: missing.length === 0,
    missing,
    arrivedLineCount: arrived.length,
    accountedLineCount: accounted.length,
  };
}

/** One log-safe line. Counts and nothing else — never the member's words. */
export function omissionMarker(report: OmissionReport): string {
  return `lossless=${report.lossless} arrived=${report.arrivedLineCount} accounted=${report.accountedLineCount} missing=${report.missing.length}`;
}
