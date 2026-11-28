# Business logic

The welcome screen has no clinical or booking behavior. Before implementing bookings, preserve backend rules for real service/doctor selection, schedule, room, break time, server-calculated price, payment ownership, and reservation expiry. Client checks improve usability but never grant access or establish final availability. The backend `ProjectLogic.md` and existing booking docs are the detailed source of truth.

For each new mobile flow, write down the actor, allowed role, ownership source, inputs, server decision, success result, failure states, and retry behavior before UI work. Patient, doctor, receptionist, and admin identities are role plus profile ID from the verified session. Do not infer that a profile ID in route params grants access. A failed booking/payment mutation must show the server result and avoid a fabricated success state. Never persist a clinical draft without an explicit data-retention design.

Public services: any guest may list the server's ACTIVE catalog; the server owns publication status. Mobile shows title and optional description, supports pagination and retry, and does not imply that a service can be booked. It does not calculate price or availability. An unconfigured URL or failed request is an error state, not an empty catalog. Pagination uses the server `_id` as the display identity: overlapping pages, duplicate rows, or the same successful response arriving again render one card per ID. The first visible occurrence remains stable; a refreshed first page replaces the old public list before applying the same uniqueness rule.

The guest may pull to refresh the catalog. While a page request or reload is active, another retry/refresh action is ignored; a successful refresh replaces the current list from server page one. This prevents repeated taps or gestures from creating concurrent requests or duplicate rendered results. It does not imply cache freshness, availability, price, or booking eligibility.

Each public catalog request has a bounded client wait. A caller cancellation remains cancellation; a timeout becomes the existing generic unavailable state. Neither outcome fabricates an empty catalog, changes authorization, nor exposes raw transport details.

The catalog asks only for a positive safe page number and a fixed page size of ten. A response containing more rows than that contract limit is invalid rather than rendered. This bounds an anonymous response's impact on the native list without treating client validation as server authorization.

The public adapter requests only the catalog fields used by the view and maps HTTP, GraphQL, malformed-shape, and malformed-JSON failures to generic error categories. It never forwards server error detail into the view; the view-model decides the localized unavailable state.

Changing the mobile display language translates only client-owned navigation, status, accessibility, and error copy. Service titles and descriptions remain server-owned and are rendered as returned; the client must not invent translations that could change medical meaning. Language selection does not change identity, role, authorization, catalog visibility, booking rules, or request data.
