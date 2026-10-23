import { renderToStaticMarkup } from 'react-dom/server';
import { headers } from 'next/headers';
import { deriveVerifiedAccess } from '@/lib/auth/verifiedAccess';
import type { NextRequest } from 'next/server';
import { notFound, redirect } from 'next/navigation';
import ReflectArrival from '../page';

jest.mock('next/headers', () => ({ headers: jest.fn() }));
jest.mock('@/lib/auth/verifiedAccess', () => ({ deriveVerifiedAccess: jest.fn() }));
jest.mock('next/navigation', () => ({ redirect: jest.fn(), notFound: jest.fn() }));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    require('react').createElement('a', { href, ...props }, children),
}));

const previousEnabled = process.env.PRO_STUDIO_REFLECT_BETA_ENABLED;
const previousMemberIds = process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS;

describe('Beta-gated Reflect arrival (fictional sessions only)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (headers as jest.Mock).mockResolvedValue(new Headers({
      cookie: 'maia_session=fictional-verified',
    }));
    process.env.PRO_STUDIO_REFLECT_BETA_ENABLED = 'true';
    process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS = 'fiction-only-member';
  });
  afterAll(() => {
    if (previousEnabled === undefined) delete process.env.PRO_STUDIO_REFLECT_BETA_ENABLED;
    else process.env.PRO_STUDIO_REFLECT_BETA_ENABLED = previousEnabled;
    if (previousMemberIds === undefined) delete process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS;
    else process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS = previousMemberIds;
  });

  test('signed-out request is redirected on the server', async () => {
    (deriveVerifiedAccess as jest.Mock).mockResolvedValue({
      authenticated: false, memberId: null, tier: 'free', roles: [],
      reason: 'no_credential',
    });
    (redirect as unknown as jest.Mock).mockImplementation(() => { throw new Error('NEXT_REDIRECT'); });
    await expect(ReflectArrival()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/signin?next=%2Fpro-studio%2Freflect');
  });

  test('verified member without practitioner, clients or team receives MAIA-first entrance', async () => {
    (deriveVerifiedAccess as jest.Mock).mockResolvedValue({
      authenticated: true, memberId: 'fiction-only-member',
      tier: 'free', roles: ['member'],
    });
    const html = renderToStaticMarkup(await ReflectArrival());
    expect(html).toContain('Your work begins with you.');
    expect(html).toContain('href="/maia/encounter"');
    expect(html).toContain('Begin reflecting with MAIA');
    expect(html).not.toContain('Add your first person');
    expect(html).not.toContain('clientId=');
    expect(redirect).not.toHaveBeenCalled();
  });

  test('forwards cookie/header credentials only to the existing verified resolver', async () => {
    (headers as jest.Mock).mockResolvedValue(new Headers({
      cookie: 'maia_session=fictional-cookie-A',
      'x-session-token': 'fictional-header-B',
    }));
    (deriveVerifiedAccess as jest.Mock).mockResolvedValue({
      authenticated: false, memberId: null, tier: 'free', roles: [],
      reason: 'conflicting_credentials',
    });
    (redirect as unknown as jest.Mock).mockImplementation(() => { throw new Error('NEXT_REDIRECT'); });
    await expect(ReflectArrival()).rejects.toThrow('NEXT_REDIRECT');
    const verifiedRequest = (deriveVerifiedAccess as jest.Mock).mock.calls[0]?.[0] as NextRequest;
    expect(verifiedRequest.cookies.get('maia_session')?.value).toBe('fictional-cookie-A');
    expect(verifiedRequest.headers.get('x-session-token')).toBe('fictional-header-B');
    expect(verifiedRequest.headers.get('x-maia-tier')).toBeNull();
    expect(verifiedRequest.nextUrl.searchParams.get('_t')).toBeNull();
  });

  test('arrival explicitly states paid Reflect is not activated', async () => {
    (deriveVerifiedAccess as jest.Mock).mockResolvedValue({
      authenticated: true, memberId: 'fiction-only-member',
      tier: 'free', roles: ['member'],
    });
    const html = renderToStaticMarkup(await ReflectArrival());
    expect(html).toContain('Reflect workspace and its membership permissions are not yet activated');
  });

  test('the preview remains closed when the feature flag is missing', async () => {
    (deriveVerifiedAccess as jest.Mock).mockResolvedValue({
      authenticated: true, memberId: 'fiction-only-member',
      tier: 'free', roles: ['member'],
    });
    delete process.env.PRO_STUDIO_REFLECT_BETA_ENABLED;
    (notFound as unknown as jest.Mock).mockImplementation(() => { throw new Error('NEXT_NOT_FOUND'); });
    await expect(ReflectArrival()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  test('enabled preview remains closed without an explicit member allowlist', async () => {
    (deriveVerifiedAccess as jest.Mock).mockResolvedValue({
      authenticated: true, memberId: 'fiction-only-member',
      tier: 'free', roles: ['member'],
    });
    delete process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS;
    (notFound as unknown as jest.Mock).mockImplementation(() => { throw new Error('NEXT_NOT_FOUND'); });
    await expect(ReflectArrival()).rejects.toThrow('NEXT_NOT_FOUND');
  });

  test('a different authenticated member is refused despite the feature flag', async () => {
    (deriveVerifiedAccess as jest.Mock).mockResolvedValue({
      authenticated: true, memberId: 'other-fictional-member',
      tier: 'free', roles: ['member'],
    });
    (notFound as unknown as jest.Mock).mockImplementation(() => { throw new Error('NEXT_NOT_FOUND'); });
    await expect(ReflectArrival()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
