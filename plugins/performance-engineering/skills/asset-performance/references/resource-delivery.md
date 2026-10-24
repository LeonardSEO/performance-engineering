# Resource delivery

## Critical path

Use a trace to distinguish document latency, discovery, transfer, decode and rendering delay. Fix the dominant part rather than assuming transfer is always the cause. Establish resource budgets from product journeys and target conditions; preserve existing budgets rather than imposing universal byte limits.

For a known critical image, choose suitable intrinsic dimensions, responsive `srcset`/`sizes`, efficient formats and acceptable quality. Reserve width/height or aspect ratio. Avoid lazy loading the actual LCP resource. Use high priority for a proven critical asset, not every image. Below-fold lazy loading and async decoding can help when appropriate. Do not force synchronous image decoding everywhere.

Limit preloads to resources whose discovery is late and whose early transfer helps the trace. Match font cross-origin settings. Excess preconnects, preloads and duplicate format downloads waste connections and compete for bandwidth. Measure any Early Hints or speculation proposal under actual serving infrastructure.

## Fonts and CSS

Bound critical font families/weights and subsets without dropping needed glyphs. A variable font can replace multiple files but is not always smaller. Use a readable metrics-compatible fallback, `font-display` suited to the product, and avoid an invisible-text interval. Preserve fallback accessibility and layout at narrow breakpoints.

Remove or defer truly noncritical CSS using supported build/framework mechanisms and CSP-compatible behavior. Check resulting flash/layout shift before inlining or splitting. Do not blindly paste an `onload` stylesheet swap into a strict-CSP app.

## JavaScript and third parties

Analyze emitted compressed transfer, parsing/execution and route use. Confirm tree-shaking and side-effect declarations before attributing savings to direct imports. Split large optional editors/charts when their absence helps the critical journey; preload on real intent when worthwhile. Critical frequent features should not wait behind an avoidable new chunk waterfall.

Defer independent scripts appropriately, remembering module/defer/async ordering differs. Use accessible click-to-load facades for embeds where product requirements allow it. Keep consent, essential security checks and required reporting; do not optimize by silently deleting function.

## HTTP and CDN

Verify serving headers and compression on actual responses, not just source config. Hashed public assets can have long immutable caching; document and personalized API policies depend on freshness/privacy. `no-cache` permits storage but requires revalidation, whereas `no-store` forbids storage. Test tenant/auth variation and rollback behavior before widening shared caching. Compression helps text; recompressing already compressed media can waste CPU.

Check cold/warm cache separately, actual cache hits, transfer and decode, primary-image priority, font swap, and offline/error paths if a service worker already exists. Do not add a service worker as an unrequested universal caching fix.
