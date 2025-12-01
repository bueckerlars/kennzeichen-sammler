import { Card } from './ui/card';
import { CollectionActionButton } from './CollectionActionButton';
import type { LicensePlate } from '../types';

interface LicensePlateItemProps {
  plate: LicensePlate;
  inCollection?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  adding?: boolean;
  removing?: boolean;
  showCollectionBadge?: boolean;
  className?: string;
}

export function LicensePlateItem({
  plate,
  inCollection = false,
  onAdd,
  onRemove,
  adding = false,
  removing = false,
  showCollectionBadge = true,
  className,
}: LicensePlateItemProps) {
  return (
    <Card className={`p-3 ${className || ''}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-semibold text-sm">{plate.code}</div>
            {showCollectionBadge && inCollection && (
              <span className="text-[10px] font-semibold text-emerald-600 border border-emerald-600 rounded px-1.5 py-0.5 whitespace-nowrap shrink-0">
                ✓
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {plate.city} • {plate.state}
            {plate.region && ` • ${plate.region}`}
          </div>
        </div>
        {(onAdd || onRemove) && (
          <div className="shrink-0">
            <CollectionActionButton
              inCollection={inCollection}
              onAdd={onAdd || (() => {})}
              onRemove={onRemove || (() => {})}
              adding={adding}
              removing={removing}
              size="sm"
              className="h-8 px-2 text-xs"
            />
          </div>
        )}
      </div>
    </Card>
  );
}

