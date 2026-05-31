import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RemoveImageCommand } from './remove-image.command';

@CommandHandler(RemoveImageCommand)
export class RemoveImageHandler implements ICommandHandler<RemoveImageCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RemoveImageCommand) {
    const { imageId, collectionId, userId } = command;

    const image = await this.prisma.collectionImage.findUnique({
      where: { id: imageId },
      include: { collection: true },
    });

    if (!image || image.collectionId !== collectionId)
      throw new NotFoundException('Image not found');
    if (image.collection.userId !== userId) throw new ForbiddenException();

    const now = new Date();
    await this.prisma.imageTag.updateMany({
      where: { imageId, deletedAt: null },
      data: { deletedAt: now },
    });
    return this.prisma.collectionImage.update({
      where: { id: imageId },
      data: { deletedAt: now },
    });
  }
}
