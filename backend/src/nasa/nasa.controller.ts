import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchImagesQuery } from './queries/search-images/search-images.query';
import { GetImageQuery } from './queries/get-image/get-image.query';
import { SemanticSearchQuery } from './queries/semantic-search/semantic-search.query';

@UseGuards(JwtAuthGuard)
@Controller('nasa')
export class NasaController {
  constructor(private readonly queryBus: QueryBus) {}

  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Get('search')
  search(
    @Query('q') q: string,
    @Query('page') page = 1,
    @Query('year_start') yearStart?: string,
    @Query('year_end') yearEnd?: string,
  ) {
    return this.queryBus.execute(
      new SearchImagesQuery(
        q,
        Number(page),
        yearStart ? Number(yearStart) : undefined,
        yearEnd ? Number(yearEnd) : undefined,
      ),
    );
  }

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Get('semantic-search')
  semanticSearch(@Query('q') q: string, @Query('page') page = 1) {
    return this.queryBus.execute(new SemanticSearchQuery(q, Number(page)));
  }

  @Get('images/:nasaId')
  getImage(@Param('nasaId') nasaId: string) {
    return this.queryBus.execute(new GetImageQuery(nasaId));
  }
}
