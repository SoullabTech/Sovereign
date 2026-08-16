#!/usr/bin/env tsx
/**
 * PHI COLUMNS INVENTORY CHECK
 *
 * Verifies that the PHI columns inventory (docs/security/phi-columns.md)
 * is consistent with the actual codebase:
 *
 * 1. Each ENCRYPTED column has corresponding accessor
 * 2. Each accessor file exports expected functions
 * 3. No undocumented PHI columns exist in accessors
 *
 * @see docs/security/security-constitution.md
 * @see docs/security/phi-columns.md
 */

import fs from "node:fs";
import path from "node:path";

// =============================================================================
// TYPES
// =============================================================================

interface PHIColumn {
  table: string;
  column: string;
  status: "ENCRYPTED" | "DUAL-WRITE (3A)" | "PLAINTEXT" | "METADATA" | "EXEMPT";
}

interface AccessorSpec {
  file: string;
  tables: string[];
  requiredExports: string[];
}

// =============================================================================
// CONFIGURATION
// =============================================================================

// Expected accessor files and their responsibilities
const ACCESSOR_SPECS: AccessorSpec[] = [
  {
    file: "lib/security/phiAccessors/sessionNotes.ts",
    tables: ["case_notes"],
    requiredExports: [
      "encryptNoteContent",
      "decryptNoteContent",
      "getEncryptedColumnsForInsert",
      "decryptNoteRow",
      "sanitizeNoteRow",
    ],
  },
  {
    file: "lib/security/phiAccessors/emergencyInfo.ts",
    tables: ["client_emergency_info"],
    requiredExports: [
      "encryptEmergencyInfoPatch",
      "decryptEmergencyInfoRow",
      "sanitizeEmergencyInfoRow",
    ],
  },
  {
    file: "lib/security/phiAccessors/maiaConsultations.ts",
    tables: ["maia_consultations"],
    requiredExports: [
      "encryptConsultationCreate",
      "encryptConsultationFeedback",
      "decryptConsultationRow",
      "sanitizeConsultationRow",
    ],
  },
  {
    file: "lib/security/phiAccessors/clientMessages.ts",
    tables: ["client_messages"],
    requiredExports: [
      "encryptMessageBody",
      "decryptMessageBody",
      "getEncryptedColumnsForInsert",
    ],
  },
  {
    file: "lib/security/phiAccessors/transcripts.ts",
    tables: ["supervision_transcript_segments", "practice_transcript_segments"],
    requiredExports: [
      "encryptTranscriptText",
      "decryptTranscriptText",
      "getEncryptedColumnsForInsert",
      "decryptTranscriptSegmentRow",
    ],
  },
  {
    file: "lib/stellium/clients.ts",
    tables: ["practitioner_clients"],
    requiredExports: [
      "decryptClientRow",
      "decryptJoinedClientFields",
    ],
  },
  {
    // Note: practitioner_cases uses legacy client_name_encrypted column
    // Not using *_enc pattern - stored directly encrypted
    file: "lib/caseload/CaseStore.ts",
    tables: ["practitioner_cases"],
    requiredExports: [
      "createCase",
      "updateCase",
      "getCase",
    ],
  },
];

// Tables that must have ENCRYPTED columns
// Note: practitioner_cases uses legacy naming (client_name_encrypted)
// Note: clients/practitioner_clients encryption is planned but not yet implemented
const REQUIRED_ENCRYPTED_TABLES = [
  "case_notes",
  "client_emergency_info",
  "maia_consultations",
  "practitioner_cases",
  "supervision_transcript_segments",
  "practice_transcript_segments",
];

// =============================================================================
// PARSING
// =============================================================================

function parseInventory(content: string): PHIColumn[] {
  const columns: PHIColumn[] = [];
  const lines = content.split("\n");

  // Match table rows: | table | column | type | status | reason |
  const tableRowRe = /^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*[^|]+\|\s*(\w+(?:\s*\([^)]+\))?)\s*\|/;

  for (const line of lines) {
    const match = tableRowRe.exec(line);
    if (match) {
      const [, table, column, statusRaw] = match;
      const status = statusRaw.trim() as PHIColumn["status"];
      if (["ENCRYPTED", "DUAL-WRITE (3A)", "PLAINTEXT", "METADATA", "EXEMPT"].includes(status.split(" ")[0])) {
        columns.push({ table, column, status });
      }
    }
  }

  return columns;
}

// =============================================================================
// CHECKS
// =============================================================================

function checkAccessorExists(spec: AccessorSpec): string[] {
  const errors: string[] = [];
  const fullPath = path.join(process.cwd(), spec.file);

  if (!fs.existsSync(fullPath)) {
    errors.push(`Accessor file missing: ${spec.file}`);
    return errors;
  }

  const content = fs.readFileSync(fullPath, "utf8");

  for (const exportName of spec.requiredExports) {
    // Check for export function or export const
    const exportRe = new RegExp(`export\\s+(function|const|async function)\\s+${exportName}\\b`);
    if (!exportRe.test(content)) {
      errors.push(`Missing export '${exportName}' in ${spec.file}`);
    }
  }

  return errors;
}

function checkNoDeadCode(): string[] {
  const errors: string[] = [];

  // Check that isPHIEncryptionEnabled is fully removed
  for (const spec of ACCESSOR_SPECS) {
    const fullPath = path.join(process.cwd(), spec.file);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, "utf8");
    if (content.includes("isPHIEncryptionEnabled")) {
      errors.push(`Dead code 'isPHIEncryptionEnabled' found in ${spec.file}`);
    }
  }

  return errors;
}

function checkInventoryCompleteness(columns: PHIColumn[]): string[] {
  const errors: string[] = [];

  // Check each required table has at least one ENCRYPTED column
  for (const table of REQUIRED_ENCRYPTED_TABLES) {
    const tableColumns = columns.filter(c => c.table === table);
    const hasEncrypted = tableColumns.some(
      c => c.status === "ENCRYPTED" || c.status.startsWith("DUAL-WRITE")
    );

    if (!hasEncrypted) {
      errors.push(`Table '${table}' has no ENCRYPTED columns in inventory`);
    }
  }

  // Check each ENCRYPTED column has a corresponding accessor
  const coveredTables = new Set(ACCESSOR_SPECS.flatMap(s => s.tables));
  for (const col of columns) {
    if (col.status === "ENCRYPTED" || col.status.startsWith("DUAL-WRITE")) {
      if (!coveredTables.has(col.table)) {
        errors.push(`No accessor configured for encrypted table '${col.table}'`);
      }
    }
  }

  return errors;
}

// =============================================================================
// MAIN
// =============================================================================

/**
 * `--emit-discrepancies` prints the discrepancy set as JSON to stdout and exits 0.
 *
 * It is a REPORTING mode, not a gate: it never decides anything. It exists so a
 * no-regression comparator can compute CONSISTENCY(HEAD) and CONSISTENCY(PROPOSED)
 * with the SAME logic and diff them as sets. The default path below is untouched
 * and remains the full-repo audit.
 *
 * Each string is a stable semantic identity — keyed to the table / column / file
 * that is inconsistent, never to line numbers or output ordering — which is what
 * makes set difference meaningful across two trees.
 *
 * @see docs/governance/FOUNDER_RULING_PHI_INVENTORY_GATE_2026-08-16.md
 */
const EMIT_DISCREPANCIES = process.argv.includes("--emit-discrepancies");

function main() {
  // In emit mode, progress chatter must not contaminate stdout — JSON only.
  const log = EMIT_DISCREPANCIES
    ? (...a: unknown[]) => console.error(...a)
    : (...a: unknown[]) => console.log(...a);

  log("🔍 Checking PHI columns inventory...\n");

  const inventoryPath = path.join(process.cwd(), "docs/security/phi-columns.md");

  if (!fs.existsSync(inventoryPath)) {
    if (EMIT_DISCREPANCIES) {
      // A missing inventory is itself a discrepancy, not a comparator crash.
      process.stdout.write(JSON.stringify(["PHI columns inventory not found: docs/security/phi-columns.md"]) + "\n");
      process.exit(0);
    }
    console.error("❌ PHI columns inventory not found: docs/security/phi-columns.md\n");
    process.exit(1);
  }

  const inventoryContent = fs.readFileSync(inventoryPath, "utf8");
  const columns = parseInventory(inventoryContent);

  log(`   Found ${columns.length} PHI column entries in inventory\n`);

  const errors: string[] = [];

  // Check 1: Accessor files exist and have required exports
  log("   Checking accessor files...");
  for (const spec of ACCESSOR_SPECS) {
    errors.push(...checkAccessorExists(spec));
  }

  // Check 2: No dead code (isPHIEncryptionEnabled)
  log("   Checking for dead code...");
  errors.push(...checkNoDeadCode());

  // Check 3: Inventory completeness
  log("   Checking inventory completeness...\n");
  errors.push(...checkInventoryCompleteness(columns));

  if (EMIT_DISCREPANCIES) {
    // Sorted for stable output; the comparator treats it as a set regardless.
    process.stdout.write(JSON.stringify([...errors].sort()) + "\n");
    process.exit(0);
  }

  if (errors.length > 0) {
    console.error("❌ PHI inventory check failed:\n");
    for (const err of errors) {
      console.error(`   • ${err}`);
    }
    console.error("\n📖 See: docs/security/security-constitution.md\n");
    process.exit(1);
  }

  log("✅ PHI columns inventory check passed.\n");
  log(`   • ${ACCESSOR_SPECS.length} accessor files verified`);
  log(`   • ${REQUIRED_ENCRYPTED_TABLES.length} encrypted tables covered`);
  log(`   • No dead encryption flags found\n`);
}

main();
