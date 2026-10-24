# Runnable performance labs

These local reference applications demonstrate patterns in the skills. They contain intentionally poor baseline behavior and hand-authored improved variants. They are development fixtures, not production servers or evidence that an agent automatically achieves the same result on another application.

```bash
npm ci
npm run labs:assets
npx playwright install chromium
npm run bench:labs -- --assert-budgets
```

For manual inspection: `npm run labs:start`, then open the printed loopback URL. Choose `variant=baseline|improved` and `case=loading|assets|interaction` in the URL.

| Case | Same inputs | Measured outcome | Correctness guard |
|---|---|---|---|
| Loading | 100 ms primary, 650 ms optional synthetic response delays | Navigation to primary DOM update | Optional failure retains primary; both variants retain the shell |
| Images | Same generated artwork, same 800 px rendered slot | Encoded image response bytes | Real browser decodes both; dimensions/aspect ratio stay valid |
| Interaction | 120 synthetic 1 ms CPU work units | Double-frame acknowledgment proxy | Both variants complete all 120 units; completion is also recorded |
| HTTP caching | Same public representation | Conditional GET returns bodyless 304 | Only one body transfer |
| Concurrent writes | Two fixed synthetic identities and a versioned preference | Actual HTTP status and stored revision | Tabs, restart, missing/stale preconditions, lost reply and idempotent retry |
| History restore | Account scope changes in another tab | Actual `pageshow.persisted` and refreshed scope | Private region masked on pagehide and revalidated before being shown |

The benchmark interleaves variants over five fresh browser contexts each, reports median/range, and uses Chromium's full headless channel. Its headless-shell delegate disables bfcache; claiming restore coverage from that mode would be incorrect. Real history navigation uses `history.back()` and waits for the restored state rather than expecting a new load event.

The fixtures use no external service. The server binds to loopback and its fixed bearer identities are only teaching data. The in-memory mutation store demonstrates predicates and replay behavior within one process; production needs equivalent durable, atomic storage across instances and real authentication/authorization.

## Optional regression budgets

`labs/budgets.json` defines loose synthetic-fixture limits for primary-content timing, image response bytes and acknowledgment proxy. The separate **Optional browser performance labs** GitHub workflow runs these only when dispatched and uploads the result. Hooks never run it.

An optional [Lighthouse CI configuration](lighthouserc.cjs) provides LCP/CLS/TBT warning thresholds. With the lab server running, an explicitly chosen installer can execute:

```bash
npx --yes @lhci/cli@0.15.1 autorun --config=./labs/lighthouserc.cjs
```

It configures no remote report upload. Adapt thresholds to the actual product and target conditions. The custom DOM/double-frame metrics are not LCP or field INP. Transferred image bytes do not by themselves quantify page-speed improvement. Check the published validation report for the browser/runtime and exact observed results.
