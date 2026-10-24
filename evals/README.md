# Bounded agent evaluations

These six static-review fixtures exercise domain choice, correctness, proportionality and honest evidence reporting. Each host runs a baseline and plugin arm with identical source/prompt and no explicit model override. They do not benchmark application speed or establish universal superiority.

Run only when explicitly authorized to use the locally authenticated CLIs:

```bash
npm run eval:agents
# Selective retry after resolving auth or an identified defect:
node scripts/evaluate-agents.mjs --hosts claude --cases react-native --rerun
```

The runner creates a fresh OS temporary fixture directory per arm, requests no writes, enables read-only/plan behavior, and writes raw logs to git-ignored `validation/private/agent-evals`. It runs two child sessions concurrently, with a three-minute limit per session. Model settings are not overridden; compare paired arms within the same host. Codex needs the actual plugin installed for its plugin arm; it is enabled via a process-local config override. Keep the real user configuration loaded so user-reviewed hook trust remains effective; do not use `--ignore-user-config` or bypass trust. Existing other host plugins/hooks remain available equally in the paired Codex arms and are a stated experimental limitation. Claude uses `--plugin-dir` for its plugin arm.

Expected review points are in cases.json and are not included in the agent prompts. A human/maintaining agent reviews the returned decisions against them; keyword presence alone does not establish correctness. The documentation-only case requires the exact corrected sentence and no audit.

Do not publish private transcripts, authentication failures, full user configuration, account identifiers or machine-specific paths. Publish a concise methodology/result table and sanitized response text only. The validation report distinguishes actual successful runs from auth failures, retries and unavailable host features. Permit at most one targeted behavioral repair/retest round for an identified content defect; an auth retry is not a changed behavior experiment.
