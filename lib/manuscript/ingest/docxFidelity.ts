/**
 * SP-02F — bounded structural preservation for Word manuscript imports.
 *
 * Mammoth's Markdown writer flattens table cells and its numbered notes are
 * not editable footnote references. The original DOCX remains in Source custody;
 * this adapter only creates an honest, author-reviewable Markdown derivative.
 *
 * Fail closed on structures this representation cannot preserve. In particular,
 * never infer a table header, join cells, or synthesize missing note text.
 */
import { parseDocument } from 'htmlparser2';

export interface DocxFidelity {
  representation: 'markdown';
  tables: number;
  tableRows: number;
  footnotes: number;
  standaloneQuotationsChecked: number;
  requiresReview: true;
}

export interface StructuredDocxText {
  text: string;
  warnings: string[];
  fidelity: DocxFidelity;
}

export class UnsupportedDocxStructureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedDocxStructureError';
  }
}

type HtmlNode = {
  type?: string;
  name?: string;
  data?: string;
  children?: HtmlNode[];
  attribs?: Record<string, string>;
};

const FAIL = (detail: string): never => {
  throw new UnsupportedDocxStructureError(
    `This Word document contains ${detail}. Studio cannot safely preserve it in an editable draft yet. Your original file has not been changed. Import is stopped rather than silently losing information.`,
  );
};

function find(node: HtmlNode, name: string): HtmlNode[] {
  const result: HtmlNode[] = [];
  function visit(current: HtmlNode) {
    if (current.name === name) result.push(current);
    for (const child of current.children ?? []) visit(child);
  }
  visit(node);
  return result;
}

function children(node: HtmlNode, ...names: string[]): HtmlNode[] {
  return (node.children ?? []).filter((child) => names.includes(child.name ?? ''));
}

function textOf(node: HtmlNode): string {
  if (node.type === 'text') return node.data ?? '';
  return (node.children ?? []).map(textOf).join('');
}

function replaceSingle(text: string, before: string, after: string, what: string): string {
  const at = text.indexOf(before);
  if (at < 0 || text.indexOf(before, at + before.length) >= 0) {
    return FAIL(`an ambiguous or missing ${what} in the extracted text`);
  }
  return text.slice(0, at) + after + text.slice(at + before.length);
}

function preserveTables(html: HtmlNode, initial: string) {
  let result = initial;
  let rowTotal = 0;
  const tables = find(html, 'table');
  for (const table of tables) {
    if (find(table, 'table').length > 1) FAIL('a nested table');
    const rows = find(table, 'tr');
    if (rows.length < 2) FAIL('a table without a heading row and data rows');
    const cellRows = rows.map((row) => children(row, 'th', 'td'));
    if (cellRows[0].length === 0 || cellRows[0].some((cell) => cell.name !== 'th')) {
      FAIL('a table without explicit header cells');
    }
    const width = cellRows[0].length;
    if (cellRows.some((row) => row.length !== width)) FAIL('a table with uneven rows');
    if (cellRows.slice(1).some((row) => row.some((cell) => cell.name !== 'td'))) {
      FAIL('a table whose header structure cannot be represented');
    }
    const rowsAsText = cellRows.map((row) => row.map((cell) => {
      const attrs = cell.attribs ?? {};
      if ((attrs.rowspan && attrs.rowspan !== '1') || (attrs.colspan && attrs.colspan !== '1')) {
        FAIL('merged table cells');
      }
      if (find(cell, 'table').length || find(cell, 'img').length || find(cell, 'a').length) {
        FAIL('nested content, images, or hyperlinks inside a table');
      }
      if (find(cell, 'p').length > 1 || find(cell, 'br').length > 0) {
        FAIL('multiline table cells');
      }
      const value = textOf(cell).trim();
      if (!value || value.includes('\n')) FAIL('an empty or multiline table cell');
      return value;
    }));
    const originalFlattened = rowsAsText.flat().join('\n\n');
    // Pipe escaping changes only the Markdown delimiters; it cannot change the
    // value presented to the reader after parsing the table.
    const cellMd = (value: string) => value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
    const mdRow = (row: string[]) => '| ' + row.map(cellMd).join(' | ') + ' |';
    const grid = [
      mdRow(rowsAsText[0]),
      '| ' + rowsAsText[0].map(() => '---').join(' | ') + ' |',
      ...rowsAsText.slice(1).map(mdRow),
    ].join('\n');
    result = replaceSingle(result, originalFlattened, grid, 'table cell sequence');
    rowTotal += rows.length;
  }
  return { text: result, count: tables.length, rows: rowTotal };
}

function preserveFootnotes(root: HtmlNode, initial: string) {
  let result = initial;
  const notes = find(root, 'li').filter((node) => /^footnote-[0-9]+$/.test(node.attribs?.id ?? ''));
  const references = find(root, 'sup').flatMap((sup) =>
    find(sup, 'a').filter((a) => /^#footnote-[0-9]+$/.test(a.attribs?.href ?? '')),
  );
  if (notes.length !== references.length) {
    FAIL('a missing, duplicate, or unlinked Word footnote');
  }
  for (const note of notes) {
    const id = (note.attribs?.id ?? '').slice('footnote-'.length);
    const related = references.filter((a) =>
      a.attribs?.href === `#footnote-${id}` && a.attribs?.id === `footnote-ref-${id}`);
    if (related.length !== 1) FAIL('an ambiguous Word footnote reference');
    const ref = `[[${id}]](#footnote-${id})`;
    const back = new RegExp(`^${id}\\. +(.+?) +\\[↑\\]\\(#footnote-ref-${id}\\)[ \\t]*$`, 'm');
    const match = result.match(back);
    if (!match || !match[1] || result.match(new RegExp(back.source, 'gm'))?.length !== 1) {
      return FAIL('a Word footnote body that cannot be retained as a linked note');
    }
    const noteMarkdown = match[1];
    const body = textOf(note).replace(/↑\s*$/, '').trim();
    if (noteMarkdown.trim() !== body) {
      FAIL('a Word footnote whose content differs from its extracted text');
    }
    result = replaceSingle(result, ref, `[^${id}]`, 'footnote reference');
    result = result.replace(back, () => `[^${id}]: ${noteMarkdown}`);
  }
  return { text: result, count: notes.length };
}

function ensureQuotations(root: HtmlNode, markdown: string): number {
  const quotations = new Set(
    find(root, 'p').map((node) => textOf(node).trim()).filter((value) =>
      (/^“[^”]+”$/.test(value) || /^"[^"]+"$/.test(value)),
    ),
  );
  for (const quote of quotations) {
    if (!markdown.includes(quote)) FAIL('a quotation whose exact wording or punctuation changed');
  }
  return quotations.size;
}

export function preserveDocxStructure(
  markdown: string,
  html: string,
  mammothWarnings: readonly string[],
): StructuredDocxText {
  const root = parseDocument(html, { decodeEntities: true }) as unknown as HtmlNode;
  // Images, embedded fields, and drawings need another document model rather
  // than being silently omitted from the Working Draft.
  if (find(root, 'img').length || find(root, 'object').length || find(root, 'svg').length) {
    FAIL('embedded pictures or objects');
  }
  const tables = preserveTables(root, markdown);
  const notes = preserveFootnotes(root, tables.text);
  const quotes = ensureQuotations(root, notes.text);
  const warnings = [
    'The editable draft is Markdown, not a Word page. The exact original DOCX is kept separately. Check title, subtitle, captions, typography, page layout, headers, and reference-manager fields against the original; these are not a verified Word-formatting roundtrip.',
  ];
  if (tables.count) warnings.push(
    `${tables.count} Word table(s) are represented as Markdown row-and-column grids. Cell relationships are retained; native Word table formatting and export are not yet qualified.`,
  );
  if (notes.count) warnings.push(
    `${notes.count} Word footnote(s) are linked in Markdown as [^number] references and definitions. Native Word footnote export is not yet qualified.`,
  );
  for (const message of [...new Set(mammothWarnings)]) {
    warnings.push(`Word conversion notice: ${message.replace(/\\s+/g, ' ').slice(0, 240)}`);
  }
  return {
    text: notes.text,
    warnings,
    fidelity: {
      representation: 'markdown',
      tables: tables.count,
      tableRows: tables.rows,
      footnotes: notes.count,
      standaloneQuotationsChecked: quotes,
      requiresReview: true,
    },
  };
}
