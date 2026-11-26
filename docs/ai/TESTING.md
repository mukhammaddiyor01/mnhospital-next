# Testing

Record distinct evidence for web build, mobile typecheck, Metro start, simulator/device launch, browser checks, API contract tests, and backend ownership tests. A passing typecheck is not a device test. The initial welcome screen needs a typecheck and native launch before claiming it runs on a device. Existing web checks remain in `.github/workflows/quality.yml`.

## 2026-11-25 initial checks

- Node 22.20.0: `npm ci` passed from the root.
- `npm run mobile:typecheck` passed.
- `EXPO_OFFLINE=1 npx expo install --check` reported dependencies up to date; offline validation is limited.
- `EXPO_OFFLINE=1 npx expo export --platform android` bundled successfully (1127 modules). This is a bundle export, not a device build or launch.
- `npm run build` passed for Next.js after excluding the mobile workspace from web TypeScript scope. It emitted Sass `@import` deprecation warnings.
- Android/iOS simulator or physical device was not used. No authenticated API flow was exercised.

## 2026-11-26 documentation checks

- Checked that every skill link in `SKILLS.md` and every new local documentation link resolves.
- Checked the Markdown changes and Git diff for whitespace errors.
- No web/mobile build or device check was repeated because this change only updates guidance and Markdown.

## 2026-11-26 native readiness audit

- Backend GitHub `master` and `develop` both pointed to `ea1601a`; reviewed matching local resolver, interceptors, cookie helper, session service, and tests read-only.
- `xcrun simctl list devices available` could not run because `simctl` is unavailable; `adb` was not found. No device or simulator validation was performed.
- No backend or mobile runtime changes were made. No API request with credentials or application database access was made.

## 2026-11-26 public mobile services

- Node 22.20.0 `npm ci --offline` passed from the monorepo root.
- `npm run mobile:typecheck` passed after correcting the FlatList empty-component type.
- Offline Android Expo export passed: 1132 modules bundled. This is a bundle export, not an installed app or device test.
- Five response-shape cases passed (valid service, empty list, malformed container, malformed item, invalid total).
- Mocked public request checks passed for GraphQL URL, page/limit/search variables, selected fields, returned title, and GraphQL error handling without exposing the raw error.
- No live GraphQL API, browser, simulator, or physical device was tested. Existing web code was not changed; web build was not rerun.

## 2026-11-26 roadmap and privacy documentation

- Checked local Markdown links in updated entry documents and `git diff --check`.
- No runtime files or dependencies changed in this documentation step; no build or device check was repeated.

## 2026-11-26 public transport guard

- Mobile TypeScript check passed on Node 22.20.0.
- Offline Android Expo export passed (1132 modules). This verifies bundling, not an installed build or device behavior.
- Eight URL/request cases passed: valid HTTPS, missing/invalid URL, HTTP rejection, embedded credentials rejection, query/fragment rejection, and an anonymous public request with an empty catalog response.
- No live HTTPS endpoint, TLS certificate, simulator, or physical device was checked. Existing web code was not changed; web build was not rerun.

## 2026-11-26 native session design

- Reviewed the backend patient login resolver, session resolver, interceptor, cookie helper, and session service source read-only; checked Expo SecureStore and RFC 9700 primary documentation for storage and rotation assumptions.
- Checked local Markdown links and `git diff --check`. This was documentation only: no backend endpoint, mobile auth, API integration test, browser check, or device test was performed.
