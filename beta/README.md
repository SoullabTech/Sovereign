# beta/ — tester APK distribution

This directory is bind-mounted into the `maia-caddy` container at `/srv/beta`
and exposed publicly at `https://soullab.life/beta/**/*.apk`.

## Why it exists

Google Drive's preview path serves `.apk` files with an inferred MIME based
on a thumbnail render rather than the file extension. On Samsung tablets,
Android's intent resolver then offers only **image apps** (Gallery, Photos,
Canva) to "open" the file instead of the package installer — breaking the
install path entirely. Three consecutive tester rounds failed at this layer
before we moved off Drive.

Serving APKs directly through Caddy with `Content-Type:
application/vnd.android.package-archive` and `Content-Disposition: attachment`
bypasses every MIME-guessing intermediary in the path.

## Layout

```
beta/
├── README.md             # this file
├── .gitignore            # excludes *.apk from git (binaries don't belong in history)
└── tara/                 # per-tester subdirectory
    └── maia-prNN.apk     # current build for this tester (not in git)
```

Subdirectories per tester let us rotate links and revoke access by removing
the file. There's no auth on `/beta/*` — the security model is "unguessable
path" (acceptable for short-lived tester builds; do not put credentials or
production secrets here).

## How to publish a new APK

From the Mac Studio dev environment:

```bash
# 1. Build the APK (see scripts/build-android.sh)
npm run android:build

# 2. Copy to the host's beta directory on minisforum
scp android/app/build/outputs/apk/debug/app-debug.apk \
    soullab@minisforum:~/MAIA-SOVEREIGN/beta/tara/maia-prNN.apk

# 3. Verify the public URL serves with the right Content-Type:
curl -sI https://soullab.life/beta/tara/maia-prNN.apk | grep -i content-type
#  → content-type: application/vnd.android.package-archive
```

No Caddy reload needed — `file_server` reads from disk on every request and
the `Cache-Control: no-store` header forces clients to re-fetch each time.

## Route definition

See the `@beta_apk` matcher and handler block in `../Caddyfile` for the
exact serving rules.
