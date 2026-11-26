# MN Hospital web + mobile delivery order

This is the ordered handoff for the `mobile` branch. Existing backend rules and product documents remain the source of truth. Each step is one or more small `feat:`/`fix:` commits with its own evidence in `TESTING.md`; passing a build does not mean a live device or production flow passed.

| Order | Work | Exit gate |
| --- | --- | --- |
| 1 | Harden public mobile transport and catalog response handling. | Reject unsafe API configuration, keep errors generic, verify valid/invalid responses and mobile typecheck/bundle. No credentials or patient data enter this flow. **Done in code; live device/API check remains in step 2.** |
| 2 | Run the welcome and public services screens on a device or simulator with a reachable HTTPS API. | Check real catalog, pagination, empty/error/retry, accessibility, small and large screens; record device and API environment. If tools are unavailable, keep this gate open and continue independent work. |
| 3 | Design and implement a dedicated native session contract in the backend repository. Design is recorded in `NATIVE_SESSION_DESIGN.md`; backend implementation is open. | Login, rotation, logout, replay, expiry, account switch, and role/profile ownership tests pass; browser HttpOnly cookie flow retains its existing tests. No refresh secret is exposed by browser operations. |
| 4 | Connect mobile authentication using the verified native contract. | SecureStore holds only credentials; private caches clear on account change/logout; app restart, temporary failure, terminal rejection, and device tests pass. |
| 5 | Add patient features one vertical slice at a time: profile, bookings, payments, reports/messages. | For each slice, verify exact GraphQL fields and server ownership first; test failure and retry behavior, data minimization, and role boundaries. Staff flows follow their separate role contracts. |
| 6 | Move the existing web app to `apps/web` in an isolated structural commit. | Update Docker/CI/scripts/aliases/lockfile, preserve release behavior, and pass web build plus existing auth/booking checks. Do not combine this with clinical feature changes. |
| 7 | Release readiness. | Device/browser role smoke checks, HTTPS/session checks, notifications without clinical content, dependency and secret scans, privacy review, backup/rollback evidence, and deployment configuration checks are recorded. Production data and deployment require separate authorization. |

Keep `packages/` limited to platform-independent code with real consumers. Select a mobile cache/form library only when a concrete feature needs it; do not create a second source of truth for backend data. Reorder only when a dependency or verified risk requires it, and record that decision in `DECISIONS.md`.
