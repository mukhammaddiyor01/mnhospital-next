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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<ServicesError | null>(null);
  const requestingNextPage = useRef(false);
  const requestingReload = useRef(false);

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
          requestingReload.current = false;
          setLoading(false);
          setRefreshing(false);
        }
      });
    return () => controller.abort();
  }, [page, revision]);

  const reload = (replaceCurrentList: boolean) => {
    if (loading || requestingReload.current) return;
    requestingReload.current = true;
    if (replaceCurrentList) {
      setRefreshing(true);
      setPage(1);
    }
    setRevision((value) => value + 1);
  };

  return {
    services,
    loading,
    refreshing,
    error,
    hasMore: services.length < total,
    retry: () => reload(false),
    refresh: () => reload(true),
    loadMore: () => {
      if (loading || error || requestingNextPage.current || services.length >= total) return;
      requestingNextPage.current = true;
      setPage((value) => value + 1);
    },
  };
}
