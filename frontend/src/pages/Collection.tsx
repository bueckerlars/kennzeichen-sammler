import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { collectionApi } from '../services/api';
import type { ViewType } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { useAuth } from '../context/AuthContext';
import { PaginationControls } from '../components/PaginationControls';
import { CollectionHeader } from '../components/CollectionHeader';
import { CollectionItem } from '../components/CollectionItem';
import { CollectionTableRow } from '../components/CollectionTableRow';
import { CollectionCard } from '../components/CollectionCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import {
  Table as TableComponent,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { usePagination } from '../hooks/usePagination';

export default function Collection() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewedUsername, setViewedUsername] = useState<string | null>(null);
  const isViewingOtherUser = userId && userId !== user?.id;
  const fromLeaderboard = searchParams.get('from') === 'leaderboard';
  
  // View state
  const view = (isMobile ? 'table' : (searchParams.get('view') || 'gallery')) as ViewType;
  
  // Pagination
  const { page, totalPages, startIndex, endIndex, handlePageChange } = usePagination({
    totalItems: collections.length,
  });
  const paginatedCollections = collections.slice(startIndex, endIndex);

  useEffect(() => {
    loadCollection();
  }, [userId]);

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

  const handleViewChange = (newView: ViewType) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', newView);
    params.set('page', '1'); // Reset to first page when changing view
    setSearchParams(params);
  };

  if (loading) {
    return <LoadingState fullScreen />;
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
          <CollectionHeader
            title={isViewingOtherUser ? `Sammlung von ${viewedUsername || '...'}` : 'Meine Sammlung'}
            view={view}
            onViewChange={handleViewChange}
            isMobile={isMobile}
            showViewToggle={collections.length > 0}
          />
          <CardContent className={isMobile ? 'p-3' : ''}>
            {collections.length === 0 ? (
              <EmptyState
                message={isViewingOtherUser 
                  ? `Die Sammlung von ${viewedUsername || 'diesem Nutzer'} ist noch leer.`
                  : 'Deine Sammlung ist noch leer. Beginne mit der Suche!'}
                useCard={false}
              />
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
                          style={{ animationDelay: `${0.1 + index * 0.02}s` }}
                        >
                          <CollectionItem
                            collection={collection}
                            onRemove={!isViewingOtherUser ? () => handleRemove(collection.id) : undefined}
                            deleting={deleting === collection.id}
                            showRemove={!isViewingOtherUser}
                          />
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
                            <CollectionTableRow
                              key={collection.id}
                              collection={collection}
                              onRemove={!isViewingOtherUser ? () => handleRemove(collection.id) : undefined}
                              deleting={deleting === collection.id}
                              showRemove={!isViewingOtherUser}
                            />
                          ))}
                        </TableBody>
                      </TableComponent>
                    </Card>
                  )
                ) : (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedCollections.map((collection) => (
                      <CollectionCard
                        key={collection.id}
                        collection={collection}
                        onRemove={!isViewingOtherUser ? () => handleRemove(collection.id) : undefined}
                        deleting={deleting === collection.id}
                        showRemove={!isViewingOtherUser}
                      />
                    ))}
                  </div>
                )}
                
                {totalPages > 1 && (
                  <div className="mt-6">
                    <PaginationControls
                      page={page}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      isMobile={isMobile}
                    />
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

