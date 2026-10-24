# Evidence and comparable measurement

Use this shared contract across the plugin. Scale verification to the change and distinguish investigation from production modification.

## Baseline

Record the exact route/interaction or endpoint, dataset and scope, browser/runtime/tool versions, device/build, network/CPU constraints, cold/warm cache, authentication/consent/experiment state, and the product's existing budget. Choose a primary outcome: useful content, input feedback, p95 API latency, startup, frame time, or retained memory. Include errors/throughput where relevant.

| Evidence | Valid inference | Limit |
|---|---|---|
| Field RUM/CrUX | Actual sampled user experience and segments | Aggregation/windows differ; delayed verification |
| Browser trace | One interaction/navigation's network and rendering cause | Local/emulated conditions |
| Repeated synthetic run | Reproducible lab comparison and variance | Not field p75 or native device performance |
| Request/DB/native profile | Time distribution in the tested workload | Workload/build/device-specific |
| Source inspection | A hypothesis and a proposed verification | No measured regression or improvement |

For a headline lab comparison, run at least three equivalent trials and report median plus range; increase samples when variance can change the decision. Do not compare a cold baseline with a warm after-run. Keep field segments, sampling and observation windows comparable. Missing data does not mean passing.

## Web

Use available trace tooling for loading, network, interaction, style/layout and paint. Inspect the current tool's actual capabilities: one MCP's Lighthouse method may exclude performance while the Lighthouse CLI includes it. Do not hard-code a nonexistent tool name or make a new MCP/API key a prerequisite.

LCP (good at most 2.5 s), INP (at most 200 ms), and CLS (at most 0.1) are assessed at field p75 under the applicable Core Web Vitals methodology. INP measures next-paint responsiveness, not all later network-dependent results. TBT is a lab blocking diagnostic, not measured field INP. The roughly 100 ms feedback goal and 400 ms Doherty heuristic describe other concerns.

Record action-to-acknowledgment, useful-result latency, and server-confirmed completion separately. A skeleton improves continuity but does not prove earlier useful content. Inspect layout-shift attribution when placeholders, images or fonts change.

If tools are missing, use the project's existing browser/profiler or a compatible local CLI if already available. For public pages, a hosted performance report can help if access and disclosure are appropriate. For private/local apps, provide a reproducible local workflow rather than sending data to a new service.

## Backend and native

For server work, separate queue/pool wait, query execution, external calls, CPU and serialization. Compare p50/p95/tails with error rate, throughput and concurrency on equivalent data/cache state.

For native work, record platform, physical device/simulator, refresh rate, release/debug build, architecture/runtime, startup class and target interaction. Keep JS and UI thread evidence separate. Warm starts are valid measurements when that is the journey; do not mix them into a cold-start claim.

## Decide and guard

Attribute the change to the diagnosed bottleneck and compare against run-to-run variance. Keep a justified improvement with correctness intact; remove speculative complexity with no demonstrable benefit. A correctness fix can be retained on its own merits without being called a speed gain. Never automatically revert unrelated user changes.

Record unsuccessful attempts briefly where useful, without creating an unsolicited permanent ledger in every project. Use an existing performance log, PR description or report. Recommend a targeted synthetic budget or field monitor; do not add production telemetry or CI vendor integration without scope/authorization.

| Signal and scope | Conditions | Baseline | Result | Evidence/limitation |
|---|---|---|---|---|
| Primary user journey | Stated profile | Measured value | Measured value or pending | Tool/run reference |

Deliver measured findings, supported causes, static hypotheses, changes, correctness checks and unresolved limits separately. Field confirmation remains pending after a fresh deployment until sufficient new samples exist.

References: [Web Vitals](https://web.dev/articles/vitals), [INP](https://web.dev/articles/inp), [React Native performance](https://reactnative.dev/docs/performance).
