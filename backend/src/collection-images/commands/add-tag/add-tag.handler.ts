import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddTagCommand } from './add-tag.command';

@CommandHandler(AddTagCommand)
export class AddTagHandler implements ICommandHandler<AddTagCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AddTagCommand) {
    const { imageId, collectionId, userId, tagName } = command;

    const image = await this.prisma.collectionImage.findUnique({
      where: { id: imageId },
      include: { collection: true },
    });

    if (!image || image.collectionId !== collectionId)
      throw new NotFoundException('Image not found');
    if (image.collection.userId !== userId) throw new ForbiddenException();

    const tag = await this.prisma.tag.upsert({
      where: { name: tagName },
      create: { name: tagName },
      update: {},
    });

    return this.prisma.imageTag.upsert({
      where: { imageId_tagId: { imageId, tagId: tag.id } },
      create: { imageId, tagId: tag.id },
      update: { deletedAt: null },
      include: { tag: true },
    });
  }
}
