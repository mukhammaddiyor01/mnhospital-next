# Shared package rules

Read root `AGENTS.md` and `docs/ai/ARCHITECTURE.md` before editing.

Packages contain code that works on web and native without DOM, Next.js, Expo, React Native, storage, cookies, or secret configuration. Keep a package only when two real consumers need it. Pure domain rules must not import UI or transport code; GraphQL types must follow verified server fields. Design tokens are values, not SCSS or native components. Test a shared change in both consuming applications.
