import { useEffect, useRef, useState } from 'react';
import { ApiConfigurationError, fetchItem, fetchList, type Catalog, type CatalogKind } from './catalogApi';
import { mergeById, type CatalogError } from './catalogModel';

const toError = (cause: unknown): CatalogError =>
  cause instanceof ApiConfigurationError ? 'configuration' : 'unavailable';

export function useCatalogList<K extends CatalogKind>(kind: K) {
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [items, setItems] = useState<Catalog[K][]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<CatalogError | null>(null);
  const requestingNextPage = useRef(false);
  const requestingReload = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchList(kind, page, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setItems((current) => mergeById(page === 1 ? [] : current, result.items));
        setTotal(result.total);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(toError(cause));
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
  }, [kind, page, revision]);

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
    items,
    loading,
    refreshing,
    error,
    hasMore: items.length < total,
    retry: () => reload(false),
    refresh: () => reload(true),
    loadMore: () => {
      if (loading || error || requestingNextPage.current || items.length >= total) return;
      requestingNextPage.current = true;
      setPage((value) => value + 1);
    },
  };
}

export function useCatalogItem<K extends CatalogKind>(kind: K, id: unknown) {
  const [revision, setRevision] = useState(0);
  const [item, setItem] = useState<Catalog[K] | null>(null);
  const [error, setError] = useState<CatalogError | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setItem(null);
    setError(null);
    fetchItem(kind, id, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setItem(result);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(toError(cause));
      });
    return () => controller.abort();
  }, [kind, id, revision]);

  return { item, error, retry: () => setRevision((value) => value + 1) };
}
