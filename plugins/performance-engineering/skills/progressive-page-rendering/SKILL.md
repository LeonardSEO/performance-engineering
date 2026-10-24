---
name: progressive-page-rendering
description: "Improve cold or direct navigation when page chrome and useful sections are hidden behind route chunks, full-page loading flags, or optional data. Render stable structure and independently ready content while preserving access boundaries and complete-record requirements for editors."
---
# Progressive Page Rendering

Make the page available in useful stages. Render the authorized page shell and stable layout before missing content, then replace only the relevant placeholders. Do not disguise failures or invent values.

## Find the blocker

Trace the route, capability checks, data providers, services and repository. Determine whether the wait is route-chunk discovery, an all-page loading condition, a request dependency, or unnecessary optional data. Reuse the current architecture. Do not bypass authentication to paint privileged content earlier.

## Render deliberately

- Keep available header, navigation, labels, table headings, tabs and layout visible. Independently usable sections need independent readiness and errors.
- Use neutral shape-matched skeletons where content is missing and its layout is known. Reserve responsive geometry. Unknown metrics are not zero; pending lists are not empty results.
- Keep useful existing content during refresh; indicate pending/stale state when otherwise misleading. Scope changes must not leak a previous tenant's content.
- Reveal ready content immediately. Do not add a minimum loader duration or decorative stagger that hides an already usable result.
- Preserve real error, retry, permission-denied and empty states. A request failure must not leave a permanent skeleton.
- Keep incomplete editors unavailable when saving could overwrite unloaded fields. A read-only shell can be early while an editable record waits for completeness.

Read [Readiness and skeletons](references/readiness.md) when changing loading boundaries. Let [Data performance](../data-performance/SKILL.md) own request ordering and caches. For framework-specific streaming, consult [React performance](../react-performance/SKILL.md) only in a confirmed React web app.

## Verify

Check cold entry, direct detail URLs, repeat navigation, refresh, scope changes, missing permissions, partial failure and delayed optional sections. Confirm stable geometry, no false zero/empty flash, no incomplete save, and that useful primary content is not gated by secondary data. Use [Measurement](../performance-engineering/references/measurement.md) to distinguish shell paint from useful content and final completion.
