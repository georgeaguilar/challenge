import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../../prisma/prisma.service';
import { GenerateSummaryCommand } from './generate-summary.command';

@CommandHandler(GenerateSummaryCommand)
export class GenerateSummaryHandler implements ICommandHandler<GenerateSummaryCommand> {
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  async execute(command: GenerateSummaryCommand) {
    const { imageId, collectionId, userId } = command;

    const image = await this.prisma.collectionImage.findUnique({
      where: { id: imageId },
      include: { collection: true },
    });

    if (!image || image.collectionId !== collectionId)
      throw new NotFoundException('Image not found');
    if (image.collection.userId !== userId) throw new ForbiddenException();

    const prompt = [
      `Title: ${image.title}`,
      image.date ? `Date: ${image.date}` : null,
      image.description ? `Description: ${image.description}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a space expert. Write a concise, engaging 2-3 sentence summary of the NASA image based on the provided metadata.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
    });

    const aiSummary = completion.choices[0]?.message?.content ?? '';

    return this.prisma.collectionImage.update({
      where: { id: imageId },
      data: { aiSummary },
    });
  }
}
