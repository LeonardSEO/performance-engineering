---
name: react-performance
description: "Apply React DOM and Next.js-specific performance techniques after confirming installed versions and a measured render, hydration, server/client, bundle or data-loading bottleneck. Keep general data and loading rules in their owner skills; do not apply DOM APIs to React Native or add memoization everywhere."
---
# React Performance

Read the affected workspace's package/config files before choosing APIs. Distinguish React DOM, Next.js App Router/Pages Router, and React Native. Check framework versions and compiler/caching configuration rather than assuming current documentation matches the project.

## Framework application

- Use [Data performance](../data-performance/SKILL.md) for the request graph and [Progressive page rendering](../progressive-page-rendering/SKILL.md) for readiness. Stream independently useful Server Component regions under appropriately placed Suspense boundaries while the authorized shell is available.
- Suspense is not a generic wrapper that makes effect-based fetches suspend. Use the installed framework's supported data mechanism and stable promise ownership; do not create a fresh client promise on every render.
- Keep request/user state within the request or render tree. Module-level mutable user state is shared across server requests and can leak data.
- React `cache` is for supported Server Component request-level memoization, not a persistent tenant-aware cache. Reuse a stable wrapper; distinguish this from Next.js Data/Full Route/Router caches and the app's client cache.
- Inspect actual Next.js cache mode and version before adding `use cache`, revalidation or invalidation APIs. Preserve authorization in server entrypoints and mutations.
- Profile commits for the target interaction. Find expensive components and broad subscriptions before adding memo/useMemo/useCallback or changing state libraries. New object identity alone does not establish a user-visible regression.
- Keep controlled typing immediate. Use transitions/deferred values for suitable nonurgent expensive renders; they do not accelerate the network or replace server-write ordering.
- Lazy-load heavy optional client features; avoid a route waterfall for the frequent critical path. Reduce serialized props across server/client boundaries while preserving required data.
- Fix hydration causes instead of suppressing mismatches as a performance shortcut.

Read [React and Next.js decisions](references/react-decisions.md) for cache, streaming and rendering changes. Use the existing framework and libraries; no blanket compiler enablement or dependency migrations.

## Verify

Use [Measurement](../performance-engineering/references/measurement.md) plus profiler/trace evidence where available. Check hydration, direct navigation, authentication, concurrent requests, cache invalidation, Strict Mode cleanup, typing and relevant correctness tests. State limitations when only static review is possible.
