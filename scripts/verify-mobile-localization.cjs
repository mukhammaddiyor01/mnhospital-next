const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
  path.join(root, 'apps/mobile/src/features/localization/localizationModel.ts'),
  'utf8',
);
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const localization = {};
new Function('exports', output)(localization);

const { languageOptions, translate } = localization;
const keys = [
  'language.label', 'home.title', 'home.description', 'home.services', 'home.servicesHint',
  'services.listLabel', 'services.home', 'services.homeHint', 'services.title',
  'services.subtitle', 'services.empty', 'services.loading', 'services.retry',
  'services.loadMore', 'services.configurationError', 'services.unavailable',
];

let checks = 0;
assert.deepEqual(languageOptions.map(({ code }) => code), ['en', 'ko', 'uz']);
checks += 1;
for (const { code } of languageOptions) {
  for (const key of keys) {
    assert.ok(translate(code, key).trim(), `${code}.${key} must not be empty`);
    checks += 1;
  }
}
assert.equal(translate('ko', 'services.title'), '진료 서비스');
assert.equal(translate('uz', 'services.retry'), 'Qayta urinish');
checks += 2;

console.log(`MOBILE_LOCALIZATION_VERIFIED ${checks} checks`);
