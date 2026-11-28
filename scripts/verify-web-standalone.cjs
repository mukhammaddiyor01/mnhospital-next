const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

let checks = 0;
const check = (condition, message) => {
  assert.ok(condition, message);
  checks++;
};

const rootPackage = JSON.parse(read('package.json'));
const webPackage = JSON.parse(read('apps/web/package.json'));
const dockerfile = read('Dockerfile');
const nextConfig = read('apps/web/next.config.js');

check(rootPackage.workspaces.includes('apps/web'), 'The web workspace is registered at the repository root');
check(rootPackage.scripts.build.includes('@mnhospital/web'), 'Root build delegates to the web workspace');
check(webPackage.name === '@mnhospital/web', 'The web workspace has a stable package name');
check(exists('apps/web/pages'), 'Pages Router source lives in the web workspace');
check(exists('apps/web/public'), 'Public assets live in the web workspace');
check(nextConfig.includes("outputFileTracingRoot: path.join(__dirname, '../..')"), 'Next traces dependencies from the monorepo root');
check(dockerfile.includes('COPY apps/web/package.json apps/web/package.json'), 'Docker installs the web workspace manifest before dependencies');
check(dockerfile.includes('/app/apps/web/.next/standalone ./'), 'Docker copies the relocated standalone output');
check(dockerfile.includes('CMD ["node", "apps/web/server.js"]'), 'Docker starts the relocated standalone server');
check(exists('apps/web/.next/standalone/apps/web/server.js'), 'The web build produced the expected standalone server');
check(exists('apps/web/.next/static'), 'The web build produced static assets for Docker');

console.log(`WEB_STANDALONE_VERIFIED ${checks} checks`);
