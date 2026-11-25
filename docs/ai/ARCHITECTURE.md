# Architecture

Current transition: Next.js Pages Router is at the repository root; Expo Router is in `apps/mobile`. Moving web to `apps/web` needs its own change because Docker, CI, TypeScript aliases, and scripts assume the root layout. The NestJS GraphQL API remains a separate repository.

Model = backend-verified GraphQL types and pure business rules. View = Next.js components or React Native screens. Controller = hooks/view-models that coordinate state and use cases. The backend remains the authority for identity, roles, ownership, pricing, bookings, and persistence.

`packages/design-tokens` is the first shared package. Future `domain`, `graphql-types`, `api-client`, and `config` packages require a demonstrated cross-platform consumer and no DOM, Next, React Native, or secret storage imports. See existing `docs/API_WORKSPACE_COVERAGE.md` and backend `ProjectLogic.md` for API behavior.
