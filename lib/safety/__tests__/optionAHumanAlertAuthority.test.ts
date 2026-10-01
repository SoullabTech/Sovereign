import fs from 'fs';
import path from 'path';

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Option A human-alert authority', () => {
  it('keeps the general PersonalOracleAgent path explicitly member-only', () => {
    const source = read('lib/agents/PersonalOracleAgent.ts');
    expect(source).toContain(
      "new MAIASafetyPipeline(undefined, undefined, 'member_only')"
    );
  });

  it('requires an explicit clinician-alert mode before human delivery is attempted', () => {
    const source = read('lib/safety-pipeline.ts');
    expect(source).toContain(
      "deliveryMode: 'member_only' | 'clinician_alert' = 'member_only'"
    );
    expect(source).toContain("this.deliveryMode === 'clinician_alert'");
    expect(source).toContain(
      'clinician_alert mode requires both alertService and therapistDb'
    );
  });

  it('contains no executable teen team-alert or abuse-alert stub', () => {
    const conversation = read('components/OracleConversation.tsx');
    const teen = read('lib/safety/teenSupportIntegration.ts');
    const abuse = read('lib/safety/abuseDetection.ts');

    expect(conversation).not.toContain('alertSoullabTeam');
    expect(conversation).not.toContain('alertTeamAboutAbuse');
    expect(conversation).not.toContain('recordAbuseIncident');
    expect(teen).not.toContain('export async function alertSoullabTeam');
    expect(abuse).not.toContain('export async function alertTeamAboutAbuse');
    expect(abuse).not.toContain('export async function recordAbuseIncident');
  });

  it('does not promise hidden human delivery in current youth documentation', () => {
    const quick = read('lib/safety/QUICK_REFERENCE.md');
    const guardian = read('docs/youth/GUARDIAN_CONSENT.md');
    const combined = quick + '\n' + guardian;

    expect(combined).not.toMatch(/team has been notified/i);
    expect(combined).not.toMatch(/team immediately alerted/i);
    expect(combined).not.toMatch(/team member will reach out/i);
    expect(guardian).toContain('DRAFT / NOT IN FORCE');
  });
});
