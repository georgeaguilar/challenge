import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetCollectionsQuery } from './get-collections.query';

@QueryHandler(GetCollectionsQuery)
export class GetCollectionsHandler implements IQueryHandler<GetCollectionsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  execute(query: GetCollectionsQuery) {
    return this.prisma.collection.findMany({
      where: { userId: query.userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { images: { where: { deletedAt: null } } } } },
    });
  }
}
