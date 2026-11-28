const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const home = fs.readFileSync(
  path.join(root, 'apps/mobile/src/features/home/HomeScreen.tsx'),
  'utf8',
);
const services = fs.readFileSync(
  path.join(root, 'apps/mobile/src/features/services/ServicesScreen.tsx'),
  'utf8',
);

let checks = 0;

function includes(source, value, message) {
  assert.ok(source.includes(value), message);
  checks += 1;
}

includes(home, 'accessibilityRole="header"', 'The welcome title must remain a screen-reader heading');
includes(home, 'accessibilityRole="link"', 'The services navigation must remain identifiable as a link');
includes(home, 'accessibilityHint=', 'The services navigation must explain its destination');
includes(home, 'minHeight: 44', 'The welcome action must keep a 44-point touch target');

includes(services, "accessibilityLabel={t('services.listLabel')}", 'The services list must keep its localized label');
includes(services, 'accessibilityState={{ busy: loading }}', 'The services list must expose loading state');
includes(services, 'accessibilityLiveRegion="polite"', 'The empty state must be announced');
includes(services, 'accessibilityRole="alert"', 'The error state must remain an alert');
includes(services, 'accessibilityRole="button"', 'Service actions must remain identifiable as buttons');
assert.ok(
  services.match(/accessibilityRole="header"/g)?.length >= 2,
  'The screen title and service titles must remain headings',
);
checks += 1;
assert.ok(
  services.match(/minHeight: 44/g)?.length >= 2,
  'Back and action controls must keep 44-point touch targets',
);
checks += 1;

console.log(`MOBILE_ACCESSIBILITY_VERIFIED ${checks} checks`);
