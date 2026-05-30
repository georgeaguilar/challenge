import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SearchImagesQuery } from './search-images.query';

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
  collection: {
    items: NasaItem[];
    metadata: { total_hits: number };
  };
}

@QueryHandler(SearchImagesQuery)
export class SearchImagesHandler implements IQueryHandler<SearchImagesQuery> {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async execute(query: SearchImagesQuery) {
    const baseUrl = this.config.get<string>('NASA_BASE_URL');
    const { data } = await firstValueFrom(
      this.http.get<NasaSearchResponse>(`${baseUrl}/search`, {
        params: {
          q: query.q,
          media_type: query.mediaType,
          page: query.page,
          ...(query.yearStart && { year_start: query.yearStart }),
          ...(query.yearEnd && { year_end: query.yearEnd }),
        },
      }),
    );

    const items = data.collection?.items ?? [];

    return {
      total: data.collection?.metadata?.total_hits ?? 0,
      page: query.page,
      results: items.map((item) => ({
        nasaId: item.data[0].nasa_id,
        title: item.data[0].title,
        description: item.data[0].description ?? null,
        date: item.data[0].date_created ?? null,
        url: item.links?.find((l) => l.rel === 'preview')?.href ?? null,
      })),
    };
  }
}
