---
name: backend-performance
description: "Diagnose server and API latency, database N+1 queries, query plans, connection-pool waits, cache stampedes, CPU pressure, or memory growth. Use request traces and representative workload evidence; do not change indexes, pools or caching based only on guesses."
---
# Backend Performance

Find where server time is spent before changing queries or infrastructure. Preserve API semantics, access control, tenant predicates, transaction boundaries, and required validation.

## Trace the bottleneck

Measure queue/connection wait, database execution, external calls, CPU, serialization and response transfer separately. Inspect p50/p95 and relevant tails under a representative workload, with errors and throughput alongside latency. A faster success path that drops work or errors more often is not a win.

Read [Queries, pools and caches](references/server-diagnostics.md) when changing data access or caching.

- For N+1, batch/join/select related data through the existing repository, within the authorized scope. Bound result size and avoid replacing many small queries with an enormous Cartesian result.
- Inspect query plans and row counts before adding indexes. Sequential scans can be optimal. Consider selectivity, statistics, ordering, query shape, index write/storage cost and migration lock behavior.
- Paginate with a maximum limit and stable order, including a unique tie-breaker. Consider keyset pagination for measured deep-page cost.
- Diagnose pool wait rather than just increasing pool size. Aggregate connections across instances; avoid a pool per request. Use existing proxies where appropriate.
- Cache expensive reusable work only when a documented freshness window is acceptable. Partition by all response inputs, bound memory, coalesce misses, and define invalidation. Never make authorization depend on an incorrectly shared cached result.
- Profile CPU and retained memory. Async syntax does not make CPU work parallel; move suitable work off the request-critical executor using the runtime's actual worker/job facilities.

## Verify

Use [Measurement](../performance-engineering/references/measurement.md) with equivalent datasets, concurrency, cache state and load. Recheck errors, permissions, pagination consistency, transaction behavior, cancellation and cache isolation. Query-plan commands can execute statements; inspect their effects before running against a live database. Report untested production load or deployment constraints explicitly.
