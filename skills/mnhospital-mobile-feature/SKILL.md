---
name: mnhospital-mobile-feature
description: Add a readable Expo React Native feature with clear view, controller, model, and adapter boundaries.
---

1. Read `apps/mobile/AGENTS.md`, `docs/ai/ARCHITECTURE.md`, `DESIGN_PATTERNS.md`, `DESIGN_SYSTEM.md`, `SECURITY.md`, `TESTING.md`, and the nearest existing feature. Define the user action and its real API requirement.
2. Keep `app/<route>.tsx` as a route entry. Put `FeatureScreen.tsx` and small native components under `src/features/<feature>/`. Put orchestration in `useFeatureViewModel.ts`; put pure validation/formatting in `model.ts`; put API/storage calls in a named adapter. Add only the files the feature actually needs.
3. For server data, choose one caching owner. Use Apollo only when GraphQL normalized caching or subscriptions are needed; use TanStack Query only when simpler request caching is needed. Do not add both to the mobile app for the same data. Prefer Expo Router, SecureStore, and Expo SDK packages for navigation and device APIs. Install through `expo install` when Expo manages the version.
4. Render loading, empty, error, retry, and accessibility states where relevant. Keep user-facing text in the existing EN/KR/UZ strategy when that feature is localized. Do not invent clinical claims or test data as real patient data.
5. Test pure rules with meaningful cases, check the exact GraphQL contract and role ownership, run typecheck and native bundle export, then verify on device when available. Record what was and was not observed.
6. Update feature docs, `docs/ai/TESTING.md`, `COMPLETED_TASKS.md`, `NEXT_STEPS.md`, and `HISTORY.md`; commit one feature with `feat: description` or one correction with `fix: description`.
