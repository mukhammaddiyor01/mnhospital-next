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

The GraphQL API defaults to `http://localhost:3007/graphql`.
