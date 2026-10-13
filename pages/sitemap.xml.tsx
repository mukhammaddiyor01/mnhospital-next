import type { GetServerSideProps } from 'next';
import { publicSitemap } from '@/libs/seo/sitemap';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	const { xml, complete } = await publicSitemap();
	res.setHeader('Content-Type', 'application/xml; charset=utf-8');
	res.setHeader('Cache-Control', complete
		? 'public, s-maxage=3600, stale-while-revalidate=86400'
		: 'public, s-maxage=60, stale-while-revalidate=60');
	res.write(xml);
	res.end();
	return { props: {} };
};

export default function Sitemap() { return null; }
