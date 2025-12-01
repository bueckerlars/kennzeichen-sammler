import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo, useEffect } from 'react';

interface UsePaginationOptions {
  totalItems: number;
  defaultLimit?: number;
  onPageChange?: () => void;
}

interface UsePaginationResult {
  page: number;
  limit: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  handlePageChange: (newPage: number) => void;
  handleLimitChange: (newLimit: string) => void;
}

export function usePagination({
  totalItems,
  defaultLimit = 20,
  onPageChange,
}: UsePaginationOptions): UsePaginationResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || defaultLimit.toString());

  const totalPages = useMemo(() => Math.ceil(totalItems / limit), [totalItems, limit]);
  const startIndex = useMemo(() => (page - 1) * limit, [page, limit]);
  const endIndex = useMemo(() => startIndex + limit, [startIndex, limit]);

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    if (totalItems > 0 && page > totalPages && totalPages > 0) {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      setSearchParams(params);
    }
  }, [totalItems, page, totalPages, searchParams, setSearchParams]);

  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    if (onPageChange) {
      onPageChange();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams, setSearchParams, onPageChange]);

  const handleLimitChange = useCallback((newLimit: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('limit', newLimit);
    params.set('page', '1'); // Reset to first page
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  return {
    page,
    limit,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange,
    handleLimitChange,
  };
}

