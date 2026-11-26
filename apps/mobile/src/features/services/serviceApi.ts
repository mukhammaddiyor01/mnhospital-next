import { parseServicePage, SERVICES_PAGE_SIZE, type ServicePage } from './serviceModel';

const GET_PUBLIC_SERVICES = `
  query GetServices($input: ServicesInquiry!) {
    getServices(input: $input) {
      list { _id serviceTitle serviceDesc }
      metaCounter { total }
    }
  }
`;

export async function getPublicServices(page: number, signal: AbortSignal): Promise<ServicePage> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('API URL is not configured');

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
