// Read-only checks against a running production Next.js server and its public API.
const assert = require('node:assert/strict');
const base = process.env.SEO_VERIFY_BASE_URL || 'http://localhost:4202';
let checks = 0;
const representativePaths = [];
const check = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
const decode = text => text.replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
	.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

async function page(path, status, indexable) {
	const response = await fetch(`${base}${path}`);
	check(response.status, status);
	const html = await response.text();
	const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
	check((head.match(/<title\b/g) || []).length, 1);
	check((head.match(/name="description"/g) || []).length, 1);
	check((head.match(/name="robots"/g) || []).length, 1);
	check(head.includes(indexable ? 'content="index, follow"' : 'content="noindex, nofollow"'), true);
	check((head.match(/rel="canonical"/g) || []).length, indexable ? 1 : 0);
	if (indexable) {
		check(head.includes('property="og:image"'), true);
		check(head.includes('name="twitter:card"'), true);
	}
	return html;
}

(async () => {
	await page('/', 200, true);
	for (const kind of ['service', 'doctor', 'article']) {
		const html = await page(`/${kind}`, 200, true);
		const nextData = JSON.parse(html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]);
		const item = nextData.props.pageProps.initialCatalog?.list[0];
		assert(item, `${kind} catalog must contain a public record to verify its detail page`);
		const title = kind === 'service' ? item.serviceTitle || item.serviceName
			: kind === 'doctor' ? item.docFullName || item.docNick : item.articleTitle;
		const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
		check(decode(body).includes(title), true);
		check(body.includes(`href="/${kind}/${item._id}"`), true);
		const detail = await page(`/${kind}/${item._id}`, 200, true);
		representativePaths.push(`/${kind}/${item._id}`);
		const h1 = detail.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]*>/g, '');
		check(decode(h1), title);
		const upper = await page(`/${kind}/${item._id.toUpperCase()}`, 200, true);
		check(decode(upper.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]*>/g, '')), title);
		check(upper.includes(`rel="canonical" href="https://mnhospital.uz/${kind}/${item._id}"`), true);
		await page(`/${kind}/invalid-id`, 404, false);
		await page(`/${kind}/000000000000000000000000`, 404, false);
	}
	for (const path of ['/account/signin', '/mypage/reports', '/admin/patients', '/doctor-workspace/reports',
		'/receptionist-workspace/payments', '/appointment', '/booking/000000000000000000000001/payment',
		'/patient/000000000000000000000001', '/service/general-medicine']) await page(path, 200, false);
	await page('/unknown-page', 404, false);
	const sitemapResponse = await fetch(`${base}/sitemap.xml`);
	check(sitemapResponse.status, 200);
	check(sitemapResponse.headers.get('content-type'), 'application/xml; charset=utf-8');
	const xml = await sitemapResponse.text();
	const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
	check(urls.length >= 8, true);
	check(new Set(urls).size, urls.length);
	for (const path of representativePaths) check(urls.some(url => new URL(url).pathname === path), true);
	check(sitemapResponse.headers.get('cache-control').includes('s-maxage=3600'), true);
	check(urls.some(url => /\/(admin|account|mypage|patient|booking|appointment|doctor-workspace|receptionist-workspace)(\/|$)/.test(url)), false);
	const robotsResponse = await fetch(`${base}/robots.txt`);
	check(robotsResponse.status, 200);
	check(robotsResponse.headers.get('content-type'), 'text/plain; charset=utf-8');
	const robots = await robotsResponse.text();
	check(robots.includes(`Sitemap: ${new URL(urls[0]).origin}/sitemap.xml`), true);
	console.log(`${checks} HTTP SEO checks passed; ${urls.length} public sitemap URLs. Detail headings and directory links are present before JavaScript runs.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
