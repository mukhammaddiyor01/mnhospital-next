# Design system

Mobile uses native controls and styles. `packages/design-tokens` begins with web light-theme colors from `apps/web/scss/design-system.scss` and a small spacing scale. The welcome and public services screens now expose heading/link/button, loading, empty, and error semantics in code; their navigation and action controls keep at least 44-point touch targets. Screen-reader order, dynamic type, contrast, dark theme, role palettes, and small/large screen behavior still require native device checks before expanding the package. Existing web design remains documented in `docs/DESIGN_SYSTEM.md`.

The public mobile language selector offers `EN`, `한국어`, and `O‘Z`, exposes a localized accessible label and selected state, and keeps 44-point minimum targets. Client-owned public copy and accessibility hints switch together. Server-provided medical/service text is not silently translated.

## Mobile theme tokens — 2026-11-28

`packages/design-tokens` exports light and dark palettes mirroring the web SCSS, plus radius and spacing. Mobile follows the system color scheme.

## Mobile catalog UI — 2026-11-28

Shared native pieces live in `apps/mobile/src/ui/`: card, photo with initial fallback, badge, button, list and state views. Navigation is Home, Services, Doctors and Articles tabs with native headers on detail screens. The language selector sits on Home. Rendering on a device is not yet checked.
