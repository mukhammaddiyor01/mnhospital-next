# Next steps

Follow the ordered gates in `ROADMAP.md`. Public mobile transport hardening is implemented; device validation is the next open gate. While device tooling is unavailable, backend native session release work and isolated web migration preparation can progress without treating the device gate as passed.

Use `SKILLS.md` and the nearest `AGENTS.md` for the next feature. The mobile welcome screen still needs device/simulator validation; the native session contract remains the gate before login. The web move to `apps/web` remains a separate migration.

1. Confirm the follow-up mobile GitHub Actions run passes Expo dependency compatibility, typecheck, and both platform exports; then launch the Expo welcome and public services screens on an Android/iOS device or simulator. Check safe area, contrast, screen sizes, real catalog, pagination, empty/error/retry, and accessibility. `simctl`/`adb` remain unavailable on this machine.
2. Complete the patient-first backend route at `mnhospital` branch `codex/native-patient-session` (`1e0e7af`): use a disposable isolated Mongo database to verify atomic rate counters/session persistence, then verify the real proxy hop, forwarded HTTPS, 8 KiB body limit, and generic errors in a non-production ingress environment. Browser/native mock regressions and log redaction passed. The route remains disabled by default; application data and deployment require explicit authorization.
3. Move Next.js to `apps/web` in a separate commit after updating Docker, CI, aliases, and release paths; run the full web gates.
4. Validate the new public services screen on a device with a reachable HTTPS API. Confirm real titles, empty/error/retry, pagination, and no sensitive data in logs. The GraphQL contract is documented in `BACKEND_CONTRACT.md`; booking remains gated on separate server contract checks.
