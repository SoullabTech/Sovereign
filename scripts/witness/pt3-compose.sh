#!/bin/sh
# PT-3 §VII (B39) — the production Compose invocation, shared by every PT-3 act. POSIX sh.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §VII (B39), §IX.
#
# ⭐ WHY THIS EXISTS. The ordinary deploy path invokes Compose through deploy_ctx_compose():
#
#     docker compose -p maia-sovereign --project-directory "$PROJECT" \
#                    -f "$COMPOSE" --env-file "$PROJECT/.env.production" …
#
# The PT-3 stop / recreate / release acts invoked it as `docker compose -f "$COMPOSE" …`, and that
# is NOT the same interpretation of the same file. `env_file:` and interpolation are different
# mechanisms: `env_file:` hands variables to the CONTAINER, while `${...}` in an `environment:` or
# `ports:` value is resolved by COMPOSE ITSELF, from the shell and --env-file — never from a
# service's env_file. So caddy's `DOMAIN=${DOMAIN:-localhost}` resolves to `localhost` under an
# invocation that omits --env-file, and an `environment:` entry produced by `${...}` overrides the
# value the same service would have loaded through env_file.
#
# The failure mode is therefore: correct PT-3 database authority, wrong unrelated production
# configuration — a cutover that quietly re-pointed the proxy while proving the boundary held.
#
#   A cutover may change AUTHORITY. It may not change CONFIGURATION merely because its Compose
#   invocation differs from the one production is normally interpreted under.
#
# ⛔ The repair is invocation parity, never copying more variables into .env. Duplicating values
# would make the two invocations agree by coincidence; this makes them the same invocation.
#
# Compose file selection follows the same law as deploy_ctx_compose: the file comes from the
# immutable snapshot when one is materialized (so the transition reads the reviewed Compose, not
# whatever the checkout holds), while --project-directory stays on the project dir so runtime files
# — .env.production, bind mounts, volumes — resolve exactly where production keeps them. The
# orchestrator's step 0 has already proven the two are byte-identical.

pt3_compose() {
  _pt3_project="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"
  if [ -n "${MAIA_BUILD_CONTEXT:-}" ] && [ -f "$MAIA_BUILD_CONTEXT/docker-compose.production.yml" ]; then
    _pt3_compose_file="$MAIA_BUILD_CONTEXT/docker-compose.production.yml"
  else
    _pt3_compose_file="$_pt3_project/docker-compose.production.yml"
  fi
  [ -f "$_pt3_compose_file" ] || { echo "ABORT — no production compose file at $_pt3_compose_file" >&2; return 1; }
  [ -f "$_pt3_project/.env.production" ] || {
    echo "ABORT — $_pt3_project/.env.production is absent. Refusing to invoke Compose without the" >&2
    echo "        interpolation environment production is normally interpreted under (B39)." >&2
    return 1; }

  docker compose \
    -p "${MAIA_COMPOSE_PROJECT:-maia-sovereign}" \
    --project-directory "$_pt3_project" \
    -f "$_pt3_compose_file" \
    --env-file "$_pt3_project/.env.production" \
    "$@"
}

# ⭐ §IX — THE EXEMPTION IS AN IDENTITY, NOT A SUBSTRING. `*migrate*` matched any container whose
# name happened to contain the word, which is broader than the law's stated exception: postgres is
# the database itself, and the GOVERNED MIGRATION SERVICE alone may retain owner authority. The
# migrate service declares no container_name, so its identity is the Compose service label — which
# is what an exemption should be keyed on.
pt3_compose_service() {   # container name → its compose service, or empty
  docker inspect -f '{{index .Config.Labels "com.docker.compose.service"}}' "$1" 2>/dev/null || true
}

pt3_is_exempt() {         # container name → 0 if postgres or the governed migration service
  case "$1" in maia-postgres) return 0 ;; esac
  case "$(pt3_compose_service "$1")" in
    postgres|migrate) return 0 ;;
    *) return 1 ;;
  esac
}
