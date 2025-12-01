import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collectionApi } from '../services/api';
import type { UserCollection } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { MobileUserMenu } from '../components/MobileUserMenu';

export default function Collection() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    <div className="min-h-screen pb-20 md:pb-0">
      <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto px-4 py-8'}`}>
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

        <Card className={`${isMobile ? 'mb-4' : 'mb-6'} w-full`} data-onboarding="collection">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Meine Sammlung
              </CardTitle>
              {isMobile && (
                <div className="shrink-0">
                  <MobileUserMenu />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className={isMobile ? 'p-3' : ''}>
            {collections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Deine Sammlung ist noch leer. Beginne mit der Suche!
              </div>
            ) : isMobile ? (
          <div className="space-y-3">
            {collections.map((collection, index) => (
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
                      className="min-h-[44px] min-w-[44px] touch-manipulation"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

