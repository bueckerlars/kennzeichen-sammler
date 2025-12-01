import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { statisticsApi, licensePlateApi } from '../services/api';
import type { Statistics, LicensePlate, SearchResult } from '../types';
import { UserMenu } from '../components/UserMenu';
import { MobileUserMenu } from '../components/MobileUserMenu';
import { SearchInput } from '../components/SearchInput';
import { DashboardStatistics } from '../components/DashboardStatistics';
import { DashboardStateList } from '../components/DashboardStateList';
import { DashboardQuickActions } from '../components/DashboardQuickActions';
import { LoadingState } from '../components/LoadingState';
import { useToast } from '../hooks/use-toast';
import { useIsMobile } from '../hooks/use-mobile';
import { useCollection } from '../hooks/useCollection';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LicensePlate[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const { collections, addToCollection, removeFromCollection } = useCollection();

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const stats = await statisticsApi.getUserStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to load statistics', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);


  // Helper function to check if results have actually changed
  const resultsChanged = (oldResults: LicensePlate[], newResults: LicensePlate[]): boolean => {
    if (oldResults.length !== newResults.length) {
      return true;
    }
    const oldIds = new Set(oldResults.map(r => r.id));
    const newIds = new Set(newResults.map(r => r.id));
    if (oldIds.size !== newIds.size) {
      return true;
    }
    for (const id of oldIds) {
      if (!newIds.has(id)) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const searchPlates = async () => {
      if (searchQuery.length < 1) {
        setSearchResults([]);
        setSearchTotal(0);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      try {
        const result = await licensePlateApi.search(searchQuery);
        // Backend always returns SearchResult now
        const searchResult = result as SearchResult;
        const plates = searchResult.data;
        // Only update results if they have actually changed
        setSearchResults((prevResults) => {
          if (resultsChanged(prevResults, plates)) {
            return plates;
          }
          return prevResults;
        });
        // Always use total from SearchResult for accurate count
        setSearchTotal(searchResult.total);
      } catch (error) {
        console.error('Search failed', error);
        setSearchResults([]);
        setSearchTotal(0);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPlates, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAddToCollection = async (plateId: string) => {
    setAdding(plateId);
    try {
      await addToCollection(plateId);
      toast({
        variant: 'success',
        title: 'Erfolgreich hinzugefügt',
        description: 'Das Kennzeichen wurde zu deiner Sammlung hinzugefügt.',
      });
      // Reload statistics to update counts
      const stats = await statisticsApi.getUserStatistics();
      setStatistics(stats);
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
      await removeFromCollection(collectionId);
      toast({
        variant: 'success',
        title: 'Entfernt',
        description: 'Das Kennzeichen wurde aus deiner Sammlung entfernt.',
      });
      // Reload statistics to update counts
      const stats = await statisticsApi.getUserStatistics();
      setStatistics(stats);
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

  if (loading) {
    return <LoadingState fullScreen />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {isMobile && <div className="h-20" />}
      {/* Floating Search Bar and Avatar on Mobile */}
      {isMobile && (
        <div className="fixed top-4 left-4 right-4 z-50 md:hidden flex items-center gap-3">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              results={searchResults}
              total={searchTotal}
              loading={searchLoading}
              collections={collections}
              onAdd={handleAddToCollection}
              onRemove={handleRemoveFromCollection}
              adding={adding}
              removing={removing}
              isMobile
            />
          </div>
          <div className="shrink-0">
            <MobileUserMenu />
          </div>
        </div>
      )}

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {!isMobile && (
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Willkommen, {user?.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                results={searchResults}
                total={searchTotal}
                loading={searchLoading}
                collections={collections}
                onAdd={handleAddToCollection}
                onRemove={handleRemoveFromCollection}
                adding={adding}
                removing={removing}
                isMobile={false}
              />
              <UserMenu />
            </div>
          </div>
        )}

        {statistics && <DashboardStatistics statistics={statistics} isMobile={isMobile} />}

        {!isMobile && <DashboardQuickActions />}

        {statistics && statistics.byState.length > 0 && (
          <DashboardStateList states={statistics.byState} isMobile={isMobile} />
        )}
      </div>
    </div>
  );
}

