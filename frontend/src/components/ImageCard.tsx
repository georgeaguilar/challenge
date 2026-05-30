import { useState } from 'react';
import { api } from '../lib/api';
import type { CollectionImage } from '../types';

interface ImageCardProps {
  image: CollectionImage;
  collectionId: string;
  onRemove: (imageId: string) => void;
  onUpdate: (image: CollectionImage) => void;
}

export default function ImageCard({ image, collectionId, onRemove, onUpdate }: ImageCardProps) {
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showTags, setShowTags] = useState(false);

  async function handleGenerateSummary() {
    setLoadingSummary(true);
    try {
      const { data } = await api.post<CollectionImage>(
        `/collections/${collectionId}/images/${image.id}/summary`,
      );
      onUpdate(data);
    } finally {
      setLoadingSummary(false);
    }
  }

  async function handleAddTag(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!newTag.trim()) return;
    await api.post(`/collections/${collectionId}/images/${image.id}/tags`, {
      name: newTag.trim().toLowerCase(),
    });
    const { data } = await api.get<CollectionImage>(
      `/collections/${collectionId}/images/${image.id}`,
    );
    onUpdate(data);
    setNewTag('');
  }

  async function handleRemoveTag(tagId: string) {
    await api.delete(`/collections/${collectionId}/images/${image.id}/tags/${tagId}`);
    const { data } = await api.get<CollectionImage>(
      `/collections/${collectionId}/images/${image.id}`,
    );
    onUpdate(data);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      {image.url ? (
        <img
          src={image.url}
          alt={image.title}
          className="h-48 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-48 items-center justify-center bg-slate-800 text-4xl">🌌</div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-semibold text-white line-clamp-2 text-sm">{image.title}</h3>

        {image.date && (
          <p className="text-xs text-slate-500">{new Date(image.date).toLocaleDateString()}</p>
        )}

        {image.aiSummary ? (
          <p className="text-xs text-slate-400 line-clamp-3 italic">"{image.aiSummary}"</p>
        ) : (
          <button
            onClick={handleGenerateSummary}
            disabled={loadingSummary}
            className="w-fit rounded-lg border border-violet-500/40 px-3 py-1.5 text-xs text-violet-400 transition hover:bg-violet-500/10 disabled:opacity-50"
          >
            {loadingSummary ? '✨ Generating...' : '✨ Generate AI summary'}
          </button>
        )}

        <div className="flex flex-wrap gap-1">
          {image.tags?.map((it) => (
            <span
              key={it.tagId}
              className="group flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
            >
              #{it.tag.name}
              <button
                onClick={() => void handleRemoveTag(it.tagId)}
                className="hidden text-slate-500 hover:text-red-400 group-hover:inline"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <button
          onClick={() => setShowTags((v) => !v)}
          className="w-fit text-xs text-slate-500 hover:text-slate-300"
        >
          + add tag
        </button>

        {showTags && (
          <form onSubmit={handleAddTag} className="flex gap-2">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="tag name"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs text-white hover:bg-violet-500"
            >
              Add
            </button>
          </form>
        )}

        <div className="mt-auto pt-2">
          <button
            onClick={() => onRemove(image.id)}
            className="text-xs text-slate-600 hover:text-red-400"
          >
            Remove from collection
          </button>
        </div>
      </div>
    </div>
  );
}
