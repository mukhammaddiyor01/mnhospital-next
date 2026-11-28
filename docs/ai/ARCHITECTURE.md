# Architecture

The monorepo has a Next.js Pages Router app in `apps/web`, an Expo Router app in `apps/mobile`, and platform-neutral packages in `packages/`. Root commands delegate to named workspaces while the root lockfile remains authoritative. The NestJS GraphQL API remains a separate repository.

Model = backend-verified GraphQL types and pure business rules. View = Next.js components or React Native screens. Controller = hooks/view-models that coordinate state and use cases. The backend remains the authority for identity, roles, ownership, pricing, bookings, and persistence.

`packages/design-tokens` is the first shared package. Future `domain`, `graphql-types`, `api-client`, and `config` packages require a demonstrated cross-platform consumer and no DOM, Next, React Native, or secret storage imports. See existing `docs/API_WORKSPACE_COVERAGE.md` and backend `ProjectLogic.md` for API behavior.

## Library decisions

| Need | Initial choice | Add or change when |
| --- | --- | --- |
| Routes and screen stacks | Expo Router, already installed | A route needs a documented navigation pattern; keep Next routing in web only. |
| Native controls and capabilities | React Native primitives and Expo SDK packages | A real feature needs camera, notifications, images, etc.; install Expo-compatible versions using `expo install`. |
| Sensitive credential storage | Expo SecureStore, already installed | Connect only after native backend refresh/logout behavior is proven. |
| Server-state caching | None yet | Select Apollo for GraphQL normalized cache/subscriptions, or TanStack Query for request caching. Give each resource one cache owner. |
| Forms | Local controlled state first | Choose a form library only when repeated, complex forms justify it; keep server validation authoritative. |
| Shared code | Pure TypeScript packages | Two real platform consumers need the same rule, type, adapter interface, or token. |

Popularity alone is not a reason to install a package. Pin compatible versions in `package-lock.json`; document the feature and cache/ownership behavior before installation. Expo's [library guidance](https://docs.expo.dev/workflow/using-libraries/) recommends `expo install` for compatible versions. [Apollo React Native](https://www.apollographql.com/docs/react/integrations/react-native) and [TanStack Query React Native](https://tanstack.com/query/latest/docs/framework/react/react-native) are supported options, not current mobile dependencies.

Mobile localization follows the same dependency direction: a pure typed message model is the Model, the app-level provider is the state/controller boundary, and screens plus `LanguageSwitcher` are Views. English, Korean, and Uzbek public UI copy share this boundary without changing API payloads or server-owned content. Language is intentionally in-memory until a persistence requirement and privacy review justify storage.
