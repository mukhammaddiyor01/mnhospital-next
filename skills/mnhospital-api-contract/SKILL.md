---
name: mnhospital-api-contract
description: Verify a backend GraphQL contract and authorization before connecting private mobile or web flows.
---

1. Read `docs/ai/BACKEND_CONTRACT.md`, `BUSINESS_LOGIC.md`, `SECURITY.md`, the existing frontend operation, and the actual backend resolver, service, DTO, guard, and tests for the feature.
2. Record the operation name, arguments, response shape, authenticated role, owner source, error cases, and server-owned decisions. A client-supplied role or patient ID is never proof of authority.
3. For login and refresh, inspect the live backend contract before implementing native token storage. Browser HttpOnly cookie and tab rules are browser-specific; define how native refresh, logout, rotation, and account switch work with backend changes and tests.
4. For booking and payment, keep availability, price, currency, reservation, and final status on the server. For medical data, verify owner-scoped reads and cache removal on identity change. Notification text stays generic.
5. Update `docs/ai/BACKEND_CONTRACT.md` with evidence and unresolved questions. Add adapter code only after the contract is verified. Record automated checks and any missing live-device check separately.
