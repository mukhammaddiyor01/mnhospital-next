# Next steps

1. Launch the Expo welcome screen on an Android/iOS device or simulator; check safe area, contrast, and screen sizes. Dependency lock, typecheck, and Android bundle export already passed.
2. Review the backend's native session contract. Design secure refresh/logout and role ownership before mobile login.
3. Move Next.js to `apps/web` in a separate commit after updating Docker, CI, aliases, and release paths; run the full web gates.
4. Add the first real mobile feature only after its API operation and server ownership are verified.
