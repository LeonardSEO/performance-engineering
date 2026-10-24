---
name: doherty-threshold
description: "Improve perceived responsiveness of taps, clicks, typing and asynchronous actions with immediate feedback, safe optimistic changes, honest save/error states, and meaningful progress. Use when controls seem unresponsive; request scheduling and skeleton layout have separate domain owners."
---
# Doherty Threshold

Keep the user's action connected to a visible response. The approximately 400 ms Doherty figure is a design heuristic, not a universal scientific cliff, API deadline, or Core Web Vitals threshold.

## Five rules

1. **Respond to every tap immediately.** Aim for the next paint and about 100 ms or less for acknowledgment, including keyboard activation. Do not delay a focus indicator.
2. **Show the change now; save in the background when safe.** Reversible low-risk edits can be optimistic. Consequential or server-validated outcomes stay pending until confirmed.
3. **Start slow work early.** Use the read-only, bounded prefetch and persistence rules in [Data performance](../data-performance/SKILL.md).
4. **Show the shape of missing content.** Use [Progressive page rendering](../progressive-page-rendering/SKILL.md) for skeleton layout and readiness; retain useful current data.
5. **Make long waits understandable.** Measurable work gets real progress; otherwise use clearly indeterminate or phase feedback. Never invent a percentage or report completion before success.

Distinguish acknowledgment, usable result, persisted completion and optional motion duration. A transition can start now while the actual work begins; never fetch only after its exit animation.

## Apply safely

Read [Feedback and recovery](references/feedback-and-recovery.md) for async controls. Update visible editing without debounce; debounce persistence only when useful. Expose pending/saved/not-saved states honestly. Roll back only the failed optimistic change or preserve an explicitly unsaved draft. Older failures must not undo newer intent, and server writes need ordering or version protection as well as response guards.

Delay an extra loader's onset roughly 150–250 ms for normally fast actions, and cancel its timer on completion or replacement. A known slow cold region may have an immediate skeleton. Never withhold available results or errors to satisfy a minimum spinner duration.

Keep motion small and interruptible, preserve focus and labels, and support reduced motion. [Rendering performance](../rendering-performance/SKILL.md) owns animation mechanics.

## Verify

Check fast and stalled requests, rejection/offline, repeated actions, out-of-order completion, unmount, cancel and retry. Measure acknowledgment separately from later network outcomes using [Measurement](../performance-engineering/references/measurement.md). A loader is feedback, not proof of real latency improvement.
