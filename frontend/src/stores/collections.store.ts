import { create } from 'zustand';
import { api } from '../lib/api';
import type { Collection, CollectionWithImages } from '../types';

interface CollectionsState {
  collections: Collection[];
  currentCollection: CollectionWithImages | null;
  isLoading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  fetchCollection: (id: string) => Promise<void>;
  createCollection: (name: string, description?: string) => Promise<Collection>;
  updateCollection: (id: string, name?: string, description?: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  clearCurrent: () => void;
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: [],
  currentCollection: null,
  isLoading: false,
  error: null,

  fetchCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Collection[]>('/collections');
      set({ collections: data });
    } catch {
      set({ error: 'Failed to load collections' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCollection: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<CollectionWithImages>(`/collections/${id}`);
      set({ currentCollection: data });
    } catch {
      set({ error: 'Failed to load collection' });
    } finally {
      set({ isLoading: false });
    }
  },

  createCollection: async (name, description) => {
    const { data } = await api.post<Collection>('/collections', { name, description });
    set((state) => ({ collections: [data, ...state.collections] }));
    return data;
  },

  updateCollection: async (id, name, description) => {
    const { data } = await api.patch<Collection>(`/collections/${id}`, { name, description });
    set((state) => ({
      collections: state.collections.map((c) => (c.id === id ? data : c)),
      currentCollection:
        state.currentCollection?.id === id
          ? { ...state.currentCollection, ...data }
          : state.currentCollection,
    }));
  },

  deleteCollection: async (id) => {
    await api.delete(`/collections/${id}`);
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
      currentCollection: state.currentCollection?.id === id ? null : state.currentCollection,
    }));
  },

  clearCurrent: () => set({ currentCollection: null }),
}));
