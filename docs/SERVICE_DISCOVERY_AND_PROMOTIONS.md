# Service discovery and promotions

## Public services

`/service` searches service titles, names and descriptions as literal text. All service types are available. Search, type, base price range, sorting and the discounted-only switch compose one server query. Apply resets pagination; URL query parameters retain filters across reload, links and browser history. Invalid URL values fall back to safe defaults.

Price range and price sorting refer to the base service price. Cards show the discounted booking price. The `discountedOnly` API filter requires an active service with a positive percentage and an active, non-deleted doctor; its count and pagination use the same eligibility conditions.

The home page inserts `DiscountedServices` before health articles. It loads three real offers, shows base and payable prices, savings, duration and a service detail link, and links to the filtered catalog. Loading, failure and empty states do not fabricate promotions.

## Admin

`/admin/services` defaults to pricing and discounts. The catalog tab retains the existing service CRUD. Choose a service, enter a percentage or a preset, review the new booking price, and save. Existing booking price snapshots are preserved by the backend. Zero removes the service discount.

`/admin/promo-codes` has its own workspace navigation item. The composer separates code details, minimum eligible amount, validity and service eligibility. Percentage and fixed amount codes use existing admin APIs. Scoped codes use the admin service catalog, preserve selections across search/pagination and limit selection to 100 services. Dates are entered in the browser's local timezone and submitted as UTC instants. The preview and list distinguish active, scheduled, expired and inactive codes. Archive uses the existing soft-delete operation.

Promo-code contents remain admin-only. Patients enter a provided code in the booking total disclosure before choosing payment. The displayed subtotal, service discount, promo discount and payable total all come from the saved order. Existing payment locks, account scoping and role guards remain in force.

## Verification

- Frontend/backend TypeScript and frontend production build.
- `node scripts/verify-promotions.cjs`: price rounding, checkout locks and server totals, composed filters, safe URL parsing, zero-price bounds and URL restoration.
- `node scripts/verify-workspace-contracts.cjs /tmp/mn-promotions-schema.graphql ../mnhospital/node_modules`: all frontend GraphQL documents checked against the exported backend schema.
- Backend checkout persistence suite runs in a unique disposable Mongo database; adds combined discounted/type/price/literal-search paging including blocked doctors and inactive services.
- Browser verification uses isolated preview accounts/data; public catalog and home are also checked on the regular local application.

Homepage promo offers appear above discounted services. Admins choose “Show on homepage” in Admin → Promo codes to publish an existing code. Fixed amounts display the stored currency (for example 7,000 KRW discount); percentage codes display their actual percentage. The banner includes copy code, minimum eligible amount, selected-service scope, expiry and checkout guidance. Publication is separate from activation; older codes are not published automatically. No example code or amount is seeded into the application database.

## Homepage refinement

Published promos use a compact offer strip with a copyable code and expandable terms. The real discount, expiry, minimum and service scope remain unchanged. Mobile selectors use the same specificity as desktop layout. Homepage cards use actual doctor specialties, and points are not presented as review stars. Static invented testimonials and unverified clinical credentials were removed from the visible page; the booking guide now follows the actual service, calendar and checkout flow. The appointment call to action opens `/appointment`.
