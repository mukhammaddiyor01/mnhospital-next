# Backend contract

The API is a separate NestJS GraphQL repository. Current browser auth uses a bearer access JWT and role-scoped HttpOnly refresh cookies. Native refresh and logout behavior is **unverified**; do not claim mobile login works or reuse browser session modules. Verify the API's supported native contract, role selection, CSRF/origin behavior, and ownership checks before connecting authentication. Request-body role and patient IDs are never authority. See `docs/AUTH_SESSIONS.md` and `docs/ROLE_SESSIONS.md` for browser behavior.
