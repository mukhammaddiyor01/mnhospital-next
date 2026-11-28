# Web relocation plan

## Status

Completed on 2026-11-28 for the `mobile` branch. The Next.js Pages Router now lives in `apps/web`; Expo remains in `apps/mobile`.

The relocation was deliberately independent from mobile catalog work, authentication, bookings, payments, medical records, and backend changes.

## Observed coupling

| Surface | Current assumption | Required relocation result |
| --- | --- | --- |
| npm scripts | Root `dev`, `build`, `start`, and `lint` invoke Next directly | Root commands delegate to the named web workspace without changing their public behavior. |
| workspace definition | Root includes `apps/mobile` and `packages/*` only | Add `apps/web`; keep root lockfile authoritative. |
| TypeScript | Root `tsconfig.json` maps `@/*` to root and excludes only mobile/packages | Web config owns its source alias; root configuration must not accidentally typecheck both platform trees. |
| Next config | Root config uses `__dirname`, standalone output, headers, images, and release SHA | Move it with the web app and preserve standalone tracing semantics. |
| Docker | Dockerfile builds root and copies root `.next`/`public` | Install from root lockfile, build `apps/web`, and copy the resulting standalone/static/public paths. |
| Compose | Build context is repository root | Preserve build arguments, port `127.0.0.1:2002:4002`, healthcheck, and image name while selecting the web build target. |
| CI | Web job runs root build, root TypeScript, and root scripts | Keep all existing web checks operating against the relocated app; mobile remains a separate job. |
| verification scripts | Most scripts resolve repository root then read `pages/`, `scss/`, `apollo/`, or `libs/` | Update every affected path deliberately; do not weaken a check to make it pass. |

## Files to move together

Move these web-owned paths as one unit to `apps/web/`:

- `pages/`, `public/`, `apollo/`, `libs/`, and `scss/`
- `next.config.js`, `next-env.d.ts`, and a web-specific `tsconfig.json`
- web-only source configuration files required by the current Next build

Keep these at the repository root:

- `apps/mobile/`, `packages/`, root `package.json`, root `package-lock.json`, `.github/`, `docs/`, and `skills/`
- shared repository scripts, unless a script is web-runtime configuration rather than a root validation entry point
- Docker/Compose files, updated to build the web workspace from the root lockfile

No mobile component, Expo configuration, native storage, GraphQL private flow, patient data, or backend contract belongs in this relocation.

## Completed migration

1. Created `@mnhospital/web` and moved web-owned paths into `apps/web`.
2. Kept one root `package-lock.json`; web dependency declarations now live in `apps/web/package.json`.
3. Preserved root command names by delegating them to `@mnhospital/web`.
4. Updated Docker standalone paths and command for the nested web output.
5. Updated web verification scripts to read `apps/web` while retaining their behavioral assertions.
6. Kept the existing separate mobile CI job unchanged apart from the root web typecheck delegation.

## Required evidence

- Node 22 root `npm ci`, web build, web TypeScript check, and every existing web verification script pass.
- Docker build and health endpoint behavior are checked separately from the Next build.
- Mobile typecheck, localization, accessibility, services, refresh, Expo compatibility, and Android/iOS exports still pass.
- Secret scan and moderate production dependency audit pass.
- No browser, simulator, device, live API, production deployment, or application database result may be claimed unless separately observed.

## Exit decision

The code migration is complete. The remaining Docker image/healthcheck validation needs a running local Docker daemon or CI environment; browser, simulator, device, and live API validation remain separate gates.
