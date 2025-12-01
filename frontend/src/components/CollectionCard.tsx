import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import type { UserCollection } from '../types';

interface CollectionCardProps {
  collection: UserCollection;
  onRemove?: () => void;
  deleting?: boolean;
  showRemove?: boolean;
}

export function CollectionCard({
  collection,
  onRemove,
  deleting = false,
  showRemove = true,
}: CollectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl">
            {collection.licensePlate?.code}
          </CardTitle>
          {showRemove && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              disabled={deleting}
              className="min-h-[44px] min-w-[44px] touch-manipulation"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Stadt:</span>{' '}
            {collection.licensePlate?.city}
          </div>
          <div>
            <span className="font-semibold">Bundesland:</span>{' '}
            {collection.licensePlate?.state}
          </div>
          <div>
            <span className="font-semibold">Gesichtet am:</span>{' '}
            {new Date(collection.spottedDate).toLocaleDateString('de-DE')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

