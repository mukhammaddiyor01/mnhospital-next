const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const source = fs.readFileSync(
  path.resolve(__dirname, '../apps/mobile/src/features/localization/localizationModel.ts'),
  'utf8',
);
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const localization = {};
new Function('exports', output)(localization);

const { languageOptions, copyKeys, translate, enumLabel } = localization;
assert.deepEqual(languageOptions.map(({ code }) => code), ['en', 'ko', 'uz']);
for (const { code } of languageOptions) {
  for (const key of copyKeys) assert.ok(translate(code, key)?.trim(), `${code}.${key} must not be empty`);
}
assert.equal(translate('ko', 'tabs.services'), '진료 서비스');
assert.equal(translate('uz', 'common.retry'), 'Qayta urinish');
assert.equal(enumLabel('uz', 'CARDIOLOGIST'), 'Kardiolog');
assert.equal(enumLabel('en', 'NEW_VALUE'), 'NEW VALUE');

console.log(`MOBILE_LOCALIZATION_VERIFIED ${copyKeys.length} keys`);
