import { create } from 'zustand';
import { api } from '../lib/api';
import type { NasaImage, NasaSearchResult } from '../types';

interface NasaState {
  results: NasaImage[];
  total: number;
  page: number;
  query: string;
  currentImage: NasaImage | null;
  isLoading: boolean;
  error: string | null;
  search: (q: string, page?: number) => Promise<void>;
  fetchImage: (nasaId: string) => Promise<void>;
  clearResults: () => void;
}

export const useNasaStore = create<NasaState>((set) => ({
  results: [],
  total: 0,
  page: 1,
  query: '',
  currentImage: null,
  isLoading: false,
  error: null,

  search: async (q, page = 1) => {
    set({ isLoading: true, error: null, query: q, page });
    try {
      const { data } = await api.get<NasaSearchResult>('/nasa/search', {
        params: { q, page },
      });
      set({ results: data.results, total: data.total, page: data.page });
    } catch {
      set({ error: 'Failed to search NASA images' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchImage: async (nasaId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<NasaImage>(`/nasa/images/${nasaId}`);
      set({ currentImage: data });
    } catch {
      set({ error: 'Failed to load image' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearResults: () => set({ results: [], total: 0, page: 1, query: '' }),
}));
