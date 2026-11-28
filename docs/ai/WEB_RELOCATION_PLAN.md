# Web relocation plan

## Status

Prepared on 2026-11-28 for the `mobile` branch. This is a preflight plan only: no web files, packages, Docker paths, or CI paths have moved. The Next.js Pages Router remains at the repository root and Expo remains at `apps/mobile`.

The relocation is deliberately independent from mobile catalog work, authentication, bookings, payments, medical records, and backend changes. It must be one isolated structural change with a complete web validation run.

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

## Implementation sequence

1. Create `apps/web` as a workspace and move the web-owned paths without changing behavior.
2. Give the web app a package manifest that uses the existing root-resolved dependencies; do not introduce duplicate lockfiles or a second dependency version tree.
3. Update root scripts to delegate web development, build, start, lint, and TypeScript validation to `@mnhospital/web` while retaining the existing command names for Docker and CI callers.
4. Update Dockerfile and Compose to install once from the root lockfile, build the web workspace, and copy only the relocated standalone output, static assets, and public assets.
5. Update verification scripts that explicitly open `pages/`, `scss/`, `apollo/`, or `libs/`. Maintain their assertions unchanged unless a path is the only change.
6. Update CI paths and run the full web quality job plus the unchanged mobile job. Do not merge this relocation with a user-facing feature or dependency upgrade.

## Required evidence

- Node 22 root `npm ci`, web build, web TypeScript check, and every existing web verification script pass.
- Docker build and health endpoint behavior are checked separately from the Next build.
- Mobile typecheck, localization, accessibility, services, refresh, Expo compatibility, and Android/iOS exports still pass.
- Secret scan and moderate production dependency audit pass.
- No browser, simulator, device, live API, production deployment, or application database result may be claimed unless separately observed.

## Exit decision

Begin the relocation only when this plan can be performed as an isolated structural commit and the complete web validation time is available. If that condition is not met, retain the root web app and continue independent mobile/backend gates.
