# Mobile application rules

Read the root `AGENTS.md`, `SKILLS.md`, `docs/ai/ARCHITECTURE.md`, `BACKEND_CONTRACT.md`, `SECURITY.md`, and the matching mobile skill before changing this app.

- Keep `app/` files thin Expo Router entries and layouts. Place screens, view-model hooks, and feature-specific adapters in `src/features/<feature>/`.
- A screen renders native state, labels, accessibility properties, loading/empty/error views, and actions. It does not decide patient ownership, price, availability, or role.
- A view-model coordinates one feature's loading and user actions. Pure formatting/validation belongs in a model; transport and SecureStore calls belong in adapters. Never import Next, DOM, SCSS, or web auth modules.
- Use Expo Router for navigation, React Native controls for UI, and Expo SDK modules for native capabilities. Check Expo's compatibility versions before adding packages.
- Keep JWT or other credentials in SecureStore only after the server session contract is verified. Do not persist clinical records in general device storage. Generic notification text only.
- Run `npm run mobile:typecheck` and an Android/iOS bundle check for mobile code changes. Report simulator/physical-device results separately. Update the related docs and commit with `feat: ` or `fix: `.
