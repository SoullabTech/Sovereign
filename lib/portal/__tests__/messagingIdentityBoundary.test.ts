import { readFileSync } from 'fs';
import { join } from 'path';

const practitionerMessages = readFileSync(
  join(process.cwd(), 'lib/practitioner/messages.ts'),
  'utf8',
);
const portalMessages = readFileSync(
  join(process.cwd(), 'lib/portal/messages.ts'),
  'utf8',
);
const portalRoute = readFileSync(
  join(process.cwd(), 'app/api/portal/[slug]/messages/route.ts'),
  'utf8',
);

describe('PORTAL-MESSAGE-IDENTITY-BOUNDARY-01', () => {
  it('token validation carries practice-record and member identity separately', () => {
    expect(practitionerMessages).toContain('c.practitioner_id AS practitioner_record_id');
    expect(practitionerMessages).toContain('p.member_id AS practitioner_member_id');
    expect(practitionerMessages).toContain('JOIN practitioners p ON p.id = c.practitioner_id');
    expect(practitionerMessages).toContain('practitionerRecordId: tokenRecord.practitioner_record_id');
    expect(practitionerMessages).toContain('practitionerMemberId: tokenRecord.practitioner_member_id');
  });

  it('uses practice-record identity only for practitioner_clients relationship checks', () => {
    const start = portalMessages.indexOf('export async function sendClientMessage(');
    const end = portalMessages.indexOf('/**\n * Get client\'s message history', start);
    const block = portalMessages.slice(start, end);
    expect(block).toContain('WHERE id = $1 AND practitioner_id = $2');
    expect(block).toContain('[clientId, practitionerRecordId]');
    expect(block).not.toContain('[clientId, practitionerMemberId]\n  );\n  if (!clientCheck.rows[0])');
  });

  it('uses practitioner member identity for messaging, PHI, and safety-owned tables', () => {
    const start = portalMessages.indexOf('export async function sendClientMessage(');
    const end = portalMessages.indexOf('/**\n * Get client\'s message history', start);
    const block = portalMessages.slice(start, end);

    expect(block).toContain('[practitionerMemberId, clientId]');
    expect(block).toContain('practitionerId: practitionerMemberId');
    expect(block).toContain('[messageId, clientId, practitionerMemberId');
    expect(block).toContain('verifyEncryptedBody(messageId, practitionerMemberId');
    expect(block).not.toContain('[messageId, clientId, practitionerRecordId');
  });

  it('verifies portal slug against both identities before using the messaging context', () => {
    expect(portalRoute).toContain('SELECT id, member_id FROM practitioners');
    expect(portalRoute).toContain('practitioner.practitionerRecordId !== access.practitioner.practitionerRecordId');
    expect(portalRoute).toContain('practitioner.practitionerMemberId !== access.practitioner.practitionerMemberId');
    expect(portalRoute).toContain('getPortalMessagingContext(access.clientId, access.practitioner)');
  });

  it('uses practitioner member identity for safety logging and notification', () => {
    expect(portalRoute).toContain('logSafetyConcern(\n        access.practitioner.practitionerMemberId');
    expect(portalRoute).toContain('practitionerId: access.practitioner.practitionerMemberId');
    expect(portalRoute).not.toContain('logSafetyConcern(\n        access.practitioner.practitionerRecordId');
  });

  it('does not expose an ambiguous practitionerId from portal token access', () => {
    const start = portalMessages.indexOf('export async function validatePortalAccess(');
    const end = portalMessages.indexOf('// ============================================\n// URGENCY OPTIONS', start);
    const block = portalMessages.slice(start, end);

    expect(block).toContain('practitionerRecordId');
    expect(block).toContain('practitionerMemberId');
    expect(block).not.toContain('practitionerId: result.practitionerId');
  });
});
