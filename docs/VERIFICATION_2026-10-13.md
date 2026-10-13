# Directory, localization and release verification — 2026-10-13

Scope: existing clinical layout, advertisements and bottom navigation retained. Booking availability, payment ownership and role boundaries unchanged. No production records were edited during this change.

## Passed
- Production Next.js build: 67 static pages; Pages Router and React 18 retained.
- TypeScript (`npx tsc --noEmit`).
- Auth/session: 56 checks; appointment draft reset: 18; submit: 15; booking calendar: 16; service booking options: 37; service calendar: 8.
- Doctor directory: 13 checks covering URL search, submit, pagination, filter reset and keeping visible results during loading.
- Theme contrast: 70 checks across public/doctor/receptionist/admin palettes.
- Homepage: 28 checks; profile: 39; promotions: 30; option management: 17; workspace refresh: 18. Follow refresh, signup validation and Eximbay checkout verification also passed.
- Production dependency audit: 0 vulnerabilities after Next 15.5.27, Swiper 14.3.0, PostCSS 8.5.30 and source-map-js 1.2.2 updates.
- Standalone server served `/api/health` with no-store and the commit SHA; rejected POST with 405. Security response headers verified.
- Compose files parsed; HTTPS configuration correctly refuses an empty domain.
- Browser: live public catalog loaded; doctor page 2 displayed the remaining 4 of 16 doctors; searching Khan returned Dr Khan; service cards displayed doctor, duration, discounted price. Light/dark controls and 390px mobile doctor layout checked. Korean visit guide rendered with translated preparation and booking steps.

## Limits
- The public backend disables schema introspection, so the full API contract script could not read its schema. Workspace/specialty scripts also require temporary generated backend schemas unavailable in this run. Existing public directory operations succeeded in the browser.
- Docker daemon was not running. The image build and Caddy certificate issuance were not executed. The same standalone application entrypoint used by Docker was run locally.
- Local build runtime was Node 20.10; Docker/CI select Node 22. CI has been prepared; its remote result is not claimed here.
- Production HTTPS, expired-access refresh, OAuth redirects and real payment activation need verification after domain/server deployment. Secure cookie settings were not weakened.
