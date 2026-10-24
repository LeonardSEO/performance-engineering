# Performance Engineering

```bash
npx plugins add LeonardSEO/performance-engineering
```

Nine focused skills and lightweight advisory hooks for faster, more responsive applications. Works with **Codex** and **Claude Code**, with a framework-independent web/fullstack core and separate React/Next.js and React Native guidance.

[![Checks](https://github.com/LeonardSEO/performance-engineering/actions/workflows/checks.yml/badge.svg)](https://github.com/LeonardSEO/performance-engineering/actions/workflows/checks.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Measure the actual bottleneck, change the relevant behavior, preserve correctness, and compare equivalent results. Immediate feedback matters; so do authorization, cache isolation, failure recovery, and honest progress.

## Install

The universal command above detects supported agents. Install for one agent explicitly:

### Codex

```bash
npx plugins add LeonardSEO/performance-engineering --target codex
```

Native marketplace alternative:

```bash
codex plugin marketplace add LeonardSEO/performance-engineering
codex plugin add performance-engineering@performance-engineering
```

Restart or open a new session after installation. Open `/hooks` to review and trust the plugin's hook definitions. Codex skips untrusted hooks; installing the plugin does not grant trust. Skills remain useful without hooks. No trust-bypass flag is required or recommended.

### Claude Code

```bash
npx plugins add LeonardSEO/performance-engineering --target claude-code
```

Native marketplace alternative:

```bash
claude plugin marketplace add LeonardSEO/performance-engineering
claude plugin install performance-engineering@performance-engineering
```

Open a new session or use the host's reload flow. During development, load only this plugin for a session with `claude --plugin-dir ./plugins/performance-engineering`.

### Requirements

- Node.js **22 or later** on the agent's execution PATH for the hook scripts.
- A current Codex or Claude Code version with plugin and command-hook support. See [validation](docs/validation.md) for the versions actually tested.
- Existing application tooling for the measurement you want to perform. Browser profilers and native device tools are optional capabilities, not bundled services.

The native runtime intentionally has no root `plugin.json`: Codex 0.163.0 skips hooks for that portable format even when a compatibility overlay exists. `packaging/portable-plugin.json` is supplied separately for portable export; use the native package for the tested hook behavior.

The installed plugin has **zero runtime package dependencies** and no MCP server, API key, account, production telemetry, or background network service. The development YAML parser is not required by installed hooks.

## Skills

| Skill | Owns |
|---|---|
| **performance-engineering** | Triage, domain routing, baseline, comparable verification and evidence reporting |
| **data-performance** | Request graphs, scoped concurrency, prefetch, client caches, stale responses and persistence ordering |
| **backend-performance** | Endpoint latency, N+1, query plans, pagination, pools, server caches, CPU and memory |
| **progressive-page-rendering** | Early authorized shell, independently ready sections, skeleton geometry and complete-record boundaries |
| **asset-performance** | Images, fonts, CSS/JS bundles, critical resource loading, HTTP/CDN caching and third parties |
| **doherty-threshold** | Immediate feedback, optimistic interaction, save/error recovery and honest progress |
| **rendering-performance** | Main-thread work, DOM, layout/paint, virtualized lists, motion and reduced motion |
| **react-performance** | React DOM/Next.js streaming, hydration, request scope, render profiling and version-aware APIs |
| **react-native-performance** | Native startup, JS/UI frames, Hermes, memory, release/device evidence and bundling |

Start with the router for a broad problem, or invoke the relevant skill directly. Detailed references load only when needed; the plugin does not inject nine complete manuals into every turn.

### Examples

**Codex**

```text
Use $performance-engineering:performance-engineering to investigate why this dashboard is slow.
Establish what can be measured and preserve tenant isolation.
```

**Claude Code**

```text
/performance-engineering:performance-engineering
Investigate why this dashboard is slow and compare equivalent measurements.
```

Other useful requests:

- “Keep the page header and useful sections available while optional data loads.”
- “Make this toggle respond immediately, but preserve the final saved value if requests finish out of order.”
- “Find the actual LCP bottleneck; do not preload every resource.”
- “Profile this Next.js interaction before adding memoization.”
- “Investigate React Native startup and dropped frames using release-device evidence.”

## How the hooks help

The plugin uses a shared deterministic Node engine with separate host configurations:

| Event | Behavior |
|---|---|
| `SessionStart` | A short route guide plus root-package stack detection |
| `UserPromptSubmit` | Relevant English/Dutch performance intent routes to at most two skills |
| `PostToolUse` | Relevant structured file changes can introduce a newly relevant domain |

Hooks only advise. They do **not** block tools, continue a finished turn, run audits, execute project code, install packages, or perform network requests. They do not guarantee that an agent follows every suggestion.

Detection uses the nearest package manifest and bounded reads of explicitly affected files. A `.tsx` suffix alone is not a React Native signal. Unknown shell effects are not guessed. Instructions are deduplicated per host/session/project and restored after compaction.

Startup context is capped at 1,000 characters; targeted context at 3,000. Each hook has a two-second timeout and fails open. [Hook behavior and privacy](docs/hooks.md) describes coverage and limits.

Disable the advisory hook output while retaining skills:

```bash
PERFORMANCE_ENGINEERING_HOOKS=off codex
# or
PERFORMANCE_ENGINEERING_HOOKS=off claude
```

On PowerShell, set `$env:PERFORMANCE_ENGINEERING_HOOKS = "off"` before launching the agent. You can also use the host's hook/plugin controls.

## Actual speed and perceived responsiveness

The commonly cited **400 ms** Doherty figure is a heuristic, not a universal cutoff or API promise. The plugin separates acknowledgment, useful results, persisted completion, and motion duration.

It reduces real work where profiles justify it and makes unavoidable waiting understandable. It does not hide ready results behind a spinner floor, invent progress, suppress errors, or declare a payment successful before confirmation.

Static findings are hypotheses. Lab measurements are not field p75. Native device performance cannot be established from source review or a browser score. See the [measurement contract](plugins/performance-engineering/skills/performance-engineering/references/measurement.md).

## Update, disable and remove

For the universal installer, rerun the corresponding install command to refresh the checkout/install. Native marketplace installs use the host's own lifecycle:

```bash
# Codex
codex plugin marketplace upgrade performance-engineering
codex plugin add performance-engineering@performance-engineering
codex plugin remove performance-engineering@performance-engineering

# Claude Code
claude plugin update performance-engineering@performance-engineering
claude plugin disable performance-engineering@performance-engineering
claude plugin uninstall performance-engineering@performance-engineering
```

Codex also exposes plugin enable/disable controls in the app. A changed hook definition may require a new trust review. Universal-installer and native-marketplace registrations can differ; inspect the host's plugin list before removing a registration created by another installer.

## Development and validation

```bash
npm ci
npm run generate
npm run check
npm run bench:hooks
```

`plugin.meta.json` is the single source for identity/version metadata. Generation produces native compatibility manifests, a separate portable export manifest, host hook adapters, and both marketplace catalogs. The CI matrix runs Node 22 on Linux, macOS and Windows.

The [validation report](docs/validation.md) distinguishes deterministic tests, native loader/installation checks, agent behavior evaluations and unverified conditions. Agent evals use existing authenticated CLIs, run only when explicitly requested with `npm run eval:agents`, and are not part of normal hooks or CI. See [evaluation methodology](evals/README.md).

## License and acknowledgments

Published by **Leonard van Hemert**, free of charge under the [MIT license](LICENSE).

Built on public guidance from [Addy Osmani](https://github.com/addyosmani/web-quality-skills), [Vercel](https://github.com/vercel-labs/agent-skills), [Callstack](https://github.com/callstackincubator/agent-skills) and [Doherty Threshold](https://github.com/LeonardSEO/doherty-threshold). [Upstream licenses](licenses/) · [Pinned sources](docs/sources.lock.json).
