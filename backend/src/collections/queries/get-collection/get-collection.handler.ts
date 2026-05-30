import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetCollectionQuery } from './get-collection.query';

@QueryHandler(GetCollectionQuery)
export class GetCollectionHandler implements IQueryHandler<GetCollectionQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCollectionQuery) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: query.id },
      include: { images: { orderBy: { addedAt: 'desc' } } },
    });

    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.userId !== query.userId) throw new ForbiddenException();

    return collection;
  }
}
