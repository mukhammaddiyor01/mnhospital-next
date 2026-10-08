const fs = require('fs'),
	path = require('path');
const root = path.resolve(__dirname, '..');
const backend = path.resolve(
	process.argv[3] || path.join(root, '../mnhospital/node_modules'),
);
const ts = require(root + '/node_modules/typescript');
const { buildSchema, parse, validate, specifiedRules, NoUnusedFragmentsRule } = require(
	root + '/node_modules/graphql',
);
const schema = buildSchema(
	fs.readFileSync(
		process.argv[2] || '/tmp/mn-workspace-schema.graphql',
		'utf8',
	),
);
require(backend + '/ts-node').register({
	transpileOnly: true,
	skipProject: true,
	compilerOptions: {
		module: 'commonjs',
		jsx: 'react-jsx',
		esModuleInterop: true,
		target: 'es2020',
	},
});
require(backend + '/tsconfig-paths').register({
	baseUrl: root,
	paths: { '@/*': ['./*'] },
});
let errors = 0,
	count = 0;
const operations = new Set();
function check(doc, file) {
	count++;
	for (const def of doc.definitions ?? []) {
		if (def.selectionSet)
			for (const field of def.selectionSet.selections)
				if (field.name) operations.add(field.name.value);
	}
	// Standalone reusable fragments have no operation until composed by Apollo.
	const rules = doc.definitions.every((definition) => definition.kind === 'FragmentDefinition')
		? specifiedRules.filter((rule) => rule !== NoUnusedFragmentsRule)
		: specifiedRules;
	for (const err of validate(schema, doc, rules)) {
		console.log(file + ': ' + err.message);
		errors++;
	}
}
function walk(dir) {
	return fs
		.readdirSync(dir, { withFileTypes: true })
		.flatMap((f) =>
			f.isDirectory()
				? walk(path.join(dir, f.name))
				: /\.tsx?$/.test(f.name)
					? [path.join(dir, f.name)]
					: [],
		);
}
// Check every literal document, plus generated resource definitions loaded below.
for (const file of [
	...walk(root + '/apollo'),
	...walk(root + '/pages'),
	...walk(root + '/libs/components'),
]) {
	const source = fs.readFileSync(file, 'utf8');
	const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
	function visit(node) {
		if (
			ts.isTaggedTemplateExpression(node) &&
			node.tag.getText(ast) === 'gql' &&
			ts.isNoSubstitutionTemplateLiteral(node.template)
		) {
			try {
				check(parse(node.template.text), path.relative(root, file));
			} catch (e) {
				console.log(file + ': ' + e.message);
				errors++;
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(ast);
}
const modules = [
	...walk(root + '/apollo')
		.map((file) => path.relative(root, file))
		.filter(
			(file) =>
				!['apollo/client.ts', 'apollo/store.ts', 'apollo/reactive.ts'].includes(
					file,
				),
		),
	'apollo/workspace/patientOperations.ts',
	'libs/components/workspace/contentResources.ts',
	'libs/components/workspace/adminResources.ts',
	'libs/components/workspace/doctorResources.ts',
];
function docs(value, file) {
	if (!value) return;
	if (value.kind === 'Document') return check(value, file);
	if (typeof value === 'object')
		for (const [key, v] of Object.entries(value))
			if (
				['create', 'update', 'remove', 'list'].includes(key) ||
				v?.kind === 'Document'
			)
				docs(v, file);
}
for (const file of modules) {
	for (const value of Object.values(require(root + '/' + file))) {
		if (typeof value === 'function') {
			try {
				docs(value('ADMIN'), file);
			} catch {}
		} else docs(value, file);
	}
}
// Statically evaluate operation helper calls including top-level local template constants.
for (const file of [
	...walk(root + '/pages'),
	...walk(root + '/libs/components'),
	...walk(root + '/apollo/workspace'),
]) {
	const source = fs.readFileSync(file, 'utf8');
	const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
	const values = {};
	let branch = true;
	function evaluate(n) {
		if (!n) return undefined;
		if (ts.isStringLiteralLike(n)) return n.text;
		if (n.kind === ts.SyntaxKind.NullKeyword) return null;
		if (ts.isIdentifier(n)) return values[n.text];
		if (ts.isConditionalExpression(n))
			return evaluate(branch ? n.whenTrue : n.whenFalse);
		if (ts.isTemplateExpression(n)) {
			let result = n.head.text;
			for (const span of n.templateSpans) {
				const v = evaluate(span.expression);
				if (v === undefined) return undefined;
				result += v + span.literal.text;
			}
			return result;
		}
		return undefined;
	}
	function collect(n) {
		if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) {
			const v = evaluate(n.initializer);
			if (v !== undefined) values[n.name.text] = v;
		}
		ts.forEachChild(n, collect);
	}
	collect(ast);
	function visit(n) {
		if (ts.isCallExpression(n) && n.expression.getText(ast) === 'operation') {
			const args = n.arguments.map(evaluate);
			if (args.slice(0, 4).every((x) => x !== undefined)) {
				try {
					const [kind, field, type, sel, arg = 'input'] = args;
					check(
						parse(
							`${kind} Audit${type ? `($${arg}:${type}!)` : ''}{${field}${type ? `(${arg}:$${arg})` : ''}{${sel}}}`,
						),
						path.relative(root, file),
					);
				} catch (e) {
					console.log(file + ': ' + e.message);
					errors++;
				}
			}
		}
		ts.forEachChild(n, visit);
	}
	visit(ast);
	branch = false;
	for (const key of Object.keys(values)) delete values[key];
	collect(ast);
	visit(ast);
}

const diagnostics = new Set(['checkAuth', 'checkAuthRoles']);
const coverage = ['query', 'mutation'].flatMap((kind) =>
	Object.keys(
		(kind === 'query'
			? schema.getQueryType()
			: schema.getMutationType()
		).getFields(),
	).map((field) => ({
		field,
		kind,
		frontendContract: operations.has(field),
		internalDiagnostic: diagnostics.has(field),
	})),
);
const missing = coverage.filter(
	(row) => !row.frontendContract && !row.internalDiagnostic,
);
for (const row of missing) {
	console.error('No frontend contract: ' + row.field);
	errors++;
}
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(
	path.join(root, 'docs/WORKSPACE_API_COVERAGE.json'),
	JSON.stringify(
		{
			businessOperations: coverage.filter((row) => !row.internalDiagnostic)
				.length,
			coveredBusinessOperations: coverage.filter(
				(row) => !row.internalDiagnostic && row.frontendContract,
			).length,
			operations: coverage,
		},
		null,
		2,
	) + '\n',
);
fs.writeFileSync(
	'/tmp/mn-frontend-operation-fields.json',
	JSON.stringify([...operations].sort(), null, 2),
);
console.log(
	`${count} documents checked, ${operations.size} API fields, ${errors} errors`,
);
process.exit(errors ? 1 : 0);
