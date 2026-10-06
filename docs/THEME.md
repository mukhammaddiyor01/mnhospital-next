# Dark and light theme

The site uses the existing clinical Sass design system. The header offers `LIGHT`, `DARK`, and `SYSTEM`; `SYSTEM` follows the device color scheme. The choice applies to the whole site, including public pages, the patient profile, forms, and service details.

Guests keep their choice in browser storage under `mn-hospital-theme`. An early document script applies that value before React loads. After sign-in, the app reads `getMyPreferences` and uses the authenticated profile's saved theme. Changes are sent through `updateMyPreferences`; a failed save restores the previous theme and shows an error. The backend owns the profile preference, while browser storage supplies the first render and Guest preference.

The color tokens live in `scss/clinical-reference.scss`, with dark surface overrides in `scss/theme.scss`. This theme flow does not translate interface text; KR/UZ/EN localization is the next roadmap stage.
