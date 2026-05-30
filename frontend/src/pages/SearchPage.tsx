import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import SaveToCollectionModal from '../components/SaveToCollectionModal';
import Button from '../components/ui/Button';
import { useNasaStore } from '../stores/nasa.store';
import type { NasaImage } from '../types';

export default function SearchPage() {
  const { results, total, page, query, isLoading, search } = useNasaStore();
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState<NasaImage | null>(null);

  async function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!input.trim()) return;
    await search(input.trim());
  }

  async function handlePage(next: number) {
    await search(query, next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <AppLayout>
      <h1 className="mb-6 text-2xl font-bold text-white">Search NASA Images</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search stars, galaxies, Mars..."
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500"
        />
        <Button type="submit" loading={isLoading}>
          Search
        </Button>
      </form>

      {!isLoading && results.length === 0 && query && (
        <div className="mt-16 text-center text-slate-400">No results for "{query}".</div>
      )}

      {!isLoading && results.length === 0 && !query && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <span className="text-5xl">🔭</span>
          <p className="text-slate-400">Search for anything in the NASA image library.</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="mt-4 text-sm text-slate-500">
            {total.toLocaleString()} results — page {page} of {totalPages}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((img) => (
              <div
                key={img.nasaId}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition hover:border-violet-500/40"
              >
                {img.url ? (
                  <img
                    src={img.url}
                    alt={img.title}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-slate-800 text-4xl">
                    🌌
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-2 p-3">
                  <p className="text-sm font-medium text-white line-clamp-2">{img.title}</p>
                  {img.date && (
                    <p className="text-xs text-slate-500">
                      {new Date(img.date).toLocaleDateString()}
                    </p>
                  )}
                  <div className="mt-auto pt-1">
                    <button
                      onClick={() => setSelected(img)}
                      className="w-full rounded-lg border border-violet-500/40 py-1.5 text-xs font-medium text-violet-400 transition hover:bg-violet-500/10"
                    >
                      + Save to collection
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                disabled={page <= 1}
                onClick={() => void handlePage(page - 1)}
              >
                ← Previous
              </Button>
              <span className="text-sm text-slate-400">
                {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                disabled={page >= totalPages}
                onClick={() => void handlePage(page + 1)}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}

      <SaveToCollectionModal image={selected} onClose={() => setSelected(null)} />
    </AppLayout>
  );
}
