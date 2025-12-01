import { useIsMobile } from '../hooks/use-mobile';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from './ui/pagination';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  isMobile?: boolean;
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  isMobile: isMobileProp,
}: PaginationControlsProps) {
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;

  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];
  const maxVisible = 7;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (page <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('ellipsis');
      pages.push(totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1);
      pages.push('ellipsis');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('ellipsis');
      for (let i = page - 1; i <= page + 1; i++) pages.push(i);
      pages.push('ellipsis');
      pages.push(totalPages);
    }
  }

  return (
    <Pagination>
      <PaginationContent className={isMobile ? 'gap-1' : ''}>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => page > 1 && onPageChange(page - 1)}
            className={`${page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}`}
          />
        </PaginationItem>
        {pages.map((p, idx) => (
          <PaginationItem key={idx}>
            {p === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => onPageChange(p)}
                isActive={p === page}
                className={`cursor-pointer ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}`}
              >
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => page < totalPages && onPageChange(page + 1)}
            className={`${page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

