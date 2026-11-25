# Decisions

- 2026-11-25: Use the clean checkout at GitHub HEAD `5f08847` as the branch base; create the local `mobile` branch.
- Keep the web app at root for the first step to preserve existing Docker/CI behavior. Move it separately after dependency and path checks.
- Start with Expo Router, React Native, SecureStore dependency, and a minimal token package. Add Apollo or TanStack Query when the first verified API flow defines caching and session handling.
