import { fetchReflectAdminStatus, observeReflectReader } from '../reflectAdminRuntimeStatus';

describe('Reflect E010 read-only responding-reader observation', () => {
  const founder = '11111111-1111-4111-8111-111111111111';
  const other = '22222222-2222-4222-8222-222222222222';

  it('reports OFF only when both reader settings are absent or safely disabled', () => {
    for (const flag of [undefined, '', 'false']) {
      const snapshot = observeReflectReader(flag, undefined);
      expect(snapshot.mode).toBe('OFF');
      expect(snapshot.oneAccountConfiguration).toBe('ABSENT');
    }
  });

  it('reports one syntactically valid ID as configured but not admitted', () => {
    const result = observeReflectReader('true', founder);
    expect(result.mode).toBe('CONFIGURED_UNVERIFIED');
    expect(result.oneAccountConfiguration).toBe('SINGLE_FORMAT_VALID');
    expect(result.admissionAndRevocation).toBe('NOT_WITNESSED');
    expect(result.operatorAuthority).toBe('NOT_QUALIFIED');
  });

  it.each([
    ['true', undefined],
    ['true', ''],
    ['true', founder + ',' + other],
    ['true', founder + ',' + founder],
    ['true', ' ' + founder],
    ['true', founder + ' '],
    ['true', 'anything'],
    ['true', '*'],
    ['true', 'AAAAAAAA-1111-4111-8111-111111111111'],
    ['TRUE', founder],
    ['1', founder],
    ['false', founder],
    [undefined, founder],
  ])('holds unsafe or unexpected reader settings: %s / confidential', (flag, members) => {
    expect(observeReflectReader(flag, members).mode).toBe('HOLD_CONFIG_DRIFT');
  });

  it('never leaks a raw member ID or environment value in any result', () => {
    for (const flag of [undefined, 'true', 'false']) {
      for (const members of [undefined, founder, founder + ',' + other, 'super-secret-value']) {
        const publicBody = JSON.stringify(observeReflectReader(flag, members));
        expect(publicBody).not.toContain(founder);
        expect(publicBody).not.toContain(other);
        expect(publicBody).not.toContain('super-secret-value');
        expect(publicBody).not.toContain('PRO_STUDIO_REFLECT_BETA_MEMBER_IDS');
      }
    }
  });

  it('cannot attest release custody, emergency OFF, or founder consent', () => {
    const status = observeReflectReader('true', founder);
    expect(status.observationScope).toBe('RESPONDING_READER_PROCESS_ONLY');
    expect(status.emergencyContainment).toBe('NOT_LIVE_VERIFIED');
    expect(status.admissionAndRevocation).toBe('NOT_WITNESSED');
    expect(status).not.toHaveProperty('approvedForRelease');
    expect(status).not.toHaveProperty('founderMemberId');
    expect(status).not.toHaveProperty('operatorToken');
  });
});

describe('Reflect E010 browser status transport — cookie-first session', () => {
  const status = (code: number) => ({ status: code } as Response);

  it('prefers a valid member cookie and never sends a stale stored header', async () => {
    const fetcher = jest.fn(async (_url: string, _init: RequestInit) => status(200));
    const res = await fetchReflectAdminStatus(fetcher, 'fictional-stale-header');
    expect(res.status).toBe(200);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe('/api/admin/reflect-release-status');
    expect(init.method).toBe('GET');
    expect(init.credentials).toBe('same-origin');
    expect(init.cache).toBe('no-store');
    expect(init.headers).toEqual({ 'Cache-Control': 'no-store' });
  });

  it('falls back to a valid header only after cookie access is refused', async () => {
    const fetcher = jest.fn()
      .mockResolvedValueOnce(status(403))
      .mockResolvedValueOnce(status(200));
    const res = await fetchReflectAdminStatus(fetcher, 'fictional-safari-session');
    expect(res.status).toBe(200);
    expect(fetcher).toHaveBeenCalledTimes(2);
    const first = fetcher.mock.calls[0][1] as RequestInit;
    const second = fetcher.mock.calls[1][1] as RequestInit;
    expect(first.headers).toEqual({ 'Cache-Control': 'no-store' });
    expect(second.headers).toEqual({
      'Cache-Control': 'no-store',
      'x-session-token': 'fictional-safari-session',
    });
    expect(second.credentials).toBe('same-origin');
    expect(second.method).toBe('GET');
  });

  it('does not send a header or retry when no stored token exists', async () => {
    const fetcher = jest.fn().mockResolvedValue(status(403));
    const res = await fetchReflectAdminStatus(fetcher, null);
    expect(res.status).toBe(403);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][1].headers).not.toHaveProperty('x-admin-password');
  });

  it('never retries a failed server observation as a credential fallback', async () => {
    const fetcher = jest.fn().mockResolvedValue(status(503));
    const res = await fetchReflectAdminStatus(fetcher, 'fictional-token');
    expect(res.status).toBe(503);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('a failed Safari header retry remains denied, never displays OFF', async () => {
    const fetcher = jest.fn()
      .mockResolvedValueOnce(status(401))
      .mockResolvedValueOnce(status(403));
    const res = await fetchReflectAdminStatus(fetcher, 'fictional-invalid-token');
    expect(res.status).toBe(403);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('preserves network failure for the UI to classify as unavailable', async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error('fictional-network-outage'));
    await expect(fetchReflectAdminStatus(fetcher, 'fictional-token')).rejects.toThrow('fictional-network-outage');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
