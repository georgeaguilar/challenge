import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '../prisma/prisma.module';
import { CollectionImagesController } from './collection-images.controller';
import { AddImageHandler } from './commands/add-image/add-image.handler';
import { RemoveImageHandler } from './commands/remove-image/remove-image.handler';
import { AddTagHandler } from './commands/add-tag/add-tag.handler';
import { RemoveTagHandler } from './commands/remove-tag/remove-tag.handler';
import { GetCollectionImageHandler } from './queries/get-collection-image/get-collection-image.handler';

const CommandHandlers = [
  AddImageHandler,
  RemoveImageHandler,
  AddTagHandler,
  RemoveTagHandler,
];

const QueryHandlers = [GetCollectionImageHandler];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [CollectionImagesController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class CollectionImagesModule {}
