---
name: react-native-performance
description: "Diagnose React Native or Expo startup, scrolling, frame drops, JS/UI-thread work, memory growth, Hermes and app/bundle size. Use installed-version-aware release-device measurements and native tools; exclude DOM/CSS web optimizations and speculative compiler or state-library migrations."
---
# React Native Performance

Confirm React Native/Expo, architecture, runtime, platform, library versions and device/build type. Diagnose the actual interaction; component count or tree depth alone is not evidence for a memoization fix.

## Choose evidence

- Separate cold, warm/hot, prewarmed and background launches. For cold-start comparisons, use consistent release builds and process state; define interactive completion as meaningful usable content, not merely a mount effect.
- Capture JS and UI frame behavior separately. JS stalls and native rendering stalls require different investigation. A debug build or emulator can guide diagnosis but cannot establish release-device speed.
- Use existing React Native DevTools/profiling tools, Instruments, Android Studio or Perfetto as available. Optional agent-device/inspector tools are not prerequisites; provide a manual/exported-profile path when unavailable.
- Profile retained JS and native memory across repeated navigation or gestures. Inspect listeners, subscriptions, timers, native ownership and cancellation.

Read [Native diagnosis](references/native-diagnosis.md) for startup, lists, native calls and bundling.

## Change only the bottleneck

Use a virtualized list for a proven large-list problem, with stable keys and version-appropriate library configuration. Do not suggest FlashList's v1-only props for v2. Profile renders before adding memoization, React Compiler, or a new state library.

Keep gesture/animation work on the appropriate existing runtime when supported; DOM, CSS, View Transitions and browser INP are not native substitutes. Sync native calls block their caller; async work can still saturate a shared executor, so use suitable owned background queues for measured heavy work and respect UI-thread requirements.

Inspect actual app and JS bundle composition before removing polyfills, changing Hermes settings, enabling code splitting or altering minification. Runtime coverage and release policy are version-sensitive. Do not propose a compiler, architecture or bundler migration as a routine performance fix.

## Verify

Follow [Measurement](../performance-engineering/references/measurement.md) with native-specific startup, frame and memory units. Re-run the same interaction on the same representative release/device configuration; compare errors and correctness too. State clearly when no device or native toolchain is available. Never claim FPS, startup gains or release readiness from source-only inspection.
