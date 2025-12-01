import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { licensePlateApi, collectionApi, statisticsApi } from '../services/api';
import type { LicensePlate, UserCollection, SearchResult, Statistics } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
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

export default function StateDetail() {
  const navigate = useNavigate();
  const { stateName } = useParams<{ stateName: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [plates, setPlates] = useState<LicensePlate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [stateStats, setStateStats] = useState<{ total: number; collected: number; missing: number } | null>(null);
  
  // For mobile endless scroll
  const [mobilePlates, setMobilePlates] = useState<LicensePlate[]>([]);
  const [mobileCurrentPage, setMobileCurrentPage] = useState(1);
  const [mobileLoadingMore, setMobileLoadingMore] = useState(false);
  const [mobileHasMore, setMobileHasMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const totalPages = Math.ceil(total / limit);

  const loadCollection = async () => {
    try {
      const data = await collectionApi.getUserCollection();
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collection', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await statisticsApi.getUserStatistics();
      setStatistics(stats);
      // Find statistics for current state
      if (stateName && stats.byState) {
        const stateStat = stats.byState.find(s => s.state === decodeURIComponent(stateName));
        if (stateStat) {
          setStateStats({
            total: stateStat.total,
            collected: stateStat.collected,
            missing: stateStat.missing,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load statistics', error);
    }
  };

  useEffect(() => {
    loadCollection();
    loadStatistics();
  }, [stateName]);

  // Desktop pagination
  useEffect(() => {
    if (isMobile) return; // Skip on mobile, handled separately

    const loadPlates = async () => {
      if (!stateName) return;

      setLoading(true);
      try {
        const decodedState = decodeURIComponent(stateName);
        const result = await licensePlateApi.getByState(decodedState, page, limit);
        setPlates(result.data);
        setTotal(result.total);
      } catch (error) {
        console.error('Failed to load plates', error);
        setPlates([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    loadPlates();
  }, [stateName, page, limit, isMobile]);

  // Mobile endless scroll - initial load
  useEffect(() => {
    if (!isMobile || !stateName) {
      setMobilePlates([]);
      setMobileCurrentPage(1);
      setMobileHasMore(false);
      return;
    }

    const loadPlates = async () => {
      setLoading(true);
      setMobileCurrentPage(1);
      try {
        const decodedState = decodeURIComponent(stateName);
        const result = await licensePlateApi.getByState(decodedState, 1, limit);
        setMobilePlates(result.data);
        setTotal(result.total);
        setMobileHasMore(result.data.length < result.total);
      } catch (error) {
        console.error('Failed to load plates', error);
        setMobilePlates([]);
        setTotal(0);
        setMobileHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadPlates();
  }, [stateName, limit, isMobile]);

  // Mobile endless scroll - load more
  const loadMoreMobile = useCallback(async () => {
    if (!isMobile || !stateName || mobileLoadingMore || !mobileHasMore) return;

    setMobileLoadingMore(true);
    try {
      const nextPage = mobileCurrentPage + 1;
      const decodedState = decodeURIComponent(stateName);
      const result = await licensePlateApi.getByState(decodedState, nextPage, limit);
      setMobilePlates((prev) => [...prev, ...result.data]);
      setMobileCurrentPage(nextPage);
      setMobileHasMore(result.data.length === limit && (nextPage * limit) < result.total);
    } catch (error) {
      console.error('Load more failed', error);
    } finally {
      setMobileLoadingMore(false);
    }
  }, [isMobile, stateName, limit, mobileCurrentPage, mobileLoadingMore, mobileHasMore]);

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

  // Update URL when pagination changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (limit !== 20) params.set('limit', limit.toString());
    setSearchParams(params, { replace: true });
  }, [page, limit, setSearchParams]);

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
      await loadStatistics();
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
      await loadStatistics();
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

  const decodedStateName = stateName ? decodeURIComponent(stateName) : '';
  const percentage = stateStats && stateStats.total > 0
    ? (stateStats.collected / stateStats.total) * 100
    : 0;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {isMobile && <div className="h-20" />}
      {/* Floating Avatar on Mobile */}
      {isMobile && (
        <div className="fixed top-4 right-4 z-50 md:hidden">
          <MobileUserMenu />
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

        {decodedStateName && (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Kennzeichen: {decodedStateName}</h1>
              {stateStats && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Fortschritt</CardTitle>
                    <CardDescription>
                      {stateStats.collected} von {stateStats.total} Kennzeichen gesammelt
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Gesamt</span>
                        <span className="font-semibold">{stateStats.total}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600">Gesammelt</span>
                        <span className="font-semibold text-green-600">{stateStats.collected}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-orange-600">Fehlend</span>
                        <span className="font-semibold text-orange-600">{stateStats.missing}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Fortschritt</span>
                        <span className="font-semibold">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-3 backdrop-blur-sm">
                        <div
                          className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {!isMobile && (
              <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
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
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="mt-2 text-muted-foreground">Lädt...</p>
              </div>
            )}

            {!loading && (isMobile ? mobilePlates.length === 0 : plates.length === 0) && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Keine Kennzeichen gefunden
                </CardContent>
              </Card>
            )}

            {!loading && (isMobile ? mobilePlates.length > 0 : plates.length > 0) && (
              <>
                <div className={`mb-4 text-sm text-muted-foreground ${isMobile ? 'text-center' : ''}`}>
                  {total} Kennzeichen{total !== 1 ? '' : ''} gefunden
                </div>

                {isMobile ? (
                  <div className="space-y-2">
                    {mobilePlates.map((plate) => {
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
                                {plate.region && ` • ${plate.region}`}
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
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aktion</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plates.map((plate) => {
                          const collectionEntry = collections.find(
                            (c) => c.licensePlateId === plate.id,
                          );
                          const inCollection = !!collectionEntry;

                          return (
                            <TableRow key={plate.id}>
                              <TableCell className="font-semibold">{plate.code}</TableCell>
                              <TableCell>{plate.city}</TableCell>
                              <TableCell>{plate.region || '-'}</TableCell>
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
          </>
        )}

        {!decodedStateName && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Kein Bundesland angegeben
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

