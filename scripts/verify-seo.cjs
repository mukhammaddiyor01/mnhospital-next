const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
	return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
for (const ext of ['.ts', '.tsx']) Module._extensions[ext] = (module, filename) => module._compile(
	ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
		module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
		jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
	} }).outputText, filename,
);

const { gql } = require('@apollo/client');
const { canonicalPath, isIndexablePath, sitemapPaths } = require('../libs/seo/site.ts');
const { publicDetailProps, publicCatalogProps } = require('../libs/seo/server.ts');
const { publicSitemap } = require('../libs/seo/sitemap.ts');
const { getServerSideProps: robots } = require('../pages/robots.txt.tsx');
const id = '000000000000000000000001';
const query = gql`query PublicDetail($serviceId:String!){getService(serviceId:$serviceId){_id serviceTitle serviceDesc}}`;
const calls = [];
let responder;
global.fetch = async (url, options) => {
	const body = JSON.parse(options.body);
	calls.push({ url, options, body });
	return { ok: true, json: async () => responder(body) };
};
const response = () => ({ statusCode: 200, headers: {}, text: '',
	setHeader(key, value) { this.headers[key] = value; },
	write(value) { this.text += value; }, end() {},
});
let checks = 0;
const check = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };

(async () => {
	for (const page of sitemapPaths) check(isIndexablePath(page), true);
	for (const page of ['/admin/patients', '/doctor-workspace/reports', '/receptionist-workspace/payments',
		'/account/signin', '/account/oauth/callback', '/mypage/reports', `/patient/${id}`, '/appointment',
		`/booking/${id}/payment`, '/404', '/_error', '/service/general-medicine']) check(isIndexablePath(page), false);
	check(canonicalPath(`/service/${id}/?tracking=example#details`), `/service/${id}`);
	check(canonicalPath('/service/ABCDEF000000000000000001'), '/service/abcdef000000000000000001');
	for (const kind of ['service', 'doctor', 'article']) check(isIndexablePath(`/${kind}/${id}`), true);
	check(await publicDetailProps('service', 'invalid', query, response()), { notFound: true });
	check(calls.length, 0);
	responder = () => ({ data: { getService: { _id: id, serviceTitle: 'Dentistry', serviceDesc: '<p>Public care details.</p>' } } });
	const detail = await publicDetailProps('service', id, query, response());
	check(detail.props.initialDetail.serviceTitle, 'Dentistry');
	check(detail.props.seo.title, 'Dentistry | MN Hospital');
	check(detail.props.seo.description, 'Public care details.');
	check(calls[0].body.variables, { serviceId: id });
	check(calls[0].options.headers.Authorization, undefined);
	check(calls[0].options.headers.Cookie, undefined);
	check(calls[0].options.credentials, undefined);
	responder = () => ({ data: { getService: null } });
	check(await publicDetailProps('service', id, query, response()), { notFound: true });
	responder = () => ({ errors: [{ message: 'No data is found!' }] });
	check(await publicDetailProps('service', id, query, response()), { notFound: true });
	for (const failure of [() => { throw new Error('offline'); }, () => ({ errors: [{ message: 'Database unavailable' }] })]) {
		responder = failure;
		const res = response();
		check(await publicDetailProps('service', id, query, res), { props: { initialDetail: null, seo: null } });
		check(res.statusCode, 503);
		check(res.headers['Retry-After'], '60');
	}
	responder = () => ({ data: { getServices: { list: [], metaCounter: [] } } });
	check((await publicCatalogProps(query, 'getServices', { page: 1, limit: 6 }, response())).initialCatalog.list, []);
	const ids = Array.from({ length: 100 }, (_, index) => (index + 1).toString(16).padStart(24, '0'));
	const pages = [];
	responder = ({ query: text, variables }) => {
		const field = text.includes('getServices') ? 'getServices' : text.includes('getDoctors') ? 'getDoctors' : 'getArticles';
		pages.push([field, variables.input.page]);
		return { data: { [field]: { list: field === 'getServices' ? ids.map(_id => ({ _id })) : [], metaCounter: [{ total: field === 'getServices' ? 100 : 0 }] } } };
	};
	const full = await publicSitemap();
	check(full.complete, true);
	check(calls.find(call => call.body.query.includes('getDoctors')).body.variables.input.sort, 'CREATED_AT');
	check(pages.filter(([field]) => field === 'getServices'), [['getServices', 1]]);
	check((full.xml.match(/<url>/g) || []).length, sitemapPaths.length + 100);
	check(full.xml.includes('/mypage'), false);
	responder = ({ query: text, variables }) => {
		const field = text.includes('getServices') ? 'getServices' : text.includes('getDoctors') ? 'getDoctors' : 'getArticles';
		if (field === 'getServices' && variables.input.page === 2) throw new Error('second page offline');
		return { data: { [field]: { list: field === 'getServices' ? ids.map(_id => ({ _id })) : [], metaCounter: [{ total: field === 'getServices' ? 101 : 0 }] } } };
	};
	const partial = await publicSitemap();
	check(partial.complete, false);
	check((partial.xml.match(/<url>/g) || []).length, sitemapPaths.length + 100);
	responder = () => { throw new Error('offline'); };
	const unavailable = await publicSitemap();
	check(unavailable.complete, false);
	check((unavailable.xml.match(/<url>/g) || []).length, sitemapPaths.length);
	const res = response();
	await robots({ res });
	check(res.headers['Content-Type'], 'text/plain; charset=utf-8');
	check(res.text.includes('Sitemap: https://mnhospital.uz/sitemap.xml'), true);
	check(res.text.includes('Disallow:'), false);
	console.log(`${checks} SEO checks passed`);
})().catch(error => { console.error(error); process.exitCode = 1; });
