import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import type { UserCollection } from '../types';

interface CollectionItemProps {
  collection: UserCollection;
  onRemove?: () => void;
  deleting?: boolean;
  showRemove?: boolean;
  className?: string;
}

export function CollectionItem({
  collection,
  onRemove,
  deleting = false,
  showRemove = true,
  className,
}: CollectionItemProps) {
  return (
    <div
      className={`glass-light rounded-2xl p-3 transition-colors duration-300 ${className || ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-base font-bold">{collection.licensePlate?.code}</div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="truncate">{collection.licensePlate?.city}</span>
            <span>•</span>
            <span>{collection.licensePlate?.state}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(collection.spottedDate).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        </div>
        {showRemove && onRemove && (
          <div className="shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              disabled={deleting}
              className="min-h-[44px] min-w-[44px] touch-manipulation text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

