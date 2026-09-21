#!/usr/bin/env tsx
/**
 * Step 3 host conformance repair witness.
 *
 * The real Claude --json-schema review emitted StructuredOutput after ordinary
 * Read/Grep/Glob events. StructuredOutput formats the response; it cannot read
 * repository content. This witness proves the one observed formatter is
 * non-witnessing while unknown/read-capable channels still fail closed.
 */
import {
  STRICT_COVERAGE, witnessCoverage,
} from "../../../scripts/review-custody-coverage";

const sid = "step3-host";
const root = "/repo";
const line = (name: string, input: Record<string, unknown>) => JSON.stringify({
  type: "assistant",
  session_id: sid,
  message: { content: [{ type: "tool_use", name, input }] },
});
const trace = (...calls: [string, Record<string, unknown>][]) =>
  Buffer.from(calls.map(([name, input]) => line(name, input)).join("\n"), "utf8");

let failures = 0;
const ok = (m: string) => console.log(`  ok:   ${m}`);
const bad = (m: string) => { failures += 1; console.error(`  FAIL: ${m}`); };

console.log("STEP 3 HOST CONFORMANCE — StructuredOutput classification");

const formatted = witnessCoverage(
  { files: ["lib/a.ts"], traceId: sid },
  trace(
    ["Read", { file_path: "/repo/lib/a.ts" }],
    ["StructuredOutput", { result: "{...}" }],
  ),
  STRICT_COVERAGE, root,
);
if (formatted.kind === "witnessed" && formatted.files.join() === "lib/a.ts") {
  ok("observed StructuredOutput formatter does not void a witnessed Read");
} else {
  bad(`StructuredOutput conformance failed: ${JSON.stringify(formatted)}`);
}

const shell = witnessCoverage(
  { files: ["lib/a.ts"], traceId: sid },
  trace(
    ["Read", { file_path: "/repo/lib/a.ts" }],
    ["Bash", { command: "cat lib/b.ts" }],
  ),
  STRICT_COVERAGE, root,
);
if (shell.kind === "refused" && shell.code === "UNWITNESSABLE_READ_CHANNEL") {
  ok("Bash remains fail-closed after the formatter classification");
} else {
  bad(`fail-closed regression: ${JSON.stringify(shell)}`);
}

const unknown = witnessCoverage(
  { files: ["lib/a.ts"], traceId: sid },
  trace(
    ["Read", { file_path: "/repo/lib/a.ts" }],
    ["FutureMysteryTool", { value: "x" }],
  ),
  STRICT_COVERAGE, root,
);
if (unknown.kind === "refused" && unknown.code === "UNWITNESSABLE_READ_CHANNEL") {
  ok("unrecognised tools remain fail-closed");
} else {
  bad(`unknown-tool regression: ${JSON.stringify(unknown)}`);
}

console.log(`\n${3 - failures} passed · ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
