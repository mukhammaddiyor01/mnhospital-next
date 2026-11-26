# Next steps

Follow the ordered gates in `ROADMAP.md`. Public mobile transport hardening is implemented; device validation is the next open gate. While device tooling is unavailable, backend native session release work and isolated web migration preparation can progress without treating the device gate as passed.

Use `SKILLS.md` and the nearest `AGENTS.md` for the next feature. The mobile welcome screen still needs device/simulator validation; the native session contract remains the gate before login. The web move to `apps/web` remains a separate migration.

1. Launch the Expo welcome screen on an Android/iOS device or simulator; check safe area, contrast, and screen sizes. Dependency lock, typecheck, and Android bundle export already passed.
2. Complete the patient-first backend route at `mnhospital` branch `codex/native-patient-session` (`2768d2d`): add distributed login rate limiting, verify proxy request-size/HTTPS controls, run isolated persistence and browser regressions, and review error/log redaction. The route is disabled by default. Keep mobile auth off until those checks and the device gate pass; see `NATIVE_SESSION_DESIGN.md`.
3. Move Next.js to `apps/web` in a separate commit after updating Docker, CI, aliases, and release paths; run the full web gates.
4. Validate the new public services screen on a device with a reachable HTTPS API. Confirm real titles, empty/error/retry, pagination, and no sensitive data in logs. The GraphQL contract is documented in `BACKEND_CONTRACT.md`; booking remains gated on separate server contract checks.
