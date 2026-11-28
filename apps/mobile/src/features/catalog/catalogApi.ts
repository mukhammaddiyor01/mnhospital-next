import {
  PAGE_SIZE,
  parseArticle,
  parseDoctor,
  parseId,
  parsePage,
  parsePageNumber,
  parseService,
  resolveAssetUrl,
  type Article,
  type Doctor,
  type Page,
  type Service,
} from './catalogModel';

export interface Catalog {
  services: Service;
  doctors: Doctor;
  articles: Article;
}
export type CatalogKind = keyof Catalog;

const SERVICE_FIELDS = `_id serviceTitle serviceDesc serviceType servicePrice serviceDiscountPercent
  serviceDuration serviceImages memberData { _id docFullName docSpecialty }`;
const DOCTOR_FIELDS = '_id docFullName docNick docSpecialty docExperience docDesc docAddress docImage';
const ARTICLE_FIELDS = `_id articleTitle articleCategory articleContent articleImage createdAt
  memberData { docFullName }`;

const withAssetUrl = <T extends { image: string | null }>(item: T): T =>
  ({ ...item, image: resolveAssetUrl(item.image, process.env.EXPO_PUBLIC_ASSET_URL) });

const specs: { [K in CatalogKind]: {
  list: string; item: string; input: string; idArg: string; fields: string;
  parse: (value: unknown) => Catalog[K];
} } = {
  services: { list: 'getServices', item: 'getService', input: 'ServicesInquiry', idArg: 'serviceId', fields: SERVICE_FIELDS, parse: (value) => withAssetUrl(parseService(value)) },
  doctors: { list: 'getDoctors', item: 'getDoctor', input: 'DoctorsInquiry', idArg: 'doctorId', fields: DOCTOR_FIELDS, parse: (value) => withAssetUrl(parseDoctor(value)) },
  articles: { list: 'getArticles', item: 'getArticle', input: 'ArticlesInquiry', idArg: 'articleId', fields: ARTICLE_FIELDS, parse: (value) => withAssetUrl(parseArticle(value)) },
};

export const REQUEST_TIMEOUT_MS = 15_000;

export class ApiConfigurationError extends Error {}

export function publicApiUrl(value: string | undefined): string {
  if (!value) throw new ApiConfigurationError('Public API URL is missing');

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ApiConfigurationError('Public API URL is invalid');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new ApiConfigurationError('Public API URL must be HTTPS without credentials or parameters');
  }
  return url.toString();
}

export function websiteUrl(path: string): string | null {
  try {
    return new URL(path, publicApiUrl(process.env.EXPO_PUBLIC_API_URL)).toString();
  } catch {
    return null;
  }
}

export function createRequestSignal(callerSignal: AbortSignal, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();

  if (callerSignal.aborted) {
    controller.abort();
  } else {
    callerSignal.addEventListener('abort', abortFromCaller, { once: true });
  }

  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timeout);
      callerSignal.removeEventListener('abort', abortFromCaller);
    },
  };
}

async function publicQuery(
  field: string,
  query: string,
  variables: Record<string, unknown>,
  signal: AbortSignal,
): Promise<unknown> {
  const apiUrl = publicApiUrl(process.env.EXPO_PUBLIC_API_URL);
  const request = createRequestSignal(signal);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: request.signal,
    });
    if (!response.ok) throw new Error('Catalog request failed');

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new Error('Invalid catalog response');
    }
    if (!body || typeof body !== 'object') throw new Error('Invalid catalog response');
    const result = body as { data?: Record<string, unknown>; errors?: unknown };
    if (result.errors || !result.data) throw new Error('Catalog request failed');
    return result.data[field];
  } finally {
    request.dispose();
  }
}

export async function fetchList<K extends CatalogKind>(
  kind: K,
  page: number,
  signal: AbortSignal,
): Promise<Page<Catalog[K]>> {
  const spec = specs[kind];
  const result = await publicQuery(
    spec.list,
    `query($input: ${spec.input}!) { ${spec.list}(input: $input) { list { ${spec.fields} } metaCounter { total } } }`,
    { input: { page: parsePageNumber(page), limit: PAGE_SIZE, search: {} } },
    signal,
  );
  return parsePage(result, spec.parse);
}

export async function fetchItem<K extends CatalogKind>(
  kind: K,
  id: unknown,
  signal: AbortSignal,
): Promise<Catalog[K]> {
  const spec = specs[kind];
  const result = await publicQuery(
    spec.item,
    `query($id: String!) { ${spec.item}(${spec.idArg}: $id) { ${spec.fields} } }`,
    { id: parseId(id) },
    signal,
  );
  return spec.parse(result);
}
