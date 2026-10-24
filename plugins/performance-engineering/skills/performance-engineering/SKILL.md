---
name: performance-engineering
description: "Diagnose or improve application performance using evidence, select the relevant data, backend, loading, asset, interaction, rendering, React, or React Native workflow, and verify comparable before/after results. Use for broad slowness, performance audits, budgets, or regressions; do not turn unrelated edits into audits."
---
# Performance Engineering

Improve the user journey that is actually slow. Begin with the symptom and the existing architecture, not a list of fashionable optimizations. Keep scope proportional: a local feedback change does not need a full audit.

## Route the work

| Evidence or symptom | Read next |
|---|---|
| Serial requests, stale results, cache misses | [Data performance](../data-performance/SKILL.md) |
| Endpoint latency, queries, pools, server CPU | [Backend performance](../backend-performance/SKILL.md) |
| Whole page blocked while a section loads | [Progressive page rendering](../progressive-page-rendering/SKILL.md) |
| Late LCP, heavy images/fonts/bundles | [Asset performance](../asset-performance/SKILL.md) |
| Input seems ignored, pending save, progress | [Doherty Threshold](../doherty-threshold/SKILL.md) |
| Main-thread stalls, layout/paint, motion | [Rendering performance](../rendering-performance/SKILL.md) |
| Confirmed React DOM / Next.js implementation | [React performance](../react-performance/SKILL.md) |
| Confirmed React Native / Expo implementation | [React Native performance](../react-native-performance/SKILL.md) |

Select the one or two domains most closely tied to the evidence, then expand only if diagnosis crosses a boundary. Inspect the affected workspace's installed versions. A TSX file alone does not establish which rendering platform is used.

## Working contract

1. Establish the target journey, device/network or server load, relevant metric, and existing budget. For a runnable surface, follow [Measurement](references/measurement.md) before an optimization.
2. Trace the dominant wait to requests, code, resources, or rendering. Separate measured causes from static hypotheses. Missing telemetry is unavailable, not a passing result.
3. Make the smallest relevant change. Preserve authorization, tenant scope, validation, cache correctness, and recovery. Do not add a vendor, telemetry pipeline, dependency, or framework migration merely for this workflow.
4. Repeat equivalent measurements and relevant correctness tests. Inspect variance. Remove speculative complexity that did not help; preserve independently justified correctness fixes while clearly distinguishing them from measured speed gains.
5. Report conditions, baseline/result, evidence type, behavior checks, and limits. Keep field verification pending until enough post-release data exists. Recommend a proportional regression guard for the metric that justified the work.

When the page or profiler cannot run, provide prioritized hypotheses and exact verification steps. Do not claim measured improvements, universal budgets, an automatic Lighthouse pass, or superiority from source inspection alone.
