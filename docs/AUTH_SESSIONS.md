# Browser authentication sessions

All four role sign-in flows keep the existing accessToken/userVar behavior and receive the same backend session mechanism. The refresh credential is a backend HttpOnly cookie; JavaScript never stores or reads it. Apollo and uploads use credentials included and `Apollo-Require-Preflight: true`.

The shared auth link renews a near-expired access token, shares simultaneous refresh attempts, and retries a GraphQL UNAUTHENTICATED guard response once. FORBIDDEN role/ownership responses do not refresh or log out a valid user. Ordinary network errors do not replay mutations. Network/temporary server failures retain local credentials so the user can retry; terminal refresh rejection clears the session and owned caches.

SessionBootstrap restores the server-owned session before staff layouts display their content. Public pages keep server rendering. A doctor, receptionist or admin uses the existing display aliases; saved EN/KR/UZ and theme preferences remain owned by role/profile. Apollo and React Query caches clear on identity switch/logout. Results from a previous login session are not allowed to repopulate private caches.

Web Locks serialize refresh/login/logout across tabs where supported; one pending refresh is shared per tab. Logout waits for an in-flight refresh and clears local credentials after server revocation. A failed logout keeps a retryable session and shows the existing interface language's error. WebSocket reconnects obtain a current access token and react to rotation/revocation.

Configure the backend allowed origins from AUTH_ALLOWED_ORIGINS or its existing CLIENT_URL. HTTPS deployments use Secure cookies; separate frontend/API sites require the backend SameSite=None option and exact allowed origins. Old JWTs without session IDs require one new sign-in after rollout.

Run `npm run test:auth` for the dependency-free Node verification harness using the project's TypeScript compiler and installed Apollo dependencies. It verifies refresh concurrency, transport, expiry, role aliases, identity invalidation, terminal/network failures, logout races, single auth retry, role denial and late private-response rejection. Backend cookie/rotation/ownership tests and the isolated Mongo verification are documented in the backend's docs/AUTH_SESSIONS.md.
