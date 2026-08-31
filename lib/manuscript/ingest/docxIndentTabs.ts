/**
 * Soullab Press — Word's first-line indent, dropped at the DOCX seam.
 *
 * THE ONE THING THE SOURCE FORMAT PROVES.
 *
 * A Word paragraph indented with the Tab key arrives as a `<w:tab/>` element
 * standing before the paragraph's first word. That element is not a character
 * the author typed into their sentence; it is paragraph presentation, and the
 * DOCX structure says so — which is the whole reason this transform can exist.
 * Flattened to text it becomes a leading `\t`, and a line beginning with a tab
 * is ALSO a markdown code block: the author's first paragraph arrives in a
 * monospace slab, and the section's opening line stops reading as prose.
 *
 * WHY THIS RUNS ON THE DOCUMENT TREE AND NOT ON THE TEXT. By the time the file
 * is a string, a tab is just a tab: there is no longer any evidence
 * distinguishing Word's indent mechanic from a tab the author typed between two
 * words. The distinction is only available HERE, before mammoth flattens it, so
 * this is the only place the judgement can honestly be made.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO — every one of these was written and
 * withdrawn, because the format gives no evidence for the distinction they
 * would require (founder ruling, 2026-08-31):
 *
 *   · It does not touch a tab that stands BETWEEN words. Only tabs before the
 *     paragraph's first word are indentation; a tab inside a line may be a
 *     column the author built, and nothing here can tell.
 *   · It does not collapse blank lines. Three blank lines may be a scene break
 *     the author meant.
 *   · It does not convert non-breaking spaces, thin spaces, soft hyphens or
 *     zero-width characters. Those are characters in the author's text, however
 *     invisible, and removing them is a decision about content, not spacing.
 *   · It does not strip trailing whitespace anywhere.
 *   · It does not run on PDF or plain-text uploads at all. A PDF text layer
 *     cannot distinguish authored spacing from typesetting, and in a .txt or
 *     .md manuscript the whitespace IS the source.
 *
 * The rule: do not decide which of a manuscript's visible spacing was authored
 * and which was import furniture unless the source format gives us the evidence
 * for that distinction. Here, for this one case, it does.
 */

/**
 * The shape of mammoth's document tree that this transform reads. Mammoth's
 * own types declare `transformDocument` as `(element: any) => any`; this names
 * the two fields actually touched, so the traversal is checked rather than
 * trusted.
 */
interface DocxNode {
  type?: string;
  value?: string;
  children?: DocxNode[];
}

/** A run holding one tab and nothing else, or a bare tab. */
function isLeadingTabCandidate(node: DocxNode): 'tab' | 'text' | 'other' {
  if (node.type === 'tab') return 'tab';
  if (node.type === 'text') return (node.value ?? '').length > 0 ? 'text' : 'other';
  const kids = node.children ?? [];
  let sawTab = false;
  for (const k of kids) {
    const kind = isLeadingTabCandidate(k);
    if (kind === 'text') return 'text';
    if (kind === 'tab') sawTab = true;
  }
  return sawTab ? 'tab' : 'other';
}

/**
 * Remove the tabs that stand before a paragraph's first word.
 *
 * Mutates `children` arrays in place and returns the same tree. Rebuilding the
 * nodes would be cleaner to read and would silently drop every field this
 * module does not know about — style ids, numbering, alignment — so the edit is
 * kept to the one list it is actually making smaller.
 */
function stripLeadingTabs(paragraph: DocxNode): void {
  const kids = paragraph.children;
  if (!kids) return;
  for (let i = 0; i < kids.length; i++) {
    const kind = isLeadingTabCandidate(kids[i]);
    /* The first word ends the indent. Everything after it is the author's
       line, tabs included. */
    if (kind === 'text') {
      const inner = kids[i].children;
      if (inner) {
        for (let j = 0; j < inner.length; j++) {
          const k = isLeadingTabCandidate(inner[j]);
          if (k === 'text') break;
          if (k === 'tab') { inner.splice(j, 1); j--; }
        }
      }
      return;
    }
    if (kind === 'tab') { kids.splice(i, 1); i--; }
  }
}

/**
 * mammoth `transformDocument` hook. Walks every paragraph in the document and
 * drops its indentation tabs, leaving the rest of the tree untouched.
 */
export function dropWordIndentTabs(node: unknown): unknown {
  const walk = (n: DocxNode) => {
    if (!n || typeof n !== 'object') return;
    if (n.type === 'paragraph') stripLeadingTabs(n);
    for (const c of n.children ?? []) walk(c);
  };
  walk(node as DocxNode);
  return node;
}
