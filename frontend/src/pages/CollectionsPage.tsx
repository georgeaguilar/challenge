import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import CollectionModal from '../components/CollectionModal';
import Button from '../components/ui/Button';
import { useCollectionsStore } from '../stores/collections.store';
import type { Collection } from '../types';

export default function CollectionsPage() {
  const navigate = useNavigate();
  const { collections, isLoading, fetchCollections, createCollection, updateCollection, deleteCollection } =
    useCollectionsStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);

  useEffect(() => {
    void fetchCollections();
  }, [fetchCollections]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(col: Collection) {
    setEditing(col);
    setModalOpen(true);
  }

  async function handleSave(name: string, description?: string) {
    if (editing) {
      await updateCollection(editing.id, name, description);
    } else {
      await createCollection(name, description);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this collection?')) return;
    await deleteCollection(id);
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Collections</h1>
        <Button onClick={openCreate}>+ New Collection</Button>
      </div>

      {isLoading && (
        <div className="mt-16 text-center text-slate-400">Loading...</div>
      )}

      {!isLoading && collections.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="text-5xl">🌌</span>
          <p className="text-slate-400">No collections yet. Create one to start saving NASA images.</p>
          <Button onClick={openCreate}>Create your first collection</Button>
        </div>
      )}

      {!isLoading && collections.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <div
              key={col.id}
              className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-violet-500/50 hover:bg-slate-800/60"
              onClick={() => navigate(`/collections/${col.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-white line-clamp-1">{col.name}</h2>
                <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(col); }}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); void handleDelete(col.id); }}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-700 hover:text-red-400"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {col.description && (
                <p className="text-sm text-slate-400 line-clamp-2">{col.description}</p>
              )}

              <div className="mt-auto flex items-center gap-1 text-xs text-slate-500">
                <span>🖼️</span>
                <span>{col._count?.images ?? 0} images</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CollectionModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </AppLayout>
  );
}
