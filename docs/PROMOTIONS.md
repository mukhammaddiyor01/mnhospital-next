# Admin promotions and patient checkout

- `/admin/services`: Service discounts panel edits an admin-owned percentage without changing the base price. 0 removes it. Public service cards/options and appointment selection display the resulting price.
- `/admin/promo-codes`: Create, edit, activate/deactivate and archive codes. Percentage/fixed amount, start/expiry, minimum eligible subtotal and optional service scope are supported. No selected services means all services. This page is also linked from admin services and the admin dashboard.
- `/booking/[bookingOrderId]/payment`: Apply, replace or remove one promo code before payment starts. Show the server's original subtotal, service discount, promo discount and final total. Codes apply after the service discount. Expired, inactive, ineligible and below-minimum codes show the API error without overwriting the current successful pricing.

All totals and permission decisions remain in the hospital API. The browser calculates service catalog display prices only. Existing role session handling and Apollo operations are reused; no payment provider or separate promotion framework is introduced. EN/UZ/KR labels follow the current localization context.

Checkout inputs stop when payment begins. Legacy orders without the new pricing snapshots do not offer coupon editing. Orders containing a zero-price service disable online payment and continue through existing cash/reception confirmation. The existing test online provider behavior is preserved.

Verified with frontend build, 15 promo UI/money checks, 32 service option checks, 411 GraphQL documents, 166 workspace fields and browser admin → patient checkout flow on synthetic fixtures in an isolated test database. Backend verification: 398 unit tests and 22 MongoDB/API cases, including cash, simulated online, ownership and simultaneous promo/payment requests.
