/**
 * Regression tests for the audit logger's failure behavior (2026-07-17).
 *
 * In the production container the audit directory was unwritable (EACCES):
 * the constructor's fire-and-forget ensureLogDirectory() became an unhandled
 * rejection at module load, and every write failed — the audit trail promised
 * by the scribe security patches (#622/#623) was silently empty. These tests
 * pin that a hostile filesystem can degrade the audit trail loudly (console)
 * but can never reject unhandled or take a request path down with it.
 */

const mockAccess = jest.fn();
const mockMkdir = jest.fn();
const mockAppendFile = jest.fn();

jest.mock('fs/promises', () => ({
  __esModule: true,
  default: {
    access: (...a: unknown[]) => mockAccess(...a),
    mkdir: (...a: unknown[]) => mockMkdir(...a),
    appendFile: (...a: unknown[]) => mockAppendFile(...a),
    readdir: jest.fn(async () => []),
    readFile: jest.fn(async () => ''),
  },
}));

const flushMicrotasks = () => new Promise((r) => setImmediate(r));

const eacces = () => Object.assign(new Error('EACCES: permission denied, mkdir'), { code: 'EACCES' });

describe('AuditLogger under an unwritable filesystem', () => {
  let unhandled: unknown[];
  const onUnhandled = (reason: unknown) => unhandled.push(reason);

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    unhandled = [];
    process.on('unhandledRejection', onUnhandled);
  });

  afterEach(() => {
    process.removeListener('unhandledRejection', onUnhandled);
  });

  it('module load does not produce an unhandled rejection when the dir is unwritable', async () => {
    mockAccess.mockRejectedValue(eacces());
    mockMkdir.mockRejectedValue(eacces());
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.isolateModules(() => {
      require('../auditLog');
    });
    await flushMicrotasks();

    expect(unhandled).toHaveLength(0);
    expect(errSpy).toHaveBeenCalledWith(
      expect.stringContaining('[AUDIT CRITICAL]'),
      expect.anything(),
    );
    errSpy.mockRestore();
  });

  it('logAudit resolves (never rejects) when every write fails', async () => {
    mockAccess.mockRejectedValue(eacces());
    mockMkdir.mockRejectedValue(eacces());
    mockAppendFile.mockRejectedValue(eacces());
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    let logAudit: (e: any) => Promise<void>;
    jest.isolateModules(() => {
      ({ logAudit } = require('../auditLog'));
    });

    await expect(
      logAudit!({
        timestamp: new Date('2026-07-17T00:00:00Z'),
        userId: 'member-1',
        action: 'access',
        resource: 'scribe_transcript',
        resourceId: 'session-1',
        ipAddress: '203.0.113.7',
        userAgent: 'test',
        result: 'failure',
        reason: 'unauthenticated',
      }),
    ).resolves.toBeUndefined();

    expect(errSpy).toHaveBeenCalledWith(
      expect.stringContaining('[AUDIT CRITICAL]'),
      expect.anything(),
    );
    errSpy.mockRestore();
  });

  it('writes land in the current date file, recomputed per write (not frozen at boot)', async () => {
    mockAccess.mockResolvedValue(undefined);
    mockAppendFile.mockResolvedValue(undefined);

    let logAudit: (e: any) => Promise<void>;
    jest.isolateModules(() => {
      ({ logAudit } = require('../auditLog'));
    });

    await logAudit!({
      timestamp: new Date(),
      userId: 'member-1',
      action: 'access',
      resource: 'scribe_transcript',
      resourceId: 'session-1',
      ipAddress: '203.0.113.7',
      userAgent: 'test',
      result: 'success',
    });

    const today = new Date().toISOString().split('T')[0];
    expect(mockAppendFile).toHaveBeenCalledWith(
      expect.stringContaining(`audit-${today}.jsonl`),
      expect.stringContaining('"resource":"scribe_transcript"'),
      'utf-8',
    );
  });
});
