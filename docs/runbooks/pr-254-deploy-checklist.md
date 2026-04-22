# PR #254 — Deploy Checklist

> This checklist is specific to PR #254 and should not be reused as a general deploy checklist.

---

## Context

This PR is **additive to #252**.

- #252 = canonical synthesis scaffold (already deployed)
- #254 adds:
  - absent-bundle signaling in builders
  - observability + evaluator (dev-only)
  - Next Signal Loop spec (docs-only)
  - runbooks (this file)

**No schema changes. No migrations required.**

---

## Preconditions

Before deploying:

- [ ] PR #254 is **approved and merged** into `clean-main-no-secrets`
- [ ] No merge conflicts with #252 scaffold
- [ ] CI / checks (if any) have passed
- [ ] You are deploying to **minisForum**, not Mac Studio

---

## Deploy Target

Production host (canonical):

```bash
192.168.0.103 (minisForum)
```

Do **not** deploy from local Mac Studio.
Mac Studio is dev/build only.

---

## Deploy Steps

### 1. SSH into minisForum

```bash
ssh <your-user>@192.168.0.103
```

---

### 2. Navigate to project

```bash
cd ~/MAIA-SOVEREIGN
```

---

### 3. Pull latest code

```bash
git pull
```

Confirm:

* PR #254 commits are present
* branch is up to date with `clean-main-no-secrets`

---

### 4. Rebuild only the maia service

```bash
docker compose -f docker-compose.production.yml up -d --build maia
```

⚠️ Important:

* Use `--build maia` (service name)
* Do **NOT** use `maia-sovereign` (container name)

---

### 5. Verify container is running

```bash
docker ps
```

Confirm:

* `maia-sovereign` container is up
* no restart loop
* status = healthy or running

---

### 6. Verify external health

Use the real serving path (Caddy / HTTP):

```bash
curl -I http://localhost
```

or your known health endpoint.

Expect:

* HTTP 200

---

## Post-Deploy Behavioral Verification

⚠️ Do NOT rely on old UI results.

Old `council_result` rows are cached and will still show pre-fix outputs.

---

### Run fresh consultations

Do at least:

* [ ] 1 new **Changes** consultation
* [ ] 1 new **Decisions** consultation

---

### Verify expected behavior

#### Evidence limits

* [ ] Output includes explicit evidence-limit language:

  * "no evidence bundle"
  * "no field signals"
  * "no observations"
  * OR `### Evidence Limits` section

---

#### No silent inference

* [ ] System does **not** behave as if missing data is normal
* [ ] It acknowledges absence instead of filling gaps

---

#### Recommendation quality

* [ ] Recommendations are still coherent
* [ ] No collapse into overconfident guidance

---

#### Banned phrases

* [ ] No:

  * "remarkably convergent diagnosis"
  * "the real issue is"
  * similar rhetorical authority inflation

---

#### Questions

* [ ] At least one **decision-relevant question** present
* [ ] Not purely reflective filler

---

## Observation Window

After deploy:

* Monitor for **24–72 hours**
* Collect:

  * 2–3 Changes outputs
  * 2–3 Decisions outputs

---

### During observation:

* [ ] Do NOT hotfix based on a single run
* [ ] Watch for patterns, not variance
* [ ] Expect stochastic variation at temp 0.9

---

## Known Non-Issues

Do NOT treat these as bugs:

* Old sessions showing old outputs → expected (cached)
* Variability in:

  * plurality
  * discovery language
  * experimental phrasing
    → stochastic, not structural

---

## Rollback (if needed)

Safe rollback because:

* no schema changes
* no migrations

### Steps:

```bash
git log --oneline
```

Find previous commit (pre-PR #254), then:

```bash
git checkout <previous-commit>
docker compose -f docker-compose.production.yml up -d --build maia
```

---

## Success Criteria

Deployment is successful if:

* [ ] container is healthy
* [ ] fresh consultations show **evidence limits**
* [ ] no banned phrases appear
* [ ] recommendations remain usable
* [ ] no runtime errors

---

## Notes

This PR improves **epistemic discipline**, not feature surface.

Expected user-visible change:

> The system now explicitly names when it lacks evidence, instead of inferring from silence.
