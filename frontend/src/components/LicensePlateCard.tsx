import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CollectionActionButton } from './CollectionActionButton';
import type { LicensePlate } from '../types';

interface LicensePlateCardProps {
  plate: LicensePlate;
  inCollection?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  adding?: boolean;
  removing?: boolean;
  showCollectionBadge?: boolean;
  showFullButton?: boolean;
  className?: string;
}

export function LicensePlateCard({
  plate,
  inCollection = false,
  onAdd,
  onRemove,
  adding = false,
  removing = false,
  showCollectionBadge = true,
  showFullButton = false,
  className,
}: LicensePlateCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center justify-between">
          <span>{plate.code}</span>
          {showCollectionBadge && inCollection && (
            <span className="text-xs font-semibold text-emerald-600 border border-emerald-600 rounded px-2 py-0.5">
              {showFullButton ? 'Bereits in deiner Sammlung' : 'In Sammlung'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Stadt:</span> {plate.city}
          </div>
          {plate.region && (
            <div>
              <span className="font-semibold">Region:</span> {plate.region}
            </div>
          )}
          <div>
            <span className="font-semibold">Bundesland:</span> {plate.state}
          </div>
        </div>
        {(onAdd || onRemove) && (
          <div className="mt-4">
            <CollectionActionButton
              inCollection={inCollection}
              onAdd={onAdd || (() => {})}
              onRemove={onRemove || (() => {})}
              adding={adding}
              removing={removing}
              size="default"
              className={showFullButton ? 'w-full min-h-[44px] touch-manipulation' : ''}
              showText={showFullButton}
              addText="Zur Sammlung hinzufügen"
              removeText="Aus Sammlung entfernen"
              addingText="Wird hinzugefügt..."
              removingText="Wird entfernt..."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

