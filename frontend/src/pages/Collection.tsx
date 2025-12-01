import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { collectionApi } from '../services/api';
import type { UserCollection, ViewType } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Trash2, Table, Grid } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { MobileUserMenu } from '../components/MobileUserMenu';
import { useAuth } from '../context/AuthContext';
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

export default function Collection() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewedUsername, setViewedUsername] = useState<string | null>(null);
  const isViewingOtherUser = userId && userId !== user?.id;
  const fromLeaderboard = searchParams.get('from') === 'leaderboard';
  
  // Pagination and view state
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const view = (isMobile ? 'table' : (searchParams.get('view') || 'gallery')) as ViewType;
  
  // Calculate pagination
  const totalPages = Math.ceil(collections.length / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCollections = collections.slice(startIndex, endIndex);

  useEffect(() => {
    loadCollection();
  }, [userId]);

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    if (collections.length > 0 && page > totalPages && totalPages > 0) {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      setSearchParams(params);
    }
  }, [collections.length, page, totalPages, searchParams, setSearchParams]);

  const loadCollection = async () => {
    try {
      if (userId && userId !== user?.id) {
        const data = await collectionApi.getUserCollectionByUserId(userId);
        setCollections(data.collections);
        setViewedUsername(data.username);
      } else {
        const data = await collectionApi.getUserCollection();
        setCollections(data);
        setViewedUsername(null);
      }
    } catch (error) {
      console.error('Failed to load collection', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (collectionId: string) => {
    if (!confirm('Möchtest du dieses Kennzeichen wirklich entfernen?')) {
      return;
    }

    setDeleting(collectionId);
    try {
      await collectionApi.removeFromCollection(collectionId);
      await loadCollection();
    } catch (error) {
      console.error('Failed to remove', error);
      alert('Fehler beim Entfernen');
    } finally {
      setDeleting(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewChange = (newView: ViewType) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', newView);
    params.set('page', '1'); // Reset to first page when changing view
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto px-4 py-8'}`}>
        {!isMobile && (
          <Button
            variant="ghost"
            onClick={() => navigate(fromLeaderboard ? '/leaderboard' : '/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {fromLeaderboard ? 'Zurück zur Bestenliste' : 'Zurück zum Dashboard'}
          </Button>
        )}

        <Card className={`${isMobile ? 'mb-4' : 'mb-6'} w-full`} data-onboarding="collection">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {isViewingOtherUser ? `Sammlung von ${viewedUsername || '...'}` : 'Meine Sammlung'}
              </CardTitle>
              <div className="flex items-center gap-2">
                {!isMobile && collections.length > 0 && (
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
                {isMobile && (
                  <div className="shrink-0">
                    <MobileUserMenu />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className={isMobile ? 'p-3' : ''}>
            {collections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isViewingOtherUser 
                  ? `Die Sammlung von ${viewedUsername || 'diesem Nutzer'} ist noch leer.`
                  : 'Deine Sammlung ist noch leer. Beginne mit der Suche!'}
              </div>
            ) : (
              <>
                {collections.length > 0 && (
                  <div className={`mb-4 text-sm text-muted-foreground ${isMobile ? 'text-center' : ''}`}>
                    {collections.length} Kennzeichen{collections.length !== 1 ? '' : ''} gesammelt
                  </div>
                )}
                
                {view === 'table' ? (
                  isMobile ? (
                    <div className="space-y-3">
                      {paginatedCollections.map((collection, index) => (
                        <div
                          key={collection.id}
                          className="glass-light rounded-2xl p-3 transition-colors duration-300"
                          style={{ animationDelay: `${0.1 + index * 0.02}s` }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-base font-bold">{collection.licensePlate?.code}</div>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="truncate">{collection.licensePlate?.city}</span>
                                <span>•</span>
                                <span>{collection.licensePlate?.state}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(collection.spottedDate).toLocaleDateString('de-DE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                            {!isViewingOtherUser && (
                              <div className="shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemove(collection.id)}
                                  disabled={deleting === collection.id}
                                  className="min-h-[44px] min-w-[44px] touch-manipulation text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <TableComponent>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Stadt</TableHead>
                            <TableHead>Bundesland</TableHead>
                            <TableHead>Gesichtet am</TableHead>
                            {!isViewingOtherUser && <TableHead className="text-right">Aktion</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedCollections.map((collection) => (
                            <TableRow key={collection.id}>
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
                              {!isViewingOtherUser && (
                                <TableCell className="text-right">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRemove(collection.id)}
                                    disabled={deleting === collection.id}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {deleting === collection.id ? 'Entfernt...' : 'Entfernen'}
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </TableComponent>
                    </Card>
                  )
                ) : (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedCollections.map((collection) => (
                      <Card key={collection.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-2xl">
                              {collection.licensePlate?.code}
                            </CardTitle>
                            {!isViewingOtherUser && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(collection.id)}
                                disabled={deleting === collection.id}
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
                    ))}
                  </div>
                )}
                
                {totalPages > 1 && (
                  <div className="mt-6">
                    {renderPagination()}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

