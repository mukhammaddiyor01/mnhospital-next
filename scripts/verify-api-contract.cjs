const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const apiRoot = path.resolve(process.argv[2]);
const apiRequire = createRequire(path.join(apiRoot, 'package.json'));
apiRequire('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs', moduleResolution: 'node', jsx: 'react' } });
apiRequire('tsconfig-paths').register({ baseUrl: process.cwd(), paths: { '@/*': ['./*'] } });
const { getIntrospectionQuery, buildClientSchema, validate } = require('graphql');
function files(directory) {
 return fs.readdirSync(directory, {withFileTypes:true}).flatMap(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
}
(async () => {
 const response = await fetch(process.argv[3] || 'http://localhost:2001/graphql', {method:'POST', headers:{'Content-Type':'application/json','Apollo-Require-Preflight':'true'}, body:JSON.stringify({query:getIntrospectionQuery()})});
 const body = await response.json();
 if(!response.ok || body.errors) throw new Error('The API schema could not be read');
 const schema = buildClientSchema(body.data);
 let checked=0, failed=0;
 for(const file of files(path.resolve('apollo')).filter(file=>file.endsWith('.ts'))) {
  const source=fs.readFileSync(file,'utf8');
  if(!/gql\s*`|operation\(/.test(source)) continue;
  for(const [name,document] of Object.entries(require(file))) {
   if(document?.kind!=='Document')continue;
   checked++;
   const errors=validate(schema,document);
   if(errors.length){failed++;console.error(path.relative(process.cwd(),file),name,errors.map(error=>error.message).join('; '));}
  }
 }
 console.log(`${checked} frontend GraphQL operations checked; ${failed} invalid contracts.`);
 process.exitCode=failed?1:0;
})().catch(error=>{console.error(error.message);process.exitCode=1;});
