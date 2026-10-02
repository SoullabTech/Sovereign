import { alertTeamAboutAbuse, recordAbuseIncident } from '../abuseDetection';
import { alertSoullabTeam } from '../teenSupportIntegration';

describe('teen human-safety delivery boundary', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('sends abuse alerts through the content-free server boundary', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock as any;

    await alertTeamAboutAbuse({
      severity: 'critical',
      type: 'sexual',
      sessionId: 'session-1',
      ...({ message: 'PRIVATE MEMBER TEXT', patterns: ['sexual'] } as any),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init.body));
    expect(body).toEqual({
      source: 'teen_abuse',
      severity: 'crisis',
      crisisType: 'sexual',
      sessionId: 'session-1',
    });
    expect(JSON.stringify(body)).not.toContain('PRIVATE MEMBER TEXT');
  });

  it('sends teen crisis alerts without member text or client-supplied identity', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock as any;

    await alertSoullabTeam({
      userId: 'member-secret-id',
      age: 16,
      crisisType: 'suicidal_ideation',
      message: 'PRIVATE MEMBER TEXT',
      sessionId: 'session-2',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init.body));
    expect(body).toEqual({
      source: 'teen_crisis',
      severity: 'crisis',
      crisisType: 'suicidal_ideation',
      sessionId: 'session-2',
      age: 16,
    });
    expect(JSON.stringify(body)).not.toContain('PRIVATE MEMBER TEXT');
    expect(JSON.stringify(body)).not.toContain('member-secret-id');
  });

  it('does not let delivery transport failure interrupt the member safety path', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as any;
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(alertTeamAboutAbuse({
      severity: 'critical',
      type: 'physical',
      sessionId: 'session-3',
    })).resolves.toBeUndefined();

    await expect(alertSoullabTeam({
      userId: 'member-id',
      crisisType: 'suicidal_ideation',
      sessionId: 'session-3',
    })).resolves.toBeUndefined();
  });

  it('legacy abuse audit logging cannot leak excess message fields', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await recordAbuseIncident({
      userId: 'member-id',
      type: 'physical',
      severity: 'critical',
      ...({ message: 'PRIVATE MEMBER TEXT', patterns: ['physical'] } as any),
    });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(warn.mock.calls[0])).not.toContain('PRIVATE MEMBER TEXT');
    expect(JSON.stringify(warn.mock.calls[0])).not.toContain('patterns');
  });
});
