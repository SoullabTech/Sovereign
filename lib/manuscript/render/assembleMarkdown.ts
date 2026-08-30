/**
 * The manuscript markdown assembler — and the section shape it reads.
 *
 * A LEAF MODULE ON PURPOSE. This lives apart from renderMemberBook because
 * that module reaches puppeteer (through pagedPdf) to make a PDF, and the
 * assembler itself is pure string work over section records. Anything that
 * needs to know how a manuscript becomes markdown — the WS2-04A draft census
 * among them — can import it without pulling a headless browser along.
 *
 * It is also the HISTORICAL draft composer. Before 5f50f6790 (2026-08-05) the
 * Working Draft route composed its starting text with this exact function;
 * that commit moved the draft to plain headings and left this untouched,
 * because pandoc's chapter splitting depends on the `# ` form. So a draft
 * founded before that date is this function's output, and proving that is
 * what lets 04A seed such a draft exactly instead of asking its author to
 * review changes they never made.
 *
 * Which is why it must stay a single definition, imported and never copied.
 */

export interface MemberBookSection {
  heading: string | null;
  body: string;
}

/**
 * Assemble sections into markdown: `# ` heading, blank line, body, blank line.
 * The `# ` prefix is load-bearing for the render path — pandoc splits chapters
 * on it — so it is not cosmetic and must not be "cleaned up".
 */
export function assembleManuscriptMarkdown(sections: MemberBookSection[]): string {
  const parts: string[] = [];
  for (const s of sections) {
    const heading = s.heading?.trim();
    if (heading) {
      parts.push(`# ${heading}`);
      parts.push('');
    }
    parts.push(s.body);
    parts.push('');
  }
  return parts.join('\n');
}
