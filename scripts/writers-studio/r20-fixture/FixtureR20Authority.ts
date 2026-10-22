/**
 * RESEARCH FIXTURE ONLY — NEVER IMPORT IN PRODUCTION ROUTES.
 * Isolated PostgreSQL event history + process-memory Ed25519 signing key.
 * This is NOT immutable WORM custody; a superuser or DB restore can rewrite it.
 */
import { generateKeyPairSync, sign, type KeyObject } from 'node:crypto';
import type { Client } from 'pg';
import {
  R20_WRITER_AUDIENCE, r20ReceiptBytes,
  type R20Claims, type R20PinnedSigner, type R20SignedReceipt,
} from '../../../lib/writersStudio/pilotR20ReceiptProtocol';

const schema = `
  CREATE TABLE r20_fixture_head (
    singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton = TRUE),
    next_epoch BIGINT NOT NULL DEFAULT 1,
    issued_seats INTEGER NOT NULL DEFAULT 0 CHECK (issued_seats BETWEEN 0 AND 2)
  );
  INSERT INTO r20_fixture_head(singleton) VALUES (TRUE);
  CREATE TABLE r20_fixture_events (
    epoch BIGINT PRIMARY KEY,
    member_id UUID NOT NULL,
    grant_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('activated','revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (grant_id, action)
  );
  CREATE OR REPLACE FUNCTION refuse_fixture_event_change()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
  BEGIN
    RAISE EXCEPTION 'r20_fixture_events_are_append_only';
  END $$;
  CREATE TRIGGER r20_fixture_no_change
    BEFORE UPDATE OR DELETE ON r20_fixture_events
    FOR EACH ROW EXECUTE FUNCTION refuse_fixture_event_change();
`;

type EventRow = { epoch: string; action: 'activated' | 'revoked'; member_id: string };

export class FixtureR20Authority {
  private readonly privateKey: KeyObject;
  private readonly publicKeyPem: string;
  private constructor(
    private db: Client,
    readonly issuer: string,
    readonly keyId: string,
  ) {
    const pair = generateKeyPairSync('ed25519');
    this.privateKey = pair.privateKey;
    this.publicKeyPem = pair.publicKey.export({ format: 'pem', type: 'spki' }).toString('utf8');
  }

  static async create(db: Client, issuer: string, keyId: string): Promise<FixtureR20Authority> {
    if (!issuer || !keyId || issuer === keyId) throw new Error('invalid_fixture_identity');
    await db.query(schema);
    return new FixtureR20Authority(db, issuer, keyId);
  }

  /** Simulates recovering a signer over an old DB snapshot with its key intact. */
  useRestoredFixtureDatabase(db: Client): void {
    this.db = db;
  }

  getPinnedSigner(minimumEpoch = 1): R20PinnedSigner {
    return {
      issuer: this.issuer,
      keyId: this.keyId,
      publicKeyPem: this.publicKeyPem,
      minimumEpoch,
    };
  }

  private async latest(memberId: string, grantId: string): Promise<EventRow | null> {
    const r = await this.db.query<EventRow>(
      'SELECT epoch::text, action, member_id::text FROM r20_fixture_events WHERE grant_id=$1 AND member_id=$2 ORDER BY epoch DESC LIMIT 1',
      [grantId, memberId],
    );
    return r.rows[0] ?? null;
  }

  async currentEpoch(memberId: string, grantId: string): Promise<number> {
    const row = await this.latest(memberId, grantId);
    return row ? Number(row.epoch) : 0;
  }

  private async append(
    memberId: string,
    grantId: string,
    action: 'activated' | 'revoked',
  ): Promise<boolean> {
    await this.db.query('BEGIN');
    try {
      const head = await this.db.query<{ next_epoch: string; issued_seats: number }>(
        'SELECT next_epoch::text, issued_seats FROM r20_fixture_head WHERE singleton=TRUE FOR UPDATE',
      );
      const row = head.rows[0];
      if (!row) throw new Error('fixture_authority_head_missing');
      const current = await this.latest(memberId, grantId);
      if (action === 'activated') {
        if (current || row.issued_seats >= 2) {
          await this.db.query('ROLLBACK');
          return false;
        }
      } else if (!current || current.action !== 'activated') {
        await this.db.query('ROLLBACK');
        return false;
      }
      const epoch = Number(row.next_epoch);
      await this.db.query(
        'INSERT INTO r20_fixture_events(epoch, member_id, grant_id, action) VALUES ($1,$2,$3,$4)',
        [epoch, memberId, grantId, action],
      );
      await this.db.query(
        'UPDATE r20_fixture_head SET next_epoch=next_epoch+1, issued_seats=issued_seats+$1 WHERE singleton=TRUE',
        [action === 'activated' ? 1 : 0],
      );
      await this.db.query('COMMIT');
      return true;
    } catch (e) {
      await this.db.query('ROLLBACK');
      throw e;
    }
  }

  /** Fictional operator action, not a production minting API. */
  async activateFixture(memberId: string, grantId: string): Promise<boolean> {
    return this.append(memberId, grantId, 'activated');
  }

  /** Content-free irreversible event in the CURRENT disposable DB only. */
  async revokeFixture(memberId: string, grantId: string): Promise<boolean> {
    return this.append(memberId, grantId, 'revoked');
  }

  /**
   * Private key stays in this process. No fixture network listener,
   * recovery export, environment key, or real-user endpoint is provided.
   */
  signFixtureClaims(claims: R20Claims): R20SignedReceipt {
    return {
      claims,
      signature: sign(null, r20ReceiptBytes(claims), this.privateKey).toString('base64url'),
    };
  }

  async issueFixtureReceipt(
    memberId: string,
    grantId: string,
    nonce: string,
    nowMs: number,
  ): Promise<R20SignedReceipt> {
    const event = await this.latest(memberId, grantId);
    const claims: R20Claims = {
      version: 1,
      audience: R20_WRITER_AUDIENCE,
      issuer: this.issuer,
      keyId: this.keyId,
      memberId,
      grantId,
      status: event?.action === 'activated' ? 'active'
        : event?.action === 'revoked' ? 'revoked' : 'absent',
      epoch: event ? Number(event.epoch) : 0,
      nonce,
      issuedAtMs: nowMs,
      expiresAtMs: nowMs + 15_000,
    };
    return this.signFixtureClaims(claims);
  }
}
