# HTTP revalidation and cache recipes

Choose storage and freshness separately. Preserve the existing serving/CDN layer and privacy contract. A `304` avoids retransmitting an unchanged body; it can still incur authentication, request and validation cost.

| Representation | Candidate policy | Conditions |
|---|---|---|
| Public content-hashed JS/CSS/images | `public, max-age=31536000, immutable` | URL changes when content changes; old assets remain available for deployed HTML |
| Public HTML needing current content | `no-cache` plus a validator | Storage is acceptable; validate before reuse |
| Personalized response where private storage is allowed | `private, no-cache` plus a correctly scoped validator | Authenticate/authorize before validation; freshness and logout behavior are explicit |
| Sensitive response that must not be stored | `private, no-store` | Chosen privacy requirement; do not weaken it to improve a score |

`no-cache` permits storage but requires validation. `no-store` forbids HTTP-cache storage. Browser history snapshots are a separate mechanism; follow [restore handling](../../progressive-page-rendering/references/history-restoration.md).

## Conditional GET

1. A successful response provides an `ETag` identifying the actual representation and, where reliable, `Last-Modified` from its real modification time.
2. The browser can send `If-None-Match` with the ETag when revalidating.
3. After authorization/scope and representation selection, return bodyless `304 Not Modified` if the validator matches, with relevant cache metadata. Otherwise return `200` and the current representation/validators.
4. If both request validators are present, `If-None-Match` takes precedence over `If-Modified-Since`.

Never derive a personalized validator solely from a global revision if unequal viewers can receive different bodies. Scope the representation, not just its expiry. `Vary` must reflect relevant request-header negotiation, such as content encoding. `private` restricts shared caches; it is not an authorization check. Do not declare every Cookie-varying page publicly cacheable.

## Test matrix

- First request: `200`, expected body and policy.
- Unchanged revalidation: `304`, no body, correct validators/cache metadata.
- Changed representation: `200`, changed validator and body.
- Different tenant/viewer or revoked permission: authorize anew, never disclose another scope through the body or an incorrect validation result.
- Mutation, logout, account switch, CDN purge and old asset URLs: the intended invalidation/freshness behavior persists.

For writes, `If-Match` is a different precondition; use [the mutation contract](../../data-performance/references/mutation-protocol.md). Test cache hit ratio and saved transfer alongside latency, correctness and origin cost. Do not infer a speed percentage from the header configuration.

Source: [MDN HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching), [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag).
