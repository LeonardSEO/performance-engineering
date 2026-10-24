# Validation report — 0.1.0

Validation date: 2026-10-24. This report separates packaging, hook execution and static agent reviews from application performance. No application speed gain or universal superiority over the source skills is claimed.

## Packaging and deterministic checks

- Nine skills, their frontmatter/UI metadata, 36 internal Markdown references, source hashes, license copies, marketplace identities and synchronized versions pass `npm run check`.
- Fifteen deterministic tests cover both host adapters, English/Dutch intent, complete evaluation payloads, irrelevant documentation, deduplication, compaction, patch/edit/structured shell results, nearest-workspace detection, React Native precedence, ambiguous TSX, malformed/oversized input, external symlinks, state containment, concurrency, retention and opt-out.
- Node 22 CI passes on Linux, macOS and Windows. The [three-OS run for the final runtime/test code](https://github.com/LeonardSEO/performance-engineering/actions/runs/40131201951) includes all 15 tests. A Windows-only path-separator assertion was corrected; production routing did not require a platform-specific change.
- Claude's native plugin and marketplace validators pass. Codex's native loader discovers all nine skills. The development dependency audit reports zero vulnerabilities; installed hooks have no package dependencies.

## Installation and native hosts

Tested CLIs: **Codex 0.163.0**, **Claude Code 2.1.303**, **plugins 1.3.5**. Development/integration execution used Node **26.8.1**; the cross-platform test matrix used Node **22**.

The isolated installer tests exercise the universal auto-detection route and each explicit target against the GitHub repository. Every expected installed cache contains nine skills and the correct host adapter with three events. These inspect actual installed files rather than counting CLI discovery messages. See [installer results](../validation/installer-results.json). They isolate the Node installer's home lookup and Claude's registration directory without changing the user's HOME or CODEX_HOME.

Both native hosts receive SessionStart guidance and relevant prompt guidance. Codex hooks were reviewed and trusted through its normal `/hooks` interface with user authorization; no receipts were fabricated and no bypass was used. Claude debug output confirms validated event-specific context. Both hosts also created a CSS file in a fresh scratch project and reported the new **rendering-performance** suggestion after the write. See [native smoke results](../validation/native-host-results.json).

Reproduce the bounded post-write test with authenticated CLIs after installing/reviewing the Codex plugin:

```bash
node scripts/smoke-native-hosts.mjs
```

This explicit development test runs agents and permits a single scratch-file write; it is never called by the plugin hooks or ordinary CI. Fixture replay covers compaction; native compaction itself was not separately exercised. Native host execution was tested on macOS; Windows/Linux CI validates scripts, not those hosts' interactive runtimes.

### Compatibility findings

Codex 0.163.0 skips hooks when its selected runtime manifest is portable `plugin.json`. A compatibility overlay does not override this gate. The tested package therefore uses native `.codex-plugin` and `.claude-plugin` manifests, with a separate portable export manifest. Portable-format hook execution is not claimed on this Codex version. See [the pinned implementation and explanation](hooks.md#tested-codex-format-limitation).

`--ignore-user-config` also excludes the user's hook trust in a Codex evaluation process. Early diagnostic runs using that flag could not establish trusted hook execution. The corrected runner retains real user configuration in both arms and toggles only this plugin; the final comparisons use that runner. Arbitrary shell side effects are intentionally not inferred as file changes; a shell-redirection probe stayed silent, whereas a real `apply_patch` write produced guidance.

## Hook overhead and privacy

A 45-sample local macOS benchmark, including a fresh Node process per invocation, measured **66.14 ms median**, **74.99 ms p95**, and **93.96 ms maximum**. This meets the stated sub-100 ms p95 target on that machine. See [raw benchmark summary](../validation/hook-benchmark.json). Host scheduling and transport add overhead; native-host log durations are not interchangeable with this process benchmark or a guarantee for other machines.

Tests confirm bounded context (1,000 characters at startup; 3,000 for targeted suggestions), at most two suggested domains, silence for irrelevant prompt/edit events, fail-open behavior, and bounded deduplication metadata outside the project. Hooks perform no network requests, package installs, benchmarks or project-code execution. The native smoke agent's requested CSS write is distinct from hook behavior.

## Agent behavior evaluation

Six fixed scenarios run in each host with a baseline and plugin arm: **24 final paired static reviews**. The same fixture and prompt are used within each pair. Each arm uses a fresh temporary project. Cases and expected review points are in [the evaluation suite](../evals/cases.json); expected answers are not included in prompts. The [24 sanitized final responses](../validation/agent-results.json) are published with fixture hashes and reported model metadata. Review assesses domain selection, correctness, proportionality, error handling and evidence claims; it is qualitative, not a keyword-derived score.

Earlier work comprised 24 initial runs and 12 targeted plugin retries. Packaging, trust exclusion and an appended harness instruction that confused documentation detection made those insufficient as final hook evidence. After correcting the harness and its regression test, all 24 paired arms were repeated under the final conditions. **Total completed review sessions: 60**. Earlier runs remain diagnostic history, not additional independent samples supporting effectiveness. No further content-optimization round was performed after the final comparison.

Models use each host's existing default settings without an explicit model override. Claude reports `claude-opus-5-5`; the Codex JSON stream does not establish the exact model identity. User-level skill directories are disabled for the Codex child processes in both arms, but system instructions, existing plugins and other host customizations can remain. The comparison is therefore locally paired, not a pristine or blinded model experiment. It cannot establish a causal effect size or superiority across agents.

### Reviewed outcomes

| Scenario | Codex plugin arm | Claude plugin arm | Paired baseline context |
|---|---|---|---|
| Web resources and progressive loading | Identifies shared waiting, shell replacement and blocking-resource candidates; does not infer bytes from filenames | Adds explicit filename/measurement caution and conditional loading changes; some layout statements remain too definite | Both baselines identify the core loading issues; Claude baseline makes unsupported numeric filename inferences |
| Data/backend | Preserves authorization before scoped concurrency; identifies shared cache disclosure and bounded tenant-safe batching | Identifies the same isolation and N+1 hazards, with trace and two-tenant checks | Both baselines already identify the principal correctness issues |
| Optimistic writes | Separates response guards from atomic server-write ordering and ambiguous failures | Identifies core races and HTTP failures; protocol sketch needs review (below) | Both baselines already distinguish UI and persistence ordering |
| React/Next.js | Uses supplied versions, request-local identity and useful streaming boundaries | Identifies shared-user leakage and request/loading/cache boundaries | Both baselines identify the shared-state hazard; no unique causal improvement established |
| React Native | Requests release-device/thread evidence; recognizes eager computation remains after list virtualization | Requests device/thread evidence and version-appropriate list candidates; calls one unmeasured candidate “most likely” | Both baselines already request native profiling; no FPS/startup gains established |
| Unrelated documentation | Exact corrected sentence, no audit | Exact corrected sentence, no audit | Both baseline arms also return the exact sentence |

The reviewed plugin arms identify the critical tenant-isolation and cross-request identity hazards. No application changes were executed by these static reviews. **Residual model-output warnings remain:** Claude's optimistic response describes the fixture's POST as PUT and offers a client-sequence alternative without defining session/restart or multi-writer scope. That sketch is not a production protocol: use the skills' existing server conflict/version contract and validate ambiguous failures. Claude also overstates some layout consequences and the likelihood of an unmeasured native bottleneck. These are recorded limitations, not passing assertions or advice to implement unchecked. Several responses exceed the requested 250-word limit.

This release does not claim perfect instruction following. The shipped guidance itself preserves scoped/versioned persistence and measurement limits; generated recommendations still require code and protocol review. No second content-repair loop was used to chase a favorable model sample.

### Scope and limits

The six cases cover web resources/progressive loading, tenant-sensitive data/backend work, optimistic races, Next.js request/loading boundaries, React Native diagnosis, and an irrelevant spelling task. Static source can reveal a scheduling or isolation hazard; it cannot establish transfer bytes, production latency, FPS, startup time, field p75, hydration cost or a benchmark improvement.

Read the published responses alongside the fixture and review notes. Baseline agents already identify many important problems. An accurate answer does not prove that every available skill was read or that every suggestion will be followed. Pattern routing can miss unusual wording or choose a secondary domain when a prompt includes substantial code. Unknown tool payloads deliberately produce no guessed advice.

## Reproduction

```bash
npm ci
npm run generate
npm run check
npm run bench:hooks
node scripts/smoke-installers.mjs LeonardSEO/performance-engineering
# Explicitly authenticated agent runs; not ordinary CI:
npm run eval:agents
```

Raw local transcripts, host debug logs, authentication details and private source paths are excluded from the public repository. Installation in official plugin stores, live application benchmarking and physical-device native profiling are outside this release.
