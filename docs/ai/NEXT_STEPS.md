# Next steps

Follow the ordered gates in `ROADMAP.md`. Public mobile transport hardening is implemented; device validation is the next open gate. While device tooling is unavailable, native session backend implementation and isolated web migration preparation can progress without treating the device gate as passed.

Use `SKILLS.md` and the nearest `AGENTS.md` for the next feature. The mobile welcome screen still needs device/simulator validation; the native session contract remains the gate before login. The web move to `apps/web` remains a separate migration.

1. Launch the Expo welcome screen on an Android/iOS device or simulator; check safe area, contrast, and screen sizes. Dependency lock, typecheck, and Android bundle export already passed.
2. Implement and test the patient-first native login/refresh/logout contract from `NATIVE_SESSION_DESIGN.md` in the separate backend repository before mobile authentication UI. Preserve browser sessions, server role/ownership checks, and refresh replay protection; record the backend commit and evidence here before wiring mobile.
3. Move Next.js to `apps/web` in a separate commit after updating Docker, CI, aliases, and release paths; run the full web gates.
4. Validate the new public services screen on a device with a reachable HTTPS API. Confirm real titles, empty/error/retry, pagination, and no sensitive data in logs. The GraphQL contract is documented in `BACKEND_CONTRACT.md`; booking remains gated on separate server contract checks.
