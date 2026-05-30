import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GenerateSummaryCommand } from './commands/generate-summary/generate-summary.command';
import { SuggestTagsQuery } from './queries/suggest-tags/suggest-tags.query';

interface AuthUser {
  id: string;
  email: string;
}

@UseGuards(JwtAuthGuard)
@Controller('collections/:collectionId/images/:imageId')
export class AiSummaryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('summary')
  generate(
    @Param('collectionId') collectionId: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commandBus.execute(
      new GenerateSummaryCommand(imageId, collectionId, user.id),
    );
  }

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Get('tags/suggestions')
  suggestTags(
    @Param('collectionId') collectionId: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.queryBus.execute(new SuggestTagsQuery(imageId, collectionId, user.id));
  }
}
