/**
 * STUDIO-A-LA-CARTE-01 Phases 3–4 — the doorway catalogue, host matching and rewrite rule.
 */
import {
  DOORWAYS, doorwayById, doorwayForHost, doorwayRewrite, doorwaysEnabled,
} from '@/lib/studios/doorways';
import {
  generateInvitationCode, hashInvitationCode, normalizeInvitationCode,
} from '@/lib/studios/doorwayInvitations';

describe('catalogue (R2 names)', () => {
  it('names every doorway "<X> Studio" at its own subdomain', () => {
    expect(DOORWAYS.map((d) => [d.subdomain, d.studioName])).toEqual([
      ['writer', 'Writer’s Studio'],
      ['sound', 'Sound Studio'],
      ['guide', 'Guide Studio'],
      ['astrology', 'Astrology Studio'],
    ]);
  });
});

describe('the switch', () => {
  it('opens only on exactly "true"', () => {
    expect(doorwaysEnabled({ STUDIO_DOORWAYS_ENABLED: 'true' })).toBe(true);
    for (const v of [undefined, '', 'false', '1', 'TRUE', ' true']) {
      expect(doorwaysEnabled({ STUDIO_DOORWAYS_ENABLED: v })).toBe(false);
    }
  });
});

describe('host matching', () => {
  it('matches exactly <subdomain>.<root>, with or without a port, any case', () => {
    expect(doorwayForHost('writer.soullab.life')?.id).toBe('writer');
    expect(doorwayForHost('Guide.Soullab.Life:443')?.id).toBe('guide');
    expect(doorwayForHost('astrology.localhost', 'localhost')?.id).toBe('astrology');
  });
  it('⭐ refuses look-alikes, Field slugs and other hosts', () => {
    for (const h of [
      'soullab.life', 'www.soullab.life', 'jondi.soullab.life', 'xwriter.soullab.life', 'writer.x.soullab.life',
      'writer.soullab.life.evil.example', 'writer.soullab.lifex', 'writer', '', null, undefined,
    ]) {
      expect(doorwayForHost(h as string)).toBeNull();
    }
  });
});

describe('rewrite rule', () => {
  const writer = doorwayById('writer')!;
  it('sends / to the public preview and /join to the invitation sign-up', () => {
    expect(doorwayRewrite(writer, '/')).toBe('/explore/writers-studio');
    expect(doorwayRewrite(writer, '/join')).toBe('/doorway/writer');
  });
  it('⭐ leaves every other path alone (normal access rules apply)', () => {
    for (const p of ['/writers-studio', '/signin', '/api/doorway/register', '/join/x', '/maia']) {
      expect(doorwayRewrite(writer, p)).toBeNull();
    }
  });
});

describe('invitation codes', () => {
  it('are prefixed by studio, typable, and differ each time', () => {
    const a = generateInvitationCode('sound');
    const b = generateInvitationCode('sound');
    expect(a).toMatch(/^SOUND-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
    expect(a).not.toBe(b);
  });
  it('hash ignores case, spaces and dashes, and never contains the code', () => {
    const code = 'WRITER-7KQ2-M9XD-4HTP';
    expect(normalizeInvitationCode(' writer 7kq2-m9xd 4htp ')).toBe('WRITER7KQ2M9XD4HTP');
    expect(hashInvitationCode(' writer-7kq2 m9xd-4htp')).toBe(hashInvitationCode(code));
    expect(hashInvitationCode(code)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashInvitationCode(code)).not.toContain('7KQ2');
  });
});
