# Decisions

- 2026-11-25: Use the clean checkout at GitHub HEAD `5f08847` as the branch base; create the local `mobile` branch.
- Keep the web app at root for the first step to preserve existing Docker/CI behavior. Move it separately after dependency and path checks.
- Start with Expo Router, React Native, SecureStore dependency, and a minimal token package. Add Apollo or TanStack Query when the first verified API flow defines caching and session handling.
- 2026-11-26: Give repository, mobile app, and shared packages explicit agent rules. Add feature and API-contract skills. Choose new libraries only for a concrete feature and one clear owner of server cache data.
- 2026-11-26: Backend source audit confirmed cookie-only refresh. Hold native login UI and credential storage until a separate native session contract is implemented and validated; do not reuse browser refresh operations as a SecureStore solution.
- 2026-11-26: Start mobile data integration with the existing public `getServices` query. Use a small fetch adapter and local view-model state; no cache library is justified for this read-only list yet. Do not show a derived price or booking promise from catalog data.
- 2026-11-26: Use `ROADMAP.md` as the ordered delivery handoff. Public transport safety comes before new private features; native auth requires backend contract work; web relocation is isolated from clinical changes.
- 2026-11-26: Specify a patient-first native session contract in `NATIVE_SESSION_DESIGN.md`. Reuse server session authority and rotation while keeping browser cookie operations intact. At this design step, neither an endpoint nor mobile login had been implemented.
- 2026-11-26: Keep the new backend native route disabled by default until distributed throttling, deployed transport limits, persistence tests, and device checks are evidenced. A passing mock HTTP suite does not unlock mobile login.
