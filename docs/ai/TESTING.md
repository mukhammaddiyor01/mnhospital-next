# Testing

Record distinct evidence for web build, mobile typecheck, Metro start, simulator/device launch, browser checks, API contract tests, and backend ownership tests. A passing typecheck is not a device test. The initial welcome screen needs a typecheck and native launch before claiming it runs on a device. Existing web checks remain in `.github/workflows/quality.yml`.

## 2026-11-25 initial checks

- Node 22.20.0: `npm ci` passed from the root.
- `npm run mobile:typecheck` passed.
- `EXPO_OFFLINE=1 npx expo install --check` reported dependencies up to date; offline validation is limited.
- `EXPO_OFFLINE=1 npx expo export --platform android` bundled successfully (1127 modules). This is a bundle export, not a device build or launch.
- `npm run build` passed for Next.js after excluding the mobile workspace from web TypeScript scope. It emitted Sass `@import` deprecation warnings.
- Android/iOS simulator or physical device was not used. No authenticated API flow was exercised.
