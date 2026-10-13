import type { GetServerSideProps } from 'next';
import { publicGraphql } from '@/libs/seo/server';
import { SITE_URL, sitemapPaths } from '@/libs/seo/site';

const collections = [
	{ field: 'getServices', path: '/service', query: 'query SeoServices($input:ServicesInquiry!){getServices(input:$input){list{_id} metaCounter{total}}}' },
	{ field: 'getDoctors', path: '/doctor', query: 'query SeoDoctors($input:DoctorsInquiry!){getDoctors(input:$input){list{_id} metaCounter{total}}}' },
	{ field: 'getArticles', path: '/article', query: 'query SeoArticles($input:ArticlesInquiry!){getArticles(input:$input){list{_id} metaCounter{total}}}' },
] as const;

async function collectionPaths(collection: typeof collections[number]): Promise<string[]> {
	const paths: string[] = [];
	for (let page = 1; page <= 500 && paths.length < 50000; page++) {
		const data = await publicGraphql<Record<string, { list: Array<{ _id: string }>; metaCounter: { total: number } }>>(
			collection.query, { input: { page, limit: 100, search: {} } },
		);
		const result = data[collection.field];
		if (!result) break;
		paths.push(...result.list.filter((item) => /^[a-f\d]{24}$/i.test(item._id)).map((item) => `${collection.path}/${item._id}`));
		if (result.list.length < 100 || paths.length >= result.metaCounter.total) break;
	}
	return paths;
}

function escapeXml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	const dynamic = await Promise.all(collections.map(async (collection) => {
		try { return await collectionPaths(collection); } catch { return []; }
	}));
	const paths = [...new Set([...sitemapPaths, ...dynamic.flat()])];
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `<url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc></url>`).join('\n')}\n</urlset>`;
	res.setHeader('Content-Type', 'application/xml; charset=utf-8');
	res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
	res.write(xml);
	res.end();
	return { props: {} };
};

export default function Sitemap() { return null; }
