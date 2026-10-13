import { renderToStaticMarkup } from 'react-dom/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { notFound, redirect } from 'next/navigation';
import ReflectArrival from '../page';

jest.mock('@/lib/auth/serverSessions', () => ({ getCurrentSession: jest.fn() }));
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
    (getCurrentSession as jest.Mock).mockResolvedValue(null);
    (redirect as jest.Mock).mockImplementation(() => { throw new Error('NEXT_REDIRECT'); });
    await expect(ReflectArrival()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/signin?next=%2Fpro-studio%2Freflect');
  });

  test('verified member without practitioner, clients or team receives MAIA-first entrance', async () => {
    (getCurrentSession as jest.Mock).mockResolvedValue({ memberId: 'fiction-only-member' });
    const html = renderToStaticMarkup(await ReflectArrival());
    expect(html).toContain('Your work begins with you.');
    expect(html).toContain('href="/maia/encounter"');
    expect(html).toContain('Begin reflecting with MAIA');
    expect(html).not.toContain('Add your first person');
    expect(html).not.toContain('clientId=');
    expect(redirect).not.toHaveBeenCalled();
  });

  test('arrival explicitly states paid Reflect is not activated', async () => {
    (getCurrentSession as jest.Mock).mockResolvedValue({ memberId: 'fiction-only-member' });
    const html = renderToStaticMarkup(await ReflectArrival());
    expect(html).toContain('Reflect workspace and its membership permissions are not yet activated');
  });

  test('the preview remains closed when the feature flag is missing', async () => {
    (getCurrentSession as jest.Mock).mockResolvedValue({ memberId: 'fiction-only-member' });
    delete process.env.PRO_STUDIO_REFLECT_BETA_ENABLED;
    (notFound as jest.Mock).mockImplementation(() => { throw new Error('NEXT_NOT_FOUND'); });
    await expect(ReflectArrival()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  test('enabled preview remains closed without an explicit member allowlist', async () => {
    (getCurrentSession as jest.Mock).mockResolvedValue({ memberId: 'fiction-only-member' });
    delete process.env.PRO_STUDIO_REFLECT_BETA_MEMBER_IDS;
    (notFound as jest.Mock).mockImplementation(() => { throw new Error('NEXT_NOT_FOUND'); });
    await expect(ReflectArrival()).rejects.toThrow('NEXT_NOT_FOUND');
  });

  test('a different authenticated member is refused despite the feature flag', async () => {
    (getCurrentSession as jest.Mock).mockResolvedValue({ memberId: 'other-fictional-member' });
    (notFound as jest.Mock).mockImplementation(() => { throw new Error('NEXT_NOT_FOUND'); });
    await expect(ReflectArrival()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
