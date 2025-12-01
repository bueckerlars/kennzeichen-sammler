import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { licensePlateApi, collectionApi } from '../services/api';
import type { LicensePlate, UserCollection, SearchResult, ViewType } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Plus, Trash2, Search as SearchIcon, Table, Grid } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
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
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<LicensePlate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const view = (searchParams.get('view') || 'table') as ViewType;

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

  useEffect(() => {
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
  }, [query, page, limit]);

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
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && handlePageChange(page - 1)}
              className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => page < totalPages && handlePageChange(page + 1)}
              className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
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

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Kennzeichen suchen</h1>
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Suche nach Code, Stadt oder Bundesland..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {query && (
          <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
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

        {!loading && query && results.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Keine Ergebnisse gefunden
            </CardContent>
          </Card>
        )}

        {!loading && query && results.length > 0 && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              {total} Ergebnis{total !== 1 ? 'se' : ''} gefunden
            </div>

            {view === 'table' ? (
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
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((plate) => {
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
                            className="w-full mt-4"
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
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="mt-8">
              {renderPagination()}
            </div>
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

