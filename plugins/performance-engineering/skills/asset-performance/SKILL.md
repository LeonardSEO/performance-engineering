---
name: asset-performance
description: "Improve web loading and resource delivery when traces show late LCP discovery, oversized images or fonts, blocking CSS/JavaScript, heavy bundles, third-party scripts, or inefficient HTTP/CDN caching. Use measured critical-path evidence without assuming a framework."
---
# Asset Performance

Follow the critical resource path from document response to useful paint. A smaller file is useful only if it addresses the actual bottleneck without sacrificing product behavior.

Filenames are labels, not measurements: `editor-4mb.js` does not establish a 4 MB transfer, and `hero-5000px.jpg` does not establish actual pixel dimensions. Verify bytes, intrinsic dimensions, visibility and dependencies before stating them as facts or removing an apparently unused asset.

Use [Resource delivery](references/resource-delivery.md) for images, fonts, bundles and caching. Begin with the shared [measurement contract](../performance-engineering/references/measurement.md).

## Prioritize

- Identify the actual LCP element and its discovery/request/render delay. Do not lazy-load a likely above-fold LCP image; reserve its geometry and choose appropriate dimensions and responsive sources.
- Preload or preconnect only when measured late discovery or connection cost justifies it. Excess high-priority resources compete with the resource you need most.
- Optimize image dimensions, format and visual quality together. Transparent PNG is sometimes appropriate; AVIF is not automatically the best choice for every asset or decode workload.
- Reduce blocking CSS and unused styles while preserving first-paint appearance and CSP. Avoid fragile inline event-handler loading hacks when the framework or stylesheet structure can express the intent.
- Split heavy optional features where it improves the current journey. Do not make every route eager or split a frequent tiny dependency into a new waterfall. Inspect actual emitted bundles and dependency side effects before changing import style.
- Bound critical fonts, use suitable fallbacks and reserved metrics, and choose swap/optional based on product needs. Avoid invisible text and unnecessary font preloads.
- Use versioned immutable caching for content-hashed public assets; choose HTML/API caching from actual privacy and freshness requirements. Validate compression and headers at the serving layer.
- Defer third-party work or use accessible facades where it preserves consent and function. Do not silently remove required analytics, validation, or accessibility behavior to improve a score.

## Verify

Repeat equivalent cold and warm navigations. Check transferred bytes, critical-path timing, LCP, layout shifts, font fallback, cache headers and functional delivery. Keep source estimates separate from actual compressed transfer and main-thread execution cost. Feature-detect speculative navigation; evaluate wasted bytes and side effects before enabling prerendering.

Read [Loading recipes](references/loading-recipes.md) for hero/offscreen images, optional modules and compression, and [HTTP caching](references/http-caching.md) for validators and scoped revalidation.
