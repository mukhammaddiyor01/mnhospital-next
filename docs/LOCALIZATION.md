# KR/UZ/EN interface language

`PreferenceProvider` reads `getMyPreferences` once for theme and language. Signed-in language changes use `updateMyPreferences`; Guest changes are saved in browser storage as `mn-hospital-language`. The document sets `lang` before hydration, and the provider updates it when the language changes.

Interface strings live in the typed catalog at `libs/i18n/messages.ts`. Components use `useTranslation()` and a catalog key. Add every new key to EN, KR, and UZ; TypeScript checks that each catalog has the same keys. The language selector is in the site header.

The current rollout covers shared navigation, footer, social links, homepage, advertisements, contact and about pages, patient profile and activity, follow lists, appointment booking, patient and doctor sign-in, doctor and service directories and detail pages, public patient profiles, article pages, and shared comments. Doctor, service, article, comment, and advertisement records returned by the API retain their authored language; translating those records requires localized fields and an editorial process. The UI does not machine translate medical information.
