# Catalog localization and focused booking

## Public catalog
`libs/i18n/catalog.ts` provides curated Korean and Uzbek labels for all 14 currently published services (13 distinct titles), their descriptions and existing booking snapshot names. EN retains the API source text except the misleading “Free check up” title, which displays as “Checkup” because the published service charges 25,000 KRW. KR/UZ also use a neutral checkup title; the source record and charged price are preserved. Doctor names, service IDs, prices, discounts, durations and payment state are not translated or changed.

The same helper is used by the homepage carousel/offers, service cards, service detail, package options, appointment select/review and payment review. Category labels use the existing translated service-type dictionary. Unknown/new admin text is displayed unchanged; matching uses normalized source text rather than service IDs, so an admin edit cannot be replaced by an obsolete translation. Add approved KR/UZ copy to the shared rows when new catalog content is published. This is curated localization, not automatic medical translation or a new database schema.

Korean/Uzbek title searches resolve to the corresponding source title before the existing API request. Common Korean specialty terms use broader source aliases. URL query chips retain the patient's entered text. Existing category, price, discount, sorting and pagination logic stays authoritative. Unknown searches pass through; the backend continues escaping regex input. This does not claim arbitrary free-form multilingual semantic search.

## Booking focus
Appointment and booking payment/result routes use the existing centre width and styling with no advertisement rails, no repeated header booking CTA, no periodic AI invitation and a short visit-guide/contact footer. The bottom navigation and help controls remain available. Other public pages retain the established layout.

Catalog advanced filters open on request. Active advanced filters and validation errors open them automatically. Search, service cards and clear filters remain visible. Previous catalog results remain on screen during refetch to avoid collapsing the page. Visit-guide links are visible in doctor/service introductions.

## Verification — 2026-10-13
- Production build and TypeScript passed.
- Catalog localization/search: 108 checks, including source preservation, unknown copy fallback and translated searches.
- Booking focus: 29 checks covering appointment/payment/result routes and unchanged public layouts.
- Auth: 56; booking submit: 15; draft reset: 18; service booking options: 37; promotions: 30; preference controls: 8; contrast: 70; doctor directory: 13; homepage: 28.
- Browser smoke uses the public API, without creating or paying a real booking. Korean query `비뇨의학과 상담` returned its one matching service; the detail/options and appointment select/review displayed the same translated label. Advanced filters opened on request; a negative minimum entered and then hidden reopened the filters with a validation alert, without navigating or requesting invalid filters.

Deployment uses the existing `.env`, frontend image build and release SHA. No backend deployment or database migration is required for these presentation changes.
