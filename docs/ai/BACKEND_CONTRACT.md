# Backend contract

The API is a separate NestJS GraphQL repository. Current browser auth uses a bearer access JWT and role-scoped HttpOnly refresh cookies. Native refresh is **not supported by a dedicated contract**; do not claim mobile login works or reuse browser session modules. Verify role selection, CSRF/origin behavior, and ownership checks before connecting authentication. Request-body role and patient IDs are never authority. See `docs/AUTH_SESSIONS.md` and `docs/ROLE_SESSIONS.md` for browser behavior.

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

**Decision:** Keep mobile login disabled until a supported native session contract is implemented and tested in the backend. A future design should give native clients a separate, explicitly identified login/refresh/logout flow whose refresh secret is returned only to the native client over HTTPS, rotated with the existing session ownership/replay checks, and held in SecureStore. Do not change the browser cookie flow or expose refresh secrets through the current browser GraphQL operations. Verify account switch, expired access, logout, replay, app restart, and terminal/network failure behavior before wiring UI.

## Public services — 2026-11-26

The existing web `GetServices` operation calls `getServices(input: ServicesInquiry!)`. Backend resolver uses `WithoutGuard`; the service forces `serviceStatus: ACTIVE` even if search includes another status. The mobile request sends `{ page, limit: 10, search: {} }` and selects only `_id`, `serviceTitle`, `serviceDesc`, and `metaCounter.total`. It uses no actor or patient ID, credential, mutation, price, or booking calculation. The API URL is the public `EXPO_PUBLIC_API_URL`. Empty, malformed, HTTP, and GraphQL failure states are handled without displaying raw server errors. Source: backend service resolver/service/DTO and existing web service query, all reviewed at the current commits. No running API response was observed in this change.
