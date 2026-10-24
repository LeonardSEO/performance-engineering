# Motion and runtime

## Select motion from intent

Establish the action, reversibility, initiator, spatial source and information to communicate. Static state feedback is valid. Typical starting ranges are 80–120 ms for a press, 120–200 ms for a toggle, and 160–280 ms for a small panel. These are not waits to enforce. Frequent actions should not receive hero choreography.

Use meaningful anchored directions and brisk exits. Named project easing tokens improve consistency; linear is appropriate for continuous progress/rotation. Avoid error shakes, exaggerated bounce and unsolicited sound/haptics. Retarget or cancel on repeated input instead of creating a queue.

## Implementation

Use CSS transitions/keyframes for simple states; WAAPI for programmatic pause/reverse/cancel; an existing library for gestures or shared-layout orchestration. Feature-detect View Transitions, scroll timelines and intrinsic-size interpolation, with a usable immediate fallback. Verify browser support from current documentation for target versions.

Transform/opacity often allow compositing but are not universally free. Blur, backdrop effects and large layer surfaces consume resources. Intrinsic-size/grid transitions can require layout; `interpolate-size` does not promise GPU-only height animation. FLIP/layout libraries still need start/end measurements. Prefer a small measured layout change over distorted scaled text or incorrect hit areas.

Batch DOM measurements before writes. Do not repeatedly force layout in pointer handlers, animate `all`, or add permanent `will-change`/translateZ hints to every item. Continuous pointer/scroll values generally should not require full component rerenders each frame.

For large lists, measure DOM/paint and memory before virtualizing. Preserve item identity, focus, screen-reader navigation, search behavior, scroll anchoring and dynamic-height handling. `content-visibility` retains DOM and is not full virtualization.

## Access and lifecycle

Honor CSS and JS reduced-motion preferences, including changes during long active effects. Disable decorative movement/shimmer and preserve visible status or a static final state. Opacity-only hidden controls remain potentially focusable; use native hidden/closed/unmounted state or an appropriate inert strategy.

Exit snapshots must not duplicate focusable/accessible content or IDs. Preserve/return focus through the component's normal semantics. Ensure logical completion, cleanup and focus do not depend solely on transition/animation end: cancellation, reduced motion and feature fallbacks can skip it.

Cancel owned timers/listeners/observers/animation handles on replacement or unmount. Profile retained memory over repeated interactions. Avoid flashing; reduced motion does not by itself establish flash safety or WCAG compliance.
