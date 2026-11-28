# Web application rules

Read the root `AGENTS.md`, `README.md`, `SKILLS.md`, and relevant `docs/ai/` records before changing this app.

- Keep the Next.js Pages Router, `pages/`, `apollo/`, `libs/`, `scss/`, and `public/` inside `apps/web`.
- Keep web-only Next, DOM, SCSS, browser session, and Apollo code in this app. Do not import Expo, React Native, or SecureStore here.
- Preserve backend authority for identity, roles, ownership, pricing, availability, payments, and persistence. Browser session behavior must not be copied into mobile.
- The root package lock remains authoritative. Add web dependencies to `apps/web/package.json`; do not create a second lockfile.
- Root `npm run dev`, `build`, `start`, `lint`, and `web:typecheck` delegate to this workspace. Keep Docker and CI behavior aligned with these commands.
- Run the web build and relevant repository verification scripts for web changes. Record Docker/browser validation separately from a build.
