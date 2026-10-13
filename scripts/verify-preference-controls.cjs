const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const ts = require('typescript'), React = require('react');
let checks = 0;
for (const [name, setter, pointerValue, keyboardValue] of [
  ['ThemeControl', 'setTheme', 'DARK', 'LIGHT'],
  ['LanguageControl', 'setLanguage', 'UZ', 'KR'],
]) {
  const calls = [], refs = [];
  const exportsObject = {};
  const text = fs.readFileSync(path.join(__dirname, '../libs/components/preference', name + '.tsx'), 'utf8');
  const source = ts.transpileModule(text, {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const mockRequire = moduleName => {
    if (moduleName === 'react') return {...React,useRef:value=>{const ref={current:value};refs.push(ref);return ref;}};
    if (moduleName === 'react/jsx-runtime') return require(moduleName);
    if (moduleName.endsWith('PreferenceProvider')) return {usePreferences:()=>({theme:'LIGHT',language:'EN',saving:false,ready:true,[setter]:value=>calls.push(value)})};
    if (moduleName.endsWith('useTranslation')) return {useTranslation:()=>key=>key};
    return {};
  };
  new Function('require','exports',source)(mockRequire,exportsObject);
  function find(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'select') return node;
    return React.Children.toArray(node.props?.children).map(find).find(Boolean);
  }
  const select = find(exportsObject.default());
  let blurs = 0;
  select.props.onPointerDown();
  select.props.onChange({currentTarget:{blur(){blurs++;}},target:{value:pointerValue}});
  assert.equal(blurs,1,`${name}: pointer selection must dismiss retained focus`);checks++;
  assert.equal(calls[0],pointerValue);checks++;
  select.props.onKeyDown();
  select.props.onChange({currentTarget:{blur(){blurs++;}},target:{value:keyboardValue}});
  assert.equal(blurs,1,`${name}: keyboard selection must retain focus`);checks++;
  assert.equal(calls[1],keyboardValue);checks++;
}
console.log(`PREFERENCE_CONTROLS_VERIFIED ${checks} checks`);
