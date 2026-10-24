# Loading recipes

Choose the recipe from actual visibility and dependencies. Examples are patterns to adapt to the project's existing pipeline, not assumed files or measured savings.

## Visible hero versus offscreen media

A likely LCP image should be discovered in initial HTML and should not be lazy-loaded:

```html
<img src="/hero-800.webp"
     srcset="/hero-800.webp 800w, /hero-1600.webp 1600w"
     sizes="(max-width: 800px) 100vw, 800px"
     width="1600" height="900" fetchpriority="high"
     alt="Describe the actual image">
```

The `sizes` value describes the rendered slot, not the source file. Match CSS, container width and device pixel density. Reserve the real aspect ratio. Keep the fallback source useful; use `<picture>` for art direction or format alternatives only when the pipeline actually emits them. AVIF/WebP choices need visual-quality and decode-cost checks, not only a byte comparison.

For genuinely offscreen content, native lazy loading usually avoids another observer library:

```html
<img src="/detail-800.webp" loading="lazy" decoding="async"
     width="800" height="600" alt="Describe the detail">
<iframe src="https://the-existing-approved-embed.example/"
        loading="lazy" width="560" height="315" title="Descriptive title"></iframe>
```

The iframe URL is a schematic placeholder, not a new service recommendation. Preserve consent, sandbox/referrer settings and required functionality. Do not put an invisible critical image behind IntersectionObserver or force every resource to high priority. Verify requests and reserved geometry at narrow/wide viewports and device pixel ratios.

## Optional editor or chart

Reuse the existing lazy-module mechanism. A plain client module can share an in-flight import and permit retry:

```js
let editorModule;
function loadEditor() {
  return editorModule ??= import('./editor.js').catch(error => {
    editorModule = undefined;
    throw error;
  });
}
// Call on actual open; prefetch on deliberate intent only if useful.
```

A failed import must yield a local error/recovery state. Clearing the application promise permits another attempt, but module evaluation failures can remain cached by the browser/bundler; offer an appropriate reload/recovery path after preserving drafts when retry cannot recover. Guard an async open against a closed/replaced view. Keep input/drafts recoverable. A request started by an unrelated hover can compete with critical resources; distinguish optional prefetch from required loading. Verify the editor's behavior, loading/error paths and emitted chunk waterfall.

## Compression and delivery

Use the existing build/CDN's Brotli or gzip for compressible responses. Verify the actual `Content-Encoding`, transferred bytes and `Vary: Accept-Encoding` behavior. Avoid recompressing already-compressed images, double-compression and strong ETags shared across unequal encoded representations. Preserve the host/CDN's supported validator handling.

For image optimization, inspect intrinsic dimensions, rendered slot, format, quality and metadata. Compare actual compressed transfer and visual output. A filename such as `hero-5000px.jpg` or `editor-4mb.js` proves neither dimensions nor bytes. Do not delete an asset because the supplied excerpt does not reference it.

## Verification

Use equivalent cold/warm navigations; inspect LCP element/discovery, transferred bytes, decode work and layout shifts. Delay or fail optional modules and media. Confirm no missing image, broken interaction, lost consent gate or editor content. A static review supplies candidates and a verification plan, not an achieved saving.

Sources: [native lazy loading](https://web.dev/articles/browser-level-image-lazy-loading), [responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images), [HTTP compression](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression).
