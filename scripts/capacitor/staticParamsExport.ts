/**
 * Static-export classifier: does a module actually EXPORT `generateStaticParams`?
 *
 * Why this exists (2026-09-10): scripts/capacitor-patch-routes.sh decided
 * whether a dynamic-segment page could survive `output: 'export'` by running
 * `grep -q generateStaticParams` over the file. A comment can satisfy that
 * test. app/reflections/[id]/page.tsx is a client component whose doc comment
 * explains that it *cannot* supply generateStaticParams — and that sentence
 * made the scanner classify it as compatible, so Next.js then failed the whole
 * iOS static export on exactly that page.
 *
 * Capability is a property of the module's export surface, not of its source
 * text. So this asks the TypeScript parser, not a substring match:
 *
 *   export function generateStaticParams() {}          → true
 *   export async function generateStaticParams() {}    → true
 *   export const generateStaticParams = () => []       → true
 *   export { generateStaticParams }                    → true
 *   export { anything as generateStaticParams }        → true
 *   export { generateStaticParams } from './params'    → true
 *   // ... generateStaticParams ... (comment / string)  → false
 *   function generateStaticParams() {} (not exported)  → false
 *   export default function generateStaticParams() {}  → false (binding is `default`)
 *   export type { generateStaticParams } from './p'    → false (erased at runtime)
 *   export { type generateStaticParams } from './p'    → false (erased at runtime)
 *
 * Deliberately NOT resolved: `export * from './x'` (would require following
 * the module graph). Such a page reports false and falls through to the
 * scanner's existing branches, which is the same behaviour the lexical scan
 * had for a page with no mention at all. No page in the tree uses that shape
 * today; if one appears, extend this rather than the shell script.
 *
 * Parse only — no type-check, no program, no emit. The parser tolerates
 * syntax errors; a file the parser cannot make sense of simply has no export
 * named generateStaticParams and reports false (fail closed: the page is then
 * excluded or patched, never silently shipped).
 */

import ts from 'typescript';

export const GENERATE_STATIC_PARAMS = 'generateStaticParams';

/**
 * True iff the node carries `export` but NOT `default`.
 *
 * `export default function generateStaticParams() {}` exports a binding
 * named `default`; the local function name is invisible to importers and to
 * Next.js. Counting it would recreate the substring defect in AST clothing
 * (review finding on PR #1284, 2026-09-11).
 */
function hasNamedExportModifier(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  if (!modifiers) return false;
  let isExport = false;
  for (const m of modifiers) {
    if (m.kind === ts.SyntaxKind.ExportKeyword) isExport = true;
    if (m.kind === ts.SyntaxKind.DefaultKeyword) return false;
  }
  return isExport;
}

function bindingNames(name: ts.BindingName, out: string[]): void {
  if (ts.isIdentifier(name)) {
    out.push(name.text);
    return;
  }
  for (const element of name.elements) {
    if (ts.isBindingElement(element)) bindingNames(element.name, out);
  }
}

/**
 * True iff the module's top-level export surface contains a binding named
 * `generateStaticParams`.
 */
export function exportsGenerateStaticParams(
  source: string,
  fileName = 'page.tsx',
): boolean {
  const sf = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ false,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  for (const stmt of sf.statements) {
    // export function generateStaticParams() / export async function ...
    // (`export default function generateStaticParams` is NOT a named export.)
    if (ts.isFunctionDeclaration(stmt)) {
      if (hasNamedExportModifier(stmt) && stmt.name?.text === GENERATE_STATIC_PARAMS) {
        return true;
      }
      continue;
    }

    // export const generateStaticParams = ...  (also let/var, destructuring)
    if (ts.isVariableStatement(stmt)) {
      if (!hasNamedExportModifier(stmt)) continue;
      const names: string[] = [];
      for (const decl of stmt.declarationList.declarations) {
        bindingNames(decl.name, names);
      }
      if (names.includes(GENERATE_STATIC_PARAMS)) return true;
      continue;
    }

    // export { generateStaticParams } / export { x as generateStaticParams }
    // with or without a `from` clause.
    // Type-only exports (`export type { … }` / `export { type … }`) are
    // erased at runtime: Next.js finds no function. They must not count.
    if (ts.isExportDeclaration(stmt)) {
      if (stmt.isTypeOnly) continue;
      const clause = stmt.exportClause;
      if (clause && ts.isNamedExports(clause)) {
        for (const el of clause.elements) {
          if (el.isTypeOnly) continue;
          // el.name is the EXPORTED name (Identifier or string literal).
          if (el.name.text === GENERATE_STATIC_PARAMS) return true;
        }
      }
      // `export * from` is not followed — see header.
      continue;
    }
  }

  return false;
}
