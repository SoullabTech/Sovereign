# Beta Risk Checklist

> Run weekly. Catches silent failures before they cost you weeks.

## Weekly Check (5 minutes)

- [ ] Can a new user sign up with a passkey?
- [ ] Can they receive an invite/recovery email?
- [ ] Can they sign in again from a different session?
- [ ] Can they reach /maia after onboarding?
- [ ] Does a conversation with MAIA complete without error?
- [ ] Are database backups running? (`docker exec maia-postgres pg_dump`)
- [ ] Is the site reachable externally? (`curl https://soullab.life/api/health`)
- [ ] Are all Docker containers healthy? (`docker ps`)

## Monthly Check

- [ ] Can a user export their data?
- [ ] Does Sanctuary Mode actually prevent storage?
- [ ] SSL certificate auto-renewal working? (Caddy handles this)
- [ ] Disk space on Mac Studio adequate?
- [ ] T7 Shield / LaCie still mounted and accessible?

## If Something Fails

1. Note it in `docs/ain-rd-log.md` under a new section
2. Fix it before building anything new
3. Silent failures are more dangerous than missing features
