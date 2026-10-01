// node --test scripts/check-migration-lock-timeout.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkMigration } from "./check-migration-lock-timeout.mjs";

const ok = (sql) => assert.equal(checkMigration(sql), null, sql);
const refused = (sql, re) => {
  const r = checkMigration(sql);
  assert.ok(r, `expected refusal for:\n${sql}`);
  assert.match(r, re);
};

test("lawful: SET LOCAL immediately after the file's own BEGIN", () => {
  ok("BEGIN;\nSET LOCAL lock_timeout = '5s';\nALTER TABLE t ADD COLUMN c int;\nCOMMIT;");
  ok("-- header\nBEGIN;\n/* note */ SET LOCAL lock_timeout TO '2000ms';\nCREATE TABLE x(id int);\nCOMMIT;");
});

test("lawful: stated exemption", () => {
  ok("-- lock-timeout: exempt data-only backfill, no DDL\nUPDATE t SET c = 1;");
});

test("DC1: no lock_timeout at all", () => {
  refused("BEGIN;\nALTER TABLE t ADD COLUMN c int;\nCOMMIT;", /second statement must be SET LOCAL/);
});

test("DC2: plain SET leaks across apply-migrations.sh's single session", () => {
  refused("BEGIN;\nSET lock_timeout = '5s';\nALTER TABLE t ADD COLUMN c int;\nCOMMIT;", /not plain SET/);
});

test("DC3: SET LOCAL with no BEGIN is a no-op under apply-migrations.sh", () => {
  refused("SET LOCAL lock_timeout = '5s';\nALTER TABLE t ADD COLUMN c int;", /first statement must be the file's own BEGIN/);
});

test("DC4: timeout set only after the DDL it should bound", () => {
  refused("BEGIN;\nALTER TABLE t ADD COLUMN c int;\nSET LOCAL lock_timeout = '5s';\nCOMMIT;", /second statement must be SET LOCAL/);
});

test("DC5: a zero timeout disables the bound", () => {
  refused("BEGIN;\nSET LOCAL lock_timeout = '0';\nALTER TABLE t ADD COLUMN c int;\nCOMMIT;", /disables the bound/);
});

test("DC6: prose mentioning lock_timeout cannot satisfy the law", () => {
  refused("-- SET LOCAL lock_timeout = '5s';\nBEGIN;\nALTER TABLE t ADD COLUMN c int;\nCOMMIT;", /second statement must be SET LOCAL/);
});

test("DC7: an exemption with no stated reason is not an exemption", () => {
  refused("-- lock-timeout: exempt\nBEGIN;\nALTER TABLE t ADD COLUMN c int;\nCOMMIT;", /second statement/);
});

test("dollar-quoted bodies do not split statements", () => {
  ok("BEGIN;\nSET LOCAL lock_timeout = '5s';\nDO $$ BEGIN PERFORM 1; END $$;\nCOMMIT;");
});
