// backend
// file: app/api/version/route.ts

import { NextResponse } from "next/server";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

function getCommit(): string {
  // Preferred: injected by CI/deploy
  const envCommit =
    process.env.GIT_COMMIT ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.COMMIT_SHA ||
    process.env.SOURCE_VERSION;

  if (envCommit) return envCommit.slice(0, 8);

  // Fallback: try git (works on self-host where repo exists)
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    // ignore
  }

  // Fallback: read .git/HEAD (works if .git is present)
  try {
    const gitDir = path.join(process.cwd(), ".git");
    const head = fs.readFileSync(path.join(gitDir, "HEAD"), "utf8").trim();

    if (head.startsWith("ref:")) {
      const refPath = head.replace("ref:", "").trim();
      const ref = fs.readFileSync(path.join(gitDir, refPath), "utf8").trim();
      return ref.slice(0, 8);
    }
    return head.slice(0, 8);
  } catch {
    // ignore
  }

  return "unknown";
}

export async function GET() {
  return NextResponse.json({
    commit: getCommit(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV ?? "unknown",
  });
}
