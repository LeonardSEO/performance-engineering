# Readiness, skeletons and complete records

Separate shell readiness, authorized scope readiness, primary data, optional sections, and editable-record completeness. Avoid one global loading boolean that hides every section or falsely implies all data is available.

## State distinctions

| State | UI |
|---|---|
| Missing known-layout content | Neutral skeleton in reserved geometry |
| Missing unknown-layout content | Brief local loading status |
| Existing data refreshing | Keep useful data, show pending when needed |
| Confirmed empty result | Actual empty-state copy |
| Request failed | Visible local error and recovery |
| Access denied | Appropriate denied state, no privileged placeholder content |
| Incomplete editable record | Editor unavailable until required fields and access are ready |

Expose page chrome and search/navigation controls only where permitted and functional. Do not render a live save control against a half-record whose default values could overwrite unread fields. Failed optional sections must not hide independent primary results.

Use skeleton structure matching the final responsive grid/table/card dimensions. Reserve image ratios and avoid temporary zeroes or invented record counts. Hide decorative skeleton shapes from assistive technology, mark the affected region busy, and provide one useful status message. Clear busy state on failure too.

Static placeholders are enough. Subtle optional shimmer belongs to longer waits, runs on a translated overlay where appropriate, and is disabled for reduced motion. A skeleton is not a mandatory animation. Avoid redundant spinner-over-skeleton combinations.

Render known slow cold skeletons with the shell. Normally fast local actions can delay an additional loader using the Doherty policy. On arrival reveal useful content immediately; any decorative fade must not obscure it, intercept input, duplicate accessible content, or delay error recovery.

If chunk loading is measured as the blocker for a frequent route, prefetch or selectively load the route earlier while keeping heavyweight optional panels lazy. If data is the blocker, changing chunk imports may do nothing. Preserve scope prerequisites before parallelization.

Test direct URLs and cold navigation, cached navigation, delayed optional data, tenant switches, permission failure and retry. Confirm no false empty-state flash, no layout jump, no stale-scope leak and no incomplete-record save.
