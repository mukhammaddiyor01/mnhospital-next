export interface PublicService {
  id: string;
  title: string;
  description: string | null;
}

export interface ServicePage {
  services: PublicService[];
  total: number;
}

export const SERVICES_PAGE_SIZE = 10;

export function parseServicePage(value: unknown): ServicePage {
  if (!value || typeof value !== 'object') throw new Error('Invalid service response');
  const result = value as { list?: unknown; metaCounter?: unknown };
  if (!Array.isArray(result.list) || !Array.isArray(result.metaCounter)) {
    throw new Error('Invalid service response');
  }

  const services = result.list.map((item): PublicService => {
    if (!item || typeof item !== 'object') throw new Error('Invalid service response');
    const service = item as { _id?: unknown; serviceTitle?: unknown; serviceDesc?: unknown };
    if (typeof service._id !== 'string' || typeof service.serviceTitle !== 'string') {
      throw new Error('Invalid service response');
    }
    return {
      id: service._id,
      title: service.serviceTitle,
      description: typeof service.serviceDesc === 'string' ? service.serviceDesc : null,
    };
  });

  const first = result.metaCounter[0] as { total?: unknown } | undefined;
  const total = first?.total === undefined ? 0 : first.total;
  if (typeof total !== 'number' || !Number.isInteger(total) || total < 0) {
    throw new Error('Invalid service response');
  }
  return { services, total };
}
