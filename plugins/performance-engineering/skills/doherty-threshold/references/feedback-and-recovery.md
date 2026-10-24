# Feedback and recovery

Acknowledge input on the triggering control, ideally by the next paint. A state update followed by synchronous heavy computation may still prevent paint. Start work without queueing it behind an animation and diagnose the blocking task separately.

## Safe optimistic interaction

Select reversible low-risk actions with clear reconciliation. Apply the desired local state immediately, then persist it with ordering/versioning from [Data performance](../../data-performance/SKILL.md). Success probability alone does not make payments, permissions or irreversible actions safe to declare complete.

Use honest `Saving`, `Saved`, and `Not saved` states where persistence matters. Keep typed content recoverable. An older failed request must not roll back a newer change; a whole-list snapshot rollback can erase unrelated edits. Reconcile authoritative values without replacing newer local drafts. Client response guards do not prevent older server writes; serialize conflicting writes or use the server's conflict protocol.

## Loader onset

For normally fast requests, schedule an additional local indicator around 150–250 ms after input; cancel if already settled, superseded or unmounted. If still pending, reveal it and provide clearer phase/status as the wait grows. Clear timers on both success and failure and prevent late callbacks resurrecting a loader.

Do not keep ready content behind a 200 ms spinner floor. If a decorative exit continues, it must not obscure the result or capture input. Shape and section readiness are owned by [Progressive page rendering](../../progressive-page-rendering/SKILL.md).

## Progress and cancellation

Use real completed units with a meaningful total. Uploading 100% can still leave server processing pending; change the phase rather than pretending the whole job succeeded. For unknown totals, use a labelled indeterminate bar or phase text, no invented percentage or unsupported ETA.

Prefer a labelled native `<progress>` where suitable: omit value for indeterminate work. A custom progressbar needs an accessible name and valid ranges/values; omit `aria-valuenow` for unknown progress. Announce significant milestones/completion/errors politely, not every percentage tick. Reduced motion can use static processing feedback.

Offer cancellation only with accurate semantics. Cancelling the wait may not cancel a server job; distinguish them. A background-job link or promised notification requires an actual supported durable job/delivery path, not merely a cosmetic button.

Test fast/stalled/failing flows, repeat activation, rapid toggles, navigation during pending work, cancel/retry, reduced motion and keyboard focus. Do not silently revert or display success on HTTP success alone if the response contains a domain failure.
