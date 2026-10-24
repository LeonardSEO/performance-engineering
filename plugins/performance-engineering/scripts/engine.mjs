import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

export const DOMAINS = Object.freeze({
  'performance-engineering': 'Classify the bottleneck and compare equivalent measurements; source-only findings are hypotheses.',
  'data-performance': 'Preserve authorization/scope prerequisites, bound independent reads, and protect newer intent and persisted writes.',
  'backend-performance': 'Trace server/query/pool time; preserve tenant isolation and inspect plans before tuning indexes or caches.',
  'progressive-page-rendering': 'Reveal an authorized shell and independent ready regions; keep incomplete editors unavailable.',
  'asset-performance': 'Inspect the measured critical resource path; do not lazy-load the actual LCP image or preload everything.',
  'doherty-threshold': 'Acknowledge immediately, reconcile safe optimistic changes, and show honest progress without artificial waits.',
  'rendering-performance': 'Profile main-thread/layout/paint work; keep motion interruptible and respect reduced motion.',
  'react-performance': 'Check React DOM/Next.js versions, request-local state, streaming boundaries and actual render cost.',
  'react-native-performance': 'Use native JS/UI and release-device evidence; avoid DOM/CSS fixes and speculative compiler migrations.',
});
const EVENTS = new Set(['SessionStart', 'UserPromptSubmit', 'PostToolUse']);
const MAX_FILE = 256 * 1024;
const within = (root, target) => {
  const rel = path.relative(root, target);
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel));
};
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

function safeRead(root, file, max = MAX_FILE) {
  try {
    const rootReal = fs.realpathSync(root);
    const absolute = path.resolve(file);
    if (fs.lstatSync(absolute).isSymbolicLink()) return null;
    const real = fs.realpathSync(absolute);
    if (!within(rootReal, real)) return null;
    const stat = fs.statSync(real);
    if (!stat.isFile() || stat.size > max) return null;
    return fs.readFileSync(real, 'utf8');
  } catch { return null; }
}

// macOS /var and /private/var may identify the same location. Resolve existing
// ancestors also for added/deleted files, while retaining containment checks.
function canonicalPath(file) {
  try { return fs.realpathSync(file); }
  catch {
    const parent = path.dirname(file);
    return parent === file ? file : path.join(canonicalPath(parent), path.basename(file));
  }
}

export function detectStack(cwd, file) {
  cwd = canonicalPath(path.resolve(cwd));
  let dir = file ? path.dirname(canonicalPath(path.resolve(cwd, file))) : cwd;
  if (!within(cwd, dir)) return 'unknown';
  for (let depth = 0; depth < 16 && within(cwd, dir); depth++) {
    const raw = safeRead(cwd, path.join(dir, 'package.json'));
    if (raw !== null) {
      try {
        const pkg = JSON.parse(raw);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
        // The nearest package is authoritative: never inherit a sibling/root app's platform.
        if (deps['react-native'] || deps.expo) return 'native';
        if (deps.next || deps['react-dom']) return 'react';
        return 'generic';
      } catch { return 'unknown'; }
    }
    if (dir === cwd) break;
    dir = path.dirname(dir);
  }
  return 'unknown';
}

export function extractFiles(input, cwd) {
  const args = input?.tool_input;
  if (!args || typeof args !== 'object' || Array.isArray(args)) return [];
  const names = [];
  const tool = input.tool_name;
  if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
    if (typeof args.file_path === 'string') names.push(args.file_path);
  } else if (tool === 'apply_patch') {
    const patch = typeof args.command === 'string' ? args.command : typeof args.input === 'string' ? args.input : typeof args.patch === 'string' ? args.patch : '';
    for (const match of patch.matchAll(/^\*\*\* (?:Update|Add|Delete) File: (.+)$/gm)) names.push(match[1].trim());
    for (const match of patch.matchAll(/^\*\*\* Move to: (.+)$/gm)) names.push(match[1].trim());
  }
  // Shell syntax is not a trustworthy record of files changed. Consume explicit structured paths only.
  if (tool === 'Bash' && input.tool_response && typeof input.tool_response === 'object') {
    const response = input.tool_response;
    if (typeof response.filePath === 'string') names.push(response.filePath);
    if (Array.isArray(response.changed_files)) names.push(...response.changed_files.filter(x => typeof x === 'string'));
  }
  return [...new Set(names)].filter(n => n.length < 4096 && !/[\x00-\x1f]/.test(n))
    .map(n => canonicalPath(path.resolve(cwd, n))).filter(n => within(cwd, n)).slice(0, 24);
}

const PERF = /\b(?:performance|optimi[sz]\w*|slow\w*|sluggish|latency|bottleneck\w*|waterfall\w*|jank\w*|fps|lcp|inp|cls|ttfb|prefetch\w*|skeleton\w*|optimistic|hydration|profil\w*|cach\w*|traag|trage|vertraging|sneller|snelheid|laden|laadtijd|haper\w*)\b/i;
const DOC_ONLY = /\b(?:readme|documentation|spelling|typo|punctuation|license|licence|documentatie|spelfout)\b/i;

export function routePrompt(prompt, stack = 'unknown') {
  if (typeof prompt !== 'string' || prompt.length > MAX_FILE || !PERF.test(prompt)) return [];
  const positiveIntent = prompt.replace(/\b(?:do not|don't|never|niet)\b[^.!?\n]*/gi, '');
  if (DOC_ONLY.test(positiveIntent) && !/\b(?:implement|code|fix (?:the )?(?:app|page|api)|application|runtime|profiler|implementeren)\b/i.test(positiveIntent)) return [];
  const scores = new Map();
  const add = (domain, score) => scores.set(domain, (scores.get(domain) ?? 0) + score);
  if (/react[ -]?native|\bexpo\b|hermes|turbo.?module|native startup|js.?thread|ui.?thread/i.test(prompt)) add('react-native-performance', 100);
  if (/\b(?:database|sql|n\+1|query plan|queries|endpoint|connection pool|backend|server latency)\b/i.test(prompt)) add('backend-performance', 50);
  if (/waterfall|prefetch|dedup|out.of.order|stale|verouderd|tenant|cach|request|data load|fetch/i.test(prompt)) add('data-performance', 30);
  if (/optimistic|optimistisch|toggle|button|click|tap|save|saving|progress|feedback|rollback|opslaan|voortgang|knop/i.test(prompt)) add('doherty-threshold', 45);
  if (/\blcp\b|image|font|bundle|stylesheet|third.party|compression|resource|afbeelding/i.test(prompt)) add('asset-performance', 40);
  if (/skeleton|shell|full.page|cold navigation|progressive|loading screen|page chrome|laadscherm/i.test(prompt)) add('progressive-page-rendering', 45);
  if (/main.thread|layout|paint|animation|motion|scroll|jank|dom\b|long task|rendering/i.test(prompt)) add('rendering-performance', 35);
  if (/\breact\b|next\.?js|hydration|suspense|server component|re.render|memoization/i.test(prompt) && !scores.has('react-native-performance') && stack !== 'native') add('react-performance', 55);
  if (stack === 'native') {
    add('react-native-performance', 80);
    scores.delete('rendering-performance'); scores.delete('react-performance'); scores.delete('asset-performance');
  }
  if (scores.has('react-native-performance')) {
    scores.delete('react-performance'); scores.delete('rendering-performance');
  }
  if (!scores.size) add('performance-engineering', 1);
  return [...scores].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 2).map(x => x[0]);
}

export function routeFiles(files, cwd) {
  cwd = canonicalPath(path.resolve(cwd));
  const scores = new Map();
  const add = (d, n) => scores.set(d, (scores.get(d) ?? 0) + n);
  for (const file of files) {
    const rel = path.relative(cwd, file).replaceAll('\\', '/');
    if (/(?:^|\/)(?:node_modules|\.git|dist|build|coverage|\.next)(?:\/|$)/.test(rel)) continue;
    if (/\.(?:md|txt|lock|map)$/i.test(rel) || /(?:^|\/)licenses?\//i.test(rel)) continue;
    const stack = detectStack(cwd, file);
    const source = safeRead(cwd, file, 64 * 1024) ?? '';
    const native = stack === 'native' || /(?:from\s*|require\s*\()\s*['"](?:react-native|expo(?:-[^'"]+)?)['"]/.test(source);
    if (native && /\.(?:[cm]?[jt]sx?|swift|kt|java|mm?|cpp)$/.test(rel)) { add('react-native-performance', 80); continue; }
    if (/\.(?:sql|prisma)$|(?:^|\/)(?:api|server|backend|db|database|repositories)(?:\/|$)/i.test(rel)) add('backend-performance', 60);
    if (/(?:^|\/)(?:queries|services|cache|data)(?:\/|$)|(?:use.*Query|fetch|query|cache)\.[jt]sx?$/i.test(rel)) add('data-performance', 45);
    if (/\.(?:avif|webp|jpe?g|png|woff2?|svg)$|(?:vite|webpack|rollup)\.config|(?:^|\/)(?:assets|fonts)(?:\/|$)/i.test(rel)) add('asset-performance', 50);
    if (/\.(?:css|scss|sass)$|(?:animation|motion|virtual.*list)\.[jt]sx?$/i.test(rel)) add('rendering-performance', 50);
    if (/(?:^|\/)(?:page|layout|loading|route)\.[jt]sx?$|(?:^|\/)(?:routes|pages)(?:\/|$)/i.test(rel)) add('progressive-page-rendering', 40);
    if (/(?:button|toggle|save|progress|mutation|autosave)\.[jt]sx?$/i.test(rel)) add('doherty-threshold', 50);
    if (stack === 'react' && /\.[jt]sx$/.test(rel)) add('react-performance', 30);
  }
  return [...scores].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 2).map(x => x[0]);
}

function stateDirectory(cwd, base) {
  const root = base || process.env.PLUGIN_DATA || process.env.CLAUDE_PLUGIN_DATA || path.join(os.tmpdir(), 'performance-engineering');
  const dir = path.resolve(root, 'hook-state-v1');
  if (within(cwd, dir)) throw new Error('State must remain outside the user project');
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  if (fs.lstatSync(dir).isSymbolicLink() || within(cwd, fs.realpathSync(dir))) throw new Error('Unsafe state path');
  return dir;
}
function cleanup(dir, now) {
  const entries = fs.readdirSync(dir).filter(n => /^[a-f0-9]{64}\.json$/.test(n)).map(n => {
    const file = path.join(dir, n); return {file, time: fs.lstatSync(file).mtimeMs};
  }).sort((a,b) => b.time - a.time);
  for (const [i, item] of entries.entries()) if (i >= 127 || now - item.time > 86_400_000) {
    try { fs.unlinkSync(item.file); } catch { /* Another hook may have cleaned it. */ }
  }
}
function useState(dir, key, now, fn) {
  const file = path.join(dir, `${key}.json`), lock = `${file}.lock`;
  let fd;
  try {
    try { fd = fs.openSync(lock, 'wx', 0o600); }
    catch (error) {
      if (error.code !== 'EEXIST' || now - fs.lstatSync(lock).mtimeMs < 5000) return '';
      fs.unlinkSync(lock); fd = fs.openSync(lock, 'wx', 0o600);
    }
    let state = {v:1, domains:[], active:false};
    const raw = safeRead(dir, file, 4096);
    if (raw) {
      try {
        const prior = JSON.parse(raw);
        if (prior.v === 1 && Array.isArray(prior.domains)) state = {v:1, domains:prior.domains.filter(d => Object.hasOwn(DOMAINS,d)).slice(0,9), active: prior.active === true};
      } catch { /* Invalid metadata is replaceable, never executable. */ }
    }
    const out = fn(state);
    const temp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
    try { fs.writeFileSync(temp, JSON.stringify(state), {mode:0o600, flag:'wx'}); fs.renameSync(temp, file); }
    finally { try { fs.unlinkSync(temp); } catch {} }
    return out;
  } finally {
    if (fd !== undefined) { fs.closeSync(fd); try { fs.unlinkSync(lock); } catch {} }
  }
}

export function handleHook(input, options = {}) {
  try {
    if (!input || typeof input !== 'object' || Array.isArray(input) || !EVENTS.has(input.hook_event_name)) return '';
    if (typeof input.cwd !== 'string' || typeof input.session_id !== 'string' || !input.session_id || input.session_id.length > 256) return '';
    const cwd = fs.realpathSync(input.cwd);
    if (!fs.statSync(cwd).isDirectory()) return '';
    const host = options.host;
    if (!['codex','claude'].includes(host)) return '';
    const pluginRoot = path.resolve(options.pluginRoot);
    const event = input.hook_event_name;
    const stateDir = stateDirectory(cwd, options.dataRoot);
    if (event === 'SessionStart') cleanup(stateDir, options.now ?? Date.now());
    const key = hash(`${host}\0${cwd}\0${input.session_id}`);
    const text = useState(stateDir, key, options.now ?? Date.now(), state => {
      if (event === 'SessionStart') {
        state.domains = []; state.active = false;
        const stack = detectStack(cwd);
        const context = `Performance Engineering is available. For performance work only, read ${path.join(pluginRoot,'skills/performance-engineering/SKILL.md')} and select the relevant domain. Detected root package: ${stack}; nested workspaces may differ. Preserve correctness and authorization; compare equivalent measurements. Unrelated tasks do not need an audit. Hooks only advise and do not run benchmarks.`;
        return context.length <= 1000 ? context : '';
      }
      const domains = event === 'UserPromptSubmit' ? routePrompt(input.prompt, detectStack(cwd)) : routeFiles(extractFiles(input,cwd),cwd);
      if (!domains.length) return '';
      if (event === 'UserPromptSubmit') state.active = true;
      const fresh = domains.filter(d => !state.domains.includes(d));
      if (!fresh.length) return '';
      const lines = ['Performance Engineering: relevant guidance only; do not expand the user\'s scope.'];
      const included = [];
      for (const domain of fresh.slice(0,2)) {
        const line = `Read ${path.join(pluginRoot,'skills',domain,'SKILL.md')}. ${DOMAINS[domain]}`;
        if ([...lines,line].join('\n').length <= 3000) { lines.push(line); included.push(domain); }
      }
      if (!included.length) return '';
      state.domains = [...new Set([...state.domains,...included])];
      return lines.join('\n');
    });
    return text ? JSON.stringify({hookSpecificOutput:{hookEventName:event,additionalContext:text}}) : '';
  } catch { return ''; }
}
