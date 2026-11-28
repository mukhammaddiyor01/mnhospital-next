import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { print, type DocumentNode } from 'graphql';
import { SeoMeta, seoForPath } from './site';
import { catalogText } from '../i18n/catalog';

const graphqlUrl = process.env.SEO_API_GRAPHQL_URL || process.env.NEXT_PUBLIC_API_GRAPHQL_URL || 'https://mnhospital.uz/graphql';

type PublicGraphqlError = { message?: string };
class CatalogResponseError extends Error {
	constructor(readonly errors: PublicGraphqlError[]) {
		super('Public catalog response failed');
	}
}

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
		const payload = await response.json() as { data?: T; errors?: PublicGraphqlError[] };
		if (payload.errors?.length) throw new CatalogResponseError(payload.errors);
		if (!payload.data) throw new Error('Public catalog response failed');
		return payload.data;
	} finally {
		clearTimeout(timeout);
	}
}

function cleanText(value: string | null | undefined): string {
	return (value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 170);
}

type DetailKind = 'service' | 'doctor' | 'article';
type DetailText = {
	serviceTitle?: string; serviceName?: string; serviceDesc?: string;
	docFullName?: string; docNick?: string; docDesc?: string;
	articleTitle?: string; articleContent?: string;
};

export type PublicDetailProps<T> = { seo: SeoMeta | null; initialDetail: T | null };

export type PublicCatalogProps<T> = { initialCatalog: T | null; initialInquiryKey: string };

export async function publicCatalogProps<T>(
	query: DocumentNode, field: string, input: Record<string, unknown>, res: GetServerSidePropsContext['res'],
): Promise<PublicCatalogProps<T>> {
	try {
		const data = await publicGraphql<Record<string, T>>(print(query), { input });
		if (!data[field]) throw new Error('Invalid public catalog response');
		return { initialCatalog: data[field], initialInquiryKey: JSON.stringify(input) };
	} catch {
		temporarilyUnavailable(res);
		return { initialCatalog: null, initialInquiryKey: JSON.stringify(input) };
	}
}

function detailMetadata(kind: DetailKind, item: DetailText): SeoMeta {
	const fallback = seoForPath(`/${kind}/detail`);
	const title = kind === 'service' ? catalogText(item.serviceTitle || item.serviceName, 'EN')
		: kind === 'doctor' ? item.docFullName || item.docNick : item.articleTitle;
	const description = kind === 'service' ? catalogText(item.serviceDesc, 'EN')
		: kind === 'doctor' ? item.docDesc : item.articleContent;
	return {
		title: cleanText(title) ? `${cleanText(title)} | MN Hospital${kind === 'doctor' ? ' Doctor' : ''}` : fallback.title,
		description: cleanText(description) || fallback.description,
	};
}

function temporarilyUnavailable(res: GetServerSidePropsContext['res']) {
	res.statusCode = 503;
	res.setHeader('Retry-After', '60');
}

// Reuse the public UI queries. Never forward request cookies or authorization:
// the serialized snapshot is anonymous, and authenticated client reads stay intact.
export async function publicDetailProps<T extends { _id: string } & DetailText>(
	kind: DetailKind, id: string, query: DocumentNode, res: GetServerSidePropsContext['res'],
): Promise<GetServerSidePropsResult<PublicDetailProps<T>>> {
	if (!/^[a-f\d]{24}$/i.test(id)) return { notFound: true };
	try {
		const field = `get${kind[0].toUpperCase()}${kind.slice(1)}`;
		const data = await publicGraphql<Record<string, T | null>>(print(query), { [`${kind}Id`]: id });
		const item = data[field];
		if (item === null) return { notFound: true };
		if (!item || item._id.toLowerCase() !== id.toLowerCase()) throw new Error('Invalid public catalog record');
		return { props: { initialDetail: item, seo: detailMetadata(kind, item) } };
	} catch (error) {
		// This is the existing API's explicit missing/unpublished-record response.
		if (error instanceof CatalogResponseError && error.errors.every(row => row.message === 'No data is found!')) {
			return { notFound: true };
		}
		// An outage is temporary; do not turn it into a permanent missing page.
		temporarilyUnavailable(res);
		return { props: { initialDetail: null, seo: null } };
	}
}
