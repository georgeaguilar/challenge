export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { images: number };
}

export interface CollectionImage {
  id: string;
  collectionId: string;
  nasaId: string;
  title: string;
  url: string;
  date: string | null;
  description: string | null;
  aiSummary: string | null;
  addedAt: string;
  tags?: ImageTag[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface ImageTag {
  imageId: string;
  tagId: string;
  tag: Tag;
}

export interface CollectionWithImages extends Collection {
  images: CollectionImage[];
}

export interface NasaImage {
  nasaId: string;
  title: string;
  description: string | null;
  date: string | null;
  url: string | null;
  rover?: string;
  camera?: string;
  sol?: number;
}

export interface NasaSearchResult {
  total: number;
  page: number;
  results: NasaImage[];
}
