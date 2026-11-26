# Native patient session design

Status: the separate backend branch `codex/native-patient-session` implements a gated patient-only HTTP adapter at commit `2768d2d`; the route is off unless `NATIVE_PATIENT_SESSION_ENABLED=true`. This is not deployed or connected to mobile. Mobile login stays disabled until the remaining backend and device gates below pass. The original source audit is in `BACKEND_CONTRACT.md`.

## Scope and authority

Start with **PATIENT** password login only. Reuse the existing patient credential verification, account status checks, `AuthService.startSession`, hashed refresh-session record, access JWT, refresh rotation, replay revocation, and logout logic. Do not create a second identity store. Doctor, receptionist, admin, signup, social login, and password-change flows need their own review before native support.

The server derives the patient ID, role, and session ID from verified credentials or its session record. A request role, patient ID, device ID, `Origin`, or client header is not authorization. Existing GraphQL patient resolvers continue to enforce their own role and ownership checks. The native app is a public client: an endpoint name or header cannot prove that a request came from the app.

## Proposed HTTP contract

The backend branch adds separate `POST /mobile/session/login`, `/refresh`, and `/logout` routes. It accepts JSON without query parameters, cookies, or browser Origin and responds with `Cache-Control: no-store`. Production HTTPS and proxy limits still need verification. Keep secrets out of logs, traces, analytics, and error bodies. The browser GraphQL login/refresh/logout response shapes and HttpOnly cookie behavior remain unchanged in source and focused tests.

| Route | Request | Success | Failure |
| --- | --- | --- | --- |
| `login` | Existing patient `LoginInput` fields, mapped through the same patient login service; no caller-supplied role or patient ID. | `accessToken`, `refreshToken`, `accessExpiresAt`, `refreshIdleExpiresAt`, `sessionExpiresAt`, and minimal verified patient identity. | One generic credential rejection; validation and throttling without account enumeration. |
| `refresh` | Current refresh credential plus the previous access JWT, even if expired. | New access and refresh credentials plus updated expiry values. The old refresh credential becomes unusable. | A terminal invalid/replayed/revoked response or a retryable service failure, distinguishable by status/code without leaking account details. |
| `logout` | Current access JWT and refresh credential; server binds both to the same session. | Idempotent success after revocation. | A generic response; client clears local credentials even if the network call fails. |

The backend must verify that the previous access JWT's signed session ID, owner, and role match the refresh-session record, ignoring only access expiry during refresh. The session record remains the authority for active/revoked/expired status. A missing previous access JWT requires login again. Do not accept a role selector as a substitute. Make refresh rotation atomic in the session store: two uses of the same credential cannot both succeed, and replay revokes the affected session. Preserve the current 15-minute access, 15-minute refresh idle, and 30-day absolute limits unless the backend team explicitly changes the policy and tests it.

The draft route rejects browser Origin and cookies; distributed rate limiting, a verified proxy request-size limit, and deployed HTTPS remain open release gates. These controls reduce browser misuse but are not proof of a native caller: non-browser clients can forge headers. Never grant a native route broader privileges than the existing patient login. The API must not return a refresh credential from any existing browser GraphQL operation.

## Mobile state and failure rules

After successful login, write the access and refresh credentials and session identity to Expo SecureStore before showing private screens. Keep clinical responses out of SecureStore. Serialize refresh requests per session; persist the new credential pair before dispatching requests with the new access token. If secure storage fails after server rotation, clear local auth and require login rather than retrying with the old refresh credential (which would trigger replay revocation). On app restart, restore only the stored identity and credentials, then refresh/verify with the server before showing private data.

On terminal rejection, logout, or account switch, hide private screens, invalidate private query caches, and ignore late responses from the previous identity. A temporary network failure keeps the stored session but shows a retryable signed-out/locked view without previous patient data. Logout attempts server revocation and always clears local credentials; if offline, record no claim of successful server revocation. A session can remain server-active until expiry if the request never reaches the API, so the UI must treat local logout as immediate and the backend should offer device-session revocation later.

Expo SecureStore uses Android Keystore-backed encrypted preferences and iOS Keychain. Android uninstall removes its key; iOS Keychain values may survive reinstall with the same bundle ID. Treat reinstall as an untrusted restoration: verify the server session before showing data and test both platforms. If custom Android backup rules are added, exclude SecureStore data. See [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).

## Required verification before enabling mobile login

1. Backend unit/integration tests with disposable test data: correct patient login; wrong password and disabled account; wrong role/profile; missing or mismatched previous JWT; expiry; atomic concurrent refresh; old-token replay revocation; logout and repeat logout; password-change revocation; request validation, throttling, no-store, and redacted errors/logs.
2. Browser regression tests: existing role cookies, `refreshSession`, `logoutSession`, CSRF/origin checks, and response shapes still pass. Browser GraphQL operations never return native refresh secrets.
3. Mobile adapter and device tests: SecureStore write/read/failure, app restart, simultaneous API 401s causing one refresh, account switch with late response, offline logout, terminal rejection, iOS reinstall and Android reinstall, HTTPS certificate behavior, and generic notification/preview text.
4. Record exact backend commit, test commands/results, API environment, device/OS, and unresolved failures in `TESTING.md`. A TypeScript check, bundle export, mock, or document review is not a live device test.

Refresh-token rotation and replay detection follow the security approach in [RFC 9700 section 4.14](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14). This is a design reference, not a claim that the current API implements an OAuth authorization server.
