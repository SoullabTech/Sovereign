import { renderToStaticMarkup } from 'react-dom/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { redirect } from 'next/navigation';
import ReflectArrival from '../page';

jest.mock('@/lib/auth/serverSessions', () => ({ getCurrentSession: jest.fn() }));
jest.mock('next/navigation', () => ({ redirect: jest.fn() }));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    require('react').createElement('a', { href, ...props }, children),
}));

describe('R1b Reflect arrival (fictional session only)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
