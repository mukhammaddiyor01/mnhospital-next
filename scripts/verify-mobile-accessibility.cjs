const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const src = path.resolve(__dirname, '../apps/mobile/src');
const read = (file) => fs.readFileSync(path.join(src, file), 'utf8');
const ui = read('ui/components.tsx');
const home = read('features/home/HomeScreen.tsx');

for (const value of [
  'accessibilityRole="header"', 'accessibilityRole="link"', 'accessibilityRole="button"',
  'accessibilityRole="alert"', 'accessibilityLiveRegion="polite"', 'accessibilityHint={hint}',
  'accessibilityState={{ busy: loading || refreshing }}', 'accessibilityLabel={label}',
]) assert.ok(ui.includes(value), `ui/components must keep ${value}`);
assert.ok(ui.match(/minHeight: 44/g)?.length >= 2, 'Buttons and cards must keep 44-point targets');
assert.ok(home.includes('accessibilityRole="header"') && home.includes('accessibilityRole="link"'));
assert.ok(home.includes('minHeight: 44'), 'Home links must keep a 44-point target');

console.log('MOBILE_ACCESSIBILITY_VERIFIED');
