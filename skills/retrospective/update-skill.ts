#!/usr/bin/env npx tsx
/**
 * Retrospective Skill — Patch Applier
 *
 * Reads JSON from stdin and applies patches to skill files.
 * Supports both appending to existing files and creating new skill stubs.
 *
 * Usage:
 *   echo '{"patches": [...]}' | npx tsx skills/retrospective/update-skill.ts
 *
 * Or with a file:
 *   cat patches.json | npx tsx skills/retrospective/update-skill.ts
 *
 * Options:
 *   --dry-run    Show what would be changed without writing
 *   --verbose    Show detailed output
 */

import fs from "node:fs";
import path from "node:path";

interface Patch {
  file: string;
  append?: string;
  prepend?: string;
  replace?: { old: string; new: string };
}

interface NewSkill {
  id: string;
  directory: string;
  files: Record<string, string>;
}

interface PatchPayload {
  patches?: Patch[];
  newSkill?: NewSkill;
  prPayload?: {
    branch: string;
    commit: string;
    description: string;
  };
}

const SKILLS_ROOT = path.resolve(process.cwd(), "skills");
const DRY_RUN = process.argv.includes("--dry-run");
const VERBOSE = process.argv.includes("--verbose");

function log(msg: string, level: "info" | "success" | "warn" | "error" = "info") {
  const prefix = {
    info: "ℹ️ ",
    success: "✅",
    warn: "⚠️ ",
    error: "❌",
  }[level];
  console.log(`${prefix} ${msg}`);
}

function verbose(msg: string) {
  if (VERBOSE) {
    console.log(`   ${msg}`);
  }
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

function extractJsonFromText(text: string): string {
  // Try to find JSON block in markdown code fence
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // Try to find raw JSON object
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0];
  }

  return text;
}

function applyPatch(patch: Patch): { success: boolean; message: string } {
  const absPath = path.resolve(process.cwd(), patch.file);

  // Security: ensure we're within skills directory
  if (!absPath.startsWith(SKILLS_ROOT) && !absPath.includes("/skills/")) {
    return {
      success: false,
      message: `Refusing to patch file outside skills directory: ${patch.file}`
    };
  }

  try {
    // Ensure directory exists
    const dir = path.dirname(absPath);
    if (!DRY_RUN) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const exists = fs.existsSync(absPath);
    const current = exists ? fs.readFileSync(absPath, "utf8") : "";

    let newContent = current;
    let action = "";

    if (patch.append) {
      newContent = current + patch.append;
      action = "appended";
    } else if (patch.prepend) {
      newContent = patch.prepend + current;
      action = "prepended";
    } else if (patch.replace) {
      if (!current.includes(patch.replace.old)) {
        return {
          success: false,
          message: `String to replace not found in ${patch.file}`,
        };
      }
      newContent = current.replace(patch.replace.old, patch.replace.new);
      action = "replaced";
    }

    if (DRY_RUN) {
      verbose(`Would write to: ${patch.file}`);
      verbose(`Action: ${action}`);
      if (patch.append) verbose(`Content: ${patch.append.slice(0, 100)}...`);
    } else {
      fs.writeFileSync(absPath, newContent, "utf8");
    }

    return {
      success: true,
      message: `${exists ? "Updated" : "Created"}: ${patch.file} (${action})`,
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to patch ${patch.file}: ${(err as Error).message}`,
    };
  }
}

function createNewSkill(skill: NewSkill): { success: boolean; messages: string[] } {
  const messages: string[] = [];
  const skillDir = path.resolve(process.cwd(), skill.directory);

  // Security check
  if (!skillDir.startsWith(SKILLS_ROOT) && !skillDir.includes("/skills/")) {
    return {
      success: false,
      messages: [`Refusing to create skill outside skills directory: ${skill.directory}`],
    };
  }

  try {
    if (!DRY_RUN) {
      fs.mkdirSync(skillDir, { recursive: true });
    }
    messages.push(`Created directory: ${skill.directory}`);

    for (const [filename, content] of Object.entries(skill.files)) {
      const filePath = path.join(skillDir, filename);
      const fileDir = path.dirname(filePath);

      if (!DRY_RUN) {
        fs.mkdirSync(fileDir, { recursive: true });
        fs.writeFileSync(filePath, content, "utf8");
      }
      messages.push(`Created file: ${path.join(skill.directory, filename)}`);
    }

    return { success: true, messages };
  } catch (err) {
    return {
      success: false,
      messages: [`Failed to create skill: ${(err as Error).message}`],
    };
  }
}

async function main() {
  const raw = await readStdin();

  if (!raw.trim()) {
    log("No input provided on stdin.", "error");
    console.log("\nUsage:");
    console.log('  echo \'{"patches": [...]}\' | npx tsx skills/retrospective/update-skill.ts');
    console.log("\nOptions:");
    console.log("  --dry-run    Show what would be changed without writing");
    console.log("  --verbose    Show detailed output");
    process.exit(1);
  }

  // Extract JSON from potentially markdown-wrapped input
  const jsonStr = extractJsonFromText(raw);

  let payload: PatchPayload;
  try {
    payload = JSON.parse(jsonStr);
  } catch (err) {
    log(`Failed to parse JSON: ${(err as Error).message}`, "error");
    verbose(`Raw input: ${raw.slice(0, 500)}...`);
    process.exit(1);
  }

  if (DRY_RUN) {
    log("DRY RUN MODE - No files will be modified", "warn");
    console.log("");
  }

  let successCount = 0;
  let failCount = 0;

  // Apply patches
  if (payload.patches && payload.patches.length > 0) {
    log(`Applying ${payload.patches.length} patch(es)...`, "info");
    console.log("");

    for (const patch of payload.patches) {
      const result = applyPatch(patch);
      if (result.success) {
        log(result.message, "success");
        successCount++;
      } else {
        log(result.message, "error");
        failCount++;
      }
    }
    console.log("");
  }

  // Create new skill if specified
  if (payload.newSkill) {
    log(`Creating new skill: ${payload.newSkill.id}`, "info");
    console.log("");

    const result = createNewSkill(payload.newSkill);
    for (const msg of result.messages) {
      log(msg, result.success ? "success" : "error");
    }

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
    console.log("");
  }

  // Show PR payload if present
  if (payload.prPayload) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    log("PR Payload (for git operations):", "info");
    console.log(`  Branch: ${payload.prPayload.branch}`);
    console.log(`  Commit: ${payload.prPayload.commit}`);
    console.log(`  Description:\n${payload.prPayload.description}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
  }

  // Summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  log(`Summary: ${successCount} succeeded, ${failCount} failed`, failCount > 0 ? "warn" : "success");

  if (DRY_RUN) {
    log("This was a dry run. Re-run without --dry-run to apply changes.", "info");
  }

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err) => {
  log(`Unexpected error: ${(err as Error).message}`, "error");
  process.exit(1);
});
