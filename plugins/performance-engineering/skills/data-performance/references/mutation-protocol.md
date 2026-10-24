# Concurrent writers and uncertain completion

Use the existing server conflict protocol. A monotonically increasing counter in one client does not order writes across tabs, devices, restarts or server workers. A client response guard protects UI publication, not persistence.

## Versioned absolute-value update

For a reversible preference, an example contract is:

1. An authorized GET returns the entity's value and a strong ETag/version.
2. A write sends the absolute desired value, `If-Match` for that version, and a stable idempotency identity for this logical operation where the API supports one. Preserve the API's actual method; do not describe a supplied POST as an existing PUT.
3. The server authenticates and authorizes the entity/scope, then atomically checks the current version, updates the value, advances the version and records the operation receipt. A stale precondition returns `412`; an absent required one can return `428`.
4. A duplicate operation returns its recorded result without applying the update again. Reusing its identity with a different payload/precondition is a conflict. Scope identities to the authorized actor/tenant/entity and logical operation, not a resettable client counter.

The version comparison, update and receipt need one durable transaction (or the datastore's equivalent), including concurrent server instances. A process-local Map is suitable only for a teaching fixture. Keep receipt retention and behavior after expiry explicit. Request abort or timeout is not proof of rollback.

## Two tabs and a restarted client

Both tabs read version 7. A's conditional write succeeds at version 8; B's write against 7 must fail. B reads the canonical value/version and applies the product's conflict policy. Do not automatically overwrite a different actor's newer value just because B can obtain version 8. Preserve B's draft and expose a proportional conflict/retry flow.

After a client restarts, it must obtain the server version. A local sequence starting at 1 is not a new authority or a new server epoch. The scope must be checked again after login/account switches.

## Response lost after commit

The server may commit and lose the response. Keep the operation's identity and payload for a permitted retry; consult/replay its recorded outcome or refetch and reconcile through the existing protocol. Retrying with a new identity and a freshly fetched version can accidentally apply a second logical operation. Idempotency alone also does not define ordering among different operations.

While uncertain, show a pending/unsaved state and preserve newer intent. “Saved” requires authoritative confirmation for the relevant intent. An old receipt or error must not overwrite a newer draft. Client-side serialization/coalescing reduces local conflicts, but cannot replace server checks or resolve another client's intent.

## Verify

Test simultaneous writers with the same version; a restart; a duplicate retry; identity reuse with another payload; response loss after commit; receipt expiry; tenant switch; and a newer edit while recovery runs. Verify stored value/revision as well as UI status. Classify exact source facts, missing backend guarantees and observed test outcomes separately.

Sources: [If-Match](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-Match), [conditional requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Conditional_requests).
