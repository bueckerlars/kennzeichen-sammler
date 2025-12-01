import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { statisticsApi, licensePlateApi, collectionApi } from '../services/api';
import type { Statistics, LicensePlate, UserCollection } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { UserMenu } from '../components/UserMenu';
import { useNavigate } from 'react-router-dom';
import { Search, List, Trophy, Plus, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Popover, PopoverContent, PopoverAnchor } from '../components/ui/popover';
import { useToast } from '../hooks/use-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LicensePlate[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [adding, setAdding] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Keep input focused when popover opens
  useEffect(() => {
    if (popoverOpen && inputRef.current) {
      // Small delay to ensure popover is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [popoverOpen]);

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
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      try {
        const plates = await licensePlateApi.search(searchQuery);
        // Only update results if they have actually changed
        setSearchResults((prevResults) => {
          if (resultsChanged(prevResults, plates)) {
            return plates;
          }
          return prevResults;
        });
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPlates, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close popover when search query is cleared
  useEffect(() => {
    if (searchQuery.length === 0) {
      setPopoverOpen(false);
    }
  }, [searchQuery]);

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
      await collectionApi.removeFromCollection(collectionId);
      await loadCollection();
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Willkommen, {user?.username}</p>
          </div>
          <div className="flex items-center gap-4">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverAnchor asChild>
                <div className="relative w-[500px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Suche nach Code, Stadt oder Bundesland..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!popoverOpen) {
                        setPopoverOpen(true);
                      }
                    }}
                    onFocus={() => {
                      if (searchQuery.length > 0 || searchResults.length > 0) {
                        setPopoverOpen(true);
                      }
                    }}
                    onClick={() => {
                      if (searchQuery.length > 0 || searchResults.length > 0) {
                        setPopoverOpen(true);
                      }
                    }}
                    onMouseDown={(e) => {
                      // Select all text when clicking on input that's not focused
                      if (document.activeElement !== e.currentTarget && searchQuery.length > 0) {
                        e.preventDefault();
                        inputRef.current?.focus();
                        inputRef.current?.select();
                      }
                    }}
                    className="pl-10 w-full"
                  />
                </div>
              </PopoverAnchor>
              <PopoverContent className="w-[500px] p-0" align="end" onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="max-h-[600px] overflow-y-auto">
                  {searchQuery.length > 0 && searchResults.length === 0 && !searchLoading && (
                    <div className="p-4 text-center text-muted-foreground">
                      Keine Ergebnisse gefunden
                    </div>
                  )}
                  {searchQuery.length > 0 && searchResults.length > 0 && (
                    <div className="divide-y">
                      {searchLoading && (
                        <div className="p-2 border-b bg-muted/50">
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span>Suche läuft...</span>
                          </div>
                        </div>
                      )}
                      {searchResults.map((plate) => {
                        const collectionEntry = collections.find(
                          (c) => c.licensePlateId === plate.id,
                        );
                        const inCollection = !!collectionEntry;

                        return (
                          <div key={plate.id} className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-semibold">{plate.code}</h3>
                                  {inCollection && (
                                    <span className="text-xs font-semibold text-emerald-600 border border-emerald-600 rounded px-2 py-0.5">
                                      Bereits in deiner Sammlung
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground">
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
                              </div>
                            </div>
                            {inCollection ? (
                              <Button
                                className="w-full"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  handleRemoveFromCollection(collectionEntry.id);
                                }}
                                disabled={removing === collectionEntry.id}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {removing === collectionEntry.id
                                  ? 'Wird entfernt...'
                                  : 'Aus Sammlung entfernen'}
                              </Button>
                            ) : (
                              <Button
                                className="w-full"
                                size="sm"
                                onClick={() => {
                                  handleAddToCollection(plate.id);
                                }}
                                disabled={adding === plate.id}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                {adding === plate.id
                                  ? 'Wird hinzugefügt...'
                                  : 'Zur Sammlung hinzufügen'}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <UserMenu />
          </div>
        </div>

        {statistics && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Gesamt</CardTitle>
                <CardDescription>Alle deutschen Kennzeichen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statistics.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gesammelt</CardTitle>
                <CardDescription>Deine Sammlung</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {statistics.collected}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fehlend</CardTitle>
                <CardDescription>Noch zu sammeln</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {statistics.missing}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fortschritt</CardTitle>
                <CardDescription>Prozentual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {statistics.percentage.toFixed(1)}%
                </div>
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${statistics.percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/collection')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Meine Sammlung
              </CardTitle>
              <CardDescription>
                Alle gesammelten Kennzeichen anzeigen
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/leaderboard')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Bestenliste
              </CardTitle>
              <CardDescription>
                Rangliste aller Sammler
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {statistics && statistics.byState.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Statistiken nach Bundesland</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Bundesland</th>
                      <th className="text-right p-2">Gesamt</th>
                      <th className="text-right p-2">Gesammelt</th>
                      <th className="text-right p-2">Fehlend</th>
                      <th className="text-right p-2">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.byState.map((state) => (
                      <tr key={state.state} className="border-b">
                        <td className="p-2">{state.state}</td>
                        <td className="text-right p-2">{state.total}</td>
                        <td className="text-right p-2 text-green-600">
                          {state.collected}
                        </td>
                        <td className="text-right p-2 text-orange-600">
                          {state.missing}
                        </td>
                        <td className="text-right p-2">
                          {state.total > 0
                            ? ((state.collected / state.total) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

