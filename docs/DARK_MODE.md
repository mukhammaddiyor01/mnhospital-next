# MN Hospital dark mode

Reviewed using the owner's requested [Anthropic frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md).

The direction is a quiet clinical navy canvas with blue actions and teal care/status accents. DM Sans body copy, Manrope headings, the 820px patient canvas, advertisement rails, mobile navigation, hero photos and separate staff workspace identities remain the existing presentation foundation.

## Color contract

| Role | Color | Purpose |
| --- | --- | --- |
| Canvas | `#0D1722` | Page background |
| Card | `#172838` | Header, cards and chat |
| Input | `#203345` | Editable fields |
| Text | `#E4EDF4` | Body copy |
| Blue | `#82C9FF` | Links, selection and keyboard focus |
| Teal | `#75DFC6` | Care accents and completed status |

Supporting text uses `#AEC0CD`; feature sections use `#1A3041`. Filled primary actions use `#206999` with white text, and `#287CAF` on hover. Bright blue text accents must not be used as the background of white-text actions. Likewise, `--clinical-navy` is a heading color, never a feature background.

Input borders use `#66839A` to remain distinguishable from their input surface. Card dividers use the quieter `#334B5F`; these decorative dividers do not convey control boundaries. Errors use `#FFC1C8` on `#4A2735`.

Doctor shared controls inherit the existing teal workspace variables; receptionist controls inherit slate-blue variables. Admin keeps its existing navy palette. Filled staff actions use dark text; secondary Cancel actions keep their role accent on a dark surface.

## Corrections

- About values previously used the bright dark-mode heading token as a background, producing approximately 1.1:1 white-heading contrast. It now uses a dedicated feature surface.
- About body copy retained a light-theme gray with approximately 2.85:1 contrast. It now follows the secondary text token.
- Native input borders, placeholders, error messages, legacy detail headings and secondary button hover surfaces now follow the dark palette.
- Shared staff forms now inherit their role palette. Profile Cancel remains readable alongside the filled Save action.

All changes live in `scss/dark-mode.scss`, imported last in `scss/app.scss`. The rules are scoped to `html[data-theme='dark']`; theme persistence, System preference resolution and translations remain in the existing preference flow.

## Validation

`node scripts/verify-dark-contrast.cjs` compiles the delivered SCSS and resolves public and role token overrides. It checks 70 color pairs: normal text at 4.5:1 or better, and input boundaries/focus indicators at 3:1 or better.

Production build and TypeScript validation passed. Browser checks covered About, booking, patient/staff sign-in, chat and representative doctor/receptionist/admin form and profile states. About and booking/chat were checked at 390px; no horizontal overflow was found. The temporary staff presentation sample route is not delivered. Private profile writes, sign-in submissions and payments were not part of this visual verification.

The automatic DOM audit covers text on solid/composited backgrounds; photographic/gradient backgrounds and provider logo glyphs require visual review. These checks are not a claim of complete site-wide accessibility certification.
