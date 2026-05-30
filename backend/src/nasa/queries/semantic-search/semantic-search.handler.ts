import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import OpenAI from 'openai';
import { SemanticSearchQuery } from './semantic-search.query';

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

@QueryHandler(SemanticSearchQuery)
export class SemanticSearchHandler implements IQueryHandler<SemanticSearchQuery> {
  private readonly openai: OpenAI;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.openai = new OpenAI({ apiKey: this.config.get<string>('OPENAI_API_KEY') });
  }

  async execute(query: SemanticSearchQuery) {
    const keywords = await this.translateToKeywords(query.naturalQuery);
    const baseUrl = this.config.get<string>('NASA_BASE_URL');

    const { data } = await firstValueFrom(
      this.http.get<NasaSearchResponse>(`${baseUrl}/search`, {
        params: {
          q: keywords,
          media_type: 'image',
          page: query.page,
        },
      }),
    );

    const items = data.collection?.items ?? [];

    return {
      total: data.collection?.metadata?.total_hits ?? 0,
      page: query.page,
      keywords,
      results: items.map((item) => ({
        nasaId: item.data[0].nasa_id,
        title: item.data[0].title,
        description: item.data[0].description ?? null,
        date: item.data[0].date_created ?? null,
        url: item.links?.find((l) => l.rel === 'preview')?.href ?? null,
      })),
    };
  }

  private async translateToKeywords(naturalQuery: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a NASA image search expert. Convert the user query into 3-5 optimized English keywords for the NASA Image Library API. Return ONLY the keywords separated by spaces, nothing else.',
        },
        { role: 'user', content: naturalQuery },
      ],
      max_tokens: 30,
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content?.trim() ?? naturalQuery;
  }
}
