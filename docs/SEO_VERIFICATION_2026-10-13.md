# MN Hospital SEO verification — 2026-10-13

Implemented in the current `mnhospital-next` repository checkout, branch `codex/hospital-seo-content`. The older `../mnhospital-next` scaffold was not used as the release source.

## Verified results

- Production build and TypeScript passed with Next.js 15.5.27. HTTP verification used the generated standalone server, with `SEO_API_GRAPHQL_URL=https://mnhospital.uz/graphql`, on local port 4202.
- `npm run test:seo`: 55 checks passed for public/private indexing, anonymous requests, missing-record HTTP 404 versus outage HTTP 503, canonical normalization, sitemap pagination and partial/API-outage fallback.
- `npm run test:seo:http`: 203 checks passed against initial server HTML. Each tested page had one title, description and robots tag; indexable pages had one canonical and social metadata. Service, doctor and article headings and directory links existed before JavaScript executed. Invalid and absent records returned 404 with noindex; uppercase record IDs retained content and pointed to the lowercase canonical URL.
- The public API supplied 14 services, 16 doctors and 8 published articles. Together with 8 static public pages, the sitemap contained 46 unique URLs. Representative detail URLs from all three catalogs were included. Account, patient profile, booking and staff workspace URLs were excluded. Robots and sitemap used the same configured domain.
- Browser navigation from the service directory to an actual service showed its existing description, price, booking options and booking link, and updated title/canonical correctly. Reloading the final build retained the content and metadata; captured browser warning/error logs were empty.
- Existing checks passed: authentication (65), doctor directory transitions (13), booking submit (15), service booking options (37), catalog localization (108), booking focus (29), and follow/unfollow refresh. Repository security and `git diff --check` passed.

## Delivery scope

This verifies the local release build using real anonymous production catalog reads. No production deployment, Google indexing change, ranking improvement or fresh Search Console verification is claimed. Existing booking/payment, role/session, price and EN/KR/UZ rules remain in their existing flows. See [SEO configuration and operation](SEO_AND_HTTPS_SESSION.md) for deployment settings and repeatable verification commands.
