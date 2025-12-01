import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { licensePlateApi, collectionApi } from '../services/api';
import type { LicensePlate, UserCollection, SearchResult, ViewType } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Plus, Trash2, Search as SearchIcon, Table, Grid } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useIsMobile } from '../hooks/use-mobile';
import { MobileUserMenu } from '../components/MobileUserMenu';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '../components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [query, setQuery] = useState((searchParams.get('q') || '').trim());
  const [results, setResults] = useState<LicensePlate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);
  
  // For mobile endless scroll
  const [mobileResults, setMobileResults] = useState<LicensePlate[]>([]);
  const [mobileCurrentPage, setMobileCurrentPage] = useState(1);
  const [mobileLoadingMore, setMobileLoadingMore] = useState(false);
  const [mobileHasMore, setMobileHasMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  // On mobile, always use table view (compact)
  const view = (isMobile ? 'table' : (searchParams.get('view') || 'table')) as ViewType;

  const totalPages = Math.ceil(total / limit);

  const loadCollection = async () => {
    try {
      const data = await collectionApi.getUserCollection();
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collection', error);
    }
  };

  useEffect(() => {
    loadCollection();
  }, []);

  // Desktop search with pagination
  useEffect(() => {
    if (isMobile) return; // Skip on mobile, handled separately

    const searchPlates = async () => {
      if (query.length < 1) {
        setResults([]);
        setTotal(0);
        return;
      }

      setLoading(true);
      try {
        const result = await licensePlateApi.search(query, page, limit);
        if (result && typeof result === 'object' && 'data' in result) {
          const searchResult = result as SearchResult;
          setResults(searchResult.data);
          setTotal(searchResult.total);
        } else {
          setResults([]);
          setTotal(0);
        }
      } catch (error) {
        console.error('Search failed', error);
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPlates, 300);
    return () => clearTimeout(timeoutId);
  }, [query, page, limit, isMobile]);

  // Mobile endless scroll - initial search
  useEffect(() => {
    if (!isMobile || query.length < 1) {
      setMobileResults([]);
      setMobileCurrentPage(1);
      setMobileHasMore(false);
      return;
    }

    const searchPlates = async () => {
      setLoading(true);
      setMobileCurrentPage(1);
      try {
        const result = await licensePlateApi.search(query, 1, limit);
        if (result && typeof result === 'object' && 'data' in result) {
          const searchResult = result as SearchResult;
          setMobileResults(searchResult.data);
          setTotal(searchResult.total);
          setMobileHasMore(searchResult.data.length < searchResult.total);
        } else {
          setMobileResults([]);
          setTotal(0);
          setMobileHasMore(false);
        }
      } catch (error) {
        console.error('Search failed', error);
        setMobileResults([]);
        setTotal(0);
        setMobileHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPlates, 300);
    return () => clearTimeout(timeoutId);
  }, [query, limit, isMobile]);

  // Mobile endless scroll - load more
  const loadMoreMobile = useCallback(async () => {
    if (!isMobile || !query || mobileLoadingMore || !mobileHasMore) return;

    setMobileLoadingMore(true);
    try {
      const nextPage = mobileCurrentPage + 1;
      const result = await licensePlateApi.search(query, nextPage, limit);
      if (result && typeof result === 'object' && 'data' in result) {
        const searchResult = result as SearchResult;
        setMobileResults((prev) => [...prev, ...searchResult.data]);
        setMobileCurrentPage(nextPage);
        setMobileHasMore(searchResult.data.length === limit && (nextPage * limit) < searchResult.total);
      }
    } catch (error) {
      console.error('Load more failed', error);
    } finally {
      setMobileLoadingMore(false);
    }
  }, [isMobile, query, limit, mobileCurrentPage, mobileLoadingMore, mobileHasMore]);

  // Intersection Observer for mobile endless scroll
  useEffect(() => {
    if (!isMobile || !mobileHasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreMobile();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [isMobile, mobileHasMore, loadMoreMobile]);

  // Update URL when query changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (page > 1) params.set('page', page.toString());
    if (limit !== 20) params.set('limit', limit.toString());
    if (view !== 'table') params.set('view', view);
    setSearchParams(params, { replace: true });
  }, [query, page, limit, view, setSearchParams]);

  const handleAddToCollection = async (plateId: string) => {
    setAdding(plateId);
    try {
      await collectionApi.addToCollection(plateId);
      toast({
        variant: 'success',
        title: 'Erfolgreich hinzugefügt',
        description: 'Das Kennzeichen wurde zu deiner Sammlung hinzugefügt.',
      });
      await loadCollection();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast({
          variant: 'destructive',
          title: 'Bereits vorhanden',
          description: 'Dieses Kennzeichen ist bereits in deiner Sammlung.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Fehler',
          description: 'Das Kennzeichen konnte nicht hinzugefügt werden.',
        });
      }
    } finally {
      setAdding(null);
    }
  };

  const handleRemoveFromCollection = async (collectionId: string) => {
    setRemoving(collectionId);
    try {
      await collectionApi.removeFromCollection(collectionId);
      await loadCollection();
      toast({
        variant: 'success',
        title: 'Entfernt',
        description: 'Das Kennzeichen wurde aus deiner Sammlung entfernt.',
      });
    } catch (error) {
      console.error('Failed to remove from collection', error);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Das Kennzeichen konnte nicht entfernt werden.',
      });
    } finally {
      setRemoving(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('limit', newLimit);
    params.set('page', '1'); // Reset to first page
    setSearchParams(params);
  };

  const handleViewChange = (newView: ViewType) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', newView);
    setSearchParams(params);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return (
      <Pagination>
        <PaginationContent className={isMobile ? 'gap-1' : ''}>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && handlePageChange(page - 1)}
              className={`${page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}`}
            />
          </PaginationItem>
          {pages.map((p, idx) => (
            <PaginationItem key={idx}>
              {p === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(p)}
                  isActive={p === page}
                  className={`cursor-pointer ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}`}
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => page < totalPages && handlePageChange(page + 1)}
              className={`${page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {isMobile && <div className="h-20" />}
      {/* Floating Search Bar and Avatar on Mobile */}
      {isMobile && (
        <div className="fixed top-4 left-4 right-4 z-50 md:hidden flex items-center gap-3">
          <div className="flex-1">
            <div className="relative w-full glass-strong rounded-3xl shadow-2xl transition-all duration-300 has-[:focus]:scale-[1.02] has-[:focus]:shadow-2xl">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  type="text"
                  placeholder="Suche nach Code, Stadt oder Bundesland..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value.trim())}
                  className="pl-12 pr-4 py-4 h-auto rounded-3xl bg-transparent border-0 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <MobileUserMenu />
          </div>
        </div>
      )}

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {!isMobile && (
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Dashboard
          </Button>
        )}

        {!isMobile && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">Kennzeichen suchen</h1>
            <div className="relative max-w-2xl glass-light rounded-2xl shadow-md transition-all duration-300 has-[:focus]:scale-[1.01] has-[:focus]:shadow-lg has-[:focus]:ring-2 has-[:focus]:ring-primary/20">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Suche nach Code, Stadt oder Bundesland..."
                value={query}
                onChange={(e) => setQuery(e.target.value.trim())}
                className="pl-10 bg-transparent"
              />
            </div>
          </div>
        )}


        {query && (
          <div className={`mb-4 flex items-center ${isMobile ? 'justify-between' : 'justify-between'} gap-4 flex-wrap`}>
            {!isMobile && (
              <div className="flex items-center gap-2">
                <Button
                  variant={view === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewChange('table')}
                >
                  <Table className="h-4 w-4 mr-2" />
                  Tabelle
                </Button>
                <Button
                  variant={view === 'gallery' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewChange('gallery')}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Galerie
                </Button>
              </div>
            )}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ergebnisse pro Seite:</span>
                <Select value={limit.toString()} onValueChange={handleLimitChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-muted-foreground">Lädt...</p>
          </div>
        )}

        {!loading && query && (isMobile ? mobileResults.length === 0 : results.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Keine Ergebnisse gefunden
            </CardContent>
          </Card>
        )}

        {!loading && query && (isMobile ? mobileResults.length > 0 : results.length > 0) && (
          <>
            <div className={`mb-4 text-sm text-muted-foreground ${isMobile ? 'text-center' : ''}`}>
              {total} Ergebnis{total !== 1 ? 'se' : ''} gefunden
            </div>

            {view === 'table' ? (
              isMobile ? (
                <div className="space-y-2">
                  {(isMobile ? mobileResults : results).map((plate) => {
                    const collectionEntry = collections.find(
                      (c) => c.licensePlateId === plate.id,
                    );
                    const inCollection = !!collectionEntry;

                    return (
                      <Card key={plate.id} className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-semibold text-sm">{plate.code}</div>
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
                            {inCollection ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => handleRemoveFromCollection(collectionEntry.id)}
                                disabled={removing === collectionEntry.id}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => handleAddToCollection(plate.id)}
                                disabled={adding === plate.id}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <TableComponent>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Stadt</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Bundesland</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aktion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((plate) => {
                        const collectionEntry = collections.find(
                          (c) => c.licensePlateId === plate.id,
                        );
                        const inCollection = !!collectionEntry;

                        return (
                          <TableRow key={plate.id}>
                            <TableCell className="font-semibold">{plate.code}</TableCell>
                            <TableCell>{plate.city}</TableCell>
                            <TableCell>{plate.region || '-'}</TableCell>
                            <TableCell>{plate.state}</TableCell>
                            <TableCell>
                              {inCollection && (
                                <span className="text-xs font-semibold text-emerald-600 border border-emerald-600 rounded px-2 py-0.5">
                                  In Sammlung
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {inCollection ? (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="w-32"
                                  onClick={() => handleRemoveFromCollection(collectionEntry.id)}
                                  disabled={removing === collectionEntry.id}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {removing === collectionEntry.id ? 'Entfernt...' : 'Entfernen'}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="w-32"
                                  onClick={() => handleAddToCollection(plate.id)}
                                  disabled={adding === plate.id}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  {adding === plate.id ? 'Hinzufügen...' : 'Hinzufügen'}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </TableComponent>
                </Card>
              )
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {(isMobile ? mobileResults : results).map((plate) => {
                  const collectionEntry = collections.find(
                    (c) => c.licensePlateId === plate.id,
                  );
                  const inCollection = !!collectionEntry;

                  return (
                    <Card key={plate.id}>
                      <CardHeader>
                        <CardTitle className="text-2xl flex items-center justify-between">
                          <span>{plate.code}</span>
                          {inCollection && (
                            <span className="text-xs font-semibold text-emerald-600 border border-emerald-600 rounded px-2 py-0.5">
                              Bereits in deiner Sammlung
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
                        {inCollection ? (
                          <Button
                            className="w-full mt-4 min-h-[44px] touch-manipulation"
                            variant="destructive"
                            onClick={() => handleRemoveFromCollection(collectionEntry.id)}
                            disabled={removing === collectionEntry.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {removing === collectionEntry.id
                              ? 'Wird entfernt...'
                              : 'Aus Sammlung entfernen'}
                          </Button>
                        ) : (
                          <Button
                            className="w-full mt-4 min-h-[44px] touch-manipulation"
                            onClick={() => handleAddToCollection(plate.id)}
                            disabled={adding === plate.id}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {adding === plate.id
                              ? 'Wird hinzugefügt...'
                              : 'Zur Sammlung hinzufügen'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Mobile endless scroll trigger */}
            {isMobile && mobileHasMore && (
              <div ref={observerTarget} className="py-4 flex justify-center">
                {mobileLoadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Lädt weitere Ergebnisse...</span>
                  </div>
                )}
              </div>
            )}

            {/* Desktop pagination */}
            {!isMobile && (
              <div className="mt-8">
                {renderPagination()}
              </div>
            )}
          </>
        )}

        {!query && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Beginne mit der Suche...
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

