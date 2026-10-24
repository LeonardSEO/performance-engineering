# Queries, pools and caches

## Query execution

Use traces/query logs to count requests and locate time. Fix N+1 with scoped joins, batching or the ORM's relation loading; inspect result growth and memory. A join that duplicates large payloads may be worse than a bounded batch.

Before proposing an index, inspect predicates, ordering, estimated/actual rows and selectivity. A sequential scan can be correct for a small table or dominant value. Stale statistics, missing composite order, expression predicates and leading wildcards are different diagnoses. Match the index to the actual query and database engine; include write/storage cost and deployment locking.

`EXPLAIN ANALYZE` and equivalent executing plans run the statement. Use read-only representative queries and an appropriate environment; do not apply it blindly to writes or expensive production traffic. Index changes and statistics maintenance are mutations subject to normal project deployment scope.

Paginate bounded results with stable ordering and a unique tie-breaker. Test ties, concurrent inserts and empty/last pages. Keyset pagination helps certain deep sequential scans but changes navigation semantics; preserve the API contract.

## Connection and resource pressure

Separate time waiting for a connection from time executing work. Count all instances and pools against the database's capacity. Inspect leaked/long transactions, slow downstream calls while holding connections, and concurrency bursts. Increasing max connections can move a queue into a more fragile layer. In autoscaling environments, use the existing supported pooling/proxy model rather than creating a pool per request.

Profile CPU work, allocations, GC, lock contention and external dependencies. Async syntax is not a worker. Queue/background offloading must preserve actual completion semantics, durability and observability; do not return success for work that was silently abandoned.

## Server caches

Choose in-process, shared or CDN caching from measured cost and consistency needs. Keys include every response input: tenant, viewer/permission scope, locale, filters and feature flags as applicable. Define TTL or invalidation/version strategy, bounds and error behavior.

Coalesce concurrent misses or use controlled stale refresh only when allowed. Avoid caching failures indefinitely, unbounded growth and synchronized expiry stampedes. A cached decision about permissions, payment or inventory may need authoritative revalidation before commit. Public cache headers are inappropriate for personalized content without a rigorously correct partitioning policy.

Verify cross-tenant isolation, mutation invalidation, expiry, concurrent misses and backend failure. Compare p95 with errors and throughput under the same representative workload; a faster benchmark caused by omitting required checks is a regression.
