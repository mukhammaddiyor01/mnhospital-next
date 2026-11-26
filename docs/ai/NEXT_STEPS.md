# Next steps

Follow the ordered gates in `ROADMAP.md`. The immediate independent task is public mobile transport hardening; device validation remains open until a simulator or physical device is available.

Use `SKILLS.md` and the nearest `AGENTS.md` for the next feature. The mobile welcome screen still needs device/simulator validation; the native session contract remains the gate before login. The web move to `apps/web` remains a separate migration.

1. Launch the Expo welcome screen on an Android/iOS device or simulator; check safe area, contrast, and screen sizes. Dependency lock, typecheck, and Android bundle export already passed.
2. Implement and test a dedicated native login/refresh/logout contract in the backend before mobile authentication UI. The 2026-11-26 audit in `BACKEND_CONTRACT.md` found only cookie-based refresh. Preserve browser sessions, server role/ownership checks, and refresh replay protection.
3. Move Next.js to `apps/web` in a separate commit after updating Docker, CI, aliases, and release paths; run the full web gates.
4. Validate the new public services screen on a device with a reachable HTTPS API. Confirm real titles, empty/error/retry, pagination, and no sensitive data in logs. The GraphQL contract is documented in `BACKEND_CONTRACT.md`; booking remains gated on separate server contract checks.
