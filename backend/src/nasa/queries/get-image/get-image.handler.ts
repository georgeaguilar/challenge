import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { GetImageQuery } from './get-image.query';

interface NasaImageData {
  nasa_id: string;
  title: string;
  description?: string;
  date_created?: string;
}

interface NasaLink {
  href: string;
  rel: string;
}

interface NasaItem {
  data: NasaImageData[];
  links?: NasaLink[];
}

interface NasaSearchResponse {
  collection: { items: NasaItem[] };
}

interface NasaAssetItem {
  href: string;
}

interface NasaAssetResponse {
  collection: { items: NasaAssetItem[] };
}

@QueryHandler(GetImageQuery)
export class GetImageHandler implements IQueryHandler<GetImageQuery> {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async execute(query: GetImageQuery) {
    const baseUrl = this.config.get<string>('NASA_BASE_URL');
    try {
      const [metaRes, assetRes] = await Promise.all([
        firstValueFrom(
          this.http.get<NasaSearchResponse>(`${baseUrl}/search`, {
            params: {
              nasa_id: query.nasaId,
              media_type: 'image',
              api_key: this.config.get<string>('NASA_API_KEY'),
            },
          }),
        ),
        firstValueFrom(
          this.http.get<NasaAssetResponse>(`${baseUrl}/asset/${query.nasaId}`),
        ),
      ]);

      const item = metaRes.data.collection?.items?.[0];
      if (!item) throw new NotFoundException('NASA image not found');

      const meta = item.data[0];
      const imageUrl =
        assetRes.data.collection?.items?.find((i) =>
          i.href.match(/\.(jpg|jpeg|png|gif)$/i),
        )?.href ??
        item.links?.[0]?.href ??
        null;

      return {
        nasaId: meta.nasa_id,
        title: meta.title,
        description: meta.description ?? null,
        date: meta.date_created ?? null,
        url: imageUrl,
      };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new NotFoundException('NASA image not found');
    }
  }
}
