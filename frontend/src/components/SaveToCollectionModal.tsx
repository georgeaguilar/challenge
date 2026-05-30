import { useEffect, useState } from 'react';
import { useCollectionsStore } from '../stores/collections.store';
import { api } from '../lib/api';
import type { NasaImage } from '../types';
import Button from './ui/Button';

interface SaveToCollectionModalProps {
  image: NasaImage | null;
  onClose: () => void;
}

export default function SaveToCollectionModal({ image, onClose }: SaveToCollectionModalProps) {
  const { collections, fetchCollections } = useCollectionsStore();
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    if (image) void fetchCollections();
  }, [image, fetchCollections]);

  async function handleSave(collectionId: string) {
    if (!image) return;
    setSaving(collectionId);
    try {
      await api.post(`/collections/${collectionId}/images`, {
        nasaId: image.nasaId,
        title: image.title,
        url: image.url ?? '',
        date: image.date ?? undefined,
        description: image.description ?? undefined,
      });
      setSaved((prev) => [...prev, collectionId]);
    } finally {
      setSaving(null);
    }
  }

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h2 className="mb-1 text-lg font-semibold text-white">Save to collection</h2>
        <p className="mb-5 text-sm text-slate-400 line-clamp-1">{image.title}</p>

        {collections.length === 0 ? (
          <p className="text-sm text-slate-500">No collections yet. Create one first.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {collections.map((col) => {
              const isSaved = saved.includes(col.id);
              return (
                <li
                  key={col.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 px-4 py-3"
                >
                  <span className="text-sm text-white">{col.name}</span>
                  <Button
                    variant={isSaved ? 'ghost' : 'primary'}
                    loading={saving === col.id}
                    disabled={isSaved}
                    onClick={() => void handleSave(col.id)}
                    className="text-xs px-3 py-1.5"
                  >
                    {isSaved ? '✓ Saved' : 'Save'}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
