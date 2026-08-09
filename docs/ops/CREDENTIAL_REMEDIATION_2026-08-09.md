# Credential Exposure Remediation — 2026-08-09

**Trigger:** live-format Anthropic keys printed to terminal during the Kimi historical trace.
**Scope:** local plaintext credential exposure. **No model routing altered.**
**Key values are never recorded here.** Keys appear only as `sha256[:8]…last4`.

---

## Inventory — 9 distinct Anthropic keys, 8 in world-readable files

| fingerprint | location(s) | pre-fix mode | status |
|---|---|---|---|
| `1a6f4609…nQAA` | `~/.zshrc:70`, `.env.development.local:5` | 644 | **ACTIVE — treat as exposed, rotate first** |
| `823e937d…KQAA` | `MAIA-SOVEREIGN/.env:116`, `.env.staging:42` | 644 / 600 | exposed |
| `19af4b5c…0gAA` | `MAIA-SOVEREIGN/.env.production:41` | 644 | **production — exposed** |
| `44579db9…ewAA` | `MAIA-SOVEREIGN/.env.staging:41` | 600 | staging |
| `2f5d8aa4…CQAA` | `~/.zshrc.backup.20260218-170026:57` | 644 | old |
| `e6391bd9…_KEY` | `~/.zshrc.backup.20251006T221435:1` | 644 | old |
| `edb450ef…bAAA` | `~/.zshrc.bak:10` | 644 | old |
| `a22edffe…JAAA` | `~/.zshrc.bak:15` | 644 | old |
| `85d8deda…GwAA` | `~/.zshrc.bak:17` | 644 | old |
| `62f2ba47…XwAA` | **git history only**, commit `d140c94d8` | — | **matches no local file — already rotated, but revoke if still valid** |

Non-Anthropic: `5da6190d…cdfj` (Moonshot — `~/.kimi-code/config.toml:5`, `.env:118`),
`7086c425…Nc8A` (`.env.production:186`).

## Done

1. **`chmod 600` applied to 14 files** — `~/.zshrc`, `.zshrc.bak`, both `.zshrc.backup.*`,
   `~/.zsh_history`, `~/.maia-env`, `~/.kimi-code/config.toml`, and repo `.env`, `.env.local`,
   `.env.local.bak-labtools-walk`, `.env.development.local`, `.env.production`, `.env.docker`,
   `.env.staging`. Templates (`.env.example`, `.env.docker.template`, `.env.android.template`)
   left 644 — verified to contain no secrets.
2. **Active key moved out of `.zshrc`.** Now in `~/.anthropic-env`, created with mode `600` at open
   time (never briefly world-readable), outside the repo. `.zshrc:70` replaced with a guarded
   `source`. Verified: no raw `sk-ant-` string remains in `.zshrc`; `zsh -n` syntax check passes;
   behavior unchanged.
3. **Git exposure assessed — better than feared.** All `.env*` files are untracked **and**
   gitignored. `.env.staging` has 2 commits in history but **both committed blobs contain zero
   key-format strings**. Across all branches, exactly **one** real key string exists in history
   (`62f2ba47…XwAA`, commit `d140c94d8`), reachable only from `feature/mouth-not-mind-routing` and
   `phase4.4d-analytics-demo` — **not** from `clean-main-no-secrets`. It matches none of the 9 local
   keys, so it was rotated at some point.
4. **Shell history clean.** `~/.zsh_history` and `~/.bash_history` contain **0** key-format strings.
5. **Auth verified intact** — `oauthAccount` is configured in `~/.claude.json`, and this session
   continued running throughout, which is itself live proof.

## ⛔ NOT done — requires you

**I cannot revoke or rotate keys.** That means signing into the Anthropic Console with your account
credentials, which I don't do on your behalf. These are yours to perform:

1. **Revoke `1a6f4609…nQAA`** (the active key) at <https://console.anthropic.com/settings/keys>, create
   a replacement, and put the new value in `~/.anthropic-env` — the file is already in place with the
   correct mode; only the value needs replacing.
2. **Revoke the production and staging keys** `19af4b5c…0gAA`, `823e937d…KQAA`, `44579db9…ewAA`, then
   update `.env.production` / `.env.staging` / `.env` and redeploy. ⚠️ **This will interrupt production
   inference until the new values are deployed** — sequence it deliberately, not mid-session.
3. **Revoke the five historical keys** (`2f5d8aa4`, `e6391bd9`, `edb450ef`, `a22edffe`, `85d8deda`) and
   the git-history key `62f2ba47…XwAA` if any are still valid. Most are likely already dead; confirm
   rather than assume.
4. **Rotate the Moonshot key** `5da6190d…cdfj` — it sat in a 644 file and is duplicated in two places.

## Decisions deferred to you

- **The three `.zshrc` backups** (`~/.zshrc.bak`, two `~/.zshrc.backup.*`) hold 5 dead keys among
  them. They are now `600`. I did **not** delete them — deletion is irreversible and they are the
  only surviving record of the 2026-02-18 local-lane configuration, which is currently under
  historical investigation. **Recommend: keep until that investigation closes, then delete.**
- **`.env.development.local`** carried a duplicate of the active key. Left in place (now `600`) rather
  than edited, since I don't know what reads it.
- **Two non-main branches carry a key in history.** Rewriting or deleting those branches is a
  judgment call, not a cleanup task. If the key is revoked, the exposure is neutralized without
  history surgery.

## Assessment

The realistic exposure is **local-only**: world-readable files on a single-user Mac, plus terminal
output in this session. No key reached a tracked file on the main branch, no key is in shell history,
and nothing was pushed to a public remote. That is materially better than the initial finding
suggested — but *world-readable* means any process running as any user on this machine could read
them, so **rotation is still the correct call**, exactly as you directed. Do not spend effort proving
whether anyone read them.
