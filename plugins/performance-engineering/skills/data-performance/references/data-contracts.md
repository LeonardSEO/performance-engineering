# Scheduling, caches and concurrency

## Request graph

List prerequisites that establish authorization and selected tenant/account. Then identify independent reads within that scope. Start independent work together, cap concurrency for large collections, and avoid adding an all-or-nothing wait where sections can fail independently. `Promise.all` rejects early without cancelling other promises; make resource and error handling explicit. `allSettled` is appropriate only when the consumer can use partial outcomes.

Keep the existing repository/service boundary. Do not issue a broad unscoped read to make code appear more parallel. Fetch secondary data when its route, tab, selection or intent makes it useful. A measured critical route-chunk bottleneck can justify preloading that entrypoint; it does not justify making every route eager.

## Cache contract

State key inputs, owner, maximum size, freshness, invalidation and account-change behavior. Partition by tenant/account and all inputs affecting the result. Client caches must not retain visible previous-scope records while displaying a new tenant's shell. Read-only stale-while-revalidate is useful when the domain accepts staleness; authoritative commit decisions may still need a fresh check.

Do not replace the existing cache with hand-written timers or assume a query library automatically solves concurrent mutations. Inspect installed-version invalidation and rollback behavior. Coalesce matching in-flight reads, but remove failed entries and permit explicit retry.

## Read race example

Query A begins, then the user selects B. Abort A if possible, mark B as current, and accept a result only if its operation and scope are still current. Clear pending indicator timers on settlement, replacement and unmount. Test rejection as well as success; an old rejection must not set B's error.

## Write ordering

For repeated edits, persist explicit desired values where supported rather than retry-sensitive toggle commands. Choose per-entity serialization, server versions/ETags, or the existing conflict protocol. Do not claim latest UI response protection guarantees latest server value. If the first request already reached the server, aborting the browser request may not cancel it.

Track optimistic changes at the affected entity/field, not with a stale whole-cache snapshot. On failure, rebase/undo only the failed change or preserve an unsaved draft. Reconcile canonical server values without erasing newer user input. Use existing idempotency for retry-sensitive operations; do not blindly retry consequential mutations.

## Speculation

Prefetch likely read-only requests on focus, deliberate hover, pointer-down or a predictable next step. Debounce passing hovers, deduplicate, and cancel scheduled work when intent disappears. Respect data-saving hints when available, but absence does not imply free bandwidth. Keep speculative work below the current page's critical resources.

Never prefetch mutations or supposedly safe GET endpoints with actual side effects. Prerendering can execute page code and analytics; verify current browser support, permissions, wasted bytes and server cost before recommending it.
