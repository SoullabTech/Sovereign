# Ops Follow-ups — 2026-06-10

Two infra follow-ups surfaced during the PR #397 admin-auth deploy + post-deploy verification. Both are **LOW priority** (neither is user-facing right now). Tracked here for assignment; fold into `OPS_BACKLOG.md` if preferred.

**Verified context (2026-06-10):**
- Production host **minisforum**, LAN `192.168.0.102` (drifted from expected `.104`), MAC `38:05:25:34:e9:87`, gateway `192.168.0.1`.
- Public IP for `soullab.life` / `*.soullab.life` = `32.219.7.166` → router → `minisforum:443` → `maia-caddy`.
- `maia-caddy` config is the repo file `/home/soullab/MAIA-SOVEREIGN/Caddyfile` (bind-mounted to `/etc/caddy/Caddyfile`).
- Site is healthy: apex / `maia.` / `app.` all return 200 via caddy. The only 502 noise is OPS-1.

---

## OPS-1 — `marc.soullab.life`: orphaned `app:3000` upstream (decide: retire vs restore)

**Status:** OPEN · **Priority:** Low · **Owner:** _unassigned_ · **Due:** _unset_

**What:** `Caddyfile:642–644` defines `marc.soullab.life { reverse_proxy app:3000 … }` ("Marc Studio — Music Production Site"). No container has the network alias `app`, so **every** request to `marc.soullab.life` returns **502**. A bot (`185.177.72.24`) scans it for PHP exploits → ~2,200 502s / 20 min flooding caddy's error log. This was the source of the false "outage" signal during the #397 deploy.

**Impact:** NOT user-facing (no real user uses `marc.soullab.life`); the 502s are bot noise. But they pollute the error log / future alerting and keep a standing scan target alive.

**Decision required (Kelly):** Marc Studio appears *intended*, not clearly abandoned —
- **(a) Restore:** deploy the `app:3000` backend (Marc Studio) and attach it to caddy's `maia-public` network with alias `app`; or
- **(b) Retire:** remove the `marc.soullab.life` block from the Caddyfile, optionally remove the `marc.soullab.life` DNS A record.

**Steps (retire path — primary fix is the Caddyfile, DNS is secondary):**
1. Remove the `marc.soullab.life { … }` block from `Caddyfile` (repo) → PR → review → deploy.
2. Reload caddy: `docker exec maia-caddy caddy reload --config /etc/caddy/Caddyfile` (or redeploy the caddy service).
3. (Optional) Remove the `marc.soullab.life` A record at the DNS registrar — note a bot can still target the IP+Host directly, so the Caddyfile removal is the effective fix (caddy returns no-match instead of dialing the dead `app:3000`).
4. Confirm: `ssh soullab@minisforum 'docker logs maia-caddy --since 30m 2>&1 | grep -c marc.soullab.life'` trends to 0 new 502s.

---

## OPS-2 — Reserve `192.168.0.104` for minisforum (DHCP + port-forward)

**Status:** OPEN · **Priority:** Low (hygiene) · **Owner:** _unassigned (router admin)_ · **Due:** _unset_

**What:** minisforum's LAN IP drifted to `192.168.0.102` (expected `.104`) via DHCP. Currently **NOT** breaking external reach (router forwards :80/:443 to `.102`; bot + real traffic reach caddy — confirmed via caddy serving external requests). But it's a latent trap: if the port-forward is ever pinned to `.104`, external traffic silently drops (see CLAUDE.md "LAN IP drift").

**Facts:** MAC `38:05:25:34:e9:87` (enp1s0) · current `.102` · target `.104` · gateway `192.168.0.1` · public IP `32.219.7.166`.

**Steps (human — router admin; cannot be done from the codebase or via ssh alone):**
1. Router admin → DHCP → add reservation: MAC `38:05:25:34:e9:87` → `192.168.0.104`.
2. Confirm the :80/:443 port-forward rule targets `192.168.0.104`.
3. Renew minisforum's lease (or reboot) → `ssh soullab@minisforum 'hostname -I'` shows `192.168.0.104`.
4. Verify external reach: `soullab.life` loads from a non-LAN device (phone on cellular).
