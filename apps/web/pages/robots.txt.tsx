import type { GetServerSideProps } from 'next';
import { SITE_URL } from '@/libs/seo/site';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	// Allow crawlers to read noindex on private/error pages; do not block assets.
	res.setHeader('Content-Type', 'text/plain; charset=utf-8');
	res.setHeader('Cache-Control', 'public, s-maxage=3600');
	res.write(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
	res.end();
	return { props: {} };
};

export default function Robots() { return null; }
