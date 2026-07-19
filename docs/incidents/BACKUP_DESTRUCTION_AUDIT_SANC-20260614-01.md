# Backup Destruction Audit — SANC-20260614-01 — 2026-07-17

**Ruling**: Kelly K6, 2026-07-17 — approve early destruction of backups containing
confirmed Sanctuary-retained content, prior to normal retention expiration.

**Record (ratified wording)**: *Backups containing confirmed Sanctuary-retained
content were intentionally destroyed prior to normal retention expiration.*

## Continuity preserved BEFORE destruction

Fresh post-deletion backup taken 2026-07-17 18:13 UTC —
`maia_backup_20260717_181311.sql.gz` (295,662,827 bytes, gzip integrity verified).
The live database no longer contains the escaped rows (deleted + count-verified
earlier today), so this dump is clean. Zero-coverage window: none.

## Contaminated set (created BEFORE destruction; no content inspected)

30 nightly dumps, 2026-06-17 → 2026-07-17 02:00 UTC, each containing the
2026-06-14 escaped rows. Location: `~/MAIA-SOVEREIGN/database/backups/` on
minisforum. No off-site copies exist (offsite pipeline not live).

```
73d9efdb3ca567d69a60ff2f99c3b68164e805d66de5f021fd14fdb7ca5b12d6  maia_backup_20260617_020001.sql.gz
b07c66f81734319b5e7839db1e06ea7876129338a2ae906737c54f9aeb8e6167  maia_backup_20260618_020001.sql.gz
96944fb44da4c1f96068d5ea500a7cfe7d42b45c43d516e8bcab63af2272b4b1  maia_backup_20260619_020001.sql.gz
5fce9b9e191b8ddeeef66bdf22404b64b2fb505eda9b86ec842db0ef0b12fd1e  maia_backup_20260620_020001.sql.gz
bc68dc34a4f4c1c784bdb28ca81fe2318df0c30929365bf84b3588ed1ba36031  maia_backup_20260621_020001.sql.gz
84106ec16fcccedea74be5a7e080bdcba0b24fe9f74892a18d7599891f364db4  maia_backup_20260622_020001.sql.gz
f116a04364a9fcb0e281af5587b05a1a91dc25e85d399ace38bc5e38a6011150  maia_backup_20260623_020001.sql.gz
099258407b5fe1b66e39d309321663bfbadae1dbaf66a12f873e66cebc1ca6ff  maia_backup_20260624_020001.sql.gz
5511d656b768d669ff32b86e10c60c84d67e215ea297f5df1b0d518c063ce0d5  maia_backup_20260625_020001.sql.gz
57607eb57ec1017e157464a62d433a222f768602355e06b3a505ac99cc07d7ce  maia_backup_20260626_020001.sql.gz
c95c23f800608178382dc97a1fa1527cf6fa9ec56df1de6114c934f424daf028  maia_backup_20260627_020001.sql.gz
3608e3321fbb311ab360bcd4429f6b09c36254e5dcac51f614bb89e66bf36c36  maia_backup_20260628_020001.sql.gz
94d09067168eb5eaaefa51fcdb430b60e28e75744308776de899b7327794bed8  maia_backup_20260630_020001.sql.gz
3fa55e278876da26fd22dd5e61c32811214372cfb94dfb43ae2718e81312114b  maia_backup_20260701_020001.sql.gz
9727539be927f09781f3773da01d872883e20db6006a80da126ba935abf556d4  maia_backup_20260702_020001.sql.gz
0658c923cedd4f074edb3833b9030cb493588556a20b7be919d9497cecdcc92e  maia_backup_20260703_020001.sql.gz
5a81f160baa2560135385b9acad39eb9201056059b2fe72c99e4139a5c4a4fe3  maia_backup_20260704_020001.sql.gz
4a070d6088bcfa7edd81f5c91353543e9e71f2e317e4bcc1b9cc850b69c74b22  maia_backup_20260705_020001.sql.gz
c303cbf3e9be68db9cfd4b03856e5a03af86023dd34790b98bd4b20a90a3531a  maia_backup_20260706_020002.sql.gz
c34b1fb00429f8aeb3a40c98e5b239043a7535e131a094663d64bb1c2bc05402  maia_backup_20260707_020001.sql.gz
93098316dca3c05d2bfb84e1a85f739bbd06d55cf54d9167b0b7e1100613d71b  maia_backup_20260708_020001.sql.gz
cb308832dc621175a1aed4f4fccd3b2a5913c12fb7d657e87e4231f152bdf4f6  maia_backup_20260709_020001.sql.gz
26bb142e67cdd47ae9266fcf189b8ab4207ff38c82486976ae076c74ad6c2243  maia_backup_20260710_020001.sql.gz
33dcfa110bb800d8da03f3dfbc4a972bb1ae5d1fbc62ed1bc99be24839aa7ad8  maia_backup_20260711_020001.sql.gz
baf8f6d645ddfeedb63e6c6d3cbc8bb040e4840f69fa80f941cd37f3ff6c5af2  maia_backup_20260712_020001.sql.gz
1679e35b9d19acbf5caccd497bd40c4095281794b48ad4ebec7576b07554fce4  maia_backup_20260713_020001.sql.gz
94378947ecd9a76637e0f39c5a1b0d67ff727d5c9611e6b1cd75563f04f3aeaa  maia_backup_20260714_020001.sql.gz
c65592f415248eb217eeec6a74eac3f0d3e6a62d10d33ff0222bf996e24acb66  maia_backup_20260715_020001.sql.gz
b9fb6addc404d48f0c46ff00b97ddeb04bb1c24a58a3d14db24d89d896c9eab9  maia_backup_20260716_020001.sql.gz
d6fc39af56603d040f77abc352eb05e03266c4429ec5b679a007f34d6b855501  maia_backup_20260717_020001.sql.gz
```

## Destruction execution

| Field | Value |
|---|---|
| Executed | 2026-07-17 19:16:16 UTC |
| Operator | Claude Code session, under Kelly ruling K6 (2026-07-17) |
| Method | `rm` of the 30 hashed files in `~/MAIA-SOVEREIGN/database/backups/` on minisforum |
| Pre-destruction state | 31 dumps present (30 contaminated + 1 clean) |
| Post-destruction state | 1 dump: `maia_backup_20260717_181311.sql.gz` (clean, post-deletion, gzip integrity re-verified) |
| Content inspected | none — hashes and file metadata only |
| Sequencing gates met | #629 + #630 merged (`33ec88ac6`) and deployed to production (verified: GIT_COMMIT, oracle-lane 410 probe, refusal marker in compiled bundle) BEFORE destruction |
| Not destroyed (never contaminated) | `episodic_memories_*_20260601_*.sql` (table dumps predating the 2026-06-14 incident); `offsite/` empty (no off-site copies existed) |
| Filesystem caveat | `rm` unlinks; block-level remnants on disk are subject to normal filesystem reuse. No forensic-grade shredding was performed or claimed. |

**Record (ratified wording)**: Backups containing confirmed Sanctuary-retained content
were intentionally destroyed prior to normal retention expiration.

Nightly rotation resumes at the next 02:00 UTC run; all future dumps are of the
post-deletion database and are clean.
