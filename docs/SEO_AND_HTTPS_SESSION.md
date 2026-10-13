# HTTPS sessions and search visibility

## Current session behavior

The existing API issues a 15-minute access JWT and a 30-day, rotating, HttpOnly refresh cookie. The frontend restores a same-tab session after reload, refreshes shortly before access expiry, retries one rejected guarded request, and clears account data on sign-out. The access token is scoped to `sessionStorage` so different staff roles can use separate tabs. Closing a tab removes that tab's access token; opening a new tab does not silently select one of the role-specific refresh cookies. This is intentional for the current multi-role model.

The production deployment must use one HTTPS origin for the site and GraphQL API. Confirm backend `.env` contains `CLIENT_URL=https://mnhospital.uz`, `AUTH_ALLOWED_ORIGINS=https://mnhospital.uz,https://www.mnhospital.uz`, and `BASE_URL=https://mnhospital.uz/backend`. Frontend `.env` must contain `NEXT_PUBLIC_API_URL=https://mnhospital.uz/backend` and `NEXT_PUBLIC_API_GRAPHQL_URL=https://mnhospital.uz/graphql`. Recreate the API container after backend environment changes; rebuild the frontend image after public environment changes. Do not print or paste refresh cookie values into chat or logs.

To verify a refresh in a browser, sign in over `https://mnhospital.uz`, keep the tab open for more than 15 minutes, then reload a protected page. It should stay signed in. Sign out and reload: the private page must require sign-in. The regression harness is `npm run test:auth`.

## Search and link previews

Public pages have distinct server-rendered title, description, canonical URL, Open Graph/Twitter card metadata, and a public preview image. Service, doctor and article detail metadata comes from the public GraphQL catalog on the server. The preview image is `public/img/hospital-care-1.png`. Private account, booking and staff pages are `noindex` and omitted from the sitemap. `robots.txt` points to `/sitemap.xml`; the sitemap includes public catalog records when the API responds and static public pages even during an API outage. `NEXT_PUBLIC_SITE_URL` defaults to `https://mnhospital.uz`; `SEO_API_GRAPHQL_URL` optionally selects a server-side GraphQL endpoint.

After deployment, check the HTML source for `og:image` and `rel=canonical`, and open `https://mnhospital.uz/robots.txt` and `https://mnhospital.uz/sitemap.xml`. In Google Search Console, verify ownership of the `mnhospital.uz` domain, submit the sitemap URL, inspect the home page and representative service, doctor and article URLs, then monitor indexing and Core Web Vitals. Search ranking is not guaranteed by metadata or a sitemap; useful original content, accurate clinic details, backlinks and site performance remain important. Add a verified street address and phone only when the business can substantiate them; do not fabricate local-business structured data.
