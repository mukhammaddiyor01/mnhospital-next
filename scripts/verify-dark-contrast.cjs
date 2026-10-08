// Check the delivered CSS token cascade, including role overrides, using
// relative luminance rather than judging contrast from palette swatches.
const assert = require('node:assert/strict');
const path = require('node:path');
const sass = require('sass');
const postcss = require('postcss');
const css = postcss.parse(sass.compile(path.join(__dirname, '../scss/app.scss'), {
  logger: { warn() {}, debug() {} },
}).css);

function palette(role) {
  const values = {};
  const scoped = {};
  css.walkRules(rule => {
    const selectors = rule.selectors.map(selector => selector.replace(/["']/g, ''));
    const applies = selectors.some(s => s === ':root' || s === "html[data-theme=dark]");
    if (applies) rule.nodes.forEach(node => {
      if (node.type === 'decl' && node.prop.startsWith('--')) values[node.prop] = node.value;
    });
    const priority = Math.max(0, ...selectors.map(s => {
      if (!role) return 0;
      if (s === `.clinical-staff-${role}` || s === '.clinical-staff-shell') return 1;
      if (s === `html[data-theme=dark] .clinical-staff-${role}` || s === "html[data-theme=dark] .clinical-staff-shell") return 2;
      return 0;
    }));
    if (priority) rule.nodes.forEach(node => {
      if (node.type === 'decl' && node.prop.startsWith('--') && priority >= (scoped[node.prop]?.priority || 0)) {
        scoped[node.prop] = { value: node.value, priority };
      }
    });
  });
  Object.entries(scoped).forEach(([name, entry]) => { values[name] = entry.value; });
  const resolve = (value, seen = new Set()) => {
    const variable = value.match(/^var\((--[\w-]+)\)$/)?.[1];
    if (!variable) return value;
    assert(!seen.has(variable), `Circular color token: ${variable}`);
    assert(values[variable], `Missing color token: ${variable}`);
    return resolve(values[variable], new Set([...seen, variable]));
  };
  return name => resolve(values[name] || name);
}

function luminance(hex) {
  if (/^#[0-9a-f]{3}$/i.test(hex)) hex = '#' + hex.slice(1).split('').map(x => x + x).join('');
  assert.match(hex, /^#[0-9a-f]{6}$/i);
  return hex.slice(1).match(/../g).map(channel => {
    const v = parseInt(channel, 16) / 255;
    return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
  }).reduce((total, v, i) => total + v * [.2126, .7152, .0722][i], 0);
}
function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}

const pairs = [
  ['Body on canvas', '--clinical-text', '--clinical-surface', 4.5],
  ['Body on card', '--clinical-text', '--mn-card', 4.5],
  ['Heading on feature', '--clinical-navy', '--clinical-feature-surface', 4.5],
  ['Supporting text on card', '--clinical-secondary', '--mn-card', 4.5],
  ['Placeholder on input', '--clinical-muted', '--clinical-low', 4.5],
  ['Text link on card', '--clinical-primary', '--mn-card', 4.5],
  ['Selected navigation', '--clinical-primary', '--clinical-primary-soft', 4.5],
  ['Primary action', '--clinical-on-fill', '--clinical-primary-fill', 4.5],
  ['Primary action hover', '--clinical-on-fill', '--clinical-primary-fill-hover', 4.5],
  ['Error text on card', '--clinical-danger', '--mn-card', 4.5],
  ['Error banner', '--clinical-danger', '--clinical-danger-soft', 4.5],
  ['Completed status', '--clinical-teal', '--clinical-teal-soft', 4.5],
  ['Warning status', '--clinical-warning', '--clinical-warning-soft', 4.5],
  ['Form boundary', '--clinical-control-line', '--clinical-low', 3],
  ['Form boundary on card', '--clinical-control-line', '--mn-card', 3],
  ['Focus ring', '--clinical-primary', '--clinical-low', 3],
];
let checks = 0;
for (const role of ['', 'doctor', 'receptionist', 'admin']) {
  const color = palette(role);
  for (const [name, fg, bg, min] of pairs) {
    const ratio = contrast(color(fg), color(bg));
    assert(ratio >= min, `${role || 'public'}: ${name} is ${ratio.toFixed(2)}:1; needs ${min}:1`);
    checks++;
  }
  if (role) {
    const ratio = contrast(color('--clinical-on-accent'), color('--staff-accent'));
    assert(ratio >= 4.5, `${role}: text on role action is ${ratio.toFixed(2)}:1`);
    const cancelRatio = contrast(color('--staff-accent'), color('--clinical-low'));
    assert(cancelRatio >= 4.5, `${role}: secondary role action is ${cancelRatio.toFixed(2)}:1`);
    checks += 2;
  }
}
console.log(`${checks} dark-theme contrast checks passed across public, doctor, receptionist and admin palettes.`);
