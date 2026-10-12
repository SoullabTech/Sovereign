# Writer’s Studio — guarded first-writer pilot integration

Date: 2026-10-12. **ENGINEERING CANDIDATE — NOT DEPLOYED, NOT APPROVED FOR MEMBER DATA WRITES.**
Branch: `feature/ws-jondi-pilot-candidate-20261012`.
Target start: `9520d13691702400c41be8c4652994fbf8a8f30e` (guarded import/return, source-byte durability, dependency security).
Incremental admission: `8da23d0c24` (Publish **preview-only**, Living Compass, writer-owned device copy). Conflicts reconciled against the newer target in four files rather than replacing the later Listen/KDP cover-planner behavior.

## Declared limited-pilot product scope

- Existing, already owned manuscript / Write / Develop / Review / Listen.
- Return to exact Work and chapter, with guarded bare-cover vs chapter selection and preserved focus.
- Explicit **Save a copy** in the Write product bar: TXT/Markdown/section JSON archive; latest in-tab edits. No network, no cloud integration, no automatic backup, no certified re-import.
- **Publish · Preview** visible from Home and top navigation; destination guidance and preliminary preflight; PDF/EPUB generation buttons fail closed by default; no publisher submission, KDP acceptance, automatic rights transfer.
- Writer’s MAIA conversation only within the existing permitted lanes. This candidate does not authorize provider escalation, source uploading or wider access.
- Incoming original and reviewed-source uploads remain held behind the deployed production Linux Caddy fence. An older reader and external publisher routes are not certified solely by this app.

## Important scope exclusion

Two additional pending Writer’s Studio SQL migrations for Work directives and completion checks were **not** brought into this narrower candidate. They remain separately hardened/tested in `feature/ws-beta-migration-custody-20261012`, 39/39 isolated PG16. Automatic production migration of those tables is not implied.
The target contains the preexisting Overview lens migration `20261002000002_writer_studio_chapter_overview_lens.sql`, SHA-256 `d45c56cfc84089f758b477430e8912cd864a549c1129a34ab789d2a1f95afaba`, which remains unapplied to authoritative Linux production. Application compatibility/rollback under old writer `c9e4f7f7e` still requires independent adjudication.

## Engineering regression evidence

- Authenticated synthetic non-founder test: eight checks **PASS** after a real defect was found and repaired. It opened Write with an existing synthetic manuscript, made an explicit device download with **no browser writes or external network**, demonstrated other-member isolation and cleaned up fixture identities. Local receipt: `/tmp/ws-jondi-pilot-rehearsal-20261012/nonfounder-e2e-repaired.log`.
- Repaired defect: carried-over `props.surfaceMode === 'write'` condition never evaluated true in the current Write-only view, hiding Save a copy. Removed retired prop gate. Restored current Shell’s topbar accessory slot and current-host observer; actual authenticated browser verified the control.
- TypeScript no-regression: **PASS**, 222 diagnostics vs 239 baseline, no new errors (not a zero-diagnostic compilation). `/tmp/ws-jondi-pilot-typecheck-20261012.log`.
- Focused Publish, download, and topbar wiring: **16/16** PASS. Actual synthetic Chrome download PASS. Server-rendering route: **12/12** PASS.
- Listen model capture/replay, mic levels and mono routes: **17/17** PASS via Vitest.
- Broad Studio regression: **1,637 passed**, six failing expectations also reproduced on unchanged guarded target `9520d13691` (five inherited suites); no new failing assertions in that comparison set.
- Design canon: **PASS** for 3 staged member-facing surfaces, covered by 5 existing Experience Contracts. CSS syntax verified by PostCSS parser. No Caddy/Docker/production database changes were made to obtain test evidence.
- Test environment: Mac Studio Next.js at localhost:3776, only isolated `maia_ws_beta_witness_20261007` PostgreSQL connection, synthetic identities, zero fixture rows retained, stopped after witness.

## Absolute production release STOP

1. **Writer data restoration:** prove a current, encrypted manuscript/source backup can be independently decrypted and restored, including correct historical-key custody. An encrypted file on NAS / Time Machine alone is not verified restore. New 2026 public/private recovery key is for future archives; it does not unlock older backup archives. Production backup capture/restore must be separately admitted.
2. **Actual production schema:** independently review the remaining Overview migration against the old deployed reader at every overlap and failure prefix, and the final target; no unreviewed DDL.
3. **Security:** verify public and internal ingress, crash-safe custody, source-write fence retention, and rollback with frozen images/manifest.
4. **Independent release reviewer:** exact-file read trace, compatibility/adversarial findings, verdict, actual restore witness and reproducible rollback/health probes. Automated green alone is not independent approval.
5. **Writer identity:** verify that the intended existing member account is controlled by the beta writer and that the linked contact is authorized; **do not match by name alone or create a replacement account**. Private production access metadata is held separately, not in this repository.
6. **End-to-end live acceptance:** final production build, real ordinary member external access, existing-Work return without black screen, write/save/leave/reopen, MAIA voice cutoff reproduction, Listen replay/download, desktop Safari, and mobile iPhone where mobile is offered. Only then admit the first writer.
7. **Founder separate act:** exact image/schema/access/rollback approval; this engineering code/PR and this document are NOT release authority.

### Stop rule

Do not deploy, migrate production schema, reopen source uploads, change member rights, send an invitation, change Caddy, or advertise a successful live beta from these results alone.
