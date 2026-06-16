import crypto from 'crypto';
import { mintRoomToken, publishSources } from '../livekitToken';

const KEY = 'APItestkey';
const SECRET = 'a-sufficiently-long-test-secret-value-1234567890';

function decodePayload(jwt: string): Record<string, any> {
  const [, p] = jwt.split('.');
  return JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
}
function signatureValid(jwt: string, secret: string): boolean {
  const [h, p, s] = jwt.split('.');
  const expected = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url');
  return s === expected;
}

describe('publishSources — Sanctuary excludes screen-share at the grant level', () => {
  it('sanctuary: camera + microphone only', () => {
    expect(publishSources(true)).toEqual(['camera', 'microphone']);
  });
  it('non-sanctuary: includes screen_share', () => {
    expect(publishSources(false)).toContain('screen_share');
  });
});

describe('mintRoomToken — LiveKit access-token claims', () => {
  it('signs a verifiable HS256 token with the room grant + server-derived identity', async () => {
    const tok = await mintRoomToken({ apiKey: KEY, apiSecret: SECRET, room: 'sess-1', identity: 'client:cli-1', sanctuary: false });
    expect(signatureValid(tok, SECRET)).toBe(true);
    const payload = decodePayload(tok);
    expect(payload.iss).toBe(KEY);
    expect(payload.sub).toBe('client:cli-1');
    expect(payload.video.room).toBe('sess-1');
    expect(payload.video.roomJoin).toBe(true);
    expect(payload.video.canSubscribe).toBe(true);
    expect(payload.video.canPublishSources).toContain('screen_share');
    expect(payload.video.canPublishData).toBe(false); // least privilege — no data channel
    // The grant must never carry room-management privileges.
    expect(payload.video.roomAdmin).toBeUndefined();
    expect(payload.video.roomCreate).toBeUndefined();
    expect(payload.video.roomList).toBeUndefined();
    expect(typeof payload.exp).toBe('number');
  });

  it('Sanctuary token excludes screen_share at the grant level', async () => {
    const tok = await mintRoomToken({ apiKey: KEY, apiSecret: SECRET, room: 'sess-2', identity: 'client:c2', sanctuary: true });
    expect(decodePayload(tok).video.canPublishSources).toEqual(['camera', 'microphone']);
  });

  it('a token signed with the wrong secret fails the signature check', async () => {
    const tok = await mintRoomToken({ apiKey: KEY, apiSecret: SECRET, room: 'r', identity: 'i', sanctuary: false });
    expect(signatureValid(tok, 'the-wrong-secret-value')).toBe(false);
  });

  it('honors the TTL (exp within the join window)', async () => {
    const tok = await mintRoomToken({ apiKey: KEY, apiSecret: SECRET, room: 'r', identity: 'i', sanctuary: false, ttlSeconds: 900 });
    const payload = decodePayload(tok);
    const now = Math.floor(Date.now() / 1000);
    expect(payload.exp - now).toBeGreaterThan(800);
    expect(payload.exp - now).toBeLessThanOrEqual(900);
  });
});
