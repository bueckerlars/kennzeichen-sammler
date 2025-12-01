import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { licensePlateApi, collectionApi } from '../services/api';
import type { LicensePlate, UserCollection } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export default function Search() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LicensePlate[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadCollection = async () => {
    try {
      const data = await collectionApi.getUserCollection();
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collection for search page', error);
    }
  };

  useEffect(() => {
    // Initial Sammlung laden, damit Suchergebnisse markieren können,
    // welche Kennzeichen bereits gesammelt sind.
    loadCollection();
  }, []);

  useEffect(() => {
    const searchPlates = async () => {
      if (query.length < 1) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const plates = await licensePlateApi.search(query);
        setResults(plates);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPlates, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleAddToCollection = async (plateId: string) => {
    setAdding(plateId);
    try {
      await collectionApi.addToCollection(plateId);
      toast({
        variant: 'success',
        title: 'Erfolgreich hinzugefügt',
        description: 'Das Kennzeichen wurde zu deiner Sammlung hinzugefügt.',
      });
      // Clear search after successful add
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
      console.error('Failed to remove from collection from search page', error);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Das Kennzeichen konnte nicht entfernt werden.',
      });
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Kennzeichen suchen</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Suche nach Code, Stadt oder Bundesland..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {loading && <div className="text-center py-8">Lädt...</div>}

        {!loading && results.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((plate) => (
              (() => {
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
                          <span className="ml-2 text-xs font-semibold text-emerald-600 border border-emerald-600 rounded px-2 py-0.5">
                            Bereits in deiner Sammlung
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold">Stadt:</span>{' '}
                          {plate.city}
                        </div>
                        {plate.region && (
                          <div>
                            <span className="font-semibold">Region:</span>{' '}
                            {plate.region}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold">Bundesland:</span>{' '}
                          {plate.state}
                        </div>
                        {inCollection ? (
                          <Button
                            className="w-full mt-4"
                            variant="destructive"
                            onClick={() =>
                              handleRemoveFromCollection(collectionEntry.id)
                            }
                            disabled={removing === collectionEntry.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {removing === collectionEntry.id
                              ? 'Wird entfernt...'
                              : 'Aus Sammlung entfernen'}
                          </Button>
                        ) : (
                          <Button
                            className="w-full mt-4"
                            onClick={() => handleAddToCollection(plate.id)}
                            disabled={adding === plate.id}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {adding === plate.id
                              ? 'Wird hinzugefügt...'
                              : 'Zur Sammlung hinzufügen'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()
            ))}
          </div>
        )}

        {!loading && query.length > 0 && results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Keine Ergebnisse gefunden
          </div>
        )}

        {!loading && query.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Beginne mit der Suche...
          </div>
        )}
      </div>
    </div>
  );
}

