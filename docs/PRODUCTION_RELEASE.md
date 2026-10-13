# Production release and HTTPS

## Current boundary
The public HTTP IP cannot carry the production Secure refresh cookie. Reloading an unexpired access token is supported; renewing an expired session requires HTTPS. Do not disable Secure, HttpOnly, role/session checks or cookie rotation. This repository change does not install TLS on the remote server.

Use an owned domain pointing to 76.13.242.85. Open 80/443 for Caddy. The existing frontend/API listen on 2002/2001. After verified HTTPS, restrict those direct ports to trusted/local access. The proxy retains GraphQL uploads, backend assets and WebSocket upgrades under `/backend`, with GraphQL at `/graphql` so the existing refresh-cookie path remains valid.

## Configuration
Copy `.env.example` to `.env`; transfer existing public OAuth IDs, API URLs and verified phone. Keep private provider keys exclusively on the backend. Compose reads `.env`; Next's old `.env.local` is excluded from Docker builds. Public values are compiled at build time, so changing them requires rebuilding.

For the existing HTTP preview:
```ini
NEXT_PUBLIC_API_URL=http://76.13.242.85:2001
NEXT_PUBLIC_API_GRAPHQL_URL=http://76.13.242.85:2001/graphql
NEXT_PUBLIC_CLINIC_TIME_ZONE=Asia/Seoul
NEXT_PUBLIC_CLINIC_CURRENCY=KRW
```
For TLS replace `your-domain.example` with your domain:
```ini
MN_DOMAIN=your-domain.example
NEXT_PUBLIC_API_URL=https://your-domain.example/backend
NEXT_PUBLIC_API_GRAPHQL_URL=https://your-domain.example/graphql
```
Backend `.env`: set `CLIENT_URL=https://your-domain.example` and `AUTH_ALLOWED_ORIGINS=https://your-domain.example`. Recreate the API container after changes. Update Google/Naver/Kakao authorized origin and redirect URI to their actual application callback URLs on this domain; keep the existing provider callback routes.

## Build, verify, deploy
Requires Docker Compose v2. Keep the previous release image for rollback. This frontend now builds once into an image, runs as a non-root user and does not install packages or rebuild during restart. `package-lock.json` and `npm ci` are canonical; the legacy Yarn lock is not used by Docker/CI. Base Node/Caddy tags should be pinned to reviewed image digests by your release operator for fully reproducible base layers.

```bash
cd ~/MITA2/mnhospital-project/mnhospital-next
# Preserve local environment files and any uncommitted changes before pulling.
git pull --ff-only origin master
export MN_RELEASE_SHA="$(git rev-parse HEAD)"
docker compose --env-file .env build mnhospital-next
docker compose --env-file .env up -d --no-deps mnhospital-next
docker compose ps
docker compose logs --tail=50 mnhospital-next
curl --fail http://127.0.0.1:2002/api/health
```
The returned release must match the exported SHA. Health checks cover the frontend process, not database/API reachability. The `up` command follows a successful build; do not combine operations without checking failures.

Enable the prepared TLS proxy only after DNS and configuration are ready:
```bash
docker compose --env-file .env -f deploy/compose.https.yml up -d
curl --fail https://your-domain.example/api/health
```
Caddy mounts its config relative to `deploy/compose.https.yml`; certificate data persists in named volumes. Confirm API requests use HTTPS, uploads resolve, chat reconnects, and each role can sign in, reload and refresh after access expiry. Confirm logout clears the appointment selection while reload retains the session. Use test bookings; do not pay or change real appointments during smoke checks.

## Rollback
Before deploying, record the old SHA and keep its image. Change the environment's `MN_RELEASE_SHA` to the old image tag, then `docker compose --env-file .env up -d --no-deps --no-build mnhospital-next`. Do not run build for rollback. Frontend releases do not require database migrations. Backend releases and database backups are separate operations.

## Gates
CI runs TypeScript, auth/session races, booking submit/draft reset, contrast, credential-file checks, production dependency audit and build. Manual smoke checks cover public browsing, patient booking, role workspaces and payment sandbox. `/api/health` exposes only the service and commit SHA. HTTPS and actual payment-provider readiness remain deployment checks, not claims inferred from a passing frontend build.
