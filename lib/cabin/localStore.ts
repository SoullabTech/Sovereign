import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export type CabinMember = {
  id: string;
  username: string;
  name: string | null;
  preferredName: string | null;
  email: string | null;
  onboarded: boolean;
  onboardingStep: string;
  tier: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  lastSignIn: string | null;
};

export type CabinWork = {
  id: string;
  memberId: string;
  title: string | null;
  purpose: string | null;
  form: string | null;
  stage: string | null;
  manuscriptState: string | null;
  createdAt: string;
  updatedAt: string;
  expressions: CabinExpression[];
};

export type CabinExpression = {
  id: string;
  livingWorkId: string;
  expressionType: string;
  expressionId: string;
  declaredBy: string;
  declaredAt: string;
};

export type CabinManuscript = {
  id: string;
  memberId: string;
  title: string | null;
  provenance: 'member_uploaded' | 'member_written';
  createdAt: string;
};

export type CabinMemoryItem = {
  id: string;
  memberId: string;
  kind: string;
  content: string;
  summary: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CabinHousePreferences = {
  center: string[];
  shortcuts: string[];
  passingThrough: 'shared' | 'quiet';
  revision: number;
};

const SCHEMA_VERSION = 1;

function now(): string {
  return new Date().toISOString();
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function rowMember(row: Record<string, unknown>): CabinMember {
  return {
    id: String(row.id),
    username: String(row.username),
    name: row.name == null ? null : String(row.name),
    preferredName: row.preferred_name == null ? null : String(row.preferred_name),
    email: row.email == null ? null : String(row.email),
    onboarded: Number(row.onboarded) === 1,
    onboardingStep: String(row.onboarding_step),
    tier: String(row.tier),
    roles: JSON.parse(String(row.roles_json)),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    lastSignIn: row.last_sign_in == null ? null : String(row.last_sign_in),
  };
}

function rowExpression(row: Record<string, unknown>): CabinExpression {
  return {
    id: String(row.id),
    livingWorkId: String(row.living_work_id),
    expressionType: String(row.expression_type),
    expressionId: String(row.expression_id),
    declaredBy: String(row.declared_by),
    declaredAt: String(row.declared_at),
  };
}

export class CabinLocalStore {
  readonly db: DatabaseSync;
  readonly path: string;

  constructor(dbPath: string) {
    if (!dbPath) throw new Error('Cabin local database path is required');
    mkdirSync(dirname(dbPath), { recursive: true });
    this.path = dbPath;
    this.db = new DatabaseSync(dbPath, { timeout: 5000 });
    this.db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
    this.initializeSchema();
  }

  private initializeSchema(): void {
    this.db.exec('CREATE TABLE IF NOT EXISTS cabin_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
    this.db.exec("CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, name TEXT, preferred_name TEXT, email TEXT, onboarded INTEGER NOT NULL DEFAULT 0, onboarding_step TEXT NOT NULL DEFAULT 'begin', tier TEXT NOT NULL DEFAULT 'free', roles_json TEXT NOT NULL DEFAULT '[\"member\"]', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, last_sign_in TEXT)");
    this.db.exec('CREATE TABLE IF NOT EXISTS cabin_identity (singleton INTEGER PRIMARY KEY CHECK (singleton = 1), member_id TEXT NOT NULL UNIQUE REFERENCES members(id) ON DELETE RESTRICT)');
    this.db.exec('CREATE TABLE IF NOT EXISTS cabin_sessions (token_hash TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE, created_at TEXT NOT NULL, last_seen TEXT NOT NULL)');
    this.db.exec('CREATE INDEX IF NOT EXISTS cabin_sessions_member_idx ON cabin_sessions(member_id, last_seen DESC)');
    this.db.exec("CREATE TABLE IF NOT EXISTS living_works (id TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id) ON DELETE RESTRICT, title TEXT, purpose TEXT, form TEXT, stage TEXT CHECK (stage IS NULL OR stage IN ('capturing','developing','writing','refining','sharing')), manuscript_state TEXT CHECK (manuscript_state IS NULL OR manuscript_state IN ('pre-manuscript','partial-manuscript','existing-manuscript')), created_at TEXT NOT NULL, updated_at TEXT NOT NULL)");
    this.db.exec('CREATE INDEX IF NOT EXISTS living_works_member_idx ON living_works(member_id, updated_at DESC)');
    this.db.exec("CREATE TABLE IF NOT EXISTS member_manuscripts (id TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id) ON DELETE RESTRICT, title TEXT, provenance TEXT NOT NULL CHECK (provenance IN ('member_uploaded','member_written')), created_at TEXT NOT NULL)");
    this.db.exec('CREATE INDEX IF NOT EXISTS member_manuscripts_member_idx ON member_manuscripts(member_id, created_at DESC)');
    this.db.exec('CREATE TABLE IF NOT EXISTS living_work_expressions (id TEXT PRIMARY KEY, living_work_id TEXT NOT NULL REFERENCES living_works(id) ON DELETE CASCADE, expression_type TEXT NOT NULL, expression_id TEXT NOT NULL, declared_by TEXT NOT NULL REFERENCES members(id) ON DELETE RESTRICT, declared_at TEXT NOT NULL, UNIQUE(living_work_id, expression_type, expression_id))');
    this.db.exec('CREATE INDEX IF NOT EXISTS living_work_expressions_lookup_idx ON living_work_expressions(expression_type, expression_id)');
    this.db.exec('CREATE TABLE IF NOT EXISTS manuscript_sections (id TEXT PRIMARY KEY, manuscript_id TEXT NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE, position INTEGER NOT NULL, heading TEXT, body TEXT NOT NULL, UNIQUE(manuscript_id, position))');
    this.db.exec("CREATE TABLE IF NOT EXISTS house_member_preferences (member_id TEXT PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE, center_ids_json TEXT NOT NULL, shortcut_ids_json TEXT NOT NULL, passing_through TEXT NOT NULL CHECK (passing_through IN ('shared','quiet')), revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0), updated_at TEXT NOT NULL)");
    this.db.exec("CREATE TABLE IF NOT EXISTS cabin_memory_items (id TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE, kind TEXT NOT NULL, content TEXT NOT NULL, summary TEXT, metadata_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL)");
    this.db.exec('CREATE INDEX IF NOT EXISTS cabin_memory_member_idx ON cabin_memory_items(member_id, created_at DESC)');

    const existing = this.db.prepare('SELECT value FROM cabin_meta WHERE key = ?').get('schema_version') as Record<string, unknown> | undefined;
    if (!existing) {
      this.db.prepare('INSERT INTO cabin_meta (key, value) VALUES (?, ?)').run('schema_version', String(SCHEMA_VERSION));
    } else if (Number(existing.value) !== SCHEMA_VERSION) {
      throw new Error('Unsupported Cabin local schema version: ' + String(existing.value));
    }
  }

  close(): void {
    if (this.db.isOpen) this.db.close();
  }

  ensureLocalMember(): CabinMember {
    const existing = this.db
      .prepare('SELECT m.* FROM cabin_identity i JOIN members m ON m.id = i.member_id WHERE i.singleton = 1')
      .get() as Record<string, unknown> | undefined;

    if (existing) return rowMember(existing);

    const memberId = randomUUID();
    const timestamp = now();

    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db
        .prepare("INSERT INTO members (id, username, onboarded, onboarding_step, tier, roles_json, created_at, updated_at) VALUES (?, ?, 0, 'begin', 'free', ?, ?, ?)")
        .run(
          memberId,
          'local-' + memberId.slice(0, 8),
          JSON.stringify(['member']),
          timestamp,
          timestamp,
        );

      this.db
        .prepare('INSERT INTO cabin_identity (singleton, member_id) VALUES (1, ?)')
        .run(memberId);

      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }

    return this.getMember(memberId)!;
  }

  getMember(memberId: string): CabinMember | null {
    const row = this.db
      .prepare('SELECT * FROM members WHERE id = ?')
      .get(memberId) as Record<string, unknown> | undefined;

    return row ? rowMember(row) : null;
  }

  issueSession(memberId: string): string {
    if (!this.getMember(memberId)) throw new Error('CABIN_MEMBER_NOT_FOUND');

    const token = randomBytes(32).toString('base64url');
    const timestamp = now();

    this.db
      .prepare('INSERT INTO cabin_sessions (token_hash, member_id, created_at, last_seen) VALUES (?, ?, ?, ?)')
      .run(hashToken(token), memberId, timestamp, timestamp);

    return token;
  }

  resolveSession(token: string | null): CabinMember | null {
    if (!token) return null;

    const tokenHash = hashToken(token);
    const row = this.db
      .prepare('SELECT m.* FROM cabin_sessions s JOIN members m ON m.id = s.member_id WHERE s.token_hash = ?')
      .get(tokenHash) as Record<string, unknown> | undefined;

    if (!row) return null;

    this.db
      .prepare('UPDATE cabin_sessions SET last_seen = ? WHERE token_hash = ?')
      .run(now(), tokenHash);

    return rowMember(row);
  }

  createWork(
    memberId: string,
    input: {
      title?: string | null;
      purpose?: string | null;
      form?: string | null;
      stage?: string | null;
      manuscriptState?: string | null;
    },
  ): CabinWork {
    if (!this.getMember(memberId)) throw new Error('CABIN_MEMBER_NOT_FOUND');

    const id = randomUUID();
    const timestamp = now();

    this.db
      .prepare('INSERT INTO living_works (id, member_id, title, purpose, form, stage, manuscript_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(
        id,
        memberId,
        input.title ?? null,
        input.purpose ?? null,
        input.form ?? null,
        input.stage ?? null,
        input.manuscriptState ?? null,
        timestamp,
        timestamp,
      );

    return this.getWork(memberId, id)!;
  }

  getWork(memberId: string, workId: string): CabinWork | null {
    const row = this.db
      .prepare('SELECT * FROM living_works WHERE id = ? AND member_id = ?')
      .get(workId, memberId) as Record<string, unknown> | undefined;

    if (!row) return null;

    const expressions = this.db
      .prepare('SELECT * FROM living_work_expressions WHERE living_work_id = ? ORDER BY declared_at ASC')
      .all(workId) as Record<string, unknown>[];

    return {
      id: String(row.id),
      memberId: String(row.member_id),
      title: row.title == null ? null : String(row.title),
      purpose: row.purpose == null ? null : String(row.purpose),
      form: row.form == null ? null : String(row.form),
      stage: row.stage == null ? null : String(row.stage),
      manuscriptState: row.manuscript_state == null ? null : String(row.manuscript_state),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      expressions: expressions.map(rowExpression),
    };
  }

  listWorks(memberId: string): CabinWork[] {
    const rows = this.db
      .prepare('SELECT id FROM living_works WHERE member_id = ? ORDER BY updated_at DESC, created_at DESC')
      .all(memberId) as Record<string, unknown>[];

    return rows
      .map((row) => this.getWork(memberId, String(row.id)))
      .filter((work): work is CabinWork => work !== null);
  }

  updateWork(
    memberId: string,
    workId: string,
    patch: {
      title?: string | null;
      purpose?: string | null;
      form?: string | null;
      stage?: string | null;
      manuscriptState?: string | null;
    },
  ): CabinWork | null {
    if (!this.getMember(memberId)) throw new Error('CABIN_MEMBER_NOT_FOUND');

    const fields: string[] = [];
    const values: (string | null)[] = [];

    if (Object.prototype.hasOwnProperty.call(patch, 'title')) {
      fields.push('title = ?');
      values.push(patch.title ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'purpose')) {
      fields.push('purpose = ?');
      values.push(patch.purpose ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'form')) {
      fields.push('form = ?');
      values.push(patch.form ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'stage')) {
      fields.push('stage = ?');
      values.push(patch.stage ?? null);
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'manuscriptState')) {
      fields.push('manuscript_state = ?');
      values.push(patch.manuscriptState ?? null);
    }

    if (fields.length === 0) return this.getWork(memberId, workId);

    values.push(new Date().toISOString(), workId, memberId);

    this.db
      .prepare('UPDATE living_works SET ' + fields.join(', ') + ', updated_at = ? WHERE id = ? AND member_id = ?')
      .run(...values);

    return this.getWork(memberId, workId);
  }

  deleteWork(memberId: string, workId: string): boolean {
    if (!this.getMember(memberId)) throw new Error('CABIN_MEMBER_NOT_FOUND');

    const result = this.db
      .prepare('DELETE FROM living_works WHERE id = ? AND member_id = ?')
      .run(workId, memberId);

    return Number(result.changes) === 1;
  }

  deleteExpression(
    memberId: string,
    workId: string,
    expressionType: string,
    expressionId: string,
  ): boolean {
    if (!this.getWork(memberId, workId)) return false;

    const result = this.db
      .prepare('DELETE FROM living_work_expressions WHERE living_work_id = ? AND expression_type = ? AND expression_id = ?')
      .run(workId, expressionType, expressionId);

    return Number(result.changes) === 1;
  }

  createManuscript(
    memberId: string,
    input: {
      title?: string | null;
      provenance?: 'member_uploaded' | 'member_written';
    },
  ): CabinManuscript {
    if (!this.getMember(memberId)) throw new Error('CABIN_MEMBER_NOT_FOUND');

    const id = randomUUID();
    const timestamp = now();
    const provenance = input.provenance ?? 'member_written';

    this.db
      .prepare('INSERT INTO member_manuscripts (id, member_id, title, provenance, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(id, memberId, input.title ?? null, provenance, timestamp);

    return this.getManuscript(memberId, id)!;
  }

  getManuscript(memberId: string, manuscriptId: string): CabinManuscript | null {
    const row = this.db
      .prepare('SELECT * FROM member_manuscripts WHERE id = ? AND member_id = ?')
      .get(manuscriptId, memberId) as Record<string, unknown> | undefined;

    if (!row) return null;

    return {
      id: String(row.id),
      memberId: String(row.member_id),
      title: row.title == null ? null : String(row.title),
      provenance: String(row.provenance) as CabinManuscript['provenance'],
      createdAt: String(row.created_at),
    };
  }

  listManuscripts(memberId: string): CabinManuscript[] {
    const rows = this.db
      .prepare('SELECT * FROM member_manuscripts WHERE member_id = ? ORDER BY created_at DESC')
      .all(memberId) as Record<string, unknown>[];

    return rows.map((row) => ({
      id: String(row.id),
      memberId: String(row.member_id),
      title: row.title == null ? null : String(row.title),
      provenance: String(row.provenance) as CabinManuscript['provenance'],
      createdAt: String(row.created_at),
    }));
  }

  deleteManuscript(memberId: string, manuscriptId: string): boolean {
    if (!this.getMember(memberId)) throw new Error('CABIN_MEMBER_NOT_FOUND');

    const result = this.db
      .prepare('DELETE FROM member_manuscripts WHERE id = ? AND member_id = ?')
      .run(manuscriptId, memberId);

    return Number(result.changes) === 1;
  }

  addManuscriptSections(
    memberId: string,
    manuscriptId: string,
    sections: { position: number; heading?: string | null; body: string }[],
  ): void {
    if (!this.getManuscript(memberId, manuscriptId)) {
      throw new Error('CABIN_MANUSCRIPT_NOT_FOUND');
    }

    this.db.exec('BEGIN IMMEDIATE');
    try {
      for (const section of sections) {
        this.db
          .prepare('INSERT INTO manuscript_sections (id, manuscript_id, position, heading, body) VALUES (?, ?, ?, ?, ?)')
          .run(
            randomUUID(),
            manuscriptId,
            section.position,
            section.heading ?? null,
            section.body,
          );
      }
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  listManuscriptSections(
    memberId: string,
    manuscriptId: string,
  ): { id: string; position: number; heading: string | null; body: string }[] {
    if (!this.getManuscript(memberId, manuscriptId)) return [];

    const rows = this.db
      .prepare('SELECT id, position, heading, body FROM manuscript_sections WHERE manuscript_id = ? ORDER BY position ASC')
      .all(manuscriptId) as Record<string, unknown>[];

    return rows.map((row) => ({
      id: String(row.id),
      position: Number(row.position),
      heading: row.heading == null ? null : String(row.heading),
      body: String(row.body),
    }));
  }

  declareExpression(
    memberId: string,
    input: {
      workId: string;
      expressionType: string;
      expressionId: string;
    },
  ): CabinExpression {
    if (!this.getWork(memberId, input.workId)) {
      throw new Error('CABIN_WORK_NOT_FOUND');
    }

    if (
      input.expressionType === 'manuscript' &&
      !this.getManuscript(memberId, input.expressionId)
    ) {
      throw new Error('CABIN_EXPRESSION_NOT_OWNED');
    }

    const id = randomUUID();
    const timestamp = now();

    this.db
      .prepare('INSERT INTO living_work_expressions (id, living_work_id, expression_type, expression_id, declared_by, declared_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(
        id,
        input.workId,
        input.expressionType,
        input.expressionId,
        memberId,
        timestamp,
      );

    return {
      id,
      livingWorkId: input.workId,
      expressionType: input.expressionType,
      expressionId: input.expressionId,
      declaredBy: memberId,
      declaredAt: timestamp,
    };
  }

  worksForManuscript(memberId: string, manuscriptId: string): CabinWork[] {
    if (!this.getManuscript(memberId, manuscriptId)) return [];

    const rows = this.db
      .prepare("SELECT DISTINCT w.id FROM living_works w JOIN living_work_expressions e ON e.living_work_id = w.id WHERE w.member_id = ? AND e.expression_type = 'manuscript' AND e.expression_id = ? ORDER BY w.updated_at DESC")
      .all(memberId, manuscriptId) as Record<string, unknown>[];

    return rows
      .map((row) => this.getWork(memberId, String(row.id)))
      .filter((work): work is CabinWork => work !== null);
  }

  readHousePreferences(memberId: string): CabinHousePreferences | null {
    if (!this.getMember(memberId)) throw new Error('CABIN_MEMBER_NOT_FOUND');

    const row = this.db
      .prepare('SELECT center_ids_json, shortcut_ids_json, passing_through, revision FROM house_member_preferences WHERE member_id = ?')
      .get(memberId) as Record<string, unknown> | undefined;

    if (!row) return null;

    return {
      center: JSON.parse(String(row.center_ids_json)),
      shortcuts: JSON.parse(String(row.shortcut_ids_json)),
      passingThrough: String(row.passing_through) as CabinHousePreferences['passingThrough'],
      revision: Number(row.revision),
    };
  }

  saveHousePreferences(
    memberId: string,
    input: Omit<CabinHousePreferences, 'revision'>,
    expectedRevision: number | null,
  ): CabinHousePreferences {
    if (!this.getMember(memberId)) throw new Error('CABIN_MEMBER_NOT_FOUND');

    const existing = this.readHousePreferences(memberId);

    if (existing && expectedRevision !== existing.revision) {
      throw new Error('CABIN_PREFERENCES_REVISION_CONFLICT');
    }

    const revision = existing ? existing.revision + 1 : 1;

    this.db
      .prepare('INSERT INTO house_member_preferences (member_id, center_ids_json, shortcut_ids_json, passing_through, revision, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(member_id) DO UPDATE SET center_ids_json = excluded.center_ids_json, shortcut_ids_json = excluded.shortcut_ids_json, passing_through = excluded.passing_through, revision = excluded.revision, updated_at = excluded.updated_at')
      .run(
        memberId,
        JSON.stringify(input.center),
        JSON.stringify(input.shortcuts),
        input.passingThrough,
        revision,
        now(),
      );

    return {
      ...input,
      revision,
    };
  }

  appendMemory(
    memberId: string,
    input: {
      kind: string;
      content: string;
      summary?: string | null;
      metadata?: Record<string, unknown>;
    },
  ): CabinMemoryItem {
    if (!this.getMember(memberId)) throw new Error('CABIN_MEMBER_NOT_FOUND');

    const id = randomUUID();
    const timestamp = now();

    this.db
      .prepare('INSERT INTO cabin_memory_items (id, member_id, kind, content, summary, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(
        id,
        memberId,
        input.kind,
        input.content,
        input.summary ?? null,
        JSON.stringify(input.metadata ?? {}),
        timestamp,
      );

    return {
      id,
      memberId,
      kind: input.kind,
      content: input.content,
      summary: input.summary ?? null,
      metadata: input.metadata ?? {},
      createdAt: timestamp,
    };
  }

  listMemory(memberId: string, limit = 50): CabinMemoryItem[] {
    if (!this.getMember(memberId)) throw new Error('CABIN_MEMBER_NOT_FOUND');

    const rows = this.db
      .prepare('SELECT * FROM cabin_memory_items WHERE member_id = ? ORDER BY created_at DESC LIMIT ?')
      .all(memberId, Math.max(1, Math.min(limit, 500))) as Record<string, unknown>[];

    return rows.map((row) => ({
      id: String(row.id),
      memberId: String(row.member_id),
      kind: String(row.kind),
      content: String(row.content),
      summary: row.summary == null ? null : String(row.summary),
      metadata: JSON.parse(String(row.metadata_json)),
      createdAt: String(row.created_at),
    }));
  }

}
