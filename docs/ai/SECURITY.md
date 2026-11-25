# Security

Store mobile credentials only in Expo SecureStore. Never log tokens, passwords, patient/staff details, GraphQL variables, or raw server errors. Public API URL alone may be exposed through `EXPO_PUBLIC_`; private keys stay on the server or deployment storage. Notifications must use generic text without clinical details. Wipe owned private caches on account switch/logout. The historical credential finding and release restrictions remain documented in `docs/SECURITY_AUDIT.md`.
