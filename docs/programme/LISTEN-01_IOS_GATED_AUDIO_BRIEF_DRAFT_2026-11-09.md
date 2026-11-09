# LISTEN-01 · iOS gated audio path — design brief

**Status: DESIGN BRIEF. Nothing built or authorized.** Owner lane: LISTEN-01 (#1979). Follows the dark launch
(PR #2199), which moved Sound Studio audio out of `public/` behind `app/media/sound-studio/[...path]`
(flag + verified session + named beta).

## 1. The problem

The iOS app is a static export (`webDir: 'out'`, no `server.url` in beta/prod builds). Before #2199 the recordings
were bundled into the app from `public/`; now they are not, so **Sound Studio cannot play inside the iOS app**.

The obvious fix fails. An `<audio src="https://soullab.life/media/sound-studio/…">` element cannot send the
`x-session-token` header, and the WKWebView's `capacitor://localhost` origin does not send the `SameSite=Lax`
session cookie cross-origin (CLAUDE.md, "Capacitor + cookies"). The gated route would therefore answer 401.

## 2. Options considered

| Option | How | Verdict |
|---|---|---|
| A. Short-lived signed media URL | An authenticated API call (header auth, `apiFetch`) returns a URL carrying an opaque, expiring token; `<audio>` streams it with normal Range requests | **Recommended** |
| B. Fetch as blob | `apiFetch` the file with the header, then play an object URL | Rejected: loads 12–72 MB into memory before playback, no streaming or seeking |
| C. Download to the app sandbox | Save the file locally with the header, then play it | Conflicts with the manifests' `download: false`; needs a founder ruling (see §5) |
| D. Re-bundle the files in the app | As before #2199 | Rejected: shipping unreleased recordings inside a distributed binary is publication |

## 3. Recommended design (A)

1. **Issue:** `POST /api/listen/media-ticket { workId }`, under the same gate (flag + verified session + named beta).
   It returns, for each released file of that work, a URL such as `/media/sound-studio/<path>?t=<ticket>`, plus the ticket expiry.
2. **Ticket:** opaque, encrypted with a server secret (AES-GCM). It holds member id, file path and expiry. **No member
   id or personal data appears readable in the URL.** Lifetime is about 15 minutes, refreshed by the client before
   expiry while playing. It is not shareable beyond its lifetime and is bound to one file.
3. **Serve:** the media route accepts either today's session credentials **or** a valid ticket. With a ticket it still
   re-checks the flag, the member's current beta membership and the file's beta release. An expired, tampered or
   mismatched ticket gets 404.
4. **CORS:** the media route answers `capacitor://localhost` (and `ionic://localhost` if used) with an exact
   `Access-Control-Allow-Origin` and no credentials. No wildcard origin.
5. **Logs:** tickets sit in the query string, so confirm Caddy and app logs do not record query strings for
   `/media/sound-studio/`, or strip them. Short expiry is the backstop, not the control.
6. **Web too:** browsers can use the same ticket URLs, which removes the cookie dependency for audio everywhere.
   Alternatively, keep web on sessions and use tickets only in the native shell. **Recommended: one path for both.**

## 4. Tests to write first

- A ticket for file X does not open file Y; an expired ticket is refused; tampering with one byte is refused.
- A ticket issued while in the beta is refused after the member is removed from the beta list.
- With the flag off, a valid ticket still gets 404.
- The URL contains no readable member id (decode check).
- Range requests work with a ticket (206 with a correct Content-Range).
- CORS allows exactly the app origins and never `*`.
- Mutation checks: removing the expiry check or the re-check of beta membership makes a test fail.
- Device: playback, seek, lock screen and background on a physical iPhone build (still owed under LISTEN-NATIVE-AUDIO-01).

## 5. Open questions (founder)

1. **Ticket for web as well**, or native only? (Recommended: both, one path.)
2. **Native "Play with your music" mix:** AVAudioEngine plays local files, so the native mix needs the file on the
   device. That is a download in substance and conflicts with `download: false`. Options: allow an app-private,
   non-exportable cache that is cleared on Stop or sign-out; or stream the mix through a different native player
   (`AVPlayer` with the ticket URL), which can mix with other apps but loses the gain-staging the founder approved
   on device. Ruling needed before the native mix is wired.
3. **Ticket lifetime:** 15 minutes by default; long Night Ground sessions refresh in the background.

## 6. Not authorized by this brief

Building any of it · a new secret in production env · CORS changes · iOS builds · device distribution.
