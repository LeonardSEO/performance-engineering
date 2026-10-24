# React and Next.js decisions

## Server and cache scope

Record installed versions, router, compiler settings and relevant cache configuration. Current Next.js documentation describes more than one caching model; do not assume a newer model's defaults or invalidation signature in an older app.

React `cache` memoizes supported Server Component work within a server request and also caches errors. Reuse the wrapper and appropriate stable arguments; it is not a persistent shared cache. Request-local user data belongs in request/render scope, not module-level mutable variables. Shared caches require deliberately partitioned keys and invalidation from the data/backend contracts.

Authenticate and authorize server actions/handlers independently of client UI state. Do not cache a single mutable currentUser or skip capability checks to parallelize requests. A stable shell may be rendered before optional scoped data, but not before authorization where that exposes privileged content.

## Streaming and hydration

Choose Suspense boundaries around independently usable async Server Component regions or a supported suspense-aware data integration. Effect-based fetching does not suspend merely because it is wrapped in Suspense. Avoid fresh uncached client promises per render and catch rejected work through the established error boundaries.

Keep shared layout outside a giant blocking boundary. Preserve complete-record requirements before enabling editors and saves. Start truly independent scoped requests concurrently; a dependency on identity remains a dependency. Do not hold all regions until optional data resolves.

Hydration mismatches need a cause and consistent rendering model. `suppressHydrationWarning` is not a blanket performance fix. Test direct navigation, server output, cache reuse, client navigation and auth transitions.

## Component cost

Record profiler commits, durations, broad subscriptions and the actual target interaction before applying memoization. Pure inexpensive expressions need no useMemo. A newly allocated prop is a reason to investigate, not proof the user sees slowness. Inspect compiler coverage when enabled rather than assuming it eliminates every render cost.

Keep urgent controlled input state synchronous. Defer nonurgent derived rendering with supported concurrent primitives where useful; deferred rendering does not reorder server writes. Avoid redundant effect-driven derived state and cleanup leaks, including Strict Mode setup/cleanup cycles.

Use the existing client query library and state architecture. A measured bottleneck can justify an architectural proposal, but routine work should not silently introduce SWR, a store migration or compiler rollout. Split optional heavy client modules based on actual bundle evidence, not a universal rule against barrel imports.

References: [React cache](https://react.dev/reference/react/cache), [React Profiler](https://react.dev/reference/react/Profiler), [Next.js caching](https://nextjs.org/docs/app/getting-started/caching-and-revalidating). Resolve documentation against the installed version before coding.
