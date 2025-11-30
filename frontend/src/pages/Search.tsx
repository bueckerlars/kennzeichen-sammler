import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { licensePlateApi, collectionApi } from '../services/api';
import type { LicensePlate } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LicensePlate[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

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
      alert('Kennzeichen zur Sammlung hinzugefügt!');
    } catch (error: any) {
      if (error.response?.status === 409) {
        alert('Dieses Kennzeichen ist bereits in deiner Sammlung!');
      } else {
        alert('Fehler beim Hinzufügen');
      }
    } finally {
      setAdding(null);
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
              <Card key={plate.id}>
                <CardHeader>
                  <CardTitle className="text-2xl">{plate.code}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Stadt:</span> {plate.city}
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
                  </div>
                </CardContent>
              </Card>
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

