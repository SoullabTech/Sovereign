// lib/tree.mjs -- an IMMUTABLE view of a source tree, with in-memory mutation, for the Writer
// original-file intake acceptance instrument.
//
// Plain Node ESM, node: built-ins only (plus ./strip.mjs), zero npm dependencies. The only external
// program is `git`, and only for the 'tracked' / 'commit' sources and trackingState().
//
// WHY: every falsifier needs (a) the real repository text and (b) a way to build a realistic WRONG
// version of it (a "defeat") without touching the repository. A Tree is that: a base + an in-memory
// overlay. Mutation never writes to disk; every mutating method returns a NEW Tree and leaves the
// receiver unchanged.
//
// EXPORTS
//   createTree(root, overlay = {}, options = {}) -> Tree
//   class VacuousMutation   -- a mutation that changed nothing / could not apply (a stale defeat)
//   class VacuousScan       -- listNonEmpty() found nothing (a scan that would pass vacuously)
//   class UnstrippedKind    -- codeStrict() on a file that has no comment stripper
//   class GitUnavailable    -- 'tracked' / 'commit' requested where git cannot answer
//   normalizeRel(rel), stripKindFor(rel, raw?)
//   selfTest() -> { ok, checks }          mutationAudit() -> Promise<{ ok, results }>
//
// THE BASE (options.source) -- WHAT "THE TREE" IS
//   'worktree' (default)  the files on disk under root. This is the MACHINE, not the commit: it includes
//                         untracked and gitignored files (.env.production, coverage/, scratch work) and
//                         therefore differs from machine to machine. Use trackingState() to ask whether a
//                         file is part of the repository at all.
//   'tracked'             the files in the git INDEX (`git ls-files`) that exist on disk; content comes
//                         from the working directory. Untracked and ignored files are invisible.
//   'commit'              the files of ONE COMMIT (options.commit, default 'HEAD'), content read from the
//                         object database: independent of the working directory and of the machine.
//                         provenance().commit is the full SHA. Empty directories do not exist in git.
//   'tracked' and 'commit' FAIL CLOSED (GitUnavailable) when root is not inside a git work tree; they
//   never fall back to the working directory silently.
//   In every source: `.git` (file or directory) is never part of the tree, and symlinks are not members
//   (see KNOWN LIMITS). The overlay sits on top of any base; a null entry deletes.
//
// Tree (all rel paths are relative to the root, '/'-separated; './', '//', 'a/../b' and backslashes
// are normalised; an absolute path or one that escapes the root THROWS):
//   read(rel)            -> string | null          overlay is authoritative (null entry = deleted)
//   code(rel)            -> string | null          comment-stripped when codeKind(rel) !== 'none',
//                                                  RAW otherwise (memoised). Use codeStrict to refuse raw.
//   codeStrict(rel)      -> string | null          like code(), but THROWS UnstrippedKind where no stripper
//                                                  exists (kind 'none'): the safe accessor for scans
//   codeKind(rel)        -> 'ts'|'js'|'jsonc'|'sql'|'yaml'|'sh'|'dockerfile'|'dotenv'|'caddyfile'|'none'
//   codeIssues(rel)      -> [{kind,line}] | null   constructs the stripper could not close. null = "no
//                                                  answer": the file is missing OR its kind is 'none' (no
//                                                  stripper ran, so nothing is known) -- never [] for those
//   exists(rel)          -> boolean                true for a FILE or a DIRECTORY (see isFile/isDir)
//   isFile(rel), isDir(rel)
//   list(prefixDir = '', { ext } = {}) -> sorted rel paths, recursive; skips node_modules, .git,
//                        dist, .next (as directory names below the prefix); ext = '.ts' | ['.ts','.tsx']
//   listNonEmpty(prefixDir, opts)  same, but THROWS VacuousScan on an empty result
//   symlinks(prefixDir = '') -> sorted rel paths of symlinks that are NOT members (not followed)
//   edit(rel, fn)        -> Tree     fn(src) returns new src; THROWS VacuousMutation if unchanged
//   replace(rel, pattern, replacement) -> Tree
//                        string pattern: LITERAL, ALL occurrences, replacement taken literally
//                        (no `$&` expansion); RegExp: its own flags (no `g` = first match only; the
//                        sticky `y` flag is IGNORED) and normal String.replace semantics; function replacement allowed for both.
//                        THROWS VacuousMutation on no match or no net change.
//   add(rel, content)    -> Tree     THROWS VacuousMutation if the file already exists
//   remove(rel)          -> Tree     THROWS VacuousMutation if the file does not exist
//   touched()            -> sorted rel paths that differ from the base by construction (overlay keys)
//   provenance()         -> { source, commit, head, root }   commit = the SHA read ('commit' source, else
//                           null); head = HEAD of the git work tree at root, null where there is none
//   trackingState(rel)   -> 'overlay'|'commit'|'tracked'|'untracked'|'ignored'|'absent'|'no-git'
//                           is this path PART OF THE REPOSITORY? ('untracked'/'ignored' = on disk only;
//                           'no-git' = git cannot answer). This is how a falsifier notices that its own
//                           suite was never committed, or sits under a .gitignore pattern.
//   stats()              -> { diskReads, walks, strips, gitCalls }   (memoisation is observable)
//
// KNOWN LIMITS
//   * The base is read lazily and CACHED for the life of the base tree and its derivatives: if a
//     file changes on disk mid-run the Tree will not notice. The suite treats disk as read-only.
//   * Symlinks are NOT members: not listed, not read (read -> null), not followed (a file reached
//     THROUGH a symlinked directory is invisible too, and list() of a prefix that passes through one
//     is empty). They are reported by symlinks(). This keeps a linked file from counting twice and
//     keeps reads inside the root. (The repository has tracked symlinks, e.g. public/manifest.json:
//     read the link's TARGET path if its content is wanted.)
//   * No path with a `.git` segment is part of any Tree -- on disk, in the overlay (createTree and
//     add() THROW on one) or in a commit. In a linked worktree `.git` is a FILE holding an absolute
//     machine path; it is hidden like the directory.
//   * code() strips comments for ts/mts/cts/tsx/jsx/js/mjs/cjs/json(c)/sql/yml/yaml/sh/bash/Dockerfile
//     (Dockerfile, Dockerfile.*, *.dockerfile, Containerfile*)/.env (.env, .env.*, *.env)/Caddyfile
//     (Caddyfile, Caddyfile.*, *.caddyfile). Everything else (.md, .toml, .conf, .zsh, .txt ...) is
//     returned RAW and codeKind() says 'none'; codeIssues() is then null (NOT []) and codeStrict()
//     throws UnstrippedKind. An extensionless file whose first line is a sh/bash/dash/ash shebang
//     (also `env bash`) is read as 'sh'; zsh/ksh are not stripped. A name that looks like one of the
//     families but carries a document extension (`Dockerfile.md`, `.env.example.md`) is 'none'.
//   * .ts/.mts/.cts are stripped with JSX detection OFF (`<T>x` is a cast there); .tsx/.jsx/.js/
//     .mjs/.cjs with it ON. See strip.mjs for the heuristics' limits.
//   * YAML is stripped with block scalars preserved EXCEPT the body of a `run:` key, which is shell
//     and is stripped with the shell stripper (`# documented absence of X` inside a workflow step no
//     longer matches). Block scalars under any other key (`body: |`, `script: |`, ...) stay verbatim.
//     Shell constructs the stripper cannot close inside a `run:` body appear in codeIssues().
//   * Dockerfile and .env files lose FULL-LINE comments only (a trailing `#` is data to both).
//   * isDir() is true for an existing directory even if empty, while list() only returns files.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { stripCommentsDetailed, stripSqlCommentsDetailed, stripYamlCommentsDetailed, stripShellCommentsDetailed, stripDockerfileCommentsDetailed, stripDotenvCommentsDetailed, stripCaddyfileCommentsDetailed } from './strip.mjs';

export class VacuousMutation extends Error {
  constructor(message, info = {}) {
    super(message);
    this.name = 'VacuousMutation';
    this.rel = info.rel === undefined ? null : info.rel;
    this.op = info.op === undefined ? null : info.op;
    this.reason = info.reason === undefined ? null : info.reason;
  }
}

export class VacuousScan extends Error {
  constructor(message, info = {}) {
    super(message);
    this.name = 'VacuousScan';
    this.prefix = info.prefix === undefined ? null : info.prefix;
  }
}

export class UnstrippedKind extends Error {
  constructor(message, info = {}) {
    super(message);
    this.name = 'UnstrippedKind';
    this.rel = info.rel === undefined ? null : info.rel;
  }
}

export class GitUnavailable extends Error {
  constructor(message) {
    super(message);
    this.name = 'GitUnavailable';
  }
}

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next']);

// `.git` (a directory, or the FILE a linked worktree has instead) is repository metadata, never content:
// no path with a `.git` segment is part of any Tree, overlay included.
const hasGitSegment = (p) => p.split('/').includes('.git');

export function normalizeRel(rel) {
  if (typeof rel !== 'string') throw new TypeError('rel path must be a string');
  let p = rel.replace(/\\/g, '/');
  p = path.posix.normalize(p);
  if (p === '.' || p === './') return '';
  if (p.startsWith('/')) throw new Error(`absolute path not allowed: ${rel}`);
  if (p === '..' || p.startsWith('../')) throw new Error(`path escapes the tree root: ${rel}`);
  if (p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

// zsh and ksh are deliberately NOT here: zsh reads `#` differently from sh (`(#i)` glob flags) and the
// shell stripper is written for sh/bash, so a zsh/ksh file stays kind 'none' and refuses codeStrict.
const SHEBANG_SH_RE = /^#![ \t]*(?:\S*\/)?(?:env[ \t]+(?:-\S+[ \t]+)*)?(?:sh|bash|dash|ash)(?=[ \t\r]|$)/;

// A file whose NAME looks like Dockerfile / Caddyfile / .env but whose extension says it is something
// else (`Dockerfile.md`, `.env.example.md`) is that something else: stripping its `#` lines as comments
// would delete markdown headings.
const NAMED_FAMILY_EXCLUDED_EXT = new Set(['.md', '.markdown', '.txt', '.rst', '.html', '.htm', '.xml', '.toml', '.ini', '.cfg', '.conf', '.csv', '.log', '.lock', '.css', '.scss', '.py', '.rb', '.go', '.rs', '.java', '.png', '.svg', '.pdf', '.zip', '.gz', '.tgz', '.map']);

// `raw` (optional) lets an extensionless file be recognised by its shebang. Extensions win over names,
// names win over the shebang.
export function stripKindFor(rel, raw) {
  const base = rel.slice(rel.lastIndexOf('/') + 1).toLowerCase();
  const dot = base.lastIndexOf('.');
  const ext = dot > 0 ? base.slice(dot) : '';
  switch (ext) {
    case '.ts':
    case '.mts':
    case '.cts':
      return 'ts';
    case '.tsx':
    case '.jsx':
    case '.js':
    case '.mjs':
    case '.cjs':
      return 'js';
    case '.json':
    case '.jsonc':
      return 'jsonc';
    case '.sql':
      return 'sql';
    case '.yml':
    case '.yaml':
      return 'yaml';
    case '.sh':
    case '.bash':
      return 'sh';
  }
  if (!NAMED_FAMILY_EXCLUDED_EXT.has(ext)) {
    if (base === 'dockerfile' || base.startsWith('dockerfile.') || base.endsWith('.dockerfile') || base === 'containerfile' || base.startsWith('containerfile.')) return 'dockerfile';
    if (base === 'caddyfile' || base.startsWith('caddyfile.') || base.endsWith('.caddyfile')) return 'caddyfile';
    if (base.startsWith('.env.') || base.endsWith('.env')) return 'dotenv';
  }
  if (ext === '' && typeof raw === 'string' && SHEBANG_SH_RE.test(firstLine(raw))) return 'sh';
  return 'none';
}

// The WHOLE first line, however long: a cut at a fixed width could end an interpreter name and let `shx` pass for
// `sh` (or hide a long interpreter path from the match altogether).
function firstLine(raw) {
  const nl = raw.indexOf('\n');
  return nl === -1 ? raw : raw.slice(0, nl);
}

function runStripper(kind, raw) {
  switch (kind) {
    case 'ts':
    case 'jsonc':
      return stripCommentsDetailed(raw, { jsx: false });
    case 'js':
      return stripCommentsDetailed(raw, { jsx: true });
    case 'sql':
      return stripSqlCommentsDetailed(raw);
    case 'yaml':
      return stripYamlCommentsDetailed(raw, { blockScalars: 'run' });
    case 'sh':
      return stripShellCommentsDetailed(raw);
    case 'dockerfile':
      return stripDockerfileCommentsDetailed(raw);
    case 'dotenv':
      return stripDotenvCommentsDetailed(raw);
    case 'caddyfile':
      return stripCaddyfileCommentsDetailed(raw);
    default:
      throw new Error(`runStripper: no stripper for kind ${JSON.stringify(kind)}`); // 'none' is answered before this is called
  }
}

function normExts(ext) {
  if (ext === undefined || ext === null) return null;
  const arr = Array.isArray(ext) ? ext : [ext];
  if (arr.length === 0) throw new TypeError('list: ext must not be an empty array');
  return arr.map((e) => {
    if (typeof e !== 'string' || e === '') throw new TypeError('list: ext entries must be non-empty strings');
    return (e.startsWith('.') ? e : '.' + e).toLowerCase();
  });
}

// ---- git ------------------------------------------------------------------------------------------
// Every git call runs with GIT_* variables removed (a hook-provided GIT_DIR must not redirect it) and
// never writes (GIT_OPTIONAL_LOCKS=0).
function gitEnv() {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!k.startsWith('GIT_')) env[k] = v;
  env.GIT_OPTIONAL_LOCKS = '0';
  env.GIT_TERMINAL_PROMPT = '0';
  return env;
}

function runGit(shared, args) {
  shared.stats.gitCalls++;
  const r = spawnSync('git', args, { cwd: shared.root, env: gitEnv(), maxBuffer: 1 << 30 });
  if (r.error) {
    if (r.error.code === 'ENOENT') throw new GitUnavailable('git is not installed or not on PATH');
    throw r.error;
  }
  return r;
}

const REGULAR_MODES = new Set(['100644', '100755']);

// Index: regular tracked files and tracked symlinks, as paths relative to root.
function loadIndex(shared) {
  if (shared.index) return shared.index;
  const r = runGit(shared, ['ls-files', '-z', '-s']);
  if (r.status !== 0) throw new GitUnavailable(`not inside a git work tree: ${shared.root}`);
  const files = new Set();
  const links = new Set();
  for (const rec of r.stdout.toString('utf8').split('\0')) {
    if (rec === '') continue;
    const tab = rec.indexOf('\t');
    const mode = rec.slice(0, rec.indexOf(' '));
    const p = rec.slice(tab + 1);
    if (REGULAR_MODES.has(mode)) files.add(p);
    else if (mode === '120000') links.add(p);
  }
  shared.index = { files, links };
  return shared.index;
}

// Commit: blob ids of regular files and the symlinks, at one resolved commit.
function loadCommit(shared) {
  const ref = shared.commitRef;
  const rv = runGit(shared, ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]);
  if (rv.status !== 0) {
    const inside = runGit(shared, ['rev-parse', '--is-inside-work-tree']);
    if (inside.status !== 0) throw new GitUnavailable(`not inside a git work tree: ${shared.root}`);
    throw new Error(`createTree: cannot resolve commit ${JSON.stringify(ref)} to a commit`);
  }
  const sha = rv.stdout.toString('utf8').trim();
  const ls = runGit(shared, ['ls-tree', '-r', '-z', sha]);
  if (ls.status !== 0) throw new GitUnavailable(`git ls-tree failed for ${sha}`);
  const blobs = new Map();
  const links = new Set();
  for (const rec of ls.stdout.toString('utf8').split('\0')) {
    if (rec === '') continue;
    const tab = rec.indexOf('\t');
    const [mode, type, oid] = rec.slice(0, tab).split(' ');
    const p = rec.slice(tab + 1);
    if (type === 'blob' && REGULAR_MODES.has(mode)) blobs.set(p, oid);
    else if (type === 'blob' && mode === '120000') links.add(p);
  }
  shared.commit = sha;
  shared.blobs = blobs;
  shared.index = { files: new Set(blobs.keys()), links };
}

function dirsOf(files) {
  const dirs = new Set();
  for (const f of files) {
    let i = f.lastIndexOf('/');
    while (i > 0) {
      const d = f.slice(0, i);
      if (dirs.has(d)) break;
      dirs.add(d);
      i = d.lastIndexOf('/');
    }
  }
  return dirs;
}

function makeShared(root, source, commitRef) {
  return {
    root,
    source,
    commitRef,
    commit: null,
    head: undefined, // HEAD of the work tree at root, resolved lazily by provenance()
    index: null, // { files:Set, links:Set } -- 'tracked', 'commit', and lazily for trackingState
    blobs: null, // 'commit' only: rel -> object id
    dirSet: null, // 'tracked' / 'commit': every directory that holds a member
    raw: new Map(), // rel -> string | null   (reads)
    kinds: new Map(), // rel -> 'file' | 'dir' | 'none'   (worktree / tracked)
    walks: new Map(), // prefix -> { files, links }
    stripped: new Map(), // kind -> Map(content -> { text, issues })
    stats: { diskReads: 0, walks: 0, strips: 0, gitCalls: 0 },
  };
}

// lstat, never stat: a symlink is reported as neither a file nor a directory, so it is not a member.
// Any error other than "nothing there" (ENAMETOOLONG, EACCES, ...) is a real failure and is thrown.
function diskKind(shared, rel) {
  if (rel === '') return 'dir';
  const hit = shared.kinds.get(rel);
  if (hit !== undefined) return hit;
  let kind = 'none';
  if (!hasGitSegment(rel)) {
    const cut = rel.lastIndexOf('/');
    // a member must be reached through member directories only (no symlinked or file ancestor)
    if (cut <= 0 || diskKind(shared, rel.slice(0, cut)) === 'dir') {
      try {
        const st = fs.lstatSync(path.join(shared.root, rel));
        kind = st.isDirectory() ? 'dir' : st.isFile() ? 'file' : 'none';
      } catch (e) {
        if (!(e && (e.code === 'ENOENT' || e.code === 'ENOTDIR'))) throw e;
      }
    }
  }
  shared.kinds.set(rel, kind);
  return kind;
}

function memberContent(shared, rel) {
  if (shared.source === 'commit') {
    const oid = shared.blobs.get(rel);
    if (oid === undefined) return null;
    const r = runGit(shared, ['cat-file', 'blob', oid]);
    if (r.status !== 0) throw new Error(`git cat-file failed for ${rel}`);
    return r.stdout.toString('utf8');
  }
  if (shared.source === 'tracked' && !shared.index.files.has(rel)) return null;
  if (diskKind(shared, rel) !== 'file') return null;
  try {
    const content = fs.readFileSync(path.join(shared.root, rel), 'utf8');
    shared.stats.diskReads++;
    return content;
  } catch (e) {
    if (!(e && (e.code === 'ENOENT' || e.code === 'ENOTDIR' || e.code === 'EISDIR'))) throw e;
    return null;
  }
}

function diskRead(shared, rel) {
  if (shared.raw.has(rel)) return shared.raw.get(rel);
  const content = memberContent(shared, rel);
  shared.raw.set(rel, content);
  return content;
}

function diskIsDir(shared, rel) {
  if (rel === '') return true;
  if (shared.source === 'commit') return shared.dirSet.has(rel);
  if (shared.source === 'tracked') return shared.dirSet.has(rel) && diskKind(shared, rel) === 'dir';
  return diskKind(shared, rel) === 'dir';
}

// Files and symlinks under prefix, skipping SKIP_DIRS (and `.git` of any type) BELOW the prefix.
function walkDisk(shared, prefix) {
  const cached = shared.walks.get(prefix);
  if (cached) return cached;
  shared.stats.walks++;
  const files = [];
  const links = [];
  const skipped = (rel) => rel.slice(prefix === '' ? 0 : prefix.length + 1).split('/').slice(0, -1).some((s) => SKIP_DIRS.has(s));
  if (shared.source === 'worktree') {
    const visit = (abs, rel) => {
      let entries;
      try {
        entries = fs.readdirSync(abs, { withFileTypes: true });
      } catch (e) {
        if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) return;
        throw e;
      }
      for (const ent of entries) {
        if (ent.name === '.git') continue;
        const childRel = rel === '' ? ent.name : rel + '/' + ent.name;
        if (ent.isSymbolicLink()) links.push(childRel);
        else if (ent.isDirectory()) {
          if (!SKIP_DIRS.has(ent.name)) visit(path.join(abs, ent.name), childRel);
        } else if (ent.isFile()) files.push(childRel);
      }
    };
    if (diskKind(shared, prefix) === 'dir') visit(prefix === '' ? shared.root : path.join(shared.root, prefix), prefix);
  } else {
    const under = (f) => prefix === '' || f.startsWith(prefix + '/');
    for (const f of shared.index.files) if (under(f) && !skipped(f) && (shared.source === 'commit' || diskKind(shared, f) === 'file')) files.push(f);
    for (const l of shared.index.links) if (under(l) && !skipped(l)) links.push(l);
  }
  const result = { files, links };
  shared.walks.set(prefix, result); // unsorted: list() sorts the merged (base + overlay) result
  return result;
}

function makeTree(shared, overlay) {
  const memoCode = new Map();
  const memoList = new Map();

  const fileContent = (rel) => (overlay.has(rel) ? overlay.get(rel) : diskRead(shared, rel));

  const derive = (rel, content) => {
    const next = new Map(overlay);
    next.set(rel, content);
    return makeTree(shared, next);
  };

  const codeResult = (rel) => {
    const raw = fileContent(rel);
    if (raw === null) return null;
    const kind = stripKindFor(rel, raw);
    if (kind === 'none') return { kind, text: raw, issues: [] };
    let byContent = shared.stripped.get(kind);
    if (!byContent) {
      byContent = new Map();
      shared.stripped.set(kind, byContent);
    }
    let hit = byContent.get(raw);
    if (!hit) {
      shared.stats.strips++;
      hit = runStripper(kind, raw);
      byContent.set(raw, hit);
    }
    return { kind, text: hit.text, issues: hit.issues };
  };

  const read = (rel) => fileContent(normalizeRel(rel));

  const isFile = (rel) => fileContent(normalizeRel(rel)) !== null;

  const isDir = (rel) => {
    const p = normalizeRel(rel);
    if (p === '') return true;
    for (const [k, v] of overlay) if (v !== null && k.startsWith(p + '/')) return true;
    if (!diskIsDir(shared, p)) return false;
    let deletedUnder = false;
    for (const [k, v] of overlay) {
      if (v === null && k.startsWith(p + '/')) {
        deletedUnder = true;
        break;
      }
    }
    if (!deletedUnder) return true;
    return list(p).length > 0;
  };

  const exists = (rel) => isFile(rel) || isDir(rel);

  const code = (rel) => {
    const p = normalizeRel(rel);
    if (memoCode.has(p)) return memoCode.get(p).text;
    const r = codeResult(p);
    memoCode.set(p, r === null ? { text: null, kind: 'none', issues: null } : r);
    return r === null ? null : r.text;
  };
  const codeKind = (rel) => {
    const p = normalizeRel(rel);
    const raw = fileContent(p);
    return stripKindFor(p, raw === null ? undefined : raw);
  };
  const codeIssues = (rel) => {
    const p = normalizeRel(rel);
    code(p);
    const r = memoCode.get(p);
    return r.issues === null || r.kind === 'none' ? null : r.issues.map((x) => ({ ...x }));
  };
  const codeStrict = (rel) => {
    const p = normalizeRel(rel);
    const text = code(p);
    if (text === null) return null;
    if (memoCode.get(p).kind === 'none') throw new UnstrippedKind(`codeStrict: no comment stripper exists for ${p}; a scan of its raw text would match comments`, { rel: p });
    return text;
  };

  function list(prefixDir = '', options = {}) {
    const p = normalizeRel(prefixDir);
    const exts = normExts(options && options.ext);
    const key = p + '\0' + (exts ? exts.join(',') : '');
    const memo = memoList.get(key);
    if (memo) return memo;
    const set = new Set(walkDisk(shared, p).files);
    const segCount = p === '' ? 0 : p.split('/').length;
    for (const [k, v] of overlay) {
      if (p !== '' && !k.startsWith(p + '/')) continue;
      if (k.split('/').slice(segCount, -1).some((s) => SKIP_DIRS.has(s))) continue;
      if (v === null) set.delete(k);
      else set.add(k);
    }
    let arr = [...set];
    if (exts) {
      arr = arr.filter((f) => {
        const lf = f.toLowerCase();
        return exts.some((e) => lf.endsWith(e));
      });
    }
    arr.sort();
    const frozen = Object.freeze(arr);
    memoList.set(key, frozen);
    return frozen;
  }

  const listNonEmpty = (prefixDir = '', options = {}) => {
    const r = list(prefixDir, options);
    if (r.length === 0) {
      const p = normalizeRel(prefixDir);
      throw new VacuousScan(`listNonEmpty: no files under "${p}"${options && options.ext ? ` with ext ${JSON.stringify(options.ext)}` : ''}`, { prefix: p });
    }
    return r;
  };

  const symlinks = (prefixDir = '') => {
    const p = normalizeRel(prefixDir);
    return Object.freeze([...walkDisk(shared, p).links].sort());
  };

  const edit = (rel, fn) => {
    const p = normalizeRel(rel);
    const cur = fileContent(p);
    if (cur === null) throw new VacuousMutation(`edit: file does not exist: ${p}`, { rel: p, op: 'edit', reason: 'missing-file' });
    const next = fn(cur);
    if (typeof next !== 'string') throw new TypeError(`edit(${p}): fn must return a string`);
    if (next === cur) throw new VacuousMutation(`edit: no-op on ${p}`, { rel: p, op: 'edit', reason: 'no-op' });
    return derive(p, next);
  };

  const replace = (rel, pattern, replacement) => {
    const p = normalizeRel(rel);
    const cur = fileContent(p);
    if (cur === null) throw new VacuousMutation(`replace: file does not exist: ${p}`, { rel: p, op: 'replace', reason: 'missing-file' });
    let next;
    if (typeof pattern === 'string') {
      if (pattern === '') throw new TypeError('replace: empty string pattern');
      if (!cur.includes(pattern)) throw new VacuousMutation(`replace: pattern not found in ${p}`, { rel: p, op: 'replace', reason: 'no-match' });
      next = typeof replacement === 'function' ? cur.replaceAll(pattern, replacement) : cur.split(pattern).join(String(replacement));
    } else if (pattern instanceof RegExp) {
      const flags = pattern.flags.replace('y', '');
      if (!new RegExp(pattern.source, flags).test(cur)) throw new VacuousMutation(`replace: pattern not found in ${p}`, { rel: p, op: 'replace', reason: 'no-match' });
      next = cur.replace(new RegExp(pattern.source, flags), replacement);
    } else {
      throw new TypeError('replace: pattern must be a string or RegExp');
    }
    if (next === cur) throw new VacuousMutation(`replace: no net change in ${p}`, { rel: p, op: 'replace', reason: 'no-op' });
    return derive(p, next);
  };

  const add = (rel, content) => {
    const p = normalizeRel(rel);
    if (p === '') throw new TypeError('add: empty path');
    if (typeof content !== 'string') throw new TypeError(`add(${p}): content must be a string`);
    if (hasGitSegment(p)) throw new TypeError(`add: a .git path is not part of a tree: ${p}`);
    if (fileContent(p) !== null) throw new VacuousMutation(`add: file already exists: ${p}`, { rel: p, op: 'add', reason: 'already-exists' });
    return derive(p, content);
  };

  const remove = (rel) => {
    const p = normalizeRel(rel);
    if (fileContent(p) === null) throw new VacuousMutation(`remove: file does not exist: ${p}`, { rel: p, op: 'remove', reason: 'missing-file' });
    return derive(p, null);
  };

  const touched = () => [...overlay.keys()].sort();
  const stats = () => ({ ...shared.stats });

  const provenance = () => {
    if (shared.head === undefined) {
      shared.head = null;
      try {
        const r = runGit(shared, ['rev-parse', '--verify', '--quiet', 'HEAD^{commit}']);
        if (r.status === 0) shared.head = r.stdout.toString('utf8').trim();
      } catch (e) {
        if (!(e instanceof GitUnavailable)) throw e;
      }
    }
    return { source: shared.source, commit: shared.commit, head: shared.head, root: shared.root };
  };

  const trackingState = (rel) => {
    const p = normalizeRel(rel);
    if (overlay.has(p)) return overlay.get(p) === null ? 'absent' : 'overlay';
    if (shared.source === 'commit') return shared.blobs.has(p) ? 'commit' : 'absent';
    if (!isFile(p)) return 'absent';
    try {
      if (loadIndex(shared).files.has(p)) return 'tracked';
      const r = runGit(shared, ['check-ignore', '-q', '--', p]);
      if (r.status === 0) return 'ignored';
      return r.status === 1 ? 'untracked' : 'no-git';
    } catch (e) {
      if (e instanceof GitUnavailable) return 'no-git';
      throw e;
    }
  };

  return Object.freeze({
    root: shared.root,
    read,
    code,
    codeStrict,
    codeKind,
    codeIssues,
    exists,
    isFile,
    isDir,
    list,
    listNonEmpty,
    symlinks,
    edit,
    replace,
    add,
    remove,
    touched,
    provenance,
    trackingState,
    stats,
  });
}

export function createTree(root, overlay = {}, options = {}) {
  if (typeof root !== 'string' || root === '') throw new TypeError('createTree: root must be a non-empty string');
  const o = options === null || options === undefined ? {} : options;
  const source = o.source === undefined ? 'worktree' : o.source;
  if (source !== 'worktree' && source !== 'tracked' && source !== 'commit') throw new TypeError(`createTree: unknown source ${JSON.stringify(source)}`);
  if (o.commit !== undefined && source !== 'commit') throw new TypeError('createTree: options.commit is only valid with source "commit"');
  if (o.commit !== undefined && (typeof o.commit !== 'string' || o.commit === '')) throw new TypeError('createTree: options.commit must be a non-empty string');
  const abs = path.resolve(root);
  let st;
  try {
    st = fs.statSync(abs);
  } catch {
    throw new Error(`createTree: root does not exist: ${abs}`);
  }
  if (!st.isDirectory()) throw new Error(`createTree: root is not a directory: ${abs}`);
  const map = new Map();
  const entries = overlay instanceof Map ? [...overlay] : Object.entries(overlay || {});
  for (const [k, v] of entries) {
    const nk = normalizeRel(k);
    if (nk === '') throw new TypeError('createTree: empty overlay path');
    if (hasGitSegment(nk)) throw new TypeError(`createTree: a .git path is not part of a tree: ${nk}`);
    if (v !== null && typeof v !== 'string') throw new TypeError(`createTree: overlay value for ${nk} must be a string or null`);
    if (map.has(nk)) throw new Error(`createTree: duplicate overlay key after normalisation: ${nk}`);
    map.set(nk, v);
  }
  const shared = makeShared(abs, source, source === 'commit' ? (o.commit === undefined ? 'HEAD' : o.commit) : null);
  if (source === 'tracked') {
    loadIndex(shared); // fail closed NOW, not at the first read
    shared.dirSet = dirsOf(shared.index.files);
  } else if (source === 'commit') {
    loadCommit(shared);
    shared.dirSet = dirsOf(shared.index.files);
  }
  return makeTree(shared, map);
}


// ---------------------------------------------------------------------------------------------
// SELF-TEST
// ---------------------------------------------------------------------------------------------
// Fixtures: throw-away directories under os.tmpdir() (a plain tree, and a real git repository with
// two commits, uncommitted work, untracked / ignored / deleted files, a tracked symlink and a LINKED
// WORKTREE whose `.git` is a file), all removed in `finally` (and the removal itself is a check).
// Lethality: the checks registered with defCheck() are ALSO run against deliberately wrong trees that
// reproduce the defects this module was repaired for (raw text passed off as comment-stripped, an
// empty issues list passed off as a clean parse, untracked files in scope, a `.git` file in the listing,
// a symlink counted twice, an edit stored under an un-normalised key ...) and MUST fail there; a check
// that passes on a broken tree proves nothing. mutationAudit() does the same to the implementation.

function throwsOf(fn) {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
}

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wsi-tree-'));
  const w = (rel, content) => {
    const f = path.join(root, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, content);
  };
  w('a/x.ts', 'export const x = 1; // CMT_T1\n');
  w('a/b/y.tsx', 'export const y = <p>a // KEEP_T2</p>; // CMT_T2\n');
  w('a/sub/c.sql', "SELECT '-- KEEP_T3'; -- CMT_T3\n");
  w('a/ci.yml', 'k: "v # KEEP_T4" # CMT_T4\n');
  w('a/data.json', '{"u": "http://h.test" /* CMT_T5 */}\n');
  w('a/run.sh', 'echo hi # CMT_T9\n');
  w('a/node_modules/z.ts', 'z\n');
  w('a/.git/config', 'g\n');
  w('a/dist/q.js', 'q\n');
  w('a/.next/r.js', 'r\n');
  w('a/deep/dist/s.js', 's\n');
  w('a/deep/keep.js', 'k\n');
  w('a2/other.ts', 'o\n');
  w('Plain.TXT', 'upper-case extension\n');
  w('.git', 'gitdir: /somewhere/on/this/machine\n'); // what a linked worktree has instead of a directory
  fs.mkdirSync(path.join(root, 'empty'));
  // symlinks: a file link, a directory link, a self-loop. None of them is a member of the tree.
  fs.symlinkSync('x.ts', path.join(root, 'a/linkfile.ts'));
  fs.symlinkSync('../a2', path.join(root, 'a/linkdir'));
  fs.symlinkSync('loop', path.join(root, 'a/loop'));
  // 's/b/l1' is visited BEFORE 's/b-1' by a directory walk but sorts AFTER it ('-' < '/'): only a real sort passes
  fs.mkdirSync(path.join(root, 's/b'), { recursive: true });
  fs.symlinkSync('../../a/x.ts', path.join(root, 's/b/l1'));
  fs.symlinkSync('../a/x.ts', path.join(root, 's/b-1'));
  return root;
}

// A hermetic git: no user, system or ambient GIT_* configuration leaks in.
function gitSync(cwd, home, args) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!k.startsWith('GIT_')) env[k] = v;
  Object.assign(env, {
    HOME: home,
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_AUTHOR_NAME: 'wsi',
    GIT_AUTHOR_EMAIL: 'wsi@example.invalid',
    GIT_COMMITTER_NAME: 'wsi',
    GIT_COMMITTER_EMAIL: 'wsi@example.invalid',
    GIT_TERMINAL_PROMPT: '0',
  });
  const r = spawnSync('git', args, { cwd, env, encoding: 'utf8' });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed (${r.status}): ${String(r.stderr).split('\n')[0]}`);
  return String(r.stdout).trim();
}

function makeGitFixture() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'wsi-git-'));
  const R = path.join(base, 'repo');
  fs.mkdirSync(R);
  const w = (rel, content) => {
    const f = path.join(R, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, content);
  };
  const g = (...args) => gitSync(R, base, args);
  g('init', '-q');
  w('.gitignore', '.env*\ncoverage\n');
  w('lib/a.ts', 'export const a = 1; // CMT_G1\n');
  w('lib/d/e.ts', 'export const e = 1;\n');
  w('docs/readme.md', '# readme\n');
  w('pkg/inner/deep/mod.ts', 'export const m = 1;\n'); // a directory chain with no file of its own at 'pkg' / 'pkg/inner'
  w('lib2/other.ts', 'export const o = 1;\n'); // a sibling that merely starts with "lib"
  w('vendor/dist/bundle.js', 'var v = 1;\n'); // tracked, but under a skipped directory name
  fs.symlinkSync('bundle.js', path.join(R, 'vendor/dist/lnk')); // ... and so is this symlink
  fs.symlinkSync('a.ts', path.join(R, 'lib/link.ts'));
  g('add', '-A');
  g('-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'c1');
  const c1 = g('rev-parse', 'HEAD');
  w('lib/a.ts', 'export const a = 2; // CMT_G2\n');
  w('lib/d/f.ts', 'export const f = 1;\n');
  g('add', '-A');
  g('-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'c2');
  const c2 = g('rev-parse', 'HEAD');
  // working tree AFTER c2, none of it committed:
  w('lib/a.ts', 'export const a = 3; // CMT_G3\n'); // modified
  fs.rmSync(path.join(R, 'docs'), { recursive: true }); // tracked, deleted on disk (the directory goes too)
  w('lib/untracked.ts', 'export const u = 1;\n'); // untracked
  w('.env.production', 'IGNORED_FILE_MARKER=1\n'); // ignored by `.env*`
  w('coverage/b.ts', 'export const b = 1;\n'); // ignored by `coverage`
  const W = path.join(base, 'wt'); // a linked worktree: its `.git` is a FILE
  g('worktree', 'add', '-q', '--detach', W, 'HEAD');
  const ND = path.join(base, 'plain'); // not in any repository
  fs.mkdirSync(ND);
  fs.writeFileSync(path.join(ND, 'p.ts'), 'export const p = 1;\n');
  // two repositories whose object database has lost an object: git can name the commit but not read it
  const broken = (label, loseTree) => {
    const dir = path.join(base, label);
    fs.mkdirSync(dir);
    const bg = (...args) => gitSync(dir, base, args);
    bg('init', '-q');
    fs.writeFileSync(path.join(dir, 'one.ts'), 'export const one = 1;\n');
    fs.writeFileSync(path.join(dir, 'two.ts'), 'export const two = 2;\n');
    bg('add', '-A');
    bg('-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'b1');
    const oid = bg('rev-parse', loseTree ? 'HEAD^{tree}' : 'HEAD:one.ts');
    fs.rmSync(path.join(dir, '.git', 'objects', oid.slice(0, 2), oid.slice(2)));
    return dir;
  };
  const BT = broken('lost-tree', true);
  const BB = broken('lost-blob', false);
  return { base, R, W, ND, BT, BB, c1, c2 };
}

// A small throw-away tree for one check: files, relative symlinks, optionally committed to a fresh repository.
function makeMini(label, files, { git = false, links = {} } = {}) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), `wsi-${label}-`));
  const R = path.join(base, 'repo');
  fs.mkdirSync(R);
  for (const [rel, content] of Object.entries(files)) {
    const f = path.join(R, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, content);
  }
  for (const [rel, target] of Object.entries(links)) fs.symlinkSync(target, path.join(R, rel));
  if (git) {
    const g = (...args) => gitSync(R, base, args);
    g('init', '-q');
    g('add', '-A');
    g('-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'm1');
  }
  return { base, R };
}

// ---- known-wrong controls (never exported; used only by the lethality checks) ---------------------

// The tree as it was BEFORE the repair: a walker that lists symlinked files and a symlinked prefix's
// target, and a `.git` FILE.
function oldWalk(root, prefix) {
  const results = [];
  const visit = (abs, rel) => {
    let entries;
    try {
      entries = fs.readdirSync(abs, { withFileTypes: true });
    } catch (e) {
      if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) return;
      throw e;
    }
    for (const ent of entries) {
      const childRel = rel === '' ? ent.name : rel + '/' + ent.name;
      const childAbs = path.join(abs, ent.name);
      let isDir = ent.isDirectory();
      let isFileEnt = ent.isFile();
      if (ent.isSymbolicLink()) {
        try {
          isFileEnt = fs.statSync(childAbs).isFile();
          isDir = false;
        } catch {
          continue;
        }
      }
      if (isDir) {
        if (SKIP_DIRS.has(ent.name)) continue;
        visit(childAbs, childRel);
      } else if (isFileEnt) {
        results.push(childRel);
      }
    }
  };
  visit(prefix === '' ? root : path.join(root, prefix), prefix);
  return results.sort();
}

const oldRead = (root, rel) => {
  try {
    return fs.readFileSync(path.join(root, normalizeRel(rel)), 'utf8');
  } catch (e) {
    if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR' || e.code === 'EISDIR')) return null;
    throw e;
  }
};

// name -> [relative path, expected kind, content builder(commentMarker, keepMarker)]
const KIND_CASES = [
  ['k/a.ts', 'ts', (c, k) => `export const a = '// ${k}'; // ${c}\n`],
  ['k/a.mts', 'ts', (c, k) => `export const a = '// ${k}'; // ${c}\n`],
  ['k/a.cts', 'ts', (c, k) => `export const a = '// ${k}'; // ${c}\n`],
  ['k/UP.TS', 'ts', (c, k) => `export const a = '// ${k}'; // ${c}\n`],
  ['k/a.tsx', 'js', (c, k) => `export const a = '// ${k}'; // ${c}\n`],
  ['k/a.jsx', 'js', (c, k) => `export const a = '// ${k}'; // ${c}\n`],
  ['k/a.js', 'js', (c, k) => `export const a = '// ${k}'; // ${c}\n`],
  ['k/a.mjs', 'js', (c, k) => `export const a = '// ${k}'; // ${c}\n`],
  ['k/a.cjs', 'js', (c, k) => `export const a = '// ${k}'; // ${c}\n`],
  ['k/a.json', 'jsonc', (c, k) => `{"u": "// ${k}" /* ${c} */}\n`],
  ['k/a.jsonc', 'jsonc', (c, k) => `{"u": "// ${k}" /* ${c} */}\n`],
  ['k/a.sql', 'sql', (c, k) => `SELECT '-- ${k}'; -- ${c}\n`],
  ['k/a.yml', 'yaml', (c, k) => `k: "v # ${k}" # ${c}\n`],
  ['k/a.yaml', 'yaml', (c, k) => `k: "v # ${k}" # ${c}\n`],
  ['k/UP.YAML', 'yaml', (c, k) => `k: "v # ${k}" # ${c}\n`],
  ['k/a.sh', 'sh', (c, k) => `echo '# ${k}' # ${c}\n`],
  ['k/a.bash', 'sh', (c, k) => `echo '# ${k}' # ${c}\n`],
  ['k/UP.SH', 'sh', (c, k) => `echo '# ${k}' # ${c}\n`],
  ['k/Dockerfile', 'dockerfile', (c, k) => `# ${c}\nRUN echo '# ${k}'\n`],
  ['k/Dockerfile.prod', 'dockerfile', (c, k) => `# ${c}\nRUN echo '# ${k}'\n`],
  ['k/Dockerfile.arm64-alpine.prisma', 'dockerfile', (c, k) => `# ${c}\nRUN echo '# ${k}'\n`],
  ['k/app.dockerfile', 'dockerfile', (c, k) => `# ${c}\nRUN echo '# ${k}'\n`],
  ['k/Containerfile', 'dockerfile', (c, k) => `# ${c}\nRUN echo '# ${k}'\n`],
  ['k/Containerfile.dev', 'dockerfile', (c, k) => `# ${c}\nRUN echo '# ${k}'\n`],
  ['k/.env', 'dotenv', (c, k) => `# ${c}\nKEY='# ${k}'\n`],
  ['k/.env.production', 'dotenv', (c, k) => `# ${c}\nKEY='# ${k}'\n`],
  ['k/.env.docker.template', 'dotenv', (c, k) => `# ${c}\nKEY='# ${k}'\n`],
  ['k/prod.env', 'dotenv', (c, k) => `# ${c}\nKEY='# ${k}'\n`],
  ['k/Caddyfile', 'caddyfile', (c, k) => `# ${c}\nexample.test {\n  respond "# ${k}"\n}\n`],
  ['k/Caddyfile.staging', 'caddyfile', (c, k) => `# ${c}\nexample.test {\n  respond "# ${k}"\n}\n`],
  ['k/site.caddyfile', 'caddyfile', (c, k) => `# ${c}\nexample.test {\n  respond "# ${k}"\n}\n`],
  ['k/tool-sh', 'sh', (c, k) => `#!/bin/sh\n# ${c}\necho '# ${k}'\n`],
  ['k/tool-env-bash', 'sh', (c, k) => `#!/usr/bin/env bash\n# ${c}\necho '# ${k}'\n`],
  ['k/tool-env-S', 'sh', (c, k) => `#!/usr/bin/env -S bash -e\n# ${c}\necho '# ${k}'\n`],
  ['k/tool-crlf', 'sh', (c, k) => `#!/bin/sh\r\n# ${c}\r\necho '# ${k}'\r\n`],
];

// files with NO comment stripper: kind 'none', raw text, codeIssues null, codeStrict throws
const NONE_CASES = [
  ['n/README.md', '# Heading\n<!-- c -->\n'],
  ['n/pyproject.toml', '# toml comment\nname = "x"\n'],
  ['n/x.zsh', '# zsh comment\nprint (#i)x\n'],
  ['n/tool-none', 'echo no shebang\n# c\n'],
  ['n/tool-zsh', '#!/bin/zsh\n# c\necho hi\n'],
  ['n/tool-python', '#!/usr/bin/env python3\n# c\nprint(1)\n'],
  ['n/tool-bashful', '#!/bin/bashful\n# c\n'],
  ['n/Dockerfile.md', '# Docker docs\n'],
  ['n/.env.example.md', '# Env docs\n'],
  ['n/Caddyfile.txt', '# c\n'],
  ['n/script.py', '#!/bin/sh\n# c\n'],
  ['n/LICENSE', 'text\n'],
  ['n/.gitignore', '# c\nnode_modules\n'],
];

const ISSUE_CASES = [
  ['i/a.ts', 'ts', 'const a = 1;\n/* never closed\n', 'unterminated-block-comment', 2],
  ['i/a.tsx', 'js', 'const a = `never closed\nconst b = 2;\n', 'unterminated-template', 1],
  ['i/a.jsonc', 'jsonc', '{ /* never closed\n', 'unterminated-block-comment', 1],
  ['i/a.sql', 'sql', "SELECT 1;\nSELECT 'never closed;\n", 'unterminated-string', 2],
  ['i/w.yml', 'yaml', "a:\n  - run: |\n      echo 'never closed\n", 'unterminated-string', 3],
  ['i/w2.yml', 'yaml', 'a:\n  - run: |\n      cat <<EOF\n      never\n', 'unterminated-heredoc', 3],
  ['i/a.sh', 'sh', 'cat <<EOF\nnever closed\n', 'unterminated-heredoc', 1],
  ['i/Dockerfile', 'dockerfile', 'FROM scratch\nRUN cat <<EOF\nnever\n', 'unterminated-heredoc', 2],
  ['i/.env', 'dotenv', 'K="never closed\n', 'unterminated-string', 1],
  ['i/Caddyfile', 'caddyfile', 'x.test {\n  respond "never closed\n}\n', 'unterminated-string', 2],
];

// stripKindFor(rel, raw?) -- one row per switch label and per name family, so no label can vanish unseen
const KIND_TABLE = [
  ['a.ts', undefined, 'ts'],
  ['a.mts', undefined, 'ts'],
  ['a.cts', undefined, 'ts'],
  ['a.d.ts', undefined, 'ts'],
  ['.env.d.ts', undefined, 'ts'],
  ['A.TS', undefined, 'ts'],
  ['a.tsx', undefined, 'js'],
  ['a.jsx', undefined, 'js'],
  ['a.js', undefined, 'js'],
  ['a.mjs', undefined, 'js'],
  ['a.cjs', undefined, 'js'],
  ['a.json', undefined, 'jsonc'],
  ['a.jsonc', undefined, 'jsonc'],
  ['a.sql', undefined, 'sql'],
  ['a.yml', undefined, 'yaml'],
  ['a.yaml', undefined, 'yaml'],
  ['.github/workflows/w.yml', undefined, 'yaml'],
  ['a.sh', undefined, 'sh'],
  ['a.bash', undefined, 'sh'],
  ['Dockerfile.sh', undefined, 'sh'],
  ['Dockerfile', undefined, 'dockerfile'],
  ['dir/dockerfile', undefined, 'dockerfile'],
  ['Dockerfile.production', undefined, 'dockerfile'],
  ['x.dockerfile', undefined, 'dockerfile'],
  ['Containerfile', undefined, 'dockerfile'],
  ['Containerfile.x', undefined, 'dockerfile'],
  ['Caddyfile', undefined, 'caddyfile'],
  ['infra/Caddyfile.staging', undefined, 'caddyfile'],
  ['x.caddyfile', undefined, 'caddyfile'],
  ['.env', undefined, 'dotenv'],
  ['.env.local', undefined, 'dotenv'],
  ['ios/App/.env.example', undefined, 'dotenv'],
  ['.env.production.local', undefined, 'dotenv'],
  ['prod.env', undefined, 'dotenv'],
  ['tool', '#!/bin/sh\n', 'sh'],
  ['tool', '#!/bin/bash -e\n', 'sh'],
  ['tool', '#!/usr/bin/env sh\n', 'sh'],
  ['tool', '#!/usr/bin/env -S bash -e\n', 'sh'],
  ['tool', '#! /bin/dash\n', 'sh'],
  ['tool', '#!/bin/ash\r\n', 'sh'],
  ['tool', '#!/bin/sh', 'sh'],
  ['tool', undefined, 'none'],
  ['tool', 'echo hi\n', 'none'],
  ['tool', '#!/bin/zsh\n', 'none'],
  ['tool', '#!/bin/ksh\n', 'none'],
  ['tool', '#!/usr/bin/env python3\n', 'none'],
  ['tool', '#!/bin/bashful\n', 'none'],
  ['tool', '#!/' + 'd'.repeat(300) + '/sh\n', 'sh'], // a first line longer than any fixed cut still names its interpreter
  ['tool', '#!/' + 'd'.repeat(194) + '/shx\n', 'none'], // `sh` ends exactly 200 characters in, but `x` follows it
  ['tool', '#!/' + 'd'.repeat(194) + '/sh \n', 'sh'],
  ['tool', '\n#!/bin/sh\n', 'none'],
  ['tool.txt', '#!/bin/sh\n', 'none'],
  ['README.md', undefined, 'none'],
  ['Dockerfile.md', undefined, 'none'],
  ['.env.example.md', undefined, 'none'],
  ['Caddyfile.txt', undefined, 'none'],
  ['a.zsh', undefined, 'none'],
  ['a.ksh', undefined, 'none'],
  ['a.toml', undefined, 'none'],
  ['.gitignore', undefined, 'none'],
  ['LICENSE', undefined, 'none'],
  ['.sh', undefined, 'none'], // a dotfile has no extension: `.sh` is a NAME, not a shell script
  ['.ts', undefined, 'none'],
];

export function selfTest(opts = {}) {
  const checks = [];
  const add = (name, ok, detail = '') => checks.push({ name, ok: !!ok, detail: String(detail) });
  const run = (name, fn) => {
    try {
      const r = fn();
      add(name, r === true, r === true ? '' : r);
    } catch (e) {
      add(name, false, `threw ${e && e.name}: ${e && e.message}`);
    }
  };

  // `opts.here` lets mutationAudit() run this from a data: URL, where import.meta.url is not a file path.
  const here = opts.here || path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(here, '../../../..');
  const real = createTree;
  // C: every check that is ALSO run against a known-wrong tree. A check takes the tree factory `mk`
  // (root, overlay, options) and returns true or a reason.
  const C = {};
  const defCheck = (name, fn) => {
    C[name] = fn;
    run(name, () => fn(real));
  };
  const minis = [];
  let fx = null;
  let gx = null;
  let gxErr = null;
  try {
    fx = makeFixture();
    try {
      gx = makeGitFixture();
    } catch (e) {
      gxErr = e;
    }
    const needGit = (fn) => () => (gx ? fn(gx) : `git fixture unavailable (${gxErr && gxErr.message}); the tracked / commit sources cannot be verified`);
    const sameList = (got, want) => (JSON.stringify(got) === JSON.stringify(want) ? true : `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);

    // ---- normalizeRel ----------------------------------------------------------------------------
    run('normalizeRel/table', () => {
      const T = [['', ''], ['.', ''], ['./', ''], ['a/', 'a'], ['a/b/', 'a/b'], ['./a//b/./c', 'a/b/c'], ['a\\b\\c', 'a/b/c'], ['a/b/../c', 'a/c'], ['a/..', ''], ['a/../', ''], ['a/.env', 'a/.env']];
      const bad = T.filter(([i, o]) => normalizeRel(i) !== o).map(([i]) => JSON.stringify(i));
      return bad.length === 0 ? true : `wrong for ${bad.join(' ')}`;
    });
    run('normalizeRel/escapes-absolute-and-non-strings-throw', () => {
      const bad = [];
      for (const p of ['..', '../x', 'a/../..', '/abs', '\\abs', 'a/../../b']) if (!throwsOf(() => normalizeRel(p))) bad.push(JSON.stringify(p));
      if (!(throwsOf(() => normalizeRel(5)) instanceof TypeError)) bad.push('5');
      return bad.length === 0 ? true : `did not throw for ${bad.join(' ')}`;
    });

    // ---- construction ------------------------------------------------------------------------------
    run('createTree/missing-root-throws', () => (throwsOf(() => createTree(path.join(fx, 'nope'))) ? true : 'did not throw'));
    run('createTree/root-that-is-a-file-throws', () => (throwsOf(() => createTree(path.join(fx, 'a/x.ts'))) ? true : 'did not throw'));
    run('createTree/empty-or-non-string-root-throws-TypeError', () => (throwsOf(() => createTree('')) instanceof TypeError && throwsOf(() => createTree(5)) instanceof TypeError ? true : 'no TypeError'));
    run('createTree/overlay-duplicate-after-normalisation-throws', () => (throwsOf(() => createTree(fx, { 'a/x.ts': 'p', './a//x.ts': 'q' })) ? true : 'did not throw'));
    run('createTree/overlay-bad-value-throws', () => (throwsOf(() => createTree(fx, { 'a/x.ts': 5 })) instanceof TypeError ? true : 'did not throw TypeError'));
    run('createTree/overlay-empty-path-throws', () => (throwsOf(() => createTree(fx, { '.': 'x' })) instanceof TypeError && throwsOf(() => createTree(fx, { './': 'x' })) instanceof TypeError ? true : 'no TypeError'));
    run('createTree/overlay-may-be-a-Map-or-null-or-undefined', () => {
      const a = createTree(fx, new Map([['m/f.ts', 'M']]));
      const b = createTree(fx, null);
      const c = createTree(fx, undefined);
      return a.read('m/f.ts') === 'M' && b.read('a/x.ts') !== null && c.read('a/x.ts') !== null ? true : 'overlay shapes not accepted';
    });
    run('createTree/overlay-with-a-dot-git-segment-throws', () => {
      const a = throwsOf(() => createTree(fx, { '.git/config': 'x' }));
      const b = throwsOf(() => createTree(fx, { 'a/.git': 'x' }));
      const c = throwsOf(() => createTree(fx, { '.git/config': null }));
      return a instanceof TypeError && b instanceof TypeError && c instanceof TypeError ? true : `${a && a.name},${b && b.name},${c && c.name}`;
    });
    run('createTree/options-are-validated', () => {
      const bad = [];
      const t = (name, opt) => { if (!(throwsOf(() => createTree(fx, {}, opt)) instanceof TypeError)) bad.push(name); };
      t('unknown-source', { source: 'bogus' });
      t('commit-without-commit-source', { commit: 'HEAD' });
      t('commit-with-tracked-source', { source: 'tracked', commit: 'HEAD' });
      t('empty-commit', { source: 'commit', commit: '' });
      t('non-string-commit', { source: 'commit', commit: 5 });
      return bad.length === 0 ? true : `no TypeError for: ${bad.join(',')}`;
    });
    run('createTree/null-or-undefined-options-mean-the-default', () => (createTree(fx, {}, null).provenance().source === 'worktree' && createTree(fx, {}, undefined).provenance().source === 'worktree' && createTree(fx).provenance().source === 'worktree' ? true : 'not worktree'));
    run('add/a-dot-git-path-is-refused', () => {
      const a = throwsOf(() => createTree(fx).add('.git/x', 'y'));
      const b = throwsOf(() => createTree(fx).add('b/.git', 'y'));
      return a instanceof TypeError && b instanceof TypeError ? true : `${a && a.name},${b && b.name}`;
    });

    // ---- path normalisation reaches EVERY method (the overlay shadows disk, so a method that forgot to
    //      normalise cannot be rescued by the filesystem accepting './a/x.ts') -------------------------
    defCheck('path/readers-normalise-every-variant', (mk) => {
      const t = mk(fx, { 'a/x.ts': 'const only = 1; // CMT_P1\n', 'o/new/f.ts': 'const f = 1; // CMT_P2\n' });
      const bad = [];
      const V = ['a/x.ts', './a/x.ts', 'a//x.ts', 'a/b/../x.ts', 'a\\x.ts', 'a/./x.ts'];
      const wantCode = 'const only = 1; // CMT_P1\n'.replace('// CMT_P1', ' '.repeat('// CMT_P1'.length));
      for (const v of V) {
        if (t.read(v) !== 'const only = 1; // CMT_P1\n') bad.push('read:' + v);
        if (t.code(v) !== wantCode) bad.push('code:' + v);
        if (t.codeKind(v) !== 'ts') bad.push('codeKind:' + v);
        if (JSON.stringify(t.codeIssues(v)) !== '[]') bad.push('codeIssues:' + v);
        if (t.codeStrict(v) !== wantCode) bad.push('codeStrict:' + v);
        if (t.isFile(v) !== true || t.exists(v) !== true || t.isDir(v) !== false) bad.push('isFile/exists/isDir:' + v);
        if (t.trackingState(v) !== 'overlay') bad.push('trackingState:' + v);
      }
      const D = ['o/new', './o/new', 'o//new', 'o/new/', 'o\\new', 'o/x/../new', 'o/./new'];
      for (const v of D) {
        if (t.isDir(v) !== true || t.exists(v) !== true || t.isFile(v) !== false) bad.push('isDir/exists/isFile:' + v);
        if (JSON.stringify(t.list(v)) !== '["o/new/f.ts"]') bad.push('list:' + v);
        if (JSON.stringify(t.listNonEmpty(v)) !== '["o/new/f.ts"]') bad.push('listNonEmpty:' + v);
        if (JSON.stringify(t.list(v, { ext: '.ts' })) !== '["o/new/f.ts"]') bad.push('list-ext:' + v);
        if (JSON.stringify(t.symlinks(v)) !== '[]') bad.push('symlinks:' + v);
      }
      const R = ['', '.', './'];
      for (const v of R) if (!t.list(v).includes('o/new/f.ts') || !t.isDir(v)) bad.push('root:' + JSON.stringify(v));
      // the NAME decides the kind, so a backslash path must be normalised before its base name is read
      const k = mk(fx, { 'k/Dockerfile': 'FROM scratch\n', 'k/Caddyfile': 'x { }\n', 'k/.env': 'A=1\n', 'k/run': '#!/bin/sh\n' });
      for (const v of ['k\\Dockerfile', '.\\k\\Dockerfile']) if (k.codeKind(v) !== 'dockerfile') bad.push('codeKind:' + v);
      for (const [v, want] of [['k\\Caddyfile', 'caddyfile'], ['k\\.env', 'dotenv'], ['k\\run', 'sh']]) if (k.codeKind(v) !== want) bad.push('codeKind:' + v);
      for (const v of ['./a', 'a/', 'a//', 'a\\']) if (JSON.stringify(t.symlinks(v)) !== '["a/linkdir","a/linkfile.ts","a/loop"]') bad.push('symlinks:' + v);
      return bad.length === 0 ? true : `un-normalised: ${bad.join(' ')}`;
    });
    defCheck('path/mutators-normalise-every-variant', (mk) => {
      const t = mk(fx, {});
      const bad = [];
      for (const v of ['./a/x.ts', 'a//x.ts', 'a/b/../x.ts', 'a\\x.ts', 'a/./x.ts']) {
        const e = t.edit(v, (s) => s + 'E');
        if (!e.read('a/x.ts').endsWith('E') || e.touched().join() !== 'a/x.ts') bad.push('edit:' + v);
        const e2 = e.edit('a/x.ts', (s) => s + 'F'); // composes on the first edit; a store under a raw key would not
        if (!e2.read('a/x.ts').endsWith('EF')) bad.push('edit-compose:' + v);
        const r = t.replace(v, 'export', 'EXPORT');
        if (!r.read('a/x.ts').startsWith('EXPORT') || r.touched().join() !== 'a/x.ts') bad.push('replace:' + v);
        const rm = t.remove(v);
        if (rm.read('a/x.ts') !== null || rm.touched().join() !== 'a/x.ts' || rm.list('a').includes('a/x.ts')) bad.push('remove:' + v);
        const back = rm.add(v, 'BACK');
        if (back.read('a/x.ts') !== 'BACK') bad.push('remove-then-add:' + v);
      }
      for (const v of ['./n/f.ts', 'n//f.ts', 'n/m/../f.ts', 'n\\f.ts']) {
        const a = t.add(v, 'N');
        if (a.read('n/f.ts') !== 'N' || a.touched().join() !== 'n/f.ts') bad.push('add:' + v);
        const again = throwsOf(() => a.add('n/f.ts', 'M')); // a second add must SEE the first
        if (!again || again.name !== 'VacuousMutation') bad.push('add-twice:' + v);
      }
      return bad.length === 0 ? true : `un-normalised: ${bad.join(' ')}`;
    });
    run('path/variants-resolve-to-the-same-file', () => {
      const t = createTree(fx);
      const want = t.read('a/x.ts');
      const got = ['./a/x.ts', 'a//x.ts', 'a/b/../x.ts', 'a\\x.ts'].map((p) => t.read(p));
      return want !== null && got.every((g) => g === want) ? true : `variants differ: ${got.map((g) => g === want)}`;
    });
    run('path/escape-and-absolute-throw-from-every-method', () => {
      const t = createTree(fx);
      const bad = [];
      for (const [name, fn] of Object.entries({
        read: (p) => t.read(p), code: (p) => t.code(p), codeKind: (p) => t.codeKind(p), codeIssues: (p) => t.codeIssues(p), codeStrict: (p) => t.codeStrict(p),
        exists: (p) => t.exists(p), isFile: (p) => t.isFile(p), isDir: (p) => t.isDir(p), list: (p) => t.list(p), listNonEmpty: (p) => t.listNonEmpty(p), symlinks: (p) => t.symlinks(p),
        edit: (p) => t.edit(p, (s) => s + 'x'), replace: (p) => t.replace(p, 'a', 'b'), add: (p) => t.add(p, 'x'), remove: (p) => t.remove(p), trackingState: (p) => t.trackingState(p),
      })) {
        for (const p of ['../x', 'a/../../x', '/etc/passwd']) if (!throwsOf(() => fn(p))) bad.push(`${name}(${p})`);
      }
      return bad.length === 0 ? true : `did not throw: ${bad.join(' ')}`;
    });

    // ---- read / overlay authority -----------------------------------------------------------
    const readChecks = {
      'read/disk-file': (mk) => (mk(fx, {}).read('a/x.ts') === 'export const x = 1; // CMT_T1\n' ? true : 'wrong content'),
      'read/missing-and-directory-are-null': (mk) => {
        const t = mk(fx, {});
        return t.read('a/none.ts') === null && t.read('a') === null && t.read('a/node_modules/none') === null ? true : 'not null';
      },
      'read/overlay-wins-over-disk': (mk) => (mk(fx, { 'a/x.ts': 'OVERLAY' }).read('a/x.ts') === 'OVERLAY' ? true : 'disk won'),
      'read/overlay-null-means-deleted': (mk) => {
        const t = mk(fx, { 'a/x.ts': null });
        return t.read('a/x.ts') === null && t.exists('a/x.ts') === false && t.isFile('a/x.ts') === false ? true : `read=${JSON.stringify(t.read('a/x.ts'))} exists=${t.exists('a/x.ts')}`;
      },
      'read/overlay-adds-a-file-not-on-disk': (mk) => {
        const t = mk(fx, { 'new/f.ts': 'N' });
        return t.read('new/f.ts') === 'N' && t.exists('new/f.ts') && t.isDir('new') ? true : 'overlay file invisible';
      },
    };
    for (const [name, fn] of Object.entries(readChecks)) defCheck(name, fn);

    // ---- exists / isFile / isDir -----------------------------------------------------------
    run('exists/file-dir-missing', () => {
      const t = createTree(fx);
      const r = [t.exists('a/x.ts'), t.exists('a/b'), t.exists('a/zzz'), t.isFile('a/b'), t.isDir('a/b'), t.isFile('a/x.ts'), t.isDir('a/x.ts'), t.exists(''), t.isDir('empty')];
      return JSON.stringify(r) === JSON.stringify([true, true, false, false, true, true, false, true, true]) ? true : JSON.stringify(r);
    });
    run('exists/dir-emptied-by-overlay-deletions-is-gone', () => {
      const t = createTree(fx, { 'a/b/y.tsx': null });
      return t.isDir('a/b') === false && t.exists('a/b') === false && t.isDir('a') === true ? true : `a/b dir=${t.isDir('a/b')}`;
    });
    run('exists/dir-keeps-existing-when-a-disk-file-survives-an-overlay-deletion', () => {
      const t = createTree(fx, { 'a/x.ts': null });
      return t.isDir('a') === true && t.exists('a') === true ? true : 'dir vanished although files remain on disk';
    });
    run('exists/dir-with-a-live-overlay-sibling-survives-a-deletion', () => {
      const t = createTree(fx, { 'a/b/y.tsx': null, 'a/b/new.ts': 'n' });
      return t.isDir('a/b') === true ? true : 'dir vanished although a file lives in it';
    });

    // ---- the kind map, and what each stripper does through the Tree ---------------------------
    run('kind/stripKindFor-table', () => {
      const bad = KIND_TABLE.filter(([rel, raw, kind]) => stripKindFor(rel, raw) !== kind).map(([rel, raw, kind]) => `${rel}${raw === undefined ? '' : '+shebang'}!=${kind}(${stripKindFor(rel, raw)})`);
      return bad.length === 0 ? true : bad.join(' ');
    });
    run('kind/codeKind-is-by-name-for-a-missing-file-and-by-content-for-a-shebang', () => {
      const t = createTree(fx, { 'bin/tool': '#!/bin/sh\n# c\n', 'bin/plain': 'x\n' });
      return t.codeKind('nope/none.sh') === 'sh' && t.codeKind('nope/Dockerfile') === 'dockerfile' && t.codeKind('bin/tool') === 'sh' && t.codeKind('bin/plain') === 'none' && t.codeKind('nope/tool') === 'none' ? true : 'wrong';
    });
    defCheck('code/every-stripped-kind-removes-comments-keeps-literals-and-length', (mk) => {
      const ov = {};
      KIND_CASES.forEach(([rel, , build], i) => { ov[rel] = build(`CMT_K${i}`, `KEEP_K${i}`); });
      const t = mk(fx, ov);
      const bad = [];
      KIND_CASES.forEach(([rel, kind], i) => {
        const raw = t.read(rel);
        const code = t.code(rel);
        if (t.codeKind(rel) !== kind) bad.push(`${rel}:kind=${t.codeKind(rel)}`);
        else if (raw === null || !raw.includes(`CMT_K${i}`) || !raw.includes(`KEEP_K${i}`)) bad.push(`${rel}:vacuous-case`);
        else if (code.includes(`CMT_K${i}`)) bad.push(`${rel}:comment-survived`);
        else if (!code.includes(`KEEP_K${i}`)) bad.push(`${rel}:literal-lost`);
        else if (code.length !== raw.length) bad.push(`${rel}:length-changed`);
        else if (JSON.stringify(t.codeIssues(rel)) !== '[]') bad.push(`${rel}:issues=${JSON.stringify(t.codeIssues(rel))}`);
        else if (t.codeStrict(rel) !== code) bad.push(`${rel}:codeStrict-differs`);
      });
      return bad.length === 0 ? true : `wrong for: ${bad.join(' ')}`;
    });
    defCheck('code/a-comment-documenting-a-tokens-absence-never-matches', (mk) => {
      // the historic false positive, for the files CLAUDE.md puts on the deploy / ops surface
      const tok = 'FORBIDDEN_' + 'TOKEN';
      const t = mk(fx, {
        'ops/deploy.sh': `# never calls ${tok}\necho ok\n`,
        Dockerfile: `# no ${tok}\nFROM scratch\n`,
        Caddyfile: `# we do not use ${tok}\nexample.test { }\n`,
        '.env.production': `# without ${tok}\nA=1\n`,
        '.github/workflows/w.yml': `jobs:\n  a:\n    steps:\n      - run: |\n          # documented absence of ${tok}\n          echo hi\n`,
      });
      const bad = ['ops/deploy.sh', 'Dockerfile', 'Caddyfile', '.env.production', '.github/workflows/w.yml'].filter((f) => t.code(f) === null || t.code(f).includes(tok));
      const live = createTree(fx, { 'ops/live.sh': `echo ${tok}\n` }); // the token as CODE must still match
      return bad.length === 0 && live.code('ops/live.sh').includes(tok) ? true : `comment still matched in: ${bad.join(',')}`;
    });
    defCheck('code/yaml-strips-shell-comments-of-run-bodies-only', (mk) => {
      const wf = [
        'jobs:', '  a:', '    steps:',
        '      - run: |', '          # CMT_RUN1 documented absence', '          echo "build #1"   # CMT_RUN2', '          echo ok',
        '      - name: n', '        body: |', '          # KEEP_MD heading', '          text',
        '      - run: >-', '          # CMT_RUN3', '          echo y',
        '      - run: echo z # CMT_RUN4', '',
      ].join('\n');
      const t = mk(fx, { '.github/workflows/w.yml': wf });
      const c = t.code('.github/workflows/w.yml');
      const bad = [];
      for (const m of ['CMT_RUN1', 'CMT_RUN2', 'CMT_RUN3', 'CMT_RUN4']) if (c.includes(m)) bad.push(m + '-survived');
      if (!c.includes('echo "build #1"')) bad.push('quoted-hash-lost');
      if (!c.includes('# KEEP_MD heading')) bad.push('non-run-block-scalar-body-stripped');
      if (c.length !== wf.length) bad.push('length-changed');
      return bad.length === 0 ? true : bad.join(',');
    });
    defCheck('code/codeIssues-passes-through-what-each-stripper-could-not-close', (mk) => {
      const ov = {};
      for (const [rel, , src] of ISSUE_CASES) ov[rel] = src;
      const t = mk(fx, ov);
      const bad = [];
      for (const [rel, kind, , wantKind, wantLine] of ISSUE_CASES) {
        const i = t.codeIssues(rel);
        if (t.codeKind(rel) !== kind) bad.push(`${rel}:kind`);
        else if (!Array.isArray(i) || i.length !== 1 || i[0].kind !== wantKind || i[0].line !== wantLine) bad.push(`${rel}:${JSON.stringify(i)}`);
      }
      return bad.length === 0 ? true : `wrong for: ${bad.join(' ')}`;
    });
    defCheck('code/each-kind-is-routed-to-its-own-stripper', (mk) => {
      // Each row is a document on which the stripper of ONE kind differs from the other kinds' strippers.
      const ROUTES = [
        ['r/a.sh', "echo 'x # KEEP_R1' # CMT_R1\n"], // sh: single quotes protect, trailing comments go
        ['r/Dockerfile', 'RUN cat <<EOF\n# KEEP_R2\nEOF\n# CMT_R2\nRUN echo x # KEEP_R2b\n'], // docker: heredoc body and trailing # kept, full-line # go
        ['r/.env', "K='a\n# KEEP_R3\nb'\n# CMT_R3\nL=v # KEEP_R3b\n"], // dotenv: a # inside a multi-line value and trailing # kept
        ['r/Caddyfile', "example.test { # CMT_R4\n  respond \"# KEEP_R4\"\n  respond 'a # CMT_R4c\n  respond <<HTML\n  # KEEP_R4b\n  HTML 200\n  # CMT_R4d\n}\n"], // caddy: ' is not a quote, <<HTML ... HTML 200 is a here-document
        ['r/w.yml', 'a:\n  - run: |\n      echo x # CMT_R5\n      echo "# KEEP_R5"\n    name: n # CMT_R5b\n'], // yaml: run body is shell; the YAML comment goes too
      ];
      const ov = {};
      for (const [rel, src] of ROUTES) ov[rel] = src;
      const t = mk(fx, ov);
      const bad = [];
      for (const [rel, src] of ROUTES) {
        const code = t.code(rel);
        for (const m of src.match(/(?:KEEP|CMT)_R\d[a-z]?/g)) {
          const keep = m.startsWith('KEEP');
          if (keep && !code.includes(m)) bad.push(`${rel}:${m}-lost`);
          if (!keep && code.includes(m)) bad.push(`${rel}:${m}-survived`);
        }
      }
      return bad.length === 0 ? true : bad.join(' ');
    });
    defCheck('code/a-kind-without-a-stripper-is-not-reported-as-a-clean-parse', (mk) => {
      const ov = {};
      for (const [rel, src] of NONE_CASES) ov[rel] = src;
      const t = mk(fx, ov);
      const bad = [];
      for (const [rel, src] of NONE_CASES) {
        if (t.codeKind(rel) !== 'none') bad.push(`${rel}:kind=${t.codeKind(rel)}`);
        else if (t.code(rel) !== src) bad.push(`${rel}:code-not-raw`);
        else if (t.codeIssues(rel) !== null) bad.push(`${rel}:issues=${JSON.stringify(t.codeIssues(rel))}`);
        else {
          const e = throwsOf(() => t.codeStrict(rel));
          if (!e || e.name !== 'UnstrippedKind' || e.rel !== rel) bad.push(`${rel}:codeStrict=${e && e.name}`);
        }
      }
      return bad.length === 0 ? true : `wrong for: ${bad.join(' ')}`;
    });
    run('code/codeStrict-and-codeIssues-of-a-missing-file-are-null', () => {
      const t = createTree(fx);
      return t.code('a/none.ts') === null && t.codeIssues('a/none.ts') === null && t.codeStrict('a/none.ts') === null && t.codeStrict('a/none.md') === null && t.codeIssues('a/none.md') === null ? true : 'not null';
    });
    run('code/codeIssues-returns-a-copy', () => {
      const t = createTree(fx, { 'o/bad.ts': 'const a = 1;\n/* never closed\n' });
      const a = t.codeIssues('o/bad.ts');
      a[0].kind = 'tampered';
      a.push({ kind: 'extra', line: 9 });
      const b = t.codeIssues('o/bad.ts');
      return b.length === 1 && b[0].kind === 'unterminated-block-comment' ? true : 'caller mutation leaked into the memo';
    });
    run('code/strips-per-extension', () => {
      const t = createTree(fx);
      const bad = [];
      if (t.code('a/x.ts').includes('CMT_T1') || !t.code('a/x.ts').includes('export const x = 1;')) bad.push('ts');
      const tsx = t.code('a/b/y.tsx');
      if (tsx.includes('CMT_T2') || !tsx.includes('a // KEEP_T2</p>')) bad.push('tsx');
      const sql = t.code('a/sub/c.sql');
      if (sql.includes('CMT_T3') || !sql.includes("'-- KEEP_T3'")) bad.push('sql');
      const yml = t.code('a/ci.yml');
      if (yml.includes('CMT_T4') || !yml.includes('"v # KEEP_T4"')) bad.push('yaml');
      const json = t.code('a/data.json');
      if (json.includes('CMT_T5') || !json.includes('http://h.test')) bad.push('json');
      if (t.code('a/run.sh').includes('CMT_T9') || !t.code('a/run.sh').includes('echo hi')) bad.push('sh');
      return bad.length === 0 ? true : `wrong for: ${bad.join(',')}`;
    });
    run('code/ts-and-tsx-differ-on-jsx-text', () => {
      const body = 'export const e = <p>see http://h.test // X_T6</p>; export const k = 1;\n';
      const t = createTree(fx, { 'o/a.ts': body, 'o/a.tsx': body });
      return !t.code('o/a.ts').includes('export const k = 1;') && t.code('o/a.tsx').includes('export const k = 1;') ? true : 'extension did not select the JSX mode';
    });
    run('code/missing-file-is-null', () => {
      const t = createTree(fx);
      return t.code('a/none.ts') === null && t.codeIssues('a/none.ts') === null ? true : 'not null';
    });
    run('code/overlay-content-is-what-gets-stripped', () => {
      const t = createTree(fx, { 'a/x.ts': 'const only = 1; // CMT_T7\n' });
      return !t.code('a/x.ts').includes('CMT_T7') && t.code('a/x.ts').includes('const only = 1;') ? true : 'stripped disk content instead';
    });
    run('code/codeIssues-flags-an-unclosed-construct', () => {
      const t = createTree(fx, { 'o/bad.ts': 'const a = 1;\n/* never closed\nconst b = 2;\n' });
      const i = t.codeIssues('o/bad.ts');
      return i.length === 1 && i[0].kind === 'unterminated-block-comment' && i[0].line === 2 ? true : JSON.stringify(i);
    });
    run('code/memoised-and-shared-across-derived-trees', () => {
      const t = createTree(fx);
      t.code('a/x.ts');
      const s1 = t.stats().strips;
      t.code('a/x.ts');
      const s2 = t.stats().strips;
      const d = t.add('o/unrelated.ts', 'const q = 1;\n');
      d.code('a/x.ts'); // unchanged content in a derived tree must not be re-stripped
      const s3 = t.stats().strips;
      const e = t.edit('a/x.ts', (s) => s + '// extra\n');
      e.code('a/x.ts'); // changed content must be stripped (no stale cache hit)
      const s4 = t.stats().strips;
      return s1 === s2 && s2 === s3 && s4 === s3 + 1 ? true : `strips: ${s1},${s2},${s3},${s4}`;
    });
    run('code/strip-cache-is-keyed-by-kind-as-well-as-content', () => {
      const same = '# CMT_SAME\nx\n';
      const t = createTree(fx, { 'o/w.sh': same, 'o/w.md': same });
      return t.code('o/w.sh').includes('CMT_SAME') === false && t.code('o/w.md') === same ? true : 'a stripped copy was served for a file of another kind';
    });
    run('stats/diskReads-and-walks-are-cached-and-stats-is-a-copy', () => {
      const t = createTree(fx);
      t.read('a/x.ts');
      const r1 = t.stats().diskReads;
      t.read('a/x.ts');
      createTree(fx).read('a/x.ts');
      const r2 = t.stats().diskReads;
      const u = createTree(fx);
      u.list('a');
      u.list('a', { ext: '.ts' });
      u.add('o/n.ts', 'x').list('a');
      const w1 = u.stats().walks;
      const s = u.stats();
      s.walks = 99;
      return r1 === 1 && r2 === 1 && w1 === 1 && u.stats().walks === 1 && JSON.stringify(Object.keys(u.stats()).sort()) === '["diskReads","gitCalls","strips","walks"]' ? true : `reads ${r1},${r2} walks ${w1},${u.stats().walks}`;
    });

    // ---- list() ------------------------------------------------------------------------------
    const listChecks = {
      'list/recursive-sorted-and-skips-node_modules-git-dist-next': (mk) => {
        const got = mk(fx, {}).list('a');
        const want = ['a/b/y.tsx', 'a/ci.yml', 'a/data.json', 'a/deep/keep.js', 'a/run.sh', 'a/sub/c.sql', 'a/x.ts'];
        return JSON.stringify(got) === JSON.stringify(want) ? true : JSON.stringify(got);
      },
      'list/prefix-respects-segment-boundary': (mk) => {
        const got = mk(fx, { 'a2/added.ts': 'x', 'a-b/added.ts': 'y' }).list('a'); // overlay paths that merely START with "a"
        return got.every((p) => p.startsWith('a/')) && !got.includes('a2/other.ts') && !got.includes('a2/added.ts') && !got.includes('a-b/added.ts') ? true : 'a sibling directory leaked into a';
      },
      'list/root-listing-includes-everything-visible': (mk) => {
        const got = mk(fx, {}).list('');
        return got.includes('a2/other.ts') && got.includes('a/x.ts') && got.includes('Plain.TXT') && !got.some((p) => /(^|\/)(node_modules|\.git|dist|\.next)(\/|$)/.test(p)) ? true : 'root listing wrong';
      },
      'list/ext-filter-string-array-and-case': (mk) => {
        const t = mk(fx, {});
        const a = t.list('a', { ext: '.ts' });
        const b = t.list('a', { ext: ['ts', '.tsx'] });
        const c = t.list('', { ext: '.txt' });
        const d = t.list('', { ext: '.TXT' }); // a requested ext is case-insensitive too
        const e = mk(fx, { 'a/bcts': 'no dot' }).list('a', { ext: 'ts' }); // 'ts' means '.ts', not "ends with ts"
        return JSON.stringify(e) === '["a/x.ts"]' && JSON.stringify(a) === '["a/x.ts"]' && JSON.stringify(b) === '["a/b/y.tsx","a/x.ts"]' && JSON.stringify(c) === '["Plain.TXT"]' && JSON.stringify(d) === '["Plain.TXT"]' ? true : `${JSON.stringify(a)} ${JSON.stringify(b)} ${JSON.stringify(c)} ${JSON.stringify(d)}`;
      },
      'list/overlay-add-remove-and-null-hide': (mk) => {
        const t = mk(fx, { 'a/new.ts': 'n', 'a/x.ts': null, 'a/node_modules/hidden.ts': 'h' });
        const got = t.list('a');
        const sorted = JSON.stringify(got) === JSON.stringify([...got].sort()); // a/new.ts lands mid-list, so unsorted merge is caught
        return got.includes('a/new.ts') && !got.includes('a/x.ts') && !got.includes('a/node_modules/hidden.ts') && sorted ? true : JSON.stringify(got);
      },
      'list/overlay-skips-skip-dirs-at-any-depth-below-the-prefix': (mk) => {
        const got = mk(fx, { 'a/deep/node_modules/h.ts': 'h', 'a/deep/x/dist/h.ts': 'h', 'a/deep/ok.ts': 'ok' }).list('a');
        return got.includes('a/deep/ok.ts') && !got.includes('a/deep/node_modules/h.ts') && !got.includes('a/deep/x/dist/h.ts') ? true : JSON.stringify(got.filter((p) => /deep/.test(p)));
      },
      'list/missing-prefix-and-file-prefix-are-empty': (mk) => {
        const t = mk(fx, {});
        return t.list('nope').length === 0 && t.list('a/x.ts').length === 0 ? true : 'not empty';
      },
    };
    for (const [name, fn] of Object.entries(listChecks)) defCheck(name, fn);
    run('list/empty-ext-array-and-bad-ext-throw-TypeError', () => (throwsOf(() => createTree(fx).list('a', { ext: [] })) instanceof TypeError && throwsOf(() => createTree(fx).list('a', { ext: [''] })) instanceof TypeError && throwsOf(() => createTree(fx).list('a', { ext: [5] })) instanceof TypeError ? true : 'no TypeError'));
    run('list/ext-null-or-missing-options-mean-no-filter', () => {
      const t = createTree(fx);
      const all = t.list('a').length;
      return t.list('a', { ext: null }).length === all && t.list('a', {}).length === all && t.list('a', undefined).length === all ? true : 'filtered';
    });
    run('list/returns-a-frozen-array-and-memoises-per-prefix-and-ext', () => {
      const t = createTree(fx);
      const l = t.list('a');
      const lx = t.list('a', { ext: '.ts' });
      return Object.isFrozen(l) && throwsOf(() => l.push('x')) && lx !== l && lx.length === 1 && t.list('a') === l && l.length === 7 ? true : 'not frozen / memo keyed wrongly';
    });
    run('list/explicit-prefix-inside-a-skipped-dir-still-lists', () => (createTree(fx).list('a/node_modules').join() === 'a/node_modules/z.ts' ? true : 'did not list'));
    run('listNonEmpty/throws-VacuousScan-on-empty-and-passes-on-non-empty', () => {
      const t = createTree(fx);
      const e = throwsOf(() => t.listNonEmpty('nope'));
      const e2 = throwsOf(() => t.listNonEmpty('a', { ext: '.nothing' }));
      const e3 = throwsOf(() => t.listNonEmpty('./nope/'));
      return e instanceof VacuousScan && e2 instanceof VacuousScan && e.prefix === 'nope' && e3 instanceof VacuousScan && e3.prefix === 'nope' && t.listNonEmpty('a').length === 7 ? true : `${e && e.name},${e2 && e2.name},${e3 && e3.prefix}`;
    });

    // ---- symlinks are not members; `.git` is never content ----------------------------------------
    defCheck('symlink/links-are-not-listed-read-or-followed', (mk) => {
      const t = mk(fx, {});
      const bad = [];
      const a = t.list('a');
      if (a.some((p) => /link|loop/.test(p))) bad.push('listed:' + a.filter((p) => /link|loop/.test(p)).join('|'));
      if (a.filter((p) => t.read(p) === t.read('a/x.ts')).length !== 1) bad.push('double-counted');
      if (t.list('a/linkdir').length !== 0) bad.push('list-through-symlinked-prefix');
      if (t.list('a/linkfile.ts').length !== 0) bad.push('list-of-symlinked-file');
      for (const p of ['a/linkfile.ts', 'a/linkdir/other.ts', 'a/loop', 'a/linkdir']) if (t.read(p) !== null) bad.push('read:' + p);
      if (t.isFile('a/linkfile.ts') || t.isFile('a/linkdir/other.ts') || t.exists('a/linkdir') || t.isDir('a/linkdir') || t.exists('a/loop')) bad.push('exists/isFile/isDir');
      if (t.code('a/linkfile.ts') !== null || t.codeIssues('a/linkdir/other.ts') !== null) bad.push('code-through-link');
      if (t.list('').some((p) => /link|loop/.test(p))) bad.push('root-listing');
      return bad.length === 0 ? true : bad.join(' ');
    });
    run('symlink/symlinks-reports-them-sorted-and-scoped', () => {
      const t = createTree(fx);
      return sameList(t.symlinks('a'), ['a/linkdir', 'a/linkfile.ts', 'a/loop']) === true && sameList(t.symlinks(''), ['a/linkdir', 'a/linkfile.ts', 'a/loop', 's/b-1', 's/b/l1']) === true && sameList(t.symlinks('s'), ['s/b-1', 's/b/l1']) === true && t.symlinks('a2').length === 0 && t.symlinks('a/b').length === 0 && t.symlinks('a/linkdir').length === 0 && Object.isFrozen(t.symlinks('a')) ? true : JSON.stringify([t.symlinks('a'), t.symlinks(''), t.symlinks('a2')]);
    });
    run('symlink/overlay-can-still-create-a-file-where-a-link-sits', () => (createTree(fx, { 'a/linkfile.ts': 'OVL' }).read('a/linkfile.ts') === 'OVL' ? true : 'overlay ignored at a link path'));
    defCheck('dot-git/a-dot-git-file-or-directory-is-never-content', (mk) => {
      const t = mk(fx, {});
      const bad = [];
      if (t.read('.git') !== null) bad.push('read(.git)');
      if (t.read('a/.git/config') !== null) bad.push('read(a/.git/config)');
      if (t.exists('.git') || t.isFile('.git') || t.isDir('a/.git') || t.exists('a/.git/config')) bad.push('exists');
      if (t.list('').includes('.git')) bad.push('listed-file');
      if (t.list('a/.git').length !== 0) bad.push('listed-dir-by-prefix');
      if (t.code('.git') !== null) bad.push('code');
      return bad.length === 0 ? true : bad.join(' ');
    });
    run('read/unexpected-fs-error-is-not-swallowed-as-null', () => {
      const e = throwsOf(() => createTree(fx).read('a/' + 'n'.repeat(300))); // ENAMETOOLONG, not "missing"
      return e && e.code === 'ENAMETOOLONG' ? true : `threw ${e && (e.code || e.name)}`;
    });

    // ---- edit / replace / add / remove ----------------------------------------------------
    const mutChecks = {
      'edit/returns-new-tree-original-untouched': (mk) => {
        const t = mk(fx, {});
        const t2 = t.edit('a/x.ts', (s) => s.replace('= 1', '= 2'));
        return t.read('a/x.ts').includes('= 1') && t2.read('a/x.ts').includes('= 2') && t !== t2 ? true : 'original changed or same object';
      },
      'edit/identical-result-throws-VacuousMutation': (mk) => {
        const e = throwsOf(() => mk(fx, {}).edit('a/x.ts', (s) => s));
        return e && e.name === 'VacuousMutation' && e.reason === 'no-op' && e.rel === 'a/x.ts' && e.op === 'edit' ? true : `threw ${e && e.name}/${e && e.reason}`;
      },
      'edit/missing-file-throws-VacuousMutation': (mk) => {
        const e = throwsOf(() => mk(fx, {}).edit('a/none.ts', (s) => s + 'x'));
        return e && e.name === 'VacuousMutation' && e.reason === 'missing-file' ? true : `threw ${e && e.name}/${e && e.reason}`;
      },
      'edit/non-string-result-throws-TypeError': (mk) => (throwsOf(() => mk(fx, {}).edit('a/x.ts', () => 42)) instanceof TypeError ? true : 'no TypeError'),
      'edit/chains-and-composes': (mk) => {
        const t = mk(fx, {}).edit('a/x.ts', (s) => s + 'A').edit('a/x.ts', (s) => s + 'B');
        return t.read('a/x.ts').endsWith('AB') ? true : 'did not compose';
      },
      'replace/string-is-literal-and-replaces-all': (mk) => {
        const t = mk(fx, { 'r/f.ts': 'a.b a.b $& a.b\n' });
        const t2 = t.replace('r/f.ts', 'a.b', '$&-X');
        return t2.read('r/f.ts') === '$&-X $&-X $& $&-X\n' ? true : JSON.stringify(t2.read('r/f.ts'));
      },
      'replace/regex-uses-its-own-flags': (mk) => {
        const t = mk(fx, { 'r/f.ts': 'aXa aXa\n' });
        const first = t.replace('r/f.ts', /a(X)a/, '[$1]').read('r/f.ts');
        const all = t.replace('r/f.ts', /a(X)a/g, '[$1]').read('r/f.ts');
        return first === '[X] aXa\n' && all === '[X] [X]\n' ? true : `${JSON.stringify(first)} ${JSON.stringify(all)}`;
      },
      'replace/regex-with-global-flag-is-not-stateful': (mk) => {
        const re = /q/g;
        const t = mk(fx, { 'r/f.ts': 'qqq\n' });
        const a = t.replace('r/f.ts', re, 'z').read('r/f.ts');
        const b = t.replace('r/f.ts', re, 'z').read('r/f.ts');
        return a === 'zzz\n' && b === 'zzz\n' ? true : `${JSON.stringify(a)} ${JSON.stringify(b)}`;
      },
      'replace/sticky-flag-is-ignored': (mk) => {
        const t = mk(fx, { 'r/f.ts': 'ab\n' });
        return t.replace('r/f.ts', /b/y, 'X').read('r/f.ts') === 'aX\n' ? true : 'sticky flag changed the match';
      },
      'replace/function-replacement': (mk) => {
        const t = mk(fx, { 'r/f.ts': 'k1 k2\n' });
        return t.replace('r/f.ts', 'k', (m) => m.toUpperCase()).read('r/f.ts') === 'K1 K2\n' && t.replace('r/f.ts', /k(\d)/g, (_m, d) => `n${d}`).read('r/f.ts') === 'n1 n2\n' ? true : 'wrong';
      },
      'replace/no-match-throws-VacuousMutation': (mk) => {
        const a = throwsOf(() => mk(fx, {}).replace('a/x.ts', 'ABSENT_T8', 'y'));
        const b = throwsOf(() => mk(fx, {}).replace('a/x.ts', /ABSENT_T8/, 'y'));
        return a && a.name === 'VacuousMutation' && a.reason === 'no-match' && b && b.name === 'VacuousMutation' && b.reason === 'no-match' ? true : `${a && a.reason},${b && b.reason}`;
      },
      'replace/no-net-change-throws-VacuousMutation': (mk) => {
        const e = throwsOf(() => mk(fx, {}).replace('a/x.ts', 'export', 'export'));
        return e && e.name === 'VacuousMutation' && e.reason === 'no-op' ? true : `threw ${e && e.name}/${e && e.reason}`;
      },
      'replace/missing-file-throws-VacuousMutation': (mk) => {
        const e = throwsOf(() => mk(fx, {}).replace('a/none.ts', 'a', 'b'));
        return e && e.name === 'VacuousMutation' && e.reason === 'missing-file' && e.op === 'replace' ? true : `threw ${e && e.name}/${e && e.reason}`;
      },
      'replace/empty-pattern-and-bad-pattern-throw-TypeError': (mk) => (throwsOf(() => mk(fx, {}).replace('a/x.ts', '', 'y')) instanceof TypeError && throwsOf(() => mk(fx, {}).replace('a/x.ts', 5, 'y')) instanceof TypeError ? true : 'no TypeError'),
      'add/new-file-visible-and-existing-file-refused': (mk) => {
        const t = mk(fx, {}).add('n/f.ts', 'N');
        const e = throwsOf(() => mk(fx, {}).add('a/x.ts', 'N'));
        return t.read('n/f.ts') === 'N' && e && e.name === 'VacuousMutation' && e.reason === 'already-exists' && e.op === 'add' ? true : `threw ${e && e.name}/${e && e.reason}`;
      },
      'add/empty-path-and-non-string-content-throw-TypeError': (mk) => (throwsOf(() => mk(fx, {}).add('', 'x')) instanceof TypeError && throwsOf(() => mk(fx, {}).add('./', 'x')) instanceof TypeError && throwsOf(() => mk(fx, {}).add('n/g.ts', 5)) instanceof TypeError ? true : 'no TypeError'),
      'remove/deletes-and-missing-throws': (mk) => {
        const t = mk(fx, {}).remove('a/x.ts');
        const e = throwsOf(() => mk(fx, {}).remove('a/none.ts'));
        const e2 = throwsOf(() => t.remove('a/x.ts'));
        return t.read('a/x.ts') === null && !t.list('a').includes('a/x.ts') && e && e.name === 'VacuousMutation' && e.op === 'remove' && e2 && e2.name === 'VacuousMutation' ? true : 'wrong';
      },
      'remove-then-add-same-path-roundtrips': (mk) => {
        const t = mk(fx, {}).remove('a/x.ts').add('a/x.ts', 'REBORN');
        return t.read('a/x.ts') === 'REBORN' ? true : 'did not roundtrip';
      },
    };
    for (const [name, fn] of Object.entries(mutChecks)) defCheck(name, fn);

    // ---- immutability ---------------------------------------------------------------------
    run('immutable/tree-object-is-frozen-and-assignment-throws', () => {
      const t = createTree(fx);
      return Object.isFrozen(t) && throwsOf(() => { t.read = () => 'pwned'; }) instanceof TypeError ? true : 'not frozen';
    });
    run('immutable/sibling-derivations-are-independent', () => {
      const base = createTree(fx);
      const a = base.edit('a/x.ts', (s) => s + 'A');
      const b = base.edit('a/x.ts', (s) => s + 'B');
      return a.read('a/x.ts').endsWith('A') && b.read('a/x.ts').endsWith('B') && base.read('a/x.ts').endsWith('\n') && !base.read('a/x.ts').includes('A') && base.touched().length === 0 ? true : 'derivations interfered';
    });
    run('immutable/mutating-the-overlay-argument-after-creation-has-no-effect', () => {
      const ov = { 'a/x.ts': 'ORIG' };
      const t = createTree(fx, ov);
      ov['a/x.ts'] = 'CHANGED';
      ov['a/y2.ts'] = 'NEW';
      return t.read('a/x.ts') === 'ORIG' && t.read('a/y2.ts') === null ? true : 'aliasing the caller overlay';
    });
    run('touched/is-sorted-and-reflects-overlay', () => (createTree(fx).edit('a/x.ts', (s) => s + 'z').add('b/n.ts', 'n').remove('a2/other.ts').touched().join() === 'a/x.ts,a2/other.ts,b/n.ts' ? true : 'wrong'));
    run('disk-is-never-written', () => {
      const before = fs.readFileSync(path.join(fx, 'a/x.ts'), 'utf8');
      createTree(fx).edit('a/x.ts', (s) => s + 'MUT').add('a/brand-new.ts', 'x').remove('a2/other.ts');
      return fs.readFileSync(path.join(fx, 'a/x.ts'), 'utf8') === before && !fs.existsSync(path.join(fx, 'a/brand-new.ts')) && fs.existsSync(path.join(fx, 'a2/other.ts')) ? true : 'disk was touched';
    });

    // ---- THE BASE: worktree / tracked / commit -------------------------------------------------
    const WT_LIST = ['.env.production', '.gitignore', 'coverage/b.ts', 'lib/a.ts', 'lib/d/e.ts', 'lib/d/f.ts', 'lib/untracked.ts', 'lib2/other.ts', 'pkg/inner/deep/mod.ts'];
    const TRACKED_LIST = ['.gitignore', 'lib/a.ts', 'lib/d/e.ts', 'lib/d/f.ts', 'lib2/other.ts', 'pkg/inner/deep/mod.ts'];
    const HEAD_LIST = ['.gitignore', 'docs/readme.md', 'lib/a.ts', 'lib/d/e.ts', 'lib/d/f.ts', 'lib2/other.ts', 'pkg/inner/deep/mod.ts'];
    const C1_LIST = ['.gitignore', 'docs/readme.md', 'lib/a.ts', 'lib/d/e.ts', 'lib2/other.ts', 'pkg/inner/deep/mod.ts'];
    const hex40 = (s) => /^[0-9a-f]{40}$/.test(s);

    run('git/worktree-is-the-default-and-sees-untracked-and-ignored-files', needGit((g) => {
      const t = createTree(g.R);
      const p = t.provenance();
      const r = sameList(t.list(''), WT_LIST);
      const outside = createTree(g.ND).provenance();
      return r === true && p.source === 'worktree' && p.commit === null && p.head === g.c2 && outside.head === null && outside.commit === null ? true : `${r} ${JSON.stringify(p)} ${JSON.stringify(outside)}`;
    }));
    run('git/a-missing-git-binary-is-GitUnavailable-not-an-empty-tree', needGit((g) => {
      const had = process.env.PATH;
      process.env.PATH = path.join(g.base, 'no-such-bin');
      try {
        const e = throwsOf(() => createTree(g.R, {}, { source: 'tracked' }));
        const e2 = throwsOf(() => createTree(g.R, {}, { source: 'commit' }));
        const t = createTree(g.R, { 'lib/new.ts': 'x' });
        const st = t.trackingState('lib/a.ts');
        const head = t.provenance().head;
        return e && e.name === 'GitUnavailable' && e2 && e2.name === 'GitUnavailable' && st === 'no-git' && head === null ? true : `${e && e.name},${e2 && e2.name},${st},${head}`;
      } finally {
        process.env.PATH = had;
      }
    }));
    defCheck('git/tracked-source-hides-untracked-ignored-deleted-files-and-symlinks', (mk) => {
      if (!gx) return `git fixture unavailable (${gxErr && gxErr.message})`;
      const t = mk(gx.R, {}, { source: 'tracked' });
      const bad = [];
      const l = sameList(t.list(''), TRACKED_LIST);
      if (l !== true) bad.push('list:' + l);
      for (const p of ['.env.production', 'lib/untracked.ts', 'coverage/b.ts', 'docs/readme.md', 'lib/link.ts']) if (t.read(p) !== null || t.exists(p)) bad.push('visible:' + p);
      if (!(t.read('lib/a.ts') || '').includes('CMT_G3')) bad.push('content-is-not-the-working-copy');
      if (!t.isDir('lib') || !t.isDir('lib/d') || !t.isDir('pkg') || !t.isDir('pkg/inner') || !t.isDir('pkg/inner/deep') || t.isDir('coverage') || t.isDir('docs')) bad.push('dirs');
      if (sameList(t.list('lib'), ['lib/a.ts', 'lib/d/e.ts', 'lib/d/f.ts']) !== true) bad.push('list(lib)');
      if (sameList(t.list('vendor/dist'), ['vendor/dist/bundle.js']) !== true || t.list('').includes('vendor/dist/bundle.js') || t.list('vendor').length !== 0) bad.push('skipped-dir-rule');
      const p = t.provenance();
      if (p.source !== 'tracked' || p.commit !== null) bad.push('provenance');
      return bad.length === 0 ? true : bad.join(' ');
    });
    defCheck('git/commit-source-is-the-commit-not-the-machine', (mk) => {
      if (!gx) return `git fixture unavailable (${gxErr && gxErr.message})`;
      const t = mk(gx.R, {}, { source: 'commit' });
      const bad = [];
      const l = sameList(t.list(''), HEAD_LIST);
      if (l !== true) bad.push('list:' + l);
      const a = t.read('lib/a.ts') || '';
      if (!a.includes('CMT_G2') || a.includes('CMT_G3')) bad.push('content-is-not-the-committed-blob');
      if (t.read('docs/readme.md') !== '# readme\n') bad.push('deleted-on-disk-but-committed');
      for (const p of ['.env.production', 'lib/untracked.ts', 'coverage/b.ts', 'lib/link.ts']) if (t.read(p) !== null) bad.push('visible:' + p);
      if (!t.isDir('docs') || !t.isDir('pkg') || !t.isDir('pkg/inner') || t.isDir('coverage')) bad.push('dirs');
      if (sameList(t.list('lib'), ['lib/a.ts', 'lib/d/e.ts', 'lib/d/f.ts']) !== true) bad.push('list(lib)');
      if (sameList(t.list('vendor/dist'), ['vendor/dist/bundle.js']) !== true || t.list('').includes('vendor/dist/bundle.js') || t.list('vendor').length !== 0) bad.push('skipped-dir-rule');
      const code = t.code('lib/a.ts');
      if (code === null || code.includes('CMT_G2') || !code.startsWith('export const a = 2;') || code.length !== a.length) bad.push('code()');
      const p = t.provenance();
      if (p.source !== 'commit' || p.commit !== gx.c2 || p.head !== gx.c2 || !hex40(p.commit)) bad.push('provenance:' + JSON.stringify(p));
      return bad.length === 0 ? true : bad.join(' ');
    });
    defCheck('git/commit-option-selects-the-commit', (mk) => {
      if (!gx) return `git fixture unavailable (${gxErr && gxErr.message})`;
      const bad = [];
      const a = mk(gx.R, {}, { source: 'commit', commit: gx.c1 });
      if (sameList(a.list(''), C1_LIST) !== true) bad.push('c1-list');
      if (!(a.read('lib/a.ts') || '').includes('CMT_G1')) bad.push('c1-content');
      if (a.provenance().commit !== gx.c1 || a.provenance().head !== gx.c2) bad.push('c1-provenance');
      const b = mk(gx.R, {}, { source: 'commit', commit: 'HEAD~1' });
      if (b.provenance().commit !== gx.c1 || sameList(b.list(''), C1_LIST) !== true) bad.push('HEAD~1');
      const c = mk(gx.R, {}, { source: 'commit', commit: 'HEAD' });
      if (c.provenance().commit !== gx.c2) bad.push('HEAD');
      const d = mk(gx.R, {}, { source: 'commit', commit: gx.c1.slice(0, 10) });
      if (d.provenance().commit !== gx.c1) bad.push('abbreviated-sha-not-resolved-to-full');
      return bad.length === 0 ? true : bad.join(' ');
    });
    run('git/an-unreadable-object-database-fails-closed-never-an-empty-tree', needGit((g) => {
      const bad = [];
      const e = throwsOf(() => createTree(g.BT, {}, { source: 'commit' }));
      if (!e || e.name !== 'GitUnavailable') bad.push(`lost-tree:${e && e.name}`);
      const t = createTree(g.BB, {}, { source: 'commit' }); // the tree is intact: only one BLOB is gone
      if (sameList(t.list(''), ['one.ts', 'two.ts']) !== true || t.read('two.ts') !== 'export const two = 2;\n') bad.push('lost-blob:listing');
      const e2 = throwsOf(() => t.read('one.ts'));
      if (!e2 || !/cat-file/.test(e2.message)) bad.push(`lost-blob:read=${e2 && e2.name}`);
      return bad.length === 0 ? true : bad.join(' ');
    }));
    run('git/tracked-and-commit-fail-closed-never-fall-back-to-the-directory', needGit((g) => {
      const bad = [];
      for (const source of ['tracked', 'commit']) {
        const e = throwsOf(() => createTree(g.ND, {}, { source }));
        if (!e || e.name !== 'GitUnavailable') bad.push(`${source}:${e && e.name}`);
      }
      const e2 = throwsOf(() => createTree(g.R, {}, { source: 'commit', commit: 'no-such-ref-wsi' }));
      if (!e2 || e2.name === 'GitUnavailable' || !/resolve/.test(e2.message)) bad.push(`unresolvable-ref:${e2 && e2.name}/${e2 && e2.message}`);
      return bad.length === 0 ? true : bad.join(' ');
    }));
    defCheck('git/overlay-sits-on-top-of-every-source', (mk) => {
      if (!gx) return `git fixture unavailable (${gxErr && gxErr.message})`;
      const bad = [];
      for (const source of ['tracked', 'commit']) {
        const t = mk(gx.R, { 'lib/new.ts': 'NEW', 'lib/d/e.ts': null, 'lib/a.ts': 'OVL' }, { source });
        const l = t.list('lib');
        if (!l.includes('lib/new.ts') || l.includes('lib/d/e.ts') || t.read('lib/a.ts') !== 'OVL') bad.push(source + ':overlay');
        const e = t.edit('lib/d/f.ts', (s) => s + 'X');
        if (!e.read('lib/d/f.ts').endsWith('X') || e.touched().join() !== 'lib/a.ts,lib/d/e.ts,lib/d/f.ts,lib/new.ts') bad.push(source + ':edit');
        if (t.isDir('lib/d') !== true) bad.push(source + ':dir-with-a-survivor');
      }
      return bad.length === 0 ? true : bad.join(' ');
    });
    defCheck('git/a-linked-worktrees-dot-git-file-is-not-content', (mk) => {
      if (!gx) return `git fixture unavailable (${gxErr && gxErr.message})`;
      if (!fs.statSync(path.join(gx.W, '.git')).isFile()) return 'fixture invalid: the worktree has no .git FILE';
      const bad = [];
      const t = mk(gx.W, {});
      if (sameList(t.list(''), HEAD_LIST) !== true) bad.push('worktree-list:' + JSON.stringify(t.list('')));
      if (t.read('.git') !== null || t.exists('.git') || t.isFile('.git')) bad.push('read(.git)');
      for (const source of ['tracked', 'commit']) {
        const s = mk(gx.W, {}, { source });
        if (sameList(s.list(''), HEAD_LIST) !== true) bad.push(source + '-list');
      }
      const r = mk(gx.R, {});
      if (r.read('.git/HEAD') !== null || r.list('.git').length !== 0 || r.exists('.git')) bad.push('repo-.git-dir');
      return bad.length === 0 ? true : bad.join(' ');
    });
    run('git/a-clean-checkout-has-the-same-files-in-all-three-sources', needGit((g) => {
      const a = createTree(g.W).list('');
      const b = createTree(g.W, {}, { source: 'tracked' }).list('');
      const c = createTree(g.W, {}, { source: 'commit' }).list('');
      return JSON.stringify(a) === JSON.stringify(b) && JSON.stringify(b) === JSON.stringify(c) && a.length === HEAD_LIST.length ? true : `${a.length},${b.length},${c.length}`;
    }));
    defCheck('git/tracked-symlink-is-not-a-member-in-any-source', (mk) => {
      if (!gx) return `git fixture unavailable (${gxErr && gxErr.message})`;
      const bad = [];
      for (const source of ['worktree', 'tracked', 'commit']) {
        const t = mk(gx.R, {}, { source });
        if (JSON.stringify(t.symlinks('')) !== '["lib/link.ts"]' || JSON.stringify(t.symlinks('lib')) !== '["lib/link.ts"]' || t.symlinks('docs').length !== 0) bad.push(source + ':symlinks()');
        if (t.list('').includes('lib/link.ts') || t.read('lib/link.ts') !== null || t.isFile('lib/link.ts')) bad.push(source + ':member');
      }
      return bad.length === 0 ? true : bad.join(' ');
    });
    defCheck('git/trackingState-says-whether-a-path-is-part-of-the-repository', (mk) => {
      if (!gx) return `git fixture unavailable (${gxErr && gxErr.message})`;
      const bad = [];
      const exp = (t, label, table) => { for (const [p, want] of table) if (t.trackingState(p) !== want) bad.push(`${label}:${p}=${t.trackingState(p)}!=${want}`); };
      exp(mk(gx.R, { 'lib/new.ts': 'N', 'lib/d/e.ts': null }), 'worktree', [
        ['lib/a.ts', 'tracked'], ['lib/untracked.ts', 'untracked'], ['.env.production', 'ignored'], ['coverage/b.ts', 'ignored'], ['.gitignore', 'tracked'],
        ['lib/nope.ts', 'absent'], ['docs/readme.md', 'absent'], ['lib/link.ts', 'absent'], ['lib/new.ts', 'overlay'], ['lib/d/e.ts', 'absent'], ['lib', 'absent'],
      ]);
      exp(mk(gx.R, {}, { source: 'tracked' }), 'tracked', [['lib/a.ts', 'tracked'], ['lib/untracked.ts', 'absent'], ['.env.production', 'absent']]);
      exp(mk(gx.R, { 'lib/new.ts': 'N' }, { source: 'commit' }), 'commit', [['lib/a.ts', 'commit'], ['docs/readme.md', 'commit'], ['lib/untracked.ts', 'absent'], ['lib/new.ts', 'overlay']]);
      exp(mk(gx.ND, {}), 'no-git', [['p.ts', 'no-git'], ['nope.ts', 'absent']]);
      return bad.length === 0 ? true : bad.join(' ');
    });
    run('git/ambient-GIT_DIR-does-not-redirect-the-tree', needGit((g) => {
      const had = Object.prototype.hasOwnProperty.call(process.env, 'GIT_DIR') ? process.env.GIT_DIR : undefined;
      process.env.GIT_DIR = path.join(g.base, 'no-such-git-dir');
      try {
        const t = createTree(g.R, {}, { source: 'tracked' });
        const c = createTree(g.R, {}, { source: 'commit' });
        return sameList(t.list(''), TRACKED_LIST) === true && c.provenance().commit === g.c2 && createTree(g.R).trackingState('lib/untracked.ts') === 'untracked' ? true : 'GIT_DIR changed the answer';
      } finally {
        if (had === undefined) delete process.env.GIT_DIR;
        else process.env.GIT_DIR = had;
      }
    }));
    run('git/git-is-only-asked-when-the-source-or-trackingState-needs-it', needGit((g) => {
      const t = createTree(g.R);
      t.list('');
      t.read('lib/a.ts');
      const quiet = t.stats().gitCalls;
      t.trackingState('lib/a.ts');
      const asked = t.stats().gitCalls;
      t.trackingState('lib/d/e.ts'); // the index is read ONCE per tree family
      t.trackingState('lib/a.ts');
      const again = t.stats().gitCalls;
      t.provenance();
      const prov = t.stats().gitCalls;
      t.provenance();
      createTree(g.R, {}, { source: 'commit' }).provenance(); // HEAD was resolved by the commit load already; a new tree asks for itself
      const prov2 = t.stats().gitCalls;
      return quiet === 0 && asked === 1 && again === asked && prov === asked + 1 && prov2 === prov ? true : `gitCalls ${quiet} -> ${asked} -> ${again} -> ${prov} -> ${prov2}`;
    }));

    // ---- behaviours an independent mutation sweep found NOTHING pinning ------------------------------------------
    // (operator-generated mutants of the implementation: each check below fails against at least one of them; the
    //  matching hand-written mutants are in MUTATIONS so the audit keeps proving it)
    const mini = (label, files, o) => {
      const m = makeMini(label, files, o);
      minis.push(m.base);
      return m;
    };

    run('git/directories-of-the-tracked-and-commit-sources-are-exactly-the-parents-of-members', needGit(() => {
      // one-character directory names, a directory that is a prefix of a file name, and skipped names AT THE ROOT
      const m = mini('dirs', { 'q/r.ts': 'r', 'q/s/t.ts': 't', 'ab/cd/ef.ts': 'e', 'x.ts': 'x', 'dist/top.js': 'd', 'node_modules/m/i.js': 'n', '.next/n.js': 'n', 'lib/node_modules/dep.js': 'p', 'lib/ok.ts': 'k' }, { git: true });
      const bad = [];
      for (const source of ['tracked', 'commit']) {
        const t = createTree(m.R, {}, { source });
        for (const d of ['q', 'q/s', 'ab', 'ab/cd', 'dist', 'lib']) if (t.isDir(d) !== true) bad.push(`${source}:isDir(${d}) is not true`);
        for (const d of ['q/r.t', 'q/r', 'a', 'ab/c', 'ab/cd/e', 'ab/cd/ef.t', 'x', 'qq']) if (t.isDir(d) !== false) bad.push(`${source}:isDir(${d}) is not false`);
        const l = sameList(t.list(''), ['ab/cd/ef.ts', 'lib/ok.ts', 'q/r.ts', 'q/s/t.ts', 'x.ts']);
        if (l !== true) bad.push(`${source}:list ${l}`);
        if (sameList(t.list('dist'), ['dist/top.js']) !== true) bad.push(`${source}:list(dist)`);
        if (sameList(t.list('lib'), ['lib/ok.ts']) !== true) bad.push(`${source}:list(lib)`);
      }
      return bad.length === 0 ? true : bad.join(' ');
    }));
    run('disk/a-one-character-symlinked-directory-is-not-passed-through', () => {
      const m = mini('link1', { 'real/f.ts': 'REAL' }, { links: { Z: 'real' } });
      const t = createTree(m.R);
      const bad = [];
      if (t.read('Z/f.ts') !== null) bad.push('read');
      if (t.exists('Z/f.ts') || t.isFile('Z/f.ts') || t.isDir('Z')) bad.push('exists');
      if (t.list('Z').length !== 0 || t.list('').includes('Z/f.ts')) bad.push('list');
      if (sameList(t.symlinks(''), ['Z']) !== true) bad.push('symlinks');
      return bad.length === 0 ? true : bad.join(' ');
    });
    run('stats/a-fresh-tree-has-done-nothing', () => {
      const s = JSON.stringify(createTree(fx).stats());
      return s === '{"diskReads":0,"walks":0,"strips":0,"gitCalls":0}' ? true : s;
    });
    run('read/only-a-vanished-file-or-directory-reads-as-nothing--every-other-fs-error-is-thrown', () => {
      // injected through the live fs object: a file that disappears between lstat and read is "nothing", EACCES / EIO are not
      const target = path.join(fx, 'a/x.ts');
      const dirTarget = path.join(fx, 'a');
      const realRead = fs.readFileSync;
      const realReaddir = fs.readdirSync;
      const fail = (code) => Object.assign(new Error(`injected ${code}`), { code });
      const bad = [];
      try {
        for (const [code, nothing] of [['ENOENT', true], ['ENOTDIR', true], ['EISDIR', true], ['EACCES', false], ['EIO', false]]) {
          fs.readFileSync = (p, ...rest) => {
            if (p === target) throw fail(code);
            return realRead(p, ...rest);
          };
          let got;
          let thrown = null;
          try {
            got = createTree(fx).read('a/x.ts');
          } catch (e) {
            thrown = e;
          }
          if (nothing ? thrown !== null || got !== null : thrown === null || thrown.code !== code) bad.push(`read:${code}`);
        }
        fs.readFileSync = realRead;
        for (const [code, nothing] of [['ENOENT', true], ['ENOTDIR', true], ['EACCES', false], ['EIO', false]]) {
          fs.readdirSync = (p, ...rest) => {
            if (p === dirTarget) throw fail(code);
            return realReaddir(p, ...rest);
          };
          let got;
          let thrown = null;
          try {
            got = createTree(fx).list('a');
          } catch (e) {
            thrown = e;
          }
          if (nothing ? thrown !== null || got.length !== 0 : thrown === null || thrown.code !== code) bad.push(`walk:${code}`);
        }
      } finally {
        fs.readFileSync = realRead;
        fs.readdirSync = realReaddir;
      }
      return bad.length === 0 ? true : bad.join(' ');
    });
    run('list/overlay-entries-under-a-root-level-skipped-directory-are-skipped--unless-it-is-the-prefix', () => {
      const t = createTree(fx, { 'dist/x.js': 'x', 'node_modules/y.js': 'y', '.next/z.js': 'z', 'ok/w.js': 'w', 'a/node_modules/new.ts': 'n' });
      const root = t.list('');
      const bad = [];
      for (const p of ['dist/x.js', 'node_modules/y.js', '.next/z.js']) if (root.includes(p)) bad.push('root-lists:' + p);
      if (!root.includes('ok/w.js')) bad.push('root-misses:ok/w.js');
      if (sameList(t.list('dist'), ['dist/x.js']) !== true) bad.push('list(dist)');
      if (!t.list('a/node_modules').includes('a/node_modules/new.ts')) bad.push('list(a/node_modules)');
      if (t.list('a').includes('a/node_modules/new.ts')) bad.push('a-lists-node_modules');
      return bad.length === 0 ? true : bad.join(' ');
    });
    run('list/a-named-pipe-is-not-a-member', () => {
      const m = mini('fifo', { 'a.ts': 'A' });
      const r = spawnSync('mkfifo', [path.join(m.R, 'pipe')]);
      if (r.error || r.status !== 0) return `mkfifo unavailable (${r.error ? r.error.code : r.status}); the special-file rule cannot be verified`;
      const t = createTree(m.R);
      return sameList(t.list(''), ['a.ts']) === true && t.read('pipe') === null && !t.exists('pipe') && t.symlinks('').length === 0 ? true : `listed: ${JSON.stringify(t.list(''))}`;
    });
    run('exists/an-empty-directory-stays-a-directory-while-the-overlay-deletes-or-adds-elsewhere', () => {
      const bad = [];
      for (const [label, ov] of [['delete-elsewhere', { 'a2/other.ts': null }], ['add-elsewhere', { 'zz/new.ts': 'n' }], ['delete-deep', { 'a/b/y.tsx': null }]]) {
        const t = createTree(fx, ov);
        if (t.isDir('empty') !== true || t.exists('empty') !== true) bad.push(label);
      }
      return bad.length === 0 ? true : 'an empty on-disk directory vanished: ' + bad.join(',');
    });
    run('listNonEmpty/the-message-names-the-prefix-and-only-a-requested-ext', () => {
      const t = createTree(fx);
      const a = throwsOf(() => t.listNonEmpty('nope'));
      const b = throwsOf(() => t.listNonEmpty('a', { ext: '.nothing' }));
      return a && a.message === 'listNonEmpty: no files under "nope"' && b && b.message === 'listNonEmpty: no files under "a" with ext ".nothing"' ? true : `${a && a.message} | ${b && b.message}`;
    });
    run('replace/a-duck-typed-pattern-is-not-a-RegExp', () => {
      const e = throwsOf(() => createTree(fx).replace('a/x.ts', { source: 'export', flags: '' }, 'EXPORT'));
      return e instanceof TypeError && /string or RegExp/.test(e.message) ? true : `threw ${e && e.name}/${e && e.message}`;
    });
    run('code/the-router-refuses-a-kind-it-has-no-stripper-for', () => {
      const a = throwsOf(() => runStripper('none', 'x'));
      const b = throwsOf(() => runStripper('bogus', 'x'));
      return a instanceof Error && b instanceof Error && /no stripper/.test(a.message) && /no stripper/.test(b.message) ? true : 'did not throw';
    });
    run('git/a-git-that-cannot-run-is-thrown-not-read-as-no-repository', needGit((g) => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wsi-nogit-'));
      minis.push(dir);
      fs.writeFileSync(path.join(dir, 'git'), '#!/bin/sh\nexit 0\n', { mode: 0o644 }); // present, but with no execute bit
      const had = process.env.PATH;
      process.env.PATH = dir;
      try {
        const bad = [];
        const check = (label, fn) => {
          const e = throwsOf(fn);
          if (!e || e.code !== 'EACCES' || e.name === 'GitUnavailable') bad.push(`${label}:${e ? e.code || e.name : 'no error'}`);
        };
        check('tracked', () => createTree(g.R, {}, { source: 'tracked' }));
        check('commit', () => createTree(g.R, {}, { source: 'commit' }));
        check('provenance', () => createTree(g.R).provenance());
        check('trackingState', () => createTree(g.R).trackingState('lib/a.ts'));
        return bad.length === 0 ? true : bad.join(' ');
      } finally {
        process.env.PATH = had;
      }
    }));

    // ---- smoke against the real repository (read-only) --------------------------------------
    run('repo/the-suite-is-where-we-think-it-is', () => {
      const t = createTree(repoRoot);
      const idx = t.read('tests/constitutional/writer-source-intake/obligation-index.json');
      if (idx === null) return `obligation-index.json not found under ${repoRoot}`;
      const parsed = JSON.parse(idx);
      const ok = Array.isArray(parsed.obligations) && parsed.obligations.length > 0 && parsed.obligations.every((o) => typeof o.id === 'string');
      const files = t.listNonEmpty('tests/constitutional/writer-source-intake', { ext: '.mjs' });
      if (!ok) return 'obligation-index.json has no obligations[] of {id}';
      return files.includes('tests/constitutional/writer-source-intake/lib/tree.mjs') ? true : 'suite files not listed';
    });
    run('repo/a-real-ts-file-strips-without-issues-or-surprise', () => {
      const t = createTree(repoRoot);
      const ts = t.list('lib', { ext: '.ts' }).slice(0, 25);
      if (ts.length === 0) return 'no .ts files under lib/ to smoke-test';
      let comments = 0;
      for (const f of ts) {
        const raw = t.read(f);
        const out = t.code(f);
        if (out.length !== raw.length) return `length changed for ${f}`;
        if (out !== raw) comments++;
      }
      return comments > 0 ? true : 'no file had a comment to strip (vacuous)';
    });
    run('repo/the-real-deploy-surface-strips-and-closes', () => {
      const t = createTree(repoRoot);
      const want = ['Dockerfile', 'Caddyfile', '.env.example'];
      const bad = [];
      for (const f of want) {
        const raw = t.read(f);
        if (raw === null) { bad.push(`${f}:missing`); continue; }
        const out = t.code(f);
        const issues = t.codeIssues(f);
        if (out.length !== raw.length) bad.push(`${f}:length`);
        else if (out === raw) bad.push(`${f}:nothing-stripped(vacuous)`);
        else if (!Array.isArray(issues) || issues.length !== 0) bad.push(`${f}:issues=${JSON.stringify(issues)}`);
      }
      return bad.length === 0 ? true : bad.join(' ');
    });
    run('repo/commit-source-reads-the-committed-repository', () => {
      const t = createTree(repoRoot, {}, { source: 'commit' });
      const p = t.provenance();
      const f = t.listNonEmpty('lib', { ext: '.ts' });
      return hex40(p.commit) && p.commit === p.head && t.read('package.json') !== null && !f.some((x) => /(^|\/)\.git(\/|$)/.test(x)) && t.read('.git') === null ? true : JSON.stringify(p);
    });
    run('repo/dot-git-is-invisible-and-git-answers-for-this-very-file', () => {
      const t = createTree(repoRoot);
      const me = t.trackingState('tests/constitutional/writer-source-intake/lib/tree.mjs');
      return t.read('.git') === null && !t.exists('.git') && ['tracked', 'untracked', 'ignored'].includes(me) ? true : `.git visible or state=${me}`;
    });

    // ---- LETHALITY: the same checks must FAIL on known-wrong trees --------------------------
    const OLD_RAW_KINDS = new Set(['sh', 'dockerfile', 'dotenv', 'caddyfile']);
    const wrongs = {
      // read(): ignores a null overlay entry (falls through to disk)
      ignoreNullOverlay: (root, ov) => {
        const t = real(root, ov);
        const base = real(root);
        const norm = (r) => normalizeRel(r);
        return { ...t, read: (r) => (ov[norm(r)] != null ? ov[norm(r)] : base.read(r)), exists: (r) => ov[norm(r)] != null || base.exists(r), isFile: (r) => ov[norm(r)] != null || base.isFile(r) };
      },
      // edit(): swallows VacuousMutation and hands back the same tree
      silentEdit: (root, ov) => {
        const t = real(root, ov);
        return { ...t, edit: (r, fn) => { try { return t.edit(r, fn); } catch (e) { if (e && e.name === 'VacuousMutation') return t; throw e; } } };
      },
      // list(): walks without the skip rule
      listNoSkip: (root, ov) => {
        const t = real(root, ov);
        return { ...t, list: (p = '') => naiveListNoSkip(root, normalizeRel(p)) };
      },
      // replace(): first occurrence only, replacement NOT literal
      replaceFirstExpanding: (root, ov) => {
        const t = real(root, ov);
        return { ...t, replace: (r, pat, rep) => t.edit(r, (s) => s.replace(pat, rep)) };
      },
      // replace(): returns the tree unchanged when nothing matched
      replaceSilentNoMatch: (root, ov) => {
        const t = real(root, ov);
        return { ...t, replace: (r, pat, rep) => { try { return t.replace(r, pat, rep); } catch (e) { if (e && e.name === 'VacuousMutation') return t; throw e; } } };
      },
      // add(): silently overwrites an existing file
      addOverwrites: (root, ov) => {
        const t = real(root, ov);
        return { ...t, add: (r, c) => t.edit(r, () => c) };
      },
      // DEFECT 1, as it was: code() hands back RAW text for sh / Dockerfile / .env / Caddyfile and for the
      // shell inside a YAML `run:` block, and the stripper-less kinds report a clean parse
      rawCodeOfNewKinds: (root, ov, opts) => {
        const t = real(root, ov, opts);
        return {
          ...t,
          code: (r) => {
            const k = t.codeKind(r);
            if (OLD_RAW_KINDS.has(k)) return t.read(r);
            if (k === 'yaml') return stripYamlCommentsDetailed(t.read(r)).text; // blockScalars preserved
            return t.code(r);
          },
        };
      },
      emptyIssuesForNone: (root, ov, opts) => {
        const t = real(root, ov, opts);
        return { ...t, codeIssues: (r) => { const i = t.codeIssues(r); return i === null && t.read(r) !== null ? [] : i; } };
      },
      codeStrictLax: (root, ov, opts) => {
        const t = real(root, ov, opts);
        return { ...t, codeStrict: (r) => t.code(r) };
      },
      issuesDropped: (root, ov, opts) => {
        const t = real(root, ov, opts);
        return { ...t, codeIssues: (r) => (t.code(r) === null ? null : []) };
      },
      // DEFECT 2, as it was: the directory IS the tree (options ignored), `.git` is a listed file,
      // symlinks are followed and listed
      optionsIgnored: (root, ov) => real(root, ov),
      oldDirectoryWalk: (root, ov, opts) => {
        const t = real(root, ov, opts);
        return {
          ...t,
          list: (p = '', o) => {
            const base = oldWalk(root, normalizeRel(p));
            const exts = o && o.ext ? [].concat(o.ext).map((e) => (e.startsWith('.') ? e : '.' + e).toLowerCase()) : null;
            return base.filter((f) => !exts || exts.some((e) => f.toLowerCase().endsWith(e)));
          },
          read: (r) => oldRead(root, r),
          symlinks: () => [],
        };
      },
      // an edit stored under the key the caller typed
      rawKeyEdit: (root, ov, opts) => {
        const t = real(root, ov, opts);
        const wrap = (stored) => ({ ...t, read: (r) => (stored.has(r) ? stored.get(r) : t.read(r)), edit: (r, fn) => { const next = new Map(stored); next.set(r, fn(stored.has(r) ? stored.get(r) : t.read(r))); return wrap(next); }, touched: () => [...stored.keys()].sort() });
        return wrap(new Map());
      },
      // readers that do not normalise their argument against the OVERLAY
      rawKeyReaders: (root, ov, opts) => {
        const t = real(root, ov, opts);
        const k = (r) => (typeof r === 'string' ? r : '');
        const hasRaw = (r) => Object.prototype.hasOwnProperty.call(ov, k(r));
        return { ...t, read: (r) => (hasRaw(r) ? ov[k(r)] : (() => { try { return real(root, {}, opts).read(r); } catch { return null; } })()), isDir: (r) => (k(r).startsWith('./') ? false : t.isDir(r)) };
      },
    };
    const mustFail = (label, wrongName, check) => {
      let realRes;
      let wrongRes;
      try { realRes = check(real); } catch (e) { realRes = `threw ${e && e.name}`; }
      try { wrongRes = check(wrongs[wrongName]); } catch (e) { wrongRes = `threw ${e && e.name}`; }
      add(`lethality/${label}`, realRes === true && wrongRes !== true, realRes !== true ? `REAL tree fails the check: ${realRes}` : wrongRes === true ? 'check PASSED on the known-wrong tree (cannot fail)' : '');
    };
    mustFail('null-overlay-ignored-tree-killed', 'ignoreNullOverlay', C['read/overlay-null-means-deleted']);
    mustFail('silent-edit-tree-killed', 'silentEdit', C['edit/identical-result-throws-VacuousMutation']);
    mustFail('no-skip-list-tree-killed', 'listNoSkip', C['list/recursive-sorted-and-skips-node_modules-git-dist-next']);
    mustFail('first-only-expanding-replace-tree-killed', 'replaceFirstExpanding', C['replace/string-is-literal-and-replaces-all']);
    mustFail('silent-no-match-replace-tree-killed', 'replaceSilentNoMatch', C['replace/no-match-throws-VacuousMutation']);
    mustFail('overwriting-add-tree-killed', 'addOverwrites', C['add/new-file-visible-and-existing-file-refused']);
    // defect 1: raw text passed off as comment-stripped
    mustFail('raw-code-of-sh-Dockerfile-env-Caddyfile-and-run-blocks-killed', 'rawCodeOfNewKinds', C['code/every-stripped-kind-removes-comments-keeps-literals-and-length']);
    mustFail('raw-documented-absence-still-matches-killed', 'rawCodeOfNewKinds', C['code/a-comment-documenting-a-tokens-absence-never-matches']);
    mustFail('yaml-run-block-comments-kept-killed', 'rawCodeOfNewKinds', C['code/yaml-strips-shell-comments-of-run-bodies-only']);
    mustFail('empty-issues-for-a-kind-without-a-stripper-killed', 'emptyIssuesForNone', C['code/a-kind-without-a-stripper-is-not-reported-as-a-clean-parse']);
    mustFail('lax-codeStrict-killed', 'codeStrictLax', C['code/a-kind-without-a-stripper-is-not-reported-as-a-clean-parse']);
    mustFail('issues-dropped-killed', 'issuesDropped', C['code/codeIssues-passes-through-what-each-stripper-could-not-close']);
    // defect 2: the directory passed off as the repository
    mustFail('options-ignored-tracked-source-killed', 'optionsIgnored', C['git/tracked-source-hides-untracked-ignored-deleted-files-and-symlinks']);
    mustFail('options-ignored-commit-source-killed', 'optionsIgnored', C['git/commit-source-is-the-commit-not-the-machine']);
    mustFail('options-ignored-commit-option-killed', 'optionsIgnored', C['git/commit-option-selects-the-commit']);
    mustFail('dot-git-file-listed-killed', 'oldDirectoryWalk', C['git/a-linked-worktrees-dot-git-file-is-not-content']);
    mustFail('dot-git-readable-killed', 'oldDirectoryWalk', C['dot-git/a-dot-git-file-or-directory-is-never-content']);
    mustFail('symlinks-listed-twice-killed', 'oldDirectoryWalk', C['symlink/links-are-not-listed-read-or-followed']);
    mustFail('symlinks-unreported-killed', 'oldDirectoryWalk', C['git/tracked-symlink-is-not-a-member-in-any-source']);
    // defect 3: an un-normalised path silently inert
    mustFail('edit-under-the-typed-key-killed', 'rawKeyEdit', C['path/mutators-normalise-every-variant']);
    mustFail('un-normalised-readers-killed', 'rawKeyReaders', C['path/readers-normalise-every-variant']);
    // code(): a tree that returns raw text must fail the strip check
    {
      const rawCode = (root, ov) => { const t = real(root, ov); return { ...t, code: (r) => t.read(r) }; };
      const check = (mk) => { const t = mk(fx, {}); return !t.code('a/x.ts').includes('CMT_T1') ? true : 'comment still present'; };
      add('lethality/raw-code-tree-killed', check(real) === true && check(rawCode) !== true, '');
    }
    // a tree that reads the CALLER's overlay object live (instead of copying it) must fail the check
    {
      const live = (root, ov) => { const t = real(root, {}); return { ...t, read: (r) => (ov[normalizeRel(r)] !== undefined ? ov[normalizeRel(r)] : t.read(r)) }; };
      const check = (mk) => {
        const ov = { 'a/x.ts': 'ORIG' };
        const t = mk(fx, ov);
        ov['a/x.ts'] = 'CHANGED';
        return t.read('a/x.ts') === 'ORIG' ? true : 'aliasing the caller overlay';
      };
      add('lethality/live-caller-overlay-tree-killed', check(real) === true && check(live) !== true, '');
    }
    // aliasing: a tree whose derive shares the overlay Map would let siblings interfere
    {
      const aliasing = () => {
        const shared = new Map();
        const mk = () => ({ edit: (r, fn) => { shared.set(r, fn(shared.get(r) ?? 'base')); return mk(); }, read: (r) => shared.get(r) ?? 'base' });
        const base = mk();
        base.edit('f', (s) => s + 'A');
        base.edit('f', (s) => s + 'B');
        return base.read('f') === 'base'; // an immutable tree would still read 'base'
      };
      add('lethality/aliasing-tree-fails-the-independence-property', aliasing() === false, '');
    }
  } finally {
    if (fx) fs.rmSync(fx, { recursive: true, force: true });
    if (gx) fs.rmSync(gx.base, { recursive: true, force: true });
    for (const d of minis) fs.rmSync(d, { recursive: true, force: true });
  }
  add('fixture/temp-directories-removed', fx !== null && !fs.existsSync(fx) && (gx === null || !fs.existsSync(gx.base)) && minis.every((d) => !fs.existsSync(d)), fx ? `${minis.length} extra directories` : 'no fixture');
  return { ok: checks.every((c) => c.ok), checks };
}

// A wrong tree: walks without the skip rule.
function naiveListNoSkip(root, prefix) {
  const out = [];
  const visit = (abs, rel) => {
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      const r = rel === '' ? ent.name : rel + '/' + ent.name;
      if (ent.isDirectory()) visit(path.join(abs, ent.name), r);
      else out.push(r);
    }
  };
  visit(path.join(root, prefix), prefix);
  return out.sort();
}

// ---------------------------------------------------------------------------------------------
// MUTATION AUDIT:  node lib/tree.mjs --mutation-audit
// Same contract as strip.mjs: each mutation breaks ONE behaviour of the implementation half of this
// file (above the self-test banner); selfTest() on the mutant MUST fail. The mutant's import of
// ./strip.mjs is rewritten to an absolute file: URL so it can load from a data: URL. A mutation whose
// from-text is missing or ambiguous, or that changes nothing, is reported as BAD-MUTATION (never as a
// kill), so a refactor of the implementation cannot silently turn the audit into a no-op.
//
// NOT MUTATED, because no input can tell the mutant from the original (equivalent mutants, not gaps):
//   * memoCode in code() and the per-path kinds cache in diskKind() -- unobservable (the content-keyed strip
//     cache underneath code() and a repeated lstat give the same answers);
//   * the `dirs.has(d)` early exit in dirsOf() and `--quiet`, GIT_OPTIONAL_LOCKS, GIT_TERMINAL_PROMPT --
//     optimisations / hardening of git calls;
//   * the ENOENT / ENOTDIR / EISDIR arms of memberContent() and diskKind() -- reached only by a file
//     vanishing between lstat and read;
//   * the `check-ignore` exit-status arm that is neither 0 nor 1 -- reached only when git dies after it
//     already answered `ls-files`.
const L = (...lines) => lines.join('\n');
const ISSUES_DROPPED = (name, call) => [`issues-dropped-for-${name}`, `return ${call};`, `return { text: ${call}.text, issues: [] };`];
const MUTATIONS = [
  // ---- normalisation ------------------------------------------------------------------------
  ['normalize-dot-root', "if (p === '.' || p === './') return '';", ''],
  ['normalize-allows-escape', "if (p === '..' || p.startsWith('../')) throw new Error(`path escapes the tree root: ${rel}`);", ''],
  ['normalize-allows-absolute', "if (p.startsWith('/')) throw new Error(`absolute path not allowed: ${rel}`);", ''],
  ['normalize-keeps-backslashes', "let p = rel.replace(/\\\\/g, '/');", 'let p = rel;'],
  ['normalize-trailing-slash-kept', "if (p.endsWith('/')) p = p.slice(0, -1);", ''],
  ['normalize-skips-posix-normalise', 'p = path.posix.normalize(p);', ''],
  ['read-not-normalised', 'const read = (rel) => fileContent(normalizeRel(rel));', 'const read = (rel) => fileContent(rel);'],
  ['isFile-not-normalised', 'const isFile = (rel) => fileContent(normalizeRel(rel)) !== null;', 'const isFile = (rel) => fileContent(rel) !== null;'],
  ['isDir-not-normalised', "const isDir = (rel) => {\n    const p = normalizeRel(rel);", 'const isDir = (rel) => {\n    const p = rel;'],
  ['code-not-normalised', 'const code = (rel) => {\n    const p = normalizeRel(rel);', 'const code = (rel) => {\n    const p = rel;'],
  ['codeKind-not-normalised', 'const codeKind = (rel) => {\n    const p = normalizeRel(rel);', 'const codeKind = (rel) => {\n    const p = rel;'],
  ['codeIssues-not-normalised', 'const codeIssues = (rel) => {\n    const p = normalizeRel(rel);', 'const codeIssues = (rel) => {\n    const p = rel;'],
  ['codeStrict-not-normalised', 'const codeStrict = (rel) => {\n    const p = normalizeRel(rel);', 'const codeStrict = (rel) => {\n    const p = rel;'],
  ['list-prefix-not-normalised', 'const p = normalizeRel(prefixDir);\n    const exts = normExts', 'const p = prefixDir;\n    const exts = normExts'],
  ['listNonEmpty-prefix-not-normalised', 'if (r.length === 0) {\n      const p = normalizeRel(prefixDir);', 'if (r.length === 0) {\n      const p = prefixDir;'],
  ['symlinks-prefix-not-normalised', 'const symlinks = (prefixDir = \'\') => {\n    const p = normalizeRel(prefixDir);', 'const symlinks = (prefixDir = \'\') => {\n    const p = prefixDir;'],
  ['edit-not-normalised', 'const edit = (rel, fn) => {\n    const p = normalizeRel(rel);', 'const edit = (rel, fn) => {\n    const p = rel;'],
  ['replace-not-normalised', 'const replace = (rel, pattern, replacement) => {\n    const p = normalizeRel(rel);', 'const replace = (rel, pattern, replacement) => {\n    const p = rel;'],
  ['add-not-normalised', 'const add = (rel, content) => {\n    const p = normalizeRel(rel);', 'const add = (rel, content) => {\n    const p = rel;'],
  ['remove-not-normalised', 'const remove = (rel) => {\n    const p = normalizeRel(rel);', 'const remove = (rel) => {\n    const p = rel;'],
  ['trackingState-not-normalised', 'const trackingState = (rel) => {\n    const p = normalizeRel(rel);', 'const trackingState = (rel) => {\n    const p = rel;'],

  // ---- overlay, mutation, immutability ------------------------------------------------------
  ['overlay-null-not-deletion', 'const fileContent = (rel) => (overlay.has(rel) ? overlay.get(rel) : diskRead(shared, rel));', 'const fileContent = (rel) => (overlay.get(rel) != null ? overlay.get(rel) : diskRead(shared, rel));'],
  ['edit-noop-allowed', "if (next === cur) throw new VacuousMutation(`edit: no-op on ${p}`", "if (false) throw new VacuousMutation(`edit: no-op on ${p}`"],
  ['edit-missing-file-allowed', "if (cur === null) throw new VacuousMutation(`edit: file does not exist: ${p}`", "if (false) throw new VacuousMutation(`edit: file does not exist: ${p}`"],
  ['edit-skips-type-check', "if (typeof next !== 'string') throw new TypeError(`edit(${p}): fn must return a string`);", ''],
  ['replace-string-expands-dollar', 'cur.split(pattern).join(String(replacement))', 'cur.replaceAll(pattern, replacement)'],
  ['replace-string-first-only', 'cur.split(pattern).join(String(replacement))', 'cur.replace(pattern, () => String(replacement))'],
  ['replace-no-match-allowed', "if (!cur.includes(pattern)) throw new VacuousMutation(`replace: pattern not found in ${p}`", "if (false) throw new VacuousMutation(`replace: pattern not found in ${p}`"],
  ['replace-regex-no-match-allowed', "if (!new RegExp(pattern.source, flags).test(cur)) throw new VacuousMutation(`replace: pattern not found in ${p}`", "if (false) throw new VacuousMutation(`replace: pattern not found in ${p}`"],
  ['replace-regex-stateful', 'cur.replace(new RegExp(pattern.source, flags), replacement)', 'cur.replace(pattern, replacement)'],
  ['replace-noop-allowed', "if (next === cur) throw new VacuousMutation(`replace: no net change in ${p}`", "if (false) throw new VacuousMutation(`replace: no net change in ${p}`"],
  ['replace-missing-file-allowed', "if (cur === null) throw new VacuousMutation(`replace: file does not exist: ${p}`", "if (false) throw new VacuousMutation(`replace: file does not exist: ${p}`"],
  ['replace-empty-pattern-allowed', "if (pattern === '') throw new TypeError('replace: empty string pattern');", ''],
  ['replace-bad-pattern-type-allowed', "} else {\n      throw new TypeError('replace: pattern must be a string or RegExp');\n    }", '} else {\n      next = cur;\n    }'],
  ['replace-sticky-flag-kept', "const flags = pattern.flags.replace('y', '');", 'const flags = pattern.flags;'],
  ['add-overwrite-allowed', "if (fileContent(p) !== null) throw new VacuousMutation(`add: file already exists: ${p}`", "if (false) throw new VacuousMutation(`add: file already exists: ${p}`"],
  ['add-empty-path-allowed', "if (p === '') throw new TypeError('add: empty path');", ''],
  ['add-non-string-allowed', "if (typeof content !== 'string') throw new TypeError(`add(${p}): content must be a string`);", ''],
  ['add-dot-git-allowed', 'if (hasGitSegment(p)) throw new TypeError(`add: a .git path is not part of a tree: ${p}`);', ''],
  ['remove-missing-allowed', "if (fileContent(p) === null) throw new VacuousMutation(`remove: file does not exist: ${p}`", "if (false) throw new VacuousMutation(`remove: file does not exist: ${p}`"],
  ['derive-aliases-overlay', 'const next = new Map(overlay);\n    next.set(rel, content);', 'const next = overlay;\n    next.set(rel, content);'],
  ['touched-unsorted', 'const touched = () => [...overlay.keys()].sort();', 'const touched = () => [...overlay.keys()];'],
  ['stats-live-object', 'const stats = () => ({ ...shared.stats });', 'const stats = () => shared.stats;'],
  ['tree-not-frozen', 'return Object.freeze({\n    root: shared.root,', 'return ({\n    root: shared.root,'],
  ['vacuousmutation-reason-lost', 'this.reason = info.reason === undefined ? null : info.reason;', 'this.reason = null;'],
  ['vacuousmutation-op-lost', 'this.op = info.op === undefined ? null : info.op;', 'this.op = null;'],
  ['vacuousmutation-rel-lost', "this.name = 'VacuousMutation';\n    this.rel = info.rel === undefined ? null : info.rel;", "this.name = 'VacuousMutation';\n    this.rel = null;"],
  ['vacuousscan-prefix-lost', 'this.prefix = info.prefix === undefined ? null : info.prefix;', 'this.prefix = null;'],

  // ---- construction & options -----------------------------------------------------------------
  ['create-root-type-unchecked', "if (typeof root !== 'string' || root === '') throw new TypeError('createTree: root must be a non-empty string');", ''],
  ['create-root-missing-allowed', 'throw new Error(`createTree: root does not exist: ${abs}`);', 'st = { isDirectory: () => true };'],
  ['create-root-file-allowed', 'if (!st.isDirectory()) throw new Error(`createTree: root is not a directory: ${abs}`);', ''],
  ['create-overlay-map-unsupported', 'const entries = overlay instanceof Map ? [...overlay] : Object.entries(overlay || {});', 'const entries = Object.entries(overlay || {});'],
  ['create-overlay-empty-path-allowed', "if (nk === '') throw new TypeError('createTree: empty overlay path');", ''],
  ['create-overlay-dot-git-allowed', 'if (hasGitSegment(nk)) throw new TypeError(`createTree: a .git path is not part of a tree: ${nk}`);', ''],
  ['create-overlay-value-unchecked', "if (v !== null && typeof v !== 'string') throw new TypeError(`createTree: overlay value for ${nk} must be a string or null`);", ''],
  ['create-duplicate-overlay-key-allowed', 'if (map.has(nk)) throw new Error(`createTree: duplicate overlay key after normalisation: ${nk}`);', ''],
  ['create-null-options-crash', "const o = options === null || options === undefined ? {} : options;", 'const o = options;'],
  ['create-unknown-source-allowed', "if (source !== 'worktree' && source !== 'tracked' && source !== 'commit') throw new TypeError(`createTree: unknown source ${JSON.stringify(source)}`);", ''],
  ['create-commit-with-other-source-allowed', "if (o.commit !== undefined && source !== 'commit') throw new TypeError('createTree: options.commit is only valid with source \"commit\"');", ''],
  ['create-bad-commit-allowed', "if (o.commit !== undefined && (typeof o.commit !== 'string' || o.commit === '')) throw new TypeError('createTree: options.commit must be a non-empty string');", ''],
  ['create-commit-option-ignored', "source === 'commit' ? (o.commit === undefined ? 'HEAD' : o.commit) : null", "source === 'commit' ? 'HEAD' : null"],
  ['create-tracked-lazy-index', 'loadIndex(shared); // fail closed NOW, not at the first read\n    shared.dirSet = dirsOf(shared.index.files);', 'shared.index = { files: new Set(), links: new Set() };\n    shared.dirSet = dirsOf(shared.index.files);'],

  // ---- list ------------------------------------------------------------------------------------
  ['list-empty-ext-array-allowed', "if (arr.length === 0) throw new TypeError('list: ext must not be an empty array');", ''],
  ['list-ext-entry-unchecked', "if (typeof e !== 'string' || e === '') throw new TypeError('list: ext entries must be non-empty strings');", ''],
  ['list-ext-case-sensitive', "return (e.startsWith('.') ? e : '.' + e).toLowerCase();", "return (e.startsWith('.') ? e : '.' + e);"],
  ['list-ext-dot-not-added', "return (e.startsWith('.') ? e : '.' + e).toLowerCase();", 'return e.toLowerCase();'],
  ['list-ext-path-case-sensitive', 'const lf = f.toLowerCase();\n        return exts.some((e) => lf.endsWith(e));', 'return exts.some((e) => f.endsWith(e));'],
  ['list-ext-filter-skipped', '    let arr = [...set];\n    if (exts) {', '    let arr = [...set];\n    if (false) {'],
  ['list-memo-key-ignores-ext', "const key = p + '\\0' + (exts ? exts.join(',') : '');", 'const key = p;'],
  ['list-skip-rule-removed-on-disk', 'if (!SKIP_DIRS.has(ent.name)) visit(path.join(abs, ent.name), childRel);', 'visit(path.join(abs, ent.name), childRel);'],
  ['list-skip-rule-removed-on-overlay', "if (k.split('/').slice(segCount, -1).some((s) => SKIP_DIRS.has(s))) continue;", ''],
  ['list-skip-rule-overlay-first-level-only', "if (k.split('/').slice(segCount, -1).some((s) => SKIP_DIRS.has(s))) continue;", "if (SKIP_DIRS.has(k.split('/')[segCount])) continue;"],
  ['list-overlay-null-ignored', L('      if (v === null) set.delete(k);', '      else set.add(k);'), L('      if (v === null) { /* ignored */ }', '      else set.add(k);')],
  ['list-prefix-boundary-sloppy', "if (p !== '' && !k.startsWith(p + '/')) continue;", "if (p !== '' && !k.startsWith(p)) continue;"],
  ['list-unsorted', '    arr.sort();\n    const frozen = Object.freeze(arr);', '    const frozen = Object.freeze(arr);'],
  ['list-result-not-frozen', 'const frozen = Object.freeze(arr);', 'const frozen = arr;'],
  ['list-memo-off', 'const memo = memoList.get(key);\n    if (memo) return memo;', ''],
  ['listNonEmpty-allows-empty', 'if (r.length === 0) {\n      const p = normalizeRel(prefixDir);', 'if (false) {\n      const p = normalizeRel(prefixDir);'],
  ['listNonEmpty-wrong-class', 'throw new VacuousScan(`listNonEmpty:', 'throw new Error(`listNonEmpty:'],
  ['symlinks-unsorted', 'return Object.freeze([...walkDisk(shared, p).links].sort());', 'return Object.freeze([...walkDisk(shared, p).links]);'],
  ['symlinks-not-frozen', 'return Object.freeze([...walkDisk(shared, p).links].sort());', 'return [...walkDisk(shared, p).links].sort();'],
  ['walk-cache-off', 'const cached = shared.walks.get(prefix);\n  if (cached) return cached;', ''],
  ['walks-uncounted', 'shared.stats.walks++;', ''],
  ['isDir-ignores-overlay-deletions', 'if (!deletedUnder) return true;\n    return list(p).length > 0;', 'return true;'],
  ['isDir-overlay-children-ignored', "for (const [k, v] of overlay) if (v !== null && k.startsWith(p + '/')) return true;", ''],
  ['isDir-deleted-dir-with-survivors-is-gone', 'if (!deletedUnder) return true;\n    return list(p).length > 0;', 'if (!deletedUnder) return true;\n    return false;'],
  ['isDir-root-false', "const isDir = (rel) => {\n    const p = normalizeRel(rel);\n    if (p === '') return true;", "const isDir = (rel) => {\n    const p = normalizeRel(rel);\n    if (p === '') return false;"],
  ['exists-file-only', 'const exists = (rel) => isFile(rel) || isDir(rel);', 'const exists = (rel) => isFile(rel);'],

  // ---- the kind map ------------------------------------------------------------------------------
  ['kind-mts-cts-removed', "    case '.mts':\n    case '.cts':\n", ''],
  ['kind-jsx-as-nothing', "    case '.tsx':\n    case '.jsx':\n    case '.js':", "    case '.tsx':\n    case '.js':"],
  ['kind-cjs-removed', "    case '.cjs':\n      return 'js';", "      return 'js';"],
  ['kind-mjs-removed', "    case '.mjs':\n    case '.cjs':", "    case '.cjs':"],
  ['kind-jsonc-removed', "    case '.json':\n    case '.jsonc':\n      return 'jsonc';", "    case '.json':\n      return 'jsonc';"],
  ['kind-json-removed', "    case '.json':\n    case '.jsonc':\n      return 'jsonc';", "    case '.jsonc':\n      return 'jsonc';"],
  ['kind-yaml-only-yml', "    case '.yml':\n    case '.yaml':\n      return 'yaml';", "    case '.yml':\n      return 'yaml';"],
  ['kind-yml-removed', "    case '.yml':\n    case '.yaml':\n      return 'yaml';", "    case '.yaml':\n      return 'yaml';"],
  ['kind-sql-removed', "    case '.sql':\n      return 'sql';", ''],
  ['kind-sh-removed', "    case '.sh':\n    case '.bash':\n      return 'sh';", "    case '.bash':\n      return 'sh';"],
  ['kind-bash-removed', "    case '.sh':\n    case '.bash':\n      return 'sh';", "    case '.sh':\n      return 'sh';"],
  ['kind-tsx-is-ts', "    case '.tsx':\n    case '.jsx':\n    case '.js':\n    case '.mjs':\n    case '.cjs':\n      return 'js';", "    case '.jsx':\n    case '.js':\n    case '.mjs':\n    case '.cjs':\n      return 'js';"],
  ['kind-lowercase-removed', "const base = rel.slice(rel.lastIndexOf('/') + 1).toLowerCase();", "const base = rel.slice(rel.lastIndexOf('/') + 1);"],
  ['kind-base-name-is-whole-path', "const base = rel.slice(rel.lastIndexOf('/') + 1).toLowerCase();", 'const base = rel.toLowerCase();'],
  ['kind-d-ts-wrong', "const dot = base.lastIndexOf('.');\n  const ext = dot > 0 ? base.slice(dot) : '';", "const dot = base.indexOf('.');\n  const ext = dot > 0 ? base.slice(dot) : '';"],
  ['kind-dotfile-has-an-extension', "const ext = dot > 0 ? base.slice(dot) : '';", "const ext = dot >= 0 ? base.slice(dot) : '';"],
  ['kind-named-family-exclusion-removed', 'if (!NAMED_FAMILY_EXCLUDED_EXT.has(ext)) {', 'if (true) {'],
  ['kind-dockerfile-exact-name-removed', "if (base === 'dockerfile' || base.startsWith('dockerfile.')", "if (base.startsWith('dockerfile.')"],
  ['kind-dockerfile-prefix-removed', "base === 'dockerfile' || base.startsWith('dockerfile.') || base.endsWith('.dockerfile')", "base === 'dockerfile' || base.endsWith('.dockerfile')"],
  ['kind-dockerfile-suffix-removed', "base.startsWith('dockerfile.') || base.endsWith('.dockerfile') ||", "base.startsWith('dockerfile.') ||"],
  ['kind-containerfile-exact-removed', "base === 'containerfile' || base.startsWith('containerfile.')) return 'dockerfile';", "base.startsWith('containerfile.')) return 'dockerfile';"],
  ['kind-containerfile-prefix-removed', "base === 'containerfile' || base.startsWith('containerfile.')) return 'dockerfile';", "base === 'containerfile') return 'dockerfile';"],
  ['kind-caddyfile-exact-removed', "if (base === 'caddyfile' || base.startsWith('caddyfile.')", "if (base.startsWith('caddyfile.')"],
  ['kind-caddyfile-prefix-removed', "base === 'caddyfile' || base.startsWith('caddyfile.') || base.endsWith('.caddyfile')", "base === 'caddyfile' || base.endsWith('.caddyfile')"],
  ['kind-caddyfile-suffix-removed', "base.startsWith('caddyfile.') || base.endsWith('.caddyfile')", "base.startsWith('caddyfile.')"],
  ['kind-env-prefix-removed', "if (base.startsWith('.env.') || base.endsWith('.env')) return 'dotenv';", "if (base.endsWith('.env')) return 'dotenv';"],
  ['kind-env-suffix-removed', "if (base.startsWith('.env.') || base.endsWith('.env')) return 'dotenv';", "if (base.startsWith('.env.')) return 'dotenv';"],
  ['kind-shebang-disabled', "if (ext === '' && typeof raw === 'string' && SHEBANG_SH_RE.test(", "if (false && ext === '' && typeof raw === 'string' && SHEBANG_SH_RE.test("],
  ['kind-shebang-honoured-with-an-extension', "if (ext === '' && typeof raw === 'string' && SHEBANG_SH_RE.test(", "if (typeof raw === 'string' && SHEBANG_SH_RE.test("],
  ['kind-shebang-needs-no-string', "if (ext === '' && typeof raw === 'string' && SHEBANG_SH_RE.test(", "if (ext === '' && SHEBANG_SH_RE.test("],
  ['kind-shebang-whole-text-not-first-line', ".split('\\n', 1)[0])) return 'sh';", ')) return \'sh\';'],
  ['kind-shebang-zsh-accepted', '(?:sh|bash|dash|ash)(?=', '(?:sh|bash|zsh|ksh|dash|ash)(?='],
  ['kind-shebang-env-unsupported', '(?:env[ \\t]+(?:-\\S+[ \\t]+)*)?', ''],
  ['kind-shebang-env-flags-unsupported', '(?:env[ \\t]+(?:-\\S+[ \\t]+)*)?', '(?:env[ \\t]+)?'],
  ['kind-shebang-directory-unsupported', '(?:\\S*\\/)?(?:env', '(?:env'],
  ['kind-shebang-space-after-bang-unsupported', '/^#![ \\t]*(?:\\S*\\/)?', '/^#!(?:\\S*\\/)?'],
  ['kind-shebang-lookahead-removed', '(?:sh|bash|dash|ash)(?=[ \\t\\r]|$)/', '(?:sh|bash|dash|ash)/'],
  ['kind-shebang-cr-unsupported', '(?=[ \\t\\r]|$)', '(?=[ \\t]|$)'],

  // ---- stripper routing, issues, the strict accessor ---------------------------------------------
  ['code-ts-uses-jsx-mode', "case 'ts':\n    case 'jsonc':\n      return stripCommentsDetailed(raw, { jsx: false });", "case 'ts':\n    case 'jsonc':\n      return stripCommentsDetailed(raw, { jsx: true });"],
  ['code-js-uses-ts-mode', "case 'js':\n      return stripCommentsDetailed(raw, { jsx: true });", "case 'js':\n      return stripCommentsDetailed(raw, { jsx: false });"],
  ['code-jsonc-raw', "case 'ts':\n    case 'jsonc':\n      return stripCommentsDetailed(raw, { jsx: false });", "case 'ts':\n      return stripCommentsDetailed(raw, { jsx: false });\n    case 'jsonc':\n      return { text: raw, issues: [] };"],
  ['code-sql-uses-js-stripper', 'return stripSqlCommentsDetailed(raw);', 'return stripCommentsDetailed(raw, { jsx: false });'],
  ['code-yaml-keeps-run-shell-comments', "stripYamlCommentsDetailed(raw, { blockScalars: 'run' })", 'stripYamlCommentsDetailed(raw)'],
  ['code-yaml-strips-every-block-scalar', "stripYamlCommentsDetailed(raw, { blockScalars: 'run' })", "stripYamlCommentsDetailed(raw, { blockScalars: 'comments' })"],
  ['code-yaml-raw', "return stripYamlCommentsDetailed(raw, { blockScalars: 'run' });", 'return { text: raw, issues: [] };'],
  ['code-sh-unrouted', "case 'sh':\n      return stripShellCommentsDetailed(raw);", ''],
  ['code-sh-uses-caddy-stripper', 'return stripShellCommentsDetailed(raw);', 'return stripCaddyfileCommentsDetailed(raw);'],
  ['code-dockerfile-unrouted', "case 'dockerfile':\n      return stripDockerfileCommentsDetailed(raw);", ''],
  ['code-dockerfile-uses-shell-stripper', 'return stripDockerfileCommentsDetailed(raw);', 'return stripShellCommentsDetailed(raw);'],
  ['code-dotenv-unrouted', "case 'dotenv':\n      return stripDotenvCommentsDetailed(raw);", ''],
  ['code-dotenv-uses-dockerfile-stripper', 'return stripDotenvCommentsDetailed(raw);', 'return stripDockerfileCommentsDetailed(raw);'],
  ['code-caddyfile-unrouted', "case 'caddyfile':\n      return stripCaddyfileCommentsDetailed(raw);", ''],
  ['code-caddyfile-uses-shell-stripper', 'return stripCaddyfileCommentsDetailed(raw);', 'return stripShellCommentsDetailed(raw);'],
  ISSUES_DROPPED('ts', 'stripCommentsDetailed(raw, { jsx: false })'),
  ISSUES_DROPPED('js', 'stripCommentsDetailed(raw, { jsx: true })'),
  ISSUES_DROPPED('sql', 'stripSqlCommentsDetailed(raw)'),
  ISSUES_DROPPED('yaml', "stripYamlCommentsDetailed(raw, { blockScalars: 'run' })"),
  ISSUES_DROPPED('sh', 'stripShellCommentsDetailed(raw)'),
  ISSUES_DROPPED('dockerfile', 'stripDockerfileCommentsDetailed(raw)'),
  ISSUES_DROPPED('dotenv', 'stripDotenvCommentsDetailed(raw)'),
  ISSUES_DROPPED('caddyfile', 'stripCaddyfileCommentsDetailed(raw)'),
  ['code-always-raw', "const kind = stripKindFor(rel, raw);\n    if (kind === 'none')", "const kind = stripKindFor(rel, raw);\n    if (true)"],
  ['code-kind-ignores-content', 'const kind = stripKindFor(rel, raw);', 'const kind = stripKindFor(rel);'],
  ['code-cache-never-hits', 'let hit = byContent.get(raw);', 'let hit = undefined;'],
  ['code-cache-keyed-by-kind-only', 'let hit = byContent.get(raw);', 'let hit = byContent.values().next().value;'],
  ['code-cache-keyed-by-content-only', "let byContent = shared.stripped.get(kind);\n    if (!byContent) {\n      byContent = new Map();\n      shared.stripped.set(kind, byContent);\n    }", "let byContent = shared.stripped.get('any');\n    if (!byContent) {\n      byContent = new Map();\n      shared.stripped.set('any', byContent);\n    }"],
  ['code-null-for-missing-lost', 'const raw = fileContent(rel);\n    if (raw === null) return null;\n    const kind', "const raw = fileContent(rel);\n    if (raw === null) return { kind: 'none', text: '', issues: [] };\n    const kind"],
  ['codeKind-ignores-content', 'return stripKindFor(p, raw === null ? undefined : raw);', 'return stripKindFor(p);'],
  ['codeIssues-returns-live', 'r.issues.map((x) => ({ ...x }))', 'r.issues'],
  ['codeIssues-none-reports-clean', "return r.issues === null || r.kind === 'none' ? null :", 'return r.issues === null ? null :'],
  ['codeStrict-never-throws', "if (memoCode.get(p).kind === 'none') throw new UnstrippedKind(", 'if (false) throw new UnstrippedKind('],
  ['codeStrict-missing-file-throws', 'const text = code(p);\n    if (text === null) return null;', 'const text = code(p);'],
  ['codeStrict-wrong-class', 'throw new UnstrippedKind(`codeStrict:', 'throw new Error(`codeStrict:'],
  ['unstrippedkind-rel-lost', "this.name = 'UnstrippedKind';\n    this.rel = info.rel === undefined ? null : info.rel;", "this.name = 'UnstrippedKind';\n    this.rel = null;"],
  ['gitunavailable-name-lost', "this.name = 'GitUnavailable';", "this.name = 'Error';"],

  // ---- the disk: symlinks, `.git`, errors ---------------------------------------------------------
  ['disk-error-swallowed', "if (!(e && (e.code === 'ENOENT' || e.code === 'ENOTDIR'))) throw e;\n      }\n    }\n  }\n  shared.kinds.set(rel, kind);", ';\n      }\n    }\n  }\n  shared.kinds.set(rel, kind);'],
  ['disk-follows-symlinks', 'const st = fs.lstatSync(path.join(shared.root, rel));', 'const st = fs.statSync(path.join(shared.root, rel));'],
  ['disk-ancestors-unchecked', "if (cut <= 0 || diskKind(shared, rel.slice(0, cut)) === 'dir') {", 'if (true) {'],
  ['disk-dot-git-readable', 'if (!hasGitSegment(rel)) {', 'if (true) {'],
  ['disk-dot-git-only-at-the-end', "const hasGitSegment = (p) => p.split('/').includes('.git');", "const hasGitSegment = (p) => p === '.git' || p.endsWith('/.git');"],
  ['disk-dot-git-only-at-the-root', "const hasGitSegment = (p) => p.split('/').includes('.git');", "const hasGitSegment = (p) => p === '.git' || p.startsWith('.git/');"],
  ['disk-read-cache-off', 'if (shared.raw.has(rel)) return shared.raw.get(rel);', ''],
  ['disk-reads-uncounted', 'shared.stats.diskReads++;', ''],
  ['walk-dot-git-listed', "if (ent.name === '.git') continue;", ''],
  ['walk-symlinks-unreported', 'if (ent.isSymbolicLink()) links.push(childRel);\n        else if (ent.isDirectory())', 'if (ent.isSymbolicLink()) { /* dropped */ }\n        else if (ent.isDirectory())'],
  ['walk-symlinks-listed-as-files', 'if (ent.isSymbolicLink()) links.push(childRel);', 'if (ent.isSymbolicLink()) { links.push(childRel); files.push(childRel); }'],
  ['walk-symlinked-prefix-followed', "if (diskKind(shared, prefix) === 'dir') visit(prefix === '' ? shared.root : path.join(shared.root, prefix), prefix);", "visit(prefix === '' ? shared.root : path.join(shared.root, prefix), prefix);"],
  ['walk-skips-nothing-below-the-prefix', "const skipped = (rel) => rel.slice(prefix === '' ? 0 : prefix.length + 1).split('/').slice(0, -1).some((s) => SKIP_DIRS.has(s));", 'const skipped = () => false;'],
  ['walk-skip-counts-the-prefix-itself', "rel.slice(prefix === '' ? 0 : prefix.length + 1)", 'rel.slice(0)'],
  ['walk-prefix-boundary-sloppy', "const under = (f) => prefix === '' || f.startsWith(prefix + '/');", "const under = (f) => prefix === '' || f.startsWith(prefix);"],
  ['skip-dist-removed', "const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next']);", "const SKIP_DIRS = new Set(['node_modules', '.git', '.next']);"],
  ['skip-next-removed', "const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next']);", "const SKIP_DIRS = new Set(['node_modules', '.git', 'dist']);"],
  ['skip-node_modules-removed', "const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.next']);", "const SKIP_DIRS = new Set(['.git', 'dist', '.next']);"],

  // ---- the git sources -----------------------------------------------------------------------------
  ['git-env-forwards-GIT-variables', "for (const [k, v] of Object.entries(process.env)) if (!k.startsWith('GIT_')) env[k] = v;\n  env.GIT_OPTIONAL_LOCKS", "for (const [k, v] of Object.entries(process.env)) env[k] = v;\n  env.GIT_OPTIONAL_LOCKS"],
  ['git-missing-binary-is-a-plain-error', "if (r.error.code === 'ENOENT') throw new GitUnavailable('git is not installed or not on PATH');", ''],
  ['git-calls-uncounted', 'shared.stats.gitCalls++;', ''],
  ['index-failure-ignored', 'if (r.status !== 0) throw new GitUnavailable(`not inside a git work tree: ${shared.root}`);\n  const files = new Set();', 'const files = new Set();'],
  ['index-cache-off', 'if (shared.index) return shared.index;', ''],
  ['index-modes-ignored', 'if (REGULAR_MODES.has(mode)) files.add(p);\n    else if (mode === \'120000\') links.add(p);', 'files.add(p);'],
  ['index-symlinks-dropped', "else if (mode === '120000') links.add(p);\n  }\n  shared.index = { files, links };", '}\n  shared.index = { files, links };'],
  ['commit-ref-ignored', 'const rv = runGit(shared, [\'rev-parse\', \'--verify\', \'--quiet\', `${ref}^{commit}`]);', "const rv = runGit(shared, ['rev-parse', '--verify', '--quiet', 'HEAD^{commit}']);"],
  ['commit-not-resolved-to-a-sha', "const sha = rv.stdout.toString('utf8').trim();", 'const sha = ref;'],
  ['commit-unresolvable-is-unavailable', 'throw new Error(`createTree: cannot resolve commit ${JSON.stringify(ref)} to a commit`);', 'throw new GitUnavailable(`createTree: cannot resolve commit ${JSON.stringify(ref)} to a commit`);'],
  ['commit-outside-a-repo-is-a-plain-error', 'if (inside.status !== 0) throw new GitUnavailable(`not inside a git work tree: ${shared.root}`);', 'if (inside.status !== 0) throw new Error(`not inside a git work tree: ${shared.root}`);'],
  ['commit-tree-not-recursive', "['ls-tree', '-r', '-z', sha]", "['ls-tree', '-z', sha]"],
  ['commit-listing-failure-ignored', "if (ls.status !== 0) throw new GitUnavailable(`git ls-tree failed for ${sha}`);", ''],
  ['commit-symlinks-are-files', "if (type === 'blob' && REGULAR_MODES.has(mode)) blobs.set(p, oid);\n    else if (type === 'blob' && mode === '120000') links.add(p);", "if (type === 'blob') blobs.set(p, oid);"],
  ['commit-symlinks-dropped', "else if (type === 'blob' && mode === '120000') links.add(p);", ''],
  ['dirsOf-immediate-parent-only', 'while (i > 0) {', 'if (i > 0) {'],
  ['memberContent-commit-reads-the-working-tree', "if (shared.source === 'commit') {\n    const oid", "if (false) {\n    const oid"],
  ['memberContent-commit-blob-failure-ignored', "if (r.status !== 0) throw new Error(`git cat-file failed for ${rel}`);", ''],
  ['memberContent-tracked-sees-untracked', "if (shared.source === 'tracked' && !shared.index.files.has(rel)) return null;", ''],
  ['memberContent-disk-kind-ignored', "if (diskKind(shared, rel) !== 'file') return null;", ''],
  ['diskIsDir-commit-asks-the-disk', "if (shared.source === 'commit') return shared.dirSet.has(rel);", ''],
  ['diskIsDir-tracked-ignores-the-disk', "return shared.dirSet.has(rel) && diskKind(shared, rel) === 'dir';", 'return shared.dirSet.has(rel);'],
  ['diskIsDir-tracked-asks-the-disk-only', "if (shared.source === 'tracked') return shared.dirSet.has(rel) && diskKind(shared, rel) === 'dir';", ''],
  ['walk-tracked-lists-deleted-files', "(shared.source === 'commit' || diskKind(shared, f) === 'file')", 'true'],
  ['walk-index-symlinks-unreported', 'for (const l of shared.index.links) if (under(l) && !skipped(l)) links.push(l);', ''],
  ['walk-index-skip-rule-removed', 'if (under(f) && !skipped(f) &&', 'if (under(f) &&'],
  ['walk-index-symlinks-skip-rule-removed', 'if (under(l) && !skipped(l)) links.push(l);', 'if (under(l)) links.push(l);'],

  // ---- provenance and trackingState ----------------------------------------------------------------
  ['provenance-head-never-resolved', "if (r.status === 0) shared.head = r.stdout.toString('utf8').trim();", ''],
  ['provenance-head-not-cached', 'if (shared.head === undefined) {', 'if (true) {'],
  ['provenance-git-error-not-swallowed', 'if (!(e instanceof GitUnavailable)) throw e;\n      }\n    }\n    return { source', 'throw e;\n      }\n    }\n    return { source'],
  ['provenance-commit-null', 'return { source: shared.source, commit: shared.commit, head: shared.head, root: shared.root };', 'return { source: shared.source, commit: null, head: shared.head, root: shared.root };'],
  ['provenance-source-wrong', 'return { source: shared.source, commit: shared.commit,', "return { source: 'worktree', commit: shared.commit,"],
  ['trackingState-overlay-null-is-overlay', "return overlay.get(p) === null ? 'absent' : 'overlay';", "return 'overlay';"],
  ['trackingState-commit-always-commit', "return shared.blobs.has(p) ? 'commit' : 'absent';", "return 'commit';"],
  ['trackingState-absent-check-dropped', "if (!isFile(p)) return 'absent';", ''],
  ['trackingState-index-check-dropped', "if (loadIndex(shared).files.has(p)) return 'tracked';", ''],
  ['trackingState-ignored-check-dropped', "if (r.status === 0) return 'ignored';", ''],
  ['trackingState-no-git-throws', "if (e instanceof GitUnavailable) return 'no-git';", ''],
  // ---- found by an independent, operator-generated mutation sweep (not hand-picked) --------------------------
  ["kind-shebang-cut-at-a-fixed-width", "SHEBANG_SH_RE.test(firstLine(raw))", "SHEBANG_SH_RE.test(raw.slice(0, 200).split('\\n', 1)[0])"],
  ["kind-shebang-first-line-is-the-whole-text", "return nl === -1 ? raw : raw.slice(0, nl);", "return raw;"],
  ["runStripper-unknown-kind-returns-raw", "throw new Error(`runStripper: no stripper for kind ${JSON.stringify(kind)}`);", "return { text: raw, issues: [] };"],
  ["dirsOf-walks-past-the-root", "while (i > 0) {", "while (true) {"],
  ["dirsOf-skips-one-character-directories", "while (i > 0) {", "while (i > 1) {"],
  ["disk-ancestor-unchecked-for-one-character-names", "if (cut <= 0 || diskKind(shared, rel.slice(0, cut)) === 'dir') {", "if (cut <= 1 || diskKind(shared, rel.slice(0, cut)) === 'dir') {"],
  ["stats-gitCalls-starts-nonzero", "stats: { diskReads: 0, walks: 0, strips: 0, gitCalls: 0 },", "stats: { diskReads: 0, walks: 0, strips: 0, gitCalls: 1 },"],
  ["memberContent-swallows-every-error", "if (!(e && (e.code === 'ENOENT' || e.code === 'ENOTDIR' || e.code === 'EISDIR'))) throw e;", ""],
  ["memberContent-vanished-file-is-undefined", "if (!(e && (e.code === 'ENOENT' || e.code === 'ENOTDIR' || e.code === 'EISDIR'))) throw e;\n    return null;", "if (!(e && (e.code === 'ENOENT' || e.code === 'ENOTDIR' || e.code === 'EISDIR'))) throw e;\n    return undefined;"],
  ["memberContent-only-enoent-is-nothing", "(e.code === 'ENOENT' || e.code === 'ENOTDIR' || e.code === 'EISDIR')", "(e.code === 'ENOENT')"],
  ["walk-swallows-every-error", "if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) return;\n        throw e;", "return;"],
  ["walk-only-enoent-is-nothing", "if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) return;", "if (e && (e.code === 'ENOENT')) return;"],
  ["walk-index-root-skip-off-by-one", "const skipped = (rel) => rel.slice(prefix === '' ? 0 : prefix.length + 1)", "const skipped = (rel) => rel.slice(prefix === '' ? 1 : prefix.length + 1)"],
  ["list-overlay-segcount-of-the-root", "const segCount = p === '' ? 0 : p.split('/').length;", "const segCount = p === '' ? 1 : p.split('/').length;"],
  ["list-overlay-segcount-ignores-the-prefix", "const segCount = p === '' ? 0 : p.split('/').length;", "const segCount = 0;"],
  ["walk-lists-special-files", "} else if (ent.isFile()) files.push(childRel);", "} else files.push(childRel);"],
  ["isDir-any-overlay-entry-is-a-deletion", "if (v === null && k.startsWith(p + '/')) {", "if (v === null || k.startsWith(p + '/')) {"],
  ["listNonEmpty-message-always-names-an-ext", "${options && options.ext ? `", "${options || options.ext ? `"],
  ["replace-accepts-a-duck-typed-pattern", "} else if (pattern instanceof RegExp) {", "} else if (true) {"],
  ["git-spawn-error-not-looked-at", "if (r.error) {", "if (false) {"],
  ["provenance-swallows-spawn-errors", "if (!(e instanceof GitUnavailable)) throw e;", ";"],
  ["trackingState-swallows-spawn-errors", "if (e instanceof GitUnavailable) return 'no-git';\n      throw e;", "return 'no-git';"],
];

export async function mutationAudit() {
  const selfPath = fileURLToPath(import.meta.url);
  const full = fs.readFileSync(selfPath, 'utf8');
  const cut = full.indexOf('// SELF' + '-TEST');
  if (cut < 0) return { ok: false, results: [{ name: '(setup)', status: 'BAD-MUTATION', detail: 'banner not found' }] };
  const stripUrl = pathToFileURL(path.join(path.dirname(selfPath), 'strip.mjs')).href;
  const spec = "from './strip.mjs'";
  if (full.indexOf(spec) < 0) return { ok: false, results: [{ name: '(setup)', status: 'BAD-MUTATION', detail: 'strip import not found' }] };
  // The unmutated module must be GREEN first: otherwise every mutant would "die" of the baseline.
  const baseline = selfTest({ here: path.dirname(selfPath) });
  if (!baseline.ok) {
    const names = baseline.checks.filter((c) => !c.ok).map((c) => c.name);
    return { ok: false, results: [{ name: '(baseline)', status: 'BAD-MUTATION', detail: `unmutated selfTest is not green: ${names.slice(0, 3).join(' | ')}` }] };
  }
  const impl = full.slice(0, cut);
  const rest = full.slice(cut);
  const results = [];
  const seen = new Set();
  for (const [name, from, to] of MUTATIONS) {
    if (seen.has(name)) {
      results.push({ name, status: 'BAD-MUTATION', detail: 'duplicate mutation name' });
      continue;
    }
    seen.add(name);
    const first = impl.indexOf(from);
    if (first === -1 || impl.indexOf(from, first + 1) !== -1) {
      results.push({ name, status: 'BAD-MUTATION', detail: first === -1 ? 'from-text not found' : 'from-text ambiguous' });
      continue;
    }
    const mutatedImpl = impl.replace(from, () => to);
    if (mutatedImpl === impl) {
      results.push({ name, status: 'BAD-MUTATION', detail: 'mutation changed nothing' });
      continue;
    }
    const mutated = (mutatedImpl + rest).replace(spec, () => `from '${stripUrl}'`);
    let verdict;
    try {
      const mod = await import('data:text/javascript;base64,' + Buffer.from(mutated, 'utf8').toString('base64'));
      verdict = mod.selfTest({ here: path.dirname(selfPath) });
    } catch (e) {
      // A mutant that cannot even run has NOT been killed by a check: it died of the harness (or of a
      // syntax error in the mutation). Count it as a bad mutation so it can never inflate the score.
      results.push({ name, status: 'BAD-MUTATION', detail: `mutant did not run: ${e && e.name}: ${e && e.message}` });
      continue;
    }
    const failing = verdict.checks.filter((c) => !c.ok).map((c) => c.name);
    results.push(verdict.ok ? { name, status: 'SURVIVED', detail: '' } : { name, status: 'killed', detail: failing.slice(0, 2).join(' | ') + (failing.length > 2 ? ` (+${failing.length - 2})` : '') });
  }
  return { ok: results.every((r) => r.status === 'killed'), results };
}

// ---------------------------------------------------------------------------------------------
function isMain(metaUrl) {
  try {
    return !!process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(metaUrl));
  } catch {
    return false;
  }
}

if (isMain(import.meta.url) && process.argv.includes('--mutation-audit')) {
  // .then(), not top-level await: a TLA module cannot be require()d by a CommonJS caller.
  mutationAudit().then(
    (a) => {
      for (const r of a.results) console.log(`${r.status.padEnd(12)} ${r.name.padEnd(46)} ${r.detail}`);
      const bad = a.results.filter((r) => r.status !== 'killed').length;
      console.log(`tree.mjs mutation-audit: ${a.ok ? 'PASS' : 'FAIL'} (${a.results.length - bad}/${a.results.length} mutants killed)`);
      process.exitCode = a.ok ? 0 : 1;
    },
    (e) => {
      console.log(`tree.mjs mutation-audit: ERROR ${e && e.name}: ${e && e.message}`);
      process.exitCode = 1;
    },
  );
} else if (isMain(import.meta.url)) {
  const r = selfTest();
  const failed = r.checks.filter((c) => !c.ok);
  const verbose = process.argv.includes('--verbose');
  if (verbose) for (const c of r.checks) console.log(`${c.ok ? 'ok  ' : 'FAIL'} ${c.name}${c.detail ? ' -- ' + c.detail : ''}`);
  else for (const c of failed) console.log(`FAIL ${c.name} -- ${c.detail}`);
  console.log(`tree.mjs selfTest: ${r.ok ? 'PASS' : 'FAIL'} (${r.checks.length - failed.length}/${r.checks.length} checks)`);
  process.exitCode = r.ok ? 0 : 1;
}
