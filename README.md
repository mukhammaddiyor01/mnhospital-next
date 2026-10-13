# MN Hospital Next

MN Hospital frontend built with Next.js Pages Router and TypeScript.

## Structure

- `pages/` contains route-level screens, following the Nestar Next setup.
- `libs/components/` contains UI and domain components.
- Domain `types/` and `enums/` live inside their component domain, matching the backend shape:
  `components/<domain>/{dto,enums,schema,types}`.
- `apollo/` contains GraphQL client setup and domain queries for the MN Hospital API.
- `scss/` contains the global clinical design system based on the Stitch palette.

## Run locally

```bash
npm ci
cp .env.example .env.local
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

Docker/CI use `package-lock.json`. Preserve local `.env` files; copy their public settings into the Compose `.env` before building. Production refresh sessions require HTTPS.
