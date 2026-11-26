---
name: mnhospital-monorepo-development
description: Develop MN Hospital web and Expo mobile with explicit platform and backend boundaries.
---

1. Read `AGENTS.md`, `README.md`, `SKILLS.md`, `docs/ai/NEXT_STEPS.md`, `docs/ai/DECISIONS.md`, relevant feature docs, and the nearest existing feature. Check branch, remote, and working changes.
2. Trace the existing GraphQL operation and backend role/ownership rules before adding a screen. Keep server authorization final.
3. Put pure types, rules, public design tokens, and transport interfaces in `packages/` only when used across platforms. Keep Next, DOM, SCSS, Expo, native storage, and routing in their apps.
4. Choose a library only for a concrete feature and use Expo-supported versions. Record why it is needed and what current code cannot do. Do not create empty package shells or duplicate state stores.
5. Implement a small vertical feature: model, API adapter, view-model hook, native or web view, and meaningful validation. Route files stay thin; views render state and send user actions to the controller.
6. Verify web build, mobile typecheck/bundle, and live device/browser behavior separately. Record observed checks in `docs/ai/TESTING.md`, completed work in `COMPLETED_TASKS.md`, and remaining work in `NEXT_STEPS.md`.
7. Stage explicit files and use only `feat: description` or `fix: description` commit subjects. Each commit must be independently understandable.
