import { SeoMeta } from './site';

const graphqlUrl = process.env.SEO_API_GRAPHQL_URL || process.env.NEXT_PUBLIC_API_GRAPHQL_URL || 'https://mnhospital.uz/graphql';

export async function publicGraphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 4000);
	try {
		const response = await fetch(graphqlUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Apollo-Require-Preflight': 'true' },
			body: JSON.stringify({ query, variables }),
			signal: controller.signal,
		});
		if (!response.ok) throw new Error('Public catalog request failed');
		const payload = await response.json() as { data?: T; errors?: unknown[] };
		if (!payload.data || payload.errors?.length) throw new Error('Public catalog response failed');
		return payload.data;
	} finally {
		clearTimeout(timeout);
	}
}

function cleanText(value: string | null | undefined): string {
	return (value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 170);
}

export async function detailSeo(kind: 'service' | 'doctor' | 'article', id: string): Promise<SeoMeta | undefined> {
	if (!/^[a-f\d]{24}$/i.test(id)) return undefined;
	const definitions = {
		service: { query: 'query SeoService($id:String!){getService(serviceId:$id){serviceTitle serviceName serviceDesc}}', field: 'getService' },
		doctor: { query: 'query SeoDoctor($id:String!){getDoctor(doctorId:$id){docFullName docNick docDesc}}', field: 'getDoctor' },
		article: { query: 'query SeoArticle($id:String!){getArticle(articleId:$id){articleTitle articleContent}}', field: 'getArticle' },
	} as const;
	const definition = definitions[kind];
	try {
		const data = await publicGraphql<Record<string, Record<string, string> | null>>(definition.query, { id });
		const item = data[definition.field];
		if (!item) return undefined;
		if (kind === 'service') return {
			title: `${cleanText(item.serviceTitle || item.serviceName)} | MN Hospital`,
			description: cleanText(item.serviceDesc) || 'Explore this MN Hospital service, its doctor, price and available appointments.',
		};
		if (kind === 'doctor') return {
			title: `${cleanText(item.docFullName || item.docNick)} | MN Hospital Doctor`,
			description: cleanText(item.docDesc) || 'Meet this MN Hospital doctor and explore their services and appointments.',
		};
		return {
			title: `${cleanText(item.articleTitle)} | MN Hospital`,
			description: cleanText(item.articleContent) || 'Read this health article from MN Hospital.',
		};
	} catch {
		// Keep the public page usable when the catalog API is temporarily unavailable.
		return undefined;
	}
}
