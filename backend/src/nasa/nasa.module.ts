import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { NasaController } from './nasa.controller';
import { SearchImagesHandler } from './queries/search-images/search-images.handler';
import { GetImageHandler } from './queries/get-image/get-image.handler';

const QueryHandlers = [SearchImagesHandler, GetImageHandler];

@Module({
  imports: [CqrsModule, HttpModule],
  controllers: [NasaController],
  providers: [...QueryHandlers],
})
export class NasaModule {}
