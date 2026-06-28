// File a bug into the shared monitor field from the terminal — Claude's own
// awareness, the same field members report into. Writes the bug_reports row
// AND mirrors a notice into the #bugs Co-lab channel (via the service).
//
// Run:
//   npx tsx scripts/report-bug.ts "Journal button opens the wrong page"
//   npx tsx scripts/report-bug.ts "Stream stalls on reconnect" --severity=high --url=/maia --title="voice reconnect"
//
// Requires DATABASE_URL (defaults to the local maia_consciousness DB).

import { createBugReport } from '@/lib/bugs/bugReports';
import { BUG_SEVERITIES, type BugSeverity } from '@/lib/bugs/types';
import { closePool } from '@/lib/db/postgres';

async function main() {
  const argv = process.argv.slice(2);
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) flags[m[1]] = m[2];
    else positional.push(a);
  }

  const message = positional.join(' ').trim();
  if (!message) {
    console.error('usage: npx tsx scripts/report-bug.ts "<message>" [--title=..] [--url=..] [--severity=low|normal|high|critical]');
    process.exit(1);
  }

  const severity: BugSeverity = (BUG_SEVERITIES as string[]).includes(flags.severity)
    ? (flags.severity as BugSeverity)
    : 'normal';

  const bug = await createBugReport({
    message,
    source: 'claude',
    reporterName: 'Claude',
    title: flags.title ?? null,
    url: flags.url ?? null,
    severity,
    context: { filedVia: 'scripts/report-bug.ts' },
  });

  console.log(`🐞 filed bug ${bug.id}`);
  console.log(`   status:   ${bug.status}   severity: ${bug.severity}`);
  console.log(
    `   mirror:   ${bug.mirroredMessageId ? `posted to #${bug.mirrorChannelSlug}` : 'not mirrored (no #bugs channel / no members yet)'}`,
  );
  console.log(`   view:     /admin/monitor?bug=${bug.id}`);
}

main()
  .catch((err) => {
    console.error('[report-bug] failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool().catch(() => {});
  });
