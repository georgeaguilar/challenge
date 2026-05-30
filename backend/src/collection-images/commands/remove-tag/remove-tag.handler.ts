import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RemoveTagCommand } from './remove-tag.command';

@CommandHandler(RemoveTagCommand)
export class RemoveTagHandler implements ICommandHandler<RemoveTagCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RemoveTagCommand) {
    const { imageId, tagId, collectionId, userId } = command;

    const image = await this.prisma.collectionImage.findUnique({
      where: { id: imageId },
      include: { collection: true },
    });

    if (!image || image.collectionId !== collectionId)
      throw new NotFoundException('Image not found');
    if (image.collection.userId !== userId) throw new ForbiddenException();

    return this.prisma.imageTag.delete({
      where: { imageId_tagId: { imageId, tagId } },
    });
  }
}
