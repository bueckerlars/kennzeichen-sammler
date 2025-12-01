import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from './use-mobile';

interface UseEndlessScrollOptions<T> {
  loadMore: (page: number, limit: number) => Promise<{ data: T[]; total: number }>;
  limit?: number;
  enabled?: boolean;
  isMobile?: boolean;
}

interface UseEndlessScrollResult<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  total: number;
  observerTarget: React.RefObject<HTMLDivElement>;
  reset: () => void;
}

export function useEndlessScroll<T>({
  loadMore,
  limit = 20,
  enabled = true,
  isMobile: isMobileProp,
}: UseEndlessScrollOptions<T>): UseEndlessScrollResult<T> {
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;

  const [items, setItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    if (!isMobile || !enabled) {
      setItems([]);
      setCurrentPage(1);
      setHasMore(false);
      return;
    }

    const loadInitial = async () => {
      setLoading(true);
      setCurrentPage(1);
      try {
        const result = await loadMore(1, limit);
        setItems(result.data);
        setTotal(result.total);
        setHasMore(result.data.length < result.total);
      } catch (error) {
        console.error('Failed to load initial items', error);
        setItems([]);
        setTotal(0);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [isMobile, enabled, limit, loadMore]);

  // Load more
  const loadMoreItems = useCallback(async () => {
    if (!isMobile || !enabled || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await loadMore(nextPage, limit);
      setItems((prev) => [...prev, ...result.data]);
      setCurrentPage(nextPage);
      setHasMore(result.data.length === limit && (nextPage * limit) < result.total);
    } catch (error) {
      console.error('Load more failed', error);
    } finally {
      setLoadingMore(false);
    }
  }, [isMobile, enabled, limit, currentPage, loadingMore, hasMore, loadMore]);

  // Intersection Observer
  useEffect(() => {
    if (!isMobile || !hasMore || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [isMobile, hasMore, enabled, loadMoreItems]);

  const reset = useCallback(() => {
    setItems([]);
    setCurrentPage(1);
    setHasMore(false);
    setTotal(0);
  }, []);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    total,
    observerTarget,
    reset,
  };
}

