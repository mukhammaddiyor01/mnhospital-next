# Browser authentication sessions

All four role sign-in flows keep the existing accessToken/userVar behavior and receive the same backend session mechanism. The refresh credential is a backend HttpOnly cookie; JavaScript never stores or reads it. Apollo and uploads use credentials included and `Apollo-Require-Preflight: true`.

The shared auth link renews a near-expired access token, shares simultaneous refresh attempts, and retries a GraphQL UNAUTHENTICATED guard response once. FORBIDDEN role/ownership responses do not refresh or log out a valid user. Ordinary network errors do not replay mutations. Network/temporary server failures retain local credentials so the user can retry; terminal refresh rejection clears the session and owned caches.

SessionBootstrap restores the tab session before staff layouts display their content. When its access JWT has more than 60 seconds remaining, bootstrap checks the existing guarded getMyPreferences query with the bearer token; server-side session/profile revocation remains authoritative and no refresh-cookie rotation is required. Near-expired or expired access uses the existing refresh rotation. A new tab with no access JWT can use a remembered role/session ID to refresh the matching HttpOnly cookie and accepts only a matching returned JWT. A bootstrap response belonging to an older token cannot restore, overwrite or clear a replacement account or undo logout. Public pages keep server rendering. A doctor, receptionist or admin uses the existing display aliases; saved EN/KR/UZ and theme preferences remain owned by role/profile. Apollo and React Query caches clear on identity switch/logout. Results from a previous login session are not allowed to repopulate private caches.

Web Locks serialize same-role refresh/login/logout across tabs where supported; one pending refresh is shared per tab. Logout waits for an in-flight refresh and clears local credentials after server revocation. A failed logout keeps a retryable session and shows the existing interface language's error. WebSocket reconnects obtain a current access token and react to rotation/revocation.

Configure the backend allowed origins from AUTH_ALLOWED_ORIGINS or its existing CLIENT_URL. HTTPS deployments use Secure cookies; separate frontend/API sites require the backend SameSite=None option and exact allowed origins. Old JWTs without session IDs require one new sign-in after rollout.

Run `npm run test:auth` for the dependency-free Node verification harness using the project's TypeScript compiler and installed Apollo dependencies. It verifies refresh concurrency, transport, expiry, role aliases, identity invalidation, terminal/network failures, logout races, single auth retry, role denial and late private-response rejection. Backend cookie/rotation/ownership tests and the isolated Mongo verification are documented in the backend's docs/AUTH_SESSIONS.md.

All four roles have an owned account editor, avatar upload/removal and a current/new/confirmation password form. Staff profile routes are /admin/profile, /doctor-workspace/profile and /receptionist-workspace/profile; the patient account editor is inside the existing My page profile. Password replacement runs under the browser session lock and applies the new access token; old sessions are revoked by the API. Account mutations carry the expected role/profile identity so a switched browser account cannot submit an earlier account’s draft. Labels are available in English, Uzbek and Korean.

## Parallel browser roles

Read [ROLE_SESSIONS.md](ROLE_SESSIONS.md). The browser keeps access JWTs in per-tab sessionStorage and selects separate HttpOnly refresh cookies for PATIENT, DOCTOR, RECEPTIONIST and ADMIN with X-MN-Session-Role. All four can stay logged in together in separate tabs; one active account per role per browser profile. A non-secret hint remembers the latest active role/session ID for new-tab restoration. Existing tabs bind refresh to their signed (possibly expired) access JWT; new tabs compare the returned identity with that hint. Logout leaves the current tab a guest, even if another role remains active elsewhere. Same-role replacement invalidates earlier tabs; other roles stay active. Stale-tab logout cannot clear or revoke a replacement account. Legacy API clients without the header retain the legacy cookie. Existing global localStorage credentials are intentionally not auto-restored; sign in again once after rollout.

Current local regression: 64 frontend auth checks, 163 backend auth tests and both application builds passed. The earlier isolated Mongo verification covered 248 checks. New-tab production verification remains required after deployment.

## Session and appointment lifecycle

| Event | Authentication | Appointment form |
|---|---|---|
| Reload the current tab | Validate usable access with the server; refresh only when needed | Starts empty |
| Navigate to another page | Keep the same session | Clear selected service, doctor, date, time and note |
| Successful logout | Revoke the matching server session, remove tab credentials and clear owned caches | Clear the previous account’s selection |
| Account/role replacement | Apply new identity; discard old account responses and caches | Clear old selection; an old URL does not restore the previous account draft |
| Temporary network/server failure | Keep credentials available for retry; API guards remain authoritative | Keep the current in-page form |
| Terminal server session rejection | Clear credentials and owned caches | Clear the previous account’s selection |

Appointment cleanup only touches `mn-appointment-draft-v1` and component state. It never removes the tab access token, calls logout, or modifies refresh cookies. The old shared appointment draft is no longer restored. Guest sign-in redirects back to an empty appointment form; an explicit new service-detail link can preselect that service without carrying an earlier time or note.

HTTP limitation: production refresh cookies remain Secure/HttpOnly. This change lets an unexpired, server-verified access token survive reload even when no usable refresh cookie is present. It does not make refresh cookies work over a public HTTP IP. When access expires (15-minute server lifetime), renewal requires a usable refresh cookie and therefore HTTPS in production; otherwise a new sign-in is necessary. Cookie security settings are unchanged.
