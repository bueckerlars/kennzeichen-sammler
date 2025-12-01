import { TableRow, TableCell } from './ui/table';
import { CollectionActionButton } from './CollectionActionButton';
import type { LicensePlate } from '../types';

interface LicensePlateTableRowProps {
  plate: LicensePlate;
  inCollection?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  adding?: boolean;
  removing?: boolean;
  showStatus?: boolean;
  showRegion?: boolean;
  showAction?: boolean;
  className?: string;
}

export function LicensePlateTableRow({
  plate,
  inCollection = false,
  onAdd,
  onRemove,
  adding = false,
  removing = false,
  showStatus = true,
  showRegion = true,
  showAction = true,
  className,
}: LicensePlateTableRowProps) {
  return (
    <TableRow className={className}>
      <TableCell className="font-semibold">{plate.code}</TableCell>
      <TableCell>{plate.city}</TableCell>
      {showRegion && <TableCell>{plate.region || '-'}</TableCell>}
      <TableCell>{plate.state}</TableCell>
      {showStatus && (
        <TableCell>
          {inCollection && (
            <span className="text-xs font-semibold text-emerald-600 border border-emerald-600 rounded px-2 py-0.5">
              In Sammlung
            </span>
          )}
        </TableCell>
      )}
      {showAction && (onAdd || onRemove) && (
        <TableCell className="text-right">
          <CollectionActionButton
            inCollection={inCollection}
            onAdd={onAdd || (() => {})}
            onRemove={onRemove || (() => {})}
            adding={adding}
            removing={removing}
            size="sm"
            className="w-32"
            showText
            addText="Hinzufügen"
            removeText="Entfernen"
            addingText="Hinzufügen..."
            removingText="Entfernt..."
          />
        </TableCell>
      )}
    </TableRow>
  );
}

