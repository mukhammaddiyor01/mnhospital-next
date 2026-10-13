import { publicGraphql } from './server';
import { SITE_URL, sitemapPaths } from './site';

const maxUrls = 50000;
const collections = [
	{ field: 'getServices', path: '/service', sort: 'createdAt', query: 'query SeoServices($input:ServicesInquiry!){getServices(input:$input){list{_id} metaCounter{total}}}' },
	{ field: 'getDoctors', path: '/doctor', sort: 'CREATED_AT', query: 'query SeoDoctors($input:DoctorsInquiry!){getDoctors(input:$input){list{_id} metaCounter{total}}}' },
	{ field: 'getArticles', path: '/article', sort: 'createdAt', query: 'query SeoArticles($input:ArticlesInquiry!){getArticles(input:$input){list{_id} metaCounter{total}}}' },
] as const;

async function collectionPaths(collection: typeof collections[number]) {
	const paths: string[] = [];
	try {
		for (let page = 1; page <= maxUrls / 100; page++) {
			const data = await publicGraphql<Record<string, { list: Array<{ _id: string }>; metaCounter: Array<{ total: number }> }>>(
				collection.query, { input: { page, limit: 100, sort: collection.sort, direction: 'ASC', search: {} } },
			);
			const result = data[collection.field];
			if (!result) throw new Error('Invalid public sitemap collection');
			paths.push(...result.list.filter(item => /^[a-f\d]{24}$/i.test(item._id)).map(item => `${collection.path}/${item._id}`));
			const total = result.metaCounter[0]?.total;
			if (result.list.length < 100 || (total !== undefined && page * 100 >= total)) return { paths, complete: true };
		}
	} catch {
		// Keep already collected public URLs during a later-page API outage.
	}
	return { paths, complete: false };
}

function escapeXml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function publicSitemap() {
	const results = await Promise.all(collections.map(collectionPaths));
	const paths = [...new Set([...sitemapPaths, ...results.flatMap(result => result.paths)])];
	const complete = results.every(result => result.complete) && paths.length <= maxUrls;
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.slice(0, maxUrls).map(path => `<url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc></url>`).join('\n')}\n</urlset>`;
	return { xml, complete };
}
