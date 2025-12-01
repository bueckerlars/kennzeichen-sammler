import { TableRow, TableCell } from './ui/table';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import type { UserCollection } from '../types';

interface CollectionTableRowProps {
  collection: UserCollection;
  onRemove?: () => void;
  deleting?: boolean;
  showRemove?: boolean;
}

export function CollectionTableRow({
  collection,
  onRemove,
  deleting = false,
  showRemove = true,
}: CollectionTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-semibold">{collection.licensePlate?.code}</TableCell>
      <TableCell>{collection.licensePlate?.city}</TableCell>
      <TableCell>{collection.licensePlate?.state}</TableCell>
      <TableCell>
        {new Date(collection.spottedDate).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}
      </TableCell>
      {showRemove && onRemove && (
        <TableCell className="text-right">
          <Button
            variant="destructive"
            size="sm"
            onClick={onRemove}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Entfernt...' : 'Entfernen'}
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}

