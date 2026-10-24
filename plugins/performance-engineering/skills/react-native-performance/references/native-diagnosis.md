# Native diagnosis

## Startup

Define the relevant startup class and meaningful interactive milestone. Compare cold launches separately from warm/hot, iOS prewarming and background starts. A root useEffect running does not prove the screen is usable. Capture native process/init, JS bundle loading and first useful content/interaction through the app's existing supported markers.

Prefer representative release builds on physical devices. Simulator/debug traces can guide diagnosis but not prove release-device speed. Keep OS/device/refresh rate, app data, build/runtime and startup class constant across repeated measurements. When a toolchain/device is unavailable, provide exact measurement steps and call code findings hypotheses.

## Frames and lists

Measure JS and UI frames separately and capture the problematic gesture/scroll. Inspect expensive React commits and native rendering cost rather than using component depth/count as a proxy. A 120 Hz device has a tighter frame interval than 60 Hz; compare dropped-frame/frame-time distributions, not only average FPS.

Choose list windowing and a compatible existing list component for a measured large-list bottleneck. Verify the installed FlashList/FlatList/etc. API; a v1-only estimated-size recommendation is wrong for versions that removed it. Preserve stable keys, accessible navigation, recycling correctness and scroll position. Memoization/compiler or state-library changes require evidence of the specific render problem.

## Native threads and memory

Use React Native DevTools or existing profiling integrations when available, with Instruments on iOS or Android Studio/Perfetto on Android for native stalls. Tools such as agent-device or inspector are optional; use current supported commands and a manual/exported-profile fallback rather than installing them unasked.

A sync native method blocks its caller. Async native work can occupy a shared executor; move measured heavy CPU/I/O to suitable owned queues/coroutines and keep UI manipulation on the platform's required thread. Exact executor names and scheduling depend on architecture/version. Clean up owned work on module/instance teardown.

Inspect both retained JS and native allocations across repeated navigation, gestures and unmount. A single heap/RAM reading is not proof of a leak. Check subscriptions, timers, observers, native ownership and cancellation before proposing broad rewrites.

## Bundles and assets

Analyze emitted JS bundle and installed app size separately. Check actual package contributions, polyfill method coverage in the installed Hermes version, native assets and existing minifier/shrinker settings. Historical settings such as older Hermes compression advice are version-specific, not universal fixes.

Do not introduce remote executable chunks as an ordinary optimization. If the existing app uses them, preserve first-party origin, release-pinned integrity and platform release rules. Prefer a measured targeted fix over changing the bundler, architecture, state library or compiler.

References: [RN performance](https://reactnative.dev/docs/performance), [RN profiling](https://reactnative.dev/docs/profiling), [Optimizing FlatList](https://reactnative.dev/docs/optimizing-flatlist-configuration).
