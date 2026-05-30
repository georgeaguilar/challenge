import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '../prisma/prisma.module';
import { AiSummaryController } from './ai-summary.controller';
import { GenerateSummaryHandler } from './commands/generate-summary/generate-summary.handler';
import { SuggestTagsHandler } from './queries/suggest-tags/suggest-tags.handler';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [AiSummaryController],
  providers: [GenerateSummaryHandler, SuggestTagsHandler],
})
export class AiSummaryModule {}
