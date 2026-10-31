import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const proxy = fs.readFileSync(path.join(ROOT, 'proxy.ts'), 'utf8');
const admission = fs.readFileSync(
  path.join(ROOT, 'lib/writersStudio/admissionServer.ts'), 'utf8',
);

describe('Writer admission is part of the real server boundary', () => {
  it('uses the server corridor and server admission decision, not a query toggle', () => {
    expect(proxy).toContain("isWriterStudioRestrictedPath(pathname)");
    expect(proxy).toContain('writerStudioAdmissionForMember(verified.memberId)');
    expect(proxy).not.toContain('demoPlan');
  });

  it('runs after verified session authority and before downstream forwarding', () => {
    const verified = proxy.indexOf('await deriveVerifiedAccess(req)');
    const admission = proxy.indexOf('await writerStudioAdmissionForMember(verified.memberId)');
    const forward = proxy.indexOf('const response = forwardSanitized(req, derived)');
    expect(verified).toBeGreaterThan(-1);
    expect(admission).toBeGreaterThan(verified);
    expect(forward).toBeGreaterThan(admission);
  });

  it('distinguishes excluded members from an unavailable authority and never caches either', () => {
    expect(admission).toContain('WRITER_STUDIO_INVITATION_REQUIRED');
    expect(proxy).toContain('code: admission.code');
    expect(proxy).toContain('WRITER_STUDIO_ADMISSION_UNAVAILABLE');
    expect(proxy).toContain("'Cache-Control': 'private, no-store'");
  });
});
