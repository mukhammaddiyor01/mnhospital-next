import { parseServicePage, SERVICES_PAGE_SIZE, type ServicePage } from './serviceModel';

const GET_PUBLIC_SERVICES = `
  query GetServices($input: ServicesInquiry!) {
    getServices(input: $input) {
      list { _id serviceTitle serviceDesc }
      metaCounter { total }
    }
  }
`;

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

export async function getPublicServices(page: number, signal: AbortSignal): Promise<ServicePage> {
  const apiUrl = publicApiUrl(process.env.EXPO_PUBLIC_API_URL);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: GET_PUBLIC_SERVICES,
      variables: { input: { page, limit: SERVICES_PAGE_SIZE, search: {} } },
    }),
    signal,
  });
  if (!response.ok) throw new Error('Service request failed');

  const body: unknown = await response.json();
  if (!body || typeof body !== 'object') throw new Error('Invalid service response');
  const result = body as { data?: { getServices?: unknown }; errors?: unknown };
  if (result.errors || !result.data) throw new Error('Service request failed');
  return parseServicePage(result.data.getServices);
}
