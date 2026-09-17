import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const EXPECTED: Record<string, string> = {
  'standing-envelope.ts': '62dcc0306997eeef86236ed8f8053cb70900c2def0e72ebae2df1c4c47e81f78',
  'claim-standing.ts': 'ae46a42bcc9622d987677a3c270dd447e06137908088efd8cb415f0f3826c053',
  'structural-recovery.ts': 'b8931cdc8c7ca66bbb63b52b0ff4cb60fe364879b3b9d3ce9b0c42689dd7142e',
  'recovery-taxonomy.ts': 'c6faacfeeaa15dba813f8857bf33eef1aca08ccede7e4197a86ae559d3ebf9a5',
  'support-derived-ground.ts': '343bf4b7a10db899054245c65cde234a68ad98fe4332c6dd79546ef9bca55d41',
  'interpretive-basis-envelope.ts': '23b6f840113dd5c39da7051cc815d1a5440d185b76a596463a5986b4ac73da6e',
  'current-turn-basis-envelope.ts': '20494d96a070d015c0dcee36807864d258179faa7d77b067db386d46c2226670',
};

describe('SH-F9 frozen architecture', () => {
  for (const [name, expected] of Object.entries(EXPECTED)) {
    test(`${name} matches d899b3df6 byte-for-byte`, () => {
      const bytes = readFileSync(join(ROOT, 'scripts/research/structural-standing', name));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(expected);
    });
  }
});
