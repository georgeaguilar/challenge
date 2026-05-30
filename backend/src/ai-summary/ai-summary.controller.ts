import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GenerateSummaryCommand } from './commands/generate-summary/generate-summary.command';

interface AuthUser {
  id: string;
  email: string;
}

@UseGuards(JwtAuthGuard)
@Controller('collections/:collectionId/images/:imageId/summary')
export class AiSummaryController {
  constructor(private readonly commandBus: CommandBus) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post()
  generate(
    @Param('collectionId') collectionId: string,
    @Param('imageId') imageId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.commandBus.execute(
      new GenerateSummaryCommand(imageId, collectionId, user.id),
    );
  }
}
