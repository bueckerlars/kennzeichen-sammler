import { useState, useEffect, useCallback } from 'react';
import { collectionApi } from '../services/api';
import type { UserCollection } from '../types';

interface UseCollectionResult {
  collections: UserCollection[];
  loading: boolean;
  addToCollection: (plateId: string) => Promise<void>;
  removeFromCollection: (collectionId: string) => Promise<void>;
  isInCollection: (plateId: string) => boolean;
  getCollectionEntry: (plateId: string) => UserCollection | undefined;
  reload: () => Promise<void>;
}

export function useCollection(): UseCollectionResult {
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCollection = useCallback(async () => {
    try {
      const data = await collectionApi.getUserCollection();
      setCollections(data);
    } catch (error) {
      console.error('Failed to load collection', error);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const addToCollection = useCallback(async (plateId: string) => {
    await collectionApi.addToCollection(plateId);
    await loadCollection();
  }, [loadCollection]);

  const removeFromCollection = useCallback(async (collectionId: string) => {
    await collectionApi.removeFromCollection(collectionId);
    await loadCollection();
  }, [loadCollection]);

  const isInCollection = useCallback((plateId: string): boolean => {
    return collections.some((c) => c.licensePlateId === plateId);
  }, [collections]);

  const getCollectionEntry = useCallback((plateId: string): UserCollection | undefined => {
    return collections.find((c) => c.licensePlateId === plateId);
  }, [collections]);

  return {
    collections,
    loading,
    addToCollection,
    removeFromCollection,
    isInCollection,
    getCollectionEntry,
    reload: loadCollection,
  };
}

