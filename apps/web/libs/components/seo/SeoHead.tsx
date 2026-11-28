import Head from 'next/head';
import { canonicalPath, isIndexablePath, SeoMeta, seoForPath, SITE_URL, SOCIAL_IMAGE } from '@/libs/seo/site';

export default function SeoHead({ asPath, meta }: { asPath: string; meta?: SeoMeta | null }) {
	const path = canonicalPath(asPath);
	const page = seoForPath(path, meta);
	const indexable = isIndexablePath(path);
	const url = `${SITE_URL}${path}`;
	const organization = {
		'@context': 'https://schema.org',
		'@type': 'MedicalOrganization',
		name: 'MN Hospital',
		url: SITE_URL,
		logo: `${SITE_URL}/img/mn-logo-mark.png`,
	};
	return <Head>
		<title key="title">{page.title}</title>
		<meta name="description" content={page.description} key="description" />
		<meta name="viewport" content="width=device-width, initial-scale=1" key="viewport" />
		<meta name="robots" content={indexable ? 'index, follow' : 'noindex, nofollow'} key="robots" />
		{indexable && <link rel="canonical" href={url} key="canonical" />}
		<meta property="og:type" content="website" key="og:type" />
		<meta property="og:site_name" content="MN Hospital" key="og:site_name" />
		<meta property="og:title" content={page.title} key="og:title" />
		<meta property="og:description" content={page.description} key="og:description" />
		<meta property="og:url" content={url} key="og:url" />
		<meta property="og:image" content={SOCIAL_IMAGE} key="og:image" />
		<meta property="og:image:width" content="1672" key="og:image:width" />
		<meta property="og:image:height" content="941" key="og:image:height" />
		<meta property="og:image:alt" content="A doctor speaking with a patient in a bright clinic" key="og:image:alt" />
		<meta name="twitter:card" content="summary_large_image" key="twitter:card" />
		<meta name="twitter:title" content={page.title} key="twitter:title" />
		<meta name="twitter:description" content={page.description} key="twitter:description" />
		<meta name="twitter:image" content={SOCIAL_IMAGE} key="twitter:image" />
		<link rel="icon" type="image/png" href="/favicon.png" key="favicon" />
		{path === '/' && <script key="organization-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, '\\u003c') }} />}
	</Head>;
}
