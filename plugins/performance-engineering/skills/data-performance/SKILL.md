---
name: data-performance
description: "Improve client and application data loading when request waterfalls, redundant reads, stale responses, overfetching, cache misses, or speculative prefetch cause delay. Covers request scope, concurrency, caching and mutation ordering across frameworks; database execution belongs to backend-performance."
---
# Data Performance

Own request scheduling and data correctness, independently of the UI framework. Inspect the existing component-to-data-layer path and reuse its query/cache facilities.

## Diagnose and change

- Draw the dependency graph. Resolve authentication, capability and tenant/selection scope before dependent reads. Starting every request earlier is wrong if it broadens access or loads data the user cannot need.
- Start independent work concurrently with bounded concurrency. Use all-or-nothing aggregation only where the consumer needs every result; independently useful sections publish separately. Moving `await` does not remove a dependency or cancel abandoned work.
- Reuse valid data and in-flight requests. Request keys include every input affecting the answer, including tenant/account, filters, locale, and permissions where applicable. Declare freshness, eviction and invalidation rather than adding an unbounded Map.
- Protect new intent from old results. Abort obsolete reads when supported and also guard publication by current request/scope identity. Client cancellation does not prove server work stopped.
- Prefetch only likely read-only work on intent. Bound bytes and concurrency, reuse cache entries, and prioritize the current task. HTTP GET alone does not prove an endpoint is side-effect-free.
- Preserve immediate local editing while choosing ordering/versioning for persistent writes. A request ID that only suppresses an old UI response cannot stop an older server write from winning.

Read [Scheduling, cache and concurrency](references/data-contracts.md) for multi-request, prefetch or persistence changes. For immediate feedback and recovery behavior, use [Doherty Threshold](../doherty-threshold/SKILL.md); skeletons and section availability belong to [Progressive page rendering](../progressive-page-rendering/SKILL.md).

## Verify

Use the shared [measurement contract](../performance-engineering/references/measurement.md). Exercise cold/warm reads, scope switches, deduplication, failure and retry, late responses, repeated writes, and invalidation after mutation. Confirm that tenant changes never display another scope's cached data and that the persisted final value matches the latest intended state.

For multiple writers, client restarts or a response lost after commit, use [Concurrent mutation protocol](references/mutation-protocol.md).
