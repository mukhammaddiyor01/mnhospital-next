const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const viewModel = fs.readFileSync(
  path.join(root, 'apps/mobile/src/features/services/useServicesViewModel.ts'),
  'utf8',
);
const screen = fs.readFileSync(
  path.join(root, 'apps/mobile/src/features/services/ServicesScreen.tsx'),
  'utf8',
);

assert.match(viewModel, /const \[refreshing, setRefreshing\] = useState\(false\)/);
assert.match(viewModel, /if \(loading \|\| requestingReload\.current\) return/);
assert.match(viewModel, /setPage\(1\)/);
assert.match(viewModel, /setRevision\(\(value\) => value \+ 1\)/);
assert.match(viewModel, /requestingReload\.current = false/);
assert.match(viewModel, /setRefreshing\(false\)/);
assert.match(screen, /onRefresh=\{refresh\}/);
assert.match(screen, /refreshing=\{refreshing\}/);
assert.match(screen, /loading && !refreshing/);

console.log('MOBILE_SERVICE_REFRESH_VERIFIED 9 checks');
