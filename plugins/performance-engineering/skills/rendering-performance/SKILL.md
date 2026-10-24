---
name: rendering-performance
description: "Diagnose web main-thread stalls, slow DOM updates, layout thrashing, paint cost, animation jank, large lists or retained memory. Use browser profiles to choose scoped fixes and accessible interruptible motion; React Native rendering uses its dedicated skill."
---
# Rendering Performance

Optimize the work that prevents the next useful frame. Use a trace of the target interaction to separate input delay, JavaScript execution, style/layout, paint and presentation. Do not treat every perceived pause as an animation problem.

## Main thread and DOM

- Inspect long tasks and expensive call stacks. `async` alone does not move CPU work off the main thread. Split or yield suitable work; use workers only when transferable computation and overhead justify them.
- Batch layout reads before writes and reduce unnecessary style invalidation. A small intentional layout change is not automatically a performance failure.
- For long lists, distinguish DOM reduction through virtualization from `content-visibility`, which skips some rendering work but retains DOM and has different accessibility/find-in-page behavior.
- Preserve stable item identity, keyboard navigation and scroll anchoring when virtualizing. Measure retained memory over repeated navigation, removing observers/listeners/timers that outlive their owner.

Read [Motion and rendering cost](references/motion-and-runtime.md) for animations or state choreography.

## Motion

Prefer CSS transitions/keyframes for simple state changes, WAAPI for imperative playback, and the project's existing library for gestures or shared-layout work. Do not mandate a library migration.

Prefer transform/opacity for frequent motion; filters, intrinsic-size/grid transitions, and snapshots can still have substantial rendering cost. Profile the affected surface. Avoid `transition: all` and permanent layer-promotion hints.

Honor reduced motion in CSS and JS; keep static state/status feedback. Interrupt or retarget motion on new intent rather than queuing it. Business state and focus recovery must not depend solely on an animation-end event. Opacity alone does not hide a focusable element from keyboard or assistive technology.

## Verify

Exercise keyboard/focus, reduced motion, cancellation, rapid reversals and supported feature fallbacks. Inspect dropped frames, paint regions, layout, memory and CPU under representative conditions. A 60 Hz frame is about 16.7 ms and a 120 Hz frame about 8.3 ms, shared by all rendering work; neither is wholly a JavaScript allowance. Follow [Measurement](../performance-engineering/references/measurement.md).
