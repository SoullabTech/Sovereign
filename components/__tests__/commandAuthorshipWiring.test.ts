import fs from 'node:fs';
import path from 'node:path';

const ORACLE = fs.readFileSync(
  path.resolve(process.cwd(), 'components/OracleConversation.tsx'),
  'utf8',
);

describe('TII-03 OracleConversation authorship wiring', () => {
  it('never substitutes command-derived text for the member-authored turn', () => {
    expect(ORACLE).toContain('const authoredText = text;');
    expect(ORACLE).toContain('const canonicalMemberText = attachments?.length ? cleanedText : authoredText;');
    expect(ORACLE).toContain('text: canonicalMemberText');
    expect(ORACLE).toContain('message: canonicalMemberText');
    expect(ORACLE).not.toContain('text = commandCleanedText');
    expect(ORACLE).not.toContain('transcript = voiceMaiaResult.cleanedText');
  });

  it('carries voice command classification into the one canonical text handler', () => {
    expect(ORACLE).toContain('parseResult: voiceMaiaResult');
    expect(ORACLE).toContain("commandsAlreadyApplied: voiceMaiaResult.disposition === 'EXECUTE'");
    expect(ORACLE).toContain('await handleTextMessage(t, undefined, undefined, {');
  });

  it('carries command-adjusted Sanctuary posture without weakening memory exclusion', () => {
    expect(ORACLE).toContain('const effectiveSanctuary =');
    expect(ORACLE).toContain("modeCommand.mode === 'sanctuary'");
    expect(ORACLE).toContain('sanctuary: effectiveSanctuary');
    expect(ORACLE).toContain('oracleAgentId && !effectiveSanctuary');
  });

  it('gives pure commands an F1-only sovereign acceptance path', () => {
    expect(ORACLE).toContain("if (apiEndpoint === '/api/sovereign/app/maia/list')");
    expect(ORACLE).toContain('commandOnly: true');
    expect(ORACLE).toContain('message: canonicalMemberText');
    expect(ORACLE).toContain('memberTurnDurable');
    expect(ORACLE).toContain('return;\n    }\n\n    // On a resend');
  });
});
