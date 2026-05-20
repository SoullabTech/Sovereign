#!/usr/bin/env tsx
/**
 * VOICE ECOSYSTEM WATCH
 *
 * Polls GitHub release APIs for the repos listed in
 * scripts/voice-ecosystem-watchlist.json and sends a Telegram digest of
 * *new* releases since the last run to PRACTITIONER_TELEGRAM_CHAT_ID.
 *
 * Signal, not noise: only new releases trigger a digest. On first run,
 * the script initializes the state file without sending alerts (no
 * historical backfill — that would be noise).
 *
 * Scope (intentional narrow):
 *   - reads curated static watchlist
 *   - polls GitHub /releases/latest for each repo
 *   - diffs against scripts/voice-ecosystem-watch-state.json (gitignored)
 *   - sends one concise Telegram digest if any new releases
 *   - updates state file
 *
 * Not in scope (deliberately):
 *   - runtime route changes (none — this is an out-of-band script)
 *   - production behavior change (none — never invoked from app code)
 *   - broad alerting framework (no — drift alarm is a separate module)
 *   - per-commit tracking (only releases — too noisy otherwise)
 *
 * Run:
 *   npx tsx scripts/watch-voice-ecosystem.ts            # poll + send
 *   npx tsx scripts/watch-voice-ecosystem.ts --dry-run  # print, no send
 *   npx tsx scripts/watch-voice-ecosystem.ts --init     # initialize state, no send
 *
 * Schedule example (weekly, Mondays 09:00 host time):
 *   0 9 * * 1 cd ~/MAIA-SOVEREIGN && npx tsx scripts/watch-voice-ecosystem.ts >> /var/log/voice-ecosystem-watch.log 2>&1
 *
 * Reuses lib/comms/providers/TelegramProvider.ts.
 *
 * Env required to send:
 *   TELEGRAM_BOT_TOKEN
 *   PRACTITIONER_TELEGRAM_CHAT_ID
 *
 * If either is missing, the script prints the digest to stdout and exits
 * cleanly (graceful degradation; no broken cron).
 *
 * @see docs/orientation/maia-intelligence-architecture-synthesis.md
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { TelegramProvider } from '../lib/comms/providers/TelegramProvider';

const WATCHLIST_PATH = path.resolve(__dirname, 'voice-ecosystem-watchlist.json');
const STATE_PATH = path.resolve(__dirname, 'voice-ecosystem-watch-state.json');

interface WatchlistRepo {
  repo: string;
  note?: string;
}
interface WatchlistCategory {
  _description?: string;
  repos: WatchlistRepo[];
}
interface Watchlist {
  categories: Record<string, WatchlistCategory>;
}
interface ReleaseInfo {
  tag: string;
  name: string | null;
  published_at: string;
  html_url: string;
}
interface State {
  [repo: string]: { tag: string; published_at: string };
}

function loadWatchlist(): Watchlist {
  const raw = fs.readFileSync(WATCHLIST_PATH, 'utf8');
  return JSON.parse(raw);
}

function loadState(): State {
  if (!fs.existsSync(STATE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveState(state: State): void {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

async function fetchLatestRelease(repo: string): Promise<ReleaseInfo | null> {
  const url = `https://api.github.com/repos/${repo}/releases/latest`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'maia-voice-ecosystem-watch',
        Accept: 'application/vnd.github+json',
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    });
    if (!res.ok) {
      // 404 = no releases yet (use tags? out of scope). Treat as no-release.
      return null;
    }
    const data = (await res.json()) as {
      tag_name?: string;
      name?: string | null;
      published_at?: string;
      html_url?: string;
    };
    if (!data.tag_name || !data.published_at || !data.html_url) return null;
    return {
      tag: data.tag_name,
      name: data.name ?? null,
      published_at: data.published_at,
      html_url: data.html_url,
    };
  } catch {
    return null;
  }
}

interface NewRelease {
  category: string;
  repo: string;
  note: string | undefined;
  release: ReleaseInfo;
  previousTag: string | null;
}

async function pollWatchlist(
  watchlist: Watchlist,
  state: State,
): Promise<{ newReleases: NewRelease[]; updatedState: State }> {
  const newReleases: NewRelease[] = [];
  const updatedState: State = { ...state };

  for (const [category, cat] of Object.entries(watchlist.categories)) {
    for (const entry of cat.repos) {
      const release = await fetchLatestRelease(entry.repo);
      if (!release) continue;

      const prev = state[entry.repo];
      if (!prev || prev.tag !== release.tag) {
        // First-seen or new release
        newReleases.push({
          category,
          repo: entry.repo,
          note: entry.note,
          release,
          previousTag: prev?.tag ?? null,
        });
      }

      updatedState[entry.repo] = {
        tag: release.tag,
        published_at: release.published_at,
      };
    }
  }

  return { newReleases, updatedState };
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDigest(newReleases: NewRelease[]): string {
  const lines: string[] = [];
  lines.push('<b>🎙 Voice ecosystem watch</b>');
  lines.push('');
  lines.push(`<i>${newReleases.length} new release${newReleases.length === 1 ? '' : 's'} since last poll.</i>`);
  lines.push('');

  const byCategory = new Map<string, NewRelease[]>();
  for (const r of newReleases) {
    const arr = byCategory.get(r.category) ?? [];
    arr.push(r);
    byCategory.set(r.category, arr);
  }

  for (const [category, items] of byCategory) {
    lines.push(`<b>${escapeHtml(category)}</b>`);
    for (const it of items) {
      const date = it.release.published_at.slice(0, 10);
      const prevTag = it.previousTag ? ` (was ${escapeHtml(it.previousTag)})` : ' (first seen)';
      lines.push(
        `• <a href="${it.release.html_url}">${escapeHtml(it.repo)}</a> — ${escapeHtml(it.release.tag)}${prevTag} · ${date}`,
      );
      if (it.note) lines.push(`  <i>${escapeHtml(it.note)}</i>`);
    }
    lines.push('');
  }

  lines.push(`<i>${new Date().toISOString()}</i>`);
  return lines.join('\n');
}

async function sendDigest(message: string): Promise<{ sent: boolean; reason?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.PRACTITIONER_TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    return { sent: false, reason: 'TELEGRAM_BOT_TOKEN or PRACTITIONER_TELEGRAM_CHAT_ID not set' };
  }
  const provider = new TelegramProvider();
  const result = await provider.send(
    { to: chatId, bodyText: message } as any,
    { bot_token: botToken },
  );
  if (!result.success) {
    return { sent: false, reason: result.errorMessage ?? 'Telegram send failed' };
  }
  return { sent: true };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const initMode = args.has('--init');

  console.log('🎙 Voice ecosystem watch');
  console.log(`   watchlist: ${WATCHLIST_PATH}`);
  console.log(`   state:     ${STATE_PATH}`);
  console.log(`   mode:      ${initMode ? 'init' : dryRun ? 'dry-run' : 'send'}`);

  const watchlist = loadWatchlist();
  const state = loadState();
  const stateExisted = Object.keys(state).length > 0;

  console.log(`   existing state entries: ${Object.keys(state).length}`);

  const { newReleases, updatedState } = await pollWatchlist(watchlist, state);

  console.log(`   new releases detected:  ${newReleases.length}`);

  // On init mode, or first run with no existing state, baseline silently.
  if (initMode || !stateExisted) {
    saveState(updatedState);
    console.log('   → state initialized, no digest sent (baseline pass)');
    process.exit(0);
  }

  if (newReleases.length === 0) {
    console.log('   → no movement, no digest sent');
    process.exit(0);
  }

  const digest = formatDigest(newReleases);

  if (dryRun) {
    console.log('--- digest (dry-run) ---');
    console.log(digest);
    console.log('--- end digest ---');
    process.exit(0);
  }

  const result = await sendDigest(digest);
  if (!result.sent) {
    console.warn(`   → Telegram not sent: ${result.reason}`);
    console.log('--- digest (would have sent) ---');
    console.log(digest);
    console.log('--- end digest ---');
    // Still save state so we don't keep re-alerting on the same releases.
    saveState(updatedState);
    process.exit(0);
  }

  saveState(updatedState);
  console.log('   ✓ digest sent and state saved');
}

main().catch((err) => {
  console.error('watch-voice-ecosystem failed:', err);
  process.exit(1);
});
