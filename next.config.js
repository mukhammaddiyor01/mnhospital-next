const { execFileSync } = require('node:child_process');
let releaseSha = process.env.MN_RELEASE_SHA || 'unknown';
if (releaseSha === 'unknown') {
  try { releaseSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch {}
}
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  env: { MN_RELEASE_SHA: releaseSha },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
      { key: 'Content-Security-Policy', value: "object-src 'none'; base-uri 'self'; frame-ancestors 'self'" },
    ] }];
  },
  images: { remotePatterns: [
    { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/aida-public/**' },
  ] },
};
module.exports = nextConfig;
