import { Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import type { ButtonProps } from './ui/button';
import { cn } from '../lib/utils';

interface CollectionActionButtonProps {
  inCollection: boolean;
  onAdd: () => void;
  onRemove: () => void;
  adding?: boolean;
  removing?: boolean;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  className?: string;
  showText?: boolean;
  addText?: string;
  removeText?: string;
  addingText?: string;
  removingText?: string;
}

export function CollectionActionButton({
  inCollection,
  onAdd,
  onRemove,
  adding = false,
  removing = false,
  size = 'sm',
  variant,
  className,
  showText = false,
  addText = 'Hinzufügen',
  removeText = 'Entfernen',
  addingText = 'Hinzufügen...',
  removingText = 'Entfernt...',
}: CollectionActionButtonProps) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const iconSizeSmall = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const iconMargin = showText ? (size === 'sm' ? 'mr-1.5' : 'mr-2') : '';

  if (inCollection) {
    return (
      <Button
        variant={variant || 'destructive'}
        size={size}
        onClick={onRemove}
        disabled={removing}
        className={className}
      >
        <Trash2 className={cn(showText ? iconSizeSmall : iconSize, iconMargin)} />
        {showText && (removing ? removingText : removeText)}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onAdd}
      disabled={adding}
      className={className}
    >
      <Plus className={cn(showText ? iconSizeSmall : iconSize, iconMargin)} />
      {showText && (adding ? addingText : addText)}
    </Button>
  );
}

