#!/usr/bin/env bash
# Boot a throwaway local Postgres, apply the Supabase migrations + seeds, and
# dump the resulting content into supabase/dev-fixture.json.
#
# Why: every content row in the live project is still `draft`, and RLS only
# exposes `published` rows, so a local `npm run dev` shows an empty site. The
# seeds are the exact content that was applied to the database, so replaying
# them locally gives us real data to design and verify against.
#
# Usage:  scripts/local_pg.sh
#         KEEP=1 scripts/local_pg.sh   # leave the throwaway server running for debugging
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGBIN="${PGBIN:-/opt/homebrew/opt/postgresql@16/bin}"
PGDATA="${PGDATA:-/tmp/sg-pgdata}"
PGSOCK="${PGSOCK:-/tmp/sg-pgsock}"
PGPORT="${PGPORT:-55432}"
export PATH="$PGBIN:$PATH"
# macOS: postgres refuses to start unless the locale is valid.
# The C locale is used for startup, but the cluster itself is UTF8 so that
# char_length() matches Supabase (a SQL_ASCII cluster counts multi-byte
# characters as several and would fail length checks that pass in production).
export LC_ALL=C

if [ ! -x "$PGBIN/initdb" ]; then
  echo "Postgres not found at $PGBIN — brew install postgresql@16" >&2
  exit 1
fi

rm -rf "$PGDATA" "$PGSOCK"
mkdir -p "$PGDATA" "$PGSOCK"
# a server left behind by an earlier KEEP=1 run must be stopped before its data
# directory is wiped, or psql keeps talking to the old postmaster on the port
pg_ctl -D "$PGDATA" stop -m immediate >/dev/null 2>&1 || true
initdb -D "$PGDATA" -U postgres --auth=trust -E UTF8 --locale=C >/dev/null
pg_ctl -D "$PGDATA" -o "-k $PGSOCK -p $PGPORT -c listen_addresses=''" -l "$PGDATA/server.log" start >/dev/null
cleanup() { [ "${KEEP:-0}" = "1" ] || pg_ctl -D "$PGDATA" stop -m fast >/dev/null 2>&1 || true; }
trap cleanup EXIT

psql() { command psql -h "$PGSOCK" -p "$PGPORT" -U postgres -d postgres -v ON_ERROR_STOP=1 "$@"; }

# Minimal stand-ins for the Supabase auth schema (migrations reference auth.users,
# auth.jwt() and auth.uid()).
psql <<'SQL'
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key default gen_random_uuid(), email text);
create or replace function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid;
$$;
SQL

echo "── applying migrations"
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "   $(basename "$f")"
  psql -q -f "$f" >/dev/null
done

echo "── applying seeds"
for f in "$ROOT"/supabase/seed/*.sql; do
  echo "   $(basename "$f")"
  psql -q -f "$f" >/dev/null
done

echo "── exporting fixture"
python3 "$ROOT/scripts/export_fixture.py" --sock "$PGSOCK" --port "$PGPORT" --out "$ROOT/supabase/dev-fixture.json"
echo "done"
