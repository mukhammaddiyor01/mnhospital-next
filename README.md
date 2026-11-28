# MN Hospital Next

## Mobile workspace

The `mobile` branch is a monorepo: the Next.js Pages Router lives in `apps/web`, Expo lives in `apps/mobile`, and platform-neutral tokens live in `packages/design-tokens`. Read [the architecture and gates](docs/ai/ARCHITECTURE.md) before connecting private API flows.

Work follows the ordered [mobile delivery roadmap](docs/ai/ROADMAP.md), with [privacy boundaries](docs/ai/PRIVACY.md) and validation recorded separately.

Use Node 22.13 or newer, then run `npm ci`, `npm run mobile:typecheck`, and `npm run mobile:start` from the root. The mobile app has Home, Services, Doctors and Articles tabs with detail screens over the anonymous catalog, in EN/KR/UZ with light and dark themes. Device checks of these screens, login, booking, and payment flows remain open.

To load the catalog on a device, copy `apps/mobile/.env.example` to `apps/mobile/.env.local` and restart Expo. `EXPO_PUBLIC_API_URL` is the reachable HTTPS GraphQL endpoint and `EXPO_PUBLIC_ASSET_URL` is the public prefix for uploaded images. Only public URLs belong in these variables.

MN Hospital web frontend is built with Next.js Pages Router and TypeScript in `apps/web`.

## Structure

- `apps/web/pages/` contains route-level web screens, following the Nestar Next setup.
- `apps/web/libs/components/` contains web UI and domain components.
- Domain `types/` and `enums/` live inside their component domain, matching the backend shape:
  `components/<domain>/{dto,enums,schema,types}`.
- `apps/web/apollo/` contains GraphQL client setup and domain queries for the MN Hospital API.
- `apps/web/scss/` contains the global clinical design system based on the Stitch palette.

## Run locally

```bash
npm ci
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

The GraphQL API defaults to `http://localhost:2001/graphql`.

The frontend defaults to `http://localhost:2002`. To use a different local port:

```bash
PORT=4005 npm run dev
```

Both `dev` and `start` respect the `PORT` environment variable. With the current
Docker Compose configuration, Next.js listens on port 4002 inside the container
and is available at `http://localhost:2002` on the host (`2002:4002`).

## Release and portfolio

- [Production release, HTTPS and rollback](docs/PRODUCTION_RELEASE.md)
- [Portfolio walkthrough and technical evidence](docs/PORTFOLIO.md)
- [Auth/session guarantees](docs/AUTH_SESSIONS.md)
- Visit preparation: `/visit-guide` in EN/KR/UZ.

Docker/CI use the root `package-lock.json`. Preserve local `.env` files; copy their public settings into the Compose `.env` before building. Production refresh sessions require HTTPS.
