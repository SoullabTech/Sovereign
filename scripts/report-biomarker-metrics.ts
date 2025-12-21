#!/usr/bin/env tsx
/**
 * Phase 4.2D Phase 5 — Metrics Validation & Documentation
 *
 * Goal: Ensure EVERY numeric metric in biomarkers.ts declares a unit/range.
 * Output:
 *  - artifacts/phase4.2d-metric-doc-report.md
 *
 * Run:
 *  - mkdir -p artifacts
 *  - npx tsx scripts/report-biomarker-metrics.ts
 */

import fs from "fs";
import path from "path";
import ts from "typescript";

const TARGET_FILE = path.resolve("lib/types/consciousness/biomarkers.ts");
const OUT_FILE = path.resolve("artifacts/phase4.2d-metric-doc-report.md");

const UNIT_HINT_RE =
  /\b(0\s*[-–]\s*1|0\s*\.\.\s*1|0\s*to\s*1|0\s*[-–]\s*100|0\s*to\s*100|%|percent|percentage|ms|millisecond|s\b|sec|second|seconds|hz|bpm|°c|celsius|fahrenheit|ratio|probability|likelihood|score|index|z-score|std)\b/i;

function ensureArtifactsDir() {
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
}

function getLineAndCol(sf: ts.SourceFile, pos: number) {
  const lc = sf.getLineAndCharacterOfPosition(pos);
  return { line: lc.line + 1, col: lc.character + 1 };
}

function extractComments(sf: ts.SourceFile, node: ts.Node): string {
  const text = sf.getFullText();

  const leadingRanges = ts.getLeadingCommentRanges(text, node.getFullStart()) ?? [];
  const trailingRanges = ts.getTrailingCommentRanges(text, node.getEnd()) ?? [];

  const leading = leadingRanges
    .map(r => text.slice(r.pos, r.end))
    .join("\n")
    .trim();

  const trailing = trailingRanges
    .map(r => text.slice(r.pos, r.end))
    .join("\n")
    .trim();

  const jsdoc = (node as any).jsDoc?.map((d: any) => d.getText?.() ?? "").join("\n") ?? "";

  return [leading, jsdoc, trailing].filter(Boolean).join("\n").trim();
}

function isNumberTypeNode(typeNode: ts.TypeNode | undefined): boolean {
  if (!typeNode) return false;

  // number
  if (typeNode.kind === ts.SyntaxKind.NumberKeyword) return true;

  // union including number (e.g., number | null)
  if (ts.isUnionTypeNode(typeNode)) {
    return typeNode.types.some(t => t.kind === ts.SyntaxKind.NumberKeyword);
  }

  // parenthesized
  if (ts.isParenthesizedTypeNode(typeNode)) return isNumberTypeNode(typeNode.type);

  return false;
}

type Finding = {
  container: string; // Interface/Type name
  prop: string;      // Property name
  line: number;
  col: number;
  comment: string;
  reason: string;
};

function main() {
  if (!fs.existsSync(TARGET_FILE)) {
    console.error(`❌ Target file not found: ${TARGET_FILE}`);
    process.exit(1);
  }

  const program = ts.createProgram([TARGET_FILE], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    strict: true,
    skipLibCheck: true,
  });

  const sf = program.getSourceFile(TARGET_FILE);
  if (!sf) {
    console.error(`❌ Could not load source file: ${TARGET_FILE}`);
    process.exit(1);
  }

  const findings: Finding[] = [];
  let totalNumeric = 0;
  let documentedNumeric = 0;

  function checkProperty(container: string, propSig: ts.PropertySignature) {
    if (!sf) return; // Guard against undefined sf

    const name = propSig.name?.getText(sf) ?? "<unknown>";
    if (!isNumberTypeNode(propSig.type)) return;

    totalNumeric += 1;

    const comment = extractComments(sf, propSig);
    const ok = UNIT_HINT_RE.test(comment);

    if (ok) {
      documentedNumeric += 1;
      return;
    }

    const { line, col } = getLineAndCol(sf, propSig.getStart(sf));

    findings.push({
      container,
      prop: name,
      line,
      col,
      comment: comment || "(no comment/jsdoc)",
      reason: "Missing unit/range hint (e.g., 0-1, 0-100, %, ms, bpm, etc.)",
    });
  }

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) {
      const container = node.name?.text ?? "<anonymous-interface>";
      for (const member of node.members) {
        if (ts.isPropertySignature(member)) checkProperty(container, member);
      }
    }

    if (ts.isTypeAliasDeclaration(node) && ts.isTypeLiteralNode(node.type)) {
      const container = node.name?.text ?? "<anonymous-type>";
      for (const member of node.type.members) {
        if (ts.isPropertySignature(member)) checkProperty(container, member);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sf);

  ensureArtifactsDir();

  const undocumented = findings.length;
  const pct = totalNumeric === 0 ? 100 : Math.round((documentedNumeric / totalNumeric) * 100);

  const lines: string[] = [];
  lines.push(`# Phase 4.2D Phase 5 — Biomarker Metric Documentation Report`);
  lines.push("");
  lines.push(`**Target:** \`${path.relative(process.cwd(), TARGET_FILE)}\``);
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push("");
  lines.push(`- Total numeric metrics found: **${totalNumeric}**`);
  lines.push(`- Numeric metrics with unit/range documentation: **${documentedNumeric}**`);
  lines.push(`- Numeric metrics missing documentation: **${undocumented}**`);
  lines.push(`- Coverage: **${pct}%**`);
  lines.push("");

  if (undocumented === 0) {
    lines.push(`✅ **PASS** — All numeric metrics include unit/range hints.`);
  } else {
    lines.push(`🚨 **FAIL** — Some numeric metrics are missing unit/range hints.`);
    lines.push("");
    lines.push(`## Undocumented Numeric Metrics`);
    lines.push("");
    lines.push(`| Location | Container | Property | Issue | Comment |`);
    lines.push(`|---|---|---|---|---|`);
    for (const f of findings) {
      const loc = `L${f.line}:C${f.col}`;
      const comment = f.comment.replace(/\r?\n/g, " ").replace(/\|/g, "\\|");
      lines.push(`| ${loc} | \`${f.container}\` | \`${f.prop}\` | ${f.reason} | ${comment} |`);
    }
  }

  fs.writeFileSync(OUT_FILE, lines.join("\n"), "utf8");

  console.log("🔍 Phase 4.2D Phase 5 — Metric Documentation Report");
  console.log(`Target: ${TARGET_FILE}`);
  console.log(`Output: ${OUT_FILE}`);
  console.log(`Coverage: ${pct}% (${documentedNumeric}/${totalNumeric})`);

  if (undocumented > 0) process.exit(1);
}

main();
