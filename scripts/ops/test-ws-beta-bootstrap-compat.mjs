// Source guard for the held R4G compatibility correction. Real PostgreSQL
// absent/present/incompatible/checksum cases are recorded in the review note.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
const migration = readFileSync(resolve('database/migrations/20261013000002_r4g_derivative_ancestry.sql'), 'utf8');
const baseline = readFileSync(resolve('database/baseline/0001_baseline_2026-09-01.sql'), 'utf8');
const runner = readFileSync(resolve('scripts/apply-migrations.sh'), 'utf8');
const sql = migration.replace(/--[^\n]*/g, '');
const block = sql.slice(sql.indexOf('DO $r4g_optional_existing_vector_sink$'));
test('canonical baseline absence is explicit, not replaced by synthetic genesis DDL', () => {
  assert(!baseline.includes('CREATE TABLE "public"."semantic_memory_vectors"'));
  assert(!/CREATE\s+TABLE\b/i.test(sql));
});
test('only an already-existing public vector sink enters the compatibility branch', () => {
  assert(block.includes("IF to_regclass('public.semantic_memory_vectors') IS NULL THEN"));
  assert(block.indexOf('ELSE') < block.indexOf('ALTER TABLE public.semantic_memory_vectors'));
});
test('existing vector rows receive all lineage fields with unknown history', () => {
  for (const name of ['source_exchange_id UUID', 'source_session_id TEXT', "origin_scope TEXT NOT NULL DEFAULT 'unknown'"])
    assert(block.includes('ADD COLUMN IF NOT EXISTS ' + name));
  assert(block.includes("CHECK (origin_scope IN ('ordinary', 'conversation_only', 'unknown'))"));
  assert(block.includes('r4g_semantic_memory_exchange_ancestry_idx'));
});
test('mandatory developmental and breakthrough relations are not made optional', () => {
  const required = sql.slice(0, sql.indexOf('DO $r4g_optional_existing_vector_sink$'));
  assert(required.includes('ALTER TABLE developmental_memories'));
  assert(required.includes('ALTER TABLE breakthrough_moments'));
  assert(!required.includes('to_regclass'));
});
test('incompatible existing relations fail without an exception fallback', () => {
  assert(!/\bEXCEPTION\b/i.test(sql));
  assert(!/\b(?:DROP|TRUNCATE|DELETE|UPDATE|INSERT)\b/i.test(sql));
});
test('full migration stays transactional and preserves checksum refusal', () => {
  assert(sql.trim().startsWith('BEGIN;') && sql.trim().endsWith('COMMIT;'));
  assert(sql.includes("SET LOCAL lock_timeout = '5s'"));
  assert(runner.includes('Migration file changed after it was applied'));
  assert(runner.includes('SELECT 1/0; -- Force error to stop migration'));
});

const restoreFix = readFileSync(resolve('database/migrations/20261014000001_restore_member_tier_function_resolution.sql'), 'utf8').replace(/--[^\n]*/g, '');
test('restore fix changes name resolution only on the existing member-tier trigger', () => {
  assert(restoreFix.includes('ALTER FUNCTION public.update_developmental_tier()'));
  assert(restoreFix.includes('SET search_path TO pg_catalog, public;'));
  assert(!/\b(?:CREATE|DROP|INSERT|UPDATE|DELETE|TRUNCATE|GRANT|REVOKE)\b/i.test(restoreFix));
});
test('restore fix neither rewrites policy nor changes dump or deletion behavior', () => {
  assert(!restoreFix.includes('SECURITY DEFINER'));
  assert(!restoreFix.includes('compute_developmental_tier'));
  assert(restoreFix.trim().startsWith('BEGIN;') && restoreFix.trim().endsWith('COMMIT;'));
});
