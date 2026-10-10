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
npm install
cp .env.example .env.local
npm run dev
```

The GraphQL API defaults to `http://localhost:2001/graphql`.

The frontend defaults to `http://localhost:4002`. To use a different local port:

```bash
PORT=4005 npm run dev
```

Both `dev` and `start` respect the `PORT` environment variable. With the current
Docker Compose configuration, Next.js listens on port 4002 inside the container
and is available at `http://localhost:4002` on the host (`4002:4002`).
