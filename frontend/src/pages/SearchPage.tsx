import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import SaveToCollectionModal from '../components/SaveToCollectionModal';
import Button from '../components/ui/Button';
import { useNasaStore } from '../stores/nasa.store';
import type { NasaImage } from '../types';

const MISSION_CHIPS = ['Apollo', 'Hubble', 'Mars', 'ISS', 'Artemis', 'Voyager', 'Cassini'];
const CURRENT_YEAR = new Date().getFullYear();

export default function SearchPage() {
  const { results, total, page, query, isLoading, search, semanticSearch, translatedKeywords } =
    useNasaStore();

  const [input, setInput] = useState('');
  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSemantic, setIsSemantic] = useState(false);
  const [selected, setSelected] = useState<NasaImage | null>(null);

  function getFilters() {
    return {
      yearStart: yearStart ? Number(yearStart) : undefined,
      yearEnd: yearEnd ? Number(yearEnd) : undefined,
    };
  }

  async function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!input.trim()) return;
    if (isSemantic) {
      await semanticSearch(input.trim());
    } else {
      const { yearStart: ys, yearEnd: ye } = getFilters();
      await search(input.trim(), 1, ys, ye);
    }
  }

  function handleMissionChip(mission: string) {
    const next = input.includes(mission)
      ? input.replace(mission, '').trim()
      : `${input} ${mission}`.trim();
    setInput(next);
  }

  async function handlePage(next: number) {
    const { yearStart: ys, yearEnd: ye } = getFilters();
    await search(query, next, ys, ye);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = Math.ceil(total / 20);
  const hasActiveFilters = !!yearStart || !!yearEnd;

  return (
    <AppLayout>
      <h1 className="mb-6 text-2xl font-bold text-white">Search NASA Images</h1>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-1 w-fit text-xs">
        <button
          onClick={() => setIsSemantic(false)}
          className={`rounded-md px-3 py-1.5 transition ${!isSemantic ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Keyword
        </button>
        <button
          onClick={() => setIsSemantic(true)}
          className={`rounded-md px-3 py-1.5 transition ${isSemantic ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          ✨ Semantic
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isSemantic
                ? '"sunsets on Mars" o "galaxias espirales azules"'
                : 'Search stars, galaxies, Mars...'
            }
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500"
          />
          <Button type="submit" loading={isLoading}>
            Search
          </Button>
          {!isSemantic && (
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                hasActiveFilters
                  ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                  : 'border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Filters {hasActiveFilters && '•'}
            </button>
          )}
        </div>

        {isSemantic && (
          <p className="text-xs text-slate-500">
            Describe what you want in any language — AI finds the best NASA images for you.
          </p>
        )}

        {translatedKeywords && isSemantic && (
          <p className="text-xs text-slate-400">
            🔍 Searched for:{' '}
            <span className="font-medium text-violet-400">{translatedKeywords}</span>
          </p>
        )}

        {showFilters && !isSemantic && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-400">Year from</label>
                <input
                  type="number"
                  min="1920"
                  max={CURRENT_YEAR}
                  value={yearStart}
                  onChange={(e) => setYearStart(e.target.value)}
                  placeholder="e.g. 1969"
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-400">Year to</label>
                <input
                  type="number"
                  min="1920"
                  max={CURRENT_YEAR}
                  value={yearEnd}
                  onChange={(e) => setYearEnd(e.target.value)}
                  placeholder={String(CURRENT_YEAR)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-slate-400">Mission</p>
              <div className="flex flex-wrap gap-2">
                {MISSION_CHIPS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMissionChip(m)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      input.includes(m)
                        ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => { setYearStart(''); setYearEnd(''); }}
                className="mt-3 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </form>

      {!isLoading && results.length === 0 && query && (
        <div className="mt-16 text-center text-slate-400">No results for "{query}".</div>
      )}

      {!isLoading && results.length === 0 && !query && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <span className="text-5xl">🔭</span>
          <p className="text-slate-400">Search for anything in the NASA image library.</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {MISSION_CHIPS.map((m) => (
              <button
                key={m}
                onClick={() => { setInput(m); void search(m); }}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400 transition hover:border-violet-500 hover:text-violet-400"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="mt-4 text-sm text-slate-500">
            {total.toLocaleString()} results — page {page} of {totalPages}
            {hasActiveFilters && (
              <span className="ml-2 text-violet-400">
                {yearStart && `from ${yearStart}`} {yearEnd && `to ${yearEnd}`}
              </span>
            )}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((img) => (
              <div
                key={img.nasaId}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition hover:border-violet-500/40"
              >
                {img.url ? (
                  <img src={img.url} alt={img.title} className="h-44 w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-slate-800 text-4xl">🌌</div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <p className="text-sm font-medium text-white line-clamp-2">{img.title}</p>
                  {img.date && (
                    <p className="text-xs text-slate-500">{new Date(img.date).toLocaleDateString()}</p>
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
              <Button variant="ghost" disabled={page <= 1} onClick={() => void handlePage(page - 1)}>
                ← Previous
              </Button>
              <span className="text-sm text-slate-400">{page} / {totalPages}</span>
              <Button variant="ghost" disabled={page >= totalPages} onClick={() => void handlePage(page + 1)}>
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
