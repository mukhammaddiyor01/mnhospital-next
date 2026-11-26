# MN Hospital development rules

Before work, read this file, `README.md`, `SKILLS.md`, `docs/ai/NEXT_STEPS.md`, `docs/ai/DECISIONS.md`, and the feature's relevant product documents. Check branch, remote, status, and the nearest existing implementation. Follow the nearest nested `AGENTS.md` as well. Preserve user changes.

Keep the backend authoritative for identity, role, patient ownership, prices, appointment availability, payments, and persistence. Never log patient or staff data, credentials, GraphQL variables, or clinical details. Native secrets belong in SecureStore; only public API URLs may use `EXPO_PUBLIC_` in mobile code. Never copy browser cookies or `sessionStorage` flows into native code.

Web uses Next.js Pages Router and SCSS. Mobile uses Expo Router and React Native primitives. Share only pure platform-independent code in `packages/`. Keep screens as views, hooks as controllers/view-models, and validated types and pure rules as models. Separate network/storage adapters from both views and pure rules. Do not add a dependency or abstraction before a feature needs it. Use the library decision table in `docs/ai/ARCHITECTURE.md`.

Commit one coherent change at a time. The subject must start exactly `feat: ` or `fix: `, with no scope in parentheses and no other prefix. Stage only intended files. Update the related docs in the same commit and record actual checks in `docs/ai/TESTING.md`; update `COMPLETED_TASKS.md`, `HISTORY.md`, and `NEXT_STEPS.md` when handing off. Do not deploy, change private environments or application data, or run destructive migrations without explicit authorization.
