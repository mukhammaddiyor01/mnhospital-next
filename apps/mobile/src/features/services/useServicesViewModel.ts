import { useEffect, useRef, useState } from 'react';
import { getPublicServices } from './serviceApi';
import type { PublicService } from './serviceModel';

export function useServicesViewModel() {
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [services, setServices] = useState<PublicService[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestingNextPage = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getPublicServices(page, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setServices((current) => page === 1
          ? result.services
          : [...current, ...result.services.filter((item) => !current.some((old) => old.id === item.id))]);
        setTotal(result.total);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error && cause.message === 'API URL is not configured'
          ? 'Set EXPO_PUBLIC_API_URL to the public GraphQL endpoint.'
          : 'Services are unavailable. Please try again.');
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
