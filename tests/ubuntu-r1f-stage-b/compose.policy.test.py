"""Ubuntu R1F Stage B static Compose guard. No containers, SQL or network.
Requires PyYAML in the OFFLINE test runner; not an executable safety certificate.
"""
from pathlib import Path
from copy import deepcopy
import unittest
import yaml

ROOT = Path(__file__).resolve().parent
PREP = yaml.safe_load((ROOT / 'compose.preparation.yaml').read_text())
DB = yaml.safe_load((ROOT / 'compose.db-proposal.yaml').read_text())
DIGEST_NODE = chr(36) + '{R1F_NODE_IMAGE_DIGEST:?'
DIGEST_PG = chr(36) + '{R1F_PG_IMAGE_DIGEST:?'


def checks(prep, db):
    ps = prep.get('services', {})
    ds = db.get('services', {})
    p = ps.get('static-preflight', {})
    d = ds.get('pg-fixture', {})
    pm = p.get('volumes', [])
    dm = d.get('volumes', [])
    pe = p.get('environment', {})
    de = d.get('environment', {})
    return {
        'only_preflight': set(ps) == {'static-preflight'},
        'only_future_pg': set(ds) == {'pg-fixture'},
        'preflight_profile': p.get('profiles') == ['stageb-preflight'],
        'pg_different_profile': d.get('profiles') == ['stageb-db-future-authority-required'],
        'preflight_network_disabled': p.get('network_mode') == 'none' and not p.get('networks'),
        'preflight_no_dependency': not p.get('depends_on') and not p.get('links'),
        'preflight_no_ports': p.get('ports') in ([], None) and not p.get('expose'),
        'preflight_one_file_mount': len(pm) == 1 and isinstance(pm[0], dict) and all([
            pm[0].get('source') == './preflight.mjs',
            pm[0].get('target') == '/workspace/preflight.mjs',
            pm[0].get('type') == 'bind',
            pm[0].get('read_only') is True]),
        'preflight_no_privileges': p.get('read_only') is True and p.get('cap_drop') == ['ALL'] and
            'no-new-privileges:true' in p.get('security_opt', []) and not p.get('privileged') and
            not p.get('env_file') and not p.get('build'),
        'preflight_pinned_no_pull': DIGEST_NODE in p.get('image', '') and p.get('pull_policy') == 'never',
        'preflight_command': p.get('command') == ['node', '/workspace/preflight.mjs', '--preflight'],
        'preflight_scope': pe.get('R1F_STAGE_B_SCOPE') == 'FICTIONAL_DISPOSABLE_ONLY' and
            pe.get('R1F_STAGE_B_MODE') == 'PREFLIGHT_ONLY' and
            pe.get('R1F_SOURCE_SHA') == '81ae1edfe592fedac43e458245944e4dd33e9a41' and
            pe.get('R1F_DATABASE_ATTESTATION') == 'NOT_YET_VERIFIED' and
            pe.get('NODE_ENV') == 'test',
        'pg_internal_network': d.get('networks') == ['fictional-only'] and
            db.get('networks', {}).get('fictional-only', {}).get('internal') is True,
        'pg_no_ports': d.get('ports') in ([], None) and not d.get('expose'),
        'pg_no_host_mounts': len(dm) == 1 and isinstance(dm[0], dict) and all([
            dm[0].get('source') == './init/01-fixture-attestation.sql',
            dm[0].get('target') == '/docker-entrypoint-initdb.d/01-fixture-attestation.sql',
            dm[0].get('type') == 'bind', dm[0].get('read_only') is True]),
        'pg_disposable_storage': any(isinstance(x, str) and x.startswith('/var/lib/postgresql/data:')
            for x in d.get('tmpfs', [])),
        'pg_pinned_no_pull': DIGEST_PG in d.get('image', '') and d.get('pull_policy') == 'never',
        'pg_fictional_env': set(de) == {'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB', 'PGDATA'} and
            de.get('POSTGRES_DB') == 'ubuntu_r1f_ephemeral',
        'pg_not_privileged': d.get('read_only') is True and not d.get('privileged') and
            'no-new-privileges:true' in d.get('security_opt', []) and
            not d.get('build') and not d.get('env_file') and not d.get('depends_on'),
    }


class PlanBoundary(unittest.TestCase):
    pass


BASE_CASES = [
    'only_preflight', 'only_future_pg', 'preflight_profile',
    'pg_different_profile', 'preflight_network_disabled',
    'preflight_no_dependency', 'preflight_one_file_mount',
    'pg_internal_network', 'pg_disposable_storage',
]
MUTANTS = [
    ('preflight_no_dependency', lambda p, d: p['services']['static-preflight'].update(
        depends_on={'pg-fixture': {'condition': 'service_healthy'}})),
    ('only_preflight', lambda p, d: p['services'].update(
        {'pg-fixture': deepcopy(d['services']['pg-fixture'])})),
    ('preflight_network_disabled', lambda p, d: p['services']['static-preflight'].update(network_mode='bridge')),
    ('preflight_one_file_mount', lambda p, d: p['services']['static-preflight']['volumes'][0].update(source='../..')),
    ('preflight_command', lambda p, d: p['services']['static-preflight'].update(command=['sh', '-c', 'node anything.js'])),
    ('pg_different_profile', lambda p, d: d['services']['pg-fixture'].update(profiles=['stageb-preflight'])),
    ('pg_internal_network', lambda p, d: d['networks']['fictional-only'].update(internal=False)),
    ('pg_pinned_no_pull', lambda p, d: d['services']['pg-fixture'].update(image='postgres:latest')),
    ('pg_no_host_mounts', lambda p, d: d['services']['pg-fixture']['volumes'][0].update(source='/var/backups')),
    ('preflight_no_ports', lambda p, d: p['services']['static-preflight'].update(ports=['5432:5432'])),
    ('pg_fictional_env', lambda p, d: d['services']['pg-fixture']['environment'].update(POSTGRES_DB='real_member_db')),
]


def add_case(index, key, mutant=None):
    def run(self):
        p, d = deepcopy(PREP), deepcopy(DB)
        if mutant:
            mutant(p, d)
        verdict = checks(p, d)
        self.assertTrue(verdict[key] is (mutant is None), key)
        if mutant is None:
            self.assertTrue(all(verdict.values()), str({k: v for k, v in verdict.items() if not v}))
    setattr(PlanBoundary, 'test_BC{:02}_{}'.format(index, key), run)


for i, item in enumerate(BASE_CASES, 1):
    add_case(i, item)
for i, (key, mutant) in enumerate(MUTANTS, len(BASE_CASES) + 1):
    add_case(i, key, mutant)

if __name__ == '__main__':
    unittest.main(verbosity=2)
