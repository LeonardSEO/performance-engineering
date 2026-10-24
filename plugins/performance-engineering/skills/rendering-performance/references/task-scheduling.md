# Long tasks and cooperative scheduling

Profile the actual call stack. Splitting work can improve input-to-paint responsiveness while total completion stays similar or grows; measure both. `async`, `await Promise.resolve()` and `queueMicrotask()` alone do not yield to a new browser task or guarantee a paint.

A progressive-enhancement helper with a task-based fallback:

```js
function yieldToMain() {
  if (globalThis.scheduler?.yield) return globalThis.scheduler.yield();
  return new Promise(resolve => setTimeout(resolve, 0));
}
async function processJobs(jobs, signal) {
  let sliceStart = performance.now();
  for (const job of jobs) {
    if (signal?.aborted) throw signal.reason;
    job();
    if (performance.now() - sliceStart >= 8) {
      await yieldToMain();
      sliceStart = performance.now();
    }
  }
}
```

Eight milliseconds is an illustrative slice, not a universal deadline. The fallback lacks prioritized continuation and timers may be clamped. Inspect installed browser support. An individual expensive `job()` still blocks until it returns; split it internally or assess a worker when transfer, cancellation and memory costs permit. Do not yield after every tiny operation or force a dependency install for this helper.

Acknowledge the input before long work, then allow the browser an opportunity to display it. Protect current intent when yielding makes other handlers interleave. Keep required validation and persistence semantics intact; a worker/job queue needs its own actual completion/error contract.

Verify repeated input, cancellation, navigations and hidden tabs; compare interaction timing, long tasks, completion time, output correctness and CPU/memory. A local event timing or double-frame probe is not field INP.

Source: [web.dev long tasks and scheduler.yield](https://web.dev/articles/optimize-long-tasks).
