import { CardHeader, CardTitle } from './ui/card';
import { ViewToggle } from './ViewToggle';
import { MobileUserMenu } from './MobileUserMenu';
import type { ViewType } from '../types';

interface CollectionHeaderProps {
  title: string;
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  isMobile?: boolean;
  showViewToggle?: boolean;
}

export function CollectionHeader({
  title,
  view,
  onViewChange,
  isMobile,
  showViewToggle = true,
}: CollectionHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between gap-3">
        <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {!isMobile && showViewToggle && (
            <ViewToggle view={view} onViewChange={onViewChange} />
          )}
          {isMobile && (
            <div className="shrink-0">
              <MobileUserMenu />
            </div>
          )}
        </div>
      </div>
    </CardHeader>
  );
}

