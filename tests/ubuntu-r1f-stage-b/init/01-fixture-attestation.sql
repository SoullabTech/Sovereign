-- FICTIONAL-ONLY disposable PostgreSQL attestation.
-- NOT a production migration; this is the sole init script in an isolated tmpfs DB.
-- Do not add any real member, source, private, or backup data here.
CREATE ROLE ubuntu_fixture_test LOGIN PASSWORD 'fictional_fixture_only'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
CREATE SCHEMA r1f_attestation AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA r1f_attestation FROM PUBLIC;
GRANT USAGE ON SCHEMA r1f_attestation TO ubuntu_fixture_test;
CREATE TABLE r1f_attestation.disposable_identity (
  id integer PRIMARY KEY CHECK (id = 1),
  fixture_scope text NOT NULL CHECK (fixture_scope = 'FICTIONAL_DISPOSABLE_ONLY'),
  source_commit text NOT NULL CHECK (source_commit = '81ae1edfe592fedac43e458245944e4dd33e9a41')
);
INSERT INTO r1f_attestation.disposable_identity(id, fixture_scope, source_commit)
VALUES (1, 'FICTIONAL_DISPOSABLE_ONLY', '81ae1edfe592fedac43e458245944e4dd33e9a41');
REVOKE ALL ON r1f_attestation.disposable_identity FROM PUBLIC;
GRANT SELECT ON r1f_attestation.disposable_identity TO ubuntu_fixture_test;
-- No application schema and no actual-source service test is installed or executed here.
