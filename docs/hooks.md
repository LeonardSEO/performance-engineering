# Hooks: execution, privacy and compatibility

The two host adapters invoke the same zero-dependency Node engine. The Codex compatibility manifest explicitly references `hooks/codex.json`; Claude's manifest references `hooks/claude.json`. The portable export manifest is separate from the native runtime root. There is no default `hooks/hooks.json`, so installer rewrites of that default file cannot silently switch the other adapter's plugin-root variable.

Codex uses `${PLUGIN_ROOT}` and Claude uses `${CLAUDE_PLUGIN_ROOT}` in its own configuration. The script resolves skill paths from its installed location. Both return event-specific `hookSpecificOutput.additionalContext` JSON on supported events; no deny/block/continue fields or nonzero policy exit codes are emitted.

## Observations

Session startup reads a bounded `package.json` to identify the root platform. When structured file paths are available, the nearest package is authoritative; a root Next.js app does not turn a nested native app into a DOM target. Native imports can also establish native scope. Manifests are parsed as data and no scripts are executed.

Prompt matching is deterministic English/Dutch pattern matching, not a semantic model. It can miss an unusual wording or broad shell rewrite. Skill descriptions and explicit invocation remain available. Documentation-only prompts do not automatically start a performance workflow.

For edits/patches, the engine reads explicit supported file fields and patch headers. For shell results it accepts explicit structured changed-file information only. It does not interpret arbitrary shell code as a reliable list of side effects. Relevant third-party MCP tools without an understood path schema are intentionally ignored.

Reads are bounded, remain within the real project path, and reject external symlink targets. Generated/dependency directories are ignored for domain routing. No directory-wide source crawl, network lookup, benchmark or project-code execution occurs in hooks.

## State

State is outside the project under `PLUGIN_DATA` or `CLAUDE_PLUGIN_DATA` when provided, otherwise under the operating system's temporary directory. A dedicated `hook-state-v1` subdirectory contains hashed host/session/project identities, known domain names and boolean flags only. Prompts, source text, full project paths and transcripts are not stored. Concurrent writes use an exclusive short-lived lock and atomic replacement; lock contention skips that advisory event rather than stalling work.

Session-start cleanup bounds retained state to 128 JSON records and a 24-hour lifetime. Clearing the OS temp directory or the plugin's dedicated state subdirectory only resets deduplication. No production analytics or outbound telemetry is added by this plugin. The installer and host can have their own separate telemetry policies.

Missing session identity, malformed/oversized payloads, inaccessible files/state and unknown events produce no advisory output. A user-controlled project cannot supply shell commands or executable hook configuration through package metadata.

## Lifecycle and overhead

Only SessionStart, UserPromptSubmit and PostToolUse are registered. Startup/compaction restores a compact route guide, not all skill text. Repeated domains are not reinjected until session restart or compaction. New domains can be suggested as the work changes.

The target is p95 below 100 ms on the stated test machine, including Node startup. The configured timeout is two seconds. This is a measured target, not a guarantee for every device, antivirus setup or remote executor.

Codex requires review/trust of non-managed hooks. No installer step in this repository writes trust receipts or passes a trust-bypass flag. Unsupported/untrusted hooks do not make skill content unavailable. Review the scripts before trusting; changed definitions can require renewed review.

References: [Codex hooks](https://learn.chatgpt.com/docs/hooks), [OpenAI packaging](https://developers.openai.com/plugins/build/plugins), [Claude hooks](https://code.claude.com/docs/en/hooks).

## Tested Codex format limitation

Codex 0.163.0 discovers skills from the portable Agent Plugins format but deliberately skips its hook loading in the runtime implementation. A compatibility overlay does not override that format gate. Therefore the tested native package has only `.codex-plugin/plugin.json` and `.claude-plugin/plugin.json`, with no root portable manifest. The separate generated `packaging/portable-plugin.json` supports explicit future export, but portable-hook operation is not claimed on this version. See the pinned [loader implementation](https://github.com/openai/codex/blob/rust-v0.163.0/codex-rs/core-plugins/src/loader.rs#L966).
