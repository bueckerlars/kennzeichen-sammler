import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverAnchor } from './ui/popover';
import { useIsMobile } from '../hooks/use-mobile';
import { CollectionActionButton } from './CollectionActionButton';
import { EmptyState } from './EmptyState';
import type { LicensePlate, UserCollection } from '../types';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  results: LicensePlate[];
  total: number;
  loading: boolean;
  collections: UserCollection[];
  onAdd: (plateId: string) => void;
  onRemove: (collectionId: string) => void;
  adding: string | null;
  removing: string | null;
  isMobile?: boolean;
  maxResults?: number;
  className?: string;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  results,
  total,
  loading,
  collections,
  onAdd,
  onRemove,
  adding,
  removing,
  isMobile: isMobileProp,
  maxResults = 3,
  className,
  placeholder = 'Suche nach Code, Stadt oder Bundesland...',
}: SearchInputProps) {
  const navigate = useNavigate();
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;
  const [popoverOpen, setPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input focused when popover opens
  useEffect(() => {
    if (popoverOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [popoverOpen]);

  // Close popover when search query is cleared
  useEffect(() => {
    if (value.length === 0) {
      setPopoverOpen(false);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (!popoverOpen) {
      setPopoverOpen(true);
    }
  };

  const handleFocus = () => {
    if (value.length > 0 || results.length > 0) {
      setPopoverOpen(true);
    }
  };

  const handleClick = () => {
    if (value.length > 0 || results.length > 0) {
      setPopoverOpen(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    if (document.activeElement !== e.currentTarget && value.length > 0) {
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  const handleViewMore = () => {
    setPopoverOpen(false);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const getCollectionEntry = (plateId: string) => {
    return collections.find((c) => c.licensePlateId === plateId);
  };

  if (isMobile) {
    return (
      <div className={className}>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverAnchor asChild>
            <div className="relative w-full glass-strong rounded-3xl shadow-2xl transition-all duration-300 has-[:focus]:scale-[1.02] has-[:focus]:shadow-2xl" data-onboarding="search">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder={placeholder}
                  value={value}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onClick={handleClick}
                  className="pl-12 pr-4 py-4 h-auto w-full rounded-3xl bg-transparent border-0 focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-300"
                />
              </div>
            </div>
          </PopoverAnchor>
          <PopoverContent className="w-[calc(100vw-2rem)] p-0 glass-strong rounded-3xl shadow-2xl border-0 mt-3" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
            <div className="max-h-[60vh] overflow-y-auto">
              {value.length > 0 && results.length === 0 && !loading && (
                <EmptyState message="Keine Ergebnisse gefunden" useCard={false} className="p-4" />
              )}
              {value.length > 0 && results.length > 0 && (
                <div className="divide-y">
                  {loading && (
                    <div className="p-2 border-b bg-muted/50">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Suche läuft...</span>
                      </div>
                    </div>
                  )}
                  {results.slice(0, maxResults).map((plate) => {
                    const collectionEntry = getCollectionEntry(plate.id);
                    const inCollection = !!collectionEntry;

                    return (
                      <div key={plate.id} className="p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold truncate">{plate.code}</h3>
                              {inCollection && (
                                <span className="text-[10px] font-semibold text-emerald-600 border border-emerald-600 rounded px-1.5 py-0.5 whitespace-nowrap shrink-0">
                                  ✓
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {plate.city} • {plate.state}
                            </div>
                          </div>
                          <div className="shrink-0">
                            <CollectionActionButton
                              inCollection={inCollection}
                              onAdd={() => onAdd(plate.id)}
                              onRemove={() => collectionEntry && onRemove(collectionEntry.id)}
                              adding={adding === plate.id}
                              removing={removing === collectionEntry?.id}
                              size="sm"
                              className="h-8 px-2 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {total > maxResults && (
                    <div className="p-4 border-t">
                      <Button
                        className="w-full min-h-[44px]"
                        variant="outline"
                        onClick={handleViewMore}
                      >
                        Mehr Anzeigen ({total - Math.min(maxResults, results.length)} weitere)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className={className}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverAnchor asChild>
          <div className="relative w-[500px] glass-light rounded-2xl shadow-md transition-all duration-300 has-[:focus]:scale-[1.01] has-[:focus]:shadow-lg has-[:focus]:ring-2 has-[:focus]:ring-primary/20" data-onboarding="search">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onClick={handleClick}
              onMouseDown={handleMouseDown}
              className="pl-10 w-full bg-transparent"
            />
          </div>
        </PopoverAnchor>
        <PopoverContent className="w-[500px] p-0 glass-strong rounded-3xl shadow-2xl border-0" align="end" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="max-h-[600px] overflow-y-auto">
            {value.length > 0 && results.length === 0 && !loading && (
              <EmptyState message="Keine Ergebnisse gefunden" useCard={false} className="p-4" />
            )}
            {value.length > 0 && results.length > 0 && (
              <div className="divide-y">
                {loading && (
                  <div className="p-2 border-b bg-muted/50">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Suche läuft...</span>
                    </div>
                  </div>
                )}
                {results.slice(0, maxResults).map((plate) => {
                  const collectionEntry = getCollectionEntry(plate.id);
                  const inCollection = !!collectionEntry;

                  return (
                    <div key={plate.id} className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold">{plate.code}</h3>
                            {inCollection && (
                              <span className="text-xs font-semibold text-emerald-600 border border-emerald-600 rounded px-1.5 py-0.5 whitespace-nowrap shrink-0">
                                ✓ In Sammlung
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {plate.city} • {plate.state}
                            {plate.region && ` • ${plate.region}`}
                          </div>
                        </div>
                        <div className="shrink-0">
                          <CollectionActionButton
                            inCollection={inCollection}
                            onAdd={() => onAdd(plate.id)}
                            onRemove={() => collectionEntry && onRemove(collectionEntry.id)}
                            adding={adding === plate.id}
                            removing={removing === collectionEntry?.id}
                            size="sm"
                            className="h-8 px-3"
                            showText
                            addText="Hinzufügen"
                            removeText="Entfernen"
                            addingText="Hinzufügen..."
                            removingText="Entfernt..."
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {total > maxResults && (
                  <div className="p-4 border-t">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleViewMore}
                    >
                      Mehr Anzeigen ({total - Math.min(maxResults, results.length)} weitere)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

