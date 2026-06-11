import { getVapidConfig, isPushConfigured, getVapidPublicKey } from '../config';

describe('push config — dormancy gate', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    delete process.env.VAPID_SUBJECT;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('is dormant when no VAPID env is set', () => {
    expect(getVapidConfig()).toBeNull();
    expect(isPushConfigured()).toBe(false);
    expect(getVapidPublicKey()).toBeNull();
  });

  it('stays dormant until ALL three (public, private, subject) are present', () => {
    process.env.VAPID_PUBLIC_KEY = 'pub';
    expect(isPushConfigured()).toBe(false); // missing private + subject

    process.env.VAPID_PRIVATE_KEY = 'priv';
    expect(isPushConfigured()).toBe(false); // missing subject

    process.env.VAPID_SUBJECT = 'mailto:ops@soullab.life';
    expect(isPushConfigured()).toBe(true);
    expect(getVapidConfig()).toEqual({ publicKey: 'pub', privateKey: 'priv', subject: 'mailto:ops@soullab.life' });
    expect(getVapidPublicKey()).toBe('pub');
  });

  it('exposes only the public key for the runtime endpoint', () => {
    process.env.VAPID_PUBLIC_KEY = 'pub-only';
    // private/subject absent → not fully configured, but the public key is readable
    // (the runtime endpoint guards on isPushConfigured separately).
    expect(getVapidPublicKey()).toBe('pub-only');
  });
});
