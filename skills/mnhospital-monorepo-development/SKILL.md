---
name: mnhospital-monorepo-development
description: Develop MN Hospital web and Expo mobile with explicit platform and backend boundaries.
---

1. Read `AGENTS.md`, `README.md`, relevant `docs/ai/` files, and existing feature docs. Check branch, remote, and working changes.
2. Trace the existing GraphQL operation and backend role/ownership rules before adding a screen. Keep server authorization final.
3. Put pure types, rules, public design tokens, and transport interfaces in `packages/` only when used across platforms. Keep Next, DOM, SCSS, Expo, native storage, and routing in their apps.
4. Implement a small vertical feature: model, API adapter, view-model hook, native or web view, and meaningful validation. Avoid speculative libraries.
5. Verify web build, mobile typecheck, and live device/browser behavior separately. Record missing checks and the next task in `docs/ai/NEXT_STEPS.md`.
6. Stage explicit files and use only `feat: description` or `fix: description` commit subjects.
