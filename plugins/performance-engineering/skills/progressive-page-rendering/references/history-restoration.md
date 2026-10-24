# Back/forward cache and restoration

bfcache can restore a whole page and its JavaScript heap without a new HTTP request. It differs from the HTTP response cache. Re-running only a framework's initial mount is insufficient for restoration, and `no-cache` does not by itself force revalidation before a history snapshot is shown.

## Preserve readiness and scope

- Observe `pageshow`; `event.persisted` identifies a bfcache restoration. Check the current authenticated scope and freshness before enabling sensitive records/actions.
- For sensitive screens, use the application's existing lifecycle to mask/disable private content before a possible snapshot (`pagehide`) and during revalidation. Clear former-scope data on logout/account switch. Do not claim an async `pageshow` fetch alone prevents every stale frame or cross-tab privacy issue.
- Abort/supersede old pending requests and guards on scope/revision; reconcile fresh data without erasing recoverable current drafts. Update cart, permissions or inventory through authoritative checks before consequential actions.
- Preserve the privacy policy for HTTP storage. Do not remove `no-store` from sensitive pages just to pursue bfcache eligibility; eligibility and privacy behavior vary by browser/version.

Prefer supported `pagehide`/visibility/page lifecycle patterns to unconditional `unload` handlers. Do not add broad beforeunload prompts for every page or assume all browsers use the same blockers. Inspect DevTools' current bfcache diagnostics and actual restored navigation.

## Verification

Navigate A → B → Back using the real browser navigation. Record whether `pageshow.persisted` is true, whether requests were repeated and whether useful content/scope remain correct. Repeat with logout or scope change in another tab, expired data, an unsaved draft and a failed refresh. If the browser reloads instead, report that outcome; it does not prove bfcache restoration was exercised. Synthetic event dispatch tests a handler only.

Source: [web.dev bfcache](https://web.dev/articles/bfcache).
