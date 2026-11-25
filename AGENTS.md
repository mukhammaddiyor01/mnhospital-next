# MN Hospital development rules

Read this file, `README.md`, `SKILLS.md`, the relevant `docs/ai/` files, and the nearest existing feature before editing. Check Git status and preserve user changes.

Keep the backend authoritative for identity, role, patient ownership, prices, appointment availability, payments, and persistence. Never log patient or staff data, credentials, GraphQL variables, or clinical details. Native secrets belong in SecureStore; only public API URLs may use `EXPO_PUBLIC_` in mobile code. Never copy browser cookies or `sessionStorage` flows into native code.

Web uses Next.js Pages Router and SCSS. Mobile uses Expo Router and React Native primitives. Share only pure platform-independent code in `packages/`. Keep screens as views, hooks as controllers/view-models, and validated types and pure rules as models. Do not add a dependency or abstraction before a feature needs it.

Commit one coherent change at a time with `feat: description` or `fix: description`. Update the related docs and record what was actually validated. Do not deploy, change private environments or application data, or run destructive migrations without explicit authorization.
