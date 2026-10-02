#!/usr/bin/env node
/**
 * JARVIS-JEV-01 / J1-FRZ1 — F1R3 SUITE FREEZE GUARD
 *
 * Dependency-free. Blob identity governs.
 * Exit 0: FREEZE INTACT
 * Exit 1: FREEZE VIOLATED
 * Exit 2: STALE / INSTRUMENT ERROR
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function git(args, cwd = scriptDir) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

let repoRoot;
try {
  repoRoot = git(["rev-parse", "--show-toplevel"]);
} catch (error) {
  console.error("2 STALE / INSTRUMENT ERROR");
  console.error("cannot resolve repository root: " + error.message);
  process.exit(2);
}
const manifestPath = path.join(
  repoRoot,
  "tests/constitutional/jarvis-jev-j1/FREEZE.json",
);

function instrumentError(message) {
  console.error("2 STALE / INSTRUMENT ERROR");
  console.error(message);
  return 2;
}

function hashPath(relativePath) {
  return git(["hash-object", relativePath], repoRoot);
}

function validBlob(value) {
  return typeof value === "string" && /^[0-9a-f]{40}$/.test(value);
}

function assertManifest(manifest) {
  if (!manifest || typeof manifest !== "object") {
    throw new Error("manifest is not an object");
  }
  if (!manifest.frozen || typeof manifest.frozen !== "object") {
    throw new Error("manifest.frozen is missing or malformed");
  }
  if (Object.keys(manifest.frozen).length === 0) {
    throw new Error("manifest freezes nothing");
  }
  if (!manifest.governing || typeof manifest.governing !== "object") {
    throw new Error("manifest.governing is missing or malformed");
  }
  for (const [name, spec] of Object.entries(manifest.governing)) {
    if (!spec || typeof spec !== "object") {
      throw new Error("governing pin " + name + " is malformed");
    }
    if (typeof spec.path !== "string" || !validBlob(spec.blob)) {
      throw new Error("governing pin " + name + " has invalid path/blob");
    }
  }
  for (const [file, blob] of Object.entries(manifest.frozen)) {
    if (typeof file !== "string" || !validBlob(blob)) {
      throw new Error("frozen entry " + file + " is malformed");
    }
  }
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assertManifest(manifest);
} catch (error) {
  process.exit(instrumentError("manifest failure: " + error.message));
}

console.log("JARVIS-JEV-01 / J1-FRZ1 — FREEZE INTEGRITY");
console.log("identity: git blob hashes");

for (const [name, spec] of Object.entries(manifest.governing)) {
  const absolute = path.join(repoRoot, spec.path);
  if (!fs.existsSync(absolute)) {
    process.exit(instrumentError("governing pin absent: " + name + " -> " + spec.path));
  }
  let live;
  try {
    live = hashPath(spec.path);
  } catch (error) {
    process.exit(instrumentError("cannot hash governing pin " + name + ": " + error.message));
  }
  if (live !== spec.blob) {
    process.exit(
      instrumentError(
        "governing pin changed: " + name + "\n" +
        "  path     " + spec.path + "\n" +
        "  expected " + spec.blob + "\n" +
        "  live     " + live,
      ),
    );
  }
  console.log("GOVERNING OK  " + name + "  " + live);
}

if (manifest.governing.rat1 && manifest.governing.rat1.commit) {
  const commit = manifest.governing.rat1.commit;
  const rat1Path = manifest.governing.rat1.path;
  const rat1Blob = manifest.governing.rat1.blob;
  try {
    git(["cat-file", "-e", commit + "^{commit}"], repoRoot);
    const committedBlob = git(["rev-parse", commit + ":" + rat1Path], repoRoot);
    if (committedBlob !== rat1Blob) {
      process.exit(instrumentError("RAT1 provenance mismatch at " + commit));
    }
  } catch (error) {
    process.exit(instrumentError("cannot resolve RAT1 provenance: " + error.message));
  }
}
for (const [name, commit] of Object.entries(manifest.provenance || {})) {
  if (typeof commit !== "string" || !/^[0-9a-f]{40}$/.test(commit)) {
    process.exit(instrumentError("provenance pin " + name + " is malformed"));
  }
  try {
    git(["cat-file", "-e", commit + "^{commit}"], repoRoot);
  } catch (error) {
    process.exit(instrumentError("cannot resolve provenance pin " + name + ": " + commit));
  }
}

const drift = [];
for (const [file, expected] of Object.entries(manifest.frozen)) {
  const absolute = path.join(repoRoot, file);
  if (!fs.existsSync(absolute)) {
    drift.push({ file, expected, live: "ABSENT" });
    console.error("DRIFT  " + file + "  ABSENT");
    continue;
  }
  let live;
  try {
    live = hashPath(file);
  } catch (error) {
    process.exit(instrumentError("cannot hash frozen path " + file + ": " + error.message));
  }
  if (live !== expected) {
    drift.push({ file, expected, live });
    console.error("DRIFT  " + file);
    console.error("  expected " + expected);
    console.error("  live     " + live);
  } else {
    console.log("FROZEN OK     " + file + "  " + live);
  }
}
if (drift.length > 0) {
  console.error("1 FREEZE VIOLATED");
  console.error("Implementation inconvenience is not authority to edit the frozen instrument.");
  process.exit(1);
}

console.log("0 FREEZE INTACT");
process.exit(0);
