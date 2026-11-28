# Completed tasks

- 2026-11-25: Created the local `mobile` branch and added the initial Expo workspace, welcome view, view-model, design tokens, and monorepo guidance. npm install, mobile typecheck, Android bundle export, Expo dependency check, and web build passed; device validation remains open (see `TESTING.md`).
- 2026-11-26: Expanded agent and skill guidance for mobile features, backend contract review, library selection, readable code, and commit/handoff rules. Documentation checks are recorded in `TESTING.md`.
- 2026-11-26: Audited the current backend session flow against native requirements and recorded the cookie-only refresh gap in `BACKEND_CONTRACT.md`.
- 2026-11-26: Added a read-only mobile services list using the existing public GraphQL contract. Validation is recorded in `TESTING.md`.
- 2026-11-26: Added an ordered roadmap and privacy/security boundaries for subsequent web and mobile work.
- 2026-11-26: Restricted the public mobile GraphQL URL to HTTPS without embedded credentials or parameters; see `TESTING.md` for checks.
- 2026-11-26: Defined a patient-first native session contract and backend/mobile verification gates in `NATIVE_SESSION_DESIGN.md`; implementation remains open.
- 2026-11-26: Added a disabled-by-default native patient session route on the separate backend branch `codex/native-patient-session` (`2768d2d`); focused build/tests passed, release gates remain open.
- 2026-11-26: Added shared HMAC-keyed native login limits, bounded proxy/body controls, production HTTPS enforcement, and auth-log redaction on backend `codex/native-patient-session` through `1e0e7af`; 170 focused tests passed.
- 2026-11-26: Added a separate mobile CI job for typecheck, Expo dependency compatibility, and Android/iOS bundle exports; repeated local Node 22 typecheck and both exports successfully.
- 2026-11-26: Aligned the mobile TypeScript toolchain with Expo SDK 58 after the online CI compatibility check exposed the stale workspace range.
- 2026-11-26: Confirmed the follow-up mobile CI job passes and updated the doctor-directory harness for the page's existing results ref.
- 2026-11-26: Added accessibility semantics and 44-point touch targets to the public mobile screens, with an 11-check regression gate in mobile CI.
- 2026-11-26: Made public mobile service pagination idempotent by server ID and added an 8-check pure-model CI gate for duplicate, overlap, and retry cases.
- 2026-11-28: Remediated the Expo fingerprint minimatch availability advisory with compatible Expo patches, an exact patched override, and a moderate-or-higher production audit gate.
- 2026-11-28: Added typed English, Korean, and Uzbek localization for the public mobile welcome and services experience, including accessible language controls and semantic view-model errors.
- 2026-11-28: Added guarded pull-to-refresh for the public services catalog; repeated retry/refresh actions are coalesced and a successful refresh replaces the visible list from page one.
