import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '../prisma/prisma.module';
import { CollectionsController } from './collections.controller';
import { CreateCollectionHandler } from './commands/create-collection/create-collection.handler';
import { UpdateCollectionHandler } from './commands/update-collection/update-collection.handler';
import { DeleteCollectionHandler } from './commands/delete-collection/delete-collection.handler';
import { GetCollectionsHandler } from './queries/get-collections/get-collections.handler';
import { GetCollectionHandler } from './queries/get-collection/get-collection.handler';

const CommandHandlers = [
  CreateCollectionHandler,
  UpdateCollectionHandler,
  DeleteCollectionHandler,
];

const QueryHandlers = [
  GetCollectionsHandler,
  GetCollectionHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [CollectionsController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class CollectionsModule {}
