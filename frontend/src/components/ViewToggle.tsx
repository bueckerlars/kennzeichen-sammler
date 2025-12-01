import { Table, Grid } from 'lucide-react';
import { Button } from './ui/button';
import { useIsMobile } from '../hooks/use-mobile';
import type { ViewType } from '../types';

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  isMobile?: boolean;
  showOnMobile?: boolean;
}

export function ViewToggle({
  view,
  onViewChange,
  isMobile: isMobileProp,
  showOnMobile = false,
}: ViewToggleProps) {
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;

  if (isMobile && !showOnMobile) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={view === 'table' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('table')}
      >
        <Table className="h-4 w-4 mr-2" />
        Tabelle
      </Button>
      <Button
        variant={view === 'gallery' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewChange('gallery')}
      >
        <Grid className="h-4 w-4 mr-2" />
        Galerie
      </Button>
    </div>
  );
}

