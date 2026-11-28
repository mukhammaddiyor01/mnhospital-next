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

## 2026-11-26 backend native patient route draft

- Separate backend branch `codex/native-patient-session` at `2768d2d`: `npm ci --offline --ignore-scripts`, `npm run build:api`, and three focused Jest suites passed (34 tests total). The HTTP suite used a local test server and an in-memory mock session store; it checked login/refresh/logout, role injection, request headers, replay, and session binding. Existing browser cookie and auth-session suites passed.
- The first HTTP test attempt failed because the sandbox blocked a loopback socket (`listen EPERM`); the same tests passed when rerun with loopback permission. No application database, deployed API, browser UI, simulator, or physical device was tested.
- Route is disabled by default. Distributed rate limiting, proxy request-size and HTTPS verification, real persistence integration, and live mobile validation remain open. This documentation update did not change web/mobile runtime code; no web/mobile build was rerun.

## 2026-11-26 native login protection

- Backend `codex/native-patient-session` through `1e0e7af`: `npm run build:api` passed. Seven focused Jest suites passed (170 tests): native HTTP, shared rate limits, proxy/body parsing, browser cookies, owned auth sessions, GraphQL session integration, and role policies.
- Mock tests verified five account/network and twenty network attempts per 15 minutes, HMAC-only counter keys, fail-closed persistence errors, 8 KiB native bodies, fixed malformed/oversized responses, production HTTP rejection, proxy hop bounds, credential rotation/replay, and browser cookie regression. Existing auth guards no longer log account nicknames.
- Persistence was mocked and HTTP used local test servers. No application/disposable Mongo database, deployed API, public TLS/proxy, browser UI, simulator, or physical device was tested. Mobile runtime was unchanged, so mobile typecheck/export was not rerun.

## 2026-11-26 mobile CI gates

- Node 22.20.0 mobile typecheck passed. Offline Expo dependency validation reported dependencies up to date, with Expo's explicit warning that offline validation is limited.
- Offline Expo exports passed for Android (1132 modules) and iOS (1138 modules). These are Metro bundle exports, not native builds, installed apps, simulator launches, or physical-device checks.
- Added a separate Node 22 GitHub Actions mobile job for `npm ci`, mobile typecheck, online `expo install --check`, and Android/iOS exports.
- The first remote mobile job (`45821110744`, job `139913283368`) passed install and typecheck, then failed before exports because Expo SDK 58 expected mobile TypeScript `~6.0.3` while the workspace declared `~5.9.0`.
- After aligning the mobile-only TypeScript range, the online Expo dependency check, TypeScript 6 typecheck, Android export (1132 modules), and iOS export (1138 modules) passed locally on Node 22.20.0. Follow-up mobile job `139916944191` in run `45822169761` then passed `npm ci`, typecheck, online dependency compatibility, and both exports. The exports remain bundle evidence only; the device gate remains open.
- The web `verify` job failed in both earlier runs at `verify-doctor-directory.cjs` because the harness still delegated the page's newer `useRef` call to React outside a renderer. The harness now models a persistent ref alongside its existing state mocks. Follow-up run `45822703035` passed both the complete web `verify` job and the separate mobile job; secret-scan run `45822703066` also passed.
- `xcrun` exists locally but `simctl` is unavailable; `adb` was not found. The roadmap device gate remains open.

## 2026-11-26 mobile accessibility readiness

- Added screen-reader heading, link, list loading, empty-state announcement, alert, and button semantics to the welcome and public services screens. Navigation and action controls retain at least 44-point touch targets.
- `MOBILE_ACCESSIBILITY_VERIFIED 11 checks` passed and the check is part of the separate mobile CI job. This is source-level regression evidence, not VoiceOver/TalkBack behavior.
- Node 22.20.0 mobile TypeScript 6 typecheck passed. Offline Android export passed with 1132 modules and iOS export passed with 1138 modules.
- GitHub Actions run `45823748497` passed the complete web `verify` job and the mobile job, including the new accessibility gate, Expo compatibility, typecheck, and both exports. Secret-scan run `45823748380` passed.
- `simctl` remains unavailable and `adb` is not installed. No simulator, physical device, live HTTPS API, screen reader, dynamic type, contrast, or dark-mode behavior was observed.

## 2026-11-26 idempotent public service pagination

- `MOBILE_SERVICE_PAGINATION_VERIFIED 8 checks` passed for duplicates within one response, overlapping pages, a repeated page, stable first occurrence, unchanged inputs, and empty pages.
- Node 22.20.0 mobile TypeScript 6 typecheck passed. Offline Android export passed with 1132 modules and iOS export passed with 1138 modules.
- The new pure merge rule is included in the separate mobile CI job. No cache dependency, credential, patient data, mutation, live API, simulator, or physical device was introduced or tested.
- GitHub Actions run `45824720737` passed the new pagination gate, the complete mobile job, and the web `verify` job. Secret-scan run `45824720636` passed.

## 2026-11-28 mobile dependency advisory remediation

- Confirmed the vulnerable tree was Expo 58.0.26 → `@expo/fingerprint` 0.21.10 → `minimatch` 10.2.6. The advisory affects availability through attacker-controlled glob pattern amplification; no confidentiality or integrity impact was identified by the advisory.
- Updated Expo to 58.1.0 and Expo Router to 58.0.33, then pinned transitive `minimatch` to patched 11.0.1 because Expo fingerprint 0.22.0 still declares `^10.2.6`.
- Node 22.20.0 `npm ci --offline` passed from the canonical package lock. Online Expo dependency compatibility reported up to date, the resolved tree showed fingerprint 0.22.0 with overridden minimatch 11.0.1, and `npm audit --omit=dev --audit-level=moderate` reported zero vulnerabilities.
- Expo fingerprint generation passed for Android and iOS. The web production build, mobile TypeScript 6 typecheck, 11 accessibility checks, and 8 pagination checks passed.
- Offline Android export passed with 1131 modules and iOS export passed with 1137 modules. These remain bundle exports, not installed builds or device checks.
- GitHub Actions run `46097436439` passed the moderate-level production audit, complete web `verify` job, and mobile job. Secret-scan run `46097436503` passed.

## 2026-11-28 public mobile localization

- Mobile TypeScript typecheck passed. `MOBILE_LOCALIZATION_VERIFIED 51 checks` passed for three language codes, all typed public UI keys, and representative Korean/Uzbek values.
- Existing `MOBILE_ACCESSIBILITY_VERIFIED 11 checks` and `MOBILE_SERVICE_PAGINATION_VERIFIED 8 checks` still pass; localization is included in the separate mobile CI job.
- Offline Android export passed with 1134 modules and iOS export passed with 1140 modules. The local Node 20.10.0 runtime emitted Expo's Node >=22.13.0 warning, so CI remains the supported-runtime authority.
- No live HTTPS API, simulator, installed build, physical device, VoiceOver, or TalkBack was tested. Server-provided service content remains unchanged and language preference is not persisted.

## 2026-11-28 public catalog refresh

- Mobile TypeScript typecheck passed. Existing localization (51), accessibility (11), and idempotent pagination (8) checks passed.
- `MOBILE_SERVICE_REFRESH_VERIFIED 9 checks` passed for a guarded reload owner, page-one replacement, native `FlatList` refresh wiring, and the refresh loading state.
- Offline Android export passed with 1134 modules and iOS export passed with 1140 modules. These prove Metro bundling only; the local Node 20.10.0 runtime emitted Expo's Node >=22.13.0 warning, so CI is the supported-runtime authority.
- No live API, simulator, installed build, physical device, or actual pull gesture was observed.

## 2026-11-28 web relocation preflight

- Read-only inspection confirmed root-level coupling in npm scripts, TypeScript aliases, Next standalone tracing, Docker/Compose output paths, CI commands, and verification scripts that read web directories directly.
- `adb` remains unavailable. `xcrun simctl` is not installed, so no Android/iOS simulator or physical-device validation was performed.
- Local Node is 20.10.0 while the repository requires Node 22.13 or newer; no build was run for this documentation-only preflight. CI remains configured for Node 22.

## 2026-11-28 web workspace relocation

- Root `npm install --package-lock-only --ignore-scripts --offline` completed, updating the authoritative lockfile with `apps/web` while reporting the expected unsupported local Node 20.10.0 warnings.
- The relocated web TypeScript check, production build, auth (65 + 12), SEO (55), booking draft (18), catalog localization (108), booking focus (29), preference controls (8), doctor directory (13), booking submit (15), and contrast (70) checks passed. Additional relocated-source checks for profile, booking options, payment checkout, promotions, service options/calendar, follow refresh, signup, homepage, profile presentation, and workspace refresh also passed.
- Mobile regression gates still passed after the workspace change: typecheck, localization (51), accessibility (11), pagination (8), refresh (9), Android export (1134 modules), and iOS export (1140 modules).
- The Next build emitted pre-existing Sass `@import` deprecation warnings. Its standalone output contains `apps/web/server.js`, matching the updated Docker command.
- Docker daemon was unavailable locally, so no image build, container healthcheck, browser, live API, simulator, or device validation was performed.

## 2026-11-28 relocated standalone health preflight

- Rebuilt the current migration commit `58a2f08`, started `apps/web/.next/standalone/apps/web/server.js` temporarily on loopback, and received `{"status":"ok","service":"mnhospital-next","release":"58a2f085e5acb40c28218de4a6f27646a398d80e"}` from `/api/health`.
- The normal sandbox disallowed loopback binding (`listen EPERM`); the same ephemeral local check passed with explicit loopback permission. The process was stopped after the check.
- Docker daemon remains unavailable, so this does not validate a Docker image, container healthcheck, browser behavior, live API, simulator, or device.

## 2026-11-28 web standalone regression gate

- `WEB_STANDALONE_VERIFIED 11 checks` verifies the registered web workspace, root build delegation, source directories, monorepo tracing root, Docker manifest/output/server paths, and the current build's standalone/static artifacts.
- The check runs after `npm run build` in the web CI job. It prevents a relocated path regression without requiring a Docker daemon.

## 2026-11-28 public catalog request timeout

- `MOBILE_SERVICE_TIMEOUT_VERIFIED 8 checks` passed for the 15-second bound, caller cancellation, timeout cancellation, pre-aborted callers, cleanup, and adapter wiring. Existing accessibility (11), localization (51), pagination (8), and refresh (9) gates also passed.
- Mobile TypeScript typecheck passed. Offline Android export passed with 1134 modules and iOS export passed with 1140 modules. These are Metro bundle exports only; the local Node 20.10.0 runtime emitted Expo's Node >=22.13.0 warning, so CI remains the supported-runtime authority.
- No live HTTPS API, simulator, installed build, physical device, or timed-out network request was observed. `simctl` and `adb` remain unavailable, so device validation stays open.

## 2026-11-28 public catalog response bounds

- `MOBILE_SERVICE_RESPONSE_VERIFIED 10 checks` passed for valid and empty pages, malformed container/item/total values, an oversized list, and valid/invalid page numbers. Existing pagination (8), refresh (9), and timeout (8) gates also passed.
- Mobile TypeScript typecheck passed. Offline Android export passed with 1134 modules and iOS export passed with 1140 modules. These are Metro bundle exports only; the local Node 20.10.0 runtime emitted Expo's Node >=22.13.0 warning, so CI remains the supported-runtime authority.
- No live HTTPS API, simulator, installed build, physical device, or malicious endpoint response was observed. Source-level response bounds do not prove a device or production transport check.

## 2026-11-28 public catalog adapter integration

- `MOBILE_SERVICE_API_VERIFIED 10 checks` passed with the real public-service adapter and model compiled together against a mocked anonymous transport. It verified selected fields, the HTTPS target, no credentials in request headers, page/limit data, and fixed generic handling for HTTP, GraphQL, malformed JSON, and malformed response cases.
- Existing response-bounds (10), timeout (8), pagination (8), and refresh (9) gates plus mobile TypeScript typecheck passed. Offline Android export passed with 1134 modules and iOS export passed with 1140 modules. These are Metro bundle exports only; the local Node 20.10.0 runtime emitted Expo's Node >=22.13.0 warning, so CI remains the supported-runtime authority.
- The mock is not a live API, TLS, simulator, installed build, or physical-device test. No patient, staff, credential, or real server error data was used.

## 2026-11-28 Android physical-device smoke check

- Android 13 Samsung SM-A516N ran the Expo Go development build through an authenticated Wi-Fi `adb` connection. The Mac and phone were on different local subnets, so `adb reverse` carried Metro traffic; this is a development transport only, not a production network result.
- With Node 22.23.5, Metro bundled 1293 modules and the welcome screen rendered on the device. English, Korean, and Uzbek selection was observed; Korean and Uzbek text wrapped without overlap on the observed portrait screen.
- The public services route was opened without `EXPO_PUBLIC_API_URL`. It displayed the localized generic configuration state and retry control without calling an API or exposing an endpoint, credential, patient, staff, or clinical data.
- This did not test a reachable HTTPS catalog, pagination, pull-to-refresh, timeout, screen reader, dynamic type, dark mode, landscape/tablet, iOS, or a standalone installed application. Expo Go is not a release build.

## 2026-11-28 Android public-flow interaction check

- On the same Android 13 Samsung SM-A516N Expo Go session, Korean localization was changed from the services route, the configuration retry action was invoked without an API URL, and the Home link returned to the welcome screen with Korean selection retained.
- The configuration screen remained generic and disclosed no endpoint, response, credential, patient, staff, or clinical data. This verifies the visible public no-configuration path only; it does not exercise a reachable API, network timeout, pagination, refresh, or screen reader.
