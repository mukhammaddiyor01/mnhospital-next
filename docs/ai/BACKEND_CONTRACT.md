# Backend contract

The API is a separate NestJS GraphQL repository. Current browser auth uses a bearer access JWT and role-scoped HttpOnly refresh cookies. A patient-only native HTTP contract and shared login limits exist on the separate backend branch `codex/native-patient-session` through `1e0e7af`, disabled by default; they are not deployed or connected to mobile. Do not claim mobile login works or reuse browser session modules. Verify role selection, CSRF/origin behavior, and ownership checks before connecting authentication. Request-body role and patient IDs are never authority. See `docs/AUTH_SESSIONS.md` and `docs/ROLE_SESSIONS.md` for browser behavior.

## Native session audit — 2026-11-26

Read-only review of backend GitHub `master`/`develop` at `ea1601a` and its matching local checkout:

| Operation | Observed contract | Native implication |
| --- | --- | --- |
| Patient/doctor/receptionist/admin login | Each login uses `SessionLoginInterceptor`, returns an access token on the profile, and writes the refresh secret to a role-specific HttpOnly cookie. | The response does not provide a native refresh credential. |
| `refreshSession` | GraphQL response has only `accessToken`. It reads the refresh secret from `Cookie`; a role-selected request also requires the prior bearer access token. It rotates the cookie. | SecureStore alone cannot implement refresh. A native cookie mechanism and its behavior would need separate design and device tests. |
| `logoutSession` | With a role selector, bearer token identifies the session; the matching refresh cookie is cleared. Without a selector, it revokes a cookie credential and optionally the bearer session. | Native logout can revoke by bearer, but durable session restoration remains unresolved. |
| Session request check | Requires `Apollo-Require-Preflight: true`; a supplied `Origin` must be on the configured allowlist. | Native clients must not spoof a browser origin. Server rules remain authoritative. |
| Session lifetime | Access token is 15 minutes; refresh is bound to a 15-minute idle window and a 30-day absolute session. Reuse of an old refresh secret revokes the session. | Rotation must be serialized and persisted atomically. |

Source locations: backend `auth.resolver.ts`, `session.interceptor.ts`, `session-cookie.ts`, `auth.service.ts`, and `session-cookie.spec.ts` under `apps/mnhospital-api/src/components/auth/`. This is a source-code contract audit; no running API or device session was exercised.

**Decision:** Keep mobile login disabled until a supported native session contract is implemented and tested in the backend. A future design should give native clients a separate login/refresh/logout flow whose refresh secret is returned over HTTPS after server credential verification, rotated with the existing session ownership/replay checks, and held in SecureStore. A route or header cannot prove that a caller is native. Do not change the browser cookie flow or expose refresh secrets through the current browser GraphQL operations. Verify account switch, expired access, logout, replay, app restart, and terminal/network failure behavior before wiring UI.

The patient-first route, payload, ownership rules, and remaining exit tests are specified in `NATIVE_SESSION_DESIGN.md`. Route separation is not proof of native app identity; the server still authenticates every request. Local mock HTTP/GraphQL tests and API build passed, but no real API/database, public ingress, or device flow was exercised.

## Public services — 2026-11-26

The existing web `GetServices` operation calls `getServices(input: ServicesInquiry!)`. Backend resolver uses `WithoutGuard`; the service forces `serviceStatus: ACTIVE` even if search includes another status. The mobile request sends `{ page, limit: 10, search: {} }` and selects only `_id`, `serviceTitle`, `serviceDesc`, and `metaCounter.total`. It uses no actor or patient ID, credential, mutation, price, or booking calculation. The API URL is the public `EXPO_PUBLIC_API_URL`. Empty, malformed, HTTP, and GraphQL failure states are handled without displaying raw server errors. Source: backend service resolver/service/DTO and existing web service query, all reviewed at the current commits. No running API response was observed in this change.

Mobile requires this public URL to use HTTPS without embedded credentials, query parameters, or fragments. Development against a local HTTP API needs an explicitly configured HTTPS proxy or a separate reviewed development-only exception; production does not silently downgrade transport.

## Public catalog — 2026-11-28

Mobile calls six anonymous operations at `https://mnhospital.uz/graphql`: `getServices`/`getService`, `getDoctors`/`getDoctor`, `getArticles`/`getArticle`. Lists send `{ page, limit: 10, search: {} }`. Resolvers use `WithoutGuard`; the server filters ACTIVE services, public doctors and PUBLISHED articles, and records no view without a member. Selected fields are in `apps/mobile/src/features/catalog/catalogApi.ts`. Uploaded images are served under `https://mnhospital.uz/backend/uploads/...`, so mobile needs `EXPO_PUBLIC_ASSET_URL=https://mnhospital.uz/backend`. This supersedes the narrower field selection in the 2026-11-26 section.

| Operations | Arguments | Role / owner source | Server-owned decisions | Error cases |
| --- | --- | --- | --- | --- |
| `getServices`, `getDoctors`, `getArticles` | `input`: `page`, `limit`, `search` | None; anonymous | Publication/status filter, order, total | Invalid input returns `BAD_REQUEST` in `errors` |
| `getService`, `getDoctor`, `getArticle` | `serviceId`, `doctorId`, `articleId` | None; anonymous | Whether the record is publicly visible | A missing or hidden record returns `INTERNAL_SERVER_ERROR` "No data is found!" |

On 2026-11-28 a live `getService` with an unknown ID and a `getServices` with `page: 0` both returned HTTP 200 with an `errors` array. Mobile maps every error to one generic unavailable state, so a deleted record is not distinguished from an outage.
