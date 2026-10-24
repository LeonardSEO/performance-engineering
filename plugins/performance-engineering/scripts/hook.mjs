// Advisory only: malformed inputs and local I/O failures must never block agent work.
import { fileURLToPath } from 'node:url';
import { handleHook } from './engine.mjs';
const host = process.argv[2];
const pluginRoot = fileURLToPath(new URL('../', import.meta.url));
const MAX_INPUT = 1024 * 1024;
let bytes = 0;
const chunks = [];
process.stdin.on('data', chunk => {
  bytes += chunk.length;
  if (bytes <= MAX_INPUT) chunks.push(chunk);
});
process.stdin.on('error', () => { process.exitCode = 0; });
process.stdin.on('end', () => {
  try {
    if (bytes > MAX_INPUT || process.env.PERFORMANCE_ENGINEERING_HOOKS === 'off') return;
    const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    const output = handleHook(input, {host, pluginRoot});
    if (output) process.stdout.write(output + '\n');
  } catch { /* Fail open, with no payload logging. */ }
});
