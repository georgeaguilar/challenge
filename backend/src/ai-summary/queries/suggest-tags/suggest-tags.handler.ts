import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../../prisma/prisma.service';
import { SuggestTagsQuery } from './suggest-tags.query';

@QueryHandler(SuggestTagsQuery)
export class SuggestTagsHandler implements IQueryHandler<SuggestTagsQuery> {
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.openai = new OpenAI({ apiKey: this.config.get<string>('OPENAI_API_KEY') });
  }

  async execute(query: SuggestTagsQuery) {
    const image = await this.prisma.collectionImage.findUnique({
      where: { id: query.imageId },
      include: { collection: true, tags: { include: { tag: true } } },
    });

    if (!image || image.collectionId !== query.collectionId)
      throw new NotFoundException('Image not found');
    if (image.collection.userId !== query.userId) throw new ForbiddenException();

    const existingTags = image.tags.map((t) => t.tag.name);

    const prompt = [
      `Title: ${image.title}`,
      image.description ? `Description: ${image.description}` : null,
      existingTags.length ? `Already tagged: ${existingTags.join(', ')}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a NASA image archivist. Suggest 5 short, relevant tags for this space image. Return ONLY a JSON array of lowercase strings, no explanation. Example: ["mars", "crater", "surface", "curiosity", "geology"]',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 80,
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? '[]';

    try {
      const tags = JSON.parse(raw) as string[];
      return { suggestions: tags.filter((t) => !existingTags.includes(t)).slice(0, 5) };
    } catch {
      return { suggestions: [] };
    }
  }
}
