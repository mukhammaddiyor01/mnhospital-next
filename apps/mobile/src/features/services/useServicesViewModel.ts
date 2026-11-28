import { useEffect, useRef, useState } from 'react';
import { ApiConfigurationError, getPublicServices } from './serviceApi';
import { mergeUniqueServices, type PublicService } from './serviceModel';

export type ServicesError = 'configuration' | 'unavailable';

export function useServicesViewModel() {
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [services, setServices] = useState<PublicService[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ServicesError | null>(null);
  const requestingNextPage = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getPublicServices(page, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setServices((current) => mergeUniqueServices(page === 1 ? [] : current, result.services));
        setTotal(result.total);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof ApiConfigurationError ? 'configuration' : 'unavailable');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          requestingNextPage.current = false;
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [page, revision]);

  return {
    services,
    loading,
    error,
    hasMore: services.length < total,
    retry: () => setRevision((value) => value + 1),
    loadMore: () => {
      if (loading || error || requestingNextPage.current || services.length >= total) return;
      requestingNextPage.current = true;
      setPage((value) => value + 1);
    },
  };
}
