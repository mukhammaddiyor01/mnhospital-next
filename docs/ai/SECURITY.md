# Security

Store mobile credentials only in Expo SecureStore. Never log tokens, passwords, patient/staff details, GraphQL variables, or raw server errors. Public API URL alone may be exposed through `EXPO_PUBLIC_`; private keys stay on the server or deployment storage. Notifications must use generic text without clinical details. Wipe owned private caches on account switch/logout. The historical credential finding and release restrictions remain documented in `docs/SECURITY_AUDIT.md`.

Do not add a mobile auth provider merely because SecureStore is installed. First verify whether the backend can rotate and revoke a native refresh credential without relying on browser HttpOnly cookie behavior. On terminal rejection, clear the correct account's credential and private cache; on temporary network failure, keep a retryable state without exposing the error body. Background notifications may identify an action generically but must not include diagnosis, treatment, report, or patient identity.

## Threats and required checks

| Threat | Boundary and check |
| --- | --- |
| Wrong account sees private data | Derive role/profile from verified session on server; scope service queries; clear client cache and reject late responses on identity switch. |
| Lost or copied device credential | Native refresh must rotate and revoke server-side; store it in SecureStore only; test logout, expiry, replay, and reinstall behavior. |
| Network disclosure | Require HTTPS for mobile API URLs outside an explicitly controlled development setup; never embed private credentials in the URL or `EXPO_PUBLIC_` variables. |
| Sensitive logs or notifications | Do not log tokens, GraphQL variables, raw error payloads, patient/staff/clinical details; use generic push text. |
| Duplicate booking or payment | Preserve server-owned idempotency, ownership, price, availability, and status transitions; client retries must not create a second effect. |
| Supply-chain or release drift | Review dependencies and lockfile, run secret/dependency scans and role smoke checks, verify the deployed commit and rollback path. |

Review these against the actual backend and deployment; a UI check alone cannot prove them. Privacy data handling is recorded in `PRIVACY.md`.
