import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ImageCard from '../components/ImageCard';
import { useCollectionsStore } from '../stores/collections.store';
import { api } from '../lib/api';
import type { CollectionImage } from '../types';

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentCollection, isLoading, fetchCollection, deleteCollection } =
    useCollectionsStore();

  const [images, setImages] = useState<CollectionImage[]>([]);

  useEffect(() => {
    if (id) void fetchCollection(id);
  }, [id, fetchCollection]);

  useEffect(() => {
    if (currentCollection) setImages(currentCollection.images);
  }, [currentCollection]);

  async function handleRemove(imageId: string) {
    if (!confirm('Remove this image from the collection?')) return;
    await api.delete(`/collections/${id}/images/${imageId}`);
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  function handleUpdate(updated: CollectionImage) {
    setImages((prev) => prev.map((img) => (img.id === updated.id ? updated : img)));
  }

  async function handleDeleteCollection() {
    if (!id || !confirm('Delete this entire collection?')) return;
    await deleteCollection(id);
    navigate('/collections');
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mt-16 text-center text-slate-400">Loading...</div>
      </AppLayout>
    );
  }

  if (!currentCollection) {
    return (
      <AppLayout>
        <div className="mt-16 text-center text-slate-400">Collection not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
            <Link to="/collections" className="hover:text-slate-300">
              Collections
            </Link>
            <span>/</span>
            <span className="text-slate-300">{currentCollection.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{currentCollection.name}</h1>
          {currentCollection.description && (
            <p className="mt-1 text-slate-400">{currentCollection.description}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <Link
            to="/search"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            + Add images
          </Link>
          <button
            onClick={handleDeleteCollection}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 transition hover:border-red-500/50 hover:text-red-400"
          >
            Delete collection
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="text-5xl">🔭</span>
          <p className="text-slate-400">No images yet. Search NASA to add some!</p>
          <Link
            to="/search"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
          >
            Search NASA images
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((img) => (
            <ImageCard
              key={img.id}
              image={img}
              collectionId={currentCollection.id}
              onRemove={handleRemove}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
