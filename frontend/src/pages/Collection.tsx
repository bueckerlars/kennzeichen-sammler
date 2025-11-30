import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collectionApi } from '../services/api';
import type { UserCollection } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function Collection() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = async () => {
    try {
      const data = await collectionApi.getUserCollection();
      setCollections(data);
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
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-6">Meine Sammlung</h1>

        {collections.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Deine Sammlung ist noch leer. Beginne mit der Suche!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Card key={collection.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl">
                      {collection.licensePlate?.code}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(collection.id)}
                      disabled={deleting === collection.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
      </div>
    </div>
  );
}

