import { useCatalogList } from '../catalog/useCatalog';

const PREVIEW_SIZE = 3;

export function useHomeViewModel() {
  const services = useCatalogList('services');
  const doctors = useCatalogList('doctors');

  return {
    services: services.items.slice(0, PREVIEW_SIZE),
    doctors: doctors.items.slice(0, PREVIEW_SIZE),
    loading: services.loading || doctors.loading,
    error: services.error ?? doctors.error,
    retry: () => {
      if (services.error) services.retry();
      if (doctors.error) doctors.retry();
    },
  };
}
