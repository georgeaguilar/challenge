import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetCollectionImageQuery } from './get-collection-image.query';

@QueryHandler(GetCollectionImageQuery)
export class GetCollectionImageHandler implements IQueryHandler<GetCollectionImageQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCollectionImageQuery) {
    const image = await this.prisma.collectionImage.findUnique({
      where: { id: query.imageId },
      include: { tags: { include: { tag: true } }, collection: true },
    });

    if (!image || image.collectionId !== query.collectionId)
      throw new NotFoundException('Image not found');
    if (image.collection.userId !== query.userId)
      throw new ForbiddenException();

    return image;
  }
}
